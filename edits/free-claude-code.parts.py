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
PART1 = [  # timings from ElevenLabs Scribe (transcripts/IMG_14xx/elevenlabs.json); every restart / stumble cut by hand
    ('FC', '1 Hook / 2 Phone example + roadmap / 3 Trust', [
        ('1474', 23.5, 49.24),     # hook (one continuous read)
        ('1474', 55.62, 83.22),    # phone example
        ('1474', 95.30, 104.86),   # "So by the end of this video ... in three different ways" (2nd read)
        ('1474', 105.26, 110.24),  # "First, completely on your own laptop ..."
        ('1474', 114.58, 116.92),  # "Then free AI models in the cloud,"
        ('1474', 130.94, 134.28),  # "plus the one trap that can quietly charge your paid plan." (3rd read, after the cough)
        ('1474', 164.34, 173.28),  # "And finally, several free providers ..." (last clean read)
        ('1474', 173.48, 179.26),  # setup kit
        ('1474', 184.46, 186.84),  # "It's the first link in the description below."
        ('1474', 189.96, 193.40),  # "So stay till the end ..."
        ('1474', 199.38, 207.58),  # trust note
        ('1474', 210.82, 216.00),  # "And I won't just tell you it's free ... So let's start."
    ], []),
    ('VO', '4a What Ollama is / 4b Settings / 4c Offline test', [
        ('1477', 20.82, 31.26),    # "So method one, it's called Ollama. ... media player, but for AI."
        ('1477', 34.80, 45.02),    # "The big difference from ChatGPT or Claude ... works without internet."
        ('1477', 52.40, 54.30), ('1477', 56.74, 59.64), ('1477', 60.60, 67.68),
        ('1477', 70.58, 74.30),    # "Then double-click the file, click through the steps, and that's it."
        ('1477', 74.46, 76.60), ('1477', 80.14, 92.28),
        ('1477', 105.42, 109.56),  # Chat (4th read)
        ('1477', 113.18, 115.16),  # "In Settings, two things matter."
        ('1477', 117.48, 118.90), ('1477', 120.04, 127.64), ('1477', 131.70, 135.58),
        ('1477', 140.40, 143.28),  # "Context length is the AI's short-term memory,"
        ('1477', 149.56, 154.36),  # "how much of your conversation ... in its head at once."
        ('1477', 154.74, 158.42), ('1477', 164.88, 168.62), ('1477', 169.08, 171.52), ('1477', 173.12, 174.04),
        ('1477', 178.20, 179.36), ('1477', 181.10, 191.96),
        ('1477', 192.24, 194.00),  # "Bigger usually means smarter,"
        ('1477', 196.52, 198.90),  # "but slower and hungrier for the memory."
        ('1477', 206.22, 216.08),  # "I pick a small one, Qwen 3.5 4B ... so it takes a minute."
        ('1477', 216.22, 216.90),  # "After that,"
        ('1477', 222.44, 226.38),  # "it lives on your laptop for good ..."
        ('1477', 230.82, 238.40),  # "But hi proves nothing ... No internet at all."
        ('1477', 241.62, 242.50),  # "So be honest,"
        ('1477', 247.16, 249.32),  # "do you think it can still write an app?"
        ('1477', 253.04, 256.60), ('1477', 256.94, 260.62),
        ('1477', 277.18, 280.52),  # "Every single word came from a model sitting on this laptop."
        ('1477', 286.28, 289.32),  # "Then I turn the Wi-Fi back on for one reason,"
        ('1477', 291.98, 294.62),  # "to test the code in a free online compiler."
        ('1477', 302.34, 307.20), ('1477', 307.74, 313.50),
        ('1477', 315.04, 316.70),  # "Is it pretty? ... No."
        ('1477', 324.80, 330.80),  # "But a laptop with no internet ... no usage limits,"
        ('1477', 334.54, 336.68),  # "and your code never left your computer."
    ], [
        ('142752', 0, 47, 20.82, {}), ('142752', 81, 93, 68.1, {}), ('142752', 184, 210, 80.14, {}),
        ('142752', 221, 255, 113.18, {}), ('142752', 348, 448, 178.2, {}), ('142752', 448, 462, 233.3, {}),
        ('142752', 528, 668, 253.04, {}), ('142752', 696, 762, 286.28, {}),
    ]),
    ('FC', '4d Subscribe hook', [('1477', 352.02, 359.00)], []),
    ('VO', '4e Which model for your RAM / 4f Problem -> an AI fixes it', [
        ('1477', 364.12, 375.28), ('1477', 379.10, 383.80), ('1477', 384.44, 387.70),
        ('1477', 391.94, 394.96),  # "Okay, here is mine."
        ('1477', 395.18, 401.98), ('1477', 405.10, 411.76),
        ('1477', 411.96, 414.20),  # "With thirty-two GB, you can go to medium,"
        ('1477', 424.36, 435.22),  # "and with sixty-four GB ... Just find your RAM."
        ('1477', 441.32, 443.26),  # "Here is a little trick I use too."
        ('1477', 445.50, 447.98),  # "I asked ChatGPT, here is my laptop." (after "I, I asked chat,")
        ('1477', 451.38, 459.12),  # "give me the best coding model for Ollama ..."
        ('1477', 468.30, 474.70),  # "And it suggested MiMo ... The exact prompt is in the setup kit."
        ('1477', 479.66, 484.50),
        ('1477', 487.20, 490.86),  # "and Ollama only shows a handful of popular models there."
        ('1477', 498.88, 505.50), ('1477', 510.30, 520.92), ('1477', 525.54, 551.92),
        ('1477', 551.94, 554.62),  # "Install MiMo version 2.6 9B"
        ('1477', 559.54, 562.44),  # "and set everything up so it works with Ollama."
        ('1477', 569.16, 574.44),  # "it will ask your permission before running each command ..."
        ('1477', 574.76, 585.32),
    ], [
        ('145317', 15, 55, 364.12, {}), ('145317', 95, 210, 441.32, {}), ('145317', 224, 240, 479.66, {}),
        ('145317', 255, 270, 498.88, {}), ('145317', 278, 305, 510.30, {}), ('145317', 320, 362, 525.54, {}), ('145317', 374, 440, 543.6, {}),
        ('145317', 525, 603, 551.0, {}), ('151536', 0, 6, 569.16, {}), ('121640', 0, 8, 577.22, {}),
        ('121640', 14, 22, 580.9, {}),
    ]),
    ('FC', '4g The rule of this video', [
        ('1477', 594.34, 597.02),  # "And that's going to be the rule for this whole video."
        ('1477', 599.44, 610.76),  # "anything longer than one line ... say, Fix this."
    ], []),
    ('VO', '4h Claude Code on Ollama', [
        ('1477', 625.86, 632.52),  # "Now the part you came here for ... click Claude Code."
        ('1477', 638.70, 643.98),  # "See that little message? It copied the launch command ..."
        ('1477', 647.50, 652.66),  # "Now make a folder ... Mine is called Claude Code. Open it,"
        ('1477', 656.24, 666.66),  # "right-click in the empty space ... say Yes."
        ('1477', 668.92, 677.74), ('1477', 680.74, 689.10), ('1477', 692.08, 696.76),
        ('1477', 701.28, 707.56),  # "On my laptop, it took about thirty minutes ... heavy lifting,"
        ('1477', 716.42, 725.86),  # "and that's the honest trade-off ... But it finished, and it works."
        ('1477', 735.22, 741.12),  # "and next time, you don't repeat any of this. Just open your folder ..."
        ('1477', 746.42, 754.00),
    ], [
        ('121640', 8, 30, 625.86, {}), ('121640', 30, 55, 647.5, {'blur': dict(EXPLORER_BLUR, t0=1.6, t1=21)}),
        ('FACE', 'SCREEN RECORDING NEEDED: Claude Code running on Ollama', None, 661.9, {}),
    ]),
]
PAUSES = {'1477': [315.70, 316.50]}  # "Is it pretty? ... No."  # "So be honest. ... Do you think", "Is it pretty? ... No."
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
            # A/V sync: cut on the 30 fps frame grid and make the audio exactly as long as the video
            # (otherwise each piece's audio is a fraction of a frame short and the voice drifts ahead of the lips).
            f0, f1 = round(x * 30), round(y * 30)
            n = f1 - f0
            if n < 3: continue
            x, d = f0 / 30, n / 30
            p = f'{OUT}/{name}_p{len(parts):04d}.mov'
            run(['-ss', f'{x:.4f}', '-i', f'{RAW}/IMG_{take}.MOV', '-map', '0:v:0', '-map', '0:a:0', '-frames:v', str(n),
                 '-af', f'aresample=48000,afade=t=in:d=0.006,afade=t=out:st={d - 0.010:.4f}:d=0.010,apad,atrim=end_sample={n * 1600}',
                 *ENCV, *ENCA, p])
            tmap.append((take, x, x + d, t)); t += d; parts.append(p)
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
