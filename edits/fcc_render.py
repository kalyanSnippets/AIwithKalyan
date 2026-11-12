"""Timeline renderer for the reference-style Free Claude Code edit. A part's spec module provides:
  CUTS   : [(take, start, end), ...] in order (hand-checked against ElevenLabs Scribe)
  SHOTS  : [dict(at=(take, phrase|seconds), kind='talk'|'demo'|'graphic', ...), ...]
  BADGES : [((take, phrase), num, text)]
  FX     : [dict(at=(take, phrase), dur=seconds, fx=..., **opts)]  (claude-video-effects, on the talking head)
  HOOK   : ((take, start), (take, end), keywords)  (kinetic captions)
Usage: python3 edits/fcc_render.py <spec module path> <out name>
"""
import difflib, importlib.util, json, math, os, random, re, subprocess, sys
import cv2
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import fcc_engine as E

ROOT = E.ROOT
W, H, FPS = E.W, E.H, E.FPS
WORK = '/tmp/fcc-style'
os.makedirs(WORK, exist_ok=True)
FXREPO = '/tmp/claude-0/-home-user-AIwithKalyan/965d5bf0-a9e0-51a3-800a-834e00bdde41/scratchpad/ext/claude-video-effects'

def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path); m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m); return m

P = load(f'{ROOT}/edits/free-claude-code.parts.py', 'parts')
FILES = P.FILES

# ------------------------------------------------------------------ word lookup (Scribe)
_words = {}
def tok(s): return re.sub(r'[^a-z0-9]', '', s.lower())
def words(take):
    if take not in _words:
        d = json.load(open(f'{ROOT}/transcripts/IMG_{take}/elevenlabs.json'))
        _words[take] = [(tok(w['text']), w['start'], w['end'], w['text']) for w in d['words'] if w['type'] == 'word' and tok(w['text'])]
    return _words[take]

def phrase_time(take, phrase, after=0.0, end=False):
    q = [tok(x) for x in phrase.split() if tok(x)]; ws = words(take)
    best = None
    for i in range(len(ws)):
        if ws[i][1] < after - 0.01: continue
        win = [w[0] for w in ws[i:i + len(q)]]
        r = difflib.SequenceMatcher(None, q, win).ratio()
        if r >= 0.85: return ws[i + len(q) - 1][2] if end else ws[i][1]
        if best is None or r > best[0]: best = (r, i)
    raise ValueError(f'phrase not found: {take} {phrase!r} after {after}')

# ------------------------------------------------------------------ cut map
class Timeline:
    def __init__(self, tmap, speed=1.0): self.tmap = tmap; self.speed = speed
    def out(self, take, t):
        for tk, x, y, o in self.tmap:
            if tk == take and x - 0.06 <= t <= y + 0.06: return o + max(0.0, t - x) / self.speed
        for tk, x, y, o in self.tmap:
            if tk == take and x >= t: return o
        raise ValueError(f'time {take}@{t} is after the last cut')
    def anchor(self, a, after=0.0):
        take, v = a[0], a[1]
        if take == 'OUT': return float(v)
        t = v if isinstance(v, (int, float)) else phrase_time(take, v, a[2] if len(a) > 2 else after)
        return self.out(take, t)

# ------------------------------------------------------------------ auto zoom (where is the action?)
def analyse(key, a, b):
    cache = f'{WORK}/zoom_{key}_{a}_{b}.json'
    if os.path.exists(cache): return json.load(open(cache))
    sw = 480
    p = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(a), '-to', str(b), '-i', FILES[key], '-vf', f'fps=4,scale={sw}:-2,format=gray',
                        '-f', 'rawvideo', '-'], capture_output=True, check=True).stdout
    vh = int(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', FILES[key]],
                            capture_output=True, text=True).stdout.split(',')[1]) if False else None
    n = len(p); # infer height
    w0, h0 = [int(x) for x in subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0',
                                             FILES[key]], capture_output=True, text=True).stdout.strip().split(',')[:2]]
    sh = int(round(h0 * sw / w0 / 2) * 2); fr = np.frombuffer(p, np.uint8).reshape(-1, sh, sw)
    events = []
    for i in range(1, len(fr)):
        d = cv2.absdiff(fr[i], fr[i - 1]); m = (d > 26).astype(np.uint8)
        m = cv2.dilate(m, np.ones((7, 7), np.uint8), iterations=2)
        frac = m.mean()
        if frac < 0.002: continue
        cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        boxes = [cv2.boundingRect(c) for c in cnts if cv2.contourArea(c) > sw * sh * 0.0012]
        if not boxes: continue
        x0 = min(b[0] for b in boxes); y0 = min(b[1] for b in boxes)
        x1 = max(b[0] + b[2] for b in boxes); y1 = max(b[1] + b[3] for b in boxes)
        events.append((a + i / 4.0, x0 / sw, y0 / sh, x1 / sw, y1 / sh, float(frac)))
    json.dump(events, open(cache, 'w')); return events

