Title: My Codec & Transcoding Journey
Lead: Building an efficient multi‑codec media workflow with Unraid, Plex, NVENC, Quick Sync, Unmanic & strategic library planning
Published: 2025-09-06
Tags:
  - Unraid
  - Plex
  - AV1
  - HEVC
  - Transcoding
  - NVENC
  - Quick Sync
  - Media Server
  - Compression
  - Storage
---

# Unraid, Plex, Codecs & Compression: A Practical Journey

Over the past months I dove deep into media formats, hardware encoders, open vs licensed codecs, storage efficiency and how to orchestrate all of it on Unraid with Plex and Unmanic. This is the distilled narrative—what worked, what hurt, and what I’m optimizing toward.

## 1. The Starting Point

- Tens of thousands of mixed‑source video files (inconsistent containers, bitrates, color spaces, audio tracks)
- Goal: Cut storage without visible quality loss while increasing direct‑play success across very mixed devices
- Constraint: A grab‑bag of clients (older TVs, phones, SDR‑only panels, a few HDR10 sets, and just a couple of AV1‑capable devices)

## 2. Standards vs Implementations

Early on I kept bouncing between wikis, forum threads and ffmpeg docs just to decode people’s shorthand. Eventually it clicked: a *spec* (H.264/AVC, H.265/HEVC, AV1) is the published standard; *implementations* are the real-world encoders and decoders (ffmpeg builds, NVENC firmware generations, Intel Quick Sync versions, software encoders like libx265 or SVT‑AV1). They differ in speed, efficiency and feature completeness.

### ELI5 Glossary (What I Wish I Had On Day One)

- Codec: The compression method spec (e.g. H.264, HEVC, AV1, AAC).
- Encoding: Creating a compressed file from raw (or less‑compressed) source.
- Transcoding: Re‑encoding an existing file into a different codec, profile, bitrate or container (always risks some quality loss if the video stream is recompressed).
- Container / Format: The wrapper that holds video, audio, subtitles, metadata (MKV, MP4, MOV). Changing the container alone doesn’t affect quality.
- Profile / Level: Capability tiers inside a codec (e.g. Main10, Dolby Vision enhancement layers). Some devices only support a subset.
- Video Dynamic Range: SDR vs HDR10 vs Dolby Vision—how brightness & color are represented. Unsupported formats → washed out or crushed image.
- Standard vs Implementation: “HEVC” is the standard; NVENC HEVC, Quick Sync HEVC, libx265 are separate implementations with different trade‑offs.
- Hardware Encoder: Fixed‑function block on GPU/iGPU (NVENC, Quick Sync) — fast, predictable, “good enough” quality per bitrate.
- Software Encoder: CPU / compute based (libx265 slow presets, SVT‑AV1) — slower but can squeeze more quality at a given bitrate.
- Quality Loss: Artifacts introduced by lossy re‑encoding (banding, blockiness, mushy detail). Fewer passes = fewer risks.

Once these clicked, the rest became pattern matching: choose the codec that balances compatibility + size, pick the implementation that’s fast enough, avoid unnecessary passes.

## 3. Hardware Inventory & Capabilities

| Hardware | Strength | Limitation |
|----------|----------|------------|
| NVIDIA RTX 3090 | Fast H.264 + HEVC (NVENC) batch work; low CPU usage | No AV1 encode (decode only) |
| Intel i9 iGPU (Quick Sync) | AV1 encode support; efficient for trickle jobs | Slower per file than 3090 for HEVC |
| CPU (software encoders) | Highest potential quality at slow presets | Too slow & power hungry for the backlog |

Strategy: Let the 3090 chew through obvious H.264 → HEVC conversions; park “high‑value” titles in a future AV1 queue for the iGPU (or upgraded hardware) once the easy storage wins are done.

## 4. Codec Trade-offs (Practical View)

