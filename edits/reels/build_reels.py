#!/usr/bin/env python3
"""Build the two Instagram Reels (1080x1920, 30 fps) from the approved long video.

  python3 edits/reels/build_reels.py A|C [--review]

Sources (all local, nothing paid):
  - picture: the final 1080p master (window-card region) + the per-part face tracks
  - voice:   the final cut's cleaned voice track, plus Kalyan's new lines (media/voiceover/reel-lines.m4a)
  - music:   the long video's ElevenLabs lo-fi beds, ~20 dB under the voice
  - SFX:     soft pop + whoosh synthesised here
Every screen frame goes through an OCR privacy pass (keys, paths, private terms are blurred).
"""
import json, os, re, subprocess, sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
STY = '/tmp/fcc-style'
TMP = os.environ.get('REEL_TMP', '/tmp/reels'); os.makedirs(TMP, exist_ok=True)
MASTER = 'renders/free-claude-code-3-ways-FINAL-1080p.mp4'
FACE = [(0.0, f'{STY}/fcc-part1-v4_face_11f44e9b62.mov'), (399.133, f'{STY}/fcc-part2_face_3413d4a4c2.mov')]
VOICE = f'{STY}/final_voice.wav'
VO = 'media/voiceover/reel-lines.m4a'
W, H, FPS, SR = 1080, 1920, 30, 48000
CORAL = (232, 119, 95)
FB = '/usr/share/fonts/opentype/inter/'
def font(n, s): return ImageFont.truetype(FB + n, s)
ICON = 'compositions/fcc-part3-mg/icons/'

# ---------------- layout ----------------
PANEL = (20, 270, 1040, 776)          # x, y, w, h of the screen card in split layout
SEAM = 1066                           # face panel starts here
FACE_SRC = (420, 40, 1080, 854)       # native crop of the 1080p face track (no scaling)
FULL_SRC = (666, 0, 608, 1080)        # 9:16 crop for full-face beats (scaled to 1080x1920)
SCREEN_PANEL = (20, 600, 1040, 776)   # screen-only layout (new voice lines)
CAP_Y = {'split': 1122, 'ollama': 1122, 'face': 1420, 'screen': 1500, 'end': None}

# ---------------- reel specs ----------------
# seg: src (final|vo), parts [(a,b)...] in source seconds, layout, options
REELS = {
 'A': dict(
   name='reel-A-wifi-off', label='FREE CLAUDE CODE  ·  OFFLINE', music=f'{STY}/m2_body1.wav', music_off=8.0, method=1,
   segs=[
     dict(src='final', parts=[(177.10, 181.08)], layout='split', hook=('NO INTERNET.', 'CAN AI STILL CODE?'), hook_dur=2.6),
     dict(src='final', parts=[(92.10, 96.76)], layout='ollama'),
     dict(src='final', parts=[(181.28, 183.96)], layout='face'),
     dict(src='final', parts=[(184.18, 186.26), (186.50, 187.90), (188.18, 189.40), (189.64, 190.66)], layout='split'),
     dict(src='final', parts=[(190.86, 193.86)], layout='split', mt=194.10, mspeed=0.5),
     dict(src='final', parts=[(194.00, 194.64), (195.10, 198.98), (201.22, 203.04)], layout='split',
          mts=[194.30, None, 201.00], nocap_after=195.50, stamp=('$0  ·  OFFLINE  ·  PRIVATE', 203.04), tail=0.7),
     dict(src='vo', parts=[(159.36, 164.70)], layout='end', link_at=162.52),
   ]),
 'C': dict(
   name='reel-C-20-dollar-trap', label='FREE CLAUDE CODE  ·  THE $20 TRAP', music=f'{STY}/m2_body2.wav', music_off=20.0, method=2,
   segs=[
     dict(src='vo', parts=[(10.78, 15.54)], layout='screen', mt=546.40, hook=('THIS ONE LINE', 'ALMOST COST ME $20'), hook_dur=99),
     dict(src='final', parts=[(552.85, 559.03)], layout='split'),
     dict(src='final', parts=[(559.27, 562.49)], layout='face'),
     dict(src='final', parts=[(567.39, 572.05)], layout='split', crop=(640, 250, 1110, 828)),
     dict(src='vo', parts=[(129.98, 131.54)], layout='screen', mt=598.30),
     dict(src='final', parts=[(601.67, 605.39)], layout='split', stamp=('$0.00 BILL', 604.69), tail=0.7),
     dict(src='vo', parts=[(137.44, 142.38)], layout='end', link_at=139.54),
   ]),
}
PRE, POST = 0.06, 0.09
END_HOLD = 0.8