def zoom_plan(events, a, b, hold=1.6, maxz=2.0):
    """Keyframes (src_t, cx, cy, z): push in on small, local changes (typing, menus, toggles); pull out on page changes."""
    kfs = [(a, 0.5, 0.5, 1.0)]; last_t = a
    for t, x0, y0, x1, y1, frac in events:
        if t - last_t < hold: continue
        bw, bh = x1 - x0, y1 - y0
        if frac > 0.22 or bw * bh > 0.30:          # whole page changed -> wide
            tgt = (0.5, 0.5, 1.0)
        elif bw * bh < 0.0015:                       # only the cursor moved
            continue
        else:
            bw2, bh2 = max(bw * 1.8, 0.62), max(bh * 1.8, 0.62)
            z = min(maxz, 1.0 / max(bw2, bh2 * 0.95))
            tgt = ((x0 + x1) / 2, (y0 + y1) / 2, max(1.0, z))
        p = kfs[-1]
        if abs(tgt[2] - p[3]) < 0.25 and abs(tgt[0] - p[1]) < 0.12 and abs(tgt[1] - p[2]) < 0.12: continue
        kfs.append((t, *tgt)); last_t = t
    return kfs

def zoom_at(kfs, st, dur=0.55):
    cur = (kfs[0][1], kfs[0][2], kfs[0][3])
    for t, cx, cy, z in kfs[1:]:
        if st < t: break
        q = E.ease_io((st - t) / dur)
        cur = (cur[0] + (cx - cur[0]) * q, cur[1] + (cy - cur[1]) * q, cur[2] + (z - cur[2]) * q)
    return cur

# ------------------------------------------------------------------ frame sources
class Pipe:
    def __init__(self, path, ss=0.0, dur=None, speed=1.0, size=None, fmt='rgb24'):
        self.w, self.h = size or [int(x) for x in subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries',
                                  'stream=width,height', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.strip().split(',')[:2]]
        vf = f'setpts=(PTS-STARTPTS)/{speed:.6f},fps={FPS}'
        cmd = ['ffmpeg', '-v', 'error', '-ss', f'{ss:.3f}'] + (['-t', f'{dur:.3f}'] if dur else []) + ['-i', path, '-an', '-vf', vf,
               '-f', 'rawvideo', '-pix_fmt', fmt, '-']
        self.ch = 4 if fmt == 'rgba' else 3
        self.p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, bufsize=10 ** 8); self.last = None
    def read(self):
        n = self.w * self.h * self.ch
        b = self.p.stdout.read(n)
        if len(b) == n: self.last = np.frombuffer(b, np.uint8).reshape(self.h, self.w, self.ch)
        return self.last
    def close(self):
        try: self.p.kill()
        except Exception: pass

def src_time(sh, lt):
    key, a, b = sh['clip']
    if not sh.get('pts'): return a + lt * sh['speed']
    pts = sh['pts']
    for (l0, s0), (l1, s1) in zip(pts, pts[1:]):
        if lt < l1:
            if s1 - s0 <= l1 - l0: return min(s0 + (lt - l0), s1)          # real time, then hold until the next line
            return s0 + (s1 - s0) * (lt - l0) / max(1e-6, l1 - l0)          # catch up (sped up)
    l0, s0 = pts[-1]
    return min(b, s0 + (lt - l0))

class SrcReader:
    """Forward-only reader that returns the frame at any (non-decreasing) source second."""
    def __init__(self, path, a, b):
        self.p = Pipe(path, ss=a, dur=b - a, speed=1.0); self.t = a - 1.0 / FPS; self.f = None
    def read_at(self, st):
        while self.t + 1.0 / FPS <= st + 1e-6:
            f = self.p.read()
            if f is None: break
            self.f = f; self.t += 1.0 / FPS
            if self.p.last is None: break
        if self.f is None: self.f = self.p.read(); self.t += 1.0 / FPS
        return self.f
    def close(self): self.p.close()

# ------------------------------------------------------------------ sound (synthesised locally, $0)
SR = 48000
def synth_sfx():
    rng = np.random.default_rng(7); out = {}
    def env(n, a, d): e = np.ones(n); k = int(a * SR); e[:k] = np.linspace(0, 1, k); e *= np.exp(-np.arange(n) / (d * SR)); return e
    n = int(0.06 * SR); t = np.arange(n) / SR
    out['click'] = (np.sin(2 * np.pi * 2400 * t) * 0.5 + rng.normal(0, 0.4, n)) * env(n, 0.001, 0.008)
    n = int(0.18 * SR); t = np.arange(n) / SR; f = 520 + 900 * np.exp(-t * 30)
    out['pop'] = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.05) * 0.9
    n = int(0.55 * SR); t = np.arange(n) / SR; noise = rng.normal(0, 1, n)
    sweep = np.zeros(n); lo = 0.0
    fc = 300 + 5000 * np.sin(np.pi * t / t[-1]) ** 2
    for i in range(n):  # one-pole low-pass with moving cutoff
        a = 1 - np.exp(-2 * np.pi * fc[i] / SR); lo += a * (noise[i] - lo); sweep[i] = lo
    out['whoosh'] = sweep * np.sin(np.pi * t / t[-1]) ** 1.5 * 1.6
    n = int(0.35 * SR); t = np.arange(n) / SR
    out['swish'] = out['whoosh'][::2][:n] * 0.6 if len(out['whoosh'][::2]) >= n else np.pad(out['whoosh'][::2], (0, n - len(out['whoosh'][::2]))) * 0.6
    n = int(0.5 * SR); t = np.arange(n) / SR
    out['hit'] = (np.sin(2 * np.pi * 70 * t) * env(n, 0.002, 0.18) + rng.normal(0, 0.3, n) * env(n, 0.001, 0.03)) * 0.9
    for k in out: out[k] = (out[k] / (np.abs(out[k]).max() + 1e-9) * 0.8).astype(np.float32)
    return out

