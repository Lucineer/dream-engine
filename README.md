# dream-engine

You don't need to sit and watch AI load spinners.

This is a background content engine for the Cocapn Fleet. It schedules and runs high-latency generative tasks, like multi-character narrative, during configured off-peak hours.

---

## Why it exists

Most AI tools run expensive, long-generation work synchronously. This consumes your active time and uses compute during peak hours. This engine schedules that work for periods of low activity, typically overnight.

---

## How it's built

*   Runs on standard Cloudflare Workers with zero dependencies and no build step.
*   Fork-first: you own the entire runtime. There are no account tiers.
*   Budget guardrails are enforced at the protocol layer.
*   Operates unattended once configured.

---

## Live Reference

View example schedules and job structures at the live fleet instance:
[https://the-fleet.casey-digennaro.workers.dev](https://the-fleet.casey-digennaro.workers.dev)

---

## Quick Start

1.  **Fork** this repository.
2.  **Deploy** to Cloudflare Workers using `wrangler deploy`.
3.  **Configure** the `DreamSchedule` and `DreamTask` definitions in the source code for your goals and idle hours.

## Architecture

This is a structural protocol for the Cocapn Fleet. It defines how vessels perform background consolidation: scheduling non-urgent, high-latency work (like content generation or simulation) to execute during configured idle periods. It uses Cloudflare KV for job persistence and enforces daily token budgets.

## Key Features

*   **Scheduled Execution**: Queues work for specific time windows using UTC cron syntax.
*   **Configurable Personas**: Generates content through distinct, stateful narrative agents defined in code.
*   **Hard Daily Budgets**: Enforces a strict maximum token spend per day.
*   **Persistent Queue**: Job state survives Worker restarts with retry logic.
*   **Extensible Tasks**: Built-in types for wiki population and distillation. You define custom `DreamTask` types.
*   **Zero Dependencies**: Written in pure JavaScript.

## Current Limitation

The scheduler and task definitions require manual code modification. There is no administrative UI; configuration is managed through the source.

## Implement Your Workload

Edit the `DreamTask` type definitions and `DreamJob` execution logic to implement your specific background workloads. Configure the `DreamSchedule` with your idle window (e.g., `startTime: "23:00"`).

## Contributing

Issues and pull requests are welcome. Improvements to scheduling efficiency, error handling, or provider integrations are appreciated.

---

MIT License · Superinstance & Lucineer (DiGennaro et al.)

---

<div align="center">
  <a href="https://the-fleet.casey-digennaro.workers.dev">The Fleet</a> · <a href="https://cocapn.ai">Cocapn</a>
</div>