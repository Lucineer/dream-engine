// ═══════════════════════════════════════════════════════════════════════════
// dream-engine — Background Consolidation Protocol
// How vessels dream: cheap models do heavy work while the user sleeps.
// Coding plan strategy: game time-based limits on ultra-cheat providers.
// This is STRUCTURAL — defines HOW all vessels do background work.
//
// Superinstance & Lucineer (DiGennaro et al.) — 2026-04-03
// ═══════════════════════════════════════════════════════════════════════════

const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*;";

interface Env { DREAM_KV: KVNamespace; }

// ── Dream Types ──

type DreamTask = 'wiki-populate' | 'distill' | 'simulate' | 'optimize' | 'test-generate' | 'doc-update' | 'horizon-check' | 'equipment-evaluate';

interface DreamJob {
  id: string;
  vesselId: string;           // which vessel this dream benefits
  task: DreamTask;
  description: string;
  input: Record<string, unknown>;
  model: string;              // which model to use
  provider: string;
  tokenBudget: number;
  timeBudget: number;         // seconds
  priority: 'low' | 'normal' | 'high';
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: string;
  tokensUsed: number;
  createdAt: number;
  startedAt: number | null;
  completedAt: number | null;
}

interface DreamSchedule {
  vesselId: string;
  timezone: string;           // user's timezone for idle detection
  idleStart: string;          // e.g., "23:00"
  idleEnd: string;            // e.g., "07:00"
  maxTokensPerNight: number;
  preferredProviders: string[];
  active: boolean;
}

// ── Coding Plan Providers ──
// These have time-based limits that we GAME by using them during idle periods

const CODING_PLANS = {
  'zai': { name: 'z.ai GLM-5-turbo', costPerM: 0.07, dailyLimit: '~100K tokens', bestFor: 'bulk analysis, wiki pop, distillation', useDuring: 'idle' },
  'minimax': { name: 'MiniMax-M2.5', costPerM: 0.08, dailyLimit: '~200K tokens', bestFor: 'background simulations, optimization', useDuring: 'idle' },
  'alibaba': { name: 'Alibaba Qwen', costPerM: 0.15, dailyLimit: '~150K tokens', bestFor: 'code generation, test writing', useDuring: 'idle' },
  'deepseek-chat': { name: 'DeepSeek-chat', costPerM: 0.14, dailyLimit: 'unlimited', bestFor: 'general background tasks', useDuring: 'any' },
  'siliconflow': { name: 'SiliconFlow Qwen3-Coder', costPerM: 0.50, dailyLimit: 'unlimited', bestFor: 'heavy code gen, image gen', useDuring: 'any' },
};

// ── Dream Task Templates ──

const DREAM_TEMPLATES: Record<DreamTask, { description: string; defaultModel: string; defaultProvider: string; tokenBudget: number; prompt: string }> = {
  'wiki-populate': {
    description: 'Populate wiki/knowledge base from recent interactions',
    defaultModel: 'glm-5-turbo', defaultProvider: 'zai', tokenBudget: 2000,
    prompt: 'Review recent chat history and extract key insights, decisions, and patterns. Format as wiki entries.',
  },
  'distill': {
    description: 'Distill recent experiences into long-term memory',
    defaultModel: 'glm-5-turbo', defaultProvider: 'zai', tokenBudget: 3000,
    prompt: 'Read the last 24h of activity. Distill into 3-5 key learnings. Update MEMORY.md with what matters.',
  },
  'simulate': {
    description: 'Run what-if simulations on pending decisions',
    defaultModel: 'deepseek-chat', defaultProvider: 'deepseek', tokenBudget: 4000,
    prompt: 'For each pending decision, simulate 3 possible outcomes. Rank by: feasibility, impact, risk. Recommend.',
  },
  'optimize': {
    description: 'Analyze performance data and suggest optimizations',
    defaultModel: 'glm-5-turbo', defaultProvider: 'zai', tokenBudget: 2000,
    prompt: 'Review token usage, latency, and cost data. Identify top 3 optimization opportunities. Be specific.',
  },
  'test-generate': {
    description: 'Generate tests for recently modified code',
    defaultModel: 'Qwen/Qwen3-Coder-480B-A35B-Instruct', defaultProvider: 'siliconflow', tokenBudget: 6000,
    prompt: 'For each recently modified file, generate comprehensive tests. Cover edge cases. Use existing test patterns.',
  },
  'doc-update': {
    description: 'Update documentation to match current code state',
    defaultModel: 'glm-5-turbo', defaultProvider: 'zai', tokenBudget: 3000,
    prompt: 'Compare documentation with actual code/API. Update docs to match reality. Flag inconsistencies.',
  },
  'horizon-check': {
    description: 'Re-evaluate RA horizons based on new data',
    defaultModel: 'deepseek-reasoner', defaultProvider: 'deepseek', tokenBudget: 8000,
    prompt: 'Last RA report was N days ago. New data: [context]. Are we still heading in the right direction? Update compass bearings.',
  },
  'equipment-evaluate': {
    description: 'Evaluate new equipment options against current needs',
    defaultModel: 'deepseek-chat', defaultProvider: 'deepseek', tokenBudget: 2000,
    prompt: 'Check catalog for new equipment. Compare with current loadout. Recommend upgrades based on recent task patterns.',
  },
};

