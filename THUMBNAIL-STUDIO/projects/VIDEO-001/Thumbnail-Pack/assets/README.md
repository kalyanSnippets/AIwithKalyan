# Thumbnail-Pack assets

All of these are real, from Kalyan's own footage and recordings, or the official Claude wordmark.
They were extracted read-only, and no source file was modified. To regenerate, run from the repo root:

```bash
R="media/screen-recordings"; S=compositions/CLD_1279/media; P=THUMBNAIL-STUDIO/projects/VIDEO-001/Thumbnail-Pack/assets
ffmpeg -ss 36 -i $S/sample-raw.mp4 -frames:v 1 $P/frames/raw-36.png
for t in 15 21 27; do ffmpeg -ss $t -i $S/sample-edited.mp4 -frames:v 1 $P/frames/edited-$t.png; done
# HyperFrames Studio timeline (browser chrome and bookmarks cropped out)
ffmpeg -ss 78 -i "$R/Screen Recording 2026-10-09 at 1.32.59 pm.mov" -frames:v 1 -vf crop=2880:690:0:1110 $P/screens/hf-timeline.png
# Claude Code panel (sidebar, chat list and menu bar cropped out)
ffmpeg -ss 5 -i "$R/Screen Recording 2026-10-09 at 12.37.52 pm.mov" -frames:v 1 -vf "crop=1700:1800:600:0,crop=1700:1730:0:70,crop=1440:1080:40:180" $P/screens/cc-review-mid.png
```

The face cutouts live in `../../assets/cutouts/` (git-ignored). Rebuild them with
`node scripts/studio.mjs cutout VIDEO-001 …`; the frame times are in their JSON files.
For the logo, see `logo/SOURCE.md`.
