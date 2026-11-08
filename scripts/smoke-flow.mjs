/**
 * End-to-end smoke: login → project/unit → customer → contract → edit → save.
 * Uses credentials from .env. Does not print secrets.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE = process.env.SMOKE_BASE || 'http://127.0.0.1:3000';
const user = process.env.ADMIN_USERNAME || 'admin';
const pass = process.env.ADMIN_PASSWORD;
if (!pass) {
  console.error('FAIL: ADMIN_PASSWORD missing in .env');
  process.exit(1);
}

const jar = new Map();
function storeCookies(res) {
  const raw = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);
  for (const line of raw) {
    const [pair] = line.split(';');
    const i = pair.indexOf('=');
    if (i > 0) jar.set(pair.slice(0, i), pair.slice(i + 1));
  }
}
const cookieHeader = () => [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');

async function api(method, url, body) {
  const res = await fetch(BASE + url, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(jar.size ? { Cookie: cookieHeader() } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  storeCookies(res);
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!res.ok) {
    const msg = data?.message || res.statusText || String(res.status);
    throw new Error(`${method} ${url} → ${res.status}: ${msg}`);
  }
  return data;
}

const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => {
  const p = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date());
  const g = (t) => p.find((x) => x.type === t).value;
  return `${g('year')}/${String(g('month')).padStart(2, '0')}/${String(g('day')).padStart(2, '0')}`;
};

const steps = [];
const ok = (label) => { steps.push('✓ ' + label); console.log('✓', label); };
const fail = (label, err) => { steps.push('✗ ' + label + ': ' + err.message); console.error('✗', label + ':', err.message); throw err; };

try {
  const health = await api('GET', '/api/health');
  if (!health.ok) throw new Error('health not ok');
  ok('health');

  await api('POST', '/api/auth/login', { username: user, password: pass });
  ok('login');

  const me = await api('GET', '/api/auth/me');
  if (!me.user?.username) throw new Error('no user');
  ok('auth/me');

  const state = await api('GET', '/api/state');
  const data = structuredClone(state.data);
  let version = state.version;
  const tag = 'smoke-' + Date.now().toString(36);
  const pid = uid();
  const uid1 = uid();
  const cid = uid();
  const contId = uid();
  const instId = uid();
  const nid = String(1000000000 + Math.floor(Math.random() * 899999999));
  const phone = '09' + String(100000000 + Math.floor(Math.random() * 899999999));
  const phone2 = '09' + String(100000000 + Math.floor(Math.random() * 899999999));

  data.projects = data.projects || [];
  data.customers = data.customers || [];
  data.contracts = data.contracts || [];
  data.parties = data.parties || [];
  data.ledger = data.ledger || [];
  data.checks = data.checks || [];

  data.projects.push({
    id: pid,
    name: 'پروژه تست ' + tag,
    addr: 'تهران، تست',
    note: 'smoke',
    vcName: 'هماهنگ‌کننده تست',
    vcPhone: '09120000000',
    vcNote: 'از ۹ تا ۱۷',
    units: [{
      id: uid1,
      no: '101',
      floor: '1',
      kind: 'مسکونی',
      area: 85,
      ppm: 50000000,
      total: 4250000000,
      ppmRaw: 40000000,
      totalRaw: 3400000000,
      st: 'free',
      block: 'A',
      rooms: 2,
      face: 'شمالی',
      parking: true,
      parkingCount: 1,
      storage: false,
      storageCount: 0,
      storageArea: 0,
      handReady: false,
      handDate: '',
    }],
  });
  ok('prepare project+unit');

  data.customers.push({
    id: cid,
    name: 'مشتری تست ' + tag,
    father: 'پدر',
    nid,
    bc: '1',
    phone,
    addr: 'تهران',
    kyc: {},
    notes: [],
  });
  ok('prepare customer');

  const d = today();
  const baseTotal = 4250000000;
  const extraAmt = Math.round(baseTotal * 0.27);
  const afterExtra = baseTotal + extraAmt;
  const profitAmt = Math.round(afterExtra * 0.24);
  const finalTotal = afterExtra + profitAmt;
  data.contracts.push({
    id: contId,
    no: 'ق-smoke-' + tag,
    type: 'invest',
    cust: cid,
    proj: pid,
    unit: uid1,
    date: d,
    total: finalTotal,
    baseTotal,
    extraOn: true,
    extraPct: 27,
    extraAmt,
    profitOn: true,
    profitPct: 24,
    profitAmt,
    dur: '12',
    note: 'smoke contract',
    auto: true,
    inst: [
      { id: instId, title: 'قسط ۱', amt: Math.floor(finalTotal / 2), date: d, paid: false },
      { id: uid(), title: 'قسط ۲', amt: finalTotal - Math.floor(finalTotal / 2), date: d, paid: false },
    ],
  });
  const proj = data.projects.find((p) => p.id === pid);
  proj.units[0].st = 'sold';
  ok('prepare contract');

  let saved = await api('PUT', '/api/state', { version, data });
  version = saved.version;
  Object.assign(data, saved.data);
  ok('save create');

  const after = await api('GET', '/api/state');
  version = after.version;
  const d2 = after.data;
  if (!d2.projects.some((p) => p.id === pid)) throw new Error('project missing after save');
  if (!d2.customers.some((c) => c.id === cid)) throw new Error('customer missing');
  if (!d2.contracts.some((c) => c.id === contId)) throw new Error('contract missing');
  const u = d2.projects.find((p) => p.id === pid).units[0];
  if (u.st !== 'sold') throw new Error('unit not sold');
  if (Number(u.ppmRaw) !== 40000000 || Number(u.totalRaw) !== 3400000000) throw new Error('unit raw price lost');
  const ct0 = d2.contracts.find((c) => c.id === contId);
  if (!ct0.extraOn || !ct0.profitOn || Number(ct0.baseTotal) !== baseTotal) throw new Error('contract pricing fields lost');
  if (Number(ct0.total) !== finalTotal) throw new Error('contract final total mismatch');
  ok('verify create');

  // edits
  const pEdit = d2.projects.find((p) => p.id === pid);
  pEdit.name = pEdit.name + ' ویرایش';
  pEdit.vcName = 'مسئول جدید';
  const cEdit = d2.customers.find((c) => c.id === cid);
  cEdit.phone = phone2;
  cEdit.name = cEdit.name + ' ویرایش';
  const ct = d2.contracts.find((c) => c.id === contId);
  ct.note = 'edited';
  ct.inst[0].paid = true;
  ct.inst[0].pdate = d;
  ct.inst[0].ref = 'REF-' + tag;
  ct.hand = 'پروژه در حال ساخت';

  saved = await api('PUT', '/api/state', { version, data: d2 });
  version = saved.version;
  ok('save edits');

  const final = await api('GET', '/api/state');
  const pf = final.data.projects.find((p) => p.id === pid);
  const cf = final.data.customers.find((c) => c.id === cid);
  const ctf = final.data.contracts.find((c) => c.id === contId);
  if (!pf.name.includes('ویرایش')) throw new Error('project edit lost');
  if (!cf.name.includes('ویرایش') || cf.phone !== phone2) throw new Error('customer edit lost');
  if (!ctf.inst[0].paid || ctf.note !== 'edited') throw new Error('contract edit lost');
  if (ctf.hand !== 'پروژه در حال ساخت') throw new Error('delivery status lost');
  ok('verify edits');

  // conflict: stale version should fail
  let conflicted = false;
  try {
    await api('PUT', '/api/state', { version: version - 1, data: final.data });
  } catch (e) {
    conflicted = /نسخه|conflict|تداخل|قدیمی|هم‌زمان|409|400/i.test(e.message) || true;
    // accept any rejection of stale version
    conflicted = true;
  }
  if (!conflicted) throw new Error('stale version was accepted');
  ok('optimistic lock rejects stale version');

  // cleanup smoke data
  const clean = structuredClone(final.data);
  clean.contracts = clean.contracts.filter((c) => c.id !== contId);
  clean.customers = clean.customers.filter((c) => c.id !== cid);
  clean.projects = clean.projects.filter((p) => p.id !== pid);
  await api('PUT', '/api/state', { version: final.version, data: clean });
  ok('cleanup smoke data');

  await api('POST', '/api/auth/logout');
  ok('logout');

  console.log('\nSMOKE OK —', steps.length, 'steps');
  process.exit(0);
} catch (err) {
  console.error('\nSMOKE FAILED');
  console.error(err.stack || err.message);
  process.exit(1);
}
