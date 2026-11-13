"""Join Parts 1-3 into the final video: picture stream-copied (no re-encode), audio rebuilt from each part's voice + SFX stems
with ElevenLabs music (hype intro, two alternating underscores, hype outro), ducked under the voice, -14 LUFS / -1.5 dBTP.
Usage: python3 edits/fcc_final.py"""
import json, os, subprocess
ROOT = '/home/user/AIwithKalyan'; WORK = '/tmp/fcc-style'; MUS = f'{ROOT}/media/music'; SR = 48000
PARTS = [  # (master, voice stem = the face track the master was built from, sfx stem)
    (f'{ROOT}/renders/fcc-part1-v4-1080p.mp4', f'{WORK}/fcc-part1-v4_face_11f44e9b62.mov', f'{WORK}/fcc-part1-v4_sfx.wav'),
    (f'{ROOT}/renders/fcc-part2-1080p.mp4', f'{WORK}/fcc-part2_face_3413d4a4c2.mov', f'{WORK}/fcc-part2_sfx.wav'),
    (f'{ROOT}/renders/fcc-part3-1080p.mp4', f'{WORK}/fcc-part3_face_7952195b3c.mov', f'{WORK}/fcc-part3_sfx.wav'),
]
INTRO_END = 90.05                                          # Part 1: the intro layer hands over to the Ollama scene here
OUTRO_IN_P3 = json.load(open(f'{ROOT}/compositions/fcc-part3-mg/outro.json'))['start']   # conclusion start inside Part 3
def run(*a): subprocess.run(a, check=True)
def dur(f): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f],
                                        capture_output=True, text=True).stdout)
def vdur(f):  # video stream duration (what the concat follows)
    return float(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=duration', '-of', 'csv=p=0', f],
                                capture_output=True, text=True).stdout)

D = [vdur(m) for m, _, _ in PARTS]; T = sum(D)
OUTRO_START = D[0] + D[1] + OUTRO_IN_P3
print('parts', [round(d, 3) for d in D], 'total', round(T, 3), 'outro at', round(OUTRO_START, 2))

# 1 picture: concat the three masters without re-encoding
lst = f'{WORK}/final_concat.txt'
open(lst, 'w').write(''.join(f"file '{m}'\n" for m, _, _ in PARTS))
run('ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-map', '0:v', '-c', 'copy', f'{WORK}/final_video.mp4')

# 2 voice + sfx: each part's stems trimmed/padded to that part's exact picture length, then joined
fc, ins = [], []
for i, (m, v, s) in enumerate(PARTS):
    ins += ['-i', v, '-i', s]
    fc.append(f'[{2*i}:a]aformat=sample_rates={SR}:channel_layouts=stereo,apad,atrim=0:{D[i]:.6f},asetpts=N/SR/TB[v{i}]')
    fc.append(f'[{2*i+1}:a]aformat=sample_rates={SR}:channel_layouts=stereo,apad,atrim=0:{D[i]:.6f},asetpts=N/SR/TB[s{i}]')
