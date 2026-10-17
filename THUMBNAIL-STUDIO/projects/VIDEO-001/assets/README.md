# VIDEO-001 assets (regenerate locally; large files are git-ignored)

All from Kalyan's own CLD_1279 footage and finished edit (AIwithKalyan repo).

```bash
# expressive, sharp, eye-contact frames (ranked)
python3 scripts/faces.py ../media/proxies/CLD_1279-full-1080.mp4 projects/VIDEO-001/assets/faces.json --model models/face_landmarker.task
# 4K stills k<t>.png at t = 3 32 45 64 121 125 130 220 251 330 385 872 s, taken from media/raw segments (see faces.json)
# cutouts (the plant behind the left hand erased)
node scripts/studio.mjs cutout VIDEO-001 projects/VIDEO-001/assets/frames/k121.png kalyan-k121 --erase 0,1450,870,710 --erase 0,1150,560,300
# (same for k45, k330, k32)
# evidence frames from the finished edit
ffmpeg -ss 486 -i ../renders/CLD_1279-final-youtube.mp4 -frames:v 1 projects/VIDEO-001/assets/evidence/final-486.png
ffmpeg -i projects/VIDEO-001/assets/evidence/final-486.png -vf crop=783:880:808:52 projects/VIDEO-001/assets/evidence/final-486-qa-crop.png
# also final-186.5.png (step 02 card); strip/ = 16 camera frames copied from compositions/CLD_1279/media/strip
```
