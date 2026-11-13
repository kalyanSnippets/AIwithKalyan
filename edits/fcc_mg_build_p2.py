"""Part 2 (OpenRouter) HyperFrames scenes, timed to the narration. Face card sits bottom-left (x<540, y>690): keep it clear.
Usage: python3 edits/fcc_mg_build_p2.py fcc-part2"""
import json, re, sys
ROOT = '/home/user/AIwithKalyan'
PROJ = f'{ROOT}/compositions/fcc-part2-mg'
name = sys.argv[1] if len(sys.argv) > 1 else 'fcc-part2'
W = json.load(open(f'/tmp/fcc-style/{name}_words.json')); WORDS = W['words']
def tok(s): return re.sub(r'[^a-z0-9]', '', s.lower())
TOKS = [tok(w[3]) for w in WORDS]
def at(phrase, after=0.0):
    q = [tok(x) for x in phrase.split() if tok(x)]
    for i, w in enumerate(WORDS):
        if w[0] >= after - 0.05 and TOKS[i:i + len(q)] == q: return w[0]
    raise SystemExit(f'not found after {after}: {phrase!r}')
SCENES = []
def scene(sid, sp, ep, beats, html, js): SCENES.append((sid, sp, ep, beats, html, js))

# ------------------------------------------------------------------ 1 OpenRouter: one site, many models, one key
MODELS = ['DeepSeek', 'Llama', 'Qwen', 'Mistral', 'Gemma', 'GPT-OSS', 'Nemotron', 'Kimi']
chips = ''.join(f'<div class="mc" id="m{i}">{m}<b class="fr">FREE</b></div>' for i, m in enumerate(MODELS))
scene('p2open', 'So method two is called OpenRouter', 'Go to openrouter.ai', dict(web='one website', models='dozens of AI models',
      key='single key', free='completely free', diff='The big difference from Ollama', servers='run on their servers', laptop='not on your laptop',
      faster='much faster'), f"""
<style>
.mc{{position:absolute;padding:14px 22px;border-radius:16px;background:#fff;color:#111;font-weight:800;font-size:30px;box-shadow:0 14px 34px rgba(0,0,0,.5)}}
.mc .fr{{margin-left:12px;font-size:20px;background:#2ecc71;color:#fff;border-radius:8px;padding:3px 8px;opacity:0}}
#hub{{position:absolute;left:1020px;top:330px;width:380px;height:240px;border-radius:30px;background:linear-gradient(135deg,#6d28d9,#4f46e5);
 display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 0 80px rgba(109,40,217,.6)}}
#hub b{{font-weight:900;font-size:58px}} #hub span{{font-weight:700;font-size:26px;opacity:.85}}
#k1{{position:absolute;left:1080px;top:620px}}
#srv{{position:absolute;left:640px;top:170px;width:420px;height:470px}} .rk{{height:96px;margin-bottom:16px;border-radius:16px;background:#22222a;border:2px solid #3a3a44;
 display:flex;align-items:center;gap:16px;padding:0 24px}} .rk i{{width:14px;height:14px;border-radius:50%;background:#2ecc71;display:block;box-shadow:0 0 12px #2ecc71}}
#lap{{position:absolute;left:1340px;top:300px;width:460px;text-align:center}}
#gauge{{position:absolute;left:1100px;top:640px;width:420px;height:230px}}
</style>
<div class="hdr"><i></i>Method 2 · OpenRouter</div>
<div id="g1"><div id="hub"><b>OpenRouter</b><span>one website</span></div>{chips}
 <div id="k1" class="pill red" style="font-size:36px">🔑 one account · one key</div></div>
<div id="g2"><div id="srv"><div class="rk"><i></i><b>their servers</b></div><div class="rk"><i></i>GPU · GPU · GPU</div><div class="rk"><i></i>GPU · GPU · GPU</div><div class="rk"><i></i>GPU · GPU · GPU</div></div>
 <div id="lap"><img src="../icons/laptop.png" style="width:220px;height:220px"><div style="font-weight:800;font-size:34px">your laptop</div>
  <div class="pill" style="position:relative;display:inline-flex;margin-top:14px;font-size:28px">just sends the question</div></div>
 <svg id="gauge" viewBox="0 0 420 230"><path d="M30 210 A180 180 0 0 1 390 210" stroke="#33333c" stroke-width="28" fill="none"/>
  <path id="garc" d="M30 210 A180 180 0 0 1 390 210" stroke="#E53935" stroke-width="28" fill="none" stroke-dasharray="566" stroke-dashoffset="566"/>
  <line id="needle" x1="210" y1="210" x2="60" y2="210" stroke="#fff" stroke-width="10" stroke-linecap="round" style="transform-origin:210px 210px"/>
  <text x="210" y="190" text-anchor="middle" font-size="42" font-weight="900" fill="#fff">FAST</text></svg></div>
""", """
const P=[[640,150],[650,300],[640,450],[700,600],[1500,150],[1520,300],[1540,450],[1480,600]];
FX.pop(tl,"#hub",0.05);
P.forEach((p,i)=>{gsap.set("#m"+i,{left:p[0],top:p[1]}); tl.fromTo("#m"+i,{x:(p[0]<1000?-300:300),opacity:0},{x:0,opacity:1,duration:0.45,ease:"power3.out"},B.models+i*0.12);});
tl.to(".mc",{x:(i)=> (P[i][0]<1000? 330-(P[i][0]-640) : -(P[i][0]-1250)), y:(i)=>360-P[i][1]+ (i%4)*14-20, scale:0.55, opacity:0.0, duration:0.7, ease:"power3.in", stagger:0.05},B.key-0.6);
FX.pop(tl,"#k1",B.key); FX.pulse(tl,"#hub",B.key,1);
tl.set(".mc",{x:0,y:0,scale:1},B.free-0.05); tl.to(".mc",{opacity:1,duration:0.3,stagger:0.05},B.free-0.05); tl.to(".fr",{opacity:1,duration:0.2,stagger:0.08},B.free+0.3);
tl.to("#g1",{opacity:0,duration:0.3},B.diff-0.2);
tl.fromTo("#srv",{x:-200,opacity:0},{x:0,opacity:1,duration:0.5,ease:"power3.out"},B.servers-0.2);
tl.fromTo(".rk i",{opacity:0.2},{opacity:1,duration:0.15,yoyo:true,repeat:9,stagger:0.05},B.servers);
tl.fromTo("#lap",{x:200,opacity:0},{x:0,opacity:1,duration:0.5,ease:"power3.out"},B.laptop-0.1);
tl.fromTo("#gauge",{opacity:0,y:40},{opacity:1,y:0,duration:0.4},B.faster-0.3);
tl.to("#garc",{strokeDashoffset:60,duration:0.9,ease:"power3.out"},B.faster); tl.to("#needle",{rotation:160,duration:0.9,ease:"back.out(1.6)"},B.faster);
""")

