"""Free Claude Code: face-cam cut + assembly over the screen recordings.

1. Paper edit (transcript-driven, per take): split each take into phrases, drop retakes (a phrase that
   is restarted within the next few phrases), word stutters, off-script chatter and dead air, and split
   long pauses so no silence is over ~0.35 s. Every phrase is assigned to a script scene by time range
   (ranges from edits/free-claude-code.takes.md). Writes edits/free-claude-code.edl.json.
2. Face-cam track per scene (re-encoded at every cut, 5 ms audio fades so cuts don't click).
3. FC scenes: face full frame. VO scenes: that scene's screen clips (the rough-cut EDL) retimed to the
   voice, full frame, with the face in a rounded PiP card bottom-left. Scenes with no screen footage yet
   stay on the face, with a small "graphic to build" tag.
4. Concat, loudnorm to -14 LUFS / -1 dBTP, master + <30 MB review copy in renders/.

Run:  python3 edits/free-claude-code.cut.py [--edl-only]
"""
import difflib, json, os, re, subprocess, sys

ROOT = '/home/user/AIwithKalyan'
RAW = f'{ROOT}/media/raw/free-claude-code'
OUT = '/tmp/fcc-cut'
os.makedirs(OUT, exist_ok=True)
FB = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'
FS = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'

# ---------------------------------------------------------------- scene ranges (seconds in each take)
def mm(s): m, x = s.split(':'); return int(m) * 60 + float(x)
SCENES = [  # (scene, mode, take, start, end)
    ('1', 'FC', '1474', '0:18', '0:47'), ('2', 'FC', '1474', '0:47', '3:18'), ('3', 'FC', '1474', '3:18', '3:40'),
    ('4a', 'VO', '1477', '0:18', '1:50'), ('4b', 'VO', '1477', '1:50', '2:57'), ('4c', 'VO', '1477', '2:57', '5:44'),
    ('4d', 'FC', '1477', '5:44', '5:58'), ('4e', 'VO', '1477', '5:58', '7:53'), ('4f', 'VO', '1477', '7:53', '9:50'),
    ('4g', 'FC', '1477', '9:50', '10:14'), ('4h', 'VO', '1477', '10:14', '12:40'),
    ('5a', 'VO', '1478', '0:15', '1:46'), ('5b', 'VO', '1478', '1:46', '2:56'), ('5c', 'VO', '1478', '2:56', '5:40'),
    ('5d', 'VO', '1478', '5:40', '6:21'), ('5e', 'VO', '1478', '6:21', '8:12'), ('5f', 'VO', '1478', '8:12', '9:48'),
    ('5g', 'FC', '1478', '9:48', '10:15'),
    ('6a', 'VO', '1479', '0:15', '1:56'), ('6b', 'VO', '1479', '1:56', '3:50'), ('6c', 'VO', '1479', '3:50', '8:25'),
    ('6d', 'VO', '1479', '8:25', '10:36'), ('6e', 'VO', '1479', '10:36', '11:33'), ('6f', 'VO', '1479', '11:33', '13:35'),
    ('6g', 'VO', '1479', '13:35', '15:36'), ('6h', 'VO', '1479', '15:36', '17:25'),
    ('7', 'FC', '1479', '17:25', '19:10'), ('8', 'FC', '1479', '19:10', '20:30'),
]

