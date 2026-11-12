"""Part 3 conclusion layer (transparent HyperFrames MOV) composited BEHIND Kalyan, like the intro: side walls only
(left x 335-700 / right x 1220-1880 above the right plant), glow text behind the head only for the big beats.
Usage: python3 edits/fcc_outro_build.py fcc-part3"""
import json, re, sys
ROOT = '/home/user/AIwithKalyan'
PROJ = f'{ROOT}/compositions/fcc-part3-mg'
name = sys.argv[1] if len(sys.argv) > 1 else 'fcc-part3'
W = json.load(open(f'/tmp/fcc-style/{name}_words.json')); WORDS = W['words']; TOTAL = W['total']
def tok(s): return re.sub(r'[^a-z0-9]', '', s.lower())
TOKS = [tok(w[3]) for w in WORDS]
def at(phrase, after=0.0):
    q = [tok(x) for x in phrase.split() if tok(x)]
    for i, w in enumerate(WORDS):
        if w[0] >= after - 0.05 and TOKS[i:i + len(q)] == q: return w[0]
    raise SystemExit(f'not found: {phrase!r}')
T0 = at('and here is your free Claude Code map') - 0.1
def b(p, after=None): return round(at(p, T0 if after is None else after) - T0, 3)
B = dict(map=0.1, fits=b('Which one fits you'), priv=b('Privacy or offline'), oll=b('Go with Ollama'), speed=b('and you want speed'),
         orr=b('go with OpenRouter'), keep=b('keep going when one provider runs out'), omni=b('the best option is OmniRoute'),
         rules=b('And the four rules'), r1=b('One, nothing is unlimited'), r2=b('cloud providers see what you send'), r3=b('And the third thing is Kiro'),
         r4=b('And the fourth one is things will break'), bill=b('always check the bill'), everyone=b('Everyone told you'), today=b('Today, we ran'),
         off=b('offline, in the cloud'), zero=b('Same Claude Code, zero bill'), kit=b('The free setup kit'), link=b('first link in the description'),
         comm=b('Tell me in the comments'), sub=b('subscribe to AI with Kalyan'), test=b('I test these AI tools'), next=b('And if you want to see what else'),
         watch=b('this video right here'), week=b('Every week on AI with Kalyan'), bye=b("Subscribe, and I'll see you"))
DUR = round(TOTAL - T0, 3)
FXW = {'strike': (B['everyone'], B['today']), 'zero': (B['zero'], B['kit']), 'led': (B['sub'], B['test'])}

