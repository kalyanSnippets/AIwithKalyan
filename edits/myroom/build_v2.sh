#!/usr/bin/env bash
# "My Room Went Crazy" v2: re-ordered per Kalyan's review (2026-11-20).
# Fire (spark flies off and vanishes) → portal turns the room into space → chair floats back →
# clones → "No, no, no, wait, not again" robot → snap → tiny on the keyboard → ESC zap → "Finally, I'm back" reveal.
set -euo pipefail
cd "$(dirname "$0")/../.."
D=media/raw/hf_gen
X=media/sfx/myroom
M=media/music/myroom/bed_v2.mp3
T=renders/myroom/tmp_v2
OUT=renders/myroom
mkdir -p "$T"

prep() { # name src in out
  ffmpeg -v error -y -ss "$3" -to "$4" -i "$D/$2.mp4" \
    -vf "scale=1920:1080:flags=lanczos,unsharp=5:5:0.6:5:5:0.0,fps=24,format=yuv420p" \
    -af "loudnorm=I=-16:TP=-2:LRA=11,aresample=48000" -ar 48000 -ac 2 \
    -c:v libx264 -preset medium -crf 14 -c:a pcm_s16le "$T/$1.mov"
}
prep A 1_S1_fire     0.00 18.95 &   # fire; ends the moment the spark disappears
prep B 2_S2_after    2.20  8.75 &   # starts as the portal glow begins; ends while the chair floats back
prep C 6_hf_0101     0.80 19.00 &   # clones in space; ends once they've vanished (rings / "come on" dropped)
prep D 3_S3_robot    1.40 13.20 &   # "No, no, no, wait, not again" → robot → snaps back to normal
prep E 5_S5_esc_key  5.25 19.25 &   # tiny on the keyboard → ESC → zap whites out (studio/lightning dropped)
prep F 7_S7_back     0.00 22.04 &   # particles → "Finally, I'm back" → reveal
wait

dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
dA=$(dur $T/A.mov); dB=$(dur $T/B.mov); dC=$(dur $T/C.mov); dD=$(dur $T/D.mov); dE=$(dur $T/E.mov)
tAB=0.20; tBC=0.50; tCD=0.40; tDE=0.30; tEF=0.20
o1=$(echo "$dA-$tAB" | bc -l)
o2=$(echo "$o1+$dB-$tBC" | bc -l)
o3=$(echo "$o2+$dC-$tCD" | bc -l)
o4=$(echo "$o3+$dD-$tDE" | bc -l)
o5=$(echo "$o4+$dE-$tEF" | bc -l)

# A→B quick dissolve (spark gone → portal blooms) · B→C dissolve while floating back ·
# C→D dissolve · D→E white flash on the snap · E→F dissolve (white zap → particle burst)
ffmpeg -v error -y -i $T/A.mov -i $T/B.mov -i $T/C.mov -i $T/D.mov -i $T/E.mov -i $T/F.mov -filter_complex "
[0:v][1:v]xfade=transition=fade:duration=$tAB:offset=$o1[v1];
[v1][2:v]xfade=transition=fade:duration=$tBC:offset=$o2[v2];
[v2][3:v]xfade=transition=fade:duration=$tCD:offset=$o3[v3];
[v3][4:v]xfade=transition=fadewhite:duration=$tDE:offset=$o4[v4];
[v4][5:v]xfade=transition=fade:duration=$tEF:offset=$o5,format=yuv420p[v];
[0:a][1:a]acrossfade=d=$tAB[a1];[a1][2:a]acrossfade=d=$tBC[a2];[a2][3:a]acrossfade=d=$tCD[a3];
[a3][4:a]acrossfade=d=$tDE[a4];[a4][5:a]acrossfade=d=$tEF[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 14 -c:a pcm_s16le $T/picture_dialogue.mov

TOTAL=$(dur $T/picture_dialogue.mov)
echo "starts: B=$o1 C=$o2 D=$o3 E=$o4 F=$o5 total=$TOTAL"

# SFX at timeline positions (source event time mapped through the trims above)
at() { echo "$1+$2-$3" | bc -l; }   # segment start + source time - source in-point
sfx=( "fire_ignite 8.70 0.55"
      "portal_open $(at $o1 2.25 2.20) 0.45"
      "space_whoosh $(at $o1 7.60 2.20) 0.50"
      "clone_pop $(at $o2 2.55 0.80) 0.50"
      "vanish_shimmer $(at $o2 18.05 0.80) 0.45"
      "robot_transform $(at $o3 4.05 1.40) 0.50"
      "teleport $(echo "$o4-0.1" | bc -l) 0.50"
      "key_zap $(at $o4 16.75 5.25) 0.50"
      "reassemble $o5 0.45" )
inputs=(); chains=""; labels=""; i=0
for s in "${sfx[@]}"; do set -- $s; i=$((i+1))
  inputs+=(-i "$X/$1.mp3"); ms=$(printf "%.0f" "$(echo "$2*1000" | bc -l)")
  echo "  sfx $1 @ $2"
  chains+="[$i:a]aresample=48000,aformat=channel_layouts=stereo,volume=$3,adelay=${ms}|${ms}[s$i];"
  labels+="[s$i]"
done
n=$i; mi=$((n+1))

ffmpeg -v error -y -i $T/picture_dialogue.mov "${inputs[@]}" -i "$M" -filter_complex "
${chains}
[0:a]aresample=48000,asplit=2[dlg][sc];
[$mi:a]aresample=48000,aformat=channel_layouts=stereo,volume=0.11,afade=t=in:d=1.5,afade=t=out:st=$(echo "$TOTAL-2.5"|bc -l):d=2.5,atrim=0:$TOTAL[mus];
[mus][sc]sidechaincompress=threshold=0.04:ratio=6:attack=20:release=400[duck];
[dlg]${labels}[duck]amix=inputs=$((n+2)):normalize=0:duration=first,loudnorm=I=-14:TP=-1:LRA=11,aresample=48000[mix]" \
  -map 0:v -map "[mix]" -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -r 24 \
  -c:a aac -b:a 320k -movflags +faststart "$OUT/MyRoomWentCrazy_v2_1080p.mp4"

ffmpeg -v error -y -i "$OUT/MyRoomWentCrazy_v2_1080p.mp4" -vf scale=1280:720 -c:v libx264 -preset slow -crf 27 \
  -c:a aac -b:a 128k -movflags +faststart "$OUT/MyRoomWentCrazy_v2_review.mp4"
echo done
