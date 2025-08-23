Title: My Home Server Setup
Lead: A deep dive into building a powerful home server for VMs, Docker, game servers, and local AI workflows—covering hardware choices, software, and lessons learned.
Published: 2025-08-23
Tags:
  - Docker
  - Unraid
  - Home Lab
  - AI
  - Kubernetes
  - Plex
  - ZFS
  - Networking
  - Game Servers
---

# My Home Server Setup

**Hardware, Configuration, and Lessons Learned**:

Welcome to my latest blog post where I dive into the details of my home server setup, a beast of a machine that powers everything from virtual machines (VMs) and Docker containers to game servers and local AI workflows. This setup is the culmination of careful hardware selection, strategic cost-saving purchases, software tinkering, and some hard-learned lessons. If you're a home lab enthusiast or just curious about building a powerful server, read on for the full breakdown.

## Hardware Breakdown

**CPU**: Intel Core i9-285K

The heart of my setup is the Intel Core i9-285K with its integrated GPU (iGPU) and QuickSync capabilities. This processor is a powerhouse for transcoding tasks, especially for media streaming via Plex. The Neural Processing Unit (NPU) caught my eye for potential AI workloads, but as of now, it feels like a gimmick due to limited Linux support. I'm keeping an eye on future developments, but for now, the iGPU handles light AI tasks admirably with Intel-IPEX-LLM-Ollama.

**Memory**: 98GB RAM

With 98GB of RAM, this server is built to handle multiple VMs, Docker containers, local large language models (LLMs), and game servers like ARK and Minecraft. The generous memory allocation ensures smooth multitasking, whether I'm running Kubernetes clusters for my home lab or hosting AI workflows with n8n and locally trained models with tool-calling capabilities.

**Cooling**: MSI MEG CORELIQUID S360 AIO & ARCTIC P14 Pro PST Fans

Cooling is handled by the MSI MEG CORELIQUID S360 AIO CPU Liquid Cooler, featuring a 2.4" IPS display, a 7th Gen Asetek pump, a VRM fan, and three Silent Gale P12 fans. The evaporation-proof tubing and compatibility with both AMD and Intel platforms make it a solid choice. However, a major annoyance is the lack of official MSI software for Linux to control the AIO's display. I worked around this by setting up a Windows VM with USB passthrough to configure the CPU screen, but the temperature readings are inaccurate (e.g., showing 0°C). Additionally, I use four ARCTIC P14 Pro PST fans for excellent airflow throughout the case.

**Case**: Phanteks Enthoo Pro 2 Server Big-Tower

The Phanteks Enthoo Pro 2 is a sleek, spacious tower with ample room for storage and GPU expansion. Its design is perfect for a server setup, offering flexibility for multiple drives and clean cable management. This case strikes a balance between aesthetics and functionality, making it a joy to work with.

**Motherboard**: MSI PRO Z890-P WIFI

The MSI PRO Z890-P WIFI motherboard supports Intel Core Ultra Processors (Series 2) with an LGA 1851 socket. It features a 55A DrMOS power stage, DDR5 memory boost up to 9200+ MT/s (OC), PCIe 5.0 and 4.0 slots, M.2 Gen5 support, Wi-Fi 7, and 5G LAN. It's a mid-range board that's not too expensive but capable of overclocking if needed, making it a great fit for my needs.

**Storage**: Crucial BX500 SATA SSDs & NVMe Drives

Storage is a critical component of my setup, and I managed to cut costs by snagging a great deal on eBay for opened-but-new 4TB Crucial BX500 SATA SSDs. Here's the breakdown:

**4x 4TB Crucial BX500 SATA SSDs**: These were sourced from eBay at a significant discount despite being brand new, just opened. They're configured in a ZFS RAIDZ1 pool for 1-drive failure protection, leveraging the four SATA ports on the Z890 motherboard. Each SSD offers up to 540MB/s read speeds, making them ideal for my needs.

**2x 4TB NVMe Gen4 Drives**: These serve as a high-speed cache layer for applications, significantly boosting performance for Docker containers and VMs. This setup, combined with UnraidOS, provides a robust and flexible storage solution for my home server.

**GPU**: NVIDIA RTX 3090

I scored another cost-saving win with a cheap NVIDIA RTX 3090 (24GB VRAM) from eBay. This GPU is a beast for running 8B+ parameter local AI models, handling computationally intensive tasks like model training and inference with ease. Buying it used but in excellent condition helped keep the budget in check while still delivering top-tier performance.

## Software and Use Cases

**Operating System**: UnraidOS

