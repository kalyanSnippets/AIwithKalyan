"""Part 3 (Method 3: OmniRoute + conclusion): same treatment as Parts 1-2."""
import importlib.util, os
_d = os.path.dirname(__file__)
_s = importlib.util.spec_from_file_location('p3cuts', os.path.join(_d, 'fcc_part3_cuts.py'))
_m = importlib.util.module_from_spec(_s); _s.loader.exec_module(_m)
CUTS = _m.CUTS
SPEED = 1.05
PAUSE_KEEP = 0.2
SHOTS = []
HOLDS = {'1479': [(855.0, 3.2)]}  # after the 503: room for the 'Kiro paused, ask again' explainer