def synth_bed(seconds):
    """Quiet lo-fi tech bed: soft Am-F-C-G pad + muted kick/hat at 88 bpm. Generated here, no licence or credits."""
    rng = np.random.default_rng(3); n = int(seconds * SR); t = np.arange(n) / SR; y = np.zeros(n, np.float32)
    bpm = 88; beat = 60 / bpm; bar = beat * 4
    chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
    def hz(m): return 440 * 2 ** ((m - 69) / 12)
    for bi in range(int(seconds / bar) + 1):
        s = int(bi * bar * SR); e = min(n, int((bi + 1) * bar * SR))
        if s >= n: break
        tt = np.arange(e - s) / SR; env = np.minimum(1, tt / 0.6) * np.minimum(1, (bar - tt) / 0.6)
        for m in chords[bi % 4]:
            y[s:e] += (np.sin(2 * np.pi * hz(m) * tt) * 0.5 + np.sin(2 * np.pi * hz(m) * 2.003 * tt) * 0.12) * env * 0.16
        bass = np.sin(2 * np.pi * hz(chords[bi % 4][0] - 24) * tt) * env * 0.35; y[s:e] += bass
    for k in range(int(seconds / beat)):
        s = int(k * beat * SR); m = min(n - s, int(0.25 * SR))
        if m <= 0: break
        tt = np.arange(m) / SR
        if k % 2 == 0: y[s:s + m] += np.sin(2 * np.pi * (50 + 60 * np.exp(-tt * 40)) * tt) * np.exp(-tt * 18) * 0.5
        h0 = s + int(beat / 2 * SR); hm = min(n - h0, int(0.05 * SR))
        if hm > 0: y[h0:h0 + hm] += rng.normal(0, 1, hm) * np.exp(-np.arange(hm) / SR * 90) * 0.08
    y = np.convolve(y, np.ones(24) / 24, mode='same')  # soften
    return (y / (np.abs(y).max() + 1e-9) * 0.7).astype(np.float32)

