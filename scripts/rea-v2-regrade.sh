#!/bin/bash
# REA v2: apply colour grade B ("clean natural") to every camera clip, re-render the Remotion inserts and the three
# HyperFrames parts, join the picture with the master-cut audio (no per-part audio drift), then run the final mix.
# Ungraded originals are kept next to each clip as *.ungraded.mp4 so the grade can be changed and re-run.
set -e
cd "$(dirname "$0")/.."
G="colorbalance=gm=0.05:gh=0.04:rm=-0.02,eq=contrast=1.08:saturation=1.06:gamma=0.98,curves=all='0/0.02 0.25/0.22 0.75/0.79 1/0.98'"
grade() {
  f=$1; [ -f "$f.ungraded.mp4" ] || cp "$f" "$f.ungraded.mp4"
  if ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "$f.ungraded.mp4" | grep -q audio; then a="-c:a copy"; else a="-an"; fi
  ffmpeg -loglevel error -y -i "$f.ungraded.mp4" -vf "$G,format=yuv420p" -c:v libx264 -crf 17 -preset fast $a -movflags +faststart "$f.tmp.mp4"
  mv "$f.tmp.mp4" "$f"; echo "graded $f"
}
for f in compositions/REA-v2-part1/media/cam.mp4 compositions/REA-v2-part2/media/cam.mp4 compositions/REA-v2-part3/media/cam.mp4 \
         REA/remotion/public/part1/hook2cut.mp4 REA/remotion/public/part1/nodemap.mp4 REA/remotion/public/part1/blender.mp4 \
         REA/remotion/public/part2/s7cam.mp4 REA/remotion/public/part3/loopcam.mp4; do grade "$f"; done
( cd REA/remotion
  for c in "Hook2Cut part1" "NodeMap part1" "Blender part1" "RunTerm part2" "Loop part3"; do set -- $c
    npx remotion render src/index.ts $1 ../../compositions/REA-v2-$2/media/r_$1.mp4 --muted \
      --browser-executable=/opt/pw-browsers/chromium --gl=angle --concurrency=3 2>&1 | tail -1; done )
( cd compositions
  for p in 1 2 3; do rm -rf ../REA/renders/v2/.part$p.hf-* ../REA/renders/v2/work-*
    npx hyperframes render REA-v2-part$p -o ../REA/renders/v2/part$p.mp4 2>&1 | grep -vE "hf-progress|Streaming frame" | tail -1
    echo "rendered part$p"; done )
cd REA/renders/v2
# picture from the parts (trimmed to exact frame counts), audio from the master cut
ffmpeg -loglevel error -y -i part1.mp4 -i part2.mp4 -i part3.mp4 -i ../rough_v2_sdr/rough_cut.mp4 -filter_complex \
  "[0:v]trim=end_frame=4427,setpts=PTS-STARTPTS[a];[1:v]trim=end_frame=4752,setpts=PTS-STARTPTS[b];[2:v]trim=end_frame=7824,setpts=PTS-STARTPTS[c];[a][b][c]concat=n=3:v=1:a=0,format=yuv420p[v];[3:a]aresample=48000,apad=whole_dur=566.7667[au]" \
  -map "[v]" -map "[au]" -c:v libx264 -preset slow -crf 18 -profile:v high -c:a aac -b:a 320k -shortest -movflags +faststart REA-v2-full-nomix.mp4
echo joined
cd ../../..
python3 scripts/mix-final.py REA/renders/v2/REA-v2-full-nomix.mp4 REA/media/music/rea-bed-long.wav REA/edits/REA-v2.sfx-cues.json \
  REA/media/sfx REA/edits/REA-v2.cut-words.json REA/renders/v2/REA-v2-final.mp4 --bed 0.25 --end-bed 0.55
cd REA/renders/v2
ffmpeg -loglevel error -y -i REA-v2-final.mp4 -vf scale=960:-2 -c:v libx264 -preset medium -b:v 300k -maxrate 420k -bufsize 840k -pass 1 -passlogfile pf -an -f mp4 /dev/null
ffmpeg -loglevel error -y -i REA-v2-final.mp4 -vf scale=960:-2 -c:v libx264 -preset medium -b:v 300k -maxrate 420k -bufsize 840k -pass 2 -passlogfile pf -c:a aac -b:a 96k -movflags +faststart REA-v2-final-review.mp4
ls -la REA-v2-final.mp4 REA-v2-final-review.mp4; echo ALL_DONE