# ---------------------------------------------------------------- screen clips per VO scene
K = f'{ROOT}/media/screen-recordings/free-claude-code/'
C = f'{ROOT}/media/screen-recordings/claude-recorded/'
FILES = {
    '142752': K + '2026-11-05_142752.mp4', '145317': K + '2026-11-05_145317.mp4', '151536': K + '2026-11-05_151536.mp4',
    '121640': K + '2026-11-06_121640.mp4', '123051': K + '2026-11-06_123051.mp4', '154801': K + '2026-11-06_154801.mp4',
    '163037': K + '2026-11-07_163037.mp4', '144707': K + '2026-11-09_144707.mp4', '154411': K + '2026-11-09_154411.mp4',
    '160207': K + '2026-11-09_160207.mp4', '113521': K + '2026-11-10_113521.mp4', '114247': K + '2026-11-10_114247.mp4',
    '121406': K + '2026-11-10_121406.mp4',
    'CR01': C + '01-launcher-model-hi.mp4', 'CR04': C + '04-planmode-questions-build.mp4', 'CR05': C + '05-fix-round1.mp4',
    'CR07': C + '07-notes-app-working.mp4', 'BR-OR': f'{ROOT}/media/broll/openrouter-free.mp4',
}
# (key, start, end, weight, tag) - weight = relative screen time; tag shown top-left ('' = none)
SCREEN = {
    '4a': [('142752', '0:00', '1:35', 1, ''), ('142752', '3:04', '3:30', 1.5, '')],
    '4b': [('142752', '3:41', '4:15', 1, '')],
    '4c': [('142752', '5:48', '7:28', 1, ''), ('142752', '7:28', '7:42', 1.5, ''), ('142752', '8:48', '11:08', 1.2, ''),
           ('142752', '11:36', '12:42', 1, '')],
    '4e': [('145317', '0:00', '1:20', 1, ''), ('145317', '1:40', '3:25', 1, '')],
    '4f': [('145317', '3:44', '4:00', 1, ''), ('145317', '4:30', '5:05', 1, ''), ('145317', '5:20', '7:10', 1, ''),
           ('145317', '8:45', '10:03', 1, ''), ('151536', '0:00', '0:06', 0.4, ''), ('121640', '0:00', '0:08', 0.4, '')],
    '4h': [('121640', '0:08', '0:55', 1, ''), ('TODO', 'Claude Code running on Ollama', 'screen recording still to come', 1, '')],
    '5a': [('154411', '1:30', '2:10', 1, '')],
    '5b': [('BR-OR', '0:00', '0:06', 1, '')],
    '5c': [('121640', '0:55', '1:10', 1, '')],
    '5d': [('121640', '1:10', '3:45', 1.4, ''), ('123051', '0:00', '4:15', 1, ''), ('123051', '4:15', '4:35', 0.6, '')],
    '5e': [('123051', '4:35', '5:50', 1, ''), ('123051', '5:50', '6:50', 1, ''), ('123051', '7:00', '7:12', 0.5, '')],
    '5f': [('TODO', 'The catch: free limits → 429', 'graphic still to build', 1, '')],
    '6a': [('154801', '0:00', '0:10', 1, '')],
    '6b': [('154801', '0:28', '1:40', 1.4, ''), ('154801', '1:50', '2:20', 1, '')],
    '6c': [('154801', '2:20', '3:45', 0.6, ''), ('113521', '0:10', '1:15', 1.2, ''), ('113521', '1:35', '3:50', 1.2, ''),
           ('163037', '0:00', '2:55', 0.6, ''), ('113521', '4:15', '5:05', 0.8, ''), ('154411', '0:00', '1:05', 0.8, ''),
           ('144707', '0:35', '1:00', 0.6, '')],
    '6d': [('114247', '0:00', '0:25', 0.4, ''), ('114247', '1:00', '3:25', 1.4, ''), ('114247', '3:28', '3:57', 0.6, '')],
    '6e': [('154411', '11:28', '11:45', 1, '')],
    '6f': [('160207', '0:00', '0:40', 1, ''), ('160207', '1:40', '1:47', 0.3, ''), ('CR01', '0:00', '0:36', 0.8, 'TEST MACHINE')],
    '6g': [('121406', '0:00', '0:22', 0.6, ''), ('121406', '0:22', '1:05', 0.5, ''), ('121406', '1:05', '1:12', 0.3, ''),
           ('121406', '1:12', '2:35', 1, ''), ('121406', '2:35', '3:05', 1.2, '')],
    '6h': [('CR04', '0:00', '9:01', 1.6, 'TEST MACHINE'), ('CR05', '0:00', '1:13', 0.6, 'TEST MACHINE'),
           ('CR07', '0:00', '0:45', 1, 'TEST MACHINE')],
}

# ---------------------------------------------------------------- 1. paper edit
def tok(t): return re.sub(r'[^a-z0-9]', '', t.lower())
STOP = set('a an the and or but so to of in on it is i you we this that its it\'s my me be are was for with at as just okay ok um uh'.split())

html = open(f'{ROOT}/edits/free-claude-code.teleprompter.html').read()
VOCAB = {tok(w) for w in re.findall(r"[A-Za-z0-9']+", html[html.index('const SCRIPT'):html.index('const esc =')])}
VOCAB |= {'ollama', 'olama', 'cloud', 'clot', 'cairo', 'openrouter', 'omniroute', 'omnirode', 'sonat', 'sonet', 'claude'}

def chunks_of(words):
    out, cur = [], []
    for w in words:
        if cur and (w['start'] - cur[-1]['end'] > 0.7 or cur[-1]['text'][-1:] in '.?!'):
            out.append(cur); cur = []
        cur.append(w)
    if cur: out.append(cur)
    return out

