"""Build the Free Claude Code screen-recording rough cut.
Each entry: ('clip', file_key, start, end, speed, label) | ('card', title, subtitle, seconds, kind)
kind: 'section' (dark) | 'todo' (yellow: still missing) | 'open' (start card)
"""
import subprocess, os, sys, json

K = '/home/user/AIwithKalyan/media/screen-recordings/free-claude-code/'
C = '/home/user/AIwithKalyan/media/screen-recordings/claude-recorded/'
FILES = {
 '142752': K+'2026-11-05_142752.mp4', '145317': K+'2026-11-05_145317.mp4', '151536': K+'2026-11-05_151536.mp4',
 '121640': K+'2026-11-06_121640.mp4', '123051': K+'2026-11-06_123051.mp4', '154801': K+'2026-11-06_154801.mp4',
 '163037': K+'2026-11-07_163037.mp4', '144707': K+'2026-11-09_144707.mp4', '154411': K+'2026-11-09_154411.mp4',
 '160207': K+'2026-11-09_160207.mp4', '113521': K+'2026-11-10_113521.mp4', '114247': K+'2026-11-10_114247.mp4',
 '121406': K+'2026-11-10_121406.mp4',
 'CR01': C+'01-launcher-model-hi.mp4', 'CR04': C+'04-planmode-questions-build.mp4', 'CR05': C+'05-fix-round1.mp4',
 'CR07': C+'07-notes-app-working.mp4', 'BR-OR': '/home/user/AIwithKalyan/media/broll/openrouter-free.mp4',
}
def t(s):
    if isinstance(s,(int,float)): return float(s)
    m,sec=s.split(':'); return int(m)*60+float(sec)

