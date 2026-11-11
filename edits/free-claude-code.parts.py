"""Free Claude Code: final cut, built one part at a time from a hand-checked edit list.

Usage:  python3 edits/free-claude-code.parts.py 1        # render Part 1 (+ QA transcript)

Each part is a list of sections. A section is either
  FC : face cam full frame
  VO : screen recordings full frame + face in a rounded PiP card (bottom-left)
Cuts are (take, start, end) in seconds of the camera take. Edges snap to the real audio (silence detection),
and any pause inside a cut longer than ~0.3 s is shortened (except at PAUSES, kept up to 0.7 s for effect).
Screen items are (key, src_start, src_end, anchor, opts): `anchor` is the take time of the line it belongs to,
so each clip starts on its line. A clip shorter than its slot holds its last frame; a longer one is sped up.
key 'FACE' = no screen footage for this line yet: face full frame with a yellow tag.
"""
import json, os, re, subprocess, sys

ROOT = '/home/user/AIwithKalyan'
RAW = f'{ROOT}/media/raw/free-claude-code'
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
FB = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'

# ------------------------------------------------------------------ PART 1: intro + Method 1 (Ollama)
# Explorer windows with private files are cut out (142752 0:47-1:21, 145317 6:02-6:14) or blurred (121640 0:30-0:51).
EXPLORER_BLUR = dict(t0=22, t1=43, x=650, y=360, w=1210, h=660)  # times relative to the clip start (0:08)
PART1 = [
    ('FC', '1 Hook / 2 Phone example + roadmap / 3 Trust', [
        ('1474', 23.2, 48.98), ('1474', 55.5, 83.05), ('1474', 95.1, 104.68), ('1474', 105.2, 110.06),
        ('1474', 114.15, 117.42),  # "Then, free AI models in the cloud, plus"
        ('1474', 131.05, 134.23),  # "the one trap that can quietly charge your paid plan." (3rd, clean read)
        ('1474', 163.9, 173.20),   # "And finally, several free providers ..." (2nd read; 1st was followed by a false start)
        ('1474', 173.52, 179.02), ('1474', 184.0, 186.72), ('1474', 189.82, 193.20), ('1474', 199.35, 215.85),
    ], []),
    ('VO', '4a What Ollama is / 4b Settings / 4c Offline test', [
        ('1477', 17.85, 44.72), ('1477', 50.3, 76.30), ('1477', 80.0, 92.14),
        ('1477', 105.6, 109.80),   # "Chat: this is where you talk to a model directly to test it." (last of 3 reads)
        ('1477', 110.1, 127.57), ('1477', 128.5, 135.47), ('1477', 136.1, 143.16),
        ('1477', 149.1, 154.22),   # retake of "how much ... hold in its head at once"
        ('1477', 154.9, 158.14), ('1477', 164.7, 173.81),  # retake of "if the memory is too small"
        ('1477', 178.3, 198.67), ('1477', 200.45, 201.75),  # "I pick a small one,"
        ('1477', 207.2, 212.02),   # "Qwen 3.5 4B, just to warm things up and type hi." (2nd read of the name)
        ('1477', 212.5, 226.16), ('1477', 230.85, 260.42),
        ('1477', 274.5, 280.29),   # retake of "every single word came from a model sitting on this laptop"
        ('1477', 285.4, 316.60), ('1477', 324.55, 330.62),  # "... no usage limits"
        ('1477', 334.6, 336.40),   # "and your code never left your computer." (retake)
    ], [
        ('142752', 0, 47, 17.85, {}), ('142752', 81, 93, 68.1, {}), ('142752', 184, 210, 80.0, {}),
        ('142752', 221, 255, 110.1, {}), ('142752', 348, 448, 178.3, {}), ('142752', 448, 462, 233.3, {}),
        ('142752', 528, 668, 249.1, {}), ('142752', 696, 762, 285.4, {}),
    ]),
    ('FC', '4d Subscribe hook', [('1477', 351.2, 359.19)], []),
    ('VO', '4e Which model for your RAM / 4f Problem -> an AI fixes it', [
        ('1477', 364.2, 375.10), ('1477', 379.0, 388.14), ('1477', 391.8, 401.82),
        ('1477', 405.1, 413.98),   # "... with 32 GB you can go to medium"
        ('1477', 424.25, 429.18),  # "and with 64 GB or more you can run the big ones ..." (retake)
        ('1477', 429.5, 435.04), ('1477', 440.1, 474.49), ('1477', 479.6, 520.73), ('1477', 525.4, 585.08),
    ], [
        ('145317', 15, 55, 364.2, {}), ('145317', 95, 210, 440.1, {}), ('145317', 224, 240, 479.6, {}),
        ('145317', 255, 305, 494.9, {}), ('145317', 320, 362, 525.4, {}), ('145317', 374, 440, 543.6, {}),
        ('145317', 525, 603, 550.1, {}), ('151536', 0, 6, 566.5, {}), ('121640', 0, 8, 577.1, {}),
        ('121640', 14, 22, 580.7, {}),
    ]),
    ('FC', '4g The rule of this video', [('1477', 594.15, 610.60)], []),
    ('VO', '4h Claude Code on Ollama', [
        ('1477', 625.8, 629.20), ('1477', 629.5, 632.36), ('1477', 638.45, 643.68), ('1477', 647.0, 666.42),
        ('1477', 669.0, 688.92), ('1477', 691.9, 707.42), ('1477', 715.9, 725.62), ('1477', 730.0, 740.90),
        ('1477', 746.1, 753.82),
    ], [
        ('121640', 8, 30, 625.8, {}), ('121640', 30, 55, 647.0, {'blur': dict(EXPLORER_BLUR, t0=0, t1=21)}),
        ('FACE', 'SCREEN RECORDING NEEDED: Claude Code running on Ollama', None, 661.9, {}),
    ]),
]
PAUSES = {'1477': [239.42, 242.98, 315.58, 316.60]}  # "So be honest. ... Do you think", "Is it pretty? ... No."
PARTS = {1: PART1}

