"""Free Claude Code: reference-style compositor (frame by frame, OpenCV + PIL).

Look (from the reference K8lVHiFnN2A): dark charcoal stage with a faint red tech grid, screen recordings inside
floating rounded window cards with a title bar and drop shadow, the speaker in a tall rounded card on the right,
eased zooms into whatever is being clicked or typed, spotlight dimming, magnifier bubbles, white bento cards with
icons/logos, top-left "■ HEADER" labels, lower-left red numbered chapter badges, jump-cut punch-ins on the talking
head every few seconds, kinetic keyword captions in the hook, synced clicks / pops / whooshes.
Accent: deep red #E53935. Font: Inter (+ JetBrains Mono for terminals).
"""
import json, math, os, re, subprocess
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = '/home/user/AIwithKalyan'
W, H, FPS = 1920, 1080, 30
RED = (229, 57, 53)
INK = (17, 17, 20)
CREAM = (245, 239, 230)
ICONS = f'{ROOT}/compositions/free-claude-code/assets/icons'
FD = '/usr/share/fonts/opentype/inter/'
MONO = '/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf'

# ------------------------------------------------------------------ easing
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease_out(x): x = clamp(x); return 1 - (1 - x) ** 3
def ease_io(x): x = clamp(x); return x * x * (3 - 2 * x)
def ease_back(x):
    x = clamp(x); s = 1.7; x -= 1; return x * x * ((s + 1) * x + s) + 1

# ------------------------------------------------------------------ sprites (RGBA uint8 numpy)
_fonts = {}
def font(size, w='Bold'):
    k = (size, w)
    if k not in _fonts: _fonts[k] = ImageFont.truetype(MONO if w == 'Mono' else f'{FD}Inter-{w}.otf', int(size))
    return _fonts[k]

def np_rgba(im): return np.asarray(im.convert('RGBA'), dtype=np.uint8).copy()

