"""Five thumbnail concepts for VIDEO-002 (Claude Code for $0, 3 ways). Run from THUMBNAIL-STUDIO/."""
import json, os
D = os.path.dirname(os.path.abspath(__file__))
INK, CORAL, WHITE, RED, GREEN = '#0B0B12', '#E8775F', '#FFFFFF', '#FF4D4F', '#4CD68A'
BG = {'id': 'bg', 'type': 'fill', 'role': 'background',
      'background': f'radial-gradient(900px 620px at 70% 40%, rgba(232,119,95,.30), transparent 70%), radial-gradient(600px 500px at 10% 100%, rgba(110,168,255,.10), transparent 70%), {INK}'}
SH = '0 8px 30px rgba(0,0,0,.7)'
def face(src, x, y, h, box):
    w = int(h * 1.38)
    return {'id': 'face', 'type': 'image', 'role': 'face', 'src': f'assets/cutouts/{src}.png', 'x': x, 'y': y, 'w': w, 'h': h, 'fit': 'contain',
            'position': 'bottom', 'faceBox': box, 'canva': 'separate', 'overflow': 'visible',
            'imgCss': 'filter: drop-shadow(0 0 40px rgba(232,119,95,.35));'}
def card(id_, src, x, y, w, h, role='evidence', border=CORAL):
    return {'id': id_, 'type': 'image', 'role': role, 'src': f'assets/evidence/{src}.png', 'x': x, 'y': y, 'w': w, 'h': h, 'fit': 'cover',
            'radius': 18, 'border': f'5px solid {border}', 'shadow': '0 20px 50px rgba(0,0,0,.65)', 'canva': 'separate'}
def text(id_, t, x, y, size, color=WHITE, role='headline', **kw):
    d = {'id': id_, 'type': 'text', 'role': role, 'text': t, 'x': x, 'y': y, 'size': size, 'color': color, 'shadow': SH}
    d.update(kw); return d
META = dict(titleSynergy='Claude Code for $0: 3 Free Ways (Offline, Cloud, and Real Claude Sonnet)',
            image_prompts=[], canva='Face cutout and evidence crops uploaded as separate images; all text native; background is a CSS gradient (rebuild as a Canva gradient).')

C = {}
# A. Before/After: the price drops from $20/mo to $0, with the real bill as proof
C['A'] = dict(META, option='A', revision=0, archetype='Before/After', headline='$20 → $0',
  story='Same Claude Code, the monthly price goes from $20 to $0, and the real OpenRouter bill shows $0.00.',
  curiosity='How can the same tool cost nothing? (the video answers: swap the model behind it)',
  composition='Face left (40% width). Right: "$20/mo" struck through in red above a huge coral "$0", with the real $0.00 spend card underneath.',
  evidence='assets/evidence/crop-openrouter-0usd.png (OpenRouter Activity, screen recording 123051 @ 382 s); face k1474@348',
  background='Ink with coral glow (CSS gradient)', typography='"$20/mo" 96 px white with red strike; "$0" 260 px coral Inter Display Black',
  colors='Ink, white, coral; red only for the strike', why=['Price contrast is instantly readable at 320 px', 'Proof card makes the $0 believable (receipts angle no competitor shows)', 'Natural explaining expression'],
  risks=['$20 → $0 is a common framing in this niche', 'Evidence card text is small on mobile (it is supporting, not the focal point)'],
  layers=[BG, face('kalyan-k1474_348', -40, 40, 680, {'x': 150, 'y': 70, 'w': 230, 'h': 240}),
          text('was', '$20/mo', 700, 70, 96, WHITE, role='label'),
          {'id': 'strike', 'type': 'shape', 'x': 690, 'y': 112, 'w': 330, 'h': 12, 'background': RED, 'radius': 6, 'css': 'transform: rotate(-8deg);', 'shadow': SH},
          text('now', '$0', 700, 160, 270, CORAL),
          card('proof', 'crop-openrouter-0usd', 690, 450, 560, 128)])
# B. Face + emotion: real Claude Sonnet answering through a free account (the log row)
C['B'] = dict(META, option='B', revision=0, archetype='Face + Emotion', headline='REAL CLAUDE. $0.',
  story='Kalyan, mid-explanation, next to the actual OmniRoute log line: claude-sonnet-4.5 via Kiro, status 200, inside a free combo.',
  curiosity='Real Claude Sonnet for free? How?',
  composition='Face right (k1479@658). Left: two-line headline, the real log row under it with a coral ring on "claude-sonnet-4.5".',
  evidence='assets/evidence/crop-omniroute-sonnet-row.png (OmniRoute logs, recording 121406 @ 167 s)',
  background='Ink with coral glow behind the head', typography='"REAL CLAUDE." white + "$0." coral, 120 px, two lines',
  colors='Ink, white, coral; green 200 badge comes from the real screenshot', why=['Leads with the strongest, most specific claim (real Sonnet), which competitors with "Unlimited/Forever" titles do not prove', 'The log row is genuine evidence'],
  risks=['Log row is detailed; at 320 px it reads as "a log line", not individual words', 'Must not imply every method gives Sonnet (only the combo does); the title says "Real Claude Sonnet" as one of three'],
  layers=[BG, face('kalyan-k1479_658', 600, 40, 680, {'x': 750, 'y': 70, 'w': 220, 'h': 240}),
          text('h1', 'REAL\nCLAUDE.', 50, 70, 130, WHITE, highlight=[]),
          text('h2', '$0.', 50, 330, 170, CORAL),
          card('log', 'crop-omniroute-sonnet-row', 30, 540, 720, 54),
          {'id': 'ring', 'type': 'shape', 'role': 'pointer', 'x': 205, 'y': 527, 'w': 175, 'h': 80, 'radius': 40, 'border': f'5px solid {CORAL}', 'shadow': '0 0 24px rgba(232,119,95,.8)'}])
