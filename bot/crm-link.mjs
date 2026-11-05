// Связь с crm.nurtech.dev для проектов не из шаблона (Express, чистый Node, Telegraf). Без зависимостей, Node 18+.
// Тот же договор, что `server/src/crm-link` шаблона (docs/project-link.md в nurtech-crm):
//   проект → CRM: POST /api/link/events { kind: boot | alert | feedback | metric, data }
//   CRM → проект: GET /api/crm/status с Bearer <ключ>, раз в 5 минут
//   проект ← CRM: GET /api/link/team — команда проекта (по желанию)
// Без ключа (CRM_LINK_TOKEN) всё молчит; сбой CRM никогда не ломает проект.
//
//   import { createCrmLink } from './crm-link.mjs';
//   const crm = createCrmLink({ app: 'Azkar', revision: process.env.REVISION, users: async () => ({ total, active7d }) });
//   app.get('/api/crm/status', crm.statusHandler);          // Express; для http.createServer — crm.handle(req, res)
//   crm.boot();                                             // после запуска
//   process.on('unhandledRejection', (e) => crm.alert(e, { where: 'unhandledRejection' }));
//   app.use((err, req, res, next) => { crm.alert(err, { where: `${req.method} ${req.path}` }); next(err); });
import { timingSafeEqual } from 'node:crypto';

export const CRM_URL = 'https://crm.nurtech.dev';
const MAX_BYTES = 64 * 1024;
const WINDOW_MS = 10 * 60 * 1000;
const KINDS = new Set(['boot', 'alert', 'feedback', 'metric']);

export function sameToken(given, want) {
  const a = Buffer.from(String(given || '')), b = Buffer.from(String(want || ''));
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}

// Ключ склейки ошибок: место + первая строка без чисел (id, суммы, время).
export function alertKey(error, where = '') {
  const msg = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return `${String(where).replace(/\/\d+(?=\/|$)/g, '/:id')}|${msg.split('\n')[0].replace(/\d+/g, '#').slice(0, 200)}`;
}

export function createCrmLink(opts = {}) {
  const token = opts.token ?? process.env.CRM_LINK_TOKEN ?? '';
  const fetchImpl = opts.fetch ?? globalThis.fetch;
  const log = opts.log ?? ((m) => console.warn(`[crm-link] ${m}`));
  const startedAt = new Date();
  const queue = [];
  const seen = new Map();
  const errors = [];
  let timer = null;
  const enabled = /^ntl_[0-9a-f]{64}$/.test(token);
  if (token && !enabled) log('CRM_LINK_TOKEN не похож на ключ ntl_… — связь выключена');

  async function request(method, path, body) {
    const r = await fetchImpl(CRM_URL + path, {
      method, redirect: 'error', signal: AbortSignal.timeout(10000),
      headers: { authorization: `Bearer ${token}`, accept: 'application/json', ...(body ? { 'content-type': 'application/json' } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await r.text();
    if (text.length > MAX_BYTES) throw new Error('ответ CRM больше 64 КБ');
    if (!r.ok) throw new Error(`CRM ${r.status}: ${text.slice(0, 200)}`);
    return text ? JSON.parse(text) : null;
  }

  function schedule(tries) {
    timer = setTimeout(flush, Math.min(30000 * 2 ** (tries - 1), 600000));
    timer.unref?.();
  }

  async function flush() {
    timer = null;
    while (queue.length) {
      const item = queue[0];
      try { await request('POST', '/api/link/events', { kind: item.kind, data: item.data }); queue.shift(); }
      catch { item.tries++; schedule(item.tries); return; }
    }
  }

  // true — CRM приняла. Не дошло — в очередь с повтором (до 50; ошибки сервера не копим — они устаревают).
  async function send(kind, data = {}) {
    if (!enabled || !KINDS.has(kind)) return false;
    try { await request('POST', '/api/link/events', { kind, data }); return true; }
    catch (e) {
      log(`событие ${kind} не дошло: ${e?.message || e}`);
      if (kind !== 'alert') { queue.push({ kind, data, tries: 1 }); if (queue.length > 50) queue.shift(); if (!timer) schedule(1); }
      return false;
    }
  }

  // Ошибка сервера → CRM (бот CRM пишет в чат разработки). Повторы за 10 минут склеиваются. Никогда не бросает.
  async function alert(error, ctx = {}, now = Date.now()) {
    try {
      errors.push(now);
      while (errors.length && now - errors[0] > 86400000) errors.shift();
      const key = alertKey(error, ctx.where);
      const prev = seen.get(key);
      if (prev && prev.until > now) { prev.repeats++; return false; }
      seen.set(key, { until: now + WINDOW_MS, repeats: 0 });
      if (seen.size > 500) seen.delete(seen.keys().next().value);
      const e = error instanceof Error ? error : new Error(String(error));
      return await send('alert', {
        where: ctx.where, name: e.name, message: e.message, stack: (e.stack || '').split('\n').slice(1, 4).map((l) => l.trim()).join('\n'),
        requestId: ctx.requestId, userId: ctx.userId, revision: opts.revision, repeats: prev?.repeats ?? 0,
      });
    } catch { return false; }
  }

  async function status() {
    let db = true, users = { total: null, active7d: null }, staleJobs = [];
    try { if (opts.db) db = (await opts.db()) !== false; } catch { db = false; }
    try { if (opts.users) users = { total: null, active7d: null, ...(await opts.users()) }; } catch { /* без цифр */ }
    try { if (opts.staleJobs) staleJobs = await opts.staleJobs(); } catch { /* без задач */ }
    return {
      schemaVersion: 1, app: opts.app ?? null, revision: opts.revision ?? process.env.REVISION ?? null, startedAt: startedAt.toISOString(),
      db, users, errors24h: errors.filter((t) => Date.now() - t < 86400000).length, staleJobs, pendingEvents: queue.length,
    };
  }

  // GET /api/crm/status: без ключа связи — 404 (ручки как будто нет), чужой ключ — 401.
  async function handle(req, res) {
    const send404 = (code, body) => { res.statusCode = code; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(body)); };
    if (!enabled) return send404(404, { statusCode: 404 });
    const auth = String(req.headers?.authorization || '').replace(/^Bearer\s+/i, '');
    if (!sameToken(auth, token)) return send404(401, { statusCode: 401, message: 'Ключ связи не подходит' });
    return send404(200, await status());
  }

  return {
    enabled, startedAt, send, alert, status, handle, request,
    statusHandler: (req, res) => { void handle(req, res); },
    boot: () => send('boot', { revision: opts.revision ?? process.env.REVISION ?? null, startedAt: startedAt.toISOString(), app: opts.app ?? null }),
    feedback: (text, extra = {}) => send('feedback', { text, ...extra }),
    team: () => request('GET', '/api/link/team'),
    pending: () => queue.length,
    flush,
    stop: () => { if (timer) clearTimeout(timer); },
  };
}