UnraidOS manages my non-array SSD/NVMe storage, providing a user-friendly interface for my home server. I initially tried using Unraid's array setting with a cache and parity drive for 1-drive failure protection, but this was a disaster for SSD performance. The array configuration throttled speeds to a measly 30MB/s and caused OS and networking issues with streaming, FTP, and other activities. After days of troubleshooting, I switched to an SSD pool with ZFS, which resolved the performance bottlenecks and restored smooth operation.

## Services and Workflows

**Media Streaming**: Plex runs flawlessly, leveraging the i9's QuickSync for efficient transcoding.

**Game Servers**: I'm currently running an ARK server in a Windows VM with 2 pinned CPUs and 4GB of RAM, which performs perfectly for 1-5 players. Additionally, I host Abiotic Factor and Minecraft servers via Docker containers. Thanks to <https://forums.unraid.net/topic/79530-support-ich777-gameserver-dockers/>

**Kubernetes (K8s)**: My home lab includes multi-node Kubernetes VMs for experimentation and learning.

**Networking**: I use Traefik and Cloudflare Tunnel for select services. To bypass my ISP's [CGNAT](https://en.wikipedia.org/wiki/Carrier-grade_NAT), I opted for a static IP (a small add-on to my internet package), allowing me to route traffic on different public ports while my router redirects to internal ports. This setup enables multiple game servers to run on their default internal ports without conflicts.

**AI Workflows**: I run local AI workflows using n8n with locally trained models that support tool calling. The i9's iGPU handles lighter workloads via Intel-IPEX-LLM-Ollama, while the RTX 3090 powers heavier tasks.

**Dagger Portable Workflows**: I use [Dagger](https://dagger.io) to run portable CI/CD workflows across my home lab. To set up the Dagger Engine on my server, I run:

```bash
dagger engine --addr tcp://0.0.0.0:1234
```

On my other client devices, I connect to the server by setting the environ    ment variable:

```bash
_EXPERIMENTAL_DAGGER_RUNNER_HOST="tcp://[SERVER_IP]:1234"
```

This allows me to run workflows remotely and leverage my server's hardware, including GPU devices for LLM tasks. Dagger natively supports GPU mounting, making it ideal for AI workflows and distributed builds. While official documentation is sparse on TCP setups, this method works reliably for internal networks.

## Challenges and Lessons Learned

Building this server wasn't without its hurdles. Here are the key challenges I faced and how I overcame them:

### Unraid Array Misstep

As mentioned, my first attempt at configuring Unraid's array with SSDs was a disaster. The cache and parity setup absolutely tanked SSD performance—speeds dropped to just 30MB/s, and the whole system became unstable, with streaming and network services constantly failing. After a lot of digging, I discovered an old Unraid patch note and a super helpful blog post ([SSD Parity vs HDD Parity vs SSD Array in Unraid](https://www.spxlabs.com/blog/2020/11/27/ssd-parity-vs-hdd-parity-vs-ssd-array-in-unraid)) that explained why SSDs struggle in traditional array configurations. The solution was to switch to an SSD pool with ZFS, which instantly restored performance and reliability. If you're building a similar setup, skip the array for SSDs and go straight to ZFS pools—you'll save yourself days of frustration.

### Networking and CGNAT

Being behind my ISP's CGNAT posed significant challenges for external access to my services. Cloudflare Tunnel helped for some services, but for others (like game servers), tunneling wasn't ideal. I contacted my ISP and paid a small fee for a static IP, which eliminated CGNAT issues and simplified my networking setup.

### Cooling Clearance Issues

Despite using PCPartPicker to verify compatibility, the ARCTIC Liquid Freezer III Pro 420 did not fit in my Phanteks Enthoo Pro 2 case. This was a frustrating oversight, as PCPartPicker's compatibility checker failed me. I ended up sticking with the MSI MEG CORELIQUID S360, but this experience taught me not to blindly trust compatibility tools. Always double-check physical dimensions and clearances!

## Final Thoughts

This server is a dream setup for my home lab, media streaming, gaming, and AI experimentation. By scoring deals on opened-but-new Crucial BX500 SSDs and a used RTX 3090 from eBay, I kept costs down without sacrificing performance. The combination of powerful hardware, flexible software, and a few hard-learned lessons has resulted in a robust and versatile system. If you're planning a similar build, my biggest advice is to thoroughly research storage configurations (especially with Unraid and SSDs), verify hardware compatibility manually, and be prepared to tackle networking challenges if you're behind CGNAT.

Feel free to share your own home server experiences or ask questions in the comments below. Happy building!
