#!/usr/bin/env bash
# Shrink-in-space insert: Kalyan (just back from robot form, in space) shrinks down into his chair.
# Inputs (made beforehand):
#   renders/myroom/shrink/src.mp4    clip 3 at 13.10–15.05 s, upscaled to 1080p
#   renders/myroom/shrink/matte.mov  `npx hyperframes remove-background src.mp4 -o matte.mov`
#   renders/myroom/shrink/plate.png  clean space + empty chair (Higgsfield gpt_image_2_6 edit of frame.png, 0.25 credits)
set -euo pipefail
cd "$(dirname "$0")/../.."
W=renders/myroom/shrink
DUR=2.625            # 63 frames @ 24 fps
AX=960; AY=940       # anchor: chair seat (he shrinks into the seat)
# scale: hold 0.45 s, then ease down to ~1.5 % by 2.2 s
S="if(lt(t\,0.45)\,1\,max(0.012\,1-0.988*pow(min(1\,(t-0.45)/1.75)\,1.6)))"

ffmpeg -v error -y \
  -loop 1 -framerate 24 -t $DUR -i $W/plate.png \
  -i $W/matte.mov -i $W/src.mp4 \
  -f lavfi -t $DUR -i "color=c=white:s=64x64:r=24,format=rgba,geq=r=255:g=255:b=255:a='255*exp(-((X-32)*(X-32)+(Y-32)*(Y-32))/90)'" \
  -filter_complex "
[0:v]scale=1920:1080,format=rgba,setsar=1[bg];
[1:v]format=rgba,lutrgb=a='clip(val*1.6\,0\,255)',tpad=stop_mode=clone:stop_duration=1,trim=0:$DUR,setpts=PTS-STARTPTS,
     scale=w='max(2\,trunc(1920*$S/2)*2)':h='max(2\,trunc(1080*$S/2)*2)':eval=frame[fg];
[bg][fg]overlay=x='$AX-w*0.5':y='$AY-h*0.8704':eval=frame:format=auto[comp];
[3:v]fade=t=in:st=1.85:d=0.15:alpha=1,fade=t=out:st=2.25:d=0.3:alpha=1[glint];
[comp][glint]overlay=x=$((AX-32)):y=$((AY-40)):format=auto[comp2];
[2:v]format=rgba,tpad=stop_mode=clone:stop_duration=1,trim=0:$DUR,setpts=PTS-STARTPTS,fade=t=out:st=0.3:d=0.3:alpha=1[orig];
[comp2][orig]overlay=format=auto,format=yuv420p[v]" \
  -map "[v]" -r 24 -c:v libx264 -preset medium -crf 14 -an $W/shrink_video.mp4

# audio: clip 3 ambience under + "Wait, why am I getting smaller?" (clip 5, 2.60–4.75) from 0.15 s
ffmpeg -v error -y -ss 13.10 -to 15.05 -i media/raw/hf_gen/3_S3_robot.mp4 -ss 2.60 -to 4.75 -i media/raw/hf_gen/5_S5_esc_key.mp4 -filter_complex "
[0:a]loudnorm=I=-16:TP=-2,aresample=48000,apad,atrim=0:$DUR,volume=0.6[amb];
[1:a]loudnorm=I=-16:TP=-2,aresample=48000,adelay=150|150,apad,atrim=0:$DUR[line];
[amb][line]amix=inputs=2:normalize=0,afade=t=out:st=$(echo "$DUR-0.15"|bc):d=0.15[a]" -map "[a]" -ar 48000 -ac 2 -c:a pcm_s16le $W/shrink_audio.wav

ffmpeg -v error -y -i $W/shrink_video.mp4 -i $W/shrink_audio.wav -c:v copy -c:a pcm_s16le -shortest $W/shrink.mov
echo "shrink insert: $(ffprobe -v error -show_entries format=duration -of csv=p=0 $W/shrink.mov)s"