# ------------------------------------------------------------------ helpers
OUT = '/tmp/fcc-parts'
os.makedirs(OUT, exist_ok=True)
ENCV = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30']
ENCA = ['-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2']

def run(cmd): subprocess.run(['ffmpeg', '-v', 'error', '-y', *cmd], check=True)
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p],
                                        capture_output=True, text=True).stdout)
def txt(name, s): p = f'{OUT}/{name}.txt'; open(p, 'w').write(s); return p

_sil = {}
def silences(take):
    if take not in _sil:
        cache = f'{OUT}/sil_{take}.json'
        if os.path.exists(cache): _sil[take] = json.load(open(cache))
        else:
            log = subprocess.run(['ffmpeg', '-nostats', '-i', f'{RAW}/IMG_{take}.MOV', '-vn', '-af',
                                  'highpass=f=80,silencedetect=n=-35dB:d=0.25', '-f', 'null', '-'], capture_output=True, text=True).stderr
            st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
            en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
            _sil[take] = list(zip(st, en)); json.dump(_sil[take], open(cache, 'w'))
    return _sil[take]

def refine(take, s, e):
    """Snap edges to speech and shorten long pauses inside. Returns [(start, end), ...] pieces."""
    sil = silences(take)
    for a, b in sil:
        if a - 0.05 <= s <= b: s = max(s, b - 0.10)        # start sits in silence -> just before speech
        if a <= e <= b + 0.05: e = min(e, a + 0.15)        # end sits in silence -> just after speech
    pieces = [[s, e]]
    for a, b in sil:
        if a <= s or b >= e: continue                      # only silences fully inside the cut
        keep = 0.7 if any(a - 0.3 <= p <= b + 0.3 for p in PAUSES.get(take, [])) else 0.3
        if b - a <= keep: continue
        cut0, cut1 = a + keep / 2, b - keep / 2
        nxt = []
        for x, y in pieces:
            if cut1 <= x or cut0 >= y: nxt.append([x, y])
            else:
                if cut0 > x: nxt.append([x, cut0])
                if cut1 < y: nxt.append([cut1, y])
        pieces = nxt
    return [(round(x, 3), round(y, 3)) for x, y in pieces if y - x > 0.08]

