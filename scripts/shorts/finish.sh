#!/usr/bin/env bash
# Finish the Shorts: loudness (−14 LUFS integrated, −1 dBTP, two-pass loudnorm), final H.264 export,
# a < 30 MB review copy, an .srt and a cover frame for each.
#   bash scripts/shorts/finish.sh [01 02 03]
set -euo pipefail
cd "$(dirname "$0")/../.."
mkdir -p renders/shorts
for n in "${@:-01 02 03}"; do
  for n2 in $n; do
    in="renders/short-$n2-master.mp4"; out="renders/shorts/short-$n2-final.mp4"
    stats=$(ffmpeg -hide_banner -nostats -i "$in" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
    get() { echo "$stats" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
    ffmpeg -v error -y -i "$in" -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000" \
      -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 18 -preset slow -r 25 -c:a aac -b:a 320k -ar 48000 -movflags +faststart "$out"
    dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out")
    kbps=$(python3 -c "print(int(27*8*1024/$dur - 128))")
    ffmpeg -v error -y -i "$out" -vf scale=720:1280 -c:v libx264 -b:v ${kbps}k -maxrate ${kbps}k -bufsize $((kbps*2))k -preset medium -c:a aac -b:a 128k -movflags +faststart "renders/shorts/short-$n2-review.mp4"
    node scripts/shorts/srt.mjs "short-$n2" > "renders/shorts/short-$n2.srt"
    loud=$(ffmpeg -hide_banner -nostats -i "$out" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tr -s ' ' | tr '\n' ' ')
    echo "short-$n2: $(printf '%.2f' $dur)s · $(du -h "$out" | cut -f1) final · $(du -h renders/shorts/short-$n2-review.mp4 | cut -f1) review · $loud"
  done
done
