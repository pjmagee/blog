---
title: Putting the Intel NPU to Work on Unraid
lead: Always-on Whisper for a Discord wake gate on Arrow Lake’s NPU, and a dashboard tile because Unraid’s GPU panel cannot see the device at all.
published: 2026-08-16
tags:
  - Unraid
  - NPU
  - OpenVINO
  - Whisper
  - OpenClaw
  - Voice
---

The Core Ultra 9 285K in Tower has an NPU. For months it did nothing useful. Ollama and llama.cpp have no NPU backend. Unraid’s stock GPU tile reads `intel_gpu_top`, which only sees DRM graphics devices. An Intel NPU is a separate PCI function in the kernel `accel` class (`/dev/accel/accel0`). The silicon looked idle because nothing was looking at it, and nothing popular would run on it.

Always-on speech-to-text turned out to be the job it is actually good at. That work now lives in two public pieces under [pjmagee/unraid-apps](https://github.com/pjmagee/unraid-apps):

- [`npu-stt`](https://github.com/pjmagee/unraid-apps/tree/main/containers/npu-stt) — OpenAI-compatible Whisper on the NPU via OpenVINO GenAI
- [`npustat`](https://github.com/pjmagee/unraid-apps/tree/main/plugins/npustat) — an Unraid dashboard tile that reads the driver’s sysfs

This is how they get used on the fleet, not a second README.

## Two STT servers on purpose

Chillbot sits muted in Discord voice channels all day and only consults when someone says its name. That gate has to transcribe *every* utterance locally, including the ones we throw away. A 3090 can do that easily. It should not have to.

So Tower runs both:

| Service | Port | Hardware | Role |
|---------|------|----------|------|
| **npu-stt** | `:8101` | Arrow Lake NPU | Always-on wake gate |
| **speaches** | `:8100` | RTX 3090 | Bulk transcription (`local-stt` skill) |

The voice stack points the gate at the NPU:

```text
OPENCLAW_WHISPER_WAKE_ENABLED=1
OPENCLAW_SPEACHES_URL=http://172.17.0.1:8101
```

`npu-stt` speaks the same `POST /v1/audio/transcriptions` contract as speaches, so the OpenClaw wake-gate module does not care which box answered. The model id in env is ignored by npu-stt — it has its own baked OpenVINO IR (`distil-whisper-large-v3-int8`). Matching the wake name, aliases, and fail-closed policy still live in the plugin, not in the STT server. The server only transcribes.

When someone actually wakes the bot, the *command* goes to xAI’s STT (better ears). The NPU’s transcript is kept as a timed fallback so a missing cloud event cannot leave the bot mute-and-confused. Between wakes, the 3090 is free for other work.

## Why the NPU, if it is not faster

It is not faster. RAPL package-0, 9.5 s clip, same model, same machine:

| | Speed | Power over idle | Energy per clip |
|--|-------|-----------------|-----------------|
| **NPU** | 1420 ms (6.7× realtime) | **+11.3 W** | ~16 J |
| **CPU** | 1413 ms (6.7× realtime) | +114 W | ~161 J |

Same words, same wall time, a tenth of the energy. A GPU faster-whisper pass is quicker still (~0.2–0.4 s). For a box that listens *all day*, the interesting number is watts, not milliseconds. The NPU is also the right size of silicon: `DEVICE_ARCHITECTURE = 3720`, Meteor-Lake-class, roughly 11–13 TOPS. It is not the 48-TOPS part in newer laptops, and it is not for LLMs. Keep Ollama on the 3090.

Latency is also almost constant. Whisper pads to a 30 s window, so a 2 s “Chillbot” and a 9 s sentence both cost ~1.5 s. That is acceptable for a wake check. It would be the wrong backend if you were captioning a film.

One behavioural difference is load-bearing and easy to miss: OpenVINO GenAI does **not** report per-segment `no_speech_prob`. faster-whisper does. Any hallucination filter that needed that field becomes a no-op against npu-stt. On Chillbot, wake-name matching carries the load alone. If ambient noise starts waking the bot, that is why — revert the gate URL to speaches on `:8100` and the filter works again.

## The evening you will otherwise lose

The image is `ghcr.io/pjmagee/npu-stt`, pinned to a sha on Tower so an unrelated `compose up` in the AI stack cannot silently swap the STT engine. It needs `/dev/accel/accel0`, Unraid 7.3’s `intel_vpu` driver, and firmware on disk. No privileged mode.

None of that is enough if you omit:

```text
ZE_ENABLE_ALT_DRIVERS=/usr/lib/x86_64-linux-gnu/libze_intel_npu.so.1
```

The level-zero loader does not auto-discover the NPU driver. Without that env, `openvino.Core().available_devices` returns `['CPU']` — kernel bound, firmware present, device node passed through, Intel debs installed, NPU plugin sitting on disk. Everything looks correct. Nothing uses the NPU. There is no error to search for.

With it: `['CPU', 'NPU'] → Intel(R) AI Boost`. The image bakes the variable in. The compose file still sets it explicitly so a future image cannot drop it quietly.

First start downloads ~1.5 GB and compiles for the NPU (~70 s). Later starts still recompile; there is no persistent NPU kernel cache here. Healthcheck start period is 180 s for that reason. Read RAPL from the **host** if you want to reproduce the power table — `/sys/class/powercap` inside the container is a dead end even as root.

## Seeing it on the Unraid dashboard

Once the container is actually using the device, you still cannot see that in the stock UI. `gpustat` will never grow an NPU row: it is looking at the wrong subsystem.

`npustat` is a small Unraid plugin: a PHP endpoint and about twenty lines of JavaScript. No extra daemon. It reads:

| sysfs | Tile |
|-------|------|
| `npu_busy_time_us` | Load — busy delta over wall-clock delta between polls |
| `npu_current_frequency_mhz` | Frequency (0 MHz while runtime-suspended is normal) |
| `npu_memory_utilization` | Allocated memory — a resident model shows here even at 0% load |

Install from **Plugins → Install Plugin**:

```text
https://github.com/pjmagee/unraid-apps/releases/latest/download/npustat.plg
```

If the tile is missing, Dashboard → Content Manager (the eye). On a box with no `intel_vpu` device the tile hides itself instead of showing fake zeroes.

Unraid runs from RAM, so `/usr/local/emhttp` is gone after reboot. Persistence is the `.plg` on flash re-extracting its payload tarball every boot. The payload URL is pinned to the version in that `.plg`, not `/latest/`, so an install always gets the tarball it was published with. `/latest/` is only the plugin’s self-update pointer.

The first poll after boot reports 0% load. The previous sample lives in tmpfs. That is intentional.

I use the tile as a sanity check that the wake gate is really on the NPU: a resident model in the memory row, and the load bar ticks when someone talks in the VC even if the name did not match. If load is flat while Chillbot is “listening”, the container has fallen back to CPU or is not receiving audio.

## What I would not do

I would not put LLM inference on this NPU. I would not make npu-stt the only STT on the box — speaches on the 3090 is still the right tool when you want a file transcribed quickly and you *do* want `no_speech_prob`. I would not publish the image as `:latest` in production compose. And I would not assume Unraid’s GPU panel will ever cover this device; the kernel split is the reason the plugin exists.

Containers, templates, and the `.plg` are all in [unraid-apps](https://github.com/pjmagee/unraid-apps). The OpenClaw side of the gate is in the [previous post](/posts/2026-08-16-openclaw-plugins-from-the-fleet).
