"""Crop zones for vertical Shorts: (cx, cy, w) as fractions of the source frame; height follows the panel aspect."""
K = '/home/user/AIwithKalyan/media/screen-recordings/free-claude-code/'
SRC = {k: K + f'2026-11-0{v}.mp4' for k, v in {
    '142752': '5_142752', '121640': '6_121640', '123051': '6_123051', '114247': '10_114247'.replace('10_', '') , }.items()}
SRC = {
 '142752': K+'2026-11-05_142752.mp4', '121640': K+'2026-11-06_121640.mp4', '123051': K+'2026-11-06_123051.mp4',
 '114247': K+'2026-11-10_114247.mp4', '121406': K+'2026-11-10_121406.mp4',
}
DIM = {'142752': (1920,1128), '121640': (1916,1124), '123051': (1912,1118), '114247': (1920,1114), '121406': (1920,1120)}
PANEL = (1080, 1152)  # bottom screen panel
CROPS = {
 'wifi':      ('142752', '7:30',  0.85, 0.72, 0.30),
 'ask_notes': ('142752', '9:05',  0.37, 0.40, 0.52),
 'code':      ('142752', '10:20', 0.37, 0.50, 0.55),
 'app_runs':  ('142752', '12:30', 0.72, 0.42, 0.45),
 'ollama_web':('142752', '0:31',  0.27, 0.42, 0.50),
 'launch':    ('121640', '0:27',  0.40, 0.30, 0.50),
 'paste':     ('121640', '1:14',  0.25, 0.40, 0.50),
 'errors':    ('121640', '2:40',  0.25, 0.40, 0.45),
 'pro':       ('121640', '3:03',  0.22, 0.30, 0.42),
 'free':      ('123051', '4:40',  0.25, 0.25, 0.48),
 'bill':      ('123051', '6:00',  0.35, 0.45, 0.60),
 'combo':     ('114247', '1:40',  0.40, 0.55, 0.55),
 'logs':      ('121406', '2:57',  0.60, 0.80, 0.42),
}
def box(key):
    src, t, cx, cy, w = CROPS[key]; W, H = DIM[src]
    cw = int(W * w) // 2 * 2; ch = int(cw * PANEL[1] / PANEL[0]) // 2 * 2
    if ch > H: ch = H // 2 * 2; cw = int(ch * PANEL[0] / PANEL[1]) // 2 * 2
    x = int(min(max(cx * W - cw / 2, 0), W - cw)); y = int(min(max(cy * H - ch / 2, 0), H - ch))
    return src, t, cw, ch, x, y

if __name__ == '__main__':
    import subprocess, os
    out = os.path.dirname(os.path.abspath(__file__)) + '/cropcheck'; os.makedirs(out, exist_ok=True)
    for k in CROPS:
        src, t, cw, ch, x, y = box(k)
        subprocess.run(['ffmpeg','-v','error','-y','-ss',t,'-i',SRC[src],'-frames:v','1','-vf',
            f"crop={cw}:{ch}:{x}:{y},scale=360:384,drawtext=fontfile=/usr/share/fonts/opentype/inter/Inter-Bold.otf:text='{k}':fontsize=26:fontcolor=yellow:box=1:boxcolor=black:x=6:y=6",
            f'{out}/{k}.png'], check=True)
    subprocess.run(f"ffmpeg -v error -y -pattern_type glob -i '{out}/*.png' -vf tile=5x3 -frames:v 1 {out}/../crops_sheet.jpg", shell=True, check=True)
    print('ok')
