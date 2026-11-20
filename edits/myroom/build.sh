#!/usr/bin/env bash
# "My room went crazy": assemble the 6 Higgsfield clips into one smooth 1080p intro.
# Order: 1 Fire → 2 Portal → 3 Robot → 6 Clones (space) → 5 Shrink/ESC (from 1.85 s, "Come on" cut) → 7 Reveal
set -euo pipefail
cd "$(dirname "$0")/../.."
D=media/raw/hf_gen
X=media/sfx/myroom
M=media/music/myroom/bed.mp3
T=renders/myroom/tmp
OUT=renders/myroom
mkdir -p "$T"

# 1) Prep: trim, free upscale to 1920x1080 (lanczos + light sharpen), 24 fps,
#    and level each clip's own audio to -16 LUFS so nothing jumps.
prep() { # name src start [extra video filter]
  ffmpeg -v error -y -ss "$3" -i "$D/$2.mp4" \
    -vf "scale=1920:1080:flags=lanczos,unsharp=5:5:0.6:5:5:0.0,fps=24${4:+,$4},format=yuv420p" \
    -af "loudnorm=I=-16:TP=-2:LRA=11,aresample=48000" -ar 48000 -ac 2 \
    -c:v libx264 -preset medium -crf 14 -c:a pcm_s16le "$T/$1.mov"
}
prep c1 1_S1_fire    0    &
# clip 2: smooth punch-in on the floating chair over its last 0.9 s (eases into the space close-up of clip 3)
D2=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$D/2_S2_after.mp4")
Z="1+2.2*pow(max(0\,(t-($D2-0.9))/0.9)\,2)"
prep c2 2_S2_after   0 "scale=w='trunc(1920*($Z)/2)*2':h='trunc(1080*($Z)/2)*2':eval=frame:flags=bicubic,crop=1920:1080:(iw-1920)/2:(ih-1080)/2" &
prep c3 3_S3_robot   0    &
prep c6 6_hf_0101    0    &
prep c5 5_S5_esc_key 1.85 &
prep c7 7_S7_back    0    &
wait

dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
d1=$(dur $T/c1.mov); d2=$(dur $T/c2.mov); d3=$(dur $T/c3.mov); d6=$(dur $T/c6.mov); d5=$(dur $T/c5.mov)
# transition lengths
t12=0.30; t23=0.50; t36=0.50; t65=0.40; t57=0.25
o1=$(echo "$d1-$t12" | bc -l)
o2=$(echo "$o1+$d2-$t23" | bc -l)
o3=$(echo "$o2+$d3-$t36" | bc -l)
o4=$(echo "$o3+$d6-$t65" | bc -l)
o5=$(echo "$o4+$d5-$t57" | bc -l)

# 2) Picture + dialogue with smooth transitions:
#    1→2 dissolve · 2→3 punch-in + dissolve · 3→6 dissolve · 6→5 white flash · 5→7 dissolve (5 already ends on white)
ffmpeg -v error -y -i $T/c1.mov -i $T/c2.mov -i $T/c3.mov -i $T/c6.mov -i $T/c5.mov -i $T/c7.mov -filter_complex "
[0:v][1:v]xfade=transition=fade:duration=$t12:offset=$o1[v1];
[v1][2:v]xfade=transition=fade:duration=$t23:offset=$o2[v2];
[v2][3:v]xfade=transition=fade:duration=$t36:offset=$o3[v3];
[v3][4:v]xfade=transition=fadewhite:duration=$t65:offset=$o4[v4];
[v4][5:v]xfade=transition=fade:duration=$t57:offset=$o5,format=yuv420p[v];
[0:a][1:a]acrossfade=d=$t12[a1];[a1][2:a]acrossfade=d=$t23[a2];[a2][3:a]acrossfade=d=$t36[a3];
[a3][4:a]acrossfade=d=$t65[a4];[a4][5:a]acrossfade=d=$t57[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 14 -c:a pcm_s16le $T/picture_dialogue.mov

TOTAL=$(dur $T/picture_dialogue.mov)
echo "clip starts: c2=$o1 c3=$o2 c6=$o3 c5=$o4 c7=$o5 total=$TOTAL"

# 3) SFX (timeline seconds, from frame checks) · each ≥0.9 s apart
sfx=( "fire_ignite 8.70 0.55" "portal_open 21.50 0.45" "space_whoosh 30.80 0.50"
      "robot_transform 35.00 0.50" "clone_pop 48.10 0.50" "vanish_shimmer 63.50 0.45"
      "teleport 68.70 0.50" "shrink 69.80 0.45" "key_zap 84.10 0.50" "thunder 88.80 0.55"
      "reassemble 91.80 0.45" )
inputs=(); chains=""; labels=""; i=0
for s in "${sfx[@]}"; do set -- $s; i=$((i+1))
  inputs+=(-i "$X/$1.mp3")
  ms=$(echo "$2*1000/1" | bc)
  chains+="[$i:a]aresample=48000,aformat=channel_layouts=stereo,volume=$3,adelay=${ms}|${ms}[s$i];"
  labels+="[s$i]"
done
n=$i; mi=$((n+1))

# 4) Mix: dialogue + SFX + music bed (0.11, ducked under dialogue), fades, -14 LUFS / -1 dBTP
ffmpeg -v error -y -i $T/picture_dialogue.mov "${inputs[@]}" -i "$M" -filter_complex "
${chains}
[0:a]aresample=48000,asplit=2[dlg][sc];
[$mi:a]aresample=48000,aformat=channel_layouts=stereo,volume=0.11,afade=t=in:d=1.5,afade=t=out:st=$(echo "$TOTAL-2.5"|bc -l):d=2.5,atrim=0:$TOTAL[mus];
[mus][sc]sidechaincompress=threshold=0.04:ratio=6:attack=20:release=400[duck];
[dlg]${labels}[duck]amix=inputs=$((n+2)):normalize=0:duration=first,loudnorm=I=-14:TP=-1:LRA=11,aresample=48000[mix]" \
  -map 0:v -map "[mix]" -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -r 24 \
  -c:a aac -b:a 320k -movflags +faststart "$OUT/MyRoomWentCrazy_v1_1080p.mp4"

# 5) Review copy (<30 MB)
ffmpeg -v error -y -i "$OUT/MyRoomWentCrazy_v1_1080p.mp4" -vf scale=1280:720 -c:v libx264 -preset slow -crf 27 \
  -c:a aac -b:a 128k -movflags +faststart "$OUT/MyRoomWentCrazy_v1_review.mp4"
echo done