# ------------------------------------------------------------------ build
def build(spec_path, name):
    S = load(spec_path, 'spec')
    import hashlib
    P.PAUSE_KEEP = getattr(S, 'PAUSE_KEEP', 0.3)
    SPEED = getattr(S, 'SPEED', 1.0)
    hsh = hashlib.md5((repr(S.CUTS) + repr(P.PAUSE_KEEP) + repr(SPEED)).encode()).hexdigest()[:10]
    cache = f'{WORK}/{name}_face_{hsh}.json'
    if os.path.exists(cache):
        face, tmap = json.load(open(cache)); tmap = [tuple(x) for x in tmap]
    else:
        face0, tmap = P.face_track(f'{name}_all', S.CUTS)
        face = f'{WORK}/{name}_face_{hsh}.mov'
        if SPEED != 1.0:  # speed up picture and voice together (pitch kept), lip-sync stays locked
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', face0, '-filter_complex',
                            f'[0:v]setpts=PTS/{SPEED},fps={FPS}[v];[0:a]atempo={SPEED}[a]', '-map', '[v]', '-map', '[a]',
                            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', '-c:a', 'pcm_s16le', face], check=True)
            os.remove(face0); tmap = [(tk, x, y, o / SPEED) for tk, x, y, o in tmap]
        else:
            os.replace(face0, face)
        json.dump([face, tmap], open(cache, 'w'))
    if False:
        json.dump([face, tmap], open(cache, 'w'))
    TL = Timeline(tmap, SPEED); total = P.dur(face)
    if os.environ.get('FCC_FACE_ONLY'):
        ws = []
        for tk in sorted({c[0] for c in S.CUTS}):
            for w in words(tk):
                for t2, x, y, o in tmap:
                    if t2 == tk and x <= w[1] <= y: ws.append((round(o + (w[1] - x) / SPEED, 2), tk, round(w[1], 2), w[3])); break
        ws.sort(); json.dump(dict(total=total, words=ws), open(f'{WORK}/{name}_words.json', 'w'))
        print('face only', total); return
    print(f'face track {total:.1f}s, {len(tmap)} pieces', flush=True)

    # shots in output time
    shots = []
    for sh in S.SHOTS:
        sh = dict(sh); sh['t0'] = TL.anchor(sh['at']); shots.append(sh)
    shots.sort(key=lambda s: s['t0'])
    for i, sh in enumerate(shots): sh['t1'] = shots[i + 1]['t0'] if i + 1 < len(shots) else total
    sfx = []
    def ev(t, kind): sfx.append((t, kind))

    # resolve element anchors
    def at(a, base):
        if a is None: return base
        if isinstance(a, (int, float)): return base + a
        return TL.anchor(a)
    for sh in shots:
        for el in sh.get('els', []) + sh.get('pills', []):
            el['_t'] = at(el.get('at'), sh['t0']); el['_hl'] = at(el['hl'], 0) if el.get('hl') else None
            if 'rows_at' in el: el['_rows_t'] = [at(a, sh['t0']) for a in el['rows_at']]
            if 'hls' in el: el['_hls'] = [at(a, sh['t0']) if a is not None else None for a in el['hls']]
            if 'lines_at' in el: el['_lines_t'] = [at(a, sh['t0']) for a in el['lines_at']]
            if el.get('strike_at') is not None: el['_strike'] = at(el['strike_at'], sh['t0'])
        for m in sh.get('mags', []): m['_t'] = at(m.get('at'), sh['t0'])
        if sh['kind'] == 'demo':
            key, a, b = sh['clip']; d = sh['t1'] - sh['t0']
            sh['speed'] = max(1.0, (b - a) / max(d, 0.1))
            sh['kfs'] = sh.get('zooms') or [(a, .5, .5, 1.0)]   # no automatic zooming: zooms only where a line asks for one
            if sh.get('sync'):
                # word-synced playback: each (anchor, source second) pins the recording to the line being spoken
                pts = [(0.0, a)]; okfs = [(0.0, .5, .5, 1.0)]
                for sp in sh['sync']:
                    lt_ = max(0.0, min(d, at(sp['at'], sh['t0']) - sh['t0'])); pts.append((lt_, sp['src']))
                    if 'z' in sp: okfs.append((lt_, *sp['z'])); ev(sh['t0'] + lt_, 'click')
                sh['pts'] = sorted(pts); sh['okfs'] = sorted(okfs)
        for el in sh.get('els', []) + sh.get('pills', []): ev(el['_t'], 'pop')
    for sh in shots:
        # a pill hides when the next pill of the same shot appears (no stacking)
        ps = sorted(sh.get('pills', []), key=lambda e: e['_t'])
        for a1, a2 in zip(ps, ps[1:]):
            if a1.get('cy', 990) == a2.get('cy', 990) and a1.get('cx', 715) == a2.get('cx', 715): a1['_until'] = a2['_t']
        # no empty graphic scenes: the first element is there from the first frame
        if sh['kind'] == 'graphic' and sh.get('els'):
            first = min(sh['els'], key=lambda e: e['_t'])
            if first['_t'] > sh['t0'] + 0.3: first['_t'] = sh['t0'] + 0.15
    badges = [(TL.anchor(a), n, t) for a, n, t in getattr(S, 'BADGES', [])]

    # talking-head punch-ins: change framing on cut boundaries, at most every ~3 s
    cuts_out = [o for _, _, _, o in tmap]
    levels = [1.0, 1.14, 1.06, 1.2]; punch = []; li = 0; last = -9
    for o in cuts_out:
        if o - last >= 2.8: punch.append((o, levels[li % len(levels)])); li += 1; last = o
    def punch_at(t):
        z = 1.0
        for o, l in punch:
            if o <= t: z = l
            else: break
        return z

    # effects from claude-video-effects, rendered on short face clips
    fx_clips = []
    for k, f in enumerate(getattr(S, 'FX', [])):
        t0 = TL.anchor(f['at']); d = f['dur']; s0 = max(0, t0 - 0.15)
        src = f'{WORK}/{name}_fx{k}_src.mp4'; outp = f'{WORK}/{name}_fx{k}.mp4'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{s0:.3f}', '-t', f'{d + 0.3:.3f}', '-i', face, '-c:v', 'libx264', '-preset', 'veryfast',
                        '-crf', '14', '-c:a', 'aac', src], check=True)
        plan = {'effects': [{k2: v for k2, v in f.items() if k2 not in ('at', 'dur')} | {'start': t0 - s0, 'end': t0 - s0 + d}]}
        pj = f'{WORK}/{name}_fx{k}.json'; json.dump(plan, open(pj, 'w'))
        if not (os.path.exists(outp) and os.path.getmtime(outp) > os.path.getmtime(face) and open(pj + '.done').read() == json.dumps(plan) if os.path.exists(pj + '.done') else False):
            subprocess.run(['python3', f'{FXREPO}/scripts/fx.py', '--plan', pj, src, outp], capture_output=True)
            open(pj + '.done', 'w').write(json.dumps(plan))
        if os.path.exists(outp): fx_clips.append((t0, t0 + d, s0, outp))
        else: print('fx failed', f, flush=True)

    # hook captions
    caps = []
    if getattr(S, 'HOOK', None):
        (tk, a), (_, b), keys = S.HOOK
        ws = [w for w in words(tk) if a <= w[1] <= b]
        chunk = []
        for w in ws:
            chunk.append(w)
            if len(chunk) >= 4 or w[3][-1:] in ',.?!':
                try: caps.append((TL.out(tk, chunk[0][1]), TL.out(tk, chunk[-1][2]) + 0.15, [c[3].strip(',.?!') for c in chunk]))
                except ValueError: pass
                chunk = []
    keys = {k.lower() for k in (S.HOOK[2] if getattr(S, 'HOOK', None) else [])}

    # sound: keep sfx >= 0.9 s apart
    sfx.sort(); kept = []
    for t, k in sfx:
        if not kept or t - kept[-1][0] >= 1.0: kept.append((t, k))
    sfx = kept

    # ---------------------------------------------------------- render video
    st = E.stage()
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', f'{WORK}/{name}_video.mp4'],
                           stdin=subprocess.PIPE)
    STILLS = [float(x) for x in os.environ.get('FCC_STILLS', '').split(',') if x]
    facep = Pipe(face) if not STILLS else None; N = int(round(total * FPS)); scr = None; scr_shot = None; fxp = None; fx_cur = None
    still_frames = {int(round(x * FPS)) for x in STILLS}
    hdr_cache, spr_cache = {}, {}
    def cached(key, fn):
        if key not in spr_cache: spr_cache[key] = fn()
        return spr_cache[key]
    si = 0; prev_kind = 'talk'; kind_since = 0.0; intro_p = None; tracker = None
    KEEP = np.zeros((H, W), np.float32); KEEP[:, :300] = 1.0; KEEP[700:, 1400:] = 1.0   # plants stay in front of the layer
    KEEPF = cv2.GaussianBlur(KEEP, (0, 0), 30)[..., None]
    for fi in range(N):
        t = fi / FPS
        if STILLS:
            if fi not in still_frames: continue
            fr = Pipe(face, ss=t).read(); scr_shot = None; fx_cur = None
        else:
            fr = facep.read()
        while si + 1 < len(shots) and t >= shots[si + 1]['t0']:
            prev_kind = shots[si]['kind']; si += 1
        sh = shots[si]; lt = t - sh['t0']
        # effect clip?
        fxf = None
        for c in fx_clips:
            if c[0] <= t < c[1]:
                if fx_cur is not c:
                    if fxp: fxp.close()
                    fxp = Pipe(c[3], ss=t - c[2]); fx_cur = c
                fxf = fxp.read(); break
        face_img = fxf if fxf is not None else fr

        if sh['kind'] == 'intro':
            if intro_p is None:
                intro_p = Pipe(f"{ROOT}/compositions/fcc-part1-mg/out/intro.mov", ss=t if STILLS else 0.0, fmt='rgba')
                sys.path.insert(0, f'{FXREPO}/scripts'); from fx import Tracker; tracker = Tracker(640, 360)
            ov = intro_p.read()
            if STILLS: intro_p.close(); intro_p = None
            frame = face_img.copy()
            # darkness eases to 1.0 (no darkening) inside the repo-effect windows, 0.45 elsewhere
            # no darkening: the animated side layer sits on the real room, always BEHIND the speaker (person mask on top)
            if ov is not None:
                src_for_mask = fxf if fxf is not None else fr
                small = cv2.resize(src_for_mask, (640, 360), interpolation=cv2.INTER_AREA)
                m, _ = tracker(small, int(t * 1000)); m = cv2.resize(m, (W, H)).astype(np.float32)[..., None] / 255.0
                f32 = frame.astype(np.float32)
                a4 = ov[..., 3:4].astype(np.float32) / 255.0 * (1 - KEEPF)
                wall = ov[..., :3].astype(np.float32) * a4 + f32 * (1 - a4)
                frame = (f32 * m + wall * (1 - m)).astype(np.uint8)
        elif sh['kind'] == 'talk':
            z = 1.0 if fxf is not None else punch_at(t)
            if z > 1.001:
                cw, ch = W / z, H / z; cx, cy = 960, 470
                x0 = int(min(max(cx - cw / 2, 0), W - cw)); y0 = int(min(max(cy - ch / 2, 0), H - ch))
                frame = cv2.resize(face_img[y0:y0 + int(ch), x0:x0 + int(cw)], (W, H), interpolation=cv2.INTER_LINEAR)
            else:
                frame = face_img.copy()
            for el in sh.get('els', []):
                elt = t - el['_t']
                if elt >= 0 and not (el.get('until') and t > at(el['until'], 0)): draw_el(frame, el, elt, t, cached)
        else:
            frame = st.background(t)
            if sh['kind'] == 'demo':
                if scr_shot is not sh:
                    if scr: scr.close()
                    key, a, b = sh['clip']
                    if STILLS: scr = Pipe(FILES[key], ss=min(b - 0.1, src_time(sh, lt)), dur=0.5)
                    elif sh.get('pts'): scr = SrcReader(FILES[key], a, b)
                    else: scr = Pipe(FILES[key], ss=a, dur=b - a, speed=sh['speed'])
                    scr_shot = sh
                    pre = None
                    if sh.get('blur'): pre = sh['blur']
                src = scr.read() if (STILLS or not sh.get('pts')) else scr.read_at(src_time(sh, lt))
                if src is not None:
                    key, a, b = sh['clip']; srct = src_time(sh, lt)
                    if sh.get('blur'):
                        bx = sh['blur']
                        if bx['t0'] <= srct - a <= bx['t1']:
                            src = src.copy(); x, y, w2, h2 = bx['x'], bx['y'], bx['w'], bx['h']
                            src[y:y + h2, x:x + w2] = cv2.GaussianBlur(src[y:y + h2, x:x + w2], (0, 0), 14)
                    sh_h, sh_w = src.shape[:2]
                    maxw, maxh = 1300, 840
                    cw = maxw; ch = int(cw * sh_h / sh_w)
                    if ch > maxh: ch = maxh; cw = int(ch * sh_w / sh_h)
                    spr, pad, bar, mask = st.window(cw, ch, sh.get('url', ''))
                    wx = 572 + (maxw - cw) // 2; wy = (H - (ch + bar)) // 2 - 8
                    a_in = E.ease_out(lt / 0.35) if prev_kind == 'talk' or lt < 0.35 else 1.0
                    dy = (1 - a_in) * 50
                    E.blend(frame, spr, wx - pad, wy - pad + dy, a_in)
                    zx, zy, zz = zoom_at(sh['okfs'], lt, 0.6) if sh.get('okfs') else zoom_at(sh['kfs'], srct)
                    vw, vh = sh_w / zz, sh_h / zz
                    x0 = min(max(zx * sh_w - vw / 2, 0), sh_w - vw); y0 = min(max(zy * sh_h - vh / 2, 0), sh_h - vh)
                    view = cv2.resize(src[int(y0):int(y0 + vh), int(x0):int(x0 + vw)], (cw, ch), interpolation=cv2.INTER_AREA if zz < 1.3 else cv2.INTER_CUBIC)
                    def to_c(nx, ny): return wx + (nx * sh_w - x0) / vw * cw, wy + bar + dy + (ny * sh_h - y0) / vh * ch
                    # spotlight
                    for sp in sh.get('spots', []):
                        if sp['t0'] <= srct - a <= sp['t1']:
                            q = E.ease_out(min(srct - a - sp['t0'], sp['t1'] - (srct - a)) / 0.3)
                            (rx0, ry0), (rx1, ry1) = to_c(sp['r'][0], sp['r'][1]), to_c(sp['r'][2], sp['r'][3])
                            m2 = np.ones((ch, cw, 1), np.float32) * (1 - 0.6 * q)
                            ix0, iy0 = int(max(0, rx0 - wx)), int(max(0, ry0 - wy - bar - dy)); ix1, iy1 = int(min(cw, rx1 - wx)), int(min(ch, ry1 - wy - bar - dy))
                            if ix1 > ix0 and iy1 > iy0: m2[iy0:iy1, ix0:ix1] = 1
                            view = (view * m2).astype(np.uint8)
                    y = int(wy + bar + dy); seg = frame[y:y + ch, wx:wx + cw]
                    frame[y:y + ch, wx:wx + cw] = (view * mask + seg * (1 - mask)).astype(np.uint8)
                    for sp in sh.get('spots', []):
                        if sp['t0'] <= srct - a <= sp['t1']:
                            (rx0, ry0), (rx1, ry1) = to_c(sp['r'][0], sp['r'][1]), to_c(sp['r'][2], sp['r'][3])
                            rx0, rx1 = max(rx0, wx + 4), min(rx1, wx + cw - 4); ry0, ry1 = max(ry0, y + 4), min(ry1, y + ch - 4)
                            if rx1 > rx0 and ry1 > ry0: cv2.rectangle(frame, (int(rx0), int(ry0)), (int(rx1), int(ry1)), E.RED, 4, cv2.LINE_AA)
                    # magnifier bubbles
                    for mg in sh.get('mags', []):
                        mlt = t - mg['_t']
                        if 0 <= mlt <= mg.get('dur', 3.0):
                            r = mg['r']; sx0, sy0, sx1, sy1 = int(r[0] * sh_w), int(r[1] * sh_h), int(r[2] * sh_w), int(r[3] * sh_h)
                            crop = src[sy0:sy1, sx0:sx1]; mw = mg.get('w', 820); mh = int(mw * crop.shape[0] / max(1, crop.shape[1]))
                            def mk(crop=crop, mw=mw, mh=mh):
                                im = E.Image.fromarray(cv2.resize(crop, (mw, mh), interpolation=cv2.INTER_CUBIC)).convert('RGBA')
                                card = E.rrect_im(mw + 16, mh + 16, 26, E.RED + (255,)); m3 = E.Image.new('L', (mw, mh), 0)
                                E.ImageDraw.Draw(m3).rounded_rectangle([0, 0, mw - 1, mh - 1], 20, fill=255); im.putalpha(m3)
                                card.alpha_composite(im, (8, 8)); s2, pd = E.with_shadow(card, 26, 16, 190, 44); return E.np_rgba(s2)
                            spr2 = mk()
                            fade = E.clamp((mg.get('dur', 3.0) - mlt) / 0.25)
                            E.pop_draw(frame, spr2, mg.get('cx', 715), mg.get('cy', 560), mlt, alpha=fade)
                    if sh.get('header'):
                        hs = cached(('h', sh['header']), lambda: E.header_spr(sh['header'])); E.blend(frame, hs, 70, 34, E.ease_out(lt / 0.3))
            elif sh['kind'] == 'mg':
                if scr_shot is not sh:
                    if scr: scr.close()
                    mgf = f"{ROOT}/compositions/fcc-part1-mg/out/{sh['mg']}.mp4"
                    scr = Pipe(mgf, ss=lt if STILLS else 0.0); scr_shot = sh
                g = scr.read()
                if g is not None: frame = g.copy()
            elif sh['kind'] == 'graphic':
                if sh.get('header'):
                    hs = cached(('h', sh['header']), lambda: E.header_spr(sh['header'])); E.blend(frame, hs, 70, 34, E.ease_out(lt / 0.3))
                for el in sh.get('els', []):
                    elt = t - el['_t']
                    if elt < 0 or (el.get('until') and t > at(el['until'], 0)): continue
                    draw_el(frame, el, elt, t, cached)
            st.face_card(frame, face_img, t_in=lt if prev_kind == 'talk' else 9.0)
        # pills (any shot)
        for el in sh.get('pills', []):
            elt = t - el['_t']
            if elt >= 0 and t < el.get('_until', 1e9):
                spr = cached(('pill', el['text'], el.get('icon'), el.get('red')), lambda: E.pill_spr(el['text'], el.get('icon'),
                             fill=E.RED if el.get('red') else E.CREAM, color=(255, 255, 255) if el.get('red') else E.INK,
                             icolor=(255, 255, 255) if el.get('red') else None))
                E.pop_draw(frame, spr, el.get('cx', 1222), el.get('cy', 1018), elt)
        # chapter badge
        for bt, n, txt in badges:
            if bt <= t < bt + 3.4:
                bs = cached(('b', n, txt), lambda: E.badge_spr(n, txt)); spr, pad = bs; q = t - bt
                a2 = E.ease_out(q / 0.35) * E.clamp((bt + 3.4 - t) / 0.3)
                E.blend(frame, spr, 50 - pad - (1 - E.ease_out(q / 0.35)) * 120, H - 150 - pad, a2)
        # hook captions
        for c0, c1, wl in (caps if sh['kind'] in ('talk', 'intro') else []):
            if c0 <= t < c1:
                key = ('cap', tuple(wl))
                def mkcap(wl=wl):
                    parts = [E.text_im(w.upper(), 76, E.RED if tok(w) in {tok(k) for k in keys} else (255, 255, 255), 'Black') for w in wl]
                    ww = sum(p.width for p in parts) + 24 * (len(parts) - 1); im = E.Image.new('RGBA', (ww + 40, 120), (0, 0, 0, 0)); x = 20
                    for p in parts:
                        sh2 = E.Image.new('RGBA', p.size, (0, 0, 0, 0)); sh2.putalpha(p.split()[3])
                        im.alpha_composite(sh2.filter(E.ImageFilter.GaussianBlur(6)), (x + 3, 14)); im.alpha_composite(p, (x, 10)); x += p.width + 24
                    return E.np_rgba(im)
                E.pop_draw(frame, cached(key, mkcap), W / 2, H - 150, t - c0, dur=0.22)
        if STILLS:
            cv2.imwrite(f'{WORK}/still_{t:07.2f}.jpg', cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)); continue
        enc.stdin.write(np.ascontiguousarray(frame).tobytes())
        if fi % 300 == 0: print(f'frame {fi}/{N}', flush=True)
    enc.stdin.close(); enc.wait()
    if STILLS: print('stills done'); return
    facep.close()

    # ---------------------------------------------------------- audio: voice + sfx + bed (ducked)
    lib = synth_sfx(); n = int(total * SR) + SR
    fxa = np.zeros(n, np.float32)
    gains = {'click': 0.28, 'pop': 0.2, 'whoosh': 0.0, 'swish': 0.0, 'hit': 0.0}
    for tt, k in sfx:
        s = int(tt * SR); x = lib[k] * gains[k]; e = min(n, s + len(x)); fxa[s:e] += x[:e - s]
    bed = synth_bed(total + 1)[:n]
    import wave
    for arr, nm in ((fxa, 'sfx'), (bed, 'bed')):
        with wave.open(f'{WORK}/{name}_{nm}.wav', 'wb') as wv:
            wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR)
            wv.writeframes((np.clip(arr, -1, 1) * 32767).astype(np.int16).tobytes())
    mix = f'{WORK}/{name}_mix.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', face, '-i', f'{WORK}/{name}_bed.wav', '-i', f'{WORK}/{name}_sfx.wav', '-filter_complex',
                    '[0:a]aformat=channel_layouts=stereo,asplit[v][vk];[1:a]volume=0.11,aformat=channel_layouts=stereo[b];'
                    '[b][vk]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[bd];'
                    '[2:a]aformat=channel_layouts=stereo[s];[v][bd][s]amix=inputs=3:normalize=0:duration=first[m]',
                    '-map', '[m]', '-ar', '48000', mix], check=True)
    m = subprocess.run(['ffmpeg', '-nostats', '-i', mix, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    j = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
    ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
          f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,alimiter=limit=0.89:level=false")
    master = f'{ROOT}/renders/{name}-1080p.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{WORK}/{name}_video.mp4', '-i', mix, '-af', ln, '-map', '0:v', '-map', '1:a',
                    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-shortest', '-movflags', '+faststart', master], check=True)
    review = f'{ROOT}/renders/{name}-review.mp4'; dd = P.dur(master); vbr = min(2400000, int(25 * 8e6 / dd - 96000))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', master, '-vf', 'scale=1280:720', '-c:v', 'libx264', '-preset', 'medium', '-b:v', str(vbr),
                    '-maxrate', str(int(vbr * 1.4)), '-bufsize', str(vbr * 2), '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', review], check=True)
    json.dump(dict(shots=[{k: v for k, v in s.items() if k in ('kind', 't0', 't1', 'header', 'url', 'clip')} for s in shots], sfx=sfx),
              open(f'{ROOT}/edits/{name}.timeline.json', 'w'), indent=1, default=str)
    print('MASTER', master, f'{dd / 60:.2f} min'); print('REVIEW', review, f'{os.path.getsize(review) / 1e6:.1f} MB')

