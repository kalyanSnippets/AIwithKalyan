#!/usr/bin/env python3
"""Cut a person out of a photo/frame (transparent PNG) with MediaPipe's selfie segmentation.

    python3 scripts/cutout.py <in.jpg|png> <out.png> [--model models/selfie_multiclass.tflite] [--feather 2]

Runs locally (no paid API). The model is downloaded once by `studio doctor --fix` from the official
MediaPipe model bucket. Classes: 0 background, 1 hair, 2 body skin, 3 face skin, 4 clothes, 5 other.
Everything except background is kept. Prints the face bounding box (face-skin class) as JSON so a
spec can declare faceBox.
"""
import json
import sys

import numpy as np
from PIL import Image, ImageFilter
import mediapipe as mp
from mediapipe.tasks import python as mpp
from mediapipe.tasks.python import vision

args = sys.argv[1:]
src, out = args[0], args[1]
model = args[args.index("--model") + 1] if "--model" in args else "models/selfie_multiclass.tflite"
feather = float(args[args.index("--feather") + 1]) if "--feather" in args else 1.5

img = Image.open(src).convert("RGB")
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=mpp.BaseOptions(model_asset_path=model, delegate=mpp.BaseOptions.Delegate.CPU),
    output_category_mask=True, output_confidence_masks=True))
res = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.asarray(img)))
# Two-pass refine: the model works at 256 px, so on large frames crop to the person (+margin)
# and segment again for cleaner hair/shoulder edges. The output keeps the crop; "crop" in the
# printed JSON says where it sits in the source frame.
crop = [0, 0, img.size[0], img.size[1]]
if "--no-refine" not in args and max(img.size) > 1200:
    a0 = sum(np.squeeze(res.confidence_masks[c].numpy_view()) for c in (1, 2, 3, 4))
    ys, xs = np.where(a0 > 0.5)
    if len(xs):
        mx, my = int(0.08 * img.size[0]), int(0.06 * img.size[1])
        crop = [max(0, xs.min() - mx), max(0, ys.min() - my), min(img.size[0], xs.max() + mx), img.size[1]]
        img = img.crop(crop)
        res = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(np.asarray(img))))
# person = hair + body skin + face skin + clothes (class 5 "other" picks up plants and props)
person = sum(np.squeeze(res.confidence_masks[c].numpy_view()) for c in (1, 2, 3, 4))
alpha = np.clip((person - 0.35) / 0.35, 0, 1)  # steeper ramp → no light halo
cat = np.squeeze(res.category_mask.numpy_view())
try:  # keep only the largest connected region (the person), dropping stray blobs
    from scipy import ndimage
    lab, n = ndimage.label(alpha > 0.5)
    if n > 1:
        sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
        keep = ndimage.binary_dilation(lab == (int(np.argmax(sizes)) + 1), iterations=6)
        alpha = alpha * keep
except ImportError:
    pass
# --erase x,y,w,h (repeatable, in source-frame pixels): clear background objects that touch the
# subject (e.g. a plant behind a gesturing hand) and that segmentation keeps
i = 0
while "--erase" in args[i:]:
    i = args.index("--erase", i) + 1
    ex, ey, ew, eh = (int(v) for v in args[i].split(","))
    x0, y0 = max(0, ex - crop[0]), max(0, ey - crop[1])
    alpha[y0:max(0, ey + eh - crop[1]), x0:max(0, ex + ew - crop[0])] = 0
mask = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(feather))
rgba = img.copy()
rgba.putalpha(mask)
rgba.save(out)
ys, xs = np.where(cat == 3)
face = None if len(xs) == 0 else {"x": int(xs.min()), "y": int(ys.min()), "w": int(xs.max() - xs.min()), "h": int(ys.max() - ys.min())}
ys2, xs2 = np.where(alpha > 0.5)
subject = None if len(xs2) == 0 else {"x": int(xs2.min()), "y": int(ys2.min()), "w": int(xs2.max() - xs2.min()), "h": int(ys2.max() - ys2.min())}
print(json.dumps({"out": out, "crop": {"x": int(crop[0]), "y": int(crop[1]), "w": int(crop[2] - crop[0]), "h": int(crop[3] - crop[1])}, "size": img.size, "face": face, "subject": subject, "coverage": round(float((alpha > 0.5).mean()), 3)}))
