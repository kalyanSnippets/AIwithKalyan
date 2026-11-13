"""Part 1 v4: 1.05x, 0.2 s pauses; full-screen effect-heavy intro (repo effects + a HyperFrames layer behind the speaker);
explanations as moving HyperFrames scenes; screen recordings pinned to the spoken line (sync points from the OCR index),
zooming only onto what is being described. Face card bottom-left outside the intro. Soft clicks/pops, no whooshes."""
import importlib.util, json, os
_d = os.path.dirname(__file__)
_s = importlib.util.spec_from_file_location('v4cuts', os.path.join(_d, 'fcc_part1_v4_cuts.py'))
_m = importlib.util.module_from_spec(_s); _s.loader.exec_module(_m)
CUTS = _m.CUTS
SPEED = 1.05
CHROME = 'win'    # Windows-style window frames (whole video)
JUMPCUT = True    # skipped footage is cut past, never fast-forwarded on screen
PAUSE_KEEP = 0.2
A, B = '1474', '1477'
MGD = os.path.join(_d, '..', 'compositions', 'fcc-part1-mg')
MG = {s['id']: s for s in json.load(open(os.path.join(MGD, 'scenes.json')))}
INTRO = json.load(open(os.path.join(MGD, 'intro.json')))
def mg(sid): return dict(at=('OUT', MG[sid]['start']), kind='mg', mg=sid)
def S(phrase, src, after, z=None):
    d = dict(at=(B, phrase, after), src=src)
    if z: d['z'] = z
    return d
WIDE = (0.5, 0.5, 1.0)
EXPLORER_BLUR = dict(t0=1.6, t1=21, x=650, y=360, w=1210, h=660)
C = 1222

HOOK = ((A, 23.5), (A, 49.3), ['claude', 'code', 'free', 'brain', 'pay', 'wait', 'stops'])
BADGES = [(('OUT', MG['ollama']['start']), 1, 'Method 1 · Ollama'), (('OUT', MG['ram']['start']), 2, 'Pick your model'),
          ((B, 625.86), 3, 'Claude Code on Ollama')]
W_ = INTRO['fx']
def fxw(k, **kw): return dict(at=('OUT', W_[k][0]), dur=round(W_[k][1] - W_[k][0], 3), **kw)
FX = [  # effects from github.com/Vibha-Ramprakash/claude-video-effects: only these three sit behind the head
    fxw('strike', fx='huge-strike', text='$20/MONTH'),
    fxw('free', fx='spotlight', text='FREE'),
    fxw('led', fx='led-sign', text='STAY TILL|THE END'),
    dict(at=(B, 'Every single word came from a model', 277.1), dur=2.6, fx='spotlight', text='OFFLINE'),
]