# ------------------------------------------------------------------ graphic elements
def draw_el(frame, el, elt, t, cached):
    ty = el['type']; cx, cy = el.get('cx', 715), el.get('cy', 540)
    hl = el.get('_hl') is not None and t >= el['_hl']
    if ty == 'card':
        spr = cached(('card', el['title'], el.get('sub'), el.get('icon'), hl, el.get('w', 380), el.get('num')),
                     lambda: E.card_spr(el['title'], el.get('sub'), el.get('icon'), el.get('w', 380), accent=hl, num=el.get('num')))
        E.pop_draw(frame, spr, cx, cy, elt)
    elif ty == 'pill':
        spr = cached(('gp', el['text'], el.get('icon'), el.get('red'), el.get('size')), lambda: E.pill_spr(el['text'], el.get('icon'), size=el.get('size', 40),
                     fill=E.RED if el.get('red') else E.CREAM, color=(255, 255, 255) if el.get('red') else E.INK,
                     icolor=(255, 255, 255) if el.get('red') else None))
        E.pop_draw(frame, spr, cx, cy, elt)
    elif ty == 'keys':
        E.pop_draw(frame, cached(('k', tuple(el['keys'])), lambda: E.keys_spr(el['keys'])), cx, cy, elt)
    elif ty == 'table':
        hli = -1
        for i, a in enumerate(el.get('_hls', [])):
            if a is not None and t >= a: hli = i
        n = sum(1 for a in el['_rows_t'] if t >= a)
        spr = cached(('tb', n, hli), lambda: E.table_spr(el['rows'][:max(1, n)], hli))
        E.blend(frame, spr, cx - spr.shape[1] / 2, cy - 160, E.ease_out(elt / 0.3))
    elif ty == 'terminal':
        lines = [l for l, a in zip(el['lines'], el['_lines_t']) if t >= a]
        if not lines: return
        last_t = [a for a in el['_lines_t'] if t >= a][-1]; ch = int((t - last_t) * 28)
        typed = ch if len(lines[-1][0]) > ch and el.get('type_last', True) else None
        spr = cached(('term', len(lines), typed), lambda: E.terminal_lines_spr(lines, el.get('w', 1150), el.get('title', 'Terminal'), typed))
        E.blend(frame, spr, cx - spr.shape[1] / 2, cy - spr.shape[0] / 2, E.ease_out(elt / 0.25))
    elif ty == 'prompt':
        nch = int(elt * el.get('cps', 22)); nch = min(nch, len(el['text']))
        spr = cached(('pr', nch), lambda: E.prompt_spr(el['text'], nch, el.get('hl_words', []), el.get('w', 1200)))
        E.blend(frame, spr, cx - spr.shape[1] / 2, cy - spr.shape[0] / 2, E.ease_out(elt / 0.25))
    elif ty == 'arrow':
        x0, y0, x1, y1 = el['p']; q = E.ease_out(elt / 0.4)
        cv2.line(frame, (int(x0), int(y0)), (int(x0 + (x1 - x0) * q), int(y0 + (y1 - y0) * q)), E.RED, 7, cv2.LINE_AA)
        if q > 0.95:
            ang = math.atan2(y1 - y0, x1 - x0)
            for s in (2.5, -2.5):
                cv2.line(frame, (int(x1), int(y1)), (int(x1 - 26 * math.cos(ang + s / 4 * math.pi / 2.5)), int(y1 - 26 * math.sin(ang + s / 4 * math.pi / 2.5))), E.RED, 7, cv2.LINE_AA)
    elif ty == 'big':
        spr = cached(('big', el['text'], el.get('color')), lambda: E.np_rgba(E.text_im(el['text'], el.get('size', 150), tuple(el.get('color', (255, 255, 255))), 'Black')))
        E.pop_draw(frame, spr, cx, cy, elt)
        if el.get('strike_at') is not None and t >= el['_strike']:
            q = E.ease_out((t - el['_strike']) / 0.3); w2 = spr.shape[1]
            cv2.line(frame, (int(cx - w2 / 2), int(cy)), (int(cx - w2 / 2 + w2 * q), int(cy - 10)), E.RED, 14, cv2.LINE_AA)
    elif ty == 'subscribe':
        state = 1 if elt > el.get('click', 1.2) else 0
        spr = cached(('sub', state), lambda: E.subscribe_spr(state)); E.pop_draw(frame, spr, cx, cy, elt)
        cur = cached(('cur',), E.cursor_spr); ct = el.get('click', 1.2)
        if elt < ct + 0.8:
            q = E.ease_io((elt - 0.4) / (ct - 0.4)); E.blend(frame, cur, cx + 260 - 220 * q, cy + 160 - 150 * q)
        E.ripple(frame, cx + 40, cy + 10, elt - ct)

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
