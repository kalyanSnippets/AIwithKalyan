"""Generate the Part 1 v3 HyperFrames motion-graphic scenes, timed to the narration.

Reads the cut's word timings (/tmp/fcc-style/<name>_words.json, written by fcc_render.py with FCC_FACE_ONLY=1),
finds each scene's start/end and beat phrases, and writes compositions/fcc-part1-mg/compositions/<scene>.html
plus scenes.json (output start/end of every scene) for the compositor.
Bottom-left (x<580, y>690) stays empty: the face card goes there.
Usage: python3 edits/fcc_mg_build.py fcc-part1-v3
"""
import json, re, sys
ROOT = '/home/user/AIwithKalyan'
PROJ = f'{ROOT}/compositions/fcc-part1-mg'
name = sys.argv[1] if len(sys.argv) > 1 else 'fcc-part1-v3'
W = json.load(open(f'/tmp/fcc-style/{name}_words.json'))
WORDS = W['words']; TOTAL = W['total']
def tok(s): return re.sub(r'[^a-z0-9]', '', s.lower())
TOKS = [tok(w[3]) for w in WORDS]

def at(phrase, after=0.0):
    q = [tok(x) for x in phrase.split() if tok(x)]
    for i, w in enumerate(WORDS):
        if w[0] < after - 0.05: continue
        if TOKS[i:i + len(q)] == q: return w[0]
    raise SystemExit(f'phrase not found after {after}: {phrase!r}')

def I(n, cls=''): return f'<img src="../icons/{n}.png" class="{cls}" alt="">'

SCENES = []
def scene(sid, start, end, beats, html, js):
    SCENES.append((sid, start, end, beats, html, js))

# ------------------------------------------------------------------ HOOK 1: price, limit, pay-or-wait
scene('hook1', 'Claude Code is one of the most', 'But here is what', dict(tool='most powerful coding', price='twenty dollars a month',
      limit='the moment you hit', stops='it just stops', pay='You either pay more', wait='or you wait'), '''
<div id="term" class="dcard" style="left:600px;top:150px;width:900px;height:470px;padding:0">
  <div style="height:56px;border-bottom:2px solid #2c2c34;display:flex;align-items:center;gap:12px;padding:0 24px">
    <i style="width:16px;height:16px;border-radius:50%;background:#ff5f57;display:block"></i><i style="width:16px;height:16px;border-radius:50%;background:#febc2e;display:block"></i><i style="width:16px;height:16px;border-radius:50%;background:#28c840;display:block"></i>
    <span style="margin-left:auto;margin-right:auto;color:#9a9aa4;font-weight:700;font-size:22px">Claude Code</span></div>
  <div class="mono" style="padding:30px 36px;font-size:30px;line-height:1.7;color:#e8e8ee">
    <div><span style="color:#D97757">✻</span> Welcome to Claude Code</div><div style="color:#8b8b94">&gt; build me an app<span id="cur">▍</span></div>
    <div id="lim" style="margin-top:18px;color:#ff6b66;opacity:0">⚠ Usage limit reached · resets in 5h</div></div>
  <div id="dim" style="position:absolute;inset:56px 0 0 0;background:rgba(10,10,12,.55);border-radius:0 0 26px 26px;opacity:0"></div>
</div>
<div id="badge" class="pill" style="left:1150px;top:90px">★ #1 AI coding tool</div>
<div id="tag" class="abs" style="left:1360px;top:330px;transform-origin:50% 0">
  <div style="width:12px;height:80px;margin-left:150px;background:#ddd"></div>
  <div class="card center" style="position:relative;width:320px;height:190px;background:var(--red);color:#fff;flex-direction:column">
    <div class="big" style="font-size:96px">$20</div><div style="font-weight:800;font-size:34px">per month</div></div></div>
<div id="bar" class="abs" style="left:600px;top:660px;width:900px">
  <div style="display:flex;justify-content:space-between;font-weight:800;font-size:30px;margin-bottom:12px"><span>Usage</span><span id="pct">0%</span></div>
  <div style="height:34px;border-radius:20px;background:#26262c;overflow:hidden"><div id="fill" style="height:100%;width:0;background:linear-gradient(90deg,#ffb74d,#E53935)"></div></div></div>
<div id="opt1" class="pill red" style="left:640px;top:820px;font-size:44px">💸 Pay more</div>
<div id="or" class="abs big" style="left:1010px;top:826px;font-size:44px;color:#9a9aa4">or</div>
<div id="opt2" class="pill" style="left:1110px;top:820px;font-size:44px">⏳ Wait 5 hours</div>
''', '''
FX.rise(tl,"#term",0.05); FX.pop(tl,"#badge",B.tool-0.2);
tl.fromTo("#tag",{rotation:-70,opacity:0},{rotation:0,opacity:1,duration:0.9,ease:"elastic.out(1,0.45)"},B.price);
FX.rise(tl,"#bar",B.limit-0.3,{y:30}); tl.to("#fill",{width:"100%",duration:1.4,ease:"power2.in"},B.limit);
FX.count(tl,"#pct",0,100,B.limit,1.4,v=>Math.round(v)+"%");
tl.to("#lim",{opacity:1,duration:0.2},B.stops-0.1); tl.to("#dim",{opacity:1,duration:0.3},B.stops-0.1); FX.shake(tl,"#term",B.stops);
tl.to("#cur",{opacity:0,duration:0.05},B.stops);
FX.pop(tl,"#opt1",B.pay); FX.pop(tl,"#or",B.pay+0.4); FX.pop(tl,"#opt2",B.wait);
''')