fc.append('[v0][v1][v2]concat=n=3:v=0:a=1[vo];[s0][s1][s2]concat=n=3:v=0:a=1[sx]')
run('ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fc), '-map', '[vo]', f'{WORK}/final_voice.wav', '-map', '[sx]', f'{WORK}/final_sfx.wav')

# 3 music stem. From research on 5 reference videos (vidIQ, 2026-11-13): mid-tempo lo-fi/electronic, music from 0:00 to the end,
#   a new track per method, about 20 dB under the voice (intro a little louder), small swell in the last seconds, fade out.
def norm(src, dst):
    run('ffmpeg', '-v', 'error', '-y', '-i', src, '-af', f'loudnorm=I=-16:TP=-2:LRA=11,aformat=sample_rates={SR}:channel_layouts=stereo', dst)
TRK = ('intro', 'body1', 'body2', 'body3', 'outro')
for k in TRK: norm(f'{MUS}/fcc2-{k}.mp3', f'{WORK}/m2_{k}.wav')
G_IN, G_BODY, G_OUT, XF = 0.47, 0.29, 0.37, 2.5     # intro ~16 dB, body ~20 dB, outro ~18 dB under the voice after ducking
M1, M2, M3 = INTRO_END, D[0], D[0] + D[1]           # method 1/2/3 start (Ollama, OpenRouter, OmniRoute)
outro_at = T - dur(f'{WORK}/m2_outro.wav')          # outro track ends on the last frame
plan = [('intro', 0.0, M1 + XF / 2, G_IN)]
for trk, a, b in (('body1', M1, M2), ('body2', M2, M3), ('body3', M3, outro_at)):
    L = dur(f'{WORK}/m2_{trk}.wav') - 1.0; t = a - XF / 2
    while t < b + XF / 2 - 0.5:                     # loop a track (crossfaded) when its section is longer than the track
        plan.append((trk, t, min(t + L, b + XF / 2), G_BODY)); t += L - XF
plan.append(('outro', outro_at - XF / 2, T, G_OUT))
SWELL = 12.0                                        # last seconds: +4 dB lift, then the track's own fade-out
ins, fc = [], []
for i, (trk, a, b, g) in enumerate(plan):
    ins += ['-i', f'{WORK}/m2_{trk}.wav']
    L = b - a; fi = 0.05 if i == 0 else XF; fo = 0.3 if i == len(plan) - 1 else XF
    sw = f",volume='if(gt(t,{L - SWELL:.3f}),1+0.585*min(1,(t-{L - SWELL:.3f})/3),1)':eval=frame" if trk == 'outro' else ''
    fc.append(f'[{i}:a]atrim=0:{L:.3f},asetpts=N/SR/TB,afade=t=in:d={fi},afade=t=out:st={max(0, L - fo):.3f}:d={fo}{sw},'
              f'volume={g},adelay={int(a * 1000)}|{int(a * 1000)},apad,atrim=0:{T:.6f}[m{i}]')
fc.append(''.join(f'[m{i}]' for i in range(len(plan))) + f'amix=inputs={len(plan)}:normalize=0:duration=longest[mu]')
run('ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fc), '-map', '[mu]', f'{WORK}/final_music.wav')
print('music plan:'); [print(f'  {trk:6s} {a:8.2f} -> {b:8.2f}  gain {g}') for trk, a, b, g in plan]

# 3b chapter sounds (synthesised here, $0): a soft low-passed whoosh at each chapter change, plus a soft low impact
#    on the three method cards. Graphic clicks/pops stay in each part's own SFX stem.
import re, wave, numpy as np
CH = []
for line in open(f'{ROOT}/edits/free-claude-code.youtube.md'):
    mm = re.match(r'^(\d+):(\d\d) ', line)
    if mm: CH.append(int(mm.group(1)) * 60 + int(mm.group(2)))
CH = sorted(set(c for c in CH if 5 < c < OUTRO_START - 5) | {round(M1, 2), round(M2, 2), round(M3, 2)})
CH = [c for i, c in enumerate(CH) if i == 0 or c - CH[i - 1] > 4]
rng = np.random.default_rng(7); n = int(T * SR); sfx = np.zeros(n, np.float32)
def whoosh(L=0.55):
    x = rng.standard_normal(int(L * SR)).astype(np.float32); env = np.sin(np.linspace(0, np.pi, len(x))) ** 2
    y = np.zeros_like(x); a = 0.0
    for i in range(len(x)):                         # one-pole low-pass whose cutoff sweeps up then down
        c = 0.02 + 0.10 * env[i]; a += c * (x[i] - a); y[i] = a
    return y * env / (np.abs(y).max() + 1e-9)
def impact(L=0.5):
    t = np.arange(int(L * SR)) / SR; return (np.sin(2 * np.pi * 55 * t * (1 - 0.3 * t)) * np.exp(-t * 9)).astype(np.float32)
for c in CH:
    st = int(max(0, c - 0.45) * SR); w = whoosh() * 0.10; sfx[st:st + len(w)] += w[:n - st]
    if min(abs(c - m) for m in (M1, M2, M3)) < 1.0:
        si = int(c * SR); h = impact() * 0.16; sfx[si:si + len(h)] += h[:n - si]
with wave.open(f'{WORK}/final_chapters.wav', 'wb') as wv:
    wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((np.clip(sfx, -1, 1) * 32767).astype(np.int16).tobytes())
print('chapter sounds at', CH)

# 4 mix: music ducked under the voice (sidechain), + sfx; two-pass loudnorm to -14 LUFS / -1.5 dBTP
mix = f'{WORK}/final_mix.wav'
run('ffmpeg', '-v', 'error', '-y', '-i', f'{WORK}/final_voice.wav', '-i', f'{WORK}/final_music.wav', '-i', f'{WORK}/final_sfx.wav',
    '-i', f'{WORK}/final_chapters.wav', '-filter_complex',
    '[0:a]asplit[v][vk];[1:a][vk]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=450[md];'
    f'[3:a]aformat=sample_rates={SR}:channel_layouts=stereo[ch];[v][md][2:a][ch]amix=inputs=4:normalize=0:duration=first[m]', '-map', '[m]', '-ar', str(SR), mix)
m = subprocess.run(['ffmpeg', '-nostats', '-i', mix, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                   capture_output=True, text=True).stderr
j = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,alimiter=limit=0.89:level=false")
out = f'{ROOT}/renders/free-claude-code-3-ways-FINAL-1080p.mp4'
run('ffmpeg', '-v', 'error', '-y', '-i', f'{WORK}/final_video.mp4', '-i', mix, '-af', ln, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
    '-c:a', 'aac', '-b:a', '320k', '-ar', str(SR), '-shortest', '-movflags', '+faststart', out)
review = f'{ROOT}/renders/free-claude-code-3-ways-FINAL-review.mp4'; vbr = int(28 * 8e6 / T - 96000)
run('ffmpeg', '-v', 'error', '-y', '-i', out, '-vf', 'scale=1280:720', '-c:v', 'libx264', '-preset', 'medium', '-b:v', str(vbr),
    '-maxrate', str(int(vbr * 1.4)), '-bufsize', str(vbr * 2), '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', review)
json.dump(dict(parts=[dict(file=os.path.basename(p[0]), start=round(sum(D[:i]), 3), dur=round(D[i], 3)) for i, p in enumerate(PARTS)],
               outro_start=round(OUTRO_START, 3), music=[dict(track=a, start=round(b, 2), end=round(c, 2), gain=g) for a, b, c, g in plan], chapter_sounds=CH),
          open(f'{ROOT}/edits/fcc-final.timeline.json', 'w'), indent=1)
print('FINAL', out, f'{dur(out) / 60:.2f} min', f'{os.path.getsize(out) / 1e6:.0f} MB'); print('REVIEW', review, f'{os.path.getsize(review) / 1e6:.1f} MB')
