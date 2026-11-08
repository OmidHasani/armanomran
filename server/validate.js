import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export function normalizeDigits(s) {
  return String(s ?? '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

export function digitsOnly(s) {
  return normalizeDigits(s).replace(/\D/g, '');
}

export function canonRef(s) {
  return normalizeDigits(String(s ?? ''))
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\s+/g, '')
    .replace(/[,٬،]/g, '')
    .toLowerCase();
}

export function trailingNumber(value) {
  const match = normalizeDigits(String(value ?? '')).match(/(\d+)\s*$/);
  return match ? Number(match[1]) : 0;
}

const id = z.string().regex(/^[a-z0-9]{4,32}$/i, 'شناسه نامعتبر است');
const docNo = z.string().trim().regex(/^[\u0600-\u06FFa-zA-Z0-9_\-\/\s]{1,40}$/, 'شماره سند نامعتبر است');
const text = (max) => z.string().trim().max(max).default('');

function asNumber(max = 1e15) {
  return z.preprocess((value) => {
    if (typeof value === 'string') {
      const n = Number(normalizeDigits(value).replace(/[,٬،\s]/g, ''));
      return Number.isFinite(n) ? n : value;
    }
    return value;
  }, z.number().finite().min(0).max(max));
}

function padDate(value) {
  if (typeof value !== 'string') return value;
  const raw = normalizeDigits(value).trim().replace(/-/g, '/');
  const match = raw.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return raw;
  return `${match[1]}/${match[2].padStart(2, '0')}/${match[3].padStart(2, '0')}`;
}

const dateRe = /^(1[3-5]\d{2})\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/;
const jdate = z.preprocess(padDate, z.string().regex(dateRe, 'تاریخ نامعتبر است'));
const jdateOrEmpty = z.preprocess((value) => {
  if (value == null || value === '') return '';
  return padDate(value);
}, z.string().refine((value) => value === '' || dateRe.test(value), 'تاریخ نامعتبر است'));

function cleanDoc(html) {
  if (!html) return '';
  return sanitizeHtml(String(html), {
    allowedTags: ['p', 'b', 'strong', 'i', 'em', 'u', 'br', 'div', 'span', 'h3', 'h4', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'ul', 'ol', 'li'],
    allowedAttributes: {
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
    },
  }).slice(0, 500000);
}

const unitSchema = z.object({
  id,
  no: z.string().trim().min(1).max(40),
  floor: text(40),
  kind: text(40),
  area: asNumber(1e7),
  ppm: asNumber(),
  total: asNumber(),
  ppmRaw: asNumber().default(0).optional(),
  totalRaw: asNumber().default(0).optional(),
  st: z.enum(['free', 'res', 'sold']),
  block: text(80),
  rooms: asNumber(100).default(0).optional(),
  face: text(40),
  parking: z.boolean().default(false).optional(),
  parkingCount: asNumber(100).default(0).optional(),
  storage: z.boolean().default(false).optional(),
  storageCount: asNumber(100).default(0).optional(),
  storageArea: asNumber(1e5).default(0).optional(),
  handReady: z.boolean().default(false).optional(),
  handDate: jdateOrEmpty.default(''),
});

const projectSchema = z.object({
  id,
  name: z.string().trim().min(1).max(200),
  addr: text(500),
  note: text(4000),
  vcName: text(200),
  vcPhone: text(30),
  vcNote: text(1000),
  units: z.array(unitSchema).max(5000).default([]),
});

const KYC_KEYS = [
  'تصویر کارت ملی',
  'تصویر شناسنامه',
  'شبا/حساب بانکی متعلق به خود مشتری',
  'نشانی و شماره تماس تأییدشده',
  'فرم اعلام پرداخت امضاشده',
];

const customerSchema = z.object({
  id,
  name: z.string().trim().min(1).max(200),
  father: text(200),
  nid: z.string().trim().min(1).max(30),
  bc: text(30),
  phone: z.string().trim().min(3).max(30),
  addr: text(1000),
  kyc: z.record(z.boolean()).optional(),
  notes: z.array(z.object({
    d: jdate,
    t: z.string().trim().min(1).max(4000),
    by: z.string().trim().max(200).default(''),
  })).max(1000).optional(),
});

const optionalPct = z.preprocess((value) => {
  if (value == null || value === '') return undefined;
  if (typeof value === 'string') {
    const n = Number(normalizeDigits(value).replace(/[,٬،\s]/g, ''));
    return Number.isFinite(n) ? n : value;
  }
  return value;
}, z.number().finite().min(0).max(100).optional());

const instSchema = z.object({
  id,
  title: z.string().trim().max(200).default(''),
  amt: asNumber(),
  date: jdate,
  paid: z.boolean(),
  pdate: jdateOrEmpty.default(''),
  ref: z.string().trim().max(80).default(''),
  kind: z.preprocess((value) => (value == null || value === '' ? '' : String(value).trim()), z.string().max(20)).optional(),
  latePctDaily: optionalPct,
  lateDays: asNumber(1e6).default(0).optional(),
  lateCalc: asNumber().default(0).optional(),
  lateFee: asNumber().default(0).optional(),
  lateNote: text(1000),
});

const qarzPaySchema = z.object({
  id: z.string().trim().max(32).default(''),
  amt: asNumber(),
  date: jdateOrEmpty.default(''),
  bank: text(120),
  ref: text(80),
});

const contractDocFields = z.object({
  title: text(20),
  birth: text(40),
  addr: text(1000),
  phone: text(30),
  loc: text(500),
  area: text(40),
  floor: text(40),
  unitNo: text(40),
  start: jdateOrEmpty.default(''),
  end: jdateOrEmpty.default(''),
  handDate: jdateOrEmpty.default(''),
  qarzTotal: asNumber().default(0),
  qarzPays: z.array(qarzPaySchema).max(100).default([]),
  payDayLabel: text(40),
  coolDays: text(40),
  qarzRefundCount: text(20),
  payBank: text(80),
  payCard: text(40),
  paySheba: text(40),
  payAcct: text(40),
  payName: text(120),
  postal: text(20),
  block: text(40),
  landAddr: text(500),
  chequeNo: text(80),
  delayFineDaily: asNumber().optional(),
  delayExtraDays: text(40),
});

const contractSchema = z.object({
  id,
  no: docNo,
  type: z.enum(['lease', 'partner', 'invest']),
  cust: id,
  proj: id,
  unit: id,
  date: jdate,
  total: asNumber(),
  baseTotal: asNumber().default(0).optional(),
  extraOn: z.boolean().default(false).optional(),
  extraPct: asNumber(100).default(0).optional(),
  extraAmt: asNumber().default(0).optional(),
  profitOn: z.boolean().default(false).optional(),
  profitPct: asNumber(100).default(0).optional(),
  profitAmt: asNumber().default(0).optional(),
  dur: z.preprocess((value) => value == null ? '' : String(value), z.string().trim().max(40)),
  note: text(4000),
  latePctDaily: asNumber(100).default(0).optional(),
  auto: z.boolean().optional(),
  inst: z.array(instSchema).max(500).default([]),
  fac: z.array(z.object({
    t: z.string().trim().max(80),
    cost: asNumber(),
    done: z.boolean(),
  })).max(30).optional(),
  hand: text(80),
  doc: contractDocFields.optional(),
  ed: z.record(z.string().regex(/^[a-z0-9_]{1,40}$/i), z.string().max(500000)).optional(),
});

const paySchema = z.object({
  id: docNo,
  amt: asNumber(),
  date: jdate,
  ref: z.string().trim().min(1).max(80),
  acct: z.string().trim().min(1).max(40),
  payer: z.string().trim().min(1).max(200),
  tp: z.boolean().default(false),
  rel: text(200),
  appv: text(200),
  s: z.enum(['ok', 'used', 'ref', 'closed']).default('ok'),
});

const reservationSchema = z.object({
  id,
  no: docNo,
  cust: id,
  proj: id,
  unit: id,
  need: asNumber(),
  fine: asNumber(),
  deadline: jdate,
  date: jdate,
  st: z.enum(['active', 'cancelling', 'cancel', 'conv']),
  pays: z.array(paySchema).max(200).default([]),
  by: text(200),
  appr: text(200),
  log: z.array(z.object({
    d: jdate,
    h: z.string().regex(/^\d{2}:\d{2}$/),
    by: z.string().trim().max(200).default(''),
    t: z.string().trim().max(4000).default(''),
  })).max(500).default([]),
  cancel: z.object({
    reason: z.string().trim().min(1).max(2000),
    date: jdate,
    fine: asNumber(),
    refund: asNumber(),
    h: z.array(z.object({
      s: z.number().int().min(0).max(20),
      d: jdate,
      by: z.string().trim().max(200).default(''),
      doc: z.string().trim().max(80).default(''),
    })).max(20).default([]),
  }).optional(),
  doc: z.object({
    title: text(20),
    total: asNumber().optional(),
    loc: text(500),
    floor: text(40),
    unitNo: text(40),
    fromBank: text(80),
    supportPhone: text(30),
    refundMonths: asNumber().optional(),
    schedule: z.array(z.object({
      amt: asNumber().default(0),
      date: jdateOrEmpty.default(''),
    })).max(20).default([]),
    payBank: text(80),
    payCard: text(40),
    paySheba: text(40),
    payAcct: text(40),
    payName: text(120),
  }).partial().optional(),
  ed: z.record(z.string().regex(/^[a-z0-9_]{1,40}$/i), z.string().max(500000)).optional(),
});

const leadSchema = z.object({
  id,
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(3).max(30),
  src: text(40),
  proj: z.string().trim().max(40).default(''),
  stage: z.preprocess((value) => value == null || value === '' ? 0 : Number(value), z.number().int().min(0).max(9)),
  next: jdateOrEmpty.default(''),
  loan: z.preprocess((value) => value === '' || value == null ? 'no' : value, z.enum(['yes', 'no'])),
  rep: text(200),
  note: text(4000),
  cust: z.string().trim().max(40).default(''),
  vcName: text(200),
  vcPhone: text(30),
  visitAt: jdateOrEmpty.default(''),
  visitDoneAt: jdateOrEmpty.default(''),
  h: z.array(z.object({
    id: z.string().trim().max(40).optional(),
    d: jdate,
    h: z.string().trim().max(10).default(''),
    by: text(200),
    from: z.preprocess((value) => value == null || value === '' ? undefined : Number(value), z.number().int().min(0).max(9).optional()),
    s: z.number().int().min(0).max(9),
    note: text(4000),
    kind: text(40),
    vcName: text(200),
    vcPhone: text(30),
    visitAt: jdateOrEmpty.default(''),
  })).max(500).default([]),
});

const partySchema = z.object({
  id,
  name: z.string().trim().min(1).max(200),
  kind: z.enum(['cust', 'staff', 'contractor']),
  title: text(120),
  phone: text(30),
  nid: text(30),
  custId: z.preprocess((value) => (value == null || value === '' ? '' : value), z.union([id, z.literal('')])).default(''),
  note: text(4000),
});

const ledgerSchema = z.object({
  id,
  party: id,
  date: jdate,
  type: z.enum(['in', 'out']),
  amt: asNumber(),
  desc: text(2000),
  ref: text(80),
  by: text(200),
  source: z.preprocess((value) => (value == null || value === '' ? 'manual' : value), z.enum(['manual', 'check'])).default('manual'),
  checkId: z.preprocess((value) => (value == null || value === '' ? '' : value), z.union([id, z.literal('')])).default(''),
});

const checkSchema = z.object({
  id,
  type: z.enum(['in', 'out']),
  party: id,
  amt: asNumber(),
  checkDate: jdateOrEmpty.default(''),
  dueDate: jdateOrEmpty.default(''),
  regDate: jdate,
  bank: text(80),
  branch: text(120),
  sayad: text(40),
  serial: text(40),
  accountNo: text(40),
  holder: text(200),
  status: z.enum(['pending', 'cleared', 'bounced', 'returned', 'cancelled']).default('pending'),
  desc: text(2000),
  note: text(4000),
  by: text(200),
  ledgerId: z.preprocess((value) => (value == null || value === '' ? '' : value), z.union([id, z.literal('')])).default(''),
});

const stateSchema = z.object({
  projects: z.array(projectSchema).max(500).default([]),
  customers: z.array(customerSchema).max(20000).default([]),
  contracts: z.array(contractSchema).max(20000).default([]),
  reservations: z.array(reservationSchema).max(20000).default([]),
  leads: z.array(leadSchema).max(50000).default([]),
  parties: z.array(partySchema).max(20000).default([]),
  ledger: z.array(ledgerSchema).max(100000).default([]),
  checks: z.array(checkSchema).max(50000).default([]),
  cfg: z.object({
    fine: asNumber().optional(),
    days: z.preprocess((value) => value == null || value === '' ? undefined : Number(value), z.number().int().min(1).max(3650).optional()),
  }).default({}),
  me: text(200),
  pn: z.preprocess((value) => value == null || value === '' ? 1000 : Number(value), z.number().int().min(0).max(1e9)),
  cn: z.preprocess((value) => value == null || value === '' ? 1000 : Number(value), z.number().int().min(0).max(1e9)),
  rn: z.preprocess((value) => value == null || value === '' ? 1000 : Number(value), z.number().int().min(0).max(1e9)),
}).strip();

function assertUnique(items, label) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.id)) throw new AppError(`${label} تکراری است`);
    seen.add(item.id);
  }
}