# ------------------------------------------------------------------ HOOK 2: Claude Code is free, you pay for the brain -> swap
scene('hook2', "What you're paying for is the brain", "Let's take a phone", dict(brain='the brain inside', swap='swap that brain', free='for free ones'), '''
<div id="shell" class="dcard center" style="left:700px;top:150px;width:700px;height:520px;flex-direction:column">
  <div style="position:absolute;top:26px;font-weight:800;font-size:34px;color:#cfcfd6">Claude Code <span class="red">· FREE app</span></div>
  <div id="slot" style="width:300px;height:300px;border:4px dashed #3a3a44;border-radius:40px;margin-top:40px"></div></div>
<div id="paid" class="abs center" style="left:900px;top:300px;width:300px;height:300px;flex-direction:column">
  <img src="../icons/brain.png" class="tint-red" style="width:200px;height:200px"><div class="pill red" style="position:relative;font-size:34px;margin-top:-10px">$20 / month</div></div>
<div id="f1" class="pill" style="left:1500px;top:250px">🧠 Free brain</div>
<div id="f2" class="pill" style="left:1520px;top:380px">🧠 Free brain</div>
<div id="f3" class="pill" style="left:1500px;top:510px">🧠 Free brain</div>
<div id="freeb" class="abs center" style="left:900px;top:300px;width:300px;height:300px;flex-direction:column;opacity:0">
  <img src="../icons/brain.png" style="width:200px;height:200px"><div class="pill" style="position:relative;font-size:34px;margin-top:-10px;background:#2ecc71;color:#fff">$0</div></div>
<div id="zero" class="abs big" style="left:700px;top:720px;width:700px;text-align:center;font-size:110px">$20 → <span class="red">$0</span></div>
''', '''
FX.rise(tl,"#shell",0.05); FX.pop(tl,"#paid",B.brain-0.3); FX.pulse(tl,"#paid",B.brain+0.3,1);
tl.to("#paid",{x:-700,y:120,rotation:-25,opacity:0,duration:0.7,ease:"power3.in"},B.swap);
FX.pop(tl,"#f1",B.swap+0.2); FX.pop(tl,"#f2",B.swap+0.35); FX.pop(tl,"#f3",B.swap+0.5);
tl.to("#f2",{x:-560,y:-80,opacity:0,duration:0.5,ease:"power3.in"},B.free); tl.fromTo("#freeb",{scale:0.5,opacity:0},{scale:1,opacity:1,duration:0.45,ease:"back.out(2)"},B.free+0.4);
FX.pop(tl,"#zero",B.free+0.6);
''')