# C. Minimalist tech: the terminal says it
C['C'] = dict(META, option='C', revision=0, archetype='Minimalist Tech', headline='CLAUDE CODE $0',
  story='No face, no clutter: the real Claude Code header running on "openrouter/free", and a giant $0.',
  curiosity='The official Claude Code header, but on a free model.',
  composition='Giant coral "$0" left two-thirds; real terminal header card right/top, tilted slightly; small "CLAUDE CODE" label above the $0.',
  evidence='assets/evidence/crop-claude-header.png (Claude Code header, recording 123051 @ 268 s)',
  background='Ink, subtle grid glow', typography='"$0" 360 px coral; "CLAUDE CODE" 70 px white', colors='Ink, coral, white',
  why=['Cleanest structure (vidIQ rewarded clean, rectilinear thumbnails: 99 vs 26–51)', 'Real UI as evidence'],
  risks=['No face: less human; relies on the title for the "3 ways" promise', 'Terminal text is small at 320 px'],
  layers=[BG, text('lab', 'CLAUDE CODE', 70, 90, 74, WHITE, role='label'),
          text('zero', '$0', 50, 160, 400, CORAL),
          card('term', 'crop-claude-header', 600, 190, 640, 94, border=WHITE),
          {'id': 'chip', 'type': 'shape', 'x': 600, 'y': 330, 'w': 420, 'h': 70, 'radius': 35, 'background': 'rgba(76,214,138,.15)', 'border': f'3px solid {GREEN}'},
          text('chipt', 'no subscription', 630, 344, 40, GREEN, role='label', font='heavy', shadow='none')])
# D. Curiosity: who is paying? (the terminal says API usage billing, the bill says $0)
C['D'] = dict(META, option='D', revision=0, archetype='Curiosity/Mystery', headline="WHO'S PAYING?",
  story='The Claude Code header says "API Usage Billing", yet the real bill is $0.00. Who is paying? (Free providers, explained in the video.)',
  curiosity='An open question backed by two real screens that seem to contradict each other.',
  composition='Face left (calm, k1474@375). Right column: terminal header card, a coral "?" badge, the $0.00 bill card.',
  evidence='crop-claude-header.png + crop-openrouter-0usd.png (both from recording 123051)',
  background='Ink + coral glow', typography='"WHO\'S PAYING?" 104 px, PAYING? in coral', colors='Ink, white, coral',
  why=['vidIQ flagged "no open question" on competitors; this poses one honestly', 'Two genuine receipts'],
  risks=['Question headline is less direct than "$0"', 'Two cards make it the busiest option'],
  layers=[BG, face('kalyan-k1474_375', -60, 50, 670, {'x': 140, 'y': 75, 'w': 230, 'h': 235}),
          text('h', "WHO'S\nPAYING?", 700, 40, 120, WHITE, highlight=[{'word': 'PAYING?', 'color': CORAL}]),
          card('term', 'crop-claude-header', 690, 320, 560, 82, border=WHITE),
          card('bill', 'crop-openrouter-0usd', 690, 430, 560, 128)])
# E. AI workflow/result: three routes, one result
ways = [('laptop', 'OFFLINE'), ('cloud', 'CLOUD'), ('route', 'COMBO')]
lay = [BG, face('kalyan-k1479_658', 760, 70, 650, {'x': 905, 'y': 95, 'w': 210, 'h': 230}),
       text('h', '3 WAYS.', 50, 40, 132, WHITE), text('h2', '$0.', 560, 40, 132, CORAL)]
for i, (ic, lab) in enumerate(ways):
    y = 220 + i * 140
    lay += [{'id': f'p{i}', 'type': 'shape', 'x': 50, 'y': y, 'w': 560, 'h': 116, 'radius': 24, 'background': 'rgba(255,255,255,.06)', 'border': '2px solid rgba(255,255,255,.18)'},
            {'id': f'i{i}', 'type': 'icon', 'name': ic, 'x': 80, 'y': y + 26, 'w': 64, 'h': 64, 'color': CORAL, 'stroke': 2.4},
            text(f't{i}', lab, 170, y + 26, 66, WHITE, role='label', shadow='none'),
            {'id': f'c{i}', 'type': 'icon', 'name': 'circle-check', 'x': 520, 'y': y + 30, 'w': 58, 'h': 58, 'color': GREEN, 'stroke': 2.6}]
C['E'] = dict(META, option='E', revision=0, archetype='AI Workflow/Result', headline='3 WAYS. $0.',
  story='Three tested routes (offline Ollama, cloud OpenRouter, OmniRoute combo), all ending at $0.',
  curiosity='Which of the three is best for me? (the video ends with a decision map)',
  composition='Headline across the top; three stacked route cards with icons and green checks on the left; face right.',
  evidence='Structure mirrors the real video chapters; checks mean "tested in the video", no invented numbers',
  background='Ink + coral glow', typography='"3 WAYS." white + "$0." coral 132 px; route labels 66 px', colors='Ink, white, coral, green checks',
  why=['Tells the exact promise of the title (3 ways, $0) at a glance', 'Clean grid structure'],
  risks=['Structured "3 ways" list is closest to an existing competitor format (don\'t copy their layout; ours is a vertical checklist with Kalyan\'s face)', 'Icons are generic'],
  layers=lay)
os.makedirs(D, exist_ok=True)
for k, v in C.items(): json.dump(v, open(os.path.join(D, f'{k}.json'), 'w'), indent=1, ensure_ascii=False)
print('wrote', ', '.join(C))
