"""Build 3 vertical Shorts rough cuts + storyboard markdown from one beat list.
Beat: (kind, dur, line, onscreen, sfx, [crop_key, src_start, src_end])
kind: 'fc' = face cam (placeholder panel), 'vo' = voiceover over a screen crop.
"""
import os, subprocess, textwrap, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from free_claude_code_shorts_crops import SRC, box  # noqa

FB='/usr/share/fonts/opentype/inter/Inter-Bold.otf'; FS='/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'; FR='/usr/share/fonts/opentype/inter/Inter-Regular.otf'
CORAL='0xE8775F'; BG='0x101114'
W,H,TOP=1080,1920,768

def t(s):
    m,x=s.split(':'); return int(m)*60+float(x)

SHORTS = {
'A': dict(title='The $0 Receipt', angle='Proof & curiosity: show the bill first, then explain how.', beats=[
 ('vo',1.4,"Claude Code costs twenty dollars a month…","$0.00","cash-register ding",'bill','6:00','6:02'),
 ('fc',1.8,"…I just used it for zero. Here's the receipt.","$20/mo → $0","whoosh"),
 ('fc',4.8,"Here's the secret: Claude Code, the app, is free. You only pay for the AI brain inside it. So I swapped the brain.","APP = FREE · BRAIN = $20","pop"),
 ('vo',4.0,"First, a free model on my own laptop. I even turned the Wi-Fi off…","OFFLINE","power-down",'wifi','7:28','7:40'),
 ('vo',4.0,"…and it still wrote an app.","Built offline ✓","typing tick",'code','9:40','11:05'),
 ('vo',4.0,"Then, free AI models in the cloud.","openrouter/free","pop",'free','4:30','4:50'),
 ('vo',5.0,"Three requests… zero dollars.","$0.00","ding",'bill','5:55','6:30'),
 ('vo',5.0,"And then the crazy one: I connected free AI providers together with a free tool called OmniRoute…","1 combo · many free AIs","whoosh",'combo','1:20','2:10'),
 ('vo',7.0,"…checked the logs, and real Claude Sonnet answered. Through a free account.","REAL CLAUDE ✓","riser → hit",'logs','2:45','3:00'),
 ('fc',5.5,"Is it unlimited? No. Every free tier has a cap, and I show every catch too.","Not unlimited. Honest.","soft tick"),
 ('fc',5.5,"Full setup, every prompt and every trap: it's all in the full video. Link below.","FULL SETUP ↓","whoosh"),
]),
'B': dict(title='Wi-Fi OFF Challenge', angle='Pattern interrupt: a live demo that looks impossible, then the reveal of how.', beats=[
 ('vo',2.6,"I'm turning my Wi-Fi off…","WI-FI OFF","power-down",'wifi','7:26','7:40'),
 ('fc',2.4,"…and asking AI to build me an app.","No internet. 0.","bass hit"),
 ('vo',4.0,"No internet at all. \"Make a simple notes app.\"","make a simple notes app","keyboard",'ask_notes','8:48','9:00'),
 ('vo',6.0,"It's thinking… thinking…","Thinking… (offline)","ticking clock",'ask_notes','9:00','9:40'),
 ('vo',6.0,"…and it writes the whole thing. Completely offline.","OFFLINE ✓","ding",'code','9:40','11:05'),
 ('vo',7.0,"Because it's not ChatGPT in the cloud. It's Ollama, a free app that runs AI right on my laptop. No subscription, no limits.","OLLAMA = AI on your laptop","pop",'ollama_web','0:28','0:45'),
 ('vo',5.0,"Wi-Fi back on just to test it… and it runs.","It runs ✓","pop",'app_runs','12:20','12:42'),
 ('vo',5.0,"And you can plug this straight into Claude Code, without paying for Claude.","→ Claude Code","whoosh",'launch','0:20','0:32'),
 ('fc',5.0,"That's just one of three free ways. The other two are faster. Full video, linked below.","1 of 3 ways → FULL VIDEO ↓","whoosh"),
]),
'C': dict(title="Is Your 'Free' Claude Code Charging You?", angle='Warning & tension: a real mistake most people never notice, then the fix and the proof.', beats=[
 ('vo',3.0,"If you set up 'free' Claude Code from a YouTube video, check this line right now.","CHECK THIS LINE ↓","alarm bonk",'pro','3:01','3:06'),
 ('vo',5.0,"I followed the steps to run Claude Code on free AI models, and pasted the settings…","Pasted the settings…","keyboard",'paste','1:10','1:22'),
 ('vo',4.0,"…typed claude, it opened. Looked perfect.","Looks fine…?","soft pop",'errors','2:44','2:56'),
 ('vo',7.0,"But look at the top: Claude Pro. My paste had failed silently, and Claude Code went back to my paid subscription.","PAID!","alarm bonk",'pro','3:00','3:12'),
 ('vo',4.0,"No error. No warning. Just these red lines I never read.","Silent fail","glitch",'errors','2:36','2:44'),
 ('vo',6.0,"When it's really free, this line says openrouter/free, or your free model's name.","FREE ✓","ding",'free','4:30','4:50'),
 ('vo',6.0,"And don't trust what the model says about itself. I checked the real bill: zero dollars.","$0.00","cash-register ding",'bill','5:55','6:30'),
 ('fc',5.0,"So the rule: check the bill, not the label.","CHECK THE BILL, NOT THE LABEL","hit"),
 ('fc',6.0,"I show three free ways to run Claude Code, and every trap like this one, in the full video. It's linked below.","3 WAYS + EVERY TRAP ↓","whoosh"),
]),
}