# ------------------------------------------------------------------ PHONE + SIM
scene('phone', "Let's take a phone", 'So by the end of this video', dict(hw='just the hardware', sim='SIM card decides', cc='Claude Code is like the phone',
      rwr='read, write, and run', model='The AI model is like the SIM', price="Anthropic's model costs", others='accepts other SIMs'), '''
<div id="phone" class="abs" style="left:620px;top:90px;width:440px;height:860px;border-radius:70px;background:#0c0c0f;border:10px solid #2a2a31;box-shadow:0 40px 90px rgba(0,0,0,.7)">
  <div style="position:absolute;left:150px;top:18px;width:120px;height:30px;border-radius:20px;background:#000"></div>
  <div id="scr" class="center" style="position:absolute;inset:60px 18px 40px 18px;border-radius:44px;background:#16161b;flex-direction:column;gap:26px">
    <div id="hwl" style="font-weight:800;font-size:40px;color:#7d7d88">hardware</div>
    <div id="app" class="center" style="flex-direction:column;gap:16px;opacity:0"><img src="../icons/logo-claude.png" style="width:150px;height:150px">
      <div style="font-weight:900;font-size:44px">Claude Code</div><div style="font-weight:600;font-size:26px;color:#9a9aa4">free app · Anthropic</div>
      <div style="display:flex;gap:12px;margin-top:10px"><span id="r1" class="pill" style="position:relative;font-size:24px;padding:10px 18px">read</span><span id="r2" class="pill" style="position:relative;font-size:24px;padding:10px 18px">write</span><span id="r3" class="pill" style="position:relative;font-size:24px;padding:10px 18px">run</span></div></div>
    <div id="bill" class="big" style="font-size:80px;opacity:0">$20<span style="font-size:36px">/mo</span></div></div>
  <div style="position:absolute;right:-14px;top:330px;width:14px;height:150px;background:#3a3a44;border-radius:4px"></div></div>
<div id="sim" class="abs" style="left:1160px;top:300px;width:260px;height:340px;background:#f3f3f6;color:var(--ink);clip-path:polygon(18% 0,100% 0,100% 100%,0 100%,0 14%);border-radius:18px;box-shadow:0 30px 60px rgba(0,0,0,.6)">
  <div style="position:absolute;left:60px;top:70px;width:140px;height:110px;border-radius:16px;background:linear-gradient(135deg,#e9c46a,#b8860b)"></div>
  <div id="siml" style="position:absolute;left:0;right:0;top:200px;text-align:center;font-weight:900;font-size:40px">SIM</div>
  <div id="simp" style="position:absolute;left:0;right:0;top:256px;text-align:center;font-weight:800;font-size:30px;color:var(--red);opacity:0">$20 / month</div></div>
<div id="lab1" class="pill" style="left:1160px;top:150px">🧠 SIM = the AI model</div>
<div id="lab2" class="pill red" style="left:600px;top:40px;opacity:0">Phone = Claude Code</div>
<div id="s1" class="abs" style="left:1500px;top:700px;width:150px;height:200px;background:var(--cream);border-radius:14px;clip-path:polygon(18% 0,100% 0,100% 100%,0 100%,0 14%)"><div class="center big" style="height:100%;font-size:40px;color:#1a7f37">$0</div></div>
<div id="s2" class="abs" style="left:1670px;top:680px;width:150px;height:200px;background:var(--cream);border-radius:14px;clip-path:polygon(18% 0,100% 0,100% 100%,0 100%,0 14%)"><div class="center big" style="height:100%;font-size:40px;color:#1a7f37">$0</div></div>
<div id="s3" class="abs" style="left:1330px;top:720px;width:150px;height:200px;background:var(--cream);border-radius:14px;clip-path:polygon(18% 0,100% 0,100% 100%,0 100%,0 14%)"><div class="center big" style="height:100%;font-size:40px;color:#1a7f37">$0</div></div>
<div id="other" class="pill" style="left:1380px;top:960px">Other SIMs: FREE</div>
''', '''
FX.rise(tl,"#phone",0.05,{y:200,d:0.7});
tl.fromTo("#sim",{x:-420,opacity:0},{x:0,opacity:1,duration:0.7,ease:"power3.out"},B.sim-0.2);
tl.to("#lab2",{opacity:1,duration:0.01},B.cc); FX.pop(tl,"#lab2",B.cc);
tl.to("#hwl",{opacity:0,duration:0.2},B.cc); tl.fromTo("#app",{opacity:0,scale:0.7},{opacity:1,scale:1,duration:0.5,ease:"back.out(1.7)"},B.cc+0.1);
FX.pop(tl,"#r1",B.rwr); FX.pop(tl,"#r2",B.rwr+0.35); FX.pop(tl,"#r3",B.rwr+0.7);
FX.pop(tl,"#lab1",B.model); FX.pulse(tl,"#sim",B.model+0.2,1);
tl.to("#simp",{opacity:1,duration:0.3},B.price); FX.shake(tl,"#sim",B.price+0.2);
tl.to("#app",{opacity:0.25,duration:0.3},B.price); tl.fromTo("#bill",{opacity:0,scale:0.6},{opacity:1,scale:1,duration:0.4,ease:"back.out(2)"},B.price+0.2);
tl.to("#sim",{x:420,rotation:25,opacity:0,duration:0.6,ease:"power3.in"},B.others);
FX.pop(tl,"#s3",B.others+0.1); FX.pop(tl,"#s1",B.others+0.25); FX.pop(tl,"#s2",B.others+0.4); FX.pop(tl,"#other",B.others+0.5);
tl.to("#s1",{x:-380,y:-380,rotation:-8,duration:0.7,ease:"power3.inOut"},B.others+1.3);
tl.to("#bill",{opacity:0,duration:0.2},B.others+1.6); tl.to("#app",{opacity:1,duration:0.3},B.others+1.8);
''')

