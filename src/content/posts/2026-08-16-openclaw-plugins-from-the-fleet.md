---
title: OpenClaw Plugins from the Home Fleet
lead: How we extracted five live Discord/homelab plugins from Unraid, published them, and why they only make sense as a system.
published: 2026-08-16
tags:
  - OpenClaw
  - Discord
  - Unraid
  - Plugins
  - AI
  - Voice
---

For a while the interesting OpenClaw work on this house lived only in a private Unraid repo: a Discord bot that sits in a voice channel all day, a local Whisper gate so ambient chat never hits a cloud STT meter, YouTube audio that ducks when the bot talks, a JSON-RPC bridge to Red-DiscordBot, and a thin tool that reads ThermoPro room sensors over BLE.

That is now a public repo — [pjmagee/openclaw-plugins](https://github.com/pjmagee/openclaw-plugins) — because the plugins were already running in production, and the useful part is not a hello-world SDK sample. It is how they fit together on a box that is also the NAS, the game host, and the thing that should not stream a public voice channel to the cloud because someone forgot a setting.

This post is about that system, not a rewrite of each README.

## Why extract them

OpenClaw plugins load inside the Gateway process. Ours started as files under `~/.openclaw/extensions/` on Tower, next to operator docs, 1Password readers, and an hourly patch guard. That is a terrible place to keep software you want other people to install: one `git pull` of the fleet repo is not a release, and a homelab checkout is full of things that must never ship.

So we cut five packages out, each with a manifest, a `configSchema`, and a tarball on GitHub Releases (`thermopro-v0.1.1`, `yt-media-v0.1.0`, and so on). Config stays in `openclaw.json` / env. The repo has no secrets, by design. Install is pinned to a release URL so an unrelated plugin bump cannot change the bytes you just downloaded.

They still run on the same Unraid host first. Public is a snapshot of what we operate, not a parallel codebase we hope is similar.

## The five pieces

| Plugin | What Chillbot actually uses it for |
|--------|-------------------------------------|
| **thermopro** | `thermopro_read` — office/bedroom temp, humidity, battery from TP3x BLE beacons |
| **redbot-control** | `redbot_*` tools, **only** when someone names Red. Ordinary “play this” must not go there |
| **yt-media** | Default music: real YouTube audio on the same Discord `AudioPlayer` as Grok TTS |
| **whisper-wake-gate** | The spec + tests for local name-gating. Not installed as its own plugin on Tower |
| **xai-realtime-voice** | The live voice stack: Grok Voice, local wake gate (same bytes as the module above), mic presence, working cue, music ducking |

`whisper-wake-gate` is the odd one. On the fleet it is **not** enabled as a standalone plugin. `xai-realtime-voice` vendors a copy of `wake-gate.ts` and CI fails if the two files diverge. The standalone package exists so the matching rules, fail-closed policy, and debug tools (`wake_gate_status` / `wake_gate_check`) have a home with a test suite. The voice plugin is what actually hears Discord.

## How a day on Tower looks

Chillbot is an always-on Discord account. Primary brain is Grok. Speech is xAI realtime voice (`sirius`). It sits muted in a voice channel and listens locally.

Ambient audio is buffered, cut into utterances, and sent to a **local** OpenAI-compatible Whisper endpoint. We run two on purpose:

- **npu-stt** on the Intel Arrow Lake NPU — cheap enough to listen all day (~6.7× lower power than CPU for this job).
- **speaches** on the 3090 — used for bulk transcription via a skill, not for the always-on gate.

If the transcript does not contain a wake name (and the alias table does not save a Whisper mis-hear like “killbot” for “chillbot”), the audio is dropped. Nothing goes to xAI. If we marked the gate required and that local backend is down, the bot goes **deaf**. Fail closed. A silent stream of a public VC to a cloud STT is not an acceptable fallback.

Say the name and the mic opens, the utterance is handed to Grok Voice (local transcript armed as a timer fallback so a missing cloud STT event cannot leave the bot mute-and-confused), a quiet “working” loop can play if the reply is slow, then the gate re-arms. Conversation mode (`name gate off`) exists for a session and **does not persist** across rejoin or restart. Forgotten open-mics should not last days.

Music is the same connection. `media_play` resolves YouTube with `yt-dlp`, ffmpeg emits Ogg/Opus (Discord-ready without a Node opus encoder), and the track shares **one** `AudioPlayer` with TTS. When the bot speaks, the track pauses and seeks back after about 1.2s of silence. Cookies for Premium/age-gated media come from 1Password through a refresh command — the jar is never in config or logs. After a successful play the agent is told not to speak a confirmation: that sentence would immediately duck the track it just started.

While a track is playing, `yt-media` sets `OPENCLAW_MUSIC_PLAYING`. The wake gate then requires the name again. Ambient “yeah play the next one” in a busy VC must not skip your queue. Those env vars (`OPENCLAW_MUSIC_PLAYING`, `OPENCLAW_VOICE_SELF_*`) are the cross-plugin bus. Plugins load as separate module trees; `process.env` is the contract that survives a reload.

Red is a second bot on the same Discord. Its official JSON-RPC has no auth and only listens on loopback inside Red’s container, so a `socat` sidecar republishes it on `172.17.0.1:6134` — the Docker bridge gateway, which does not change when containers recreate. The plugin’s `usageHint` is load-bearing: the model only touches `redbot_*` when a human says Red. Snowflakes stay strings end-to-end so JavaScript cannot round an 18-digit guild id.

Sensors are the simple end of the same pattern. `thermopro-ble` runs on the host network (BLE sockets do not see `hci*` from a normal container netns), publishes JSON on `:8102`, and the plugin is an HTTP client. “How warm is the office?” is a tool call, not a scrape.

Almost every companion address we use is `172.17.0.1`, not a container name or a DHCP’d container IP. The gateway container sees the host there. Recreates do not silently break the tools.

## Things we would do again

**No secrets in the plugin repo.** Config schema and env names, yes. Tokens, cookie jars, processing-loop audio we did not author — no. Tower still has a private cue file; the public package ships a recipe script instead.

**Fail closed on the wake gate.** Required + backend down = drop mic. We would rather a deaf bot than a leak.

**Compare mode before cutover.** When the Python gate was replaced with speaches, both ran on live audio with the old verdict authoritative and divergence logged. The counters are still in the module.

**Honest about patches.** Parts of the wake-gated Discord flow live in `@openclaw/discord`’s compiled dist. The voice package ships the same idempotent applier we run in production, plus a table of what each patch does. Without them you still get an xAI realtime provider; you lose name-gating, capture-during-playback, and the local audio hook. An hourly guard on Tower re-applies after image pulls. That is not elegant. It is documented.

**One AudioPlayer, tagged resources.** TTS, the working cue, and YouTube all share a player. Every `stop()` checks identity. Nothing force-stops audio it did not start. That rule is why ducking and “working” do not murder a track.

## What we did not publish

The fleet still has operator docs, 1Password readers, Discord account config, and the processing-loop opus. Those belong next to the machine. The plugins belong in a repo you can read in one sitting — which is the point of the SDK examples, too. `openclaw.plugin.json`, `registerTool`, text results, no mystery.

If you want the install commands and schemas, start at the [repo README](https://github.com/pjmagee/openclaw-plugins). If you want to know whether they work: they already do, on the same host that is serving this thought from a different pipeline.