# ---------------- helpers ----------------
def words(path):
    d = json.load(open(path)); return [w for w in d['words'] if w.get('type', 'word') == 'word']
W_FINAL = words('transcripts/fcc-final/elevenlabs.json')
W_VO = words('transcripts/reel-lines/elevenlabs.json')

def load_audio(path, ss=None, t=None):
    cmd = ['ffmpeg', '-v', 'error']
    if ss is not None: cmd += ['-ss', f'{ss:.4f}']
    if t is not None: cmd += ['-t', f'{t:.4f}']
    cmd += ['-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).copy()

def lufs(x):
    p = f'{TMP}/_l.wav'; write_wav(p, x)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1])

def write_wav(p, x, ch=1):
    import wave
    y = np.clip(x, -1, 1); y = (y * 32767).astype(np.int16)
    with wave.open(p, 'wb') as wf:
        wf.setnchannels(ch); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes(y.tobytes())

class Reader:
    def __init__(self, path, ss, n, vf, w, h, speed=1.0):
        dur = n / FPS * speed + 0.5
        chain = (f'setpts=(PTS-STARTPTS)/{speed},' if speed != 1 else '') + f'fps={FPS},{vf}'
        self.p = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', f'{ss:.4f}', '-t', f'{dur:.3f}', '-i', path, '-vf', chain,
                                   '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
        self.w, self.h, self.last = w, h, None
    def read(self):
        b = self.p.stdout.read(self.w * self.h * 3)
        if len(b) == self.w * self.h * 3: self.last = np.frombuffer(b, np.uint8).reshape(self.h, self.w, 3)
        return self.last
    def close(self):
        self.p.stdout.close(); self.p.kill()

def face_src(t):
    off, path = [f for f in FACE if f[0] <= t + 1e-6][-1]
    return path, t - off

def rounded_mask(w, h, r):
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=255); return m

def ease_back(x):
    x = min(max(x, 0), 1); c1 = 1.70158; c3 = c1 + 1
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2
def ease_out(x):
    x = min(max(x, 0), 1); return 1 - (1 - x) ** 3

# ---------------- privacy ----------------
TERMS = [l.strip().lower() for l in open('media/privacy_terms.txt') if l.strip()]
PRIV = re.compile(r'(sk-or|r-v1-|sk-[a-z0-9]{6}|nvapi|aiza|[0-9a-f]{20,}|@gmail|users[\\/]|callback|oauth|code=|/keys/)', re.I)
_ocr = None
def privacy_boxes(img):
    global _ocr
    if _ocr is None:
        from rapidocr_onnxruntime import RapidOCR; _ocr = RapidOCR()
    res, _ = _ocr(img[:, :, ::-1])
    out = []
    for box, txt, conf in (res or []):
        if any(k in txt.lower() for k in TERMS) or PRIV.search(txt):
            xs = [q[0] for q in box]; ys = [q[1] for q in box]
            out.append((int(min(xs)) - 6, int(min(ys)) - 6, int(max(xs)) + 6, int(max(ys)) + 6))
    return out

# ---------------- static art ----------------
def background():
    y = np.linspace(0, 1, H)[:, None]; x = np.linspace(-1, 1, W)[None, :]
    base = np.array([18, 13, 16])[None, None, :] * (1 - y[..., None] * 0.4) + np.array([8, 8, 10])[None, None, :] * (y[..., None] * 0.4)
    g = np.exp(-((x * 0.9) ** 2 + ((y - 0.05) * 3.2) ** 2))[..., None]
    img = base + g * np.array([70, 26, 18])[None, None, :]
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
BG = background()

def icon(name, size, color=None):
    im = Image.open(ICON + name).convert('RGBA').resize((size, size), Image.LANCZOS)
    if color:
        a = im.split()[3]; im = Image.new('RGBA', im.size, color + (255,)); im.putalpha(a)
    return im

def text_size(d, s, f):
    b = d.textbbox((0, 0), s, font=f); return b[2] - b[0], b[3] - b[1], b[1]

def draw_label(img, label):
    d = ImageDraw.Draw(img); f = font('Inter-Bold.otf', 30)
    tw, th, oy = text_size(d, label, f); x = (W - tw - 30) // 2; y = 190
    d.ellipse((x, y + 8, x + 16, y + 24), fill=CORAL)
    d.text((x + 30, y - oy), label, font=f, fill=(235, 228, 225))