# ------------------------------------------------------------------ 2 the free list changes: remember the filter, not the names
rows = ''.join(f'<div class="row" id="r{i}"><span class="nm" id="n{i}">{n}</span><b>$0</b></div>' for i, n in enumerate(
    ['deepseek-r1 (free)', 'llama-3.3-70b (free)', 'qwen3-coder (free)', 'gemma-3-27b (free)', 'mistral-small (free)']))
scene('p2tip', 'And here is an important tip', "Now let's connect OpenRouter", dict(changes='This list changes all the time', go='Models come and go',
      end='Companies end their free offers', dont="don't memorize the names", filter='Remember the filter', always="you'll always have a free model"), f"""
<style>
#list{{position:absolute;left:640px;top:160px;width:720px;background:#fff;border-radius:26px;padding:26px;box-sizing:border-box;box-shadow:0 30px 70px rgba(0,0,0,.55);color:#111}}
.row{{display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:32px;padding:18px 16px;border-bottom:2px solid #f0f0f3}}
.row b{{color:#1a8f45}}
#flt{{position:absolute;left:1430px;top:200px;width:400px;height:330px;border-radius:26px;background:#1b1b20;border:3px solid #E53935;padding:30px;box-sizing:border-box;
 box-shadow:0 0 70px rgba(229,57,53,.45)}}
#flt h3{{margin:0 0 30px;font-size:30px;font-weight:900}} #trk{{height:12px;border-radius:6px;background:#3a3a44;position:relative}}
#knob{{position:absolute;left:-6px;top:-14px;width:40px;height:40px;border-radius:50%;background:#7c3aed;box-shadow:0 0 20px #7c3aed}}
#lbl{{display:flex;justify-content:space-between;margin-top:26px;font-weight:800;font-size:24px;color:#aaa}} #lbl b{{color:#2ecc71;font-size:30px}}
#x{{position:absolute;left:600px;top:120px;width:800px;height:640px;opacity:0}}
</style>
<div class="hdr"><i></i>Important tip</div>
<div id="list">{rows}</div>
<svg id="x" viewBox="0 0 800 640"><line x1="40" y1="40" x2="760" y2="600" stroke="#E53935" stroke-width="22" stroke-linecap="round"/>
 <line x1="760" y1="40" x2="40" y2="600" stroke="#E53935" stroke-width="22" stroke-linecap="round"/></svg>
<div id="flt"><h3>Prompt pricing</h3><div id="trk"><div id="knob"></div></div><div id="lbl"><b>FREE</b><span>$0.50</span><span>$10+</span></div></div>
<div id="p1" class="pill" style="left:640px;top:820px;font-size:36px">📌 Don't memorize names</div>
<div id="p2" class="pill red" style="left:1230px;top:600px;font-size:38px">✓ Remember the filter</div>
""", """
FX.rise(tl,"#list",0.05); tl.fromTo(".row",{x:-40,opacity:0},{x:0,opacity:1,duration:0.3,stagger:0.08},0.2);
const NEW=['kimi-k2 (free)','glm-4.5-air (free)','nemotron-nano (free)'];
tl.to("#r1",{x:-760,opacity:0,duration:0.45,ease:"power3.in"},B.go); tl.to("#r3",{x:-760,opacity:0,duration:0.45,ease:"power3.in"},B.go+0.3);
tl.call(()=>{},null,B.go+0.8);
const sw={v:0};tl.fromTo(sw,{v:0},{v:1,duration:0.05,onUpdate:()=>{document.getElementById('n1').textContent=sw.v>0.5?NEW[0]:'llama-3.3-70b (free)';
  document.getElementById('n3').textContent=sw.v>0.5?NEW[1]:'gemma-3-27b (free)';}},B.go+0.8);
tl.to(["#r1","#r3"],{x:0,opacity:1,duration:0.45,ease:"back.out(1.6)"},B.go+0.85);
tl.to("#r4",{opacity:0.25,duration:0.3},B.end); tl.to("#r4 b",{color:"#E53935",duration:0.2},B.end);
tl.to("#x",{opacity:1,duration:0.25},B.dont); FX.pop(tl,"#p1",B.dont);
FX.pop(tl,"#flt",B.filter-0.2); tl.fromTo("#knob",{x:256},{x:0,duration:0.8,ease:"power3.inOut"},B.filter+0.2); FX.pop(tl,"#p2",B.filter+0.4);
tl.to("#x",{opacity:0,duration:0.3},B.always); tl.to(["#r1","#r3","#r4"],{opacity:1,duration:0.3},B.always); tl.to("#r4 b",{color:"#1a8f45",duration:0.2},B.always);
""")