function assertUniqueNo(items, label) {
  const seen = new Set();
  for (const item of items) {
    const key = canonRef(item.no);
    if (seen.has(key)) throw new AppError(`${label} تکراری است`);
    seen.add(key);
  }
}

function cleanEd(ed) {
  if (!ed || typeof ed !== 'object') return undefined;
  const next = {};
  for (const [key, value] of Object.entries(ed)) {
    if (!/^[a-z0-9_]{1,40}$/i.test(key)) continue;
    if (typeof value === 'string' && value.trim()) next[key] = cleanDoc(value);
  }
  return Object.keys(next).length ? next : undefined;
}

function cleanKyc(kyc) {
  if (!kyc || typeof kyc !== 'object') return undefined;
  const next = {};
  for (const key of KYC_KEYS) {
    if (kyc[key]) next[key] = true;
  }
  return Object.keys(next).length ? next : undefined;
}

const COLLECTION_LIMITS = {
  projects: 500,
  customers: 20000,
  contracts: 20000,
  reservations: 20000,
  leads: 50000,
  parties: 20000,
  ledger: 100000,
  checks: 50000,
};

export function validateState(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  for (const [key, max] of Object.entries(COLLECTION_LIMITS)) {
    if (Array.isArray(source[key]) && source[key].length > max) {
      throw new AppError('حجم داده بیش از حد مجاز است');
    }
  }
  const parsed = stateSchema.safeParse(source);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    console.error('State validation failed:', parsed.error.issues.slice(0, 6));
    throw new AppError(`داده نامعتبر است${issue?.path?.length ? ': ' + issue.path.join('.') : ''}`);
  }
  const data = parsed.data;
  assertUnique(data.projects, 'شناسه پروژه');
  assertUnique(data.customers, 'شناسه مشتری');
  assertUnique(data.contracts, 'شناسه قرارداد');
  assertUnique(data.reservations, 'شناسه رزرو');
  assertUnique(data.leads, 'شناسه سرنخ');
  assertUnique(data.parties, 'شناسه شخص حسابداری');
  assertUnique(data.ledger, 'شناسه تراکنش حسابداری');
  assertUnique(data.checks, 'شناسه چک');
  assertUniqueNo(data.contracts, 'شماره قرارداد');
  assertUniqueNo(data.reservations, 'شماره رزرو');

  const nids = new Set();
  const phones = new Set();
  for (const customer of data.customers) {
    customer.nid = digitsOnly(customer.nid);
    customer.phone = digitsOnly(customer.phone);
    customer.bc = digitsOnly(customer.bc);
    if (customer.nid.length < 8 || customer.nid.length > 14) {
      throw new AppError(`کد ملی «${customer.name}» معتبر نیست`);
    }
    if (customer.phone.length < 8 || customer.phone.length > 15) {
      throw new AppError(`شماره همراه «${customer.name}» معتبر نیست`);
    }
    if (nids.has(customer.nid)) {
      throw new AppError(`کد ملی «${customer.nid}» تکراری است و برای بیش از یک مشتری ثبت شده`);
    }
    nids.add(customer.nid);
    if (phones.has(customer.phone)) {
      throw new AppError(`شماره تماس «${customer.phone}» تکراری است و برای بیش از یک مشتری ثبت شده`);
    }
    phones.add(customer.phone);
    customer.kyc = cleanKyc(customer.kyc);
    if (customer.notes?.length) {
      customer.notes = customer.notes.slice(-1000);
    } else {
      delete customer.notes;
    }
  }

  for (const project of data.projects) {
    const unitIds = new Set();
    for (const unit of project.units) {
      if (unitIds.has(unit.id)) throw new AppError(`شماره داخلی واحد در پروژه ${project.name} تکراری است`);
      unitIds.add(unit.id);
    }
  }

  const projectMap = new Map(data.projects.map((project) => [project.id, project]));
  const customerIds = new Set(data.customers.map((customer) => customer.id));
  const instIds = new Set();
  const payIds = new Set();
  const refs = new Set();

  const rememberRef = (ref) => {
    const key = canonRef(ref);
    if (!key) return;
    if (refs.has(key)) throw new AppError(`شماره پیگیری «${ref}» تکراری است و بیش از یک بار ثبت شده`);
    refs.add(key);
  };

  for (const contract of data.contracts) {
    if (!customerIds.has(contract.cust)) throw new AppError(`قرارداد ${contract.no} به مشتری ناموجود وصل است`);
    const project = projectMap.get(contract.proj);
    if (!project || !project.units.some((unit) => unit.id === contract.unit)) {
      throw new AppError(`قرارداد ${contract.no} به واحد ناموجود وصل است`);
    }
    for (const inst of contract.inst) {
      if (instIds.has(inst.id)) throw new AppError('شناسه قسط تکراری است');
      instIds.add(inst.id);
      if (inst.paid) rememberRef(inst.ref);
    }
    contract.ed = cleanEd(contract.ed);
  }

  for (const reservation of data.reservations) {
    if (!customerIds.has(reservation.cust)) throw new AppError(`رزرو ${reservation.no} به مشتری ناموجود وصل است`);
    const project = projectMap.get(reservation.proj);
    if (!project || !project.units.some((unit) => unit.id === reservation.unit)) {
      throw new AppError(`رزرو ${reservation.no} به واحد ناموجود وصل است`);
    }
    for (const pay of reservation.pays) {
      if (payIds.has(pay.id)) throw new AppError('شناسه پرداخت رزرو تکراری است');
      payIds.add(pay.id);
      rememberRef(pay.ref);
    }
    reservation.ed = cleanEd(reservation.ed);
  }

  const soldKeys = data.contracts.map((contract) => `${contract.proj}|${contract.unit}`);
  if (new Set(soldKeys).size !== soldKeys.length) throw new AppError('دو قرارداد به یک واحد وصل شده‌اند');
  const held = data.reservations.filter((reservation) => reservation.st === 'active' || reservation.st === 'cancelling');
  const heldKeys = held.map((reservation) => `${reservation.proj}|${reservation.unit}`);
  if (new Set(heldKeys).size !== heldKeys.length) throw new AppError('دو رزرو فعال به یک واحد وصل شده‌اند');
  const sold = new Set(soldKeys);
  const reserved = new Set(heldKeys);
  for (const key of sold) {
    if (reserved.has(key)) throw new AppError('یک واحد هم‌زمان قرارداد و رزرو فعال دارد');
  }
  for (const project of data.projects) {
    for (const unit of project.units) {
      const key = `${project.id}|${unit.id}`;
      unit.st = sold.has(key) ? 'sold' : reserved.has(key) ? 'res' : 'free';
    }
  }

  for (const project of data.projects) {
    if (project.vcPhone) project.vcPhone = digitsOnly(project.vcPhone);
  }

  const leadPhones = new Set();
  for (const lead of data.leads) {
    lead.phone = digitsOnly(lead.phone);
    if (lead.vcPhone) lead.vcPhone = digitsOnly(lead.vcPhone);
    if (lead.phone.length < 8 || lead.phone.length > 15) throw new AppError(`شماره تماس سرنخ «${lead.name}» معتبر نیست`);
    // فقط سرنخ‌های باز نسبت به هم یکتا باشند؛ تداخل با مشتری در UI کنترل می‌شود
    // (سرنخ تبدیل‌شده می‌تواند همان موبایل مشتری را داشته باشد)
    if (!lead.cust) {
      if (leadPhones.has(lead.phone)) {
        throw new AppError(`شماره تماس «${lead.phone}» تکراری است و برای بیش از یک سرنخ ثبت شده`);
      }
      leadPhones.add(lead.phone);
    }
    if (lead.proj && !projectMap.has(lead.proj)) lead.proj = '';
    if (lead.cust && !customerIds.has(lead.cust)) lead.cust = '';
    if (lead.proj && !id.safeParse(lead.proj).success) lead.proj = '';
    if (lead.cust && !id.safeParse(lead.cust).success) lead.cust = '';
    for (const ev of lead.h || []) {
      if (ev.vcPhone) ev.vcPhone = digitsOnly(ev.vcPhone);
    }
  }

  const seenCustParty = new Set();
  for (const party of data.parties) {
    if (party.phone) party.phone = digitsOnly(party.phone);
    if (party.nid) party.nid = digitsOnly(party.nid);
    if (party.custId && !customerIds.has(party.custId)) party.custId = '';
    if (party.kind !== 'cust') party.custId = '';
    if (party.custId) {
      if (seenCustParty.has(party.custId)) {
        throw new AppError(`مشتری بیش از یک پرونده حسابداری دارد (${party.name || party.custId})`);
      }
      seenCustParty.add(party.custId);
    }
  }

  const partyIds = new Set(data.parties.map((party) => party.id));
  for (const row of data.ledger) {
    if (!partyIds.has(row.party)) throw new AppError('تراکنش به شخص حسابداری ناموجود وصل است');
    if (!(row.amt > 0)) throw new AppError('مبلغ تراکنش حسابداری باید بزرگ‌تر از صفر باشد');
    if (row.source !== 'check') {
      row.source = 'manual';
      row.checkId = '';
    }
    rememberRef(row.ref);
  }

  const ledgerIds = new Set(data.ledger.map((row) => row.id));
  const checkIds = new Set(data.checks.map((row) => row.id));
  for (const ch of data.checks) {
    if (!partyIds.has(ch.party)) throw new AppError(`چک به شخص حسابداری ناموجود وصل است`);
    if (!(ch.amt > 0)) throw new AppError('مبلغ چک باید بزرگ‌تر از صفر باشد');
    if (ch.ledgerId && !ledgerIds.has(ch.ledgerId)) ch.ledgerId = '';
  }
  for (const row of data.ledger) {
    if (row.source === 'check' && row.checkId && !checkIds.has(row.checkId)) {
      row.source = 'manual';
      row.checkId = '';
    }
  }

  return data;
}