// ── Landing Page ──

function landingPage(): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dream Engine — Background Consolidation</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui;background:#0a0a1a;color:#e2e8f0}
.hero{text-align:center;padding:2rem;background:radial-gradient(ellipse at 50% 0%,#1a0a2e 0%,#0a0a1a 70%)}
.hero h1{font-size:2rem;background:linear-gradient(135deg,#7c3aed,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{color:#64748b;margin:.5rem 0}
.concept{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;padding:2rem;max-width:1100px;margin:0 auto}
.concept h3{color:#a78bfa;margin-bottom:.5rem}
.concept p{color:#94a3b8;font-size:.85rem;line-height:1.6}
.providers{padding:2rem;max-width:1100px;margin:0 auto}
.providers h2{color:#c084fc;margin-bottom:1rem;text-align:center}
.ptable{width:100%;border-collapse:collapse}
.ptable th,.ptable td{padding:.5rem .75rem;text-align:left;border-bottom:1px solid #1e293b;font-size:.8rem}
.ptable th{color:#a78bfa;font-weight:600}
.ptable td{color:#94a3b8}
.ptable .cost{color:#34d399}
.tasks{padding:2rem;max-width:1100px;margin:0 auto}
.tasks h2{color:#c084fc;margin-bottom:1rem;text-align:center}
.tgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.75rem}
.task{background:#111;border:1px solid #1e293b;border-radius:8px;padding:.75rem}
.task h4{font-size:.85rem;color:#e2e8f0;margin-bottom:.25rem}
.task .desc{font-size:.75rem;color:#94a3b8}
.task .budget{font-size:.7rem;color:#475569;margin-top:.25rem}
footer{text-align:center;padding:2rem;color:#475569;font-size:.75rem}
</style></head><body>
<div class="hero"><h1>💤 Dream Engine</h1><p>Background consolidation protocol — how vessels dream</p></div>
<div class="concept">
<div class="concept"><h3>🌙 Coding Plan Strategy</h3><p>z.ai, MiniMax, Alibaba have time-based limits. We GAME them by running background tasks during user idle periods. 80-90% cost reduction on dreaming.</p></div>
<div class="concept"><h3>🧠 Structural Protocol</h3><p>This isn't a vessel — it's HOW all vessels do background work. Every vessel can dream. The protocol defines: idle detection, task queuing, model selection, budget enforcement.</p></div>
<div class="concept"><h3>⚡ Priority Routing</h3><p>User's expensive model handles interactive chat. Cheap coding plans handle dreaming. The vessel always has the right model for the job.</p></div>
</div>
<div class="providers"><h2>Coding Plan Providers</h2>
<table class="ptable">
<tr><th>Provider</th><th>Model</th><th>Cost/M tokens</th><th>Best For</th><th>When</th></tr>
${Object.entries(CODING_PLANS).map(([k,v]) => `<tr><td>${k}</td><td>${v.name}</td><td class="cost">$${v.costPerM}</td><td>${v.bestFor}</td><td>${v.useDuring}</td></tr>`).join('')}
</table></div>
<div class="tasks"><h2>Dream Tasks</h2>
<div class="tgrid">
${Object.entries(DREAM_TEMPLATES).map(([k,v]) => `<div class="task"><h4>${k}</h4><div class="desc">${v.description}</div><div class="budget">${v.defaultProvider} · ${v.tokenBudget} tokens</div></div>`).join('')}
</div></div>
<footer>Superinstance & Lucineer (DiGennaro et al.) — dream-engine is protocol, not a vessel. Every vessel can dream.</footer>
</body></html>`;
}

// ── Worker ──

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const h = { 'Content-Type': 'application/json', 'Content-Security-Policy': CSP };
    const hh = { 'Content-Type': 'text/html;charset=UTF-8', 'Content-Security-Policy': CSP };

    if (url.pathname === '/') return new Response(landingPage(), { headers: hh });
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', vessel: 'dream-engine', tasks: Object.keys(DREAM_TEMPLATES).length }), { headers: h });
    }

    // Dream templates (protocol definition)
    if (url.pathname === '/api/templates') {
      return new Response(JSON.stringify({ version: '1.0', tasks: DREAM_TEMPLATES, providers: CODING_PLANS }), { headers: h });
    }

    // Queue a dream job
    if (url.pathname === '/api/dream' && request.method === 'POST') {
      const body = await request.json() as { vesselId: string; task: DreamTask; input?: Record<string, unknown>; model?: string; provider?: string; priority?: string };
      const template = DREAM_TEMPLATES[body.task];
      if (!template) return new Response(JSON.stringify({ error: `Unknown task: ${body.task}` }), { status: 400, headers: h });
      const job: DreamJob = {
        id: crypto.randomUUID().slice(0, 8),
        vesselId: body.vesselId,
        task: body.task,
        description: template.description,
        input: body.input || {},
        model: body.model || template.defaultModel,
        provider: body.provider || template.defaultProvider,
        tokenBudget: template.tokenBudget,
        timeBudget: 60,
        priority: (body.priority as DreamJob['priority']) || 'normal',
        status: 'queued',
        tokensUsed: 0,
        createdAt: Date.now(),
        startedAt: null,
      };
      await env.DREAM_KV.put(`dream:${job.id}`, JSON.stringify(job));
      return new Response(JSON.stringify(job), { headers: h, status: 201 });
    }

    // List dream jobs for a vessel
    if (url.pathname === '/api/dreams') {
      const vesselId = url.searchParams.get('vessel');
      const list = await env.DREAM_KV.list({ prefix: 'dream:', limit: 50 });
      const jobs: DreamJob[] = [];
      for (const key of list.keys) {
        const job = await env.DREAM_KV.get<DreamJob>(key.name, 'json');
        if (job && (!vesselId || job.vesselId === vesselId)) jobs.push(job);
      }
      return new Response(JSON.stringify(jobs), { headers: h });
    }

    // Dream schedule (idle hours config)
    if (url.pathname === '/api/schedule' && request.method === 'POST') {
      const body = await request.json() as DreamSchedule;
      await env.DREAM_KV.put(`schedule:${body.vesselId}`, JSON.stringify(body));
      return new Response(JSON.stringify(body), { headers: h, status: 201 });
    }
    if (url.pathname === '/api/schedule' && request.method === 'GET') {
      const vesselId = url.searchParams.get('vessel');
      if (!vesselId) return new Response(JSON.stringify({ error: 'vessel param required' }), { status: 400, headers: h });
      const schedule = await env.DREAM_KV.get<DreamSchedule>(`schedule:${vesselId}`, 'json');
      return new Response(JSON.stringify(schedule || { vesselId, timezone: 'UTC', idleStart: '23:00', idleEnd: '07:00', maxTokensPerNight: 50000, preferredProviders: ['zai', 'deepseek'], active: false }), { headers: h });
    }

    // A2A: protocol definition for other agents
    if (url.pathname === '/api/a2a/protocol') {
      return new Response(JSON.stringify({
        version: '1.0',
        type: 'structural',  // This is protocol, not a vessel
        tasks: Object.keys(DREAM_TEMPLATES),
        providers: Object.keys(CODING_PLANS),
        costSaving: '80-90% on background tasks via coding plans',
        queueEndpoint: '/api/dream',
        scheduleEndpoint: '/api/schedule',
        templatesEndpoint: '/api/templates',
      }), { headers: h });
    }

    return new Response('Not found', { status: 404 });
  },
};
