"""Part 3 (OmniRoute) HyperFrames scenes, timed to the narration. Face card sits bottom-left (x<540, y>690): keep it clear.
Usage: python3 edits/fcc_mg_build_p3.py fcc-part3"""
import json, re, sys
ROOT = '/home/user/AIwithKalyan'
PROJ = f'{ROOT}/compositions/fcc-part3-mg'
name = sys.argv[1] if len(sys.argv) > 1 else 'fcc-part3'
W = json.load(open(f'/tmp/fcc-style/{name}_words.json')); WORDS = W['words']
def tok(s): return re.sub(r'[^a-z0-9]', '', s.lower())
TOKS = [tok(w[3]) for w in WORDS]
def at(phrase, after=0.0):
    q = [tok(x) for x in phrase.split() if tok(x)]
    for i, w in enumerate(WORDS):
        if w[0] >= after - 0.05 and TOKS[i:i + len(q)] == q: return w[0]
    raise SystemExit(f'not found after {after}: {phrase!r}')
SCENES = []
def scene(sid, sp, ep, beats, html, js, after=0.0): SCENES.append((sid, sp, ep, beats, html, js, after))
PROVS = [('Kiro', '#ff9900'), ('Antigravity', '#4285f4'), ('NVIDIA', '#76b900'), ('Gemini', '#8e75b2')]
CSS_COMMON = """
.tank{position:absolute;width:250px;height:330px}
.tank .box{position:absolute;left:0;right:0;top:50px;bottom:0;border-radius:26px;border:4px solid #44444e;overflow:hidden;background:#17171c}
.tank .liq{position:absolute;left:0;right:0;bottom:0;height:100%}
.tank .nm{position:absolute;left:0;right:0;top:0;text-align:center;font-weight:900;font-size:32px}
.tank .lim{position:absolute;left:0;right:0;bottom:16px;text-align:center;font-weight:800;font-size:24px;color:#fff;z-index:2}
.node{position:absolute;border-radius:26px;background:#fff;color:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;
 gap:8px;font-weight:900;box-shadow:0 26px 60px rgba(0,0,0,.5)}
.node img{width:80px;height:80px}
.om{background:linear-gradient(135deg,#E53935,#b71c1c);color:#fff;box-shadow:0 0 90px rgba(229,57,53,.6)}
.dot{position:absolute;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 0 18px #fff}
.prw{position:absolute;left:600px;top:150px;width:1240px;border-radius:26px;background:#fff;color:#111;box-shadow:0 30px 80px rgba(0,0,0,.6);overflow:hidden}
.prw .bar{height:56px;background:#f3f3f3;display:flex;align-items:center;gap:10px;padding:0 0 0 22px;font-weight:600;font-size:21px;color:#333}
.prw .bar i{display:none}
.prw .bar .wc{margin-left:auto;display:flex;height:56px}
.prw .bar .wc b{width:66px;display:flex;align-items:center;justify-content:center;font-weight:400;font-size:22px;color:#444}
.prw .body{padding:34px 44px;font-weight:600;font-size:36px;line-height:1.55;min-height:300px}
.hl{background:#ffe0de;border-radius:8px;padding:0 6px}
"""

# ---- logos (inline SVG so they can be coloured and animated)
import re as _re
def _svg(name): return open(f'{PROJ}/logos/{name}.svg').read()
def LOGO(name, color, size=80, sw=2.2):
    s = _svg(name)
    if 'stroke="currentColor"' in s:          # lucide (stroke icon)
        s = s.replace('stroke="currentColor"', f'stroke="{color}"').replace('stroke-width="2"', f'stroke-width="{sw}"')
        s = _re.sub(r'width="\d+"', f'width="{size}"', s, 1); s = _re.sub(r'height="\d+"', f'height="{size}"', s, 1)
        return _re.sub(r'class="[^"]*"', '', s)
    d = _re.search(r' d="([^"]+)"', s).group(1)  # simple-icons (filled path)
    return f'<svg viewBox="0 0 24 24" width="{size}" height="{size}"><path fill="{color}" d="{d}"/></svg>'
BRAND = {'Kiro': ('ghost', '#9046ff'), 'Antigravity': ('orbit', '#4285f4'), 'NVIDIA': ('nvidia', '#76b900'), 'Gemini': ('googlegemini', '#8e75b2'),
         'Google': ('google', '#4285f4'), 'OpenRouter': ('route', '#7c3aed')}