# ------------------------------------------------------------------ ROADMAP
scene('roadmap', 'So by the end of this video', 'And I have put everything', dict(zero='for zero dollars', three='three different ways', m1='First, completely',
      wifi='switch the Wi-Fi off', m2='Then free AI models', trap='the one trap', m3='And finally, several', sonnet='Claude Sonnet', logs='with the logs'), '''
<div class="hdr"><i></i>Here's the plan</div>
<div id="price" class="abs big" style="left:600px;top:110px;width:900px;text-align:center;font-size:150px">$<span id="num">20</span></div>
<div id="sub" class="abs" style="left:600px;top:280px;width:900px;text-align:center;font-weight:800;font-size:40px;color:#cfcfd6">the real Claude Code · <span class="red">3 ways</span></div>
<div id="c1" class="card center" style="left:600px;top:380px;width:400px;height:420px;flex-direction:column;gap:14px">
  <div class="big red" style="font-size:60px">1</div><img src="../icons/logo-ollama.png" style="width:120px;height:120px;background:#111;border-radius:26px;padding:14px">
  <div style="font-weight:900;font-size:46px">Ollama</div><div style="font-weight:600;font-size:28px;color:#666">on your laptop</div>
  <div id="wo" class="pill red" style="position:relative;font-size:26px;padding:8px 18px">Wi-Fi OFF</div></div>
<div id="c2" class="card center" style="left:1030px;top:380px;width:400px;height:420px;flex-direction:column;gap:14px">
  <div class="big red" style="font-size:60px">2</div><img src="../icons/cloud.png" class="tint-red" style="width:120px;height:120px">
  <div style="font-weight:900;font-size:46px">OpenRouter</div><div style="font-weight:600;font-size:28px;color:#666">free cloud models</div>
  <div id="tr" class="pill" style="position:relative;font-size:26px;padding:8px 18px;background:#ffe0de">⚠ the one trap</div></div>
<div id="c3" class="card center" style="left:1460px;top:380px;width:400px;height:420px;flex-direction:column;gap:14px">
  <div class="big red" style="font-size:60px">3</div><img src="../icons/zap.png" class="tint-red" style="width:120px;height:120px">
  <div style="font-weight:900;font-size:46px">OmniRoute</div><div style="font-weight:600;font-size:28px;color:#666">many free providers</div>
  <div id="so" class="pill" style="position:relative;font-size:26px;padding:8px 18px;background:#ffe0de"><img src="../icons/logo-claude.png" style="width:30px;height:30px">real Claude Sonnet</div></div>
<div id="lg" class="pill red" style="left:1340px;top:850px">🧾 the logs prove it</div>
''', '''
FX.pop(tl,"#price",0.05); FX.count(tl,"#num",20,0,B.zero-0.2,0.8,v=>Math.round(v)); FX.rise(tl,"#sub",B.three-0.2,{y:30});
FX.rise(tl,"#c1",B.m1-0.1); FX.pop(tl,"#wo",B.wifi); FX.rise(tl,"#c2",B.m2-0.1); FX.pop(tl,"#tr",B.trap); FX.shake(tl,"#tr",B.trap+0.4);
FX.rise(tl,"#c3",B.m3-0.1); FX.pop(tl,"#so",B.sonnet); FX.pop(tl,"#lg",B.logs);
tl.to(["#c1","#c2"],{opacity:0.45,scale:0.96,duration:0.3},B.m3); tl.to("#c3",{scale:1.06,duration:0.3},B.sonnet);
''')

# ------------------------------------------------------------------ SETUP KIT
scene('kit', 'And I have put everything', 'So stay till the end', dict(list='the model list', prompt='every prompt', setting='and every setting',
      link='first link in the description'), '''
<div class="hdr"><i></i>Free setup kit</div>
<div id="box" class="card center" style="left:640px;top:240px;width:460px;height:460px;flex-direction:column;gap:18px">
  <img src="../icons/package.png" class="tint-red" style="width:200px;height:200px"><div style="font-weight:900;font-size:50px">Setup kit</div>
  <div style="font-weight:700;font-size:30px;color:#666">free · copy &amp; paste</div></div>
<div id="i1" class="pill" style="left:1200px;top:250px;font-size:44px">📋 The model list</div>
<div id="i2" class="pill" style="left:1200px;top:400px;font-size:44px">💬 Every prompt</div>
<div id="i3" class="pill" style="left:1200px;top:550px;font-size:44px">⚙️ Every setting</div>
<div id="lnk" class="pill red" style="left:900px;top:820px;font-size:46px">1st link in the description ↓</div>
''', '''
FX.pop(tl,"#box",0.05); FX.pulse(tl,"#box",0.6,1);
FX.slide(tl,"#i1",B.list-0.1,{x:-300}); FX.slide(tl,"#i2",B.prompt-0.1,{x:-300}); FX.slide(tl,"#i3",B.setting-0.1,{x:-300});
FX.pop(tl,"#lnk",B.link-0.2); tl.to("#lnk",{y:16,duration:0.35,yoyo:true,repeat:3,ease:"sine.inOut"},B.link+0.4);
''')