# ------------------------------------------------------------------ 3 the settings block, line by line
LINES = [('$env:ANTHROPIC_BASE_URL', ' = "https://openrouter.ai/api"'), ('$env:ANTHROPIC_AUTH_TOKEN', ' = "YOUR_OPENROUTER_KEY"'),
         ('$env:ANTHROPIC_API_KEY', ' = ""'), ('$env:ANTHROPIC_MODEL', ' = "openrouter/free"'),
         ('$env:ANTHROPIC_DEFAULT_OPUS_MODEL', ' = "openrouter/free"'), ('$env:ANTHROPIC_DEFAULT_SONNET_MODEL', ' = "openrouter/free"'),
         ('$env:ANTHROPIC_DEFAULT_HAIKU_MODEL', ' = "openrouter/free"'), ('claude', '')]
code = ''.join(f'<div class="ln" id="L{i}"><span class="k">{k}</span><span class="v">{v}</span></div>' for i, (k, v) in enumerate(LINES))
scene('p2settings', "Now let's connect OpenRouter", 'Then open your folder', dict(block='small block of settings', kit='the whole block is in the setup kit',
      ps='For both PowerShell', dont="Don't talk to Anthropic", talk='Talk to OpenRouter instead', key='here is my key', each='what each line does',
      l1='The first line', l2='The second line', paste='Paste your key', l3='The third line', l4='And the last few lines', slots='Opus, Sonnet, and Haiku',
      free='openrouter/free is', picks='It picks a free model'), f"""
<style>
#term{{position:absolute;left:600px;top:130px;width:1260px;border-radius:24px;background:#0f0f13;border:2px solid #2c2c34;box-shadow:0 30px 80px rgba(0,0,0,.6);overflow:hidden}}
#tb{{height:54px;display:flex;align-items:center;gap:10px;padding:0 20px;background:#18181d;border-bottom:2px solid #24242b}}
#tb i{{width:14px;height:14px;border-radius:50%;display:block}} .tab{{margin-left:18px;font-weight:800;font-size:22px;color:#888;padding:8px 14px;border-radius:10px}}
.tab.on{{background:#2a2a32;color:#fff}}
#code{{padding:26px 30px;font-family:"JBMono",monospace;font-size:30px;line-height:1.75}}
.ln{{padding:0 14px;border-radius:10px;opacity:0;white-space:nowrap}} .k{{color:#6ee7b7}} .v{{color:#93c5fd}} .ln.on{{background:rgba(229,57,53,.22);box-shadow:inset 6px 0 0 #E53935}}
#flow{{position:absolute;left:640px;top:150px;width:1200px;height:520px}}
.bx{{position:absolute;top:160px;width:330px;height:200px;border-radius:26px;background:#fff;color:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;
 gap:10px;font-weight:900;font-size:36px;box-shadow:0 30px 60px rgba(0,0,0,.5)}} .bx img{{width:90px;height:90px}}
#ann{{position:absolute;left:640px;top:880px}}
</style>
<div class="hdr"><i></i>Connect it to Claude Code</div>
<div id="flow"><div class="bx" id="bcc" style="left:0"><img src="../icons/logo-claude.png">Claude Code</div>
 <div class="bx" id="ban" style="left:440px"><img src="../icons/logo-anthropic.png" style="background:#111;border-radius:18px;padding:8px">Anthropic</div>
 <div class="bx" id="bor" style="left:880px;background:linear-gradient(135deg,#6d28d9,#4f46e5);color:#fff">🔀<br>OpenRouter</div>
 <svg style="position:absolute;left:330px;top:250px" width="560" height="20"><line id="a1" x1="0" y1="10" x2="110" y2="10" stroke="#fff" stroke-width="8"/></svg>
 <div id="xa" class="big red" style="position:absolute;left:530px;top:110px;font-size:260px;opacity:0">✕</div>
 <svg id="curve" style="position:absolute;left:160px;top:0;opacity:0" width="900" height="170"><path d="M10 160 C 300 -40, 600 -40, 880 150" stroke="#E53935" stroke-width="10" fill="none" stroke-dasharray="1200" stroke-dashoffset="1200" id="cp"/></svg>
 <div id="kk" class="pill" style="left:760px;top:420px">🔑 + my key</div></div>
<div id="term"><div id="tb">
  <span class="tab on" id="tps">PowerShell</span><span class="tab" id="tcmd">Command Prompt</span><span style="margin-left:auto;display:flex;gap:34px;align-items:center;color:#8b8b94;font-size:22px;font-weight:400">─<span style="font-size:20px">☐</span>✕</span></div><div id="code">{code}</div></div>
<div id="ann" class="pill">📦 Whole block in the setup kit</div>
""", """
FX.pop(tl,"#bcc",0.05); FX.pop(tl,"#ban",0.4);
tl.set("#term",{opacity:0},0); tl.set("#ann",{opacity:0},0);
tl.to("#flow",{opacity:0,duration:0.3},B.block-0.2); tl.fromTo("#term",{opacity:0,y:60},{opacity:1,y:0,duration:0.5,ease:"power3.out"},B.block);
tl.to(".ln",{opacity:1,duration:0.15,stagger:0.12},B.block+0.3); FX.pop(tl,"#ann",B.kit);
tl.set("#tcmd",{className:"tab on"},B.ps+0.6); tl.set("#tps",{className:"tab"},B.ps+0.6); tl.set("#tps",{className:"tab on"},B.ps+1.4); tl.set("#tcmd",{className:"tab"},B.ps+1.4);
tl.to("#term",{opacity:0,duration:0.3},B.dont-0.2); tl.to("#flow",{opacity:1,duration:0.3},B.dont-0.2); FX.out(tl,"#ann",B.dont-0.2);
tl.fromTo("#xa",{opacity:0,scale:2},{opacity:1,scale:1,duration:0.3,ease:"power4.out"},B.dont+0.4);
FX.pop(tl,"#bor",B.talk); tl.set("#curve",{opacity:1},B.talk); tl.to("#cp",{strokeDashoffset:0,duration:0.7,ease:"power2.out"},B.talk+0.1);
FX.pop(tl,"#kk",B.key);
tl.to("#flow",{opacity:0,duration:0.3},B.each-0.2); tl.to("#term",{opacity:1,duration:0.3},B.each-0.2);
const HL=(i,t)=>{tl.set(".ln",{className:"ln"},t); tl.set(i.map(n=>"#L"+n),{className:"ln on"},t);};
HL([0],B.l1); HL([1],B.l2); HL([1],B.paste); HL([2],B.l3); HL([3,4,5,6],B.l4);
tl.to(["#L4 .v","#L5 .v","#L6 .v"],{color:"#fca5a5",duration:0.2,stagger:0.25},B.slots); HL([3,4,5,6],B.free); HL([7],B.picks+1.2);
""")