def BL(n, size=80): return LOGO(BRAND[n][0], BRAND[n][1], size)
CLAUDE = '<img src="../icons/logo-claude.png" style="width:{0}px;height:{0}px">'
WAVE = lambda c, w: (f'<svg class="wave" width="{2*w}" height="40" viewBox="0 0 {2*w} 40" style="position:absolute;left:0;top:-30px">'
                     f'<path fill="{c}" d="M0 20 ' + ' '.join(f'Q {x+w/8} {6 if (x//(w//4))%2==0 else 34} {x+w/4} 20' for x in range(0, 2*w, w//4)) +
                     f' V 40 H 0 Z"/></svg>')

# ------------------------------------------------------------------ 1 the problem: three tanks drain; together + automatic switch = OmniRoute
TK = [('Google', 'some free requests'), ('NVIDIA', 'some free requests'), ('OpenRouter', '50 / day')]
TX = [660, 1080, 1500]
tanks = ''.join(f'''<div class="tk" id="tk{i}" style="left:{TX[i]}px"><div class="tlogo">{BL(n, 86)}</div><div class="tnm" style="color:{BRAND[n][1]}">{n}</div>
 <div class="tbox"><div class="liq" id="lq{i}" style="background:linear-gradient(180deg,{BRAND[n][1]},{BRAND[n][1]}66)">{WAVE(BRAND[n][1], 340)}</div>
 <div class="tnum" id="tn{i}">{'50' if i == 2 else '100%'}</div><div class="tlim">{l}</div>
 <div class="stamp" id="em{i}">EMPTY</div></div></div>''' for i, (n, l) in enumerate(TK))
scene('p3problem', 'So here is the problem', 'OmniRoute is a free open source app', dict(limit='has a limit', g='Google gives you', n='NVIDIA gives you',
      o='OpenRouter gives you', out='each one runs out fast', together='put them all together', what='And what if when one runs out',
      next='the next one simply takes over', om="that's exactly what OmniRoute does"), f"""<style>{CSS_COMMON}
.tk{{position:absolute;top:150px;width:340px;height:640px}}
.tlogo{{position:absolute;left:0;right:0;top:0;height:96px;display:flex;justify-content:center}}
.tnm{{position:absolute;left:0;right:0;top:100px;text-align:center;font-weight:900;font-size:38px}}
.tbox{{position:absolute;left:0;right:0;top:160px;height:470px;border-radius:34px;border:5px solid #3a3a44;overflow:hidden;background:#141418;box-shadow:0 30px 70px rgba(0,0,0,.6)}}
.liq{{position:absolute;left:0;right:0;bottom:0;height:88%}}
.tnum{{position:absolute;left:0;right:0;top:150px;text-align:center;font-weight:900;font-size:110px;color:#fff;z-index:3;text-shadow:0 6px 24px rgba(0,0,0,.6)}}
.tlim{{position:absolute;left:0;right:0;bottom:22px;text-align:center;font-weight:800;font-size:28px;color:#fff;z-index:3}}
.stamp{{position:absolute;left:30px;right:30px;top:180px;text-align:center;font-weight:900;font-size:64px;color:#ff4d47;border:7px solid #ff4d47;border-radius:16px;
 transform:rotate(-14deg);opacity:0;z-index:4;background:rgba(20,20,24,.75)}}
#lim{{position:absolute;left:630px;top:330px;width:1240px;height:0;border-top:6px dashed #ff4d47;opacity:0;z-index:5}}
#limt{{position:absolute;left:520px;top:312px;font-weight:900;font-size:30px;color:#ff4d47;opacity:0}}
#cc{{position:absolute;left:90px;top:250px;width:400px;height:300px;border-radius:30px;background:#fff;color:#111;display:flex;flex-direction:column;
 align-items:center;justify-content:center;gap:14px;font-weight:900;font-size:40px;box-shadow:0 30px 70px rgba(0,0,0,.55)}}
#ring{{position:absolute;left:190px;top:200px;width:200px;height:200px;border-radius:50%;border:4px solid rgba(229,57,53,.6);opacity:0}}
#pipe{{position:absolute;left:830px;top:880px;width:840px;height:22px;border-radius:11px;background:linear-gradient(90deg,#4285f4,#76b900,#7c3aed);
 box-shadow:0 0 30px rgba(124,58,237,.8);transform-origin:0 50%}}
#sum{{left:820px;top:940px;font-size:38px;opacity:0}}
#sw{{position:absolute;left:1240px;top:20px;opacity:0}}
#om{{position:absolute;left:880px;top:330px;width:720px;height:300px;border-radius:44px;background:linear-gradient(135deg,#E53935,#9d1c1a);display:flex;
 align-items:center;justify-content:center;gap:26px;font-weight:900;font-size:96px;color:#fff;box-shadow:0 0 140px rgba(229,57,53,.75);opacity:0;z-index:8}}
#shock{{position:absolute;left:1240px;top:480px;width:20px;height:20px;margin:-10px;border-radius:50%;border:8px solid #ff6a5a;opacity:0;z-index:7}}
</style>
<div class="hdr"><i></i>The problem</div>
<div id="ring"></div><div id="cc">{CLAUDE.format(110)}Claude Code</div>{tanks}
<div id="lim"></div><div id="limt">LIMIT</div>
<div id="pipe"></div><div id="sum" class="pill">∑ together: a lot of free AI</div>
<div id="sw">{LOGO('refresh-cw', '#fff', 90, 2.6)}</div>
<div id="shock"></div><div id="om">{LOGO('zap', '#fff', 120, 2.6)}OmniRoute</div>
""", """
const W=340; FX.loop(tl,DUR,t=>{document.querySelectorAll('.wave').forEach((w,i)=>gsap.set(w,{x:-((t*(90+i*25))%(W/2))*2}));
  gsap.set("#ring",{scale:1+((t*0.9)%1)*0.9,opacity:0.6*(1-((t*0.9)%1))}); gsap.set("#sw",{rotation:t*240});});
FX.pop(tl,"#cc",0.05); tl.set("#ring",{opacity:1},0.3);
tl.fromTo(".tk",{opacity:0,y:60},{opacity:0.22,y:0,duration:0.6,stagger:0.15,ease:"power3.out"},0.4);
[["#tk0",B.g],["#tk1",B.n],["#tk2",B.o]].forEach(([e,t])=>tl.fromTo(e,{opacity:0.22,scale:0.92},{opacity:1,scale:1,duration:0.45,ease:"back.out(2)",immediateRender:false},t-0.15));
tl.fromTo("#lim",{opacity:0,scaleX:0},{opacity:1,scaleX:1,duration:0.6,ease:"power3.out",transformOrigin:"0 50%"},B.limit); FX.pop(tl,"#limt",B.limit+0.4);
// each one runs out fast: requests drain every tank
const TXc=[830,1250,1670];
[0,1,2].forEach(i=>{FX.stream(tl,{from:[490,400],to:[TXc[i],560],t0:B.out-0.6,t1:B.out+1.8,rate:7,color:"#ffb199",arc:120,travel:0.6});
  tl.to("#lq"+i,{height:"0%",duration:1.2,ease:"power2.in"},B.out-0.3+i*0.12);
  tl.fromTo("#em"+i,{opacity:0,scale:2.2},{opacity:1,scale:1,duration:0.25,ease:"back.out(2.5)",immediateRender:false},B.out+0.95+i*0.12); FX.shake(tl,"#tk"+i,B.out+1.0+i*0.12);});
const cnt={a:100,b:50}; const setc=()=>{tn0.textContent=tn1.textContent=Math.round(cnt.a)+"%"; tn2.textContent=Math.round(cnt.b);};
const tn0=document.getElementById('tn0'),tn1=document.getElementById('tn1'),tn2=document.getElementById('tn2');
tl.fromTo(cnt,{a:100,b:50},{a:0,b:0,duration:1.2,ease:"power2.in",onUpdate:setc},B.out-0.3);
tl.to(cnt,{a:100,b:50,duration:0.8,ease:"power2.out",onUpdate:setc},B.together);
// together: refill, slide closer, one pipe
tl.to(".stamp",{opacity:0,duration:0.25},B.together+0.05); tl.to(["#lq0","#lq1","#lq2"],{height:"88%",duration:0.8,ease:"power2.out"},B.together);
tl.to("#tk0",{x:80,duration:0.6,ease:"power3.inOut"},B.together); tl.to("#tk2",{x:-80,duration:0.6,ease:"power3.inOut"},B.together);
tl.fromTo("#pipe",{scaleX:0},{scaleX:1,duration:0.7,ease:"power3.out"},B.together+0.4); tl.set("#pipe",{scaleX:0},0); FX.pop(tl,"#sum",B.together+0.8); tl.to(["#lim","#limt"],{opacity:0,duration:0.3},B.together);
// when one runs out, the next one takes over
FX.stream(tl,{from:[490,400],to:t=>t<B.next+0.4?[910,560]:[1250,560],t0:B.what,t1:B.om-0.2,rate:8,color:"#ffffff",arc:140,travel:0.6});
tl.to("#lq0",{height:"0%",duration:Math.max(0.6,B.next+0.3-B.what),ease:"none"},B.what); tl.fromTo("#em0",{opacity:0,scale:2.2},{opacity:1,scale:1,duration:0.25,ease:"back.out(2.5)",immediateRender:false},B.next+0.2);
tl.to("#lq1",{height:"55%",duration:Math.max(0.8,B.om-B.next-0.4),ease:"none"},B.next+0.4);
tl.fromTo("#sw",{opacity:0,scale:0.3},{opacity:1,scale:1,duration:0.4,ease:"back.out(2)"},B.next); FX.out(tl,"#sw",B.om-0.3);
tl.to("#tk1",{scale:1.05,duration:0.25,yoyo:true,repeat:1},B.next+0.4); FX.out(tl,"#sum",B.next);
// OmniRoute
tl.to(".tk",{scale:0.8,opacity:0.25,duration:0.4},B.om-0.1); tl.to("#pipe",{opacity:0.3,duration:0.3},B.om);
tl.fromTo("#om",{opacity:0,scale:0.3},{opacity:1,scale:1,duration:0.5,ease:"back.out(2.2)"},B.om);
tl.fromTo("#shock",{opacity:1,scale:1},{opacity:0,scale:90,duration:0.9,ease:"power2.out",immediateRender:false},B.om+0.1);
""")

# ------------------------------------------------------------------ 2 what OmniRoute is: sits in the middle, routes every request
provs = ''.join(f'<div class="node" id="pv{i}" style="left:1540px;top:{150 + i * 170}px;width:320px;height:140px;font-size:32px;border:5px solid {c};flex-direction:row;gap:16px">{BL(n, 60)}{n}</div>'
                for i, (n, c) in enumerate(PROVS))
scene('p3what', 'OmniRoute is a free open source app', 'And we install it with one rule', dict(gh='free open source app', lap='on your own computer',
      mid='sits in the middle', only='talks only to OmniRoute', decides='decides which AI provider', thinks='thinks it\'s talking to one AI',
      juggling='juggling many'), f"""<style>{CSS_COMMON}
#gh{{position:absolute;left:640px;top:150px}}
#cc{{left:620px;top:350px;width:300px;height:200px;font-size:36px}} #omn{{left:1060px;top:330px;width:360px;height:240px;font-size:46px}}
.ln{{position:absolute;height:6px;background:#555;transform-origin:0 50%}}
#mask{{position:absolute;left:1040px;top:120px;width:860px;height:720px;border-radius:30px;background:rgba(16,16,18,.92);opacity:0;display:flex;align-items:center;
 justify-content:center;font-weight:900;font-size:120px;color:#E53935}}
</style>
<div class="hdr"><i></i>What is OmniRoute?</div>
<div id="gh" class="pill" style="font-size:36px">🐙 free · open source · on GitHub</div>
<div class="node" id="cc"><img src="../icons/logo-claude.png">Claude Code</div>
<div class="ln" id="l0" style="left:920px;top:450px;width:140px"></div>
<div class="node om" id="omn">⚡ OmniRoute<div style="font-size:22px;font-weight:700;opacity:.85">on your computer</div></div>
{''.join(f'<div class="ln" id="lp{i}" style="left:1420px;top:450px;width:{[180,150,150,180][i]}px;transform:rotate({[-36,-12,12,36][i]}deg)"></div>' for i in range(4))}
{provs}<div class="dot" id="d0" style="left:640px;top:440px;opacity:0"></div>
<div id="mask">?</div>
""", """
FX.pop(tl,"#gh",B.gh); FX.pop(tl,"#cc",B.lap-0.3); FX.pop(tl,"#omn",B.mid-0.2); tl.fromTo("#l0",{scaleX:0},{scaleX:1,duration:0.4},B.mid);
[0,1,2,3].forEach(i=>{tl.fromTo("#lp"+i,{scaleX:0},{scaleX:1,duration:0.3},B.decides+i*0.12); FX.pop(tl,"#pv"+i,B.decides+i*0.12);});
const route=(t,i)=>{tl.fromTo("#d0",{opacity:1,x:0,y:0},{opacity:1,x:480,y:0,duration:0.5,ease:"power2.in",immediateRender:false},t);
  tl.to("#d0",{x:900,y:[-290,-120,50,220][i],duration:0.5,ease:"power2.out"},t+0.5); tl.to("#pv"+i,{scale:1.12,duration:0.15,yoyo:true,repeat:1},t+1.0);
  tl.to("#d0",{opacity:0,duration:0.1},t+1.05);};
route(B.only,0); route(B.decides+0.8,2); route(B.thinks,1); route(B.juggling,3);
tl.to("#mask",{opacity:1,duration:0.3},B.thinks+0.2); tl.to("#mask",{opacity:0,duration:0.4},B.juggling-0.1);
""")

# ------------------------------------------------------------------ 3 install with one prompt
P_INSTALL = ("Check whether Claude Code is installed and install it if not. Then install OmniRoute from GitHub, start it, "
             "and open the dashboard in my browser. If any step fails, fix it and keep going.")
scene('p3prompt', 'I open Antigravity and give it one prompt', "When it's done, it gives me", dict(kit="it's in the setup kit",
      says='Check whether Claude Code', then='install OmniRoute from GitHub', fails='if any step fails'), f"""<style>{CSS_COMMON}</style>
<div class="hdr"><i></i>Install with one prompt</div>
<div class="prw" id="pw"><div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i>
 <span>Antigravity · new conversation</span><span class="wc"><b>─</b><b>☐</b><b>✕</b></span></div><div class="body" id="pt"></div></div>
<div id="kit" class="pill" style="left:640px;top:720px;font-size:34px">📦 Exact prompt in the setup kit</div>
""", """
FX.rise(tl,"#pw",0.05); FX.pop(tl,"#kit",B.kit);
const txt=%s; const o={n:0}; const el=document.getElementById('pt');
const HL=['Claude Code is installed','install OmniRoute from GitHub','open the dashboard','fix it and keep going'];
tl.fromTo(o,{n:0},{n:txt.length,duration:(B.fails+3.0-B.says),ease:"none",onUpdate:()=>{let s=txt.slice(0,Math.round(o.n));
  HL.forEach(h=>{s=s.replace(h,'<span class="hl">'+h+'</span>');}); el.innerHTML=s+'<span style="color:#E53935">▍</span>';}},B.says);
""" % json.dumps(P_INSTALL))

# ------------------------------------------------------------------ 4 combo = one team: scattered small players -> ordered relay; #1 fails, #2 takes over
SC = [(620, 190, -8), (1240, 150, 7), (760, 520, 5), (1260, 560, -6)]       # scattered start spots
ROWY = [250, 420, 590, 760]
rows = ''.join(f'''<div class="crow" id="cr{i}" style="left:{SC[i][0]}px;top:{SC[i][1]}px"><div class="cn" id="cn{i}">{i+1}</div>
 <div class="clg">{BL(n, 74)}</div><div class="cnm">{n}</div><div class="cst" id="cs{i}">small</div></div>''' for i, n in enumerate(['Gemini', 'Kiro', 'NVIDIA', 'Antigravity']))
scene('p3team', 'Now one by one, they are small', 'Go to Combos, click Create', dict(small='they are small', team='work as one team', combo='called Combo',
      list='a list of models in an order', first='The first one answers', busy="if it's busy", credits='out of free credits', failing='or failing',
      next='the next one takes over'), f"""<style>{CSS_COMMON}
#box{{position:absolute;left:1000px;top:150px;width:840px;height:820px;border-radius:40px;border:4px solid rgba(229,57,53,.0);background:rgba(27,27,32,0);}}
#bt{{position:absolute;left:1040px;top:168px;font-weight:900;font-size:44px;opacity:0;display:flex;gap:16px;align-items:center}}
.crow{{position:absolute;width:640px;height:140px;border-radius:30px;background:#fff;color:#111;display:flex;align-items:center;gap:26px;padding:0 30px;
 box-sizing:border-box;box-shadow:0 26px 60px rgba(0,0,0,.55);z-index:3}}
.cn{{width:70px;height:70px;border-radius:50%;background:#E53935;color:#fff;font-weight:900;font-size:40px;display:flex;align-items:center;justify-content:center;opacity:0}}
.cnm{{font-weight:900;font-size:44px;flex:1}}
.cst{{font-weight:800;font-size:26px;padding:10px 20px;border-radius:999px;background:#eee;color:#777}}
#chain{{position:absolute;left:1115px;top:320px;width:8px;height:0;background:linear-gradient(#E53935,#ff8a75);border-radius:4px;z-index:2;box-shadow:0 0 20px #E53935}}
#cc{{position:absolute;left:110px;top:230px;width:380px;height:280px;border-radius:30px;background:#fff;color:#111;display:flex;flex-direction:column;
 align-items:center;justify-content:center;gap:12px;font-weight:900;font-size:38px;box-shadow:0 30px 70px rgba(0,0,0,.55);opacity:0}}
#auto{{left:1080px;top:950px;font-size:36px;opacity:0}}
#ar{{position:absolute;left:1070px;top:880px;opacity:0}}
</style>
<div class="hdr"><i></i>A combo = one team</div>
<div id="box"></div><div id="bt">{LOGO('users', '#E53935', 54, 2.6)}<span>Combo · <span class="red">"claude"</span></span></div>
<div id="chain"></div>{rows}
<div id="cc">{CLAUDE.format(100)}Claude Code</div>
<div id="auto" class="pill red">{LOGO('refresh-cw', '#fff', 44, 2.6)} takes over automatically</div>
""", """
const SCX=%s, ROWY=%s;
FX.loop(tl,DUR,t=>{[0,1,2,3].forEach(i=>{ if(t<B.team) gsap.set("#cr"+i,{rotation:SCX[i][2]+Math.sin(t*2.2+i)*3}); });});
[0,1,2,3].forEach(i=>tl.fromTo("#cr"+i,{opacity:0,scale:0.2},{opacity:1,scale:0.62,duration:0.45,ease:"back.out(2)"},B.small-0.6+i*0.15));
// one team: fly into an ordered list inside the combo box
tl.to("#box",{borderColor:"rgba(229,57,53,.9)",backgroundColor:"rgba(27,27,32,.85)",duration:0.4},B.team);
[0,1,2,3].forEach(i=>tl.to("#cr"+i,{x:1100-SCX[i][0],y:ROWY[i]-SCX[i][1],rotation:0,scale:1,duration:0.7,ease:"power3.inOut"},B.team+0.1+i*0.08));
tl.to(".cst",{opacity:0,duration:0.2},B.team);
FX.pop(tl,"#bt",B.combo); tl.to("#box",{boxShadow:"0 0 120px rgba(229,57,53,.55)",duration:0.5},B.combo);
tl.to("#chain",{height:540,duration:0.8,ease:"power2.out"},B.list);
[0,1,2,3].forEach(i=>tl.fromTo("#cn"+i,{opacity:0,scale:0.2},{opacity:1,scale:1,duration:0.35,ease:"back.out(2.5)"},B.list+0.15+i*0.18));
// request from Claude Code -> #1
FX.pop(tl,"#cc",B.first-0.6);
FX.stream(tl,{from:[490,370],to:t=>t<B.next+0.2?[1120,320]:[1120,490],t0:B.first-0.3,t1:DUR-0.4,rate:7,color:"#ffb199",arc:90,travel:0.55});
const ST=[[B.first,0,"answering","#d7f5e3","#13803f"],[B.busy,0,"busy","#fff2c7","#9a6b00"],[B.credits,0,"out of free credits","#ffe1cc","#b4500e"],
  [B.failing,0,"failing ✕","#ffd9d7","#c62828"],[B.next+0.2,1,"takes over ✓","#d7f5e3","#13803f"]];
FX.loop(tl,DUR,t=>{[0,1].forEach(i=>{let cur=null; ST.forEach(s=>{if(s[1]===i&&t>=s[0]) cur=s;}); const el=document.getElementById("cs"+i);
  if(cur){el.textContent=cur[2]; el.style.backgroundColor=cur[3]; el.style.color=cur[4]; el.style.opacity=1;
    const u=Math.min(1,(t-cur[0])/0.25); el.style.transform="scale("+(0.6+0.4*u)+")";} });});
tl.to("#cr0",{boxShadow:"0 0 60px rgba(46,204,113,.8)",duration:0.3},B.first); tl.fromTo("#cr0",{rotation:0},{keyframes:[{rotation:-3},{rotation:3},{rotation:-2},{rotation:1.5},{rotation:0}],duration:0.5,ease:"none",immediateRender:false},B.busy);
tl.to("#cr0",{opacity:0.45,boxShadow:"0 0 0 rgba(0,0,0,0)",duration:0.3},B.failing+0.2);
tl.to("#cr1",{scale:1.05,boxShadow:"0 0 70px rgba(46,204,113,.85)",duration:0.3},B.next+0.2);
FX.pop(tl,"#auto",B.next+0.6);
""" % (json.dumps(SC), json.dumps(ROWY)))

# ------------------------------------------------------------------ 5 one key: Claude Code only shows the OmniRoute key; the vault holds the provider keys
vk = ''.join(f'<div class="vk" id="vk{i}" style="top:{190 + i * 175}px">{BL(n, 64)}<span>{n} key</span>{LOGO("lock", "#888", 40)}</div>'
             for i, n in enumerate(['Kiro', 'Antigravity', 'NVIDIA', 'Gemini']))
scene('p3key', 'Now Claude Code needs one key', 'In the dashboard, open API keys', dict(one='needs one key', omk='the OmniRoute API key',
      pw="OmniRoute's own password", shows='shows this key to OmniRoute', behind='behind the scenes'), f"""<style>{CSS_COMMON}
#cc{{position:absolute;left:100px;top:220px;width:380px;height:280px;border-radius:30px;background:#fff;color:#111;display:flex;flex-direction:column;
 align-items:center;justify-content:center;gap:12px;font-weight:900;font-size:38px;box-shadow:0 30px 70px rgba(0,0,0,.55)}}
#vault{{position:absolute;left:760px;top:260px;width:460px;height:460px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ef5350,#8e1a18);
 box-shadow:0 0 140px rgba(229,57,53,.6);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:46px;gap:8px}}
#dial{{position:absolute;left:720px;top:220px;width:540px;height:540px;border-radius:50%;border:10px dashed rgba(255,255,255,.35)}}
#key{{position:absolute;left:180px;top:560px;opacity:0;filter:drop-shadow(0 0 30px #ffcc33)}}
#ktag{{left:520px;top:600px;font-size:30px;opacity:0}}
#pw{{left:760px;top:790px;font-size:32px;opacity:0}}
.vk{{position:absolute;left:1400px;width:440px;height:130px;border-radius:26px;background:#fff;color:#111;display:flex;align-items:center;gap:20px;padding:0 26px;
 box-sizing:border-box;font-weight:900;font-size:34px;box-shadow:0 22px 50px rgba(0,0,0,.5);opacity:0}}
.vk span{{flex:1}}
.vl{{position:absolute;left:1220px;height:5px;background:linear-gradient(90deg,#E53935,#ffb199);transform-origin:0 50%;transform:scaleX(0);z-index:1}}
</style>
<div class="hdr"><i></i>One key for everything</div>
<div id="cc">{CLAUDE.format(100)}Claude Code</div>
<div id="dial"></div><div id="vault">{LOGO('vault', '#fff', 110, 2)}OmniRoute</div>
{vk}
<div id="key">{LOGO('key-round', '#ffcc33', 150, 2.4)}</div>
<div id="ktag" class="pill red">1 OmniRoute API key</div>
<div id="pw" class="pill">{LOGO('lock', '#111', 40)} OmniRoute's own password</div>
""", """
FX.loop(tl,DUR,t=>{gsap.set("#dial",{rotation:t*25}); gsap.set("#key",{rotation:Math.sin(t*2)*8});});
FX.pop(tl,"#cc",0.05); FX.pop(tl,"#vault",B.one-0.4); tl.fromTo("#dial",{opacity:0},{opacity:1,duration:0.4},B.one-0.4);
tl.fromTo("#key",{opacity:0,scale:0.2,y:40},{opacity:1,scale:1,y:0,duration:0.5,ease:"back.out(2)"},B.one);
FX.pop(tl,"#ktag",B.omk); FX.pop(tl,"#pw",B.pw);
tl.to("#key",{x:720,y:-250,scale:0.7,duration:0.9,ease:"power2.inOut"},B.shows); FX.out(tl,"#ktag",B.shows);
tl.to("#key",{opacity:0,duration:0.2},B.shows+0.9); tl.to("#vault",{scale:1.1,duration:0.2,yoyo:true,repeat:1},B.shows+0.9);
tl.to("#dial",{borderColor:"rgba(46,204,113,.8)",duration:0.3},B.shows+1.0);
[0,1,2,3].forEach(i=>{FX.stream(tl,{from:[1225,490],to:[1420,255+i*175],t0:B.behind-0.5+i*0.15,t1:DUR-0.2,rate:2.5,color:"#ffb199",travel:0.5,size:12}); FX.slide(tl,"#vk"+i,B.behind-0.9+i*0.15,{x:160});});
""")

# ------------------------------------------------------------------ 6 shortcuts prompt -> two desktop icons
P_SC = ('Make two shortcuts on my desktop. The first is "Free Claude Code": it makes sure OmniRoute is running, opens a terminal in my work '
        'folder and runs: omniroute run claude --model claude. The second is "OmniRoute Dashboard", which opens the control panel.')
scene('p3shortcut', "Now, I don't want to type commands", 'And one important safety tip', dict(prompt='Make two shortcuts', first='The first is free Claude Code',
      launch='And launches Claude Code', second='The second shortcut'), f"""<style>{CSS_COMMON}
.ic{{position:absolute;top:720px;width:200px;text-align:center;font-weight:800;font-size:26px}}
.ic div{{width:140px;height:140px;margin:0 auto 10px;border-radius:32px;display:flex;align-items:center;justify-content:center;font-size:70px;box-shadow:0 20px 40px rgba(0,0,0,.5)}}
</style>
<div class="hdr"><i></i>Two desktop shortcuts</div>
<div class="prw" id="pw" style="top:120px"><div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i>
 <span>Antigravity · new conversation</span><span class="wc"><b>─</b><b>☐</b><b>✕</b></span></div><div class="body" id="pt" style="font-size:32px"></div></div>
<div class="ic" id="i1" style="left:900px"><div style="background:linear-gradient(135deg,#D97757,#E53935)">✻</div>Free Claude Code</div>
<div class="ic" id="i2" style="left:1200px"><div style="background:linear-gradient(135deg,#333,#111)">⚡</div>OmniRoute Dashboard</div>
""", """
FX.rise(tl,"#pw",0.05);
const txt=%s; const o={n:0}; const el=document.getElementById('pt');
const HL=['Free Claude Code','omniroute run claude --model claude','OmniRoute Dashboard'];
tl.fromTo(o,{n:0},{n:txt.length,duration:(B.second+2.5-B.prompt),ease:"none",onUpdate:()=>{let s=txt.slice(0,Math.round(o.n));
  HL.forEach(h=>{s=s.replace(h,'<span class="hl">'+h+'</span>');}); el.innerHTML=s+'<span style="color:#E53935">▍</span>';}},B.prompt);
tl.fromTo("#i1",{opacity:0,y:60},{opacity:1,y:0,duration:0.5,ease:"back.out(1.8)"},B.first);
tl.fromTo("#i2",{opacity:0,y:60},{opacity:1,y:0,duration:0.5,ease:"back.out(1.8)"},B.second);
""" % json.dumps(P_SC))

# ------------------------------------------------------------------ 7 key safety: never paste a key into a chat
scene('p3safe', 'And one important safety tip', 'And then one last fix', dict(ask='ask for your OmniRoute key', dont="Don't paste the key into the chat",
      file='Ask it to open a file', cont='type continue', never='never sits in a chat history'), f"""<style>{CSS_COMMON}
#chat{{position:absolute;left:640px;top:180px;width:560px;height:440px;border-radius:26px;background:#1b1b20;border:2px solid #2c2c34;padding:26px;box-sizing:border-box}}
.bb{{border-radius:18px;padding:14px 20px;font-weight:700;font-size:26px;margin-bottom:16px;max-width:420px}}
#xx{{position:absolute;left:640px;top:180px;width:560px;height:440px;opacity:0}}
#file{{position:absolute;left:1300px;top:200px;width:420px;height:400px;border-radius:20px;background:#fff;color:#111;padding:26px;box-sizing:border-box;font-family:"JBMono",monospace;font-size:24px}}
</style>
<div class="hdr"><i></i>Safety tip</div>
<div id="chat"><div class="bb" style="background:#2c2c34">Antigravity: I need your OmniRoute key…</div>
 <div class="bb" id="bad" style="background:#E53935;margin-left:auto">sk-omni-••••••••••</div></div>
<svg id="xx" viewBox="0 0 560 440"><line x1="30" y1="30" x2="530" y2="410" stroke="#E53935" stroke-width="18" stroke-linecap="round"/>
 <line x1="530" y1="30" x2="30" y2="410" stroke="#E53935" stroke-width="18" stroke-linecap="round"/></svg>
<div id="file"><div style="font-family:Inter;font-weight:900;font-size:28px;margin-bottom:16px">📄 omniroute-key.txt</div><div id="fk">&nbsp;</div></div>
<div id="cont" class="pill" style="left:1300px;top:640px;font-size:34px">↵ type "continue"</div>
<div id="nv" class="pill red" style="left:640px;top:700px;font-size:34px">🔒 never in a chat history</div>
""", """
FX.rise(tl,"#chat",0.05); tl.fromTo("#bad",{opacity:0,y:20},{opacity:1,y:0,duration:0.3},B.ask+0.6);
tl.to("#xx",{opacity:1,duration:0.25},B.dont); FX.rise(tl,"#file",B.file);
FX.type(tl,"#fk","sk-omni-••••••••••",B.file+0.8,14); FX.pop(tl,"#cont",B.cont); FX.pop(tl,"#nv",B.never);
""")

# ------------------------------------------------------------------ 8 hide paid models
rows = [('claude (combo)', 'FREE', 1), ('gemini-2.5-flash', 'FREE', 1), ('claude-opus-4', '$$$', 0), ('nemotron-nano', 'FREE', 1), ('gpt-5', '$$$', 0),
        ('gemini-2.5-pro', '$$$', 0)]
rh = ''.join(f'<div class="mr {"paid" if not f else ""}" id="mr{i}"><span>{n}</span><b style="color:{"#2ecc71" if f else "#E53935"}">{p}</b></div>'
             for i, (n, p, f) in enumerate(rows))
scene('p3paid', 'And then one last fix', "that's exactly what happened", dict(menu='its model menu can show every model', paid='including paid ones',
      acc='pick a paid one by accident', bill='or worse, a bill', prompt='So I gave Antigravity one more prompt', hide='hide paid models', default='keep my Claude combo'), f"""<style>{CSS_COMMON}
#menu{{position:absolute;left:640px;top:150px;width:760px;border-radius:24px;background:#0f0f13;border:2px solid #2c2c34;padding:22px;box-sizing:border-box;font-family:"JBMono",monospace}}
.mr{{display:flex;justify-content:space-between;font-size:30px;padding:12px 16px;border-radius:10px;color:#ddd}}
#tg{{position:absolute;left:1460px;top:230px;width:380px;height:200px;border-radius:24px;background:#1b1b20;border:2px solid #2c2c34;padding:26px;box-sizing:border-box;font-weight:800;font-size:28px}}
#sw{{width:110px;height:56px;border-radius:28px;background:#444;margin-top:20px;position:relative}} #kn{{position:absolute;left:6px;top:6px;width:44px;height:44px;border-radius:50%;background:#fff}}
</style>
<div class="hdr"><i></i>Hide paid models</div>
<div id="menu"><div style="color:#888;font-size:22px;margin-bottom:8px">/model</div>{rh}</div>
<div id="tg">Hide paid models<div id="sw"><div id="kn"></div></div></div>
<div id="warn" class="pill red" style="left:1440px;top:500px;font-size:34px">⚠ errors · or a bill</div>
<div id="def" class="pill" style="left:1440px;top:620px;font-size:32px">★ default: claude combo</div>
""", """
FX.rise(tl,"#menu",B.menu-0.3); tl.fromTo(".mr",{opacity:0,x:-30},{opacity:1,x:0,duration:0.25,stagger:0.08},B.menu);
tl.to(".mr.paid",{backgroundColor:"rgba(229,57,53,.22)",duration:0.3},B.paid); FX.pop(tl,"#warn",B.bill-0.4);
FX.pop(tl,"#tg",B.prompt); tl.to("#sw",{backgroundColor:"#2ecc71",duration:0.2},B.hide); tl.to("#kn",{x:54,duration:0.25,ease:"back.out(2)"},B.hide);
tl.to(".mr.paid",{height:0,padding:0,opacity:0,duration:0.5,stagger:0.1},B.hide+0.3); FX.out(tl,"#warn",B.hide+0.3);
tl.to("#mr0",{backgroundColor:"rgba(46,204,113,.2)",duration:0.3},B.default); FX.pop(tl,"#def",B.default);
""")

# ------------------------------------------------------------------ 10 the switch: live log feed, Claude (Kiro) until the limit, then NVIDIA by itself
scene('p3switch', 'And here is the coolest part', "Now, honestly, the first version didn't work", dict(logs='Straight from the logs', planning='did the planning',
      ran='free limit ran out', nv='switched by itself to free NVIDIA', kept='it kept building', touch="I didn't touch anything", point='the whole point of a combo'),
      f"""<style>{CSS_COMMON}
#feed{{position:absolute;left:620px;top:140px;width:1240px;height:640px;border-radius:30px;background:#0f0f13;border:2px solid #2c2c34;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.6)}}
#fh{{position:absolute;left:0;right:0;top:0;height:70px;background:#1b1b20;display:flex;align-items:center;gap:16px;padding:0 28px;font-weight:800;font-size:28px;color:#bbb}}
#rows{{position:absolute;left:0;right:0;top:80px}}
.lr{{position:absolute;left:24px;right:24px;height:74px;border-radius:14px;display:flex;align-items:center;gap:22px;padding:0 20px;font-family:"JBMono",monospace;font-size:28px;color:#ddd;background:#17171c}}
.lr b{{padding:6px 14px;border-radius:8px;font-family:Inter;font-weight:900;font-size:24px}}
#lim{{left:1260px;top:820px;font-size:34px;opacity:0}}
#sw{{left:640px;top:820px;font-size:34px;opacity:0}}
#hand{{left:1100px;top:930px;font-size:34px;opacity:0}}
#rec{{width:16px;height:16px;border-radius:50%;background:#ff4d47}}
</style>
<div class="hdr"><i></i>Straight from the logs</div>
<div id="feed"><div id="fh"><div id="rec"></div>OmniRoute · request log · combo "claude"</div><div id="rows"></div></div>
<div id="lim" class="pill red">{LOGO('hourglass', '#fff', 40)} Kiro free limit reached</div>
<div id="sw" class="pill">{LOGO('refresh-cw', '#111', 40)} switched to NVIDIA by itself</div>
<div id="hand" class="pill red">{LOGO('hand', '#fff', 40)} I didn't touch anything</div>
""", """
const rows=document.getElementById('rows'); const N=16; const els=[];
const KIRO=%s, NV=%s;
for(let i=0;i<N;i++){const r=document.createElement('div'); r.className='lr'; rows.appendChild(r); els.push(r);}
// row i appears at time T[i]; content depends on which provider was answering then
const T=[]; for(let i=0;i<N;i++) T.push(0.4+i*((DUR-0.6)/N));
const sw=B.nv;
els.forEach((r,i)=>{const t=T[i]; const lim=(t>=B.ran-0.4&&t<sw); const nv=t>=sw;
  r.innerHTML= lim ? '<b style="background:#ff4d47;color:#fff">LIMIT</b><span style="flex:1">claude-sonnet-4.5</span>'+KIRO+'<span>Kiro</span>'
    : nv ? '<b style="background:#2ecc71;color:#08311a">200</b><span style="flex:1">nemotron</span>'+NV+'<span>NVIDIA</span>'
         : '<b style="background:#2ecc71;color:#08311a">200</b><span style="flex:1">claude-sonnet-4.5</span>'+KIRO+'<span>Kiro</span>';
  if(lim) r.style.background='rgba(229,57,53,.25)'; if(nv) r.style.background='rgba(118,185,0,.16)';
  gsap.set(r,{opacity:0});});
FX.loop(tl,DUR,t=>{let k=0; for(let i=N-1;i>=0;i--){const r=els[i]; if(t<T[i]){gsap.set(r,{opacity:0}); continue;}
    const u=Math.min(1,(t-T[i])/0.35); gsap.set(r,{opacity:k<7?u:0,y:k*82+(1-u)*-40}); k++;}
  gsap.set("#rec",{opacity:0.4+0.6*Math.abs(Math.sin(t*3))});});
FX.rise(tl,"#feed",0.05); FX.pop(tl,"#lim",B.ran); FX.out(tl,"#lim",B.nv);
FX.pop(tl,"#sw",B.nv+0.2); tl.to("#feed",{boxShadow:"0 0 90px rgba(118,185,0,.55)",duration:0.4},B.nv+0.2);
FX.pop(tl,"#hand",B.touch); FX.pulse(tl,"#sw",B.point,1);
""" % (json.dumps(LOGO('ghost', '#9046ff', 40)), json.dumps(LOGO('nvidia', '#76b900', 40))))

out = []
for sid, sp, ep, beats, html, js, after in SCENES:
    t0 = at(sp, after) - 0.05; t1 = at(ep, t0 + 0.5) - 0.05; dur = round(t1 - t0, 3)
    B = {k: round(max(0.05, at(v, t0) - t0), 3) for k, v in beats.items()}
    doc = f'''<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=1920, height=1080">
<link rel="stylesheet" href="../lib.css"><script src="../vendor/gsap.min.js"></script><script src="../lib.js"></script></head>
<body><div id="root" data-composition-id="{sid}" data-start="0" data-width="1920" data-height="1080" data-duration="{dur}">
<section id="{sid}-scene" class="clip" data-start="0" data-duration="{dur}" style="position:absolute;inset:0"><div class="bg"></div>
{html}
</section></div>
<script>
const B = {json.dumps(B)}; const DUR = {dur};
const tl = gsap.timeline({{ paused: true }});
{js}
FX.ambient(tl, {dur});
window.__timelines["{sid}"] = tl;
</script></body></html>
'''
    open(f'{PROJ}/compositions/{sid}.html', 'w').write(doc)
    out.append(dict(id=sid, start=round(t0, 3), end=round(t1, 3), dur=dur))
    print(f'{sid:12s} {t0:7.2f} → {t1:7.2f}  ({dur:.1f}s)')
json.dump(out, open(f'{PROJ}/scenes.json', 'w'), indent=1)