# ------------------------------------------------------------------ OLLAMA explainer
scene('ollama', 'so method one', 'installing it is super simple', dict(free='Ollama is a free app', models='downloads AI models', laptop='on your own laptop',
      player='like a media player', cloud='the big difference', nothing='nothing goes to the cloud', private="so it's private", offline='works without internet'), '''
<div class="hdr"><i></i>Method 1 · Ollama</div>
<div id="logo" class="abs center" style="left:620px;top:130px;width:220px;height:220px;background:#fff;border-radius:50px"><img src="../icons/logo-ollama.png" class="tint-ink" style="width:160px;height:160px"></div>
<div id="t1" class="abs" style="left:880px;top:160px;font-weight:900;font-size:80px">Ollama</div>
<div id="t2" class="abs" style="left:880px;top:260px;font-weight:700;font-size:36px;color:#cfcfd6">free app · runs AI models</div>
<div id="lap" class="abs" style="left:1180px;top:420px;width:560px;height:340px">
  <div style="position:absolute;left:40px;top:0;width:480px;height:300px;border-radius:22px;background:#1b1b20;border:8px solid #33333c" class="center"><div id="ms" style="display:flex;gap:18px"></div></div>
  <div style="position:absolute;left:0;top:300px;width:560px;height:30px;border-radius:0 0 30px 30px;background:#3a3a44"></div></div>
<div id="m1" class="pill" style="left:1150px;top:330px;font-size:30px">qwen</div><div id="m2" class="pill" style="left:1360px;top:330px;font-size:30px">gemma</div><div id="m3" class="pill" style="left:1580px;top:330px;font-size:30px">mimo</div>
<div id="play" class="pill" style="left:640px;top:440px">▶ like a media player — for AI</div>
<div id="cl" class="abs center" style="left:640px;top:560px;width:300px;height:220px;flex-direction:column"><img src="../icons/cloud.png" style="width:180px;height:180px;opacity:.85"><div id="x" class="big red" style="position:absolute;font-size:220px;opacity:0">✕</div></div>
<div id="cg" class="abs" style="left:960px;top:640px;font-weight:800;font-size:34px;color:#cfcfd6">ChatGPT / Claude → the cloud</div>
<div id="p1" class="pill" style="left:1200px;top:820px">🔒 Private</div><div id="p2" class="pill red" style="left:1470px;top:820px">📴 Works offline</div>
''', '''
FX.pop(tl,"#logo",0.05); FX.slide(tl,"#t1",0.25,{x:-120}); FX.rise(tl,"#t2",B.free,{y:30});
FX.rise(tl,"#lap",B.models-0.4); FX.pop(tl,"#m1",B.models); FX.pop(tl,"#m2",B.models+0.2); FX.pop(tl,"#m3",B.models+0.4);
tl.to(["#m1","#m2","#m3"],{y:200,scale:0.6,duration:0.6,ease:"power3.in",stagger:0.12},B.laptop);
FX.pop(tl,"#play",B.player); FX.out(tl,"#play",B.cloud-0.2);
FX.pop(tl,"#cl",B.cloud); FX.rise(tl,"#cg",B.cloud+0.2,{y:20}); tl.to("#x",{opacity:1,duration:0.01},B.nothing); FX.pop(tl,"#x",B.nothing,{from:2});
FX.pop(tl,"#p1",B.private); FX.pop(tl,"#p2",B.offline);
''')