# ------------------------------------------------------------------ 4 run it: folder -> terminal -> paste -> enter -> claude; settings live only in that window
scene('p2session', 'Then open your folder', 'And this is where I almost got fooled', dict(rc='right-click', term='open the terminal', paste='paste the block',
      enter='hit Enter', claude='and type Claude', only='only apply to that terminal window', again='paste them again', shortcut='Or you let Antigravity'), """
<style>
.st{position:absolute;top:200px;width:200px;height:200px;border-radius:26px;background:#fff;color:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;
 gap:10px;font-weight:900;font-size:26px;box-shadow:0 26px 50px rgba(0,0,0,.5)} .st img{width:80px;height:80px}
.ar{position:absolute;top:280px;font-size:50px;font-weight:900;color:#E53935}
#win2{position:absolute;left:760px;top:470px;width:820px;height:300px;border-radius:20px;background:#0f0f13;border:2px solid #2c2c34;font-family:"JBMono",monospace;
 font-size:26px;color:#6ee7b7;padding:24px 28px;box-sizing:border-box;opacity:0}
#sc{position:absolute;left:1640px;top:500px;width:180px;text-align:center;font-weight:800;font-size:24px;opacity:0}
#sc div{width:140px;height:140px;margin:0 auto 12px;border-radius:30px;background:linear-gradient(135deg,#D97757,#E53935);display:flex;align-items:center;justify-content:center;font-size:70px}
</style>
<div class="hdr"><i></i>Run it</div>
<div class="st" id="s0" style="left:600px"><img src="../icons/folder.png" class="tint-red">folder</div><div class="ar" id="a0" style="left:812px">→</div>
<div class="st" id="s1" style="left:860px"><img src="../icons/mouse-pointer-click.png" class="tint-red">right-click</div><div class="ar" id="a1" style="left:1072px">→</div>
<div class="st" id="s2" style="left:1120px"><img src="../icons/terminal.png" class="tint-red">terminal</div><div class="ar" id="a2" style="left:1332px">→</div>
<div class="st" id="s3" style="left:1380px"><img src="../icons/list-checks.png" class="tint-red">paste · Enter</div><div class="ar" id="a3" style="left:1592px">→</div>
<div class="st" id="s4" style="left:1640px;background:#E53935;color:#fff;font-size:34px">claude</div>
<div id="win2">PS&gt; $env:ANTHROPIC_BASE_URL = "…openrouter…"<br>PS&gt; $env:ANTHROPIC_AUTH_TOKEN = "YOUR_KEY"<br>PS&gt; …<br>PS&gt; claude</div>
<div id="only" class="pill red" style="left:780px;top:800px;font-size:34px">⚠ only this terminal window</div>
<div id="sc"><div>✻</div>Free Claude Code</div>
""", """
const S=["#s0","#a0","#s1","#a1","#s2","#a2","#s3","#a3","#s4"];
FX.pop(tl,"#s0",0.05);
[[1,2,B.rc],[3,4,B.term],[5,6,B.paste],[7,8,B.claude]].forEach(([a,b,t])=>{FX.pop(tl,S[a],t-0.15);FX.pop(tl,S[b],t);});
FX.pulse(tl,"#s3",B.enter,1);
tl.fromTo("#win2",{opacity:0,y:40},{opacity:1,y:0,duration:0.4},B.only-0.3); FX.pop(tl,"#only",B.only+0.3);
tl.to("#win2",{scale:0.2,opacity:0,duration:0.5,ease:"power3.in"},B.again-0.2);
tl.fromTo("#win2",{scale:0.2,opacity:0},{scale:1,opacity:1,duration:0.45,ease:"back.out(1.7)"},B.again+0.5);
FX.out(tl,"#only",B.shortcut-0.1); tl.fromTo("#sc",{opacity:0,y:60},{opacity:1,y:0,duration:0.5,ease:"back.out(1.7)"},B.shortcut);
""")

