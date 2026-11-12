"""Part 1 v4 intro: one transparent HyperFrames layer (0 -> "So let's start") that the compositor puts BEHIND
Kalyan (person segmentation) on a darkened wall. Kalyan's head sits around x 960, y 380; free wall: left x 330-700,
right x 1290-1850, top band y 20-330 behind the head. Plants (left x<330, right x 1400-1720 / y>690) stay in front.
Usage: python3 edits/fcc_intro_build.py fcc-part1-v4
"""
import json, re, sys
ROOT = '/home/user/AIwithKalyan'
PROJ = f'{ROOT}/compositions/fcc-part1-mg'
name = sys.argv[1] if len(sys.argv) > 1 else 'fcc-part1-v4'
W = json.load(open(f'/tmp/fcc-style/{name}_words.json'))
WORDS = W['words']
def tok(s): return re.sub(r'[^a-z0-9]', '', s.lower())
TOKS = [tok(w[3]) for w in WORDS]
def at(phrase, after=0.0):
    q = [tok(x) for x in phrase.split() if tok(x)]
    for i, w in enumerate(WORDS):
        if w[0] >= after - 0.05 and TOKS[i:i + len(q)] == q: return round(w[0], 3)
    raise SystemExit(f'not found: {phrase!r} after {after}')

B = dict(
    cc=0.1, price=at('twenty dollars a month'), limit=at('the moment you hit'), stops=at('it just stops'), pay=at('You either pay more'),
    wait=at('or you wait'), know=at('But here is what'), free=at('Claude Code itself is free'), brain=at('the brain inside it'),
    swap=at('swap that brain'), freeones=at('for free ones'), phone=at("Let's take a phone"), hw=at('just the hardware'),
    sim=at('and the SIM card decides'), ccphone=at('Claude Code is like the phone'), rwr=at('can read'), model=at('The AI model is like the SIM'),
    simprice=at("Anthropic's model costs"), others=at('accepts other SIMs'), end=at('So by the end of this video'), zero=at('for zero dollars'),
    three=at('three different ways'), m1=at('First, completely'), wifi=at('switch the Wi-Fi off'), m2=at('Then free AI models'),
    trap=at('the one trap'), m3=at('And finally, several'), sonnet=at('Claude Sonnet answering'), logs=at('with the logs'),
    kit=at('And I have put everything'), list=at('the model list'), prompt=at('every prompt'), setting=at('and every setting'),
    link=at('first link in the description'), stay=at('So stay till the end'), nobody=at('Nobody paid for this video'),
    worked=at('I have already worked through'), receipt=at("I'll show you the receipt"), start=at("So let's start"))
DUR = round(B['start'] + 0.9, 3)
FX_WINDOWS = {  # repo effects run here; the layer stays empty in these windows
    'strike': (B['price'], B['limit']), 'free': (B['free'], B['brain']), 'led': (B['stay'], B['nobody'])}

def sims(n, left, top, gap):
    return ''.join(f'<div id="fs{i}" class="sim small"><div class="chip"></div><b>$0</b></div>' for i in range(n))