def draw_hook(img, lines, t, top=70, size=78):
    k = ease_back(t / 0.22); d = ImageDraw.Draw(img)
    layer = Image.new('RGBA', (W, 260 if size < 90 else 360), (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
    while max(text_size(ld, q, font('Inter-Black.otf', size))[0] for q in lines) > 1000: size -= 4
    f = font('Inter-Black.otf', size); y = 6
    for i, s in enumerate(lines):
        tw, th, oy = text_size(ld, s, f); x = (W - tw) // 2
        col = (255, 255, 255) if i == 0 else CORAL
        for dx, dy in ((0, 5),): ld.text((x + dx, y + dy - oy), s, font=f, fill=(0, 0, 0, 160))
        ld.text((x, y - oy), s, font=f, fill=col)
        y += int(size * 1.12)
    sc = 0.85 + 0.15 * k
    lw, lh = int(layer.width * sc), int(layer.height * sc)
    l2 = layer.resize((lw, lh), Image.LANCZOS)
    if k < 1:
        a = l2.split()[3].point(lambda v: int(v * min(1, t / 0.12))); l2.putalpha(a)
    img.paste(l2, ((W - lw) // 2, top + (layer.height - lh) // 2), l2)

def draw_caption(img, chunk, t, y):
    """chunk: list of (word, start, end) in reel seconds."""
    d = ImageDraw.Draw(img); size = 74
    toks = [w for w, s, e in chunk]
    while True:
        f = font('Inter-Black.otf', size); sp = int(size * 0.28)
        widths = [text_size(d, s, f)[0] for s in toks]; tot = sum(widths) + sp * (len(toks) - 1)
        if tot <= 1000 or size <= 52: break
        size -= 4
    x = (W - tot) // 2; _, _, oy = text_size(d, 'Hg', f)
    cur = max([i for i, (w, s, e) in enumerate(chunk) if s - 0.03 <= t] or [-1])
    for i, ((w, s, e), wd) in enumerate(zip(chunk, widths)):
        col = CORAL if i == cur else (255, 255, 255)
        d.text((x, y - size // 2 - oy), w, font=f, fill=col, stroke_width=7, stroke_fill=(10, 8, 10))
        x += wd + sp

def draw_stamp(img, text, t, y):
    k = ease_back(t / 0.25); f = font('Inter-Black.otf', 62)
    d0 = ImageDraw.Draw(img); tw, th, oy = text_size(d0, text, f)
    pw, ph = tw + 80, th + 50
    layer = Image.new('RGBA', (pw + 20, ph + 20), (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
    ld.rounded_rectangle((10, 14, pw + 10, ph + 14), ph // 2, fill=(0, 0, 0, 120))
    ld.rounded_rectangle((10, 10, pw + 10, ph + 10), ph // 2, fill=CORAL)
    ld.text((50, 10 + 25 - oy), text, font=f, fill=(255, 255, 255))
    sc = 1.35 - 0.35 * k
    l2 = layer.resize((max(1, int(layer.width * sc)), max(1, int(layer.height * sc))), Image.LANCZOS)
    img.paste(l2, ((W - l2.width) // 2, y - l2.height // 2), l2)

def ollama_card(t, words_rel):
    """Custom panel for 'Ollama is a free app that downloads AI models and runs them right on your own laptop.'"""
    pw, ph = PANEL[2], PANEL[3]
    im = Image.new('RGB', (pw, ph), (20, 16, 20)); d = ImageDraw.Draw(im)
    g = np.exp(-(((np.linspace(-1, 1, pw)[None, :]) * 1.1) ** 2 + ((np.linspace(-1, 1, ph)[:, None] + 0.6) * 1.4) ** 2))[..., None]
    im = Image.fromarray(np.clip(np.array(im) + g * np.array([60, 22, 16]), 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    def at(word):
        for w, s, e in words_rel:
            if w.lower().startswith(word): return s
        return 0
    # logo
    k = ease_back(t / 0.3); s = int(210 * (0.6 + 0.4 * k))
    tile = Image.new('RGBA', (s, s), (0, 0, 0, 0)); ImageDraw.Draw(tile).rounded_rectangle((0, 0, s - 1, s - 1), s // 5, fill=(255, 255, 255))
    lg = icon('logo-ollama.png', int(s * 0.72), color=(20, 16, 20)); tile.paste(lg, ((s - lg.width) // 2, (s - lg.height) // 2), lg)
    im.paste(tile, (160 - s // 2, 150 - s // 2), tile)
    d.text((290, 70), 'Ollama', font=font('Inter-Black.otf', 92), fill=(255, 255, 255))
    if t >= at('free'):
        kk = ease_back((t - at('free')) / 0.25); f = font('Inter-Bold.otf', 40)
        lbl = 'FREE APP'; tw, th, oy = text_size(d, lbl, f)
        x0, y0 = 296, 186
        d.rounded_rectangle((x0, y0, x0 + tw + 40, y0 + th + 26), (th + 26) // 2, fill=CORAL)
        d.text((x0 + 20, y0 + 13 - oy), lbl, font=f, fill=(255, 255, 255))
    # laptop
    lx, ly, lw, lh = 220, 410, 600, 240
    lap_k = ease_out((t - at('runs')) / 0.35) if t >= at('runs') else 0
    if t >= at('downloads'):
        col = (90, 84, 88) if lap_k == 0 else tuple(int(90 + (c - 90) * lap_k) for c in CORAL)
        d.rounded_rectangle((lx, ly, lx + lw, ly + lh), 18, outline=col, width=8, fill=(14, 12, 14))
        d.rounded_rectangle((lx - 60, ly + lh + 4, lx + lw + 60, ly + lh + 30), 12, fill=col)
    chips = ['qwen', 'gemma', 'mimo']
    if t >= at('downloads'):
        f = font('Inter-Bold.otf', 40)
        for i, c in enumerate(chips):
            t0 = at('downloads') + 0.18 * i
            if t < t0: continue
            kk = ease_back((t - t0) / 0.3)
            tw, th, oy = text_size(d, c, f); cw = tw + 48
            ws_ = [text_size(d, q, f)[0] + 48 for q in chips]; gap = 16
            x_top = 140 + i * 270; y_top = 310
            x_in = lx + (lw - sum(ws_) - gap * 2) // 2 + sum(ws_[:i]) + gap * i; y_in = ly + 90
            x = x_top + (x_in - x_top) * lap_k; y = y_top + (y_in - y_top) * lap_k
            y += (1 - kk) * 40
            d.rounded_rectangle((x, y, x + cw, y + th + 30), (th + 30) // 2, fill=(245, 240, 238))
            d.text((x + 24, y + 15 - oy), c, font=f, fill=(30, 24, 26))
    if lap_k > 0.5:
        f = font('Inter-Bold.otf', 34); s2 = 'on YOUR laptop'
        tw, th, oy = text_size(d, s2, f); d.text(((pw - tw) // 2, ly + lh + 52 - oy), s2, font=f, fill=CORAL)
    return im

LOGOS = {1: ('logo-ollama.png', 'Ollama', 'offline · on your laptop'), 2: (None, 'OpenRouter', 'free cloud models'),
         3: (None, 'OmniRoute', 'free providers · auto-switch')}
def end_card(t, method, link_t):
    img = BG.copy(); d = ImageDraw.Draw(img)
    f1 = font('Inter-Bold.otf', 34); s = 'FREE CLAUDE CODE'
    tw, th, oy = text_size(d, s, f1); d.text(((W - tw) // 2, 230 - oy), s, font=f1, fill=CORAL)
    f2 = font('Inter-Black.otf', 120); s = '3 FREE WAYS'
    k = ease_back(t / 0.3); tw, th, oy = text_size(d, s, f2)
    d.text(((W - tw) // 2, 290 + (1 - k) * 30 - oy), s, font=f2, fill=(255, 255, 255))
    for i in (1, 2, 3):
        t0 = 0.12 * i; kk = ease_back((t - t0) / 0.3) if t >= t0 else 0
        if kk <= 0: continue
        y = 500 + (i - 1) * 190; x = 90 + (1 - kk) * 120
        on = (i == method)
        layer = Image.new('RGBA', (900, 160), (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
        ld.rounded_rectangle((0, 0, 899, 159), 30, fill=(46, 30, 30, 255) if on else (30, 27, 30, 235),
                             outline=CORAL if on else (70, 64, 68), width=5 if on else 2)
        ld.ellipse((30, 30, 130, 130), fill=CORAL if on else (60, 55, 58))
        fn = font('Inter-Black.otf', 60); nw, nh, noy = text_size(ld, str(i), fn)
        ld.text((80 - nw // 2, 80 - nh // 2 - noy), str(i), font=fn, fill=(255, 255, 255))
        ld.text((165, 26), LOGOS[i][1], font=font('Inter-Black.otf', 56), fill=(255, 255, 255) if on else (200, 194, 196))
        ld.text((167, 96), LOGOS[i][2], font=font('Inter-Medium.otf', 32), fill=(225, 205, 200) if on else (140, 134, 136))
        tag = 'IN THIS REEL' if on else 'FULL VIDEO'
        ft = font('Inter-Bold.otf', 26); tw2, th2, oy2 = text_size(ld, tag, ft)
        ld.rounded_rectangle((870 - tw2 - 36, 56, 870, 56 + th2 + 22), 20, fill=CORAL if on else (55, 50, 54))
        ld.text((870 - tw2 - 18, 56 + 11 - oy2), tag, font=ft, fill=(255, 255, 255))
        img.paste(layer, (int(x), y), layer)
    if t >= link_t:
        kk = ease_back((t - link_t) / 0.3)
        yt = icon('logo-youtube.png', 96)
        layer = Image.new('RGBA', (980, 300), (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
        fT = font('Inter-Black.otf', 60); s = 'FULL VIDEO ON YOUTUBE'
        tw, th, oy = text_size(ld, s, fT); x0 = (980 - tw - 116) // 2
        layer.paste(yt, (x0, 6), yt); ld.text((x0 + 116, 18 - oy + 8), s, font=fT, fill=(255, 255, 255))
        fP = font('Inter-Black.otf', 54); s = 'LINK IN BIO'
        tw, th, oy = text_size(ld, s, fP); pw = tw + 90
        ld.rounded_rectangle(((980 - pw) // 2, 140, (980 + pw) // 2, 140 + th + 46), (th + 46) // 2, fill=CORAL)
        ld.text(((980 - tw) // 2, 140 + 23 - oy), s, font=fP, fill=(255, 255, 255))
        fH = font('Inter-SemiBold.otf', 34); s = '@AI with Kalyan'
        tw, th, oy = text_size(ld, s, fH); ld.text(((980 - tw) // 2, 262 - oy), s, font=fH, fill=(210, 200, 200))
        sc = 0.8 + 0.2 * kk
        l2 = layer.resize((int(980 * sc), int(300 * sc)), Image.LANCZOS)
        img.paste(l2, ((W - l2.width) // 2, 1110 + (300 - l2.height) // 2), l2)
    return img

# ---------------- build ----------------
def build(key, review=False):
    R = REELS[key]; segs = R['segs']
    # ---- timeline (frames) ----
    t = 0; plan = []
    for si, sg in enumerate(segs):
        parts = []
        for pi, (a, b) in enumerate(sg['parts']):
            a2 = a - (PRE if pi == 0 else 0.03); b2 = b + (POST if pi == len(sg['parts']) - 1 else 0.03)
            n = round((b2 - a2) * FPS); parts.append(dict(a=a2, n=n))
        tail = round(sg.get('tail', 0) * FPS) + (round(END_HOLD * FPS) if si == len(segs) - 1 else 0)
        n = sum(p['n'] for p in parts) + tail
        plan.append(dict(sg=sg, parts=parts, f0=t, n=n, tail=tail)); t += n
    total = t
    print(f'Reel {key}: {total} frames = {total / FPS:.2f} s')

    # ---- words -> reel time ----
    for p in plan:
        sg = p['sg']; src = W_FINAL if sg['src'] == 'final' else W_VO; rel = []; off = p['f0'] / FPS
        for part in p['parts']:
            a, b = part['a'], part['a'] + part['n'] / FPS
            for w in src:
                if a <= w['start'] < b - 0.02:
                    if sg.get('nocap_after') and w['start'] >= sg['nocap_after']: continue
                    rel.append((w['text'], off + w['start'] - a, off + w['end'] - a, w['start']))
            off += part['n'] / FPS
        p['words'] = rel
    caps = []
    for p in plan:
        if CAP_Y[p['sg']['layout']] is None: continue
        clauses, cl = [], []
        for i, (w, s, e, _) in enumerate(p['words']):
            if i == 0: w = w[:1].upper() + w[1:]
            if cl and s - cl[-1][2] > 0.35: clauses.append(cl); cl = []
            cl.append((w, s, e))
            if w[-1] in ',.?!': clauses.append(cl); cl = []
        if cl: clauses.append(cl)
        chunks = []
        for cl in clauses:   # balanced chunks of <= 4 words per clause
            k = math.ceil(len(cl) / 4); base, extra = divmod(len(cl), k); j = 0
            for q in range(k):
                m = base + (1 if q < extra else 0); chunks.append(cl[j:j + m]); j += m
        merged = []
        for c in chunks:     # glue one-word chunks onto a neighbour when it fits
            if merged and (len(c) == 1 or len(merged[-1]) == 1) and len(merged[-1]) + len(c) <= 4 and c[0][1] - merged[-1][-1][2] < 0.6:
                merged[-1] = merged[-1] + c
            else: merged.append(c)
        for c in merged: caps.append((p, c))
    cap_spans = []
    for i, (p, ch) in enumerate(caps):
        s = ch[0][1]; e = ch[-1][2] + 0.25
        if i + 1 < len(caps) and caps[i + 1][0] is p: e = caps[i + 1][1][0][1]
        e = min(e, (p['f0'] + p['n']) / FPS)
        cap_spans.append((s, e, ch, CAP_Y[p['sg']['layout']], p))

    # ---- audio ----
    voice = np.zeros(int(total / FPS * SR) + SR, np.float32)
    vo_clean = f'{TMP}/vo_clean.wav'
    if not os.path.exists(vo_clean):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', VO, '-ac', '1', '-ar', str(SR), '-af',
                        'highpass=f=80,afftdn=nr=10:nf=-50,acompressor=threshold=-22dB:ratio=2.5:attack=8:release=120', vo_clean], check=True)
        # match the phone recording's tone to the studio voice (long-term spectrum, scripts/match-eq.py)
        ref = load_audio(VOICE, 170, 60); vo = load_audio(vo_clean); comb = f'{TMP}/vo_comb.wav'
        def p90(z): f = z[:len(z) // 4800 * 4800].reshape(-1, 4800); return np.percentile(np.sqrt((f ** 2).mean(1)), 90)
        vo = vo * (p90(ref) / p90(vo))   # level-match first so the EQ only fixes tone
        write_wav(comb, np.concatenate([ref, vo]))
        subprocess.run(['python3', 'scripts/match-eq.py', comb, f'{TMP}/vo_comb_eq.wav', '0,60', f'60,{60 + len(vo) / SR:.2f}', '--max-db', '6'], check=True)
        write_wav(vo_clean, load_audio(f'{TMP}/vo_comb_eq.wav', 60.0))
    for p in plan:
        sg = p['sg']; pos = p['f0'] / FPS
        for part in p['parts']:
            dur = part['n'] / FPS
            x = load_audio(VOICE if sg['src'] == 'final' else vo_clean, part['a'], dur)
            x = np.pad(x, (0, max(0, int(dur * SR) - len(x))))[:int(dur * SR)]
            fl = int(0.012 * SR); x[:fl] *= np.linspace(0, 1, fl); x[-fl:] *= np.linspace(1, 0, fl)
            if sg['src'] == 'vo': p.setdefault('vo_spans', []).append((int(pos * SR), len(x)))
            i0 = int(round(pos * SR)); voice[i0:i0 + len(x)] += x; pos += dur
    # match the new lines' loudness to the original voice
    fin = np.concatenate([voice[s:s + n] for p in plan if p['sg']['src'] == 'final' for s, n in [(int(p['f0'] / FPS * SR), int(p['n'] / FPS * SR))]])
    L_ref = lufs(fin)
    for p in plan:
        for s, n in p.get('vo_spans', []):
            L = lufs(voice[s:s + n]); g = 10 ** ((L_ref - L) / 20); voice[s:s + n] *= g
            print(f'  vo line gain {20 * math.log10(g):+.1f} dB')
    voice = voice[:int(total / FPS * SR)]
    n = len(voice)
    mus = load_audio(R['music'], R['music_off'], n / SR + 0.1)[:n]
    mus = np.pad(mus, (0, n - len(mus)))
    env = np.full(n, 10 ** (-20.5 / 20), np.float32)
    end_p = plan[-1]; e0 = int(end_p['f0'] / FPS * SR)
    ramp = int(0.4 * SR); env[e0:] = 10 ** (-17.5 / 20); env[e0 - ramp:e0] = np.linspace(env[e0 - ramp - 1], env[e0], ramp)
    env[:int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR)); env[-int(1.2 * SR):] *= np.linspace(1, 0, int(1.2 * SR))
    mus = mus * env * 10 ** ((L_ref - (-16.0)) / 20)
    # SFX
    sfx = np.zeros(n, np.float32); pops = []
    def pop(tsec, lvl=-24):
        tt = np.arange(int(0.09 * SR)) / SR; f = 380 + 700 * np.exp(-tt * 45)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 38) * 10 ** (lvl / 20)
        i0 = int(tsec * SR); sfx[i0:i0 + len(y)] += y[:max(0, n - i0)]; pops.append(round(tsec, 2))
    def whoosh(t_end, dur=0.5, lvl=-28):
        m = int(dur * SR); rng = np.random.default_rng(3); nz = rng.standard_normal(m)
        y = np.zeros(m); fc = np.linspace(400, 3500, m); a = 0; prev = 0
        for i in range(m):  # simple swept one-pole low-pass
            a = 1 - math.exp(-2 * math.pi * fc[i] / SR); prev += a * (nz[i] - prev); y[i] = prev
        y *= np.sin(np.linspace(0, math.pi, m)) ** 2; y = y / np.abs(y).max() * 10 ** (lvl / 20)
        i0 = int(t_end * SR) - m; sfx[i0:i0 + m] += y
    # ---- events (pops) ----
    for p in plan:
        sg = p['sg']; T0 = p['f0'] / FPS
        if sg.get('hook'): pop(T0 + 0.03)
        if sg['layout'] == 'ollama': pop(T0 + 0.05)
        if sg.get('stamp'): p['stamp_t'] = src_to_reel(p, sg['stamp'][1]); pop(p['stamp_t'])
        if sg['layout'] == 'end':
            whoosh(T0 + 0.05); p['link_t'] = src_to_reel(p, sg['link_at']); pop(p['link_t'])
    mix = voice + mus.astype(np.float32) + sfx
    raw = f'{TMP}/{key}_mix.wav'; write_wav(raw, mix)
    print(f'  pops at {pops}')
    # ---- loudnorm 2-pass ----
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
    aout = f'{TMP}/{key}_audio.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af',
                    f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample={SR}",
                    '-ac', '2', aout], check=True)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', aout, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    Li = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1]); Pk = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r)[-1])
    g = min(-14.0 - Li, -1.5 - Pk)
    if abs(g) > 0.1:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', aout, '-af', f'volume={g:.2f}dB', aout + '.tmp.wav'], check=True); os.replace(aout + '.tmp.wav', aout)
    print(f'  loudness {Li:.1f} LUFS -> gain {g:+.2f} dB')
    # stems for QA
    write_wav(f'{TMP}/{key}_voice.wav', voice); write_wav(f'{TMP}/{key}_music.wav', mus.astype(np.float32))

    # ---- privacy pre-pass on screen panels ----
    blur = {}
    for p in plan:
        lay = p['sg']['layout']
        if lay not in ('split', 'screen'): continue
        for fi, img in panel_frames(p, every=5):
            for bx in privacy_boxes(img):
                for k in range(fi - 6, fi + 7): blur.setdefault((id(p), k), []).append(bx)
    nb = len({k for k in blur}); print(f'  privacy: {nb} panel frames get blur boxes')

    # ---- render ----
    out = f"renders/{R['name']}{'-review' if review else ''}.mp4"
    enc = ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', aout,
           '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', str(FPS)]
    enc += (['-crf', '28', '-preset', 'medium', '-maxrate', '5M', '-bufsize', '10M'] if review else ['-crf', '17', '-preset', 'slow'])
    enc += ['-c:a', 'aac', '-b:a', '320k' if not review else '160k', '-movflags', '+faststart', '-shortest', out]
    E = subprocess.Popen(enc, stdin=subprocess.PIPE)
    pmask = rounded_mask(PANEL[2], PANEL[3], 26)
    for p in plan:
        sg = p['sg']; lay = sg['layout']; T0 = p['f0'] / FPS
        pf = panel_frames(p) if lay in ('split', 'screen') else None
        ff = face_frames(p) if lay in ('split', 'face', 'ollama') else None
        for fi in range(p['n']):
            tt = T0 + fi / FPS; lt = fi / FPS
            if lay == 'end':
                img = end_card(lt, R['method'], p['link_t'] - T0)
            elif lay == 'face':
                fr = next(ff); img = Image.fromarray(fr)
                sc = 1.0 + 0.035 * lt / (p['n'] / FPS)  # slow push
                if sc > 1.0:
                    cw, chh = int(W / sc), int(H / sc); img = img.crop(((W - cw) // 2, int((H - chh) * 0.35), (W - cw) // 2 + cw, int((H - chh) * 0.35) + chh)).resize((W, H), Image.LANCZOS)
            else:
                img = BG.copy()
                if lay in ('split', 'ollama'):
                    fr = next(ff); img.paste(Image.fromarray(fr), (0, SEAM))
                    sh = Image.new('RGBA', (W, 60), (0, 0, 0, 0)); a = np.linspace(170, 0, 60).astype(np.uint8)
                    sh.putalpha(Image.fromarray(np.repeat(a[:, None], W, 1))); img.paste(sh, (0, SEAM), sh)
                box = PANEL if lay != 'screen' else SCREEN_PANEL
                if lay == 'ollama':
                    pan = ollama_card(lt, [(w, s - T0, e - T0) for w, s, e, _ in p['words']])
                else:
                    pan = Image.fromarray(next(pf)[1].copy())
                    for bx in blur.get((id(p), fi), []):
                        x0, y0, x1, y1 = [max(0, v) for v in bx]
                        reg = pan.crop((x0, y0, x1, y1)).filter(ImageFilter.GaussianBlur(14)); pan.paste(reg, (x0, y0))
                img.paste(pan, (box[0], box[1]), pmask)
                ImageDraw.Draw(img).rounded_rectangle((box[0], box[1], box[0] + box[2] - 1, box[1] + box[3] - 1), 26, outline=(80, 60, 60), width=2)
                hook = sg.get('hook')
                if hook and lt < sg.get('hook_dur', 2.6):
                    if lay == 'screen': draw_hook(img, hook, lt, top=250, size=96)
                    else: draw_hook(img, hook, lt, top=60, size=80)
                else:
                    draw_label(img, R['label'])
            # captions / stamp
            st = p.get('stamp_t')
            if st is not None and tt >= st:
                draw_stamp(img, sg['stamp'][0], tt - st, CAP_Y[lay])
            else:
                for s, e, ch, y, pp in cap_spans:
                    if pp is p and s <= tt < e: draw_caption(img, ch, tt, y); break
            E.stdin.write(np.asarray(img.convert('RGB')).tobytes())
    E.stdin.close(); E.wait()
    json.dump(dict(total=total / FPS, pops=pops, caps=[(round(s, 2), round(e, 2), ' '.join(w for w, _, _ in ch)) for s, e, ch, _, _ in cap_spans],
                   segs=[(round(p['f0'] / FPS, 2), round(p['n'] / FPS, 2), p['sg']['layout']) for p in plan]),
              open(f'{TMP}/{key}_report.json', 'w'), indent=1)
    print('wrote', out)

def src_to_reel(p, ts):
    off = p['f0'] / FPS
    for part in p['parts']:
        if part['a'] <= ts <= part['a'] + part['n'] / FPS: return off + ts - part['a']
        off += part['n'] / FPS
    return off - p['tail'] / FPS

def panel_frames(p, every=1):
    sg = p['sg']; box = PANEL if sg['layout'] != 'screen' else SCREEN_PANEL
    cx, cy, cw, ch = sg.get('crop', (552, 60, 1340, 1000))
    vf = f'crop={cw}:{ch}:{cx}:{cy},scale={box[2]}:{box[3]}:flags=lanczos'
    fi = 0
    if sg.get('mt') is not None:
        sources = [(sg['mt'], p['n'], sg.get('mspeed', 1.0))]
    else:
        mts = sg.get('mts') or [None] * len(p['parts'])
        sources = [(m if m is not None else part['a'], part['n'], 1.0) for part, m in zip(p['parts'], mts)]
    for ss, n, spd in sources:
        rd = Reader(MASTER, ss, n, vf, box[2], box[3], spd)
        for k in range(n):
            fr = rd.read()
            if fi % every == 0: yield fi, fr
            fi += 1
        rd.close()
    for k in range(p['n'] - fi):   # tail: hold the last frame
        if fi % every == 0: yield fi, fr
        fi += 1

def face_frames(p):
    sg = p['sg']; lay = sg['layout']
    if lay == 'face':
        x, y, w, h = FULL_SRC; vf = f'crop={w}:{h}:{x}:{y},scale={W}:{H}:flags=lanczos,unsharp=5:5:0.6'; ow, oh = W, H
    else:
        x, y, w, h = FACE_SRC; vf = f'crop={w}:{h}:{x}:{y}'; ow, oh = w, h
    srcs = [(part['a'], part['n']) for part in p['parts']]
    if p['tail']: srcs[-1] = (srcs[-1][0], srcs[-1][1] + p['tail'])
    for a, n in srcs:
        path, ft = face_src(a)
        rd = Reader(path, ft, n, vf, ow, oh)
        for k in range(n): yield rd.read()
        rd.close()

if __name__ == '__main__':
    keys = [a for a in sys.argv[1:] if not a.startswith('--')]
    for k in keys: build(k, review='--review' in sys.argv)