# ------------------------------------------------------------------ 5 the catch: 50 a day, 10-20 per task, error 429
scene('p2catch', 'But of course, there is a catch', 'And the second is the privacy', dict(two='two actually', first='First, limits', capped='capped about fifty',
      plenty='Fifty sounds like plenty', task='one Claude Code task', reads='reads files', writes='writes them', checks='checks its own work', fixes='fixes what it broke',
      hit='Hit the cap', err='four twenty-nine', saying='the server saying', later='Come back later'), """
<style>
#cnt{position:absolute;left:640px;top:150px;width:620px;height:420px;border-radius:28px;background:#1b1b20;border:2px solid #2c2c34;padding:34px;box-sizing:border-box}
#cnt .lb{font-weight:800;font-size:26px;letter-spacing:3px;color:#aaa} #num{font-weight:900;font-size:150px;line-height:1.1}
#bar{height:34px;border-radius:18px;background:#2a2a32;overflow:hidden;margin-top:10px} #fill{height:100%;width:100%;background:linear-gradient(90deg,#2ecc71,#ffb74d,#E53935)}
.act{position:absolute;left:1330px;width:480px}
#wall{position:absolute;left:560px;top:120px;width:1320px;height:720px;border-radius:30px;background:#2a0b0b;border:6px solid #E53935;display:flex;flex-direction:column;
 align-items:center;justify-content:center;box-shadow:0 0 120px rgba(229,57,53,.6);opacity:0}
#wall b{font-size:220px;font-weight:900;color:#ff4d47;line-height:1} #wall span{font-size:46px;font-weight:800;margin-top:10px} #wall i{font-style:normal;font-size:36px;color:#ffb3a9;margin-top:14px}
</style>
<div class="hdr"><i></i>The catch · 1 of 2: limits</div>
<div id="cnt"><div class="lb">FREE REQUESTS TODAY</div><div id="num">50</div><div id="bar"><div id="fill"></div></div></div>
<div id="t0" class="pill red act" style="top:170px;font-size:36px">1 Claude Code task = 10–20 requests</div>
<div id="t1" class="pill act" style="top:300px">📄 reads files</div><div id="t2" class="pill act" style="top:400px">✍️ writes them</div>
<div id="t3" class="pill act" style="top:500px">🔍 checks its work</div><div id="t4" class="pill act" style="top:600px">🛠 fixes what broke</div>
<div id="wall"><b>429</b><span id="ws">Too many requests</span><i id="wi">"You've used your free quota. Come back later."</i></div>
""", """
FX.rise(tl,"#cnt",B.capped-0.3); FX.pop(tl,"#t0",B.task);
["#t1","#t2","#t3","#t4"].forEach((s,i)=>FX.slide(tl,s,[B.reads,B.writes,B.checks,B.fixes][i]-0.1,{x:200}));
const n={v:50};tl.fromTo(n,{v:50},{v:0,duration:(B.hit-B.reads),ease:"none",onUpdate:()=>{document.getElementById('num').textContent=Math.round(n.v);}},B.reads);
tl.to("#fill",{width:"0%",duration:(B.hit-B.reads),ease:"none"},B.reads);
tl.fromTo("#wall",{opacity:0,scale:1.3},{opacity:1,scale:1,duration:0.35,ease:"power4.out"},B.err-0.1);
tl.to("#wall",{x:-16,duration:0.05,yoyo:true,repeat:7},B.err+0.25); tl.fromTo("#wi",{opacity:0},{opacity:1,duration:0.3},B.saying);
""")