def tfile(d, name, text):
    p=f'{d}/{name}.txt'; open(p,'w').write(text); return p

def top_panel(d,i,kind,line):
    chip = 'FACE CAM: record this line' if kind=='fc' else 'VOICEOVER'
    a=tfile(d,f'{i}c',chip); b=tfile(d,f'{i}l','\n'.join(textwrap.wrap(line,30)))
    col = '0xFFD54A' if kind=='fc' else '0x7cc4ff'
    return (f"drawbox=x=0:y=0:w={W}:h={TOP}:color=0x17181c:t=fill,"
            f"drawtext=fontfile={FB}:textfile={a}:fontsize=30:fontcolor=0x111111:box=1:boxcolor={col}:boxborderw=12:x=48:y=56,"
            f"drawtext=fontfile={FS}:textfile={b}:fontsize=50:line_spacing=14:fontcolor=white:x=48:y=150")

def stamp(d,i,text,y):
    a=tfile(d,f'{i}s','\n'.join(textwrap.wrap(text,22)))
    return (f"drawtext=fontfile={FB}:textfile={a}:fontsize=66:fontcolor=white:box=1:boxcolor={CORAL}@0.92:boxborderw=22:"
            f"line_spacing=10:x=(w-tw)/2:y={y}")

ENC=['-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p','-r','30','-an']

def render(key, outdir):
    os.makedirs(outdir,exist_ok=True); segs=[]
    for i,b in enumerate(SHORTS[key]['beats']):
        kind,dur,line,ons,sfx=b[:5]; out=f'{outdir}/{i:02d}.mp4'
        if kind=='vo':
            ck,s,e=b[5:]; src,_,cw,ch,x,y=box(ck); s,e=t(s),t(e); sp=(e-s)/dur
            vf=(f"setpts=(PTS-STARTPTS)/{sp},crop={cw}:{ch}:{x}:{y},scale=1080:1152,pad={W}:{H}:0:{TOP}:color={BG},fps=30,"
                + top_panel(outdir,i,kind,line)+','+stamp(outdir,i,ons,TOP+1152-260))
            cmd=['ffmpeg','-v','error','-y','-ss',str(s),'-to',str(e),'-i',SRC[src],'-vf',vf,'-t',str(dur),*ENC,out]
        else:
            a=tfile(outdir,f'{i}k','\n'.join(textwrap.wrap(ons,16)))
            vf=(top_panel(outdir,i,kind,line)+','+
                f"drawtext=fontfile={FB}:textfile={a}:fontsize=96:line_spacing=18:fontcolor={CORAL}:x=(w-tw)/2:y={TOP}+(1152-th)/2")
            cmd=['ffmpeg','-v','error','-y','-f','lavfi','-i',f'color=c={BG}:s={W}x{H}:r=30:d={dur}','-vf',vf,*ENC,out]
        subprocess.run(cmd,check=True); segs.append(out)
    lst=f'{outdir}/list.txt'; open(lst,'w').write(''.join(f"file '{p}'\n" for p in segs))
    final=f'/home/user/AIwithKalyan/renders/free-claude-code-short-{key}-roughcut.mp4'
    subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',lst,'-c','copy','-movflags','+faststart',final],check=True)
    return final

def table(key):
    rows=['| # | Time | Shot | Line (VO / face cam) | On screen | SFX |','|---|---|---|---|---|---|']; tc=0.0
    for i,b in enumerate(SHORTS[key]['beats']):
        kind,dur,line,ons,sfx=b[:5]
        shot = '**Face cam** (close, eye-level)' if kind=='fc' else f'`{box(b[5])[0]}` {b[6]}–{b[7]}, crop **{b[5]}**'
        rows.append(f'| {i+1} | {tc:04.1f}–{tc+dur:04.1f}s | {shot} | {line} | **{ons}** | {sfx} |'); tc+=dur
    return '\n'.join(rows), tc

if __name__=='__main__':
    which = sys.argv[1:] or list(SHORTS)
    for k in which:
        print(k, render(k, os.path.dirname(os.path.abspath(__file__))+f'/seg{k}'))