def destutter(ch):
    """Drop the first copy of an immediately repeated 1-4 word run ("it checks it checks")."""
    changed = True
    while changed:
        changed = False
        t = [tok(w['text']) for w in ch]
        for n in range(12, 0, -1):
            for k in range(len(t) - 2 * n + 1):
                a_, b_ = t[k:k + n], t[k + n:k + 2 * n]
                if a_ == b_ or (n >= 5 and a_[0] == b_[0] and difflib.SequenceMatcher(None, a_, b_, autojunk=False).ratio() >= 0.75):
                    ch = ch[:k] + ch[k + n:]; changed = True; break
            if changed: break
    return ch

def paper_edit(take, a, b):
    ws = [w for w in json.load(open(f'{ROOT}/transcripts/IMG_{take}/words.json')) if tok(w['text'])]
    allw = ws
    ws = [w for w in ws if a - 1 <= w['start'] < b]
    chs = [c for c in (destutter(c) for c in chunks_of(ws)) if c]
    keep = []
    for i, ch in enumerate(chs):
        t = [tok(w['text']) for w in ch]
        # retake: a later phrase (within ~4 phrases / 30 s) restarts this one
        retake = False
        for j in range(i + 1, min(i + 5, len(chs))):
            if chs[j][0]['start'] - ch[-1]['end'] > 30: break
            u = [tok(w['text']) for c2 in chs[j:j + 4] for w in c2]  # the word stream from phrase j on
            r = difflib.SequenceMatcher(None, t, u[:len(t) + 2], autojunk=False).ratio()
            if (len(t) >= 2 and r >= 0.6) or (len(t) <= 3 and len(t) >= 1 and u[:len(t)] == t):
                retake = True; break
            if len(t) >= 4:  # the same words said again anywhere in the next stretch (a mid-line restart)
                L = len(t)
                if any(difflib.SequenceMatcher(None, t, u[o:o + L], autojunk=False).ratio() >= (0.7 if L >= 8 else 0.75)
                       for o in range(0, max(1, len(u) - L + 1))):
                    retake = True; break
        if retake: continue
        while ch and tok(ch[0]['text']) in ('okay', 'ok', 'um', 'uh'): ch = ch[1:]
        t = [tok(w['text']) for w in ch]
        if not t or (len(t) == 1 and t[0] in STOP): continue
        content = [x for x in t if len(x) > 3 and x not in STOP]
        if len(content) >= 2 and sum(x in VOCAB for x in content) / len(content) < 0.34: continue  # chatter
        keep.append(ch)
    # a short phrase that only repeats the tail of the phrase before it is a redundant second read
    k = 1
    while k < len(keep):
        a_, b_ = [tok(w['text']) for w in keep[k - 1]], [tok(w['text']) for w in keep[k]]
        if len(b_) <= 8 and len(b_) >= 3 and difflib.SequenceMatcher(None, b_, a_[-len(b_):], autojunk=False).ratio() >= 0.8:
            keep.pop(k)
        else: k += 1
    for k in range(len(keep) - 1):
        a_, b_ = [tok(w['text']) for w in keep[k]], [tok(w['text']) for w in keep[k + 1]]
        for n in range(min(6, len(a_) - 1, len(b_)), 0, -1):
            if a_[-n:] == b_[:n]: keep[k] = keep[k][:-n]; break
    keep = [c for c in keep if c]
    # words -> cuts; split at pauses > 0.35 s; pad without eating into neighbouring words
    idx = {id(w): k for k, w in enumerate(allw)}
    cuts = []
    for ch in keep:
        run = [ch[0]]
        for w in ch[1:] + [None]:
            if w is not None and w['start'] - run[-1]['end'] <= 0.35 and idx[id(w)] == idx[id(run[-1])] + 1:
                run.append(w); continue
            k0, k1 = idx[id(run[0])], idx[id(run[-1])]
            prev_end = allw[k0 - 1]['end'] if k0 else 0
            next_start = allw[k1 + 1]['start'] if k1 + 1 < len(allw) else run[-1]['end'] + 1
            s = max(run[0]['start'] - 0.10, (prev_end + run[0]['start']) / 2)
            e = min(run[-1]['end'] + 0.16, (run[-1]['end'] + next_start) / 2)
            cuts.append([round(s, 3), round(e, 3), ' '.join(x['text'] for x in run)])
            if w is not None: run = [w]
    # merge cuts that touch / overlap; the pause left between kept words is <= ~0.35 s anyway
    merged = []
    for c in cuts:
        if merged and c[0] - merged[-1][1] < 0.04: merged[-1][1] = max(merged[-1][1], c[1]); merged[-1][2] += ' ' + c[2]
        else: merged.append(c)
    # remove real silences (audio below -35 dB for > 0.3 s), leaving 0.12 s each side
    out = []
    for s0, e0, text in merged:
        segs = [[s0, e0]]
        for a2, b2 in SILENCE[take]:
            a2, b2 = a2 + 0.12, b2 - 0.12
            if b2 - a2 <= 0.05: continue
            nxt = []
            for x, y in segs:
                if b2 <= x or a2 >= y: nxt.append([x, y])
                else:
                    if a2 > x: nxt.append([x, a2])
                    if b2 < y: nxt.append([b2, y])
            segs = nxt
        segs = [g for g in segs if g[1] - g[0] > 0.12]
        for k, (x, y) in enumerate(segs): out.append([round(x, 3), round(y, 3), text if k == 0 else '…'])
    return [c for c in out if c[1] - c[0] > 0.2]