# ------------------------------------------------------------------ 6 privacy: your code goes to someone else's server
scene('p2privacy', 'And the second is the privacy', 'So quick question', dict(unlike='Unlike Ollama', go='go to someone', dont="don't send client code",
      keep='keep those on Ollama'), """
<style>
.nd{position:absolute;top:250px;width:300px;height:280px;border-radius:28px;background:#fff;color:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;
 gap:12px;font-weight:900;font-size:34px;box-shadow:0 30px 60px rgba(0,0,0,.5)} .nd img{width:110px;height:110px}
#doc{position:absolute;left:1000px;top:330px;font-size:70px}
#tr{position:absolute;left:940px;top:390px;width:400px;height:10px;background:repeating-linear-gradient(90deg,#E53935 0 26px,transparent 26px 44px)}
</style>
<div class="hdr"><i></i>The catch · 2 of 2: privacy</div>
<div class="nd" id="me" style="left:620px"><img src="../icons/laptop.png" class="tint-ink">your code</div>
<div id="tr"></div><div id="doc">📄</div>
<div class="nd" id="them" style="left:1360px"><img src="../icons/cloud.png" class="tint-red">their server</div>
<div id="p1" class="pill red" style="left:700px;top:620px;font-size:36px">✕ no client code · no passwords</div>
<div id="p2" class="pill" style="left:1060px;top:740px;font-size:36px"><img src="../icons/lock.png" class="tint-ink">private stuff → Ollama</div>
""", """
FX.pop(tl,"#me",0.05); FX.pop(tl,"#them",B.go-0.3); tl.fromTo("#tr",{scaleX:0,transformOrigin:"0 50%"},{scaleX:1,duration:0.5},B.go-0.1);
tl.fromTo("#doc",{x:0,opacity:0},{x:330,opacity:1,duration:1.0,ease:"power2.inOut"},B.go);
FX.pop(tl,"#p1",B.dont); FX.pop(tl,"#p2",B.keep); tl.to("#doc",{x:-400,duration:0.8,ease:"power2.inOut"},B.keep);
""")

out = []
for sid, sp, ep, beats, html, js in SCENES:
    t0 = at(sp) - 0.05; t1 = at(ep, t0 + 0.5) - 0.05; dur = round(t1 - t0, 3)
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
    print(f'{sid:12s} {t0:7.2f} → {t1:7.2f}  ({dur:.1f}s)  {B}')
json.dump(out, open(f'{PROJ}/scenes.json', 'w'), indent=1)