# ------------------------------------------------------------------ CONTEXT LENGTH
scene('context', "Context length is the AI's", 'So drag this slide', dict(mem='short-term memory', files='reads a lot of your files', small='If the memory is too small',
      lose='loses track'), '''
<div class="hdr"><i></i>Context length</div>
<div id="title" class="abs" style="left:620px;top:120px;font-weight:900;font-size:66px">= the AI's <span class="red">short-term memory</span></div>
<div id="box" class="abs" style="left:1100px;top:300px;width:420px;height:440px;border:6px solid #fff;border-radius:30px"></div>
<div id="cap" class="abs" style="left:1100px;top:760px;width:420px;text-align:center;font-weight:900;font-size:44px">4K</div>
<div id="f1" class="pill" style="left:640px;top:330px;font-size:30px">📄 app.js</div><div id="f2" class="pill" style="left:640px;top:440px;font-size:30px">📄 index.html</div>
<div id="f3" class="pill" style="left:640px;top:550px;font-size:30px">📄 styles.css</div><div id="f4" class="pill" style="left:640px;top:660px;font-size:30px">💬 your chat</div>
<div id="warn" class="pill red" style="left:1560px;top:470px">⚠ loses track</div>
''', '''
FX.rise(tl,"#title",0.05,{y:30}); FX.pop(tl,"#box",B.mem-0.2); FX.pop(tl,"#cap",B.mem);
FX.slide(tl,"#f1",B.files-0.1); FX.slide(tl,"#f2",B.files+0.15); FX.slide(tl,"#f3",B.files+0.3); FX.slide(tl,"#f4",B.files+0.45);
tl.to("#f1",{x:520,y:20,duration:0.5,ease:"power3.inOut"},B.small); tl.to("#f2",{x:520,y:-10,duration:0.5,ease:"power3.inOut"},B.small+0.1);
tl.to("#f3",{x:520,y:-150,duration:0.5,ease:"power3.inOut"},B.small+0.2); tl.to("#f4",{x:520,y:-260,duration:0.5,ease:"power3.inOut"},B.small+0.3);
tl.to(["#f3","#f4"],{y:"+=420",rotation:20,opacity:0,duration:0.7,ease:"power2.in"},B.lose); FX.pop(tl,"#warn",B.lose); FX.shake(tl,"#box",B.lose);
''')

# ------------------------------------------------------------------ RECAP (offline result)
scene('recap', 'But a laptop with no internet', 'And honestly, if that alone', dict(nonet='no internet', sub='no subscription', lim='no usage limits',
      code='your code never left'), '''
<div class="hdr"><i></i>What just happened</div>
<div id="big" class="abs big" style="left:620px;top:130px;width:1250px;font-size:84px">A laptop just wrote <span class="red">working software</span></div>
<div id="a" class="pill" style="left:640px;top:420px;font-size:48px">📴 No internet</div>
<div id="b" class="pill" style="left:1150px;top:420px;font-size:48px">💳 No subscription</div>
<div id="c" class="pill" style="left:640px;top:580px;font-size:48px">∞ No usage limits</div>
<div id="d" class="pill red" style="left:1150px;top:580px;font-size:48px">🔒 Code stayed home</div>
''', '''
FX.rise(tl,"#big",0.05,{y:40}); FX.pop(tl,"#a",B.nonet); FX.pop(tl,"#b",B.sub); FX.pop(tl,"#c",B.lim); FX.pop(tl,"#d",B.code);
''')

# ------------------------------------------------------------------ RAM
scene('ram', 'Now, which model should', 'Actually, pause the video', dict(guess="Don't guess", ram='depends on your RAM', mem='working memory',
      keys='Press Control', perf='Performance tab'), '''
<div class="hdr"><i></i>Pick your model</div>
<div id="q" class="abs big" style="left:620px;top:130px;font-size:80px">Which model? <span id="ng" class="red">Don't guess.</span></div>
<div id="chip" class="card center" style="left:640px;top:300px;width:560px;height:360px;flex-direction:column;gap:10px">
  <img src="../icons/memory-stick.png" class="tint-red" style="width:180px;height:180px"><div style="font-weight:900;font-size:60px">RAM</div>
  <div id="wm" style="font-weight:700;font-size:30px;color:#666;opacity:0">working memory = model size</div></div>
<div id="keys" class="abs" style="left:1240px;top:380px;display:flex;gap:10px;align-items:center">
  <div id="k1" class="card center" style="position:relative;width:150px;height:120px;font-weight:900;font-size:42px">Ctrl</div><div class="big" style="font-size:50px">+</div>
  <div id="k2" class="card center" style="position:relative;width:160px;height:120px;font-weight:900;font-size:42px">Shift</div><div class="big" style="font-size:50px">+</div>
  <div id="k3" class="card center" style="position:relative;width:130px;height:120px;font-weight:900;font-size:42px">Esc</div></div>
<div id="tm" class="pill" style="left:1300px;top:560px">Task Manager → Performance</div>
''', '''
FX.rise(tl,"#q",0.05,{y:30}); tl.fromTo("#ng",{opacity:0},{opacity:1,duration:0.2},B.guess);
FX.pop(tl,"#chip",B.ram-0.1); tl.to("#wm",{opacity:1,duration:0.3},B.mem);
FX.pop(tl,"#k1",B.keys); FX.pop(tl,"#k2",B.keys+0.2); FX.pop(tl,"#k3",B.keys+0.4);
tl.to(["#k1","#k2","#k3"],{y:10,boxShadow:"0 6px 12px rgba(0,0,0,.5)",duration:0.12,yoyo:true,repeat:1},B.keys+0.9);
FX.pop(tl,"#tm",B.perf-0.4);
''')

