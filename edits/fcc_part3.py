"""Part 3 (Method 3: OmniRoute + conclusion): same treatment as Parts 1-2. Explanations as moving HyperFrames scenes, screen
recordings pinned to the spoken line (OCR index) and cropped/blurred where a key, email, work path or bookmark would show,
conclusion = a full-screen effect layer behind the speaker like the intro."""
import glob, importlib.util, json, os, re
_d = os.path.dirname(__file__)
_s = importlib.util.spec_from_file_location('p3cuts', os.path.join(_d, 'fcc_part3_cuts.py'))
_m = importlib.util.module_from_spec(_s); _s.loader.exec_module(_m)
CUTS = _m.CUTS
SPEED = 1.05
PAUSE_KEEP = 0.2
HOLDS = {'1479': [(855.0, 3.2)]}  # after the 503: room for the 'Kiro paused, ask again' explainer
A = '1479'
MGD = os.path.join(_d, '..', 'compositions', 'fcc-part3-mg')
MG = {s['id']: s for s in json.load(open(os.path.join(MGD, 'scenes.json')))}
OUTRO = json.load(open(os.path.join(MGD, 'outro.json')))

# Shot times below were planned on the output timeline before two word-level fixes ("Then, then", "Design Design").
# O() maps such a time back to a source time in take 1479, so every anchor follows the current cut.
_OW = json.load(open('/tmp/fcc-style/fcc-part3_words_old.json'))['words'] if os.path.exists('/tmp/fcc-style/fcc-part3_words_old.json') else None
_OW_SAVED = os.path.join(_d, 'fcc_part3_words_plan.json')
if _OW is None: _OW = json.load(open(_OW_SAVED))
elif not os.path.exists(_OW_SAVED): json.dump(_OW, open(_OW_SAVED, 'w'))
def O(t):
    prev = None
    for w in _OW:
        if w[0] > t: break
        prev = w
    if prev is None: return (A, _OW[0][2])
    return (A, round(prev[2] + (t - prev[0]) * SPEED, 3))
def mg(sid): return dict(at=('OUT', MG[sid]['start']), kind='mg', mg=sid, mgdir='fcc-part3-mg')

def cropper(c):
    """zoom/mag coordinates are relative to the cropped frame; write them in full-frame terms and convert here"""
    def Z(x, y, z=1.0): return ((x - c[0]) / (c[2] - c[0]), (y - c[1]) / (c[3] - c[1]), z)
    def R(x0, y0, x1, y1): return (Z(x0, y0)[0], Z(x0, y0)[1], Z(x1, y1)[0], Z(x1, y1)[1])
    return Z, R
def S(t, src, z): return dict(at=O(t), src=src, z=z, _t=t)
def SY(*pts):
    """play in real time after each point, then jump just before the next one (no fast-forward through skipped screens)"""
    out = [pts[0]]
    for a, b in zip(pts, pts[1:]):
        dt = b['_t'] - a['_t']
        if b['src'] - a['src'] > dt * 1.6 + 0.8 and dt > 0.6:
            th = b['_t'] - 0.3
            out.append(dict(at=O(th), src=round(min(b['src'] - 0.1, a['src'] + (th - a['_t'])), 3), z=a['z'], _t=th))
        out.append(b)
    return [{k: v for k, v in d.items() if k != '_t'} for d in out]
def P(t, text, icon, red=False): return dict(at=O(t), text=text, icon=icon, red=red)
WIDE = (0.5, 0.5, 1.0)
C = 1222

# ---- privacy: blur every OCR hit of a key, email, OAuth callback code or the work user name (padded, ±2.2 s around each sample)
PRIV = re.compile(r'AIza|AQ\.A|sk-or|sk-|nvapi|@gmail|madurikalyan|kmaduri|kalyan ?kumar|code=|state=|127\.0\.0\.1:\d+/callback|Users.?\\?k', re.I)
def autoblur(key, a, b):
    out = []
    for fn in glob.glob(f'/tmp/fcc-style/ocr_{key}_*.json'):
        for t, txt, x0, y0, x1, y1 in json.load(open(fn)):
            if a - 3 <= t <= b + 3 and PRIV.search(txt):
                out.append(dict(t0=t - 2.2, t1=t + 2.2, r=(max(0, x0 - 0.02), max(0, y0 - 0.012), min(1, x1 + 0.03), min(1, y1 + 0.012))))
    return out

