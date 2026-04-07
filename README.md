# Cocapn Fleet: Dream Engine

You schedule narrative generation to run while your computer is idle. This Worker processes a queue of tasks—like expanding wikis or writing scenes—during a configured overnight window. You wake up to finished text, not loading screens.

## Why This Exists
Long-form AI generation does not need your active attention, just compute time. Instead of managing live sessions, you can define work, set a schedule, and retrieve results later.

## Quick Start
1.  **Fork** this repository.
2.  Deploy to Cloudflare Workers: `wrangler deploy`.
3.  Edit `DreamSchedule` (for timing) and `DreamTask` (for narrative goals) in the source code.

## How It Works
You configure a daily schedule (e.g., 1 AM to 5 AM) and a queue of tasks. The Worker runs during that window, processing one task per session. State and the job queue persist between runs. Output is saved to your configured storage.

## Features
*   **Scheduled Batches**: Runs during your configured off-peak hours.
*   **Persistent State**: Character personas and narrative context persist across runs.
*   **Configurable Budgets**: Set daily token ceilings to manage API costs.
*   **Resilient Queue**: Job queue survives restarts; failed tasks are retried.
*   **Task Templates**: Includes types for wiki building, scene distillation, and arc progression.
*   **Zero Dependencies**: Pure JavaScript. No build step. No npm modules.
*   **Fork-First Model**: You control the code, API keys, and runtime.

## What Makes This Different
1.  It runs when *you* are idle, not as fast as possible.
2.  There is no live dashboard. Configure once, then check output later.
3.  No artificial queue limits. It will process tasks sequentially over multiple sessions.

## A Current Limitation
Each deployed Worker instance is tied to a single narrative project and configuration set. To manage multiple, separate projects, you need to deploy separate Worker instances.

## Live Reference
See example scheduled jobs and task structures at the live instance: [https://the-fleet.casey-digennaro.workers.dev](https://the-fleet.casey-digennaro.workers.dev)

## Contributing
Issues and pull requests are welcome. This project is open source under the MIT license.

<div style="text-align:center;padding:16px;color:#64748b;font-size:.8rem"><a href="https://the-fleet.casey-digennaro.workers.dev" style="color:#64748b">The Fleet</a> &middot; <a href="https://cocapn.ai" style="color:#64748b">Cocapn</a></div>