scene('tiers', 'Roughly with eight', 'here is a little trick', dict(t1='eight to sixteen', t2='With thirty-two', t3='sixty-four GB', kit='The exact list'), '''
<div class="hdr"><i></i>Which model for your RAM</div>
<div id="r1" class="abs" style="left:640px;top:200px;width:1220px"><div style="display:flex;justify-content:space-between;font-weight:900;font-size:46px"><span>8–16 GB</span><span>Small · 4–12B</span></div>
  <div style="height:40px;border-radius:20px;background:#26262c;margin-top:12px"><div id="b1" style="height:100%;width:0;border-radius:20px;background:var(--red)"></div></div></div>
<div id="you" class="pill red" style="left:1500px;top:110px;font-size:30px">← my laptop: 16 GB</div>
<div id="r2" class="abs" style="left:640px;top:380px;width:1220px"><div style="display:flex;justify-content:space-between;font-weight:900;font-size:46px"><span>32 GB</span><span>Medium</span></div>
  <div style="height:40px;border-radius:20px;background:#26262c;margin-top:12px"><div id="b2" style="height:100%;width:0;border-radius:20px;background:#ffb74d"></div></div></div>
<div id="r3" class="abs" style="left:640px;top:560px;width:1220px"><div style="display:flex;justify-content:space-between;font-weight:900;font-size:46px"><span>64 GB +</span><span>Big · close to paid</span></div>
  <div style="height:40px;border-radius:20px;background:#26262c;margin-top:12px"><div id="b3" style="height:100%;width:0;border-radius:20px;background:#2ecc71"></div></div></div>
<div id="kit" class="pill" style="left:1150px;top:760px">📦 Full list → free setup kit</div>
''', '''
FX.rise(tl,"#r1",0.05,{y:30}); tl.to("#b1",{width:"33%",duration:0.8,ease:"power3.out"},B.t1); FX.pop(tl,"#you",B.t1+0.5);
FX.rise(tl,"#r2",B.t2-0.2,{y:30}); tl.to("#b2",{width:"62%",duration:0.8,ease:"power3.out"},B.t2);
FX.rise(tl,"#r3",B.t3-0.4,{y:30}); tl.to("#b3",{width:"100%",duration:0.8,ease:"power3.out"},B.t3); FX.pop(tl,"#kit",B.kit);
''')

scene('antigravity', 'So instead, I let another AI', 'Download it from', dict(name="It's called Antigravity", google='free AI coding app from Google'), '''
<div class="hdr"><i></i>Let an AI do it</div>
<div id="bot" class="card center" style="left:820px;top:200px;width:300px;height:300px"><img src="../icons/bot.png" class="tint-red" style="width:200px;height:200px"></div>
<div id="nm" class="abs big" style="left:1170px;top:250px;font-size:96px">Antigravity</div>
<div id="g" class="pill" style="left:1180px;top:390px"><img src="../icons/logo-google.png" class="tint-ink">free AI coding app from Google</div>
<div id="s1" class="pill" style="left:640px;top:600px;font-size:32px">Opens the terminal</div><div id="s2" class="pill" style="left:1060px;top:600px;font-size:32px">Runs the commands</div>
<div id="s3" class="pill red" style="left:1500px;top:600px;font-size:32px">Fixes errors</div>
''', '''
FX.pop(tl,"#bot",0.05); FX.pulse(tl,"#bot",0.6,1); FX.slide(tl,"#nm",B.name-0.1,{x:-150}); FX.pop(tl,"#g",B.google);
FX.rise(tl,"#s1",B.google+0.4,{y:30}); FX.rise(tl,"#s2",B.google+0.7,{y:30}); FX.rise(tl,"#s3",B.google+1.0,{y:30});
''')