def face_track(name, cuts):
    """Encode every piece on its own (frame-exact, low memory), join. Returns file + [(take_s, take_e, out_s)]."""
    parts, tmap, t = [], [], 0.0
    for take, s, e in cuts:
        for x, y in refine(take, s, e):
            d = y - x
            p = f'{OUT}/{name}_p{len(parts):04d}.mov'
            run(['-ss', f'{x:.3f}', '-i', f'{RAW}/IMG_{take}.MOV', '-t', f'{d:.3f}', '-map', '0:v:0', '-map', '0:a:0',
                 '-af', f'afade=t=in:d=0.006,afade=t=out:st={max(0, d - 0.010):.3f}:d=0.010', *ENCV, *ENCA, p])
            real = dur(p)
            tmap.append((take, x, y, t)); t += real; parts.append(p)
    out = f'{OUT}/{name}_face.mov'
    run(['-f', 'concat', '-safe', '0', '-i', txt(f'{name}_flist', ''.join(f"file '{p}'\n" for p in parts)), '-c', 'copy', out])
    for p in parts: os.remove(p)
    return out, tmap

def to_out(tmap, take_t):
    for take, x, y, o in tmap:
        if take_t <= y: return o + max(0.0, take_t - x)
    return tmap[-1][3]

def screen_piece(name, key, a, b, d, opts):
    out = f'{OUT}/{name}.mp4'
    speed = max(1.0, (b - a) / d)
    pre = ''
    if 'blur' in opts:
        z = opts['blur']
        pre = (f"split[bg][fg];[fg]crop={z['w']}:{z['h']}:{z['x']}:{z['y']},boxblur=18:2[bl];"
               f"[bg][bl]overlay={z['x']}:{z['y']}:enable='between(t,{z['t0']},{z['t1']})',")
    vf = (f"{pre}setpts=(PTS-STARTPTS)/{speed:.5f},scale=1920:1080:force_original_aspect_ratio=decrease,"
          f"pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x0b0b0e,fps=30,tpad=stop_mode=clone:stop_duration={d + 1:.3f},"
          f"trim=duration={d:.3f},setpts=PTS-STARTPTS")
    if opts.get('tag'):
        vf += (f",drawtext=fontfile={FB}:textfile={txt(name + '_tag', opts['tag'])}:fontsize=28:fontcolor=0x111111:"
               f"box=1:boxcolor=0xFFD54A:boxborderw=12:x=w-tw-36:y=30")
    run(['-ss', str(a), '-to', str(b), '-i', FILES[key], '-filter_complex', f'[0:v]{vf}[v]', '-map', '[v]', *ENCV, '-an', out])
    return out

from PIL import Image, ImageDraw
PIP = 340
MASK = f'{OUT}/pipmask.png'
if not os.path.exists(MASK):
    im = Image.new('L', (PIP, PIP), 0); ImageDraw.Draw(im).rounded_rectangle([0, 0, PIP - 1, PIP - 1], radius=36, fill=255); im.save(MASK)

