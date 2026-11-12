"""Part 1 (intro + Method 1: Ollama) in the reference style. Anchors are (take, phrase|seconds[, search-from seconds]);
phrases are matched against the ElevenLabs Scribe words, starting at the kept read's cut time."""
import importlib.util
_s = importlib.util.spec_from_file_location('parts', '/home/user/AIwithKalyan/edits/free-claude-code.parts.py')
_p = importlib.util.module_from_spec(_s); _s.loader.exec_module(_p)
CUTS = [c for sec in _p.PART1 for c in sec[2]]

A, B = '1474', '1477'
L, M, R = 285, 715, 1145          # three columns on the stage (left of the face card)
EXPLORER_BLUR = dict(t0=1.6, t1=21, x=650, y=360, w=1210, h=660)

HOOK = ((A, 23.5), (A, 49.3), ['claude', 'code', 'twenty', 'dollars', 'free', 'brain', 'stops', 'pay'])

BADGES = [((A, 55.62), 1, 'How this works'), ((B, 20.82), 2, 'Method 1 · Ollama'),
          ((B, 364.12), 3, 'Pick your model'), ((B, 625.86), 4, 'Claude Code on Ollama')]

FX = [
    dict(at=(A, 'twenty dollars a month', 23.5), dur=2.4, fx='huge-strike', text='$20/MONTH'),
    dict(at=(A, 'Claude Code itself is free', 39.5), dur=1.9, fx='backdrop-word', text='FREE'),
    dict(at=(A, 'Nobody paid for this video', 201.0), dur=1.9, fx='reject-stamp', text='NOT SPONSORED', y=0.80, angle=-8),
    dict(at=(B, 'Every single word came from a model', 277.1), dur=3.2, fx='spotlight', text='OFFLINE'),
    dict(at=(B, 'Actually, pause the video', 384.4), dur=3.2, fx='pause-point', text='PAUSE & CHECK YOURS'),
    dict(at=(B, "that's going to be the rule", 594.3), dur=2.6, fx='led-sign', text='THE RULE'),
]

