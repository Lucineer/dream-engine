# dream-engine 🌙

You don't need your compute sitting idle while you sleep.

A background content engine that generates narrative during off-peak hours. Runs on the Cocapn Fleet.

---

## Why this exists
Agent runtimes often maintain constant readiness, consuming resources even during inactivity. This service schedules and executes slower, non-urgent tasks—like content generation and data processing—during designated idle periods, typically overnight.

## Live reference
View a running instance in the Fleet:  
https://the-fleet.casey-digennaro.workers.dev

## What makes this different
*   **Cost-effective**: Designed to operate within Cloudflare's free tier for most use cases.
*   **Self-contained**: No external queues or databases required; runs in a single Worker.
*   **Non-intrusive**: Executes work during configured downtime; results are available later.
*   **Fork-first**: You run your own copy and control all modifications and data.

---

## Quick Start
1.  Fork and clone the repository.
2.  Log in and deploy to Cloudflare Workers using Wrangler.
3.  Configure the schedule and tasks in the source code to match your idle hours.

## Architecture
A time-scheduled job runner for high-latency AI tasks. It uses Cloudflare's KV for persistent job storage and enforces daily token budgets. This is not designed for real-time interaction.

## Key Features
*   **Configurable scheduling**: Queue work for specific time windows.
*   **Narrative personas**: Generate content through distinct character voices.
*   **Token budget enforcement**: Hard daily limit to control spending.
*   **Persistent job queue**: Survives Worker restarts with retry logic.
*   **Extensible task system**: Supports wiki updates, memory processing, and simulation tasks.
*   **Zero runtime dependencies**: Uses standard JavaScript on Cloudflare Workers.

## One limitation
This requires a Cloudflare account and uses its ecosystem (Workers, KV). You cannot run it on other platforms without modification.

## Customization
Edit the `DreamTask` and `DreamSchedule` definitions to implement your specific background workloads, timezone, and generation goals.

## Contributing
Issues and pull requests are welcome. This is a core Fleet service; improvements to scheduling, error handling, or model integrations are appreciated.

---

MIT · Superinstance & Lucineer (DiGennaro et al.)

---

<div align="center">
  <a href="https://the-fleet.casey-digennaro.workers.dev">The Fleet</a> · <a href="https://cocapn.ai">Cocapn</a>
</div>