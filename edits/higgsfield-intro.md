# Higgsfield intro ("My room went crazy"): rough cut for Higgsfield

Source: Drive folder `1k39xks3sYcDJLDvchQZuNlz_YipTxB44`
- Take A `IMG_1802.MOV` (6:50), Take B `IMG_1803.MOV` (4:54). 1920×1080, 30 fps, HEVC 10-bit HLG (iPhone HDR).

Output: `renders/higgsfield/S1..S7_*.mp4`. These are H.264 High, 30 fps, CRF 18, AAC 320k. They're
tone-mapped HLG → SDR Rec.709 (zscale + hable) so Higgsfield doesn't get washed-out HDR.

| Clip | Take | In → Out (s) | Length | Lines |
|---|---|---|---|---|
| S1_fire | B | 46.5 → 66.4 | 19.9 | "Okay. Today I'm going to show you something really crazy." … "Wait, what?" … "How did I do that?" |
| S2_portal | A | 91.2 → 103.8 | 12.6 | "Okay, that was weird." (turns ~95–98 s, pulled back ~99–101 s) "No, no, no. Wait, wait." |
| S3_robot | B | 112.4 → 127.0 | 14.6 | "Okay, I'm back. I'm fine." (looks at hand ~118–120 s) "Bro, am I a robot now?" |
| S4_three_kalyans | B | 144.4 → 159.5 | 15.1 | "Finally, I'm normal again." (looks at clones ~149–151 s) "Guys, this is my channel." |
| S5_shrinking | B | 169.8 → 194.8 | 25.0 | "Can I please just finish this video?" … "Wait, why is everything so big?" |
| S6_space | B | 204.4 → 222.0 | 17.6 | "Okay, that's enough AI for today." … "Great." (looks up) "Great. I think I'm in space now." … "Perfect." |
| S7_reveal | B | 241.3→248.35 + 251.85→256.95 + 277.4→287.5 | 22.3 | "Obviously, none of that actually happened. I made all of these crazy videos using Higgsfield AI. And the best part is I didn't need a Hollywood studio or expensive VFX software. So, in this video I'll show you how I created these effects, the exact prompts I used and what actually worked. So, let's get started." |

S1–S6 are each one continuous shot with no stumbles. S7 needs 2 jump cuts to remove the stumbles,
because no clean single run exists in either take.

## Lines in the master prompt that were not recorded

- S1: "WHAT?!" (the loud reaction as the fireball grows); "Bro… how did I just do that?" (recorded as "How did I do that?")
- S2: "Huh? What's that sound?", "No way…", "NO, NO, NO!" (loud, while being pulled)
- S3: "Wait… not again!", "What is happening to me?!"
- S4: "Seriously?! Why are there THREE of me?", "Unbelievable…"; clone lines: "So… who's making the YouTube video?" (Clone 1), "Not me, bro. I'm going home." (Clone 2), "Then you make the video!" (Clone 1)
- S5: "Oh, come on…", "WAIT! WHY AM I GETTING SMALLER?!", "Is that… my coffee?", "NOPE! NOPE! NOPE!"
- S6: "No… no, no…"
- S7: "Okay, okay! Relax!", "And trust me, some results were really surprising."
