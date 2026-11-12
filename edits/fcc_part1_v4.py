"""Part 1 v4 (work in progress): 1.05x, 0.2 s pauses, full-screen effect-heavy intro, word-synced demos."""
import importlib.util, os
_d = os.path.dirname(__file__)
_s = importlib.util.spec_from_file_location('v4cuts', os.path.join(_d, 'fcc_part1_v4_cuts.py'))
_m = importlib.util.module_from_spec(_s); _s.loader.exec_module(_m)
CUTS = _m.CUTS
SPEED = 1.05
PAUSE_KEEP = 0.2
SHOTS = []
