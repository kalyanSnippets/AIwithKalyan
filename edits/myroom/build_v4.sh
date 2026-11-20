#!/usr/bin/env bash
# "My Room Went Crazy" v4 (2026-11-20, review 3)
#  - chair floats back to mid-distance → sparks swirl in and become the clones (clip 6's repeated close-up skipped)
#  - ESC zap whites out → blue particles rebuild Kalyan in his room → "Finally, I'm back" (Higgsfield)
#  - then the ORIGINAL studio take for the reveal ("Okay, obviously, none of that actually happened…"),
#    colour-matched, with a fast 6-effect montage over "I made all of these crazy videos using Higgsfield AI"
set -euo pipefail
cd "$(dirname "$0")/../.."
D=media/raw/hf_gen
X=media/sfx/myroom
M=media/music/myroom/bed_v4.mp3
ORIG=renders/higgsfield/S7_reveal.mp4     # Take B (IMG_1803) reveal, HDR→SDR, 3 clean pieces (see edits/higgsfield-intro.md)
T=renders/myroom/tmp_v4
OUT=renders/myroom
mkdir -p "$T"
UP="scale=1920:1080:flags=lanczos,unsharp=5:5:0.6:5:5:0.0,fps=24"

prep() { # name src in out
  ffmpeg -v error -y -ss "$3" -to "$4" -i "$D/$2.mp4" -vf "$UP,format=yuv420p" \
    -af "loudnorm=I=-16:TP=-2:LRA=11,aresample=48000" -ar 48000 -ac 2 \
    -c:v libx264 -preset medium -crf 14 -c:a pcm_s16le "$T/$1.mov"
}
prep A 1_S1_fire     0.00 18.95 &   # fire; ends the moment the spark disappears
prep B 2_S2_after    2.20  8.10 &   # portal → space → chair floats back to mid-distance
prep C 6_hf_0101     2.45 19.00 &   # sparks swirling in → clones form → clones vanish
prep D 3_S3_robot    1.40 13.10 &   # "No, no, no, wait, not again" → robot → armour off (continues into shrink)
prep E 5_S5_esc_key  5.25 19.25 &   # tiny on the keyboard → ESC → zap whites out
prep F 7_S7_back     0.00  5.45 &   # blue particles rebuild him in his room → "Finally, I'm back"
wait

# robot → shrink-in-space insert (same source frames, no transition)
[ -f renders/myroom/shrink/shrink.mov ] || bash edits/myroom/make_shrink.sh
ffmpeg -v error -y -i $T/D.mov -i renders/myroom/shrink/shrink.mov -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 14 -c:a pcm_s16le $T/DS.mov && mv $T/DS.mov $T/D.mov

# ---- G: original reveal, colour-matched to the Higgsfield studio look, 24 fps ----
# montage over "I made all of these crazy videos using Higgsfield AI" (3.10–7.40 s; also hides jump cut 1 at 7.05 s)
# gentle punch-in from 12.15 s (jump cut 2) so it reads as a camera change
MS=3.10; MF=17   # 6 shots × 17 frames = 102 frames = 4.25 s
mshot() { # n src in   (1080p, 24 fps, no audio)
  ffmpeg -v error -y -ss "$3" -i "$2" -vf "$UP,format=yuv420p" -frames:v $MF -an -c:v libx264 -crf 14 $T/m$1.mp4; }
mshot 1 $D/1_S1_fire.mp4    9.60 &   # fireball in the hand
mshot 2 $D/2_S2_after.mp4   3.10 &   # portal blooming
mshot 3 $D/6_hf_0101.mp4    5.20 &   # three Kalyans
mshot 4 $D/3_S3_robot.mp4   8.60 &   # robot armour + shield
mshot 5 renders/myroom/shrink/shrink.mov 1.20 &   # shrinking in space
mshot 6 $D/5_S5_esc_key.mp4 17.30 &  # ESC zap on the keyboard
wait
printf "file '%s'\n" $PWD/$T/m{1..6}.mp4 > $T/m.txt
ffmpeg -v error -y -f concat -safe 0 -i $T/m.txt -c copy $T/montage.mp4