SHOTS = [
    dict(at=('OUT', 0.0), kind='intro'),
    mg('ollama'),
    # install: Google -> ollama.com -> Download -> OS tabs -> installer
    dict(at=(B, 52.40), kind='demo', clip=('142752', 0, 47), url='ollama.com/download', header='Install Ollama', sync=[
        S('So go to Ollama.com', 13.0, 56.0, (0.5, 0.3, 1.25)),
        S('click Download', 17.0, 56.0, (0.62, 0.22, 1.6)),
        S('It works on Windows', 26.0, 60.0, (0.62, 0.42, 1.6))],
         pills=[dict(at=(B, 'It works on Windows, Mac, and Linux', 60.6), text='Windows · Mac · Linux', icon='laptop')]),
    dict(at=(B, 70.58), kind='demo', clip=('142752', 81, 93), url='OllamaSetup.exe', header='Install Ollama', sync=[
        S('click through the steps', 84.0, 70.5, (0.62, 0.62, 1.4))]),
    # the three tabs
    mg('tabs'),
    dict(at=(B, 113.18), kind='demo', clip=('142752', 217, 236), url='Ollama · Settings', header='2 settings that matter', sync=[
        S('In Settings, two things matter', 218.0, 113.0, (0.42, 0.42, 1.2)),
        S('First, the Claude toggle', 224.0, 117.0, (0.5, 0.39, 1.75)),
        S('so leave that off', 236.0, 120.0, (0.5, 0.39, 1.75))],
         pills=[dict(at=(B, 'First, the Claude toggle', 117.4), text='1 · Cloud: OFF', icon='cloud-off')]),
    dict(at=(B, 131.70), kind='demo', clip=('142752', 246, 250), url='Ollama · Settings', header='2 settings that matter',
         sync=[S('the context length', 246.5, 131.0, (0.5, 0.82, 1.75))], pills=[dict(at=(B, 131.7), text='2 · Context length', icon='settings', red=True)]),
    mg('context'),
    dict(at=(B, 'So drag this slide', 169.0), kind='demo', clip=('142752', 247, 255), url='Ollama · Settings', header='Set it to 64K',
         zooms=[(247, 0.5, 0.82, 1.75)], pills=[dict(at=(B, 'So drag this slide', 169.0), text='Drag it to 64K', icon='check', red=True)]),
    # first test: open Chat -> model menu -> qwen -> type hi -> downloading -> reply
    dict(at=(B, 178.20), kind='demo', clip=('142752', 338, 446), url='Ollama · Chat', header='First test', sync=[
        S('Open Chat', 343.5, 181.0, (0.3, 0.66, 1.6)),
        S('pick a small model', 344.0, 181.0, (0.53, 0.58, 1.7)),
        S('I pick a small one', 345.5, 206.0, (0.53, 0.58, 1.7)),
        S('and type hi', 350.5, 206.0, (0.6, 0.36, 1.3)),
        S('The first message downloads the model', 355.0, 212.0, (0.3, 0.35, 1.8)),
        S('But hi proves nothing', 440.0, 230.0, (0.4, 0.3, 1.5))],
         pills=[dict(at=(B, 'just to warm things up', 206.2), text='qwen3.5:4b · type "hi"', icon='message-square'),
                dict(at=(B, 'The first message downloads', 212.6), text='First message downloads the model', icon='download')]),
    mg('wifi'),
    dict(at=(B, 241.62), kind='talk'),
    dict(at=(B, 253.04), kind='demo', clip=('142752', 528, 668), url='Ollama · Chat (offline)', header='Offline test', sync=[
        S('make a simple notes app', 531.0, 253.0, (0.28, 0.82, 1.7)),
        S("and it's thinking", 533.0, 253.0, (0.3, 0.3, 1.6)),
        S('it writes the whole thing', 560.0, 256.0, (0.45, 0.5, 1.2)),
        S('completely offline', 640.0, 256.0, WIDE)],
         pills=[dict(at=(B, 253.04), text='Wi-Fi: OFF', icon='wifi-off', red=True)]),
    dict(at=(B, 277.18), kind='talk'),
    dict(at=(B, 315.04), kind='demo', clip=('142752', 742, 762), url='onecompiler.com · the notes app', header='The result', sync=[
        S('Is it pretty?', 746.0, 315.0, (0.77, 0.42, 1.6))], pills=[dict(at=(B, 'Is it pretty?', 315.0), text='Is it pretty? No.', icon='sparkles')]),
    mg('recap'),
    dict(at=(B, 352.02), kind='talk', els=[dict(type='subscribe', at=(B, 'hit Subscribe', 352.0), cx=960, cy=930, click=0.9)]),
    mg('ram'),
    dict(at=(B, 'pretty normal laptop', 395.1), kind='demo', clip=('145317', 22, 55), url='Task Manager · Performance', header='My laptop',
         zooms=[(22, 0.32, 0.45, 1.5)],
         mags=[dict(at=(B, 'sixteen GB of RAM', 395.1), r=(0.24, 0.27, 0.48, 0.35), w=700, cx=C, cy=330, dur=3.0)],
         pills=[dict(at=(B, 'no separate graphics card', 395.1), text='No graphics card · 16 GB RAM', icon='memory-stick', red=True)]),
    mg('tiers'),
    dict(at=(B, 'here is a little trick', 441.3), kind='demo', clip=('145317', 86, 232), url='chatgpt.com', header='Ask an AI', sync=[
        S('I asked ChatGPT', 90.0, 444.0, (0.5, 0.48, 1.35)),
        S('give me the best coding model for Ollama', 150.0, 451.0, (0.5, 0.48, 1.35)),
        S('because new model comes out', 180.0, 451.0, WIDE),
        S('And it suggested MiMo', 222.0, 468.0, WIDE)],
         mags=[dict(at=(B, 'And it suggested MiMo', 468.3), r=(0.28, 0.41, 0.76, 0.49), w=1000, cx=C, cy=430, dur=4.0)],
         pills=[dict(at=(B, 'and the latest one', 451.3), text='Ask for the LATEST model', icon='sparkles'),
                dict(at=(B, 'And it suggested MiMo', 468.3), text='Answer: MiMo v2.6 · 9B', icon='bot', red=True)]),
    dict(at=(B, 479.66), kind='demo', clip=('145317', 238, 252), url='Ollama · model list', header='First problem',
         pills=[dict(at=(B, "wasn't in Ollama's drop-down", 479.6), text="MiMo isn't in the list", icon='x', red=True)]),
    dict(at=(B, 498.88), kind='demo', clip=('145317', 268.5, 277), url='Windows PowerShell', header='Try the terminal', zooms=[(268.5, 0.32, 0.26, 1.6)]),
    dict(at=(B, 510.30), kind='demo', clip=('145317', 274, 289), url='Windows PowerShell', header='Try the terminal', sync=[S('too old', 276.5, 510.0, (0.3, 0.24, 1.5))],
         mags=[dict(at=(B, 'too old', 510.3), r=(0.03, 0.215, 0.62, 0.275), w=1000, cx=C, cy=420, dur=3.0)],
         pills=[dict(at=(B, 'too old', 510.3), text='Error: Ollama too old', icon='triangle-alert', red=True),
                dict(at=(B, 'and I was still stuck', 512.8), text='Updated… still stuck', icon='x')]),
    dict(at=(B, 'And this is exactly where a five-minute', 516.3), kind='talk'),
    mg('antigravity'),
    dict(at=(B, 'Download it from antigravity.google', 543.5), kind='demo', clip=('145317', 353.5, 362), url='antigravity.google/download',
         header='Get Antigravity'),
    dict(at=(B, 'I am running AI model locally', 549.0), kind='graphic', header='One sentence', els=[
        dict(type='prompt', at=(B, 'I am running AI model locally', 549.0),
             text="I'm running AI models locally. Install mimo-v2.6:9b and set everything up so it works with Ollama.",
             hl_words=['Install mimo-v2.6:9b', 'works with Ollama'], cx=C, cy=440, cps=14),
        dict(type='pill', at=(B, 559.6), text='Exact prompt in the setup kit', icon='package', cx=C, cy=780)]),
    dict(at=(B, 569.16), kind='demo', clip=('151536', 0, 6), url='Antigravity', header='Allow each step',
         zooms=[(0, .5, .5, 1.0), (0.5, 0.75, 0.75, 1.6)],
         pills=[dict(at=(B, 'Read each step and then allow', 574.7), text='Read it → Allow', icon='shield-check')]),
    dict(at=(B, 577.22), kind='demo', clip=('121640', 0, 8), url='Antigravity', header='Installed & tested',
         pills=[dict(at=(B, 577.22), text='Installed and tested', icon='circle-check-big')]),
    dict(at=(B, 'Close Ollama, open it again', 580.0), kind='demo', clip=('121640', 14, 22), url='Ollama · model list', header='It is there',
         mags=[dict(at=(B, 'right there in the drop-down', 582.0), r=(0.40, 0.56, 0.70, 0.61), w=760, cx=C, cy=330, dur=2.4)]),
    mg('rule'),
    dict(at=(B, 625.86), kind='talk'),
    dict(at=(B, 'In Ollama, go to Apps', 629.5), kind='demo', clip=('121640', 22, 33), url='Ollama · Apps', header='Apps → Claude Code', sync=[
        S('go to Apps', 22.5, 629.5, (0.35, 0.3, 1.5)),
        S('and click Claude Code', 25.5, 629.5, (0.4, 0.3, 1.6)),
        S('See that little message', 27.2, 638.0, (0.6, 0.25, 1.6))],
         mags=[dict(at=(B, 'It copied the launch command', 639.0), r=(0.44, 0.20, 0.76, 0.29), w=860, cx=C, cy=360, dur=3.0)],
         pills=[dict(at=(B, 'Ollama launch Claude', 640.3), text='ollama launch claude', icon='terminal', red=True)]),
    dict(at=(B, 647.50), kind='demo', clip=('121640', 30, 55), url='File Explorer', header='Open a terminal in a folder', blur=EXPLORER_BLUR,
         zooms=[(30, .5, .5, 1.0), (32.5, 0.62, 0.45, 1.35)],
         pills=[dict(at=(B, 'Mine is called Claude Code', 650.2), text='Folder: claude-code', icon='folder'),
                dict(at=(B, 'right-click in the empty space', 656.2), text='Right-click → Open in Terminal', icon='mouse-pointer-click')]),
    dict(at=(B, 'Paste the command and hit Enter', 659.9), kind='graphic', header='Paste & Enter', els=[
        dict(type='terminal', at=(B, 'Paste the command and hit Enter', 659.9), w=1180, title='PowerShell · claude-code',
             lines=[('PS C:\\claude-code> ollama launch claude', (235, 235, 240)),
                    ('Claude Code is not installed. Install it now? (Y/n)  y', (254, 188, 46)),
                    ('✓ Claude Code installed', (40, 200, 64)),
                    ('Pick a model:  > mimo-v2.6:9b   (local)', (235, 235, 240))],
             lines_at=[(B, 'Paste the command and hit Enter', 659.9), (B, 'If the Claude Code', 661.9), (B, 'And this is the real Claude Code', 668.9),
                       (B, 'Then it asks which model', 673.9)], cx=C, cy=430),
        dict(type='pill', at=(B, 'not a copy', 668.9), text="Anthropic's official app · not a copy", icon='logo-claude', cx=C, cy=760),
        dict(type='pill', at=(B, 659.9), text='illustration', icon='app-window', cx=1760, cy=110, size=20)]),
    dict(at=(B, 680.74), kind='talk', els=[
        dict(type='pill', at=(B, 'No subscription, no API key', 680.7), text='No subscription · no API key', icon='check', cx=960, cy=960)]),
    mg('job'),
    dict(at=(B, 746.42), kind='talk', els=[
        dict(type='pill', at=(B, 'private offline option', 746.4), text='Method 1 = private + offline', icon='lock', cx=960, cy=960,
             until=(B, "so let's move to the cloud", 749.7)),
        dict(type='pill', at=(B, "so let's move to the cloud", 749.7), text='Next: Method 2 · the cloud', icon='cloud', cx=960, cy=960, red=True)]),
]