SHOTS = [
    # ---------------- 1 · hook (talking head, kinetic captions)
    dict(at=(A, 23.5), kind='talk'),
    # ---------------- 2 · phone / SIM example
    dict(at=(A, 55.62), kind='graphic', header='How this works', els=[
        dict(type='card', at=(A, 'Claude Code is like the phone', 64.0), title='Claude Code', sub='= the phone\nfree app from Anthropic',
             icon='logo-claude', cx=L, cy=470, w=400),
        dict(type='card', at=(A, 'The AI model is like the SIM', 73.0), title='AI model', sub='= the SIM card\nthe brain that thinks',
             icon='brain', cx=M, cy=470, w=400),
        dict(type='pill', at=(A, "Anthropic's model costs", 77.5), text="Anthropic's brain: $20/month", icon='coins', cx=M, cy=790, red=True),
        dict(type='card', at=(A, 'accepts other SIMs', 80.0), title='Free SIMs', sub='other brains\nthat cost $0', icon='sparkles', cx=R, cy=470, w=400),
    ]),
    # ---------------- 3 roadmap
    dict(at=(A, 95.30), kind='graphic', header="Here's the plan", els=[
        dict(type='pill', at=(A, 95.30), text='The real Claude Code · $0 · 3 ways', icon='check', cx=M, cy=200),
        dict(type='card', at=(A, 'First, completely on your own laptop', 105.0), num=1, title='Ollama', sub='your own laptop\nWi-Fi OFF',
             icon='logo-ollama', cx=L, cy=540, w=380, hl=(A, 'First, completely on your own laptop', 105.0)),
        dict(type='card', at=(A, 'Then free AI models in the cloud', 114.5), num=2, title='OpenRouter', sub='free cloud models\n+ the one trap',
             icon='cloud', cx=M, cy=540, w=380, hl=(A, 'Then free AI models in the cloud', 114.5)),
        dict(type='card', at=(A, 'And finally, several free providers', 164.3), num=3, title='OmniRoute', sub='many free providers\nreal Claude Sonnet',
             icon='zap', cx=R, cy=540, w=380, hl=(A, 'And finally, several free providers', 164.3)),
        dict(type='pill', at=(A, 'with the logs to prove it', 164.3), text='Receipts: the logs prove it', icon='receipt', cx=M, cy=880),
    ]),
    dict(at=(A, 'And I have put everything into a free setup kit', 173.4), kind='graphic', header='Free setup kit', els=[
        dict(type='card', at=(A, 'And I have put everything into a free setup kit', 173.4), title='Free setup kit', sub='everything in one place',
             icon='package', cx=L + 60, cy=500, w=480),
        dict(type='pill', at=(A, 'the model list', 173.4), text='The model list', icon='list-checks', cx=M + 230, cy=380),
        dict(type='pill', at=(A, 'every prompt', 173.4), text='Every prompt', icon='message-square', cx=M + 230, cy=500),
        dict(type='pill', at=(A, 'and every setting', 173.4), text='Every setting', icon='settings', cx=M + 230, cy=620),
        dict(type='pill', at=(A, "It's the first link in the description below", 184.4), text='1st link in the description', icon='download',
             cx=M, cy=850, red=True),
    ]),
    dict(at=(A, 'So stay till the end', 189.9), kind='talk', els=[
        dict(type='pill', at=(A, 'the last method is the best one', 189.9), text='Method 3 = the best one', icon='rocket', cx=960, cy=960)]),
    dict(at=(A, 'There is a quick note', 199.3), kind='talk'),

    # ---------------- Method 1 · Ollama: what it is
    dict(at=(B, 20.82), kind='graphic', header='What is Ollama?', els=[
        dict(type='card', at=(B, 'Ollama is a free app', 23.0), title='Ollama', sub='free app · downloads AI models\nruns them on YOUR laptop',
             icon='logo-ollama', cx=M, cy=430, w=640),
        dict(type='pill', at=(B, 'Kind of like a media player', 28.4), text='Like a media player, but for AI', icon='play', cx=M, cy=760),
    ]),
    dict(at=(B, 'The big difference from ChatGPT', 34.8), kind='graphic', header='The big difference', els=[
        dict(type='card', at=(B, 'The big difference from ChatGPT', 34.8), title='ChatGPT / Claude', sub='your prompts go\nto the cloud',
             icon='cloud', cx=L + 40, cy=470, w=500),
        dict(type='card', at=(B, 'nothing goes to the cloud', 34.8), title='Ollama', sub='nothing leaves\nyour laptop', icon='laptop',
             cx=R - 40, cy=470, w=500, hl=(B, 'The AI lives on your own machine', 39.6)),
        dict(type='pill', at=(B, "so it's private", 39.6), text='Private', icon='shield-check', cx=M - 170, cy=820),
        dict(type='pill', at=(B, 'works without internet', 39.6), text='Works offline', icon='wifi-off', cx=M + 170, cy=820),
    ]),
    # install
    dict(at=(B, 52.40), kind='demo', clip=('142752', 0, 47), url='ollama.com/download', header='Install Ollama',
         pills=[dict(at=(B, 'It works on Windows, Mac, and Linux', 60.6), text='Windows · Mac · Linux', icon='laptop', cy=1010)]),
    dict(at=(B, 70.58), kind='demo', clip=('142752', 81, 93), url='OllamaSetup.exe', header='Install Ollama',
         pills=[dict(at=(B, "Seriously, that's the whole install", 74.4), text="That's the whole install", icon='check', cy=1010)]),
    dict(at=(B, 80.14), kind='demo', clip=('142752', 184, 210), url='Ollama', header='3 things on the left',
         no_zoom=True, spots=[dict(t0=0, t1=26, r=(0.02, 0.10, 0.20, 0.36))],
         pills=[dict(at=(B, 'Apps, this is where', 83.1), text='Apps: connect coding tools', icon='app-window', cy=1010),
                dict(at=(B, "It just copies the command", 90.3), text='It only copies a command', icon='terminal', cy=1010),
                dict(at=(B, 105.42), text='Chat: talk to a model to test it', icon='message-square', cy=1010)]),
    dict(at=(B, 113.18), kind='demo', clip=('142752', 221, 244), url='Ollama · Settings', header='2 settings that matter',
         zooms=[(221, .5, .5, 1.0), (224, 0.45, 0.33, 1.7)],
         pills=[dict(at=(B, 'First, the Claude toggle', 117.4), text='1 · Cloud: leave it OFF', icon='cloud-off', cy=1010)]),
    dict(at=(B, 131.70), kind='demo', clip=('142752', 246, 255), url='Ollama · Settings', header='2 settings that matter',
         zooms=[(246, .5, .5, 1.0), (247, 0.5, 0.82, 1.75)],
         pills=[dict(at=(B, 131.7), text='2 · Context length', icon='settings', cy=1010),
                dict(at=(B, "Context length is the AI's short-term memory", 140.3), text="= the AI's short-term memory", icon='brain', cy=1010, cx=715),
                dict(at=(B, 'If the memory is too small', 164.8), text='Too small → it loses track', icon='triangle-alert', cy=1010, red=True),
                dict(at=(B, 'So drag this slide up', 169.0), text='Drag it to 64K', icon='check', cy=1010)]),
    # first test
    dict(at=(B, 178.20), kind='demo', clip=('142752', 348, 448), url='Ollama · Chat', header='First test',
         pills=[dict(at=(B, 'Models comes in sizes', 186.2), text='4B = 4 billion parameters', icon='cpu', cy=1010),
                dict(at=(B, 'but slower and hungrier', 196.5), text='Bigger = smarter, slower, hungrier', icon='gauge', cy=1010),
                dict(at=(B, 'just to warm things up', 206.2), text='qwen3.5:4b · type "hi"', icon='message-square', cy=1010),
                dict(at=(B, 'After that,', 216.2), text='Downloads once, stays on your laptop', icon='download', cy=1010)]),
    dict(at=(B, 230.82), kind='demo', clip=('142752', 448, 462), url='Windows · Wi-Fi', header='Wi-Fi off',
         pills=[dict(at=(B, 'No internet at all', 237.2), text='No internet at all', icon='wifi-off', cy=1010, red=True)]),
    dict(at=(B, 241.62), kind='talk'),
    dict(at=(B, 253.04), kind='demo', clip=('142752', 528, 668), url='Ollama · Chat (offline)', header='Offline test',
         pills=[dict(at=(B, 253.04), text='Wi-Fi: OFF', icon='wifi-off', cy=1010, red=True)]),
    dict(at=(B, 277.18), kind='talk'),
    dict(at=(B, 286.28), kind='demo', clip=('142752', 696, 762), url='onecompiler.com', header='Test the code',
         pills=[dict(at=(B, 'An online compiler is just a website', 302.3), text='Online compiler: paste code → it runs', icon='terminal', cy=1010),
                dict(at=(B, 'hit Run, and it works', 307.7), text='It works', icon='check', cy=1010)]),
    dict(at=(B, 315.04), kind='talk'),
    dict(at=(B, 324.80), kind='graphic', header='What just happened', els=[
        dict(type='pill', at=(B, 'But a laptop with no internet', 324.8), text='No internet', icon='wifi-off', cx=M, cy=300, size=40),
        dict(type='pill', at=(B, 'with no subscription', 324.8), text='No subscription', icon='coins', cx=M, cy=440, size=40),
        dict(type='pill', at=(B, 'no usage limits', 324.8), text='No usage limits', icon='gauge', cx=M, cy=580, size=40),
        dict(type='pill', at=(B, 'and your code never left your computer', 334.5), text='Code never left the laptop', icon='lock', cx=M, cy=720,
             size=40, red=True),
    ]),
    # subscribe hook
    dict(at=(B, 352.02), kind='talk', els=[dict(type='subscribe', at=(B, 'hit Subscribe', 352.0), cx=960, cy=930, click=0.9)]),

    # ---------------- 3 · pick your model
    dict(at=(B, 364.12), kind='graphic', header='It depends on your RAM', els=[
        dict(type='card', at=(B, 'It depends on your RAM', 364.1), title='RAM', sub="your computer's working memory\n= how big a model you can run",
             icon='memory-stick', cx=M, cy=420, w=700),
        dict(type='keys', at=(B, 'Press Control', 379.0), keys=['Ctrl', 'Shift', 'Esc'], cx=M, cy=800),
    ]),
    dict(at=(B, 384.44), kind='talk'),
    dict(at=(B, 391.94), kind='demo', clip=('145317', 15, 55), url='Task Manager · Performance', header='My laptop',
         zooms=[(15, .5, .5, 1.0), (22, 0.32, 0.45, 1.5)],
         mags=[dict(at=(B, 'sixteen GB of RAM', 395.1), r=(0.24, 0.27, 0.48, 0.35), w=700, cx=715, cy=330, dur=3.6)],
         pills=[dict(at=(B, 'no separate graphics card', 395.1), text='No graphics card · built-in AMD', icon='cpu', cy=1010),
                dict(at=(B, 'sixteen GB of RAM', 395.1), text='16 GB RAM', icon='memory-stick', cy=1010, red=True)]),
    dict(at=(B, 405.10), kind='graphic', header='Which model for your RAM', els=[
        dict(type='table', at=(B, 405.10), rows=[('8–16 GB', 'Small · 4–12B parameters'), ('32 GB', 'Medium models'),
                                                 ('64 GB +', 'Big · close to paid models')],
             rows_at=[(B, 405.1), (B, 'With thirty-two GB', 411.9), (B, 'and with sixty-four', 424.3)],
             hls=[(B, 405.1), None, None], cx=M, cy=420),
        dict(type='pill', at=(B, 'The exact list I would pick', 429.7), text='Full list → free setup kit', icon='package', cx=M, cy=820, red=True),
    ]),
    dict(at=(B, 441.32), kind='demo', clip=('145317', 95, 210), url='chatgpt.com', header='Ask an AI',
         pills=[dict(at=(B, 'and the latest one', 451.3), text='Ask for the LATEST model', icon='sparkles', cy=1010),
                dict(at=(B, 'And it suggested MiMo', 468.3), text='Answer: MiMo v2.6 · 9B', icon='bot', cy=1010, red=True)]),
    dict(at=(B, 479.66), kind='demo', clip=('145317', 224, 240), url='Ollama · model list', header='First problem',
         pills=[dict(at=(B, "wasn't in Ollama's drop-down", 479.6), text="MiMo isn't in the list", icon='x', cy=1010, red=True)]),
    dict(at=(B, 498.88), kind='demo', clip=('145317', 268.5, 277), url='Windows PowerShell', header='Try the terminal', zooms=[(268.5, 0.32, 0.26, 1.6)],
         pills=[dict(at=(B, 'the black text window', 498.9), text='Terminal = where you type commands', icon='terminal', cy=1010)]),
    dict(at=(B, 510.30), kind='demo', clip=('145317', 278, 305), url='Windows PowerShell', header='Try the terminal',
         mags=[dict(at=(B, 'too old', 510.3), r=(0.03, 0.215, 0.62, 0.275), w=1000, cx=715, cy=420, dur=3.2)],
         pills=[dict(at=(B, 'too old', 510.3), text='Error: Ollama too old', icon='triangle-alert', cy=1010, red=True),
                dict(at=(B, 'and I was still stuck', 512.8), text='Updated… still stuck', icon='x', cy=1010)]),
    dict(at=(B, 'And this is exactly where a five-minute', 516.3), kind='talk'),
    dict(at=(B, 525.54), kind='graphic', header='Let an AI do it', els=[
        dict(type='card', at=(B, "It's called Antigravity", 528.8), title='Antigravity', sub='free AI coding app\nfrom Google',
             icon='logo-google', cx=L + 40, cy=430, w=480),
        dict(type='pill', at=(B, 'It opens the terminal', 539.2), text='Opens the terminal', icon='terminal', cx=R - 60, cy=280),
        dict(type='pill', at=(B, 'runs command', 539.2), text='Runs commands', icon='play', cx=R - 60, cy=400),
        dict(type='pill', at=(B, 'reads the errors', 539.2), text='Reads the errors', icon='search', cx=R - 60, cy=520),
        dict(type='pill', at=(B, 'and fixes them', 539.2), text='Fixes them', icon='wand-sparkles', cx=R - 60, cy=640, red=True),
    ]),
    dict(at=(B, 'Download it from antigravity.google', 543.5), kind='demo', clip=('145317', 330, 362), url='antigravity.google/download',
         header='Get Antigravity'),
    dict(at=(B, 'I am running AI model locally', 549.0), kind='graphic', header='One sentence', els=[
        dict(type='prompt', at=(B, 'I am running AI model locally', 549.0),
             text="I'm running AI models locally. Install mimo-v2.6:9b and set everything up so it works with Ollama.",
             hl_words=['Install mimo-v2.6:9b', 'works with Ollama'], cx=M, cy=480, cps=14),
        dict(type='pill', at=(B, 559.6), text='Exact prompt in the setup kit', icon='package', cx=M, cy=820),
    ]),
    dict(at=(B, 569.16), kind='demo', clip=('151536', 0, 6), url='Antigravity', header='Allow each step',
         zooms=[(0, .5, .5, 1.0), (0.5, 0.75, 0.75, 1.6)],
         pills=[dict(at=(B, 'Read each step and then allow', 574.7), text='Read it → Allow', icon='shield-check', cy=1010)]),
    dict(at=(B, 577.22), kind='demo', clip=('121640', 0, 8), url='Antigravity', header='Installed & tested',
         pills=[dict(at=(B, 577.22), text='Installed and tested', icon='circle-check-big', cy=1010)]),
    dict(at=(B, 'Close Ollama, open it again', 580.0), kind='demo', clip=('121640', 14, 22), url='Ollama · model list', header='It is there',
         mags=[dict(at=(B, 'right there in the drop-down', 582.0), r=(0.40, 0.56, 0.70, 0.61), w=760, cx=715, cy=330, dur=2.6)]),
    dict(at=(B, 594.34), kind='talk'),
    dict(at=(B, 599.44), kind='graphic', header='The rule', els=[
        dict(type='card', at=(B, 599.44), title='Longer than 1 line?', sub="don't type it yourself", icon='keyboard', cx=L + 20, cy=420, w=480),
        dict(type='card', at=(B, 'An AI installs it', 602.9), title='An AI installs it', sub='Antigravity does the work', icon='bot', cx=R - 20,
             cy=420, w=480, hl=(B, 'An AI installs it', 602.9)),
        dict(type='arrow', at=(B, 'An AI installs it', 602.9), p=(520, 420, 680, 420)),
        dict(type='pill', at=(B, 'you just copy the error', 604.5), text='Copy the error', icon='triangle-alert', cx=M - 330, cy=800),
        dict(type='pill', at=(B, 'paste it back to Antigravity', 604.5), text='Paste it back', icon='message-square', cx=M, cy=800),
        dict(type='pill', at=(B, 'Fix this', 604.5), text='"Fix this"', icon='wand-sparkles', cx=M + 320, cy=800, red=True),
    ]),

    # ---------------- 4 · Claude Code on Ollama
    dict(at=(B, 625.86), kind='talk'),
    dict(at=(B, 'In Ollama, go to Apps', 629.5), kind='demo', clip=('121640', 8, 30), url='Ollama · Apps', header='Apps → Claude Code',
         mags=[dict(at=(B, 'See that little message', 638.7), r=(0.44, 0.20, 0.76, 0.29), w=860, cx=715, cy=360, dur=3.4)],
         pills=[dict(at=(B, 'Ollama launch Claude', 640.3), text='ollama launch claude', icon='terminal', cy=1010, red=True)]),
    dict(at=(B, 647.50), kind='demo', clip=('121640', 30, 55), url='File Explorer', header='Open a terminal in a folder', blur=EXPLORER_BLUR,
         zooms=[(30, .5, .5, 1.0), (32.5, 0.62, 0.45, 1.35)],
         pills=[dict(at=(B, 'Mine is called Claude Code', 650.2), text='Folder: claude-code', icon='folder', cy=1010),
                dict(at=(B, 'right-click in the empty space', 656.2), text='Right-click → Open in Terminal', icon='mouse-pointer-click', cy=1010)]),
    dict(at=(B, 'Paste the command and hit Enter', 659.9), kind='graphic', header='Paste & Enter', els=[
        dict(type='terminal', at=(B, 'Paste the command and hit Enter', 659.9), w=1180, title='PowerShell · claude-code',
             lines=[('PS C:\\claude-code> ollama launch claude', (235, 235, 240)),
                    ('Claude Code is not installed. Install it now? (Y/n)  y', (254, 188, 46)),
                    ('✓ Claude Code installed', (40, 200, 64)),
                    ('Pick a model:  > mimo-v2.6:9b   (local)', (235, 235, 240))],
             lines_at=[(B, 'Paste the command and hit Enter', 659.9), (B, 'If the Claude Code', 661.9), (B, 'And this is the real Claude Code', 668.9),
                       (B, 'Then it asks which model', 673.9)], cx=M, cy=470),
        dict(type='pill', at=(B, 'not a copy', 668.9), text="Anthropic's official app · not a copy", icon='logo-claude', cx=M, cy=820),
        dict(type='pill', at=(B, 0.0), text='illustration', icon='app-window', cx=1240, cy=110, size=20),
    ]),
    dict(at=(B, 680.74), kind='talk', els=[
        dict(type='pill', at=(B, 'No subscription, no API key', 680.7), text='No subscription · no API key', icon='check', cx=960, cy=960)]),
    dict(at=(B, 'Now let\'s give it a real job', 692.0), kind='graphic', header='A real job', els=[
        dict(type='prompt', at=(B, 'I type, "Build me a simple', 692.0), text='Build me a simple calculator app.', hl_words=['calculator app'],
             cx=M, cy=380, cps=18, w=1000),
        dict(type='card', at=(B, 'it took about thirty minutes', 701.2), title='~30 minutes', sub='a small local model\ndoes all the heavy lifting',
             icon='hourglass', cx=M, cy=720, w=600),
    ]),
    dict(at=(B, 716.42), kind='graphic', header='The honest trade-off', els=[
        dict(type='card', at=(B, 716.42), title='$0', sub='no money', icon='coins', cx=L + 60, cy=450, w=400),
        dict(type='card', at=(B, 'you pay with your time', 718.0), title='Your time', sub='your laptop does the work', icon='clock', cx=R - 60,
             cy=450, w=400, hl=(B, 'you pay with your time', 718.0)),
        dict(type='pill', at=(B, 'But it finished, and it works', 723.8), text='It finished · it works', icon='circle-check-big', cx=M, cy=800),
    ]),
    dict(at=(B, 735.22), kind='graphic', header='Next time', els=[
        dict(type='terminal', at=(B, 735.22), w=1000, title='PowerShell · claude-code',
             lines=[('> ollama launch claude', (235, 235, 240))], lines_at=[(B, 'run that one line', 737.8)], cx=M, cy=480),
        dict(type='pill', at=(B, 'Just open your folder', 737.8), text='Open your folder → run one line', icon='folder', cx=M, cy=760),
    ]),
    dict(at=(B, 746.42), kind='talk', els=[
        dict(type='pill', at=(B, 'private offline option', 746.4), text='Method 1 = private + offline', icon='lock', cx=960, cy=960,
             until=(B, "so let's move to the cloud", 749.7)),
        dict(type='pill', at=(B, "so let's move to the cloud", 749.7), text='Next: Method 2 · the cloud', icon='cloud', cx=960, cy=960, red=True)]),
]