html = '''
<div id="L" class="lay">
 <!-- 1 neon title -->
 <div id="neon1" class="neon" style="left:420px;top:40px;width:1080px">Claude Code</div>
 <div id="tool" class="pill" style="left:1330px;top:330px">★ #1 AI coding tool</div>
 <!-- usage meter (right wall) -->
 <div id="meter" class="glass" style="left:1300px;top:150px;width:520px;height:250px">
   <div class="lbl">USAGE THIS MONTH</div><div class="big" id="pct" style="font-size:96px">0%</div>
   <div class="track"><div id="fill" class="fillbar"></div></div></div>
 <div id="limit" class="stamp" style="left:1290px;top:430px">LIMIT REACHED</div>
 <div id="paym" class="pill red" style="left:350px;top:330px;font-size:44px">💸 PAY MORE</div>
 <div id="waitw" class="pill" style="left:1360px;top:330px;font-size:44px">⏳ WAIT 5 HOURS</div>
 <!-- brain halo behind head -->
 <div id="halo" class="halo" style="left:1300px;top:40px"><img src="../icons/brain.png" class="tint-red"></div>
 <div id="halop" class="pill red" style="left:1360px;top:500px;font-size:44px">$20 / month brain</div>
 <div id="halo2" class="halo green" style="left:1300px;top:40px"><img src="../icons/brain.png"></div>
 <div id="halo2p" class="pill" style="left:1380px;top:500px;font-size:44px;background:#2ecc71;color:#fff">FREE brain · $0</div>
 <!-- 3D phone (right wall) -->
 <div id="stage3d" style="position:absolute;left:1300px;top:40px;width:520px;height:700px;perspective:1400px">
  <div id="phone" class="phone3d"><div class="edge"></div>
   <div class="scr"><div id="hw" class="hwtxt">HARDWARE</div>
     <div id="boot" class="boot"><img src="../icons/logo-claude.png"><div class="t">Claude Code</div>
       <div class="rw"><span id="rw1">read</span><span id="rw2">write</span><span id="rw3">run</span></div></div>
     <div id="bill" class="billtxt">$20<small>/mo</small></div><div id="zero" class="billtxt green">$0</div></div>
   <div id="tray" class="tray"><div class="chip"></div></div></div></div>
 <div id="bigsim" class="sim big" style="left:330px;top:260px"><div class="chip"></div><b id="simlbl">SIM</b><i id="simprice">$20 / month</i></div>
 <div id="lbl1" class="neon small" style="left:40px;top:40px;width:680px;text-align:left;font-size:62px">phone = Claude Code</div>
 <div id="lbl2" class="neon small" style="left:40px;top:130px;width:680px;text-align:left;color:#ffb3a9;font-size:62px">SIM = the AI model</div>
 ''' + ''.join(f'<div id="fs{i}" class="sim small"><div class="chip"></div><b>$0</b></div>' for i in range(3)) + '''
 <!-- plan -->
 <div id="zeroN" class="neon" style="left:40px;top:60px;width:660px;font-size:170px">$<span id="zn">20</span></div>
 <div id="c1" class="mcard" style="left:320px;top:60px"><div class="n">1</div><img src="../icons/logo-ollama.png" class="tint-ink">
   <div class="tt">Ollama</div><div class="st">on your laptop</div><div id="c1t" class="tag red">Wi-Fi OFF</div></div>
 <div id="c2" class="mcard" style="left:320px;top:390px"><div class="n">2</div><img src="../icons/cloud.png" class="tint-red">
   <div class="tt">OpenRouter</div><div class="st">free cloud models</div><div id="c2t" class="tag">⚠ the trap</div></div>
 <div id="c3" class="mcard best" style="left:1300px;top:80px;width:440px;height:520px"><div class="n">3</div><img src="../icons/zap.png" class="tint-red">
   <div class="tt">OmniRoute</div><div class="st">many free providers</div><div id="c3t" class="tag red"><img src="../icons/logo-claude.png" style="width:28px;height:28px;margin:0 6px -6px 0">real Claude Sonnet</div>
   <div id="c3l" class="tag">🧾 logs prove it</div></div>
 <!-- setup kit -->
 <div id="kitbox" class="mcard" style="left:1340px;top:120px;width:420px;height:440px"><img src="../icons/package.png" class="tint-red" style="width:170px;height:170px">
   <div class="tt">Free setup kit</div><div class="st">copy · paste · done</div></div>
 <div id="k1" class="pill" style="left:300px;top:140px;font-size:40px">📋 Model list</div>
 <div id="k2" class="pill" style="left:300px;top:280px;font-size:40px">💬 Every prompt</div>
 <div id="k3" class="pill" style="left:300px;top:420px;font-size:40px">⚙️ Every setting</div>
 <div id="klink" class="pill red" style="left:1290px;top:600px;font-size:36px">1st link in description ↓</div>
 <!-- receipt -->
 <div id="rcpt" class="receipt" style="left:1360px;top:20px"><div id="rin">
   <div class="rh">RECEIPT</div><div>Claude Code ........ $0.00</div><div>Ollama ............. $0.00</div><div>OpenRouter ......... $0.00</div>
   <div>OmniRoute .......... $0.00</div><div class="rt">TOTAL .............. $0.00</div><div class="rp">✓ PAID: NOTHING</div></div></div>
 <div id="neonR" class="neon small" style="left:60px;top:140px;width:640px;text-align:left;font-size:72px">receipts ✓</div>

 <div id="nsp" class="stamp" style="left:1300px;top:200px;font-size:58px">NOT SPONSORED</div>
 <div id="tst" class="pill" style="left:300px;top:250px;font-size:40px">✓ Every setup tested</div>
 <div id="tst2" class="pill red" style="left:300px;top:390px;font-size:40px">✓ Every trap found</div>
 <div id="dust"></div>
</div>
'''
css = '''
html,body,#root{background:transparent!important}
.lay{position:absolute;inset:0}
.lay>*{position:absolute;opacity:0}
@font-face{font-family:"Serif";src:url("fonts/InstrumentSerif-Italic.ttf")}
.neon{font-family:"Serif",serif;font-style:italic;font-size:200px;text-align:center;color:#ffd2c8;line-height:1;
 text-shadow:0 0 12px #ff8a75,0 0 40px #ff5a45,0 0 90px #e53935,0 0 160px #e53935}
.neon.small{font-size:78px;white-space:nowrap}
.glass{background:rgba(20,20,26,.72);border:2px solid rgba(255,255,255,.18);border-radius:28px;padding:28px;box-sizing:border-box;
 box-shadow:0 0 60px rgba(229,57,53,.35)}
.glass .lbl{font-weight:800;font-size:24px;letter-spacing:3px;color:#cfcfd6}
.track{height:30px;border-radius:16px;background:#2a2a32;margin-top:14px;overflow:hidden}
.fillbar{height:100%;width:0;background:linear-gradient(90deg,#ffb74d,#e53935);box-shadow:0 0 30px #e53935}
.stamp{font-weight:900;font-size:66px;color:#ff4d47;border:8px solid #ff4d47;border-radius:16px;padding:6px 26px;transform:rotate(-8deg);
 text-shadow:0 0 20px rgba(229,57,53,.8);box-shadow:0 0 30px rgba(229,57,53,.6)}
.halo{width:520px;height:440px;display:flex;align-items:center;justify-content:center;
 background:radial-gradient(closest-side,rgba(229,57,53,.55),rgba(229,57,53,.15) 60%,transparent)}
.halo.green{background:radial-gradient(closest-side,rgba(46,204,113,.55),rgba(46,204,113,.12) 60%,transparent)}
.halo img{width:300px;height:300px;filter:drop-shadow(0 0 30px #e53935)}
.halo.green img{filter:drop-shadow(0 0 30px #2ecc71)}
.phone3d{position:absolute;left:110px;top:20px;width:300px;height:620px;border-radius:52px;background:#0b0b0e;border:8px solid #3a3a44;
 transform-style:preserve-3d;box-shadow:0 0 80px rgba(229,57,53,.45),0 40px 80px rgba(0,0,0,.6)}
.phone3d .edge{position:absolute;inset:-8px;border-radius:56px;transform:translateZ(-18px);background:#26262e}
.scr{position:absolute;inset:16px;border-radius:40px;background:linear-gradient(160deg,#1c1c22,#101014);overflow:hidden;
 display:flex;align-items:center;justify-content:center}
.hwtxt{font-weight:900;font-size:34px;letter-spacing:4px;color:#6f6f7a}
.boot{position:absolute;display:flex;flex-direction:column;align-items:center;gap:10px;opacity:0}
.boot img{width:130px;height:130px;filter:drop-shadow(0 0 24px #D97757)}
.boot .t{font-weight:900;font-size:36px}
.rw{display:flex;gap:8px}.rw span{background:#f5efe6;color:#111;font-weight:800;font-size:20px;border-radius:20px;padding:6px 12px;opacity:0}
.billtxt{position:absolute;bottom:60px;font-weight:900;font-size:76px;color:#ff6b66;opacity:0;text-shadow:0 0 30px #e53935}
.billtxt small{font-size:30px}.billtxt.green{color:#5dff9e;text-shadow:0 0 30px #2ecc71}
.tray{position:absolute;right:-8px;top:250px;width:90px;height:120px;background:#9a9aa6;border-radius:10px 0 0 10px}
.tray .chip,.sim .chip{width:56px;height:44px;border-radius:8px;background:linear-gradient(135deg,#f3d27a,#b8860b);margin:18px auto 0}
.sim{width:220px;height:300px;background:#f4f4f7;color:#111;border-radius:22px;clip-path:polygon(20% 0,100% 0,100% 100%,0 100%,0 15%);
 display:flex;flex-direction:column;align-items:center;box-shadow:0 0 50px rgba(229,57,53,.6)}
.sim .chip{width:110px;height:86px;margin-top:50px}
.sim b{font-weight:900;font-size:44px;margin-top:20px}.sim i{font-style:normal;font-weight:900;font-size:30px;color:#e53935;opacity:0}
.sim.small{width:120px;height:160px;box-shadow:0 0 40px rgba(46,204,113,.8)}
.sim.small .chip{width:60px;height:46px;margin-top:26px}.sim.small b{font-size:34px;color:#1a8f45;margin-top:8px}
.mcard{width:330px;height:300px;background:#fff;color:#111;border-radius:28px;display:flex;flex-direction:column;align-items:center;
 justify-content:center;gap:6px;box-shadow:0 0 50px rgba(229,57,53,.35),0 30px 60px rgba(0,0,0,.6)}
.mcard img{width:100px;height:100px}.mcard .tt{font-weight:900;font-size:42px}.mcard .st{font-weight:700;font-size:24px;color:#666}
.mcard .n{position:absolute;left:18px;top:14px;width:52px;height:52px;border-radius:14px;background:#e53935;color:#fff;font-weight:900;
 font-size:32px;display:flex;align-items:center;justify-content:center}
.mcard.best{border:6px solid #e53935;box-shadow:0 0 90px rgba(229,57,53,.7)}
.mcard img.tint-ink{background:#111;border-radius:22px;padding:10px;filter:none}
.tag{font-weight:800;font-size:24px;border-radius:999px;padding:8px 16px;background:#ffe0de;color:#111;margin-top:6px}
.tag.red{background:#e53935;color:#fff}
.receipt{width:440px;height:0;overflow:hidden;background:#f6f1e7;color:#111;font-family:"JBMono",monospace;font-size:24px;
 box-shadow:0 0 50px rgba(255,255,255,.25)}
#rin{padding:26px 24px;line-height:1.8}.rh{font-weight:700;font-size:34px;text-align:center;letter-spacing:6px;margin-bottom:6px}
.rt{border-top:3px dashed #111;margin-top:8px;padding-top:6px;font-weight:700}.rp{color:#1a8f45;font-weight:700;text-align:center;margin-top:8px}
#dust{inset:0;opacity:1!important}
.dot{position:absolute;width:6px;height:6px;border-radius:50%;background:#ff8a75;box-shadow:0 0 12px #ff5a45}
'''
js = r'''
const B = __B__, END = __END__;
const tl = gsap.timeline({paused:true});
function on(sel,t,o={}){tl.fromTo(sel,{opacity:0,scale:o.s??0.6,y:o.y??0,x:o.x??0,rotation:o.r??0},{opacity:1,scale:1,y:0,x:0,rotation:0,duration:o.d??0.5,ease:o.e??"back.out(1.7)"},t);}
function off(sel,t,o={}){tl.to(sel,{opacity:0,scale:o.s??0.85,y:o.y??0,duration:o.d??0.35,ease:"power2.in"},t);}
function floaty(sel,t0,t1,amp=12,per=2.4){const o={v:0};tl.fromTo(o,{v:0},{v:1,duration:t1-t0,ease:"none",onUpdate:()=>{
  const tt=o.v*(t1-t0);gsap.set(sel,{y:Math.sin(tt*6.283/per)*amp});}},t0);}
// dust particles (deterministic)
const dust=document.getElementById('dust');let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
const dots=[];for(let i=0;i<46;i++){const d=document.createElement('div');d.className='dot';dust.appendChild(d);
  dots.push({x:rnd()*1920,y:rnd()*760,s:0.4+rnd()*1.2,p:rnd()*6.28,v:8+rnd()*22});}
const dd={t:0};tl.fromTo(dd,{t:0},{t:END,duration:END,ease:"none",onUpdate:()=>{dots.forEach((o,i)=>{
  gsap.set(dust.children[i],{x:o.x+Math.sin(dd.t*0.5+o.p)*30,y:(o.y-dd.t*o.v+760)%760,scale:o.s,opacity:0.25+0.5*Math.abs(Math.sin(dd.t+o.p))});});}},0);
// 1 neon title + usage meter
on("#neon1",B.cc,{s:1.3,d:0.7,e:"power3.out"}); tl.to("#neon1",{opacity:0.25,duration:0.08,yoyo:true,repeat:3},B.cc+0.7);
on("#tool",B.cc+1.0); off(["#neon1","#tool"],B.price-0.15);
on("#meter",B.limit-0.1,{y:40}); tl.to("#fill",{width:"100%",duration:2.2,ease:"power2.in"},B.limit+0.2);
const pc={v:0};tl.fromTo(pc,{v:0},{v:100,duration:2.2,ease:"power2.in",onUpdate:()=>{document.getElementById('pct').textContent=Math.round(pc.v)+'%';}},B.limit+0.2);
on("#limit",B.stops,{s:2.2,d:0.25,e:"power4.out"}); tl.to("#meter",{x:-14,duration:0.05,yoyo:true,repeat:7},B.stops);
off(["#meter","#limit"],B.pay-0.1);
on("#paym",B.pay,{x:-120}); on("#waitw",B.wait,{x:120}); off(["#paym","#waitw"],B.free-0.2);
// brain halo swap
on("#halo",B.brain-0.1,{s:0.3,d:0.7,e:"power3.out"}); on("#halop",B.brain+0.4);
tl.to("#halo",{scale:1.08,duration:0.6,yoyo:true,repeat:3,ease:"sine.inOut"},B.brain+0.8);
tl.to("#halo",{x:-900,rotation:-40,opacity:0,duration:0.7,ease:"power3.in"},B.swap); off("#halop",B.swap);
on("#halo2",B.freeones,{s:0.2,d:0.8,e:"elastic.out(1,0.5)"}); on("#halo2p",B.freeones+0.3); off(["#halo2","#halo2p"],B.phone-0.2);
// 3D phone
tl.set("#stage3d",{opacity:1},B.phone); on("#phone",B.phone,{y:300,s:0.8,d:0.9,e:"power3.out"});
const ph={v:0};tl.fromTo(ph,{v:0},{v:1,duration:B.end-B.phone,ease:"none",onUpdate:()=>{const tt=ph.v*(B.end-B.phone);
  gsap.set("#phone",{rotationY:-28+Math.sin(tt*0.9)*14,rotationX:6+Math.sin(tt*0.6)*4,y:Math.sin(tt*1.3)*14});}},B.phone);
tl.to("#hw",{opacity:0,duration:0.3},B.ccphone); tl.fromTo("#boot",{opacity:0,scale:0.4},{opacity:1,scale:1,duration:0.6,ease:"back.out(2)"},B.ccphone+0.1);
on("#lbl1",B.ccphone,{x:-80,s:1}); ["#rw1","#rw2","#rw3"].forEach((s,i)=>tl.fromTo(s,{opacity:0,y:20},{opacity:1,y:0,duration:0.3},B.rwr+i*0.9));
tl.fromTo("#tray",{x:0},{x:120,duration:0.5,ease:"power2.out"},B.sim);
on("#bigsim",B.sim+0.4,{x:900,r:200,s:0.3,d:0.9,e:"power3.out"});
const sp={v:0};tl.fromTo(sp,{v:0},{v:1,duration:B.others-B.sim,ease:"none",onUpdate:()=>{gsap.set("#bigsim",{rotationY:Math.sin(sp.v*(B.others-B.sim)*1.2)*25});}},B.sim+1.3);
on("#lbl2",B.model,{x:-80,s:1}); tl.to("#simprice",{opacity:1,duration:0.3},B.simprice); tl.to("#bill",{opacity:1,duration:0.3},B.simprice+0.3);
tl.to("#boot",{opacity:0.3,duration:0.3},B.simprice+0.3); tl.to("#bigsim",{x:-40,duration:0.06,yoyo:true,repeat:5},B.simprice+0.4);
tl.to("#bigsim",{y:900,rotation:-60,opacity:0,duration:0.9,ease:"power3.in"},B.others); tl.to("#bill",{opacity:0,duration:0.3},B.others);
const orb={v:0};[0,1,2].forEach(i=>tl.set("#fs"+i,{opacity:1},B.others+0.3));
tl.fromTo(orb,{v:0},{v:1,duration:B.end-B.others-0.3,ease:"none",onUpdate:()=>{const tt=orb.v*(B.end-B.others-0.3);[0,1,2].forEach(i=>{
  const a=tt*1.6+i*2.094, r=280*(i==0?Math.max(0,1-Math.max(0,tt-1.2)/0.8):1);
  gsap.set("#fs"+i,{x:1500+Math.cos(a)*r,y:300+Math.sin(a)*r*0.5,rotation:Math.sin(a)*20,scale:0.6+0.4*((Math.sin(a)+1)/2)});});}},B.others+0.3);
tl.to("#zero",{opacity:1,duration:0.4},B.others+2.2); tl.to("#boot",{opacity:1,duration:0.3},B.others+2.2);
off(["#phone","#lbl1","#lbl2","#fs0","#fs1","#fs2","#tray"],B.end-0.15); tl.set("#stage3d",{opacity:0},B.end+0.3);
// plan
on("#zeroN",B.end,{s:1.3,e:"power3.out"});const zn={v:20};tl.fromTo(zn,{v:20},{v:0,duration:0.9,ease:"power2.out",onUpdate:()=>{document.getElementById('zn').textContent=Math.round(zn.v);}},B.zero);
off("#zeroN",B.three-0.1);
on("#c1",B.m1,{x:-200}); on("#c1t",B.wifi); on("#c2",B.m2,{x:-200}); on("#c2t",B.trap); tl.to("#c2t",{x:-10,duration:0.05,yoyo:true,repeat:5},B.trap+0.4);
on("#c3",B.m3,{x:200,s:0.5,d:0.7}); on("#c3t",B.sonnet); on("#c3l",B.logs); tl.to(["#c1","#c2"],{opacity:0.45,duration:0.4},B.m3+0.3);
floaty("#c3",B.m3+0.8,B.kit,10,2.6); off(["#c1","#c2","#c3"],B.kit-0.15);
// setup kit
on("#kitbox",B.kit,{y:-200,d:0.7}); floaty("#kitbox",B.kit+0.8,B.stay,10,2.2);
on("#k1",B.list,{x:600,s:0.4}); on("#k2",B.prompt,{x:600,s:0.4}); on("#k3",B.setting,{x:600,s:0.4});
on("#klink",B.link); tl.to("#klink",{y:14,duration:0.35,yoyo:true,repeat:3,ease:"sine.inOut"},B.link+0.5);
off(["#kitbox","#k1","#k2","#k3","#klink"],B.stay-0.1);
on("#nsp",B.nobody,{s:2.4,d:0.3,e:"power4.out"}); off("#nsp",B.receipt-0.2);
on("#tst",B.worked,{x:-160}); on("#tst2",B.worked+1.2,{x:-160}); off(["#tst","#tst2"],B.receipt-0.2);
// receipt
tl.set("#rcpt",{opacity:1},B.receipt); tl.fromTo("#rcpt",{height:0},{height:470,duration:1.6,ease:"steps(16)"},B.receipt);
on("#neonR",B.receipt+0.3,{x:-80,s:1}); off(["#rcpt","#neonR"],END-0.35);
window.__timelines["intro"]=tl;
'''
FXW = json.dumps({k: [round(a, 3), round(b, 3)] for k, (a, b) in FX_WINDOWS.items()})
doc = f'''<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=1920, height=1080">
<link rel="stylesheet" href="../lib.css"><style>{css}</style><script src="../vendor/gsap.min.js"></script></head>
<body><div id="root" data-composition-id="intro" data-start="0" data-width="1920" data-height="1080" data-duration="{DUR}">
<section id="intro-scene" class="clip" data-start="0" data-duration="{DUR}" style="position:absolute;inset:0">{html}</section></div>
<script>{js.replace('__B__', json.dumps(B)).replace('__END__', str(DUR))}</script></body></html>'''
open(f'{PROJ}/compositions/intro.html', 'w').write(doc)
json.dump(dict(dur=DUR, beats=B, fx=json.loads(FXW)), open(f'{PROJ}/intro.json', 'w'), indent=1)
print('intro', DUR, 's'); print(FXW)