BROWSER = (0.0, 0.14, 1.0, 1.0)      # tabs + URL + bookmarks bar (work links) off
BROWSER_NB = (0.0, 0.105, 1.0, 1.0)  # browser without a bookmarks bar
ZB, RB = cropper(BROWSER)
ZN, RN = cropper(BROWSER_NB)

BADGES = [(('OUT', 0.0), 8, 'Method 3 · OmniRoute'), (('OUT', MG['p3team']['start']), 9, 'The combo'),
          (O(349.2), 10, 'Moment of truth'), (O(398.1), 11, 'A real build')]
W_ = OUTRO['fx']
def fxw(k, **kw): return dict(at=O(W_[k][0]), dur=round(W_[k][1] - W_[k][0], 3), **kw)
FX = [  # repo effects; in the conclusion only these sit behind the head (the rest of the layer lives on the side walls)
    fxw('strike', fx='huge-strike', text='$20/MONTH'),
    fxw('zero', fx='spotlight', text='$0'),
    fxw('led', fx='led-sign', text='AI WITH|KALYAN'),
]

SHOTS = [
    mg('p3problem'), mg('p3what'),
    dict(at=O(42.67), kind='talk'),
    mg('p3prompt'),
    # Antigravity's summary after the install prompt
    dict(at=O(63.30), kind='demo', clip=('154801', 76.5, 78), url='Antigravity', header='One prompt, done',
         blurs=[dict(t0=76, t1=78, r=(0.6, 0.17, 0.92, 0.225)), dict(t0=76, t1=78, r=(0.635, 0.6, 0.92, 0.665))],
         sync=SY(S(63.3, 76.8, (0.55, 0.62, 1.3)), S(66.0, 77.1, (0.6, 0.68, 1.55)), S(68.4, 77.5, (0.6, 0.68, 1.55))),
         pills=[P(64.5, 'Claude Code ✓ · OmniRoute ✓ · server ✓', 'check')]),
    # dashboard login (default password) -> home
    dict(at=O(70.30), kind='demo', clip=('154801', 112, 136), url='localhost:20128', header='The dashboard', crop=BROWSER_NB,
         blurs=autoblur('154801', 112, 136), sync=SY(
        S(70.3, 113.0, WIDE),
        S(73.0, 117.0, ZN(0.14, 0.6, 2.1)),
        S(77.4, 124.0, ZN(0.14, 0.6, 1.4)),
        S(79.6, 133.0, WIDE)),
         pills=[P(73.6, 'Default password: CHANGEME', 'lock', True), P(77.6, 'Change it in Settings', 'settings')]),
    # providers list
    dict(at=O(81.60), kind='demo', clip=('154801', 148, 200), url='localhost:20128/providers', header='Connect free providers', crop=BROWSER_NB,
         blurs=autoblur('154801', 148, 200), sync=SY(S(81.6, 149.0, WIDE), S(85.2, 168.0, ZN(0.6, 0.62, 1.25)), S(88.7, 188.0, ZN(0.6, 0.65, 1.0))),
         pills=[P(85.4, 'Providers → a huge list', 'app-window'), P(88.9, 'Search · click · Add', 'check')]),
    dict(at=O(91.90), kind='talk'),
    # 1 · Kiro
    dict(at=O(99.60), kind='demo', clip=('113521', 6, 60), url='OmniRoute · Kiro', header='1 · Kiro', crop=BROWSER,
         blurs=autoblur('113521', 6, 60), sync=SY(
        S(99.6, 7.0, ZB(0.6, 0.62, 1.6)),
        S(103.3, 12.5, ZB(0.62, 0.8, 1.6)),
        S(105.5, 16.5, ZB(0.5, 0.75, 1.9)),
        S(107.5, 38.5, ZB(0.5, 0.55, 1.6)),
        S(111.1, 45.0, ZB(0.5, 0.47, 1.8)),
        S(113.4, 50.0, ZB(0.34, 0.68, 1.7)),
        S(117.5, 53.0, WIDE),
        S(126.0, 56.0, WIDE)),
         pills=[P(99.8, 'Kiro · free Claude Sonnet', 'check'), P(103.3, 'Read the warning', 'triangle-alert', True),
                P(105.7, 'Short code + link', 'key-round'), P(111.2, 'Kiro → Connected ✓', 'check'),
                P(117.6, 'Small free allowance', 'gauge')]),
    dict(at=O(126.50), kind='demo', clip=('113521', 7, 10), url='OmniRoute · Kiro', header='1 · Kiro', crop=BROWSER,
         sync=SY(S(126.5, 7.2, ZB(0.6, 0.62, 1.5)), S(135.0, 9.8, ZB(0.6, 0.62, 1.5))),
         pills=[P(126.6, 'ToS status: avoid', 'triangle-alert', True), P(130.4, 'Your account · your call', 'shield-check')]),
    # 2 · Antigravity (the callback page and pasted callback URL are blurred; the minutes in between are skipped)
    dict(at=O(135.50), kind='demo', clip=('113521', 86, 228), url='OmniRoute · Antigravity', header='2 · Antigravity', crop=BROWSER,
         blurs=autoblur('113521', 86, 228) + [dict(t0=106, t1=128, r=(0.0, 0.44, 0.46, 0.82)), dict(t0=128, t1=152, r=(0.28, 0.5, 0.72, 0.86)),
                                             dict(t0=196, t1=219, r=(0.3, 0.6, 0.66, 0.75))], sync=SY(
        S(135.5, 86.5, WIDE),
        S(137.4, 88.0, ZB(0.3, 0.42, 1.6)),
        S(141.3, 103.0, WIDE),
        S(145.5, 111.0, WIDE),
        S(149.6, 212.0, ZB(0.4, 0.78, 1.6)),
        S(152.8, 216.0, ZB(0.4, 0.8, 1.6)),
        S(154.9, 221.0, ZB(0.6, 0.72, 1.25)),
        S(157.2, 226.5, ZB(0.75, 0.62, 1.7))),
         pills=[P(141.5, 'Google sign-in → allow', 'check'), P(145.7, 'Page won\'t load? Normal.', 'app-window'),
                P(149.8, 'Copy the address → paste → Connect', 'key-round'), P(155.0, 'Gemini + some Claude models', 'check')]),
    dict(at=O(158.90), kind='demo', clip=('113521', 94, 100), url='OmniRoute · Antigravity', header='The warning', crop=BROWSER,
         zooms=[(94, *ZB(0.5, 0.55, 1.6))],
         mags=[dict(at=O(160.9), r=RB(0.44, 0.47, 0.84, 0.68), w=900, cx=C, cy=420, dur=5.0)],
         pills=[P(161.2, 'Use a spare Google account', 'triangle-alert', True)]),
    # 3 · NVIDIA: OmniRoute page -> build.nvidia.com -> Generate API key; then paste + import only free
    dict(at=O(167.10), kind='demo', clip=('113521', 252, 299), url='build.nvidia.com', header='3 · NVIDIA', crop=BROWSER,
         blurs=autoblur('113521', 252, 299) + [dict(t0=262, t1=282, r=(0.74, 0.18, 1.0, 0.34))], sync=SY(
        S(167.1, 253.0, ZB(0.5, 0.5, 1.0)),
        S(168.8, 271.0, WIDE),
        S(175.6, 281.0, ZB(0.4, 0.55, 1.35)),
        S(179.9, 287.0, ZB(0.3, 0.56, 1.9))),
         pills=[P(169.2, 'build.nvidia.com · free', 'check'), P(175.8, 'API keys → Generate API Key', 'key-round')]),
    dict(at=O(181.50), kind='demo', clip=('144707', 38, 46.7), url='OmniRoute · NVIDIA', header='3 · NVIDIA', crop=BROWSER_NB,
         blurs=autoblur('144707', 38, 58), sync=SY(
        S(181.5, 40.0, ZN(0.4, 0.6, 1.25)),
        S(183.6, 44.0, ZN(0.38, 0.55, 1.6)),
        S(185.7, 45.7, ZN(0.38, 0.62, 2.0)),
        S(190.4, 46.5, ZN(0.45, 0.58, 1.3))),
         pills=[P(186.0, 'Import only free models: ON', 'check', True), P(190.4, 'Save', 'check')]),
    # 4 · Gemini (AI Studio key blurred)
    dict(at=O(191.30), kind='demo', clip=('154411', 0, 68), url='aistudio.google.com', header='4 · Gemini', crop=BROWSER,
         blurs=autoblur('154411', 0, 68) + [dict(t0=0, t1=9, r=(0.0, 0.93, 0.18, 1.0)), dict(t0=17, t1=35, r=(0.29, 0.46, 0.68, 0.55))], sync=SY(
        S(191.3, 1.0, WIDE),
        S(195.7, 5.5, ZB(0.85, 0.27, 1.8)),
        S(198.0, 8.3, ZB(0.5, 0.5, 1.2)),
        S(199.6, 23.0, ZB(0.6, 0.6, 1.3)),
        S(200.9, 44.0, ZB(0.4, 0.43, 1.4)),
        S(202.6, 51.0, ZB(0.5, 0.55, 1.2)),
        S(204.4, 57.0, ZB(0.5, 0.62, 1.8)),
        S(206.0, 62.0, ZB(0.55, 0.9, 1.5)),
        S(207.1, 66.0, WIDE)),
         pills=[P(195.9, 'Get API key → Create API key', 'key-round'), P(204.6, 'Check → Valid ✓', 'check'),
                P(207.2, '4 providers connected', 'check', True)]),
    mg('p3team'),
    # the combo: create -> steps (provider, model, account auto) -> order -> strategy -> save
    dict(at=O(225.00), kind='demo', clip=('114247', 60, 226), url='OmniRoute · Combos', header='Build the combo', crop=BROWSER,
         blurs=autoblur('114247', 60, 226), sync=SY(
        S(225.0, 64.0, WIDE),
        S(226.4, 67.0, ZB(0.33, 0.7, 1.8)),
        S(228.2, 72.0, WIDE),
        S(232.0, 80.0, ZB(0.45, 0.5, 1.2)),
        S(233.2, 84.0, ZB(0.45, 0.48, 1.7)),
        S(238.4, 88.0, ZB(0.25, 0.6, 1.8)),
        S(239.5, 98.0, ZB(0.45, 0.64, 1.45)),
        S(245.0, 104.0, ZB(0.75, 0.65, 2.0)),
        S(248.4, 110.0, ZB(0.42, 0.6, 1.6)),
        S(249.5, 126.0, ZB(0.5, 0.65, 1.2)),
        S(255.6, 132.0, ZB(0.55, 0.72, 1.5)),
        S(260.0, 200.0, ZB(0.4, 0.86, 1.6)),
        S(261.4, 222.0, WIDE)),
         pills=[P(226.6, 'Combos → Create', 'check'), P(228.4, 'Name it "claude"', 'key-round', True),
                P(233.4, 'Provider → Model → Account: auto', 'settings'), P(239.7, 'Gemini → Kiro (Sonnet) → backups', 'check'),
                P(248.4, 'Top goes first', 'gauge'), P(255.8, 'Strategy: Smart routing', 'gauge', True)]),
    mg('p3key'),
    dict(at=O(276.40), kind='demo', clip=('154411', 697, 718), url='OmniRoute · API keys', header='OmniRoute API key', crop=BROWSER,
         blurs=autoblur('154411', 697, 718), sync=SY(
        S(276.4, 698.0, ZB(0.85, 0.4, 1.6)),
        S(278.4, 703.0, ZB(0.5, 0.5, 1.2)),
        S(280.0, 713.0, ZB(0.55, 0.42, 1.9)),
        S(283.3, 717.8, ZB(0.55, 0.42, 1.6))),
         pills=[P(280.2, 'Name: Claude Code', 'key-round'), P(283.5, 'Shown once → copy it now', 'key-round', True)]),
    mg('p3shortcut'), mg('p3safe'), mg('p3paid'),
    dict(at=O(342.70), kind='demo', clip=('CR01', 8, 34), url='TEST MACHINE · Claude Code', header='Free models only',
         sync=SY(S(342.8, 10.0, WIDE), S(345.7, 19.0, (0.33, 0.6, 1.55))),
         pills=[P(345.9, 'Menu: free models only ✓', 'check', True)]),
    dict(at=O(348.00), kind='talk'),
    # moment of truth: double-click -> server check -> Claude Code -> question -> 503
    dict(at=O(350.50), kind='demo', clip=('121406', 2, 70), url='Free Claude Code', header='Moment of truth',
         blurs=autoblur('121406', 2, 70) + [dict(t0=3, t1=28, r=(0.17, 0.36, 0.72, 0.55))], sync=SY(
        S(350.5, 2.5, (0.08, 0.22, 2.4)),
        S(352.3, 7.0, (0.3, 0.3, 1.6)),
        S(354.4, 10.0, WIDE),
        S(355.8, 26.0, (0.4, 0.3, 1.5)),
        S(357.9, 63.0, (0.45, 0.37, 1.5))),
         mags=[dict(at=O(358.4), r=(0.04, 0.32, 0.88, 0.42), w=1100, cx=C, cy=380, dur=2.0)],
         pills=[P(352.5, 'OmniRoute: running ✓', 'check'), P(358.4, 'API Error 503', 'triangle-alert', True)]),
    mg('p3e503'),
    dict(at=O(366.40), kind='demo', clip=('121406', 138, 148.5), url='Free Claude Code', header='Ask again',
         blurs=autoblur('121406', 138, 148.5), sync=SY(
        S(366.4, 139.0, (0.5, 0.4, 1.25)),
        S(369.2, 143.0, (0.3, 0.5, 1.6)),
        S(372.2, 147.0, (0.5, 0.5, 1.1))),
         pills=[P(369.5, '"I am Claude"', 'check'), P(372.4, 'A model\'s word ≠ proof', 'x', True)]),
    # the receipt: OmniRoute logs, one row magnified
    dict(at=O(375.30), kind='demo', clip=('121406', 158, 185), url='localhost:20128/dashboard/logs', header='The receipt', crop=BROWSER_NB,
         blurs=autoblur('121406', 158, 185), sync=SY(
        S(375.3, 159.0, WIDE),
        S(377.0, 164.0, ZN(0.12, 0.7, 1.4)),
        S(378.6, 166.0, ZN(0.55, 0.8, 1.45))),
         mags=[dict(at=O(380.3), r=RN(0.23, 0.775, 0.84, 0.85), w=1150, cx=C, cy=360, dur=6.8)],
         pills=[P(383.6, 'Sonnet 4.5 · Kiro · combo claude · 200', 'receipt', True), P(387.5, '200 = success', 'check'),
                P(389.6, 'Real Claude · free account', 'check', True)]),
    dict(at=O(395.20), kind='talk'),
    # a real build on the test machine: plan mode questions -> plan -> build
    dict(at=O(398.10), kind='demo', clip=('CR04', 44, 160), url='TEST MACHINE · Claude Code', header='A real build', sync=SY(
        S(398.1, 45.0, WIDE),
        S(401.3, 48.0, (0.3, 0.23, 1.6)),
        S(406.4, 56.0, (0.3, 0.72, 1.35)),
        S(412.1, 86.0, (0.35, 0.15, 1.6)),
        S(416.9, 128.0, (0.4, 0.3, 1.25)),
        S(418.6, 150.0, WIDE)),
         pills=[P(406.6, 'Plan mode: asks first', 'app-window', True), P(412.3, 'Stack · features · storage', 'settings'),
                P(417.1, 'Plan → then build', 'check')]),
    mg('p3switch'),
    dict(at=O(433.50), kind='demo', clip=('CR05', 30, 72), url='TEST MACHINE · Claude Code', header='Fix rounds', sync=SY(
        S(433.5, 33.0, WIDE), S(436.2, 66.0, (0.3, 0.35, 1.7))),
         pills=[P(434.0, 'v1 didn\'t work', 'x', True), P(436.4, 'A few fix rounds → fixed ✓', 'check')]),
    dict(at=O(440.50), kind='demo', clip=('CR07', 0, 44), url='TEST MACHINE · localhost:5173', header='It works', sync=SY(
        S(440.5, 6.0, WIDE), S(441.8, 12.0, (0.35, 0.3, 1.4)), S(443.4, 24.0, (0.5, 0.4, 1.2)), S(445.0, 30.0, WIDE)),
         pills=[P(440.7, 'Notes · tags · markdown · search', 'check'), P(445.2, 'Bill: $0', 'coins', True)]),
    # conclusion: full screen, heavy moving graphics on the side walls behind the speaker (like the intro)
    dict(at=O(OUTRO['start']), kind='intro', layer=os.path.join(MGD, 'out', 'outro.mov')),
]