scene('rule', "that's going to be the rule", 'Now the part you came here', dict(line='anything longer than one line', ai='An AI installs it',
      copy='copy the error', paste='paste it back', fix='Fix this'), '''
<div class="hdr"><i></i>The rule</div>
<div id="kb" class="card center" style="left:640px;top:200px;width:460px;height:360px;flex-direction:column;gap:14px">
  <img src="../icons/keyboard.png" class="tint-red" style="width:150px;height:150px"><div style="font-weight:900;font-size:44px">Longer than 1 line?</div>
  <div style="font-weight:700;font-size:30px;color:#666">don't type it</div></div>
<div id="arr" class="abs big red" style="left:1130px;top:300px;font-size:120px">→</div>
<div id="ai" class="card center" style="left:1320px;top:200px;width:460px;height:360px;flex-direction:column;gap:14px;border:6px solid var(--red)">
  <img src="../icons/bot.png" class="tint-red" style="width:150px;height:150px"><div style="font-weight:900;font-size:44px">An AI installs it</div></div>
<div id="c1" class="pill" style="left:700px;top:700px">⚠ Copy the error</div><div id="c2" class="pill" style="left:1120px;top:700px">📋 Paste it back</div>
<div id="c3" class="pill red" style="left:1520px;top:700px">✨ "Fix this"</div>
''', '''
FX.pop(tl,"#kb",0.05); FX.pop(tl,"#arr",B.ai-0.2); FX.pop(tl,"#ai",B.ai); FX.pop(tl,"#c1",B.copy); FX.pop(tl,"#c2",B.paste); FX.pop(tl,"#c3",B.fix);
''')

scene('job', "Now let's give it a real job", 'So method one is your private', dict(prompt='Build me a simple calculator', time='thirty minutes',
      trade='honest trade-off', free='Free means your laptop', pay='pay with your time', works='it finished, and it works'), '''
<div class="hdr"><i></i>A real job</div>
<div id="pr" class="card" style="left:640px;top:150px;width:1150px;height:130px;display:flex;align-items:center;padding:0 40px;box-sizing:border-box;font-weight:700;font-size:44px">
  <span style="color:#999;margin-right:20px">&gt;</span><span id="pt"></span></div>
<div id="clk" class="card center" style="left:640px;top:360px;width:380px;height:380px;flex-direction:column"><img src="../icons/hourglass.png" class="tint-red" style="width:160px;height:160px">
  <div class="big" style="font-size:74px"><span id="mins">0</span> min</div></div>
<div id="sc" class="abs" style="left:1120px;top:380px;width:700px;height:360px">
  <div id="beam" style="position:absolute;left:50px;top:120px;width:600px;height:14px;border-radius:7px;background:#fff;transform-origin:50% 50%"></div>
  <div style="position:absolute;left:330px;top:134px;width:40px;height:200px;background:#555"></div>
  <div id="pm" class="pill" style="left:0;top:20px;font-size:40px">💲 $0 money</div><div id="pt2" class="pill red" style="left:430px;top:20px;font-size:40px">⏳ your time</div></div>
<div id="ok" class="pill" style="left:1200px;top:830px;font-size:44px">✅ It finished · it works</div>
''', '''
FX.pop(tl,"#pr",0.05); FX.type(tl,"#pt","Build me a simple calculator app.",B.prompt,22);
FX.pop(tl,"#clk",B.time-0.3); FX.count(tl,"#mins",0,30,B.time-0.3,1.4,v=>Math.round(v)); tl.to("#clk img",{rotation:180,duration:0.6,ease:"power2.inOut"},B.time+0.6);
FX.rise(tl,"#sc",B.trade-0.2); FX.pop(tl,"#pm",B.free); FX.pop(tl,"#pt2",B.pay);
tl.to("#beam",{rotation:-8,duration:0.6,ease:"back.out(2)"},B.pay+0.3); tl.to("#pm",{y:-30,duration:0.6},B.pay+0.3); tl.to("#pt2",{y:30,duration:0.6},B.pay+0.3);
FX.pop(tl,"#ok",B.works);
''')

# ------------------------------------------------------------------ write
out = []
for sid, sp, ep, beats, html, js in SCENES:
    t0 = at(sp) - 0.05
    t1 = at(ep, t0 + 0.5) - 0.05
    dur = round(t1 - t0, 3)
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
window.__timelines["{sid}"] = tl;
</script></body></html>
'''
    open(f'{PROJ}/compositions/{sid}.html', 'w').write(doc)
    out.append(dict(id=sid, start=round(t0, 3), end=round(t1, 3), dur=dur))
    print(f'{sid:12s} {t0:7.2f} → {t1:7.2f}  ({dur:.1f}s)  beats {B}')
json.dump(out, open(f'{PROJ}/scenes.json', 'w'), indent=1)
