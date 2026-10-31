#!/bin/bash
# REA v2 HQ rebuild: the talking-head footage was going through ~5 lossy encodes (soft bilinear 4K→1080 proxy,
# veryfast CRF 18-20 cuts, JPEG frame extraction in HyperFrames, 3 Mbps final). This rebuilds the camera chain from the
# 4K HLG originals with a lanczos downscale and near-lossless encodes, keeping every frame on the same timing.
#
#   bash scripts/rea-v2-hq.sh A   # HQ rough cut from 4K, then graded camera clips cut from it at the same frames
#   bash scripts/rea-v2-hq.sh B   # Remotion inserts, HyperFrames parts (PNG frames), join, final mix, review copies
set -e
cd "$(dirname "$0")/.."
ROOT=$PWD
LINKS=${LINKS:-REA/media/raw_links}          # raw files under the clip names the EDL uses (~ → _)
HQ=REA/renders/rough_v2_hq
TM="zscale=w=1920:h=1080:filter=lanczos:t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0:peak=4,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
G="colorbalance=gm=0.05:gh=0.04:rm=-0.02,eq=contrast=1.08:saturation=1.06:gamma=0.98,curves=all='0/0.02 0.25/0.22 0.75/0.79 1/0.98',unsharp=5:5:0.35:5:5:0"