SILENCE = {}
for tk in sorted({x[2] for x in SCENES}):
    log = subprocess.run(['ffmpeg', '-nostats', '-i', f'{RAW}/IMG_{tk}.MOV', '-vn', '-af',
                          'highpass=f=80,silencedetect=n=-35dB:d=0.3', '-f', 'null', '-'], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
    en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
    SILENCE[tk] = list(zip(st, en))

EDL = []
for sid, mode, take, a, b in SCENES:
    for s, e, text in paper_edit(take, mm(a), mm(b)):
        EDL.append(dict(scene=sid, mode=mode, take=take, start=s, end=e, text=text))
json.dump(EDL, open(f'{ROOT}/edits/free-claude-code.edl.json', 'w'), indent=1)
dur = {}
for c in EDL: dur[c['scene']] = dur.get(c['scene'], 0) + c['end'] - c['start']
print(f"{len(EDL)} cuts, {sum(dur.values()) / 60:.1f} min of face cam")
print('  '.join(f"{k}:{v:.0f}s" for k, v in dur.items()))
if '--edl-only' in sys.argv: sys.exit()

# ---------------------------------------------------------------- 2-3. render scenes
ENCV = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30']
ENCA = ['-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2']

def run(cmd): subprocess.run(['ffmpeg', '-v', 'error', '-y', *cmd], check=True)

def facecam(sid, take, cuts):
    out = f'{OUT}/{sid}_fc.mov'
    parts, fl = [], []
    for k, c in enumerate(cuts):
        d = c['end'] - c['start']
        fl.append(f"[0:v]trim={c['start']}:{c['end']},setpts=PTS-STARTPTS[v{k}];"
                  f"[0:a]atrim={c['start']}:{c['end']},asetpts=PTS-STARTPTS,afade=t=in:d=0.005,"
                  f"afade=t=out:st={max(0, d - 0.008):.3f}:d=0.008[a{k}];")
        parts.append(f'[v{k}][a{k}]')
    graph = ''.join(fl) + ''.join(parts) + f'concat=n={len(cuts)}:v=1:a=1[v][a]'
    gf = f'{OUT}/{sid}_fc.graph'; open(gf, 'w').write(graph)
    run(['-i', f'{RAW}/IMG_{take}.MOV', '-filter_complex_script', gf, '-map', '[v]', '-map', '[a]', *ENCV, *ENCA, out])
    return out

def probe_dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p],
                                capture_output=True, text=True).stdout)

def txt(name, s): p = f'{OUT}/{name}.txt'; open(p, 'w').write(s); return p