EDL = [
 ('card','Free Claude Code — screen-recording rough cut','Review copy · step labels show source file + time · yellow cards = still to make',5,'open'),
 ('card','0 · Intro','Face cam + car/engine graphic (to record / build)',3,'todo'),
 ('card','1 · Ollama','Free AI on your own laptop',3,'section'),
 ('clip','142752','0:00','1:35',4,'1.1 Download & install Ollama'),
 ('clip','142752','3:04','3:30',1.5,'1.2 Apps: Claude Code, Codex, OpenCode…'),
 ('clip','142752','3:41','4:15',1.5,'1.2 Settings: Cloud off · context length → 64K'),
 ('clip','142752','5:48','7:28',6,'1.3 First chat: "hi" (model downloads)'),
 ('clip','142752','7:28','7:42',1,'1.3 Wi-Fi OFF'),
 ('clip','142752','8:48','11:08',6,'1.3 Offline: "make a simple notes app"'),
 ('clip','142752','11:36','12:42',2,'1.3 Wi-Fi back on → code runs in OneCompiler'),
 ('clip','145317','0:00','1:20',4,'1.4 Check hardware: built-in AMD graphics · 16 GB RAM'),
 ('clip','145317','1:40','3:25',4,'1.4 Ask ChatGPT for the best local model'),
 ('clip','145317','3:44','4:00',1,'1.5 Problem: model not in the dropdown'),
 ('clip','145317','4:30','5:05',2,'1.5 Terminal: Ollama too old → update'),
 ('clip','145317','5:20','7:10',6,'1.5 Download & sign in to Antigravity'),
 ('clip','145317','8:45','10:03',4,'1.5 Antigravity installs the model (allow prompts)'),
 ('clip','151536','0:00','0:06',1,'1.5 Permission prompt'),
 ('clip','121640','0:00','0:08',1,'1.5 Installed & tested'),
 ('clip','121640','0:08','0:55',1.5,'1.6 Ollama Apps → Claude Code: launch command copied → folder → terminal'),
 ('card','1.6 Claude Code running on Ollama','NOT recorded → one-command graphic: "ollama launch claude" + model picker',4,'todo'),
 ('card','2 · OpenRouter','Free models in the cloud',3,'section'),
 ('clip','154411','1:30','2:10',1.5,'2.1 OpenRouter API key: 7-day expiry · credit limit'),
 ('broll','BR-OR','2.2 B-roll: OpenRouter models filtered to free'),
 ('clip','121640','0:55','1:10',1,'2.3 The settings block (key + seats → free models)'),
 ('clip','121640','1:10','3:45',2.5,'2.3 The trap: paste fails → Claude opens on paid Claude Pro'),
 ('clip','123051','0:00','4:15',6,'2.3 Settings entered line by line'),
 ('clip','123051','4:15','4:35',1,'2.3 Now: openrouter/free · API Usage Billing'),
 ('clip','123051','4:35','5:50',2,'2.4 /model + "which model are you?"'),
 ('clip','123051','5:50','6:50',2,'2.4 Receipt: OpenRouter Activity $0.00'),
 ('clip','123051','7:00','7:12',1,'2.4 /usage shows $0.13: an estimate, not a bill'),
 ('card','2.5 The catch','Graphic to build: 50 requests/day → 429 wall',3,'todo'),
 ('card','3 · OmniRoute','Many free engines + real Claude',3,'section'),
 ('clip','154801','0:00','0:10',1,'3.1 OmniRoute on GitHub'),
 ('clip','154801','0:28','1:40',3,'3.1 Antigravity installs OmniRoute'),
 ('clip','154801','1:50','2:20',1.5,'3.1 Sign in (CHANGEME) → dashboard'),
 ('clip','154801','2:20','3:45',4,'3.2 Providers page'),
 ('clip','113521','0:10','1:15',2,'3.2 Kiro: device login → connected  ⚠ ToS: your account, your call'),
 ('clip','113521','1:35','3:50',3,'3.2 Antigravity: Google sign-in → connected  ⚠ use a spare account'),
 ('clip','163037','0:00','2:55',8,'3.2 NVIDIA: create a free account'),
 ('clip','113521','4:15','5:25',2,'3.2 NVIDIA key → "Invalid · fetch failed"'),
 ('clip','113521','7:30','7:55',1,'3.2 Real cause: certificate error (work network) · expect errors'),
 ('clip','154411','0:00','1:05',3,'3.2 Gemini: free key from Google AI Studio'),
 ('clip','144707','0:35','1:00',1,'3.2 Turn on "Import only free models"'),
 ('clip','114247','0:00','0:25',1.5,'3.3 Start OmniRoute'),
 ('clip','114247','1:00','3:25',3,'3.3 Build the "Claude" combo · smart routing'),
 ('clip','114247','3:28','3:57',1.5,'3.3 Intelligent routing dashboard'),
 ('clip','154411','11:28','11:45',1,'3.3 One OmniRoute API key for the whole combo'),
 ('clip','160207','0:00','0:40',1.5,'3.4 Antigravity creates two desktop shortcuts'),
 ('clip','160207','1:40','1:47',1,'3.4 Shortcuts on the desktop'),
 ('clip','CR01','0:00','0:36',1,'3.4 TEST MACHINE (not Kalyan\'s laptop): /model shows free models only'),
 ('clip','121406','0:00','0:22',1,'3.5 Double-click "Free Claude Code"'),
 ('clip','121406','0:22','1:05',8,'3.5 "which model are you?" → 503: Kiro busy'),
 ('clip','121406','1:05','1:12',1,'3.5 Expect errors: ask again'),
 ('clip','121406','1:12','2:35',4,'3.5 It answers "Claude" · /status · /usage'),
 ('clip','121406','2:35','3:05',1,'3.5 Receipt: logs → claude-sonnet-4.5 · KIRO · combo Claude · 200'),
 ('clip','CR04','0:00','9:01',10,'3.6 TEST MACHINE: plan mode → questions → plan → build (Claude → NVIDIA fallback)'),
 ('clip','CR05','0:00','1:13',4,'3.6 Fix round: "blank page… fix this"'),
 ('clip','CR07','0:00','0:45',1,'3.6 TEST MACHINE: working notes app (fixed + cleaned up after the build)'),
 ('card','4 · Honest truth · which one · 4 rules','Face cam + graphics (to record / build)',4,'todo'),
 ('card','5 · Conclusion + outro','Face cam + voice-clone outro (to record / build)',4,'todo'),
 ('card','End of rough cut','',3,'open'),
]