def text_im(s, size, color=(255, 255, 255), w='Bold', spacing=0):
    f = font(size, w)
    if spacing:
        widths = [f.getlength(ch) + spacing for ch in s]; tw = int(sum(widths)) + 4
    else:
        tw = int(f.getlength(s)) + 4
    asc, desc = f.getmetrics(); th = asc + desc
    im = Image.new('RGBA', (max(tw, 1), th), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if spacing:
        x = 0
        for ch, wd in zip(s, widths): d.text((x, 0), ch, font=f, fill=color + (255,)); x += wd
    else:
        d.text((0, 0), s, font=f, fill=color + (255,))
    return im

def icon_im(name, size, color=(255, 255, 255)):
    p = f'{ICONS}/{name}.png'
    im = Image.open(p).convert('RGBA').resize((int(size), int(size)), Image.LANCZOS)
    if color is not None and not name.startswith('logo-'):
        a = im.split()[3]; im = Image.new('RGBA', im.size, color + (255,)); im.putalpha(a)
    return im

def rrect_im(w, h, r, fill, outline=None, ow=0):
    im = Image.new('RGBA', (int(w), int(h)), (0, 0, 0, 0))
    ImageDraw.Draw(im).rounded_rectangle([0, 0, int(w) - 1, int(h) - 1], int(r), fill=fill, outline=outline, width=ow)
    return im

def with_shadow(im, blur=22, dy=12, alpha=150, pad=40):
    out = Image.new('RGBA', (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    sh = Image.new('RGBA', im.size, (0, 0, 0, alpha)); sh.putalpha(im.split()[3].point(lambda v: v * alpha // 255))
    out.alpha_composite(sh, (pad, pad + dy)); out = out.filter(ImageFilter.GaussianBlur(blur))
    out.alpha_composite(im, (pad, pad)); return out, pad

def blend(dst, spr, x, y, alpha=1.0):
    """Alpha-blend an RGBA uint8 sprite onto a BGR/RGB uint8 frame (in place)."""
    if alpha <= 0.003: return
    h, w = spr.shape[:2]; x, y = int(round(x)), int(round(y))
    x0, y0, x1, y1 = max(x, 0), max(y, 0), min(x + w, dst.shape[1]), min(y + h, dst.shape[0])
    if x1 <= x0 or y1 <= y0: return
    s = spr[y0 - y:y1 - y, x0 - x:x1 - x]
    a = s[..., 3:4].astype(np.float32) * (alpha / 255.0)
    d = dst[y0:y1, x0:x1]
    d[:] = (s[..., :3].astype(np.float32) * a + d.astype(np.float32) * (1 - a)).astype(np.uint8)

def scaled(spr, k):
    if abs(k - 1) < 0.01: return spr
    h, w = spr.shape[:2]
    return cv2.resize(spr, (max(1, int(w * k)), max(1, int(h * k))), interpolation=cv2.INTER_LINEAR)

def pop_draw(dst, spr, cx, cy, lt, dur=0.32, alpha=1.0):
    """Draw centred at (cx, cy) with a back-out pop starting at local time lt=0."""
    if lt < 0: return
    k = 0.6 + 0.4 * ease_back(lt / dur); a = alpha * clamp(lt / (dur * 0.6))
    s = scaled(spr, k); blend(dst, s, cx - s.shape[1] / 2, cy - s.shape[0] / 2, a)

# ------------------------------------------------------------------ static layers
def make_background():
    yy, xx = np.mgrid[0:H + 80, 0:W + 80].astype(np.float32)
    base = np.zeros((H + 80, W + 80, 3), np.float32) + np.array(INK, np.float32)[None, None] * 0.75
    g = np.exp(-(((xx - 0.18 * W) / (0.6 * W)) ** 2 + ((yy - 0.1 * H) / (0.7 * H)) ** 2))
    base += g[..., None] * np.array([60, 14, 12], np.float32)          # warm red glow top-left
    g2 = np.exp(-(((xx - 0.95 * W) / (0.5 * W)) ** 2 + ((yy - 1.0 * H) / (0.5 * H)) ** 2))
    base += g2[..., None] * np.array([40, 10, 10], np.float32)
    grid = ((xx % 64) < 1.2) | ((yy % 64) < 1.2)
    base[grid] = base[grid] * 0.75 + np.array(RED, np.float32) * 0.07
    # gentle wave lines
    for k in range(5):
        yw = 0.72 * H + k * 26 + 40 * np.sin(xx[0] / 260.0 + k * 0.7)
        for x in range(0, W + 80, 2):
            y = int(yw[x]);
            if 0 <= y < H + 80: base[y, x] = base[y, x] * 0.6 + np.array(RED, np.float32) * 0.18
    v = 1 - 0.45 * (((xx - W / 2) / W) ** 2 + ((yy - H / 2) / H) ** 2) * 2.2
    base *= np.clip(v, 0.35, 1)[..., None]
    return np.clip(base, 0, 255).astype(np.uint8)

class Stage:
    def __init__(self):
        self.bg = make_background()
        # face card (tall, rounded, right)
        self.fw, self.fh = 430, 650
        self.fx, self.fy = W - self.fw - 56, (H - self.fh) // 2 + 10
        m = Image.new('L', (self.fw, self.fh), 0)
        ImageDraw.Draw(m).rounded_rectangle([0, 0, self.fw - 1, self.fh - 1], 30, fill=255)
        self.fmask = (np.asarray(m, np.float32) / 255.0)[..., None]
        sh, pad = with_shadow(rrect_im(self.fw, self.fh, 30, (0, 0, 0, 255)), 26, 16, 170, 50)
        self.fshadow, self.fpad = np_rgba(sh), pad
        self.fborder = np_rgba(rrect_im(self.fw, self.fh, 30, (0, 0, 0, 0), (255, 255, 255, 60), 2))
        self.win_cache = {}

    def background(self, t):
        ox = int(20 + 20 * math.sin(t * 0.05)); oy = int(20 + 20 * math.cos(t * 0.04))
        return self.bg[oy:oy + H, ox:ox + W].copy()

    def face_card(self, frame, face, t_in=99.0):
        """Tall rounded card on the right: crop around the face (face sits ~x960, y380 in the camera frame)."""
        cw = 700; ch = int(cw * self.fh / self.fw)
        x0 = 960 - cw // 2; y0 = 20
        crop = face[y0:y0 + ch, x0:x0 + cw]
        img = cv2.resize(crop, (self.fw, self.fh), interpolation=cv2.INTER_AREA)
        a = ease_out(t_in / 0.35); dx = (1 - a) * 80
        blend(frame, self.fshadow, self.fx - self.fpad + dx, self.fy - self.fpad, a)
        x, y = int(self.fx + dx), self.fy
        d = frame[y:y + self.fh, x:x + self.fw].astype(np.float32)
        frame[y:y + self.fh, x:x + self.fw] = (img * self.fmask * a + d * (1 - self.fmask * a)).astype(np.uint8)
        blend(frame, self.fborder, x, y, a)

    def window(self, cw, ch, title):
        k = (cw, ch, title)
        if k not in self.win_cache:
            bar = 46; r = 22
            card = Image.new('RGBA', (cw, ch + bar), (0, 0, 0, 0)); d = ImageDraw.Draw(card)
            d.rounded_rectangle([0, 0, cw - 1, ch + bar - 1], r, fill=(32, 32, 36, 255))
            for i, c in enumerate([(255, 95, 87), (254, 188, 46), (40, 200, 64)]):
                d.ellipse([20 + i * 24, 16, 34 + i * 24, 30], fill=c + (255,))
            if title:
                t = text_im(title, 19, (200, 200, 205), 'Medium')
                pw = t.width + 60; px = (cw - pw) // 2
                d.rounded_rectangle([px, 9, px + pw, 37], 14, fill=(48, 48, 54, 255))
                lk = icon_im('lock', 15, (160, 160, 165)); card.alpha_composite(lk, (px + 16, 15))
                card.alpha_composite(t, (px + 38, 12))
            sh, pad = with_shadow(card, 30, 22, 190, 60)
            m = Image.new('L', (cw, ch), 0)
            ImageDraw.Draw(m).rounded_rectangle([0, -r, cw - 1, ch - 1], r, fill=255)
            self.win_cache[k] = (np_rgba(sh), pad, bar, (np.asarray(m, np.float32) / 255.0)[..., None])
        return self.win_cache[k]

STAGE = None
def stage():
    global STAGE
    if STAGE is None: STAGE = Stage()
    return STAGE

# ------------------------------------------------------------------ UI pieces
def header_spr(text):
    t = text_im(text.upper(), 26, (235, 235, 238), 'Bold', spacing=2.5)
    im = Image.new('RGBA', (t.width + 40, 40), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rectangle([0, 9, 18, 27], fill=RED + (255,)); im.alpha_composite(t, (32, 2))
    return np_rgba(im)

def badge_spr(num, text):
    n = text_im(str(num), 64, RED, 'Black'); t = text_im(text.upper(), 34, INK, 'ExtraBold', spacing=1.5)
    w = n.width + t.width + 90; h = 96
    card = rrect_im(w, h, 18, (255, 255, 255, 255)); card.alpha_composite(n, (28, (h - n.height) // 2 - 4))
    ImageDraw.Draw(card).line([(n.width + 44, 22), (n.width + 44, h - 22)], fill=(220, 220, 225, 255), width=3)
    card.alpha_composite(t, (n.width + 62, (h - t.height) // 2))
    sh, pad = with_shadow(card, 18, 10, 150, 36); return np_rgba(sh), pad

def pill_spr(text, icon=None, fill=CREAM, color=INK, size=36, icolor=None, outline=None):
    t = text_im(text, size, color, 'Bold'); ih = int(size * 1.15)
    iw = ih + 14 if icon else 0
    w = t.width + iw + 52; h = int(size * 2.1)
    card = rrect_im(w, h, h // 2, fill + (255,), outline + (255,) if outline else None, 3 if outline else 0)
    if icon: card.alpha_composite(icon_im(icon, ih, icolor or (RED if not icon.startswith('logo-') else None)), (24, (h - ih) // 2))
    card.alpha_composite(t, (26 + iw, (h - t.height) // 2))
    sh, pad = with_shadow(card, 14, 8, 130, 30); return np_rgba(sh)

def card_spr(title, sub=None, icon=None, w=380, accent=False, num=None, big_icon=120, dark=False):
    fill = (24, 24, 28, 255) if dark else (255, 255, 255, 255)
    tc = (255, 255, 255) if dark else INK; sc = (170, 170, 178) if dark else (95, 95, 105)
    parts = []
    if icon:
        ic = icon_im(icon, big_icon, None if icon.startswith('logo-') else (RED if not dark else (255, 255, 255)))
        if icon in ('logo-ollama', 'logo-anthropic', 'logo-openai', 'logo-google'):
            disc = rrect_im(big_icon + 34, big_icon + 34, 28, INK + (255,)); disc.alpha_composite(ic, (17, 17)); ic = disc
        parts.append((ic, 20))
    ts = 50
    tt = text_im(title, ts, tc, 'ExtraBold')
    while tt.width > w - 48 and ts > 26: ts -= 2; tt = text_im(title, ts, tc, 'ExtraBold')
    parts.append((tt, 8))
    if sub:
        for line in sub.split('\n'):
            ss = 30; st = text_im(line, ss, sc, 'Medium')
            while st.width > w - 40 and ss > 18: ss -= 1; st = text_im(line, ss, sc, 'Medium')
            parts.append((st, 2))
    h = 44 + sum(p.height + g for p, g in parts) + 30
    card = rrect_im(w, h, 30, fill, RED + (255,) if accent else None, 6 if accent else 0); d = ImageDraw.Draw(card)
    if num is not None:
        nb = text_im(str(num), 36, (255, 255, 255), 'Black'); d.rounded_rectangle([22, 22, 76, 76], 14, fill=RED + (255,))
        card.alpha_composite(nb, (49 - nb.width // 2, 49 - nb.height // 2))
    y = 44
    for p, g in parts: card.alpha_composite(p, ((w - p.width) // 2, y)); y += p.height + g
    sh, pad = with_shadow(card, 24, 14, 170, 44); return np_rgba(sh)

def keys_spr(keys):
    parts = []
    for i, k in enumerate(keys):
        t = text_im(k, 40, INK, 'ExtraBold'); kw = max(110, t.width + 50)
        cap = Image.new('RGBA', (kw, 104), (0, 0, 0, 0)); d = ImageDraw.Draw(cap)
        d.rounded_rectangle([0, 8, kw - 1, 103], 18, fill=(190, 190, 196, 255))
        d.rounded_rectangle([0, 0, kw - 1, 92], 18, fill=(255, 255, 255, 255))
        cap.alpha_composite(t, ((kw - t.width) // 2, 46 - t.height // 2)); parts.append(cap)
        if i < len(keys) - 1: parts.append(text_im('+', 46, (255, 255, 255), 'Bold'))
    w = sum(p.width for p in parts) + 18 * (len(parts) - 1); im = Image.new('RGBA', (w, 110), (0, 0, 0, 0)); x = 0
    for p in parts: im.alpha_composite(p, (x, (104 - p.height) // 2)); x += p.width + 18
    sh, pad = with_shadow(im, 16, 10, 140, 30); return np_rgba(sh)

def terminal_lines_spr(lines, w=1100, title='Terminal', typed=None, hl=None):
    """Dark terminal window; lines = list of (text, color); typed = chars visible of the last line."""
    lh = 54; h = 70 + lh * max(1, len(lines)) + 30
    im = rrect_im(w, h, 22, (14, 14, 18, 255), (60, 60, 68, 255), 2); d = ImageDraw.Draw(im)
    for i, c in enumerate([(255, 95, 87), (254, 188, 46), (40, 200, 64)]): d.ellipse([22 + i * 24, 20, 36 + i * 24, 34], fill=c + (255,))
    tt = text_im(title, 20, (150, 150, 158), 'Medium'); im.alpha_composite(tt, ((w - tt.width) // 2, 15))
    y = 70
    for i, (s, col) in enumerate(lines):
        if typed is not None and i == len(lines) - 1: s = s[:typed]
        im.alpha_composite(text_im(s, 34, col, 'Mono'), (34, y)); y += lh
    sh, pad = with_shadow(im, 26, 16, 170, 44); return np_rgba(sh)

def prompt_spr(text, n_chars, highlights, w=1200, app='Antigravity'):
    """White prompt window, text typed to n_chars, highlight phrases on a red-tint marker."""
    f = font(40, 'SemiBold'); words = text.split(' '); lines, cur = [], ''
    for wd in words:
        if f.getlength((cur + ' ' + wd).strip()) > w - 100: lines.append(cur); cur = wd
        else: cur = (cur + ' ' + wd).strip()
    lines.append(cur)
    lh = 62; h = 120 + lh * len(lines) + 40
    im = rrect_im(w, h, 26, (255, 255, 255, 255)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w - 1, 64], 26, fill=(244, 244, 247, 255)); d.rectangle([0, 40, w - 1, 64], fill=(244, 244, 247, 255))
    for i, c in enumerate([(255, 95, 87), (254, 188, 46), (40, 200, 64)]): d.ellipse([24 + i * 24, 24, 38 + i * 24, 38], fill=c + (255,))
    at = text_im(app + '  ·  new conversation', 22, (110, 110, 120), 'SemiBold'); im.alpha_composite(at, ((w - at.width) // 2, 19))
    shown = 0; y = 100
    for line in lines:
        x = 50; seg = line[:max(0, n_chars - shown)]; shown += len(line) + 1
        for hp in highlights:
            j = line.find(hp)
            if j >= 0 and len(seg) > j:
                x0 = 50 + f.getlength(line[:j]); x1 = 50 + f.getlength(line[:min(len(seg), j + len(hp))])
                d.rounded_rectangle([x0 - 6, y - 4, x1 + 6, y + 52], 8, fill=(255, 224, 222, 255))
        d.text((x, y), seg, font=f, fill=INK + (255,))
        if seg != line and len(seg) >= 0 and shown - len(line) - 1 <= n_chars:
            cx = 50 + f.getlength(seg); d.rectangle([cx + 3, y + 4, cx + 7, y + 50], fill=RED + (255,)); break
        y += lh
    sh, pad = with_shadow(im, 26, 16, 170, 44); return np_rgba(sh)

def table_spr(rows, hl=-1, w=1150):
    rh = 96; h = rh * len(rows) + 20
    im = rrect_im(w, h, 24, (255, 255, 255, 255)); d = ImageDraw.Draw(im)
    for i, (a, b) in enumerate(rows):
        y = 10 + i * rh
        if i == hl: d.rounded_rectangle([10, y + 6, w - 10, y + rh - 6], 16, fill=(255, 232, 230, 255), outline=RED + (255,), width=3)
        elif i: d.line([(30, y), (w - 30, y)], fill=(230, 230, 234, 255), width=2)
        ta = text_im(a, 40, RED if i == hl else INK, 'Black'); tb = text_im(b, 34, INK, 'SemiBold')
        im.alpha_composite(ta, (44, y + (rh - ta.height) // 2)); im.alpha_composite(tb, (380, y + (rh - tb.height) // 2))
    sh, pad = with_shadow(im, 22, 12, 160, 40); return np_rgba(sh)

def subscribe_spr(state):
    if state == 0: fill, txt, tc = (255, 0, 0), 'SUBSCRIBE', (255, 255, 255)
    else: fill, txt, tc = (236, 236, 240), 'SUBSCRIBED', (60, 60, 66)
    t = text_im(txt, 40, tc, 'ExtraBold'); w = t.width + 90; h = 90
    im = rrect_im(w, h, 45, fill + (255,)); im.alpha_composite(t, ((w - t.width) // 2, (h - t.height) // 2))
    if state:
        b = icon_im('bell', 54, (60, 60, 66)); im2 = Image.new('RGBA', (w + 90, h), (0, 0, 0, 0)); im2.alpha_composite(im, (0, 0))
        disc = rrect_im(h, h, 45, (236, 236, 240, 255)); disc.alpha_composite(b, (18, 18)); im2.alpha_composite(disc, (w + 0 + 0, 0) if False else (w + 0, 0)); im = im2
    sh, pad = with_shadow(im, 16, 10, 150, 30); return np_rgba(sh)

def cursor_spr(size=46):
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    pts = [(4, 2), (4, size - 10), (size * 0.33, size * 0.68), (size * 0.5, size - 4), (size * 0.62, size * 0.92), (size * 0.45, size * 0.62), (size * 0.78, size * 0.62)]
    d.polygon(pts, fill=(255, 255, 255, 255), outline=(0, 0, 0, 255)); return np_rgba(im)

def ripple(frame, cx, cy, lt):
    if not (0 <= lt < 0.6): return
    q = lt / 0.6; r = int(14 + 60 * ease_out(q)); a = 1 - q
    ov = frame.copy(); cv2.circle(ov, (int(cx), int(cy)), r, RED, 5, cv2.LINE_AA)
    cv2.addWeighted(ov, a, frame, 1 - a, 0, frame)
