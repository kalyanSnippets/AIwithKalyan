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
.prw .bar{height:60px;background:#f1f1f4;display:flex;align-items:center;gap:10px;padding:0 22px;font-weight:700;font-size:22px;color:#666}
.prw .bar i{width:14px;height:14px;border-radius:50%;display:block}
.prw .body{padding:34px 44px;font-weight:600;font-size:36px;line-height:1.55;min-height:300px}
.hl{background:#ffe0de;border-radius:8px;padding:0 6px}
"""

# ------------------------------------------------------------------ 1 the problem: every free provider runs out -> chain them
tanks = ''.join(f'<div class="tank" id="tk{i}" style="left:{640 + i * 400}px;top:220px"><div class="nm" style="color:{c}">{n}</div>'
                f'<div class="box"><div class="liq" id="lq{i}" style="background:linear-gradient(180deg,{c},{c}88)"></div><div class="lim">{l}</div></div></div>'
                for i, (n, c, l) in enumerate([('Google', '#4285f4', 'some free requests'), ('NVIDIA', '#76b900', 'some free requests'),
                                               ('OpenRouter', '#7c3aed', '50 / day')]))
scene('p3problem', 'So here is the problem', 'OmniRoute is a free open source app', dict(limit='has a limit', g='Google gives you', n='NVIDIA gives you',
      o='OpenRouter gives you', out='each one runs out fast', together='put them all together', what='And what if when one runs out',
      next='the next one simply takes over', om="that's exactly what OmniRoute does"), f"""<style>{CSS_COMMON}
#pipe{{position:absolute;left:640px;top:620px;width:1100px;height:26px;border-radius:13px;background:#2a2a32;opacity:0}}
#flow{{position:absolute;left:640px;top:620px;width:0;height:26px;border-radius:13px;background:linear-gradient(90deg,#4285f4,#76b900,#7c3aed);box-shadow:0 0 30px #7c3aed}}
#omb{{position:absolute;left:900px;top:700px;opacity:0}}
</style>
<div class="hdr"><i></i>The problem</div>{tanks}
<div id="pipe"></div><div id="flow"></div>
<div id="omb" class="pill red" style="font-size:52px">⚡ OmniRoute</div>
""", """
FX.pop(tl,"#tk0",B.g-0.1); FX.pop(tl,"#tk1",B.n-0.1); FX.pop(tl,"#tk2",B.o-0.1);
[0,1,2].forEach(i=>tl.to("#lq"+i,{height:"6%",duration:1.6,ease:"power2.in"},B.out+i*0.25));
[0,1,2].forEach(i=>tl.to("#tk"+i,{x:-10,duration:0.06,yoyo:true,repeat:5},B.out+1.6+i*0.25));
tl.to("#pipe",{opacity:1,duration:0.3},B.together); [0,1,2].forEach(i=>tl.to("#lq"+i,{height:"100%",duration:0.6},B.together+0.1));
tl.to("#flow",{width:"1100px",duration:1.0,ease:"power2.inOut"},B.together+0.3);
tl.to("#lq0",{height:"0%",duration:1.2,ease:"none"},B.what); tl.to("#tk1",{scale:1.08,duration:0.3,yoyo:true,repeat:1},B.next);
tl.to("#lq1",{height:"40%",duration:1.4,ease:"none"},B.next+0.4);
tl.fromTo("#omb",{opacity:0,scale:0.4},{opacity:1,scale:1,duration:0.5,ease:"back.out(2)"},B.om);
""")

# ------------------------------------------------------------------ 2 what OmniRoute is: sits in the middle, routes every request
provs = ''.join(f'<div class="node" id="pv{i}" style="left:1560px;top:{150 + i * 170}px;width:280px;height:130px;font-size:32px;border:5px solid {c}">{n}</div>'
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
const route=(t,i)=>{tl.fromTo("#d0",{opacity:1,x:0,y:0},{opacity:1,x:480,y:0,duration:0.5,ease:"power2.in"},t);
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
 <span style="margin-left:20px">Antigravity · new conversation</span></div><div class="body" id="pt"></div></div>
<div id="kit" class="pill" style="left:640px;top:720px;font-size:34px">📦 Exact prompt in the setup kit</div>
""", """
FX.rise(tl,"#pw",0.05); FX.pop(tl,"#kit",B.kit);
const txt=%s; const o={n:0}; const el=document.getElementById('pt');
const HL=['Claude Code is installed','install OmniRoute from GitHub','open the dashboard','fix it and keep going'];
tl.fromTo(o,{n:0},{n:txt.length,duration:(B.fails+3.0-B.says),ease:"none",onUpdate:()=>{let s=txt.slice(0,Math.round(o.n));
  HL.forEach(h=>{s=s.replace(h,'<span class="hl">'+h+'</span>');}); el.innerHTML=s+'<span style="color:#E53935">▍</span>';}},B.says);
""" % json.dumps(P_INSTALL))

# ------------------------------------------------------------------ 4 combo = a relay team
runners = ''.join(f'<div class="node" id="ru{i}" style="left:{640 + i * 300}px;top:330px;width:250px;height:250px;font-size:30px;border:6px solid {c}">'
                  f'<div style="font-size:70px">🏃</div>{n}<div class="st" id="st{i}" style="font-size:20px;color:#888">ready</div></div>' for i, (n, c) in enumerate(PROVS))
scene('p3team', 'Now one by one, they are small', 'Go to Combos, click Create', dict(small='they are small', team='work as one team', combo='called Combo',
      list='a list of models in an order', first='The first one answers', busy="if it's busy", next='the next one takes over'), f"""<style>{CSS_COMMON}
#baton{{position:absolute;left:740px;top:610px;width:70px;height:26px;border-radius:13px;background:#E53935;box-shadow:0 0 24px #E53935;opacity:0}}
</style>
<div class="hdr"><i></i>A combo = one team</div>{runners}<div id="baton"></div>
<div id="cb" class="pill red" style="left:900px;top:160px;font-size:46px">🤝 Combo: "Claude"</div>
<div id="ord" class="pill" style="left:640px;top:700px;font-size:32px">1 → 2 → 3 → 4 · in order</div>
""", """
[0,1,2,3].forEach(i=>FX.pop(tl,"#ru"+i,B.small-0.4+i*0.15)); tl.to(".node",{scale:0.85,duration:0.3},B.small+0.4);
tl.to(".node",{scale:1,duration:0.4,ease:"back.out(2)"},B.team); FX.pop(tl,"#cb",B.combo); FX.pop(tl,"#ord",B.list);
tl.to("#baton",{opacity:1,duration:0.2},B.first); const set=(i,t,s)=>tl.call(()=>{},null,t);
[0,1,2,3].forEach(i=>tl.to("#st"+i,{color:"#888",duration:0.01},0));
tl.to("#ru0",{y:-20,duration:0.2,yoyo:true,repeat:1},B.first);
tl.to("#ru0",{opacity:0.35,duration:0.3},B.busy+0.2); tl.to("#baton",{x:300,duration:0.5,ease:"power2.inOut"},B.next);
tl.to("#ru1",{y:-20,duration:0.2,yoyo:true,repeat:1},B.next+0.5); tl.to("#ru1",{opacity:0.35,duration:0.3},B.next+1.4);
tl.to("#baton",{x:600,duration:0.5,ease:"power2.inOut"},B.next+1.5); tl.to("#ru2",{y:-20,duration:0.2,yoyo:true,repeat:1},B.next+2.0);
""")

# ------------------------------------------------------------------ 5 one key: Claude Code only ever sees the OmniRoute key
vault = ''.join(f'<div class="pill" id="vk{i}" style="left:1450px;top:{230 + i * 110}px;font-size:28px">🔑 {n} key</div>' for i, (n, c) in enumerate(PROVS))
scene('p3key', 'Now Claude Code needs one key', 'In the dashboard, open API keys', dict(one='needs one key', omk='the OmniRoute API key',
      pw="OmniRoute's own password", shows='shows this key to OmniRoute', behind='behind the scenes'), f"""<style>{CSS_COMMON}
#cc{{left:620px;top:320px;width:300px;height:220px;font-size:34px}} #om{{left:1020px;top:300px;width:330px;height:260px;font-size:42px}}
#k{{position:absolute;left:700px;top:600px;font-size:90px}}
</style>
<div class="hdr"><i></i>One key for everything</div>
<div class="node" id="cc"><img src="../icons/logo-claude.png">Claude Code</div>
<div class="node om" id="om">⚡ OmniRoute<div style="font-size:22px;opacity:.85">holds the provider keys</div></div>{vault}
<div id="k">🔑</div><div id="kp" class="pill red" style="left:620px;top:720px;font-size:34px">1 OmniRoute key</div>
""", """
FX.pop(tl,"#cc",0.05); FX.pop(tl,"#om",B.one); FX.pop(tl,"#k",B.omk); FX.pop(tl,"#kp",B.pw);
tl.to("#k",{x:400,y:-300,duration:0.8,ease:"power2.inOut"},B.shows); tl.to("#om",{scale:1.08,duration:0.2,yoyo:true,repeat:1},B.shows+0.8);
[0,1,2,3].forEach(i=>FX.slide(tl,"#vk"+i,B.behind-1.0+i*0.15,{x:150}));
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
 <span style="margin-left:20px">Antigravity · new conversation</span></div><div class="body" id="pt" style="font-size:32px"></div></div>
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
scene('p3paid', 'And then one last fix', 'On my test machine', dict(menu='its model menu can show every model', paid='including paid ones',
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

# ------------------------------------------------------------------ 9 503 explainer (silent: fills the pause after the error)
scene('p3e503', 'Five zero three means service temporarily unavailable', 'So obvious question is, which model', dict(), f"""<style>{CSS_COMMON}
#code{{position:absolute;left:640px;top:170px;font-weight:900;font-size:200px;color:#ff4d47;line-height:1}}
.stp{{position:absolute;left:1100px;width:740px;font-size:36px}}
</style>
<div class="hdr"><i></i>Error 503: what happened?</div>
<div id="code">503</div><div id="sub" class="pill" style="left:640px;top:420px;font-size:32px">service temporarily unavailable</div>
<div id="s1" class="pill stp" style="top:200px">1 · Kiro had a few errors</div>
<div id="s2" class="pill stp" style="top:330px">2 · OmniRoute paused it for a moment</div>
<div id="s3" class="pill red stp" style="top:460px">3 · Don't panic: just ask again</div>
""", """
FX.pop(tl,"#code",0.05); FX.pop(tl,"#sub",0.4); FX.slide(tl,"#s1",1.0,{x:200}); FX.slide(tl,"#s2",2.2,{x:200}); FX.slide(tl,"#s3",3.4,{x:200});
""")

# ------------------------------------------------------------------ 10 the switch: Claude plans, NVIDIA takes over by itself
scene('p3switch', 'And here is the coolest part', "Now, honestly, the first version didn't work", dict(logs='Straight from the logs', ran='free limit ran out',
      nv='switched by itself to free NVIDIA', kept='it kept building', touch="I didn't touch anything", point='the whole point of a combo'), f"""<style>{CSS_COMMON}
.lane{{position:absolute;left:640px;width:1200px;height:110px;border-radius:20px;background:#1b1b20;border:2px solid #2c2c34}}
.lane span{{position:absolute;left:24px;top:30px;font-weight:900;font-size:36px;z-index:2}}
.lb{{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:20px}}
#cursor{{position:absolute;left:640px;top:200px;width:6px;height:380px;background:#fff;box-shadow:0 0 18px #fff}}
</style>
<div class="hdr"><i></i>From the logs</div>
<div class="lane" style="top:220px"><span>Claude Sonnet · Kiro</span><div class="lb" id="b1" style="background:linear-gradient(90deg,#ff9900,#ffb84d)"></div></div>
<div class="lane" style="top:380px"><span>Nemotron · NVIDIA</span><div class="lb" id="b2" style="background:linear-gradient(90deg,#76b900,#a6e22e)"></div></div>
<div id="lim" class="pill red" style="left:1060px;top:120px;font-size:30px">⚠ free limit reached</div>
<div id="auto" class="pill" style="left:900px;top:540px;font-size:34px">🔀 switched automatically</div>
<div id="hand" class="pill red" style="left:640px;top:660px;font-size:36px">🙌 I didn't touch anything</div>
""", """
tl.to("#b1",{width:"45%",duration:(B.ran-B.logs)+0.4,ease:"none"},B.logs); FX.pop(tl,"#lim",B.ran);
tl.set("#b2",{left:"45%"},0); tl.to("#b2",{width:"55%",duration:(B.touch-B.nv)+1.5,ease:"none"},B.nv); FX.pop(tl,"#auto",B.nv+0.3);
FX.pop(tl,"#hand",B.touch); tl.to(["#auto"],{scale:1.1,duration:0.2,yoyo:true,repeat:1},B.point);
""")

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
const B = {json.dumps(B)};
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
