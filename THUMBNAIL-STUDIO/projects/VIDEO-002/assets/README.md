# VIDEO-002 assets (regenerable; heavy files are git-ignored)
- Face ranking: `python3 scripts/faces.py ../REA/media/proxies_sdr/<take>.mp4 projects/VIDEO-002/assets/faces_<a|b>.json --model models/face_landmarker.task --top 6`
  (a = PXL_20261030_072433489_2, b = PXL_20261030_080129730). Needs libegl1 and models/face_landmarker.task.
- Face frames (4K HLG → SDR, graded like the video): a50 = raw `PXL_20261030_072433489~2.mp4` @ 50 s; b128 / b173 = raw
  `PXL_20261030_080129730.mp4` @ 128 s / 173 s. Tone-map + grade: see scripts/rea-v2-hq.sh (TM and G, without unsharp).
- Cutouts: `studio cutout VIDEO-002 assets/frames/<n>.png <n> --erase 0,0,750,2160` (removes the plant on the left).
- Evidence: `compositions/REA-v2-part3/img/{wekan,reaboard}.png` (the video's reveal stills, from
  `REA/media/screen-recordings/Screen_Recording_2026-10-30_114559.mp4`); crops wekan 1100x640@0,0, rea 1100x640@0,66,
  rea_wide 1920x840@0,0. No logos; browser tabs and bookmarks cropped out.
