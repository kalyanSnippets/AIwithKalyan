#!/usr/bin/env python3
"""Assemble a REA v2 part composition (template.src) from shared part-1 CSS/helpers + the part's own files.

  python3 compositions/assemble.py <part-dir> <composition-id> <duration> <cam-duration> <css files...> -- <js files...>

Reads the shared style sheet and helper functions (camera/PiP, stickers, browser proof frames, highlights)
from REA-v2-part1/template.src, then appends the part's body.src and timeline JS, and the caption builder.
"""
import os, sys

here = os.path.dirname(os.path.abspath(__file__))
part, cid, dur, camdur = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
rest = sys.argv[5:]; k = rest.index("--"); css_files, js_files = rest[:k], rest[k + 1:]
p1 = open(os.path.join(here, "REA-v2-part1/template.src")).read()
css = p1[p1.index("<style>") + 7:p1.index("</style>")] + "".join(open(os.path.join(part, f)).read() for f in css_files)
helpers = p1[p1.index("const rnd ="):p1.index("const SPEED")]
helpers = helpers.replace('duration: 145.65, ease: "none" }, 0);', f'duration: {dur}, ease: "none" }}, 0);')
caps = p1[p1.index("const hidden = (t) =>"):p1.index("window.__timelines")]
js = "".join(open(os.path.join(part, f)).read() for f in js_files)
head = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<title>REA v2 {cid}</title>
<script src="vendor/gsap.min.js"></script>
<script src="words.js"></script>
<style>{css}</style>
</head>
<body>
<div id="root" data-composition-id="{cid}" data-start="0" data-width="1920" data-height="1080" data-duration="{dur}">
  <div id="bd" class="fill">
    <div class="blob" id="b1" style="width:900px;height:900px;left:-250px;top:-350px;background:rgba(232,119,95,.28)"></div>
    <div class="blob" id="b2" style="width:800px;height:800px;right:-250px;bottom:-380px;background:rgba(127,149,171,.2)"></div>
    <div id="grid" class="fill"></div>
  </div>
  <div id="camwrap"><div id="campush">
    <video id="cam" class="clip" src="media/cam.mp4" playsinline data-has-audio="true" data-start="0" data-duration="{camdur}" data-media-start="0" data-track-index="1"></video>
  </div><div id="camring"></div></div>
'''
out = head + open(os.path.join(part, "body.src")).read() + "<script>\n" + helpers + js + "\n" + caps + f'window.__timelines["{cid}"] = main;\n</script>\n</body>\n</html>\n'
open(os.path.join(part, "template.src"), "w").write(out)
print("wrote", os.path.join(part, "template.src"))