if [ "$1" = A ]; then
  mkdir -p "$LINKS"; for f in REA/media/raw/*.mp4; do b=$(basename "$f"); ln -sf "$ROOT/$f" "$LINKS/${b//\~/_}"; done
  # 1) full cut + a 1.0x-speed cut of section 1 (the hook insert plays that at 1.1x itself)
  python3 scripts/rough-cut.py REA/edits/REA-v2.edl.json "$LINKS" REA/transcripts $HQ --pad 0.15 --join 0.35 \
    --vf "$TM" --crf 14 --preset medium --words $HQ/cut-words.json | grep -v "^skip"
  python3 -c "import json;e=json.load(open('REA/edits/REA-v2.edl.json'));[x.pop('speed',None) for x in e];json.dump([x for x in e if x['section']=='S1'],open('$HQ.s1x1.edl.json','w'))"
  python3 scripts/rough-cut.py $HQ.s1x1.edl.json "$LINKS" REA/transcripts ${HQ}_s1x1 --pad 0.15 --join 0.35 --vf "$TM" --crf 14 --preset medium | tail -1
  rm -rf $HQ/parts
  # 2) camera clips: same frames as before (located by matching the old clips), graded + light sharpen, CRF 12
  python3 - <<'EOF'
import json, subprocess, numpy as np
HQ="REA/renders/rough_v2_hq"
G=open("scripts/rea-v2-hq.sh").read().split('G="')[1].split('"\n')[0]
def frames(f, n=None):
    r=subprocess.run(["ffmpeg","-v","error","-i",f]+(["-frames:v",str(n)] if n else [])+["-vf","scale=48:27,format=gray","-f","rawvideo","-"],capture_output=True).stdout
    return np.frombuffer(r,np.uint8).reshape(-1,48*27).astype(np.float32)
def count(f):
    return int(subprocess.run(["ffprobe","-v","error","-count_frames","-select_streams","v","-show_entries","stream=nb_read_frames","-of","csv=p=0",f],capture_output=True,text=True).stdout)
clips={"compositions/REA-v2-part1/media/cam.mp4":HQ, "compositions/REA-v2-part2/media/cam.mp4":HQ, "compositions/REA-v2-part3/media/cam.mp4":HQ,
 "REA/remotion/public/part1/hook2cut.mp4":HQ+"_s1x1", "REA/remotion/public/part1/nodemap.mp4":HQ, "REA/remotion/public/part1/blender.mp4":HQ,
 "REA/remotion/public/part2/s7cam.mp4":HQ, "REA/remotion/public/part3/loopcam.mp4":HQ}
cache={}
for c, src in clips.items():
    old=c+".ungraded.mp4"; n=count(old); C=frames(old,40)
    R=cache.setdefault(src, frames(src+"/rough_cut.mp4"))
    d=np.array([np.abs(R[i:i+len(C)]-C).mean() for i in range(len(R)-len(C))]); i=int(d.argmin())
    print(f"{c}: frame {i} (+{n}), match error {d[i]:.2f}", flush=True)
    assert d[i] < 3.0, "clip not found in the HQ cut"
    has_a = "audio" in subprocess.run(["ffprobe","-v","error","-show_entries","stream=codec_type","-of","csv=p=0",old],capture_output=True,text=True).stdout
    a = ["-c:a","aac","-b:a","192k"] if has_a else ["-an"]
    subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{i/30:.4f}","-i",src+"/rough_cut.mp4","-frames:v",str(n),"-t",f"{n/30:.4f}",
                    "-vf",G+",format=yuv420p","-c:v","libx264","-preset","medium","-crf","12",*a,"-movflags","+faststart",c+".tmp.mp4"],check=True)
    m=count(c+".tmp.mp4"); assert m==n, (m,n)
    subprocess.run(["mv",c+".tmp.mp4",c],check=True); subprocess.run(["rm","-f",old])
EOF
  rm -rf $HQ/rough_cut.mp4 ${HQ}_s1x1 REA/renders/rough_v2_sdr/parts   # disk is tight; cut-words + markers are kept
  df -h . | tail -1; echo STAGE_A_DONE
fi

if [ "$1" = B ]; then
  ( cd REA/remotion
    for c in "Hook2Cut part1" "NodeMap part1" "Blender part1" "RunTerm part2" "Loop part3"; do set -- $c
      npx remotion render src/index.ts $1 ../../compositions/REA-v2-$2/media/r_$1.mp4 --muted --crf 12 \
        --browser-executable=/opt/pw-browsers/chromium --gl=angle --concurrency=3 2>&1 | tail -1; done )
  ( cd compositions
    for p in 1 2 3; do rm -rf ../REA/renders/v2/.part$p.hf-* ../REA/renders/v2/work-* ../REA/renders/v2/part$p.mp4
      npx hyperframes render REA-v2-part$p -o ../REA/renders/v2/part$p.mp4 --video-frame-format png --crf 12 2>&1 | grep -vE "hf-progress|Streaming frame" | tail -1
      echo "rendered part$p"; done )
  cd REA/renders/v2; rm -f REA-v2-final.mp4 REA-v2-final-review.mp4
  ffmpeg -loglevel error -y -i part1.mp4 -i part2.mp4 -i part3.mp4 -i ../rough_v2_sdr/rough_cut.mp4 -filter_complex \
    "[0:v]trim=end_frame=4427,setpts=PTS-STARTPTS[a];[1:v]trim=end_frame=4752,setpts=PTS-STARTPTS[b];[2:v]trim=end_frame=7824,setpts=PTS-STARTPTS[c];[a][b][c]concat=n=3:v=1:a=0,format=yuv420p[v];[3:a]aresample=48000,apad=whole_dur=566.7667[au]" \
    -map "[v]" -map "[au]" -c:v libx264 -preset slow -crf 15 -tune film -profile:v high -c:a aac -b:a 320k -t 566.7667 -movflags +faststart REA-v2-full-nomix.mp4
  echo joined
  cd "$ROOT"
  python3 scripts/mix-final.py REA/renders/v2/REA-v2-full-nomix.mp4 REA/media/music/rea-bed-long.wav REA/edits/REA-v2.sfx-cues.json \
    REA/media/sfx REA/edits/REA-v2.cut-words.json REA/renders/v2/REA-v2-final.mp4 --bed 0.25 --end-bed 0.55
  rm -f REA/renders/v2/REA-v2-full-nomix.mp4
  cd REA/renders/v2
  ffmpeg -loglevel error -y -i REA-v2-final.mp4 -vf scale=960:-2 -c:v libx264 -preset medium -b:v 300k -maxrate 420k -bufsize 840k -pass 1 -passlogfile pf -an -f mp4 /dev/null
  ffmpeg -loglevel error -y -i REA-v2-final.mp4 -vf scale=960:-2 -c:v libx264 -preset medium -b:v 300k -maxrate 420k -bufsize 840k -pass 2 -passlogfile pf -c:a aac -b:a 96k -movflags +faststart REA-v2-final-review.mp4
  rm -f pf-0.log*
  # full-resolution sample so sharpness can be judged (the small review copy can't show it)
  ffmpeg -loglevel error -y -ss 0 -i REA-v2-final.mp4 -t 20 -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 160k -movflags +faststart REA-v2-final-HD-sample.mp4
  ls -la REA-v2-final.mp4 REA-v2-final-review.mp4 REA-v2-final-HD-sample.mp4; echo ALL_DONE
fi