src = open(f'{ROOT}/edits/fcc_intro_build.py').read()
css = src[src.index("css = '''") + 9:src.index("'''", src.index("css = '''") + 9)]
css += '''
.path{width:330px;padding:18px 20px;border-radius:22px;background:#fff;color:#111;box-shadow:0 0 40px rgba(229,57,53,.35),0 20px 50px rgba(0,0,0,.5)}
.path .q{font-weight:700;font-size:22px;color:#777}.path .a{font-weight:900;font-size:40px;display:flex;align-items:center;gap:12px}
.path .a img{width:52px;height:52px}
.rule{width:560px;display:flex;align-items:center;gap:16px;padding:14px 22px;border-radius:18px;background:rgba(20,20,26,.82);border:2px solid rgba(255,255,255,.18);
 font-weight:800;font-size:32px;color:#fff;box-shadow:0 0 40px rgba(229,57,53,.3)}
.rule b{width:50px;height:50px;border-radius:14px;background:#E53935;display:flex;align-items:center;justify-content:center;font-size:30px;flex:none}
.cbox{width:560px;padding:20px 24px;border-radius:20px;background:#fff;color:#111;box-shadow:0 20px 50px rgba(0,0,0,.5)}
.cbox .u{font-weight:800;font-size:22px;color:#555;margin-bottom:8px}.cbox .t{font-weight:700;font-size:32px;min-height:44px}
.subbtn{padding:20px 40px;border-radius:999px;background:#ff0000;color:#fff;font-weight:900;font-size:40px;box-shadow:0 0 40px rgba(255,0,0,.5)}
.slot{width:560px;height:315px;border-radius:22px;border:5px dashed rgba(255,255,255,.75);background:rgba(10,10,14,.55);display:flex;flex-direction:column;
 align-items:center;justify-content:center;gap:12px;font-weight:900;font-size:40px;color:#fff}
.slot i{font-style:normal;font-size:80px}
.circ{width:260px;height:260px;border-radius:50%;border:5px dashed rgba(255,255,255,.75);background:rgba(10,10,14,.55);display:flex;align-items:center;
 justify-content:center;text-align:center;font-weight:900;font-size:30px;color:#fff}
'''
html = '''
<div id="L" class="lay">
 <div id="h1" class="neon small" style="left:335px;top:30px;width:420px;text-align:left;font-size:54px">which one<br>fits you?</div>
 <div id="pa" class="path" style="left:345px;top:200px"><div class="q">privacy · offline</div><div class="a"><img src="../icons/logo-ollama.png" style="background:#111;border-radius:12px;padding:4px">Ollama</div></div>
 <div id="pb" class="path" style="left:345px;top:380px"><div class="q">no strong hardware · speed</div><div class="a"><img src="../icons/cloud.png" class="tint-red">OpenRouter</div></div>
 <div id="pc" class="path" style="left:1300px;top:120px;width:460px;border:6px solid #E53935;box-shadow:0 0 90px rgba(229,57,53,.7)"><div class="q">keeps going when one runs out</div>
   <div class="a" style="font-size:52px"><img src="../icons/zap.png" class="tint-red">OmniRoute</div><div class="tag red" style="display:inline-block;margin-top:8px">★ the best one</div></div>
 <div id="rh" class="neon small" style="left:1260px;top:20px;width:600px;text-align:left;font-size:60px">4 rules</div>
 <div id="r1" class="rule" style="left:1260px;top:130px"><b>1</b>Nothing is unlimited</div>
 <div id="r2" class="rule" style="left:1260px;top:230px"><b>2</b>Clouds see what you send</div>
 <div id="r3" class="rule" style="left:1260px;top:330px"><b>3</b>Kiro / Antigravity: your call</div>
 <div id="r4" class="rule" style="left:1260px;top:430px"><b>4</b>Things break: copy · paste · fix</div>
 <div id="chk" class="stamp" style="left:1270px;top:540px;font-size:44px">CHECK THE BILL ✓</div>
 <div id="w1" class="pill" style="left:345px;top:150px;font-size:34px">📴 offline</div>
 <div id="w2" class="pill" style="left:345px;top:260px;font-size:34px">☁️ in the cloud</div>
 <div id="w3" class="pill red" style="left:345px;top:370px;font-size:34px">⚡ auto-switching</div>
 <div id="kitbox" class="mcard" style="left:1340px;top:100px;width:420px;height:400px"><img src="../icons/package.png" class="tint-red" style="width:150px;height:150px">
   <div class="tt">Free setup kit</div><div class="st">models · prompts · settings</div></div>
 <div id="klink" class="pill red" style="left:1300px;top:540px;font-size:36px">1st link in the description ↓</div>
 <div id="cb" class="cbox" style="left:1290px;top:150px"><div class="u">@you · just now</div><div class="t" id="ct"></div></div>
 <div id="heart" class="pill" style="left:1300px;top:330px;font-size:32px">❤️ 1 · Reply</div>
 <div id="sb" class="subbtn" style="left:1340px;top:200px">SUBSCRIBE</div>
 <div id="sb2" class="subbtn" style="left:1340px;top:200px;background:#e6e6ea;color:#444">SUBSCRIBED 🔔</div>
 <div id="tst" class="pill" style="left:345px;top:220px;font-size:34px">🧪 tested for you</div>
 <div id="rcp" class="pill red" style="left:345px;top:330px;font-size:34px">🧾 receipts included</div>
 <div id="slot" class="slot" style="left:1290px;top:110px"><i>▶</i>WATCH NEXT</div>
 <div id="circ" class="circ" style="left:400px;top:190px">SUBSCRIBE<br>AI with Kalyan</div>
 <div id="dust"></div>
</div>'''
js = r'''
const B = __B__, END = __END__;
const tl = gsap.timeline({paused:true});
function on(sel,t,o={}){tl.fromTo(sel,{opacity:0,scale:o.s??0.6,y:o.y??0,x:o.x??0},{opacity:1,scale:1,y:0,x:0,duration:o.d??0.5,ease:o.e??"back.out(1.7)"},t);}
function off(sel,t){tl.to(sel,{opacity:0,scale:0.85,duration:0.3,ease:"power2.in"},t);}
const dust=document.getElementById('dust');let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
const dots=[];for(let i=0;i<46;i++){const d=document.createElement('div');d.className='dot';dust.appendChild(d);dots.push({x:rnd()*1920,y:rnd()*760,s:0.4+rnd()*1.2,p:rnd()*6.28,v:8+rnd()*22});}
const dd={t:0};tl.fromTo(dd,{t:0},{t:END,duration:END,ease:"none",onUpdate:()=>{dots.forEach((o,i)=>{gsap.set(dust.children[i],{x:o.x+Math.sin(dd.t*0.5+o.p)*30,
  y:(o.y-dd.t*o.v+760)%760,scale:o.s,opacity:0.25+0.5*Math.abs(Math.sin(dd.t+o.p))});});}},0);
const flo=(sel,t0,t1)=>{const o={v:0};tl.fromTo(o,{v:0},{v:1,duration:Math.max(0.1,t1-t0),ease:"none",onUpdate:()=>{gsap.set(sel,{yPercent:Math.sin(o.v*(t1-t0)*1.7)*5});}},t0);};
// decision map
on("#h1",B.map,{x:-120,s:1}); on("#pa",B.oll-0.4,{x:-200}); on("#pb",B.orr-0.4,{x:-200}); on("#pc",B.omni-0.3,{x:200,s:0.4,d:0.7});
tl.to("#pc",{scale:1.06,duration:0.4,yoyo:true,repeat:3,ease:"sine.inOut"},B.omni+0.6); flo("#pa",B.oll,B.rules); flo("#pb",B.orr,B.rules);
off(["#h1","#pa","#pb","#pc"],B.rules-0.15);
// rules
on("#rh",B.rules,{x:120,s:1}); on("#r1",B.r1,{x:300}); on("#r2",B.r2,{x:300}); on("#r3",B.r3,{x:300}); on("#r4",B.r4,{x:300});
on("#chk",B.bill,{s:2.2,d:0.3,e:"power4.out"}); off(["#rh","#r1","#r2","#r3","#r4","#chk"],B.everyone-0.15);
// three ways
on("#w1",B.off,{x:-160}); on("#w2",B.off+0.8,{x:-160}); on("#w3",B.off+1.8,{x:-160}); off(["#w1","#w2","#w3"],B.zero-0.1);
// setup kit
on("#kitbox",B.kit,{y:-200,d:0.7}); on("#klink",B.link); tl.to("#klink",{y:14,duration:0.35,yoyo:true,repeat:3,ease:"sine.inOut"},B.link+0.5);
off(["#kitbox","#klink"],B.comm-0.15);
// comment
on("#cb",B.comm,{x:200}); const ct={n:0},T="Trying method 3 first 🔥",ce=document.getElementById('ct');
tl.fromTo(ct,{n:0},{n:T.length,duration:1.6,ease:"none",onUpdate:()=>{ce.textContent=T.slice(0,Math.round(ct.n));}},B.comm+0.4);
on("#heart",B.comm+2.2); off(["#cb","#heart"],B.sub-0.15);
// subscribe
on("#sb",B.sub,{s:0.4}); tl.to("#sb",{scale:0.9,duration:0.1,yoyo:true,repeat:1},B.sub+1.0); tl.set("#sb",{opacity:0},B.sub+1.2);
tl.fromTo("#sb2",{opacity:0,scale:0.8},{opacity:1,scale:1,duration:0.3,ease:"back.out(2)"},B.sub+1.2); off("#sb2",B.next-0.15);
on("#tst",B.test,{x:-160}); on("#rcp",B.test+0.8,{x:-160}); off(["#tst","#rcp"],B.next-0.15);
// end screen slots (YouTube end-screen elements go here)
on("#slot",B.next,{x:200,s:0.8}); on("#circ",B.week,{x:-160,s:0.8});
tl.to("#slot",{boxShadow:"0 0 60px rgba(229,57,53,.8)",duration:0.6,yoyo:true,repeat:5},B.watch);
window.__timelines["outro"]=tl;
'''
doc = f'''<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=1920, height=1080">
<link rel="stylesheet" href="../lib.css"><style>{css}</style><script src="../vendor/gsap.min.js"></script></head>
<body><div id="root" data-composition-id="outro" data-start="0" data-width="1920" data-height="1080" data-duration="{DUR}">
<section id="outro-scene" class="clip" data-start="0" data-duration="{DUR}" style="position:absolute;inset:0">{html}</section></div>
<script>{js.replace('__B__', json.dumps(B)).replace('__END__', str(DUR))}</script></body></html>'''
open(f'{PROJ}/compositions/outro.html', 'w').write(doc)
json.dump(dict(start=round(T0, 3), dur=DUR, beats=B, fx={k: [round(a + T0, 3), round(b_ + T0, 3)] for k, (a, b_) in FXW.items()}),
          open(f'{PROJ}/outro.json', 'w'), indent=1)
print('outro', T0, DUR)