- H.264 (AVC): Universally compatible baseline; least efficient of the modern trio. (See: [AVC](https://en.wikipedia.org/wiki/Advanced_Video_Coding))
- HEVC (H.265): ~25–50% bitrate reduction versus AVC at similar perceived quality; wide hardware decode; licensing baggage. ([HEVC](https://en.wikipedia.org/wiki/High_Efficiency_Video_Coding))
- AV1: Royalty‑free; strong compression efficiency; encode speed improving; hardware decode/encode adoption still ramping. ([AV1](https://en.wikipedia.org/wiki/AV1))
- AAC: Successor to MP3; better quality at the same bitrate; widely supported—simplifies mixed device playback. ([AAC](https://en.wikipedia.org/wiki/Advanced_Audio_Coding))

## 5. Licensing & Why Some Things Don’t Transcode

Plex may fall back or refuse certain transcodes when patent‑encumbered codecs or profiles appear and a valid path (hardware + software stack) isn’t present. AV1’s royalty‑free status makes it the *future‑proof* target for archival lanes. HEVC remains a pragmatic middle ground today given my 3090 throughput.

## 6. How I Actually Run It (Simplified)

I ended up ditching over‑engineering. I have *two* main working library lanes:

- HEVC Lane: Anything still bloated in H.264 or obviously wasteful → NVENC HEVC pass.
- AV1 Lane (tagged queue): High‑value / long‑term stuff I’ll slowly convert with Quick Sync (or future GPU) when idle.

Automation: Unmanic detects candidates and launches the right worker. Each worker is tagged (HEVC or AV1). I still eyeball edge cases to avoid silent junk.

Audio: Standardise to AAC unless there’s a *clear* reason to keep a lossless or multi‑track original (rare). Simplicity wins.

Quality Guardrails:

- CRF/quality‑targeted encodes, not rigid bitrates.
- Occasional metrics only if something looks off (no over‑instrumentation).
- One conversion per asset—avoid “transcode churn”.

That’s it. No sprawling pipeline graph—just staged queues and hardware matched to the job.

## 7. Notes on Tweaks

- Start small → validate → scale.
- Pair hardware decode with hardware encode—frees CPU.
- Maintain a tiny “needs review” pile to keep quality honest.

## 8. Storage Wins

After targeted HEVC conversions plus audio clean‑up I’ve reclaimed 500+ GB with no *visible* quality loss (living‑room subjective checks + a few spot VMAF/SSIM comparisons). Biggest wins: over‑provisioned H.264 TV episodes and redundant multi‑track audio.

## 9. HDR / Dolby Vision Confusion

Reality: Dolby Vision files with an HDR10 fallback *usually* behaved—but sometimes I’d get dim scenes or weird oversaturation. Hard to tell if it was the file, tone mapping, or the display with HDR disabled to save power. Dolby Vision uses dynamic per‑scene metadata; HDR10 is static. If the chain mishandles that, colors drift. (Refs: [Dolby Vision](https://en.wikipedia.org/wiki/Dolby_Vision), [HDR10](https://en.wikipedia.org/wiki/HDR10))

I’m not chasing cinematic color science perfection. I just want stuff to look normal everywhere. So the rule now:

- Prefer clean SDR or plain HDR10 sources.
- Avoid niche DV variants unless *all* primary devices benefit.
- If a file constantly causes color weirdness → replace/remux/re‑encode it into something boring and compatible.

Result: Less time squinting at gradients; more time actually watching.

## 10. Direct Play > Clever Transcoding

If Plex can just hand the file to the device unchanged, everybody’s happier. Less server load, less delay, fewer “why is it buffering?” pings. If someone’s watching on a 9‑year‑old bargain TV that can’t handle it—I’m not rebuilding the library for that edge. Upgrade the device.

## 11. Hardware Quirks

The 3090 is a gaming beast, but NVENC is still a single fixed block—so simultaneous encode throughput isn’t infinite. Meanwhile the iGPU happily churns a couple of AV1 jobs. Lesson: raw GPU size ≠ unlimited encode lanes.

Takeaways:

- Don’t assume “huge GPU = infinite transcodes”.
- Stagger HEVC jobs; park AV1 on the iGPU when I’m not using it.
- Balance matters more than theoretical peak charts.

## 12. Slow & Selective AV1 Adoption

Not rushing a full AV1 flip because:

- Time sink for marginal additional savings on already efficient HEVC.
- Tooling + hardware encode speed still improving.
- Library hygiene first; perfection later.

So: gradual, high‑value targets only. The rest waits.

## 13. Decision Matrix

| Source | Action Now | Future Action |
|--------|------------|---------------|
| High bitrate H.264 1080p | Transcode → HEVC | Maybe AV1 (archive tier) |
| Low bitrate H.264 TV rip | Leave (diminishing returns) | Skip |
| 4K HEVC high bitrate | Evaluate; maybe CRF re‑encode | Possible AV1 |
| Animated content | Queue HEVC (good gains) | High AV1 potential later |
| Niche / weird profile | Manual review | Normalize container |

## 14. Audio Rationalisation

- Convert scattered AC3/DTS to AAC where safe for broad compatibility + modest size savings.
- Keep original lossless only for genuinely premium titles (not everything needs archival audio).

## 15. Tooling Mentions

- Unraid: Flexible disk layout.
- Plex: Unified streaming & client intelligence.
- Unmanic: Automation glue + plugin ecosystem.
- ffmpeg: The workhorse under the hood.

## 16. Key Lessons

- Organise before mass convert.
- Split libraries by *intent*, not just genre.
- Use the hardware you already own before shopping upgrades.
- Track savings (or you’re guessing).
- Avoid transcoding HDR unless necessary.
- Stage AV1 adoption; no big‑bang rewrite.

## 17. What’s Next

1. Finish converting the obviously bloated H.264 backlog to HEVC.
2. Run a small AV1 pilot batch (favourites) and measure real gain vs time.
3. Script a lightweight report: space saved / day + direct play %.
4. Revisit broader AV1 rollout after backlog stabilises.

## 18. Outcome & Operating Principles

My focus evolved from “compress everything” to delivering a consistent, low‑friction viewing experience for anyone hitting the server—while silently reclaiming space. The practical pillars now:

1. Seamless playback first: maximise direct play across common TVs, tablets, phones.
2. Measured compression: change it only when objective bloat or no visible delta justifies the time.
3. Codec uniformity: converge on HEVC now; introduce AV1 gradually; standardise audio on AAC. ([HEVC](https://en.wikipedia.org/wiki/High_Efficiency_Video_Coding) / [AV1](https://en.wikipedia.org/wiki/AV1) / [AAC](https://en.wikipedia.org/wiki/Advanced_Audio_Coding))
4. Profile pragmatism: drop exotic HDR layers that add support headaches; clean HDR10 or SDR is fine. ([Dolby Vision](https://en.wikipedia.org/wiki/Dolby_Vision) / [HDR10](https://en.wikipedia.org/wiki/HDR10))
5. Quality rescue: fix the small set of clearly bad encodes once—don’t churn them repeatedly.
6. Storage efficiency: treat GB saved per hour as a guiding metric.

In short: optimise for direct play, normalise selectively, and let measured savings drive the next pass.

## References

- AV1 – <https://en.wikipedia.org/wiki/AV1>
- HEVC – <https://en.wikipedia.org/wiki/High_Efficiency_Video_Coding>
- AVC (H.264) – <https://en.wikipedia.org/wiki/Advanced_Video_Coding>
- Dolby Vision – <https://en.wikipedia.org/wiki/Dolby_Vision>
- HDR10 – <https://en.wikipedia.org/wiki/HDR10>
- AAC – <https://en.wikipedia.org/wiki/Advanced_Audio_Coding>