LUT="lutrgb=r='clip(val*1.0042-0.66\,0\,255)':g='clip(val*1.0034+1.08\,0\,255)':b='clip(val*0.9936+2.48\,0\,255)'"
PI="if(gte(t\,12.15)\,1.10\,1)"
ffmpeg -v error -y -i $ORIG -i $T/montage.mp4 -filter_complex "
[0:v]fps=24,format=rgb24,$LUT,
     scale=w='trunc(1920*$PI/2)*2':h='trunc(1080*$PI/2)*2':eval=frame,crop=1920:1080:(iw-1920)/2:(ih-1080)*0.25,format=yuv420p[base];
[1:v]setpts=PTS-STARTPTS+$MS/TB[mon];
[base][mon]overlay=enable='between(t\,$MS\,$MS+4.25)':eof_action=pass,format=yuv420p[v];
[0:a]loudnorm=I=-16:TP=-2:LRA=11,aresample=48000[a]" \
  -map "[v]" -map "[a]" -r 24 -ar 48000 -ac 2 -c:v libx264 -preset medium -crf 14 -c:a pcm_s16le $T/G.mov

dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
dA=$(dur $T/A.mov); dB=$(dur $T/B.mov); dC=$(dur $T/C.mov); dD=$(dur $T/D.mov); dE=$(dur $T/E.mov); dF=$(dur $T/F.mov)
tAB=0.20; tBC=0.50; tCD=0.40; tDE=0.30; tEF=0.25; tFG=0.30
o1=$(echo "$dA-$tAB" | bc -l)
o2=$(echo "$o1+$dB-$tBC" | bc -l)
o3=$(echo "$o2+$dC-$tCD" | bc -l)
o4=$(echo "$o3+$dD-$tDE" | bc -l)
o5=$(echo "$o4+$dE-$tEF" | bc -l)
o6=$(echo "$o5+$dF-$tFG" | bc -l)

ffmpeg -v error -y -i $T/A.mov -i $T/B.mov -i $T/C.mov -i $T/D.mov -i $T/E.mov -i $T/F.mov -i $T/G.mov -filter_complex "
[0:v][1:v]xfade=transition=fade:duration=$tAB:offset=$o1[v1];
[v1][2:v]xfade=transition=fade:duration=$tBC:offset=$o2[v2];
[v2][3:v]xfade=transition=fade:duration=$tCD:offset=$o3[v3];
[v3][4:v]xfade=transition=fadewhite:duration=$tDE:offset=$o4[v4];
[v4][5:v]xfade=transition=fadewhite:duration=$tEF:offset=$o5[v5];
[v5][6:v]xfade=transition=fade:duration=$tFG:offset=$o6,format=yuv420p[v];
[0:a][1:a]acrossfade=d=$tAB[a1];[a1][2:a]acrossfade=d=$tBC[a2];[a2][3:a]acrossfade=d=$tCD[a3];
[a3][4:a]acrossfade=d=$tDE[a4];[a4][5:a]acrossfade=d=$tEF[a5];[a5][6:a]acrossfade=d=$tFG[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 14 -c:a pcm_s16le $T/picture_dialogue.mov

TOTAL=$(dur $T/picture_dialogue.mov)
echo "starts: B=$o1 C=$o2 D=$o3 E=$o4 F=$o5 G=$o6 total=$TOTAL"

at() { echo "$1+$2-$3" | bc -l; }
shr=$(echo "$o4+$tDE-2.625+0.45" | bc -l)
sfx=( "fire_ignite 8.70 0.55"
      "portal_open $(at $o1 2.25 2.20) 0.45"
      "vanish_shimmer $(echo "$o2-0.15" | bc -l) 0.40"
      "clone_pop $(echo "$o2+0.85" | bc -l) 0.50"
      "robot_transform $(at $o3 4.05 1.40) 0.50"
      "shrink $shr 0.55"
      "key_zap $(at $o4 16.75 5.25) 0.50"
      "reassemble $(echo "$o5+0.10" | bc -l) 0.45"
      "teleport $(echo "$o6+$MS-0.05" | bc -l) 0.40"
      "space_whoosh $(echo "$o6+$MS+4.20" | bc -l) 0.35" )
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
  -c:a aac -b:a 320k -movflags +faststart "$OUT/MyRoomWentCrazy_v4_1080p.mp4"

ffmpeg -v error -y -i "$OUT/MyRoomWentCrazy_v4_1080p.mp4" -vf scale=1280:720 -c:v libx264 -preset slow -crf 27 \
  -c:a aac -b:a 128k -movflags +faststart "$OUT/MyRoomWentCrazy_v4_review.mp4"
echo done