OUT = '/tmp/free-claude-code-roughcut-seg'
os.makedirs(OUT, exist_ok=True)
FB = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'; FS = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'; FR = '/usr/share/fonts/opentype/inter/Inter-Regular.otf'
ENC = ['-c:v','libx264','-preset','veryfast','-crf','22','-pix_fmt','yuv420p','-r','30','-an']

def tf(name, text):
    p = f'{OUT}/{name}.txt'; open(p,'w').write(text); return p

def card(i, title, sub, secs, kind):
    bg = {'section':'0x141418','todo':'0x2a2205','open':'0x0b0b0e'}[kind]
    col = {'section':'0xE8775F','todo':'0xFFD54A','open':'0xffffff'}[kind]
    a = tf(f'{i:03d}t', title); b = tf(f'{i:03d}s', sub or ' ')
    vf = (f"drawtext=fontfile={FB}:textfile={a}:fontsize=84:fontcolor={col}:x=(w-tw)/2:y=(h/2)-90,"
          f"drawtext=fontfile={FR}:textfile={b}:fontsize=36:fontcolor=0xd0d0d0:x=(w-tw)/2:y=(h/2)+30")
    if kind == 'todo':
        c = tf(f'{i:03d}k', 'STILL TO MAKE'); vf += f",drawtext=fontfile={FB}:textfile={c}:fontsize=30:fontcolor=0x111111:box=1:boxcolor=0xFFD54A:boxborderw=14:x=(w-tw)/2:y=(h/2)-200"
    out = f'{OUT}/{i:03d}.mp4'
    subprocess.run(['ffmpeg','-v','error','-y','-f','lavfi','-i',f'color=c={bg}:s=1920x1080:r=30:d={secs}','-vf',vf,*ENC,out],check=True)
    return out

def label_vf(label, src, speed, i):
    a = tf(f'{i:03d}l', label); b = tf(f'{i:03d}m', f'{src}' + (f'  ·  {speed:g}×' if speed != 1 else ''))
    return (f"drawtext=fontfile={FS}:textfile={a}:fontsize=34:fontcolor=white:box=1:boxcolor=0x000000@0.72:boxborderw=16:x=32:y=h-th-86,"
            f"drawtext=fontfile={FR}:textfile={b}:fontsize=22:fontcolor=0xE8775F:box=1:boxcolor=0x000000@0.72:boxborderw=10:x=32:y=h-th-34")

def clip(i, key, s, e, speed, label):
    s, e = t(s), t(e); src_name = os.path.basename(FILES[key]).replace('.mp4','')
    vf = (f"setpts=(PTS-STARTPTS)/{speed},scale=1920:1080:force_original_aspect_ratio=decrease,"
          f"pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x0b0b0e,fps=30,"
          + label_vf(label, f'{src_name} @ {int(s//60)}:{int(s%60):02d}–{int(e//60)}:{int(e%60):02d}', speed, i))
    out = f'{OUT}/{i:03d}.mp4'
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(s),'-to',str(e),'-i',FILES[key],'-vf',vf,*ENC,out],check=True)
    return out

segs = []
for i, it in enumerate(EDL):
    if it[0] == 'card': segs.append(card(i, *it[1:]))
    elif it[0] == 'clip': segs.append(clip(i, *it[1:]))
    elif it[0] == 'broll':
        if os.path.exists(FILES[it[1]]): segs.append(clip(i, it[1], 0, 6, 1, it[2]))
        else: segs.append(card(i, it[2], 'B-roll capture failed — capture openrouter.ai/models?max_price=0', 3, 'todo'))
    print(i, it[1] if it[0] != 'clip' else it[5], flush=True)

lst = f'{OUT}/list.txt'; open(lst,'w').write(''.join(f"file '{p}'\n" for p in segs))
full = '/home/user/AIwithKalyan/renders/free-claude-code-roughcut-1080p.mp4'
os.makedirs(os.path.dirname(full), exist_ok=True)
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',lst,'-c','copy','-movflags','+faststart',full],check=True)
print('FULL', full)
