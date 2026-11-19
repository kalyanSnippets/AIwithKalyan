# SNAP Reel / Short: rough cut v1 (2026-11-19)

**Sources** (Drive folder `1k39xks3sYcDJLDvchQZuNlz_YipTxB44`, copied to `media/raw/snap/`):

| Take | File | Format | Result |
|---|---|---|---|
| A | `Teleprompter-2026-19-11_20-41-56.mp4` (6:22) | 1080×1920, 30 fps, SDR | Many retakes; not used |
| B | `Teleprompter-2026-19-11_20-52-15.mp4` (2:50) | 1080×1920, 30 fps, SDR | Cleaner, has every gesture; used for every segment |

Transcripts: `transcripts/TP_A_20-41-56/`, `transcripts/TP_B_20-52-15/`.

## Edit decision list (Take B, seconds)

| # | In → Out | Content | Notes |
|---|---|---|---|
| 1 | 2.80 → 4.95 | **SNAP #1** (throne) | Cuts before the false-start "Higgsfield" at 5.12 |
| 2 | 7.30 → 18.60 | "Higgsfield just made AI video free for three days." + **MASK PEEL** + "And no, I don't have a VFX studio. This is my bedroom." | Audio muted 11.95–14.25 to drop the "And no… no" false start; the peel plays silent |
| 3 | 21.30 → 28.90 | **SHIRT PULL** + "I just film myself on phone, and Claude cut every scene of me." | Audio muted 22.80–24.55 to drop the "I just film my—" false start |
| 4 | 29.80 → 31.30 | **SNAP #2** (jungle) | The cut after this snap is hidden by the jungle transition |
| 5 | 43.30 → 46.60 | "Then Higgsfield added all the effects right inside Claude." | Second, cleaner delivery |
| 6 | 48.20 → 57.50 | "But how? With something called MCP… use Higgsfield for you." | One clean run |
| 7 | 83.45 → 98.80 | "Here is how you get it for free… Claude asks Higgsfield to make it." | One clean run |
| 8 | 109.30 → 126.50 | Paid-plan warning + **SNAP #3** (~117.5) + "Honestly… one idea." | Includes the snap back to the real studio |
| IG 9 | 130.85 → 133.65 | "Comment snap, and I'll send you all the setup steps." | |
| IG 10 | 147.75 → 152.65 | "And follow AI with Kalyan to test a new AI tool every week, so you don't have to." | |
| YT 9 | 156.50 → 159.45 | "Tell me in the comments below, what should I turn into next?" | |
| YT 10 | 163.45 → 169.00 | "And subscribe to AI with Kalyan. The full tutorial with every prompt is coming on my channel." | |

## Outputs (`renders/snap/`, not in git)

| File | Length | Size | Spec |
|---|---|---|---|
| `SNAP_roughcut_INSTAGRAM.mp4` | 75.5 s | 72.7 MB | 1080×1920, 30 fps, H.264 CRF 18, AAC 320k, −14.2 LUFS, peak −0.9 dBFS |
| `SNAP_roughcut_YOUTUBE.mp4` | 76.4 s | 73.7 MB | same, −14.3 LUFS |
| `*_review.mp4` | | ~11 MB each | 720p review copies |

Verified by re-transcribing both cuts with ElevenLabs: no stumbles or repeats remain.

## Known issues / next steps

- **Length:** 75 s, longer than the planned 45–60 s. To tighten:
  - trim pauses inside segment 7 and segment 8, or
  - drop "Now just type your idea, and Claude asks Higgsfield to make it."
- **Silent gesture beats:** the mask peel (about 3 s) and shirt pull (about 3.5 s) are silent. Fill them with the transformation SFX after Higgsfield. They are deliberately left long so the effect has room.
- **Small wording differences from the script:**
  - "film myself on phone" (the word "my" is missing)
  - "every scene of me"
  - "cancel before it"

  All are natural enough to keep.
- **IG promise:** the ending says "I'll send you all the setup steps". Only keep this if the DMs or comment replies will actually be sent.
- **Studio Sound:** not applied yet; run it in Descript before the final.