def section(name, mode, cuts, screens):
    face, tmap = face_track(name, cuts)
    total = dur(face)
    if mode == 'FC':
        return [(f'{OUT}/{name}_fc.mov', run(['-i', face, '-c', 'copy', f'{OUT}/{name}_fc.mov']))[0]], tmap
    # slots in output time
    starts = [0.0] + [to_out(tmap, it[3]) for it in screens[1:]]
    ends = starts[1:] + [total]
    out_parts = []
    for k, (it, s0, s1) in enumerate(zip(screens, starts, ends)):
        key, a, b, _, opts = it
        d = s1 - s0
        if d <= 0.05: continue
        seg = f'{OUT}/{name}_v{k}.mov'
        if key == 'FACE':  # face full frame + yellow tag
            vf = (f"drawtext=fontfile={FB}:textfile={txt(f'{name}_ft{k}', a)}:fontsize=28:fontcolor=0x111111:"
                  f"box=1:boxcolor=0xFFD54A:boxborderw=12:x=w-tw-36:y=30")
            run(['-ss', f'{s0:.3f}', '-i', face, '-t', f'{d:.3f}', '-vf', vf, *ENCV, *ENCA, seg])
        else:
            scr = screen_piece(f'{name}_s{k}', key, a, b, d, opts)
            graph = (f"[1:v]crop=820:820:550:40,scale={PIP}:{PIP},format=rgba[f];[2:v]format=gray[m];[f][m]alphamerge[p];"
                     f"color=c=0xE8775F:s={PIP + 8}x{PIP + 8}:r=30,format=rgba[bd];[3:v]format=gray,scale={PIP + 8}:{PIP + 8}[bm];"
                     f"[bd][bm]alphamerge[b];[0:v][b]overlay=36:H-h-36:shortest=1[t];[t][p]overlay=40:H-h-40:shortest=1[v]")
            run(['-i', scr, '-ss', f'{s0:.3f}', '-t', f'{d:.3f}', '-i', face, '-loop', '1', '-i', MASK, '-loop', '1', '-i', MASK,
                 '-filter_complex', graph, '-map', '[v]', '-map', '1:a', *ENCV, *ENCA, '-t', f'{d:.3f}', seg])
        out_parts.append(seg)
    return out_parts, tmap

# ------------------------------------------------------------------ build a part
def build(n):
    files, edl = [], []
    t0 = 0.0
    for i, (mode, title, cuts, screens) in enumerate(PARTS[n]):
        segs, tmap = section(f'p{n}s{i}', mode, cuts, screens)
        files += segs
        for take, x, y, o in tmap: edl.append(dict(section=title, mode=mode, take=take, src_in=x, src_out=y, rec_in=round(t0 + o, 3)))
        t0 += sum(dur(s) for s in segs)
        print(f'section {i} {title}: {sum(dur(s) for s in segs):.1f}s', flush=True)
    joined = f'{OUT}/p{n}_joined.mov'
    run(['-f', 'concat', '-safe', '0', '-i', txt(f'p{n}_all', ''.join(f"file '{p}'\n" for p in files)), '-c', 'copy', joined])
    # two-pass loudness: -14 LUFS integrated, -1 dBTP
    m = subprocess.run(['ffmpeg', '-nostats', '-i', joined, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    j = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
    ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
          f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,alimiter=limit=0.89:level=false")
    os.makedirs(f'{ROOT}/renders', exist_ok=True)
    master = f'{ROOT}/renders/free-claude-code-part{n}-1080p.mp4'
    run(['-i', joined, '-af', ln, '-ar', '48000', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', master])
    total = dur(master)
    vbr = int(25 * 8e6 / total - 96000)
    review = f'{ROOT}/renders/free-claude-code-part{n}-review.mp4'
    run(['-i', master, '-vf', 'scale=1280:720', '-c:v', 'libx264', '-preset', 'medium', '-b:v', str(min(vbr, 2500000)),
         '-maxrate', str(int(min(vbr, 2500000) * 1.4)), '-bufsize', str(min(vbr, 2500000) * 2),
         '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', review])
    json.dump(edl, open(f'{ROOT}/edits/free-claude-code.part{n}.edl.json', 'w'), indent=1)
    print('MASTER', master, f'{total / 60:.2f} min'); print('REVIEW', review, f'{os.path.getsize(review) / 1e6:.1f} MB')

if __name__ == '__main__':
    build(int(sys.argv[1]))