def screen_track(sid, total):
    items = SCREEN[sid]
    wsum = sum(it[3] for it in items)
    segs = []
    for k, (key, a, b, wgt, tag) in enumerate(items):
        d = total * wgt / wsum
        out = f'{OUT}/{sid}_s{k}.mp4'
        if key == 'TODO':
            t1, t2 = txt(f'{sid}_t{k}a', a), txt(f'{sid}_t{k}b', b.upper())
            vf = (f"drawtext=fontfile={FB}:textfile={t1}:fontsize=72:fontcolor=0xE8775F:x=(w-tw)/2:y=(h/2)-60,"
                  f"drawtext=fontfile={FS}:textfile={t2}:fontsize=30:fontcolor=0x111111:box=1:boxcolor=0xFFD54A:"
                  f"boxborderw=12:x=(w-tw)/2:y=(h/2)+50")
            run(['-f', 'lavfi', '-i', f'color=c=0x141418:s=1920x1080:r=30:d={d:.3f}', '-vf', vf, *ENCV, '-an', out])
        else:
            s, e = mm(a), mm(b)
            if key == 'BR-OR': e = min(e, probe_dur(FILES[key]))
            speed = (e - s) / d
            vf = (f"setpts=(PTS-STARTPTS)/{speed:.5f},scale=1920:1080:force_original_aspect_ratio=decrease,"
                  f"pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x0b0b0e,fps=30,tpad=stop_mode=clone:stop_duration={d:.3f},"
                  f"trim=duration={d:.3f}")
            if tag:
                vf += (f",drawtext=fontfile={FB}:textfile={txt(f'{sid}_g{k}', tag)}:fontsize=28:fontcolor=0x111111:"
                       f"box=1:boxcolor=0xFFD54A:boxborderw=12:x=w-tw-36:y=30")
            run(['-ss', str(s), '-to', str(e), '-i', FILES[key], '-vf', vf, *ENCV, '-an', out])
        segs.append(out)
    lst = txt(f'{sid}_list', ''.join(f"file '{p}'\n" for p in segs))
    out = f'{OUT}/{sid}_screen.mp4'
    run(['-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', out])
    return out

# rounded-corner mask for the PiP card
from PIL import Image, ImageDraw
PIP = 340
mask = f'{OUT}/pipmask.png'
im = Image.new('L', (PIP, PIP), 0); ImageDraw.Draw(im).rounded_rectangle([0, 0, PIP - 1, PIP - 1], radius=36, fill=255); im.save(mask)

scene_files = []
for sid, mode, take, a, b in SCENES:
    cuts = [c for c in EDL if c['scene'] == sid]
    fc = facecam(sid, take, cuts)
    out = f'{OUT}/{sid}_final.mov'
    if mode == 'FC' or sid not in SCREEN:
        run(['-i', fc, '-c', 'copy', out])
    else:
        total = probe_dur(fc)
        scr = screen_track(sid, total)
        graph = (f"[1:v]crop=820:820:550:40,scale={PIP}:{PIP},format=rgba[f];[2:v]format=gray[m];[f][m]alphamerge[p];"
                 f"color=c=0xE8775F:s={PIP + 8}x{PIP + 8}:d=1,format=rgba[bd];[3:v]format=gray,scale={PIP + 8}:{PIP + 8}[bm];"
                 f"[bd][bm]alphamerge,loop=-1:1:0[b];"
                 f"[0:v][b]overlay=36:H-h-36:shortest=1[t];[t][p]overlay=40:H-h-40[v]")
        run(['-i', scr, '-i', fc, '-loop', '1', '-i', mask, '-i', mask, '-filter_complex', graph,
             '-map', '[v]', '-map', '1:a', *ENCV, *ENCA, '-t', f'{total:.3f}', out])
    scene_files.append(out)
    print('scene', sid, f'{probe_dur(out):.1f}s', flush=True)

# ---------------------------------------------------------------- 4. join + loudness + exports
lst = txt('all_list', ''.join(f"file '{p}'\n" for p in scene_files))
joined = f'{OUT}/joined.mov'
run(['-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', joined])
os.makedirs(f'{ROOT}/renders', exist_ok=True)
master = f'{ROOT}/renders/free-claude-code-cut-v1-1080p.mp4'
run(['-i', joined, '-af', 'loudnorm=I=-14:TP=-1:LRA=11', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000',
     '-movflags', '+faststart', master])
total = probe_dur(master)
vbr = int((29 * 8 * 1024 * 1024) / total - 64000)  # fit in ~29 MB with 64 kb/s audio
review = f'{ROOT}/renders/free-claude-code-cut-v1-review.mp4'
run(['-i', master, '-vf', 'scale=960:540', '-c:v', 'libx264', '-preset', 'medium', '-b:v', str(vbr), '-maxrate', str(int(vbr * 1.5)),
     '-bufsize', str(vbr * 2), '-c:a', 'aac', '-b:a', '64k', '-ac', '1', '-movflags', '+faststart', review])
print('MASTER', master, f'{total / 60:.1f} min')
print('REVIEW', review, f'{os.path.getsize(review) / 1e6:.1f} MB')
