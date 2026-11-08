import mongoose from 'mongoose';
import { Check, Contract, Customer, Lead, Ledger, Meta, Party, Project, Reservation } from './models.js';
import { AppError, trailingNumber, validateState } from './validate.js';

const DEFAULT_FINE = 30000000;
const DEFAULT_DAYS = 20;

function toClient(doc) {
  const { _id, createdAt, updatedAt, ...rest } = doc;
  return { id: _id, ...rest };
}

function maxTrailing(items, pick) {
  let max = 0;
  for (const item of items) max = Math.max(max, trailingNumber(pick(item)));
  return max;
}

async function replaceAll(Model, docs, session) {
  const existing = await Model.find({}, { createdAt: 1 }).session(session).lean();
  const created = new Map(existing.map((doc) => [String(doc._id), doc.createdAt]));
  const now = new Date();
  const ids = docs.map((doc) => doc._id);
  await Model.deleteMany({ _id: { $nin: ids } }).session(session);
  if (!docs.length) return;
  await Model.bulkWrite(docs.map((doc) => ({
    replaceOne: {
      filter: { _id: doc._id },
      replacement: {
        ...doc,
        createdAt: created.get(String(doc._id)) || now,
        updatedAt: now,
      },
      upsert: true,
    },
  })), { session });
}

function projectDoc(project) {
  return {
    _id: project.id,
    name: project.name,
    addr: project.addr || '',
    note: project.note || '',
    vcName: project.vcName || '',
    vcPhone: project.vcPhone || '',
    vcNote: project.vcNote || '',
    units: project.units.map((unit) => ({
      id: unit.id,
      no: unit.no,
      floor: unit.floor || '',
      kind: unit.kind || '',
      area: unit.area,
      ppm: unit.ppm,
      total: unit.total,
      ppmRaw: Number(unit.ppmRaw) || 0,
      totalRaw: Number(unit.totalRaw) || 0,
      st: unit.st,
      block: unit.block || '',
      rooms: Number(unit.rooms) || 0,
      face: unit.face || '',
      parking: !!unit.parking,
      parkingCount: Number(unit.parkingCount) || 0,
      storage: !!unit.storage,
      storageCount: Number(unit.storageCount) || 0,
      storageArea: Number(unit.storageArea) || 0,
      handReady: !!unit.handReady,
      handDate: unit.handDate || '',
    })),
  };
}

function customerDoc(customer) {
  const doc = {
    _id: customer.id,
    name: customer.name,
    father: customer.father || '',
    nid: customer.nid,
    bc: customer.bc || '',
    phone: customer.phone,
    addr: customer.addr || '',
    notes: customer.notes || [],
  };
  if (customer.kyc) doc.kyc = customer.kyc;
  return doc;
}

function contractDoc(contract) {
  const doc = {
    _id: contract.id,
    no: contract.no,
    type: contract.type,
    cust: contract.cust,
    proj: contract.proj,
    unit: contract.unit,
    date: contract.date,
    total: contract.total,
    baseTotal: Number(contract.baseTotal) || 0,
    extraOn: !!contract.extraOn,
    extraPct: Number(contract.extraPct) || 0,
    extraAmt: Number(contract.extraAmt) || 0,
    profitOn: !!contract.profitOn,
    profitPct: Number(contract.profitPct) || 0,
    profitAmt: Number(contract.profitAmt) || 0,
    dur: contract.dur || '',
    note: contract.note || '',
    latePctDaily: Number(contract.latePctDaily) || 0,
    inst: contract.inst.map((inst) => {
      const row = {
        id: inst.id,
        title: inst.title || '',
        amt: inst.amt,
        date: inst.date,
        paid: !!inst.paid,
        pdate: inst.pdate || '',
        ref: inst.ref || '',
        lateDays: Number(inst.lateDays) || 0,
        lateCalc: Number(inst.lateCalc) || 0,
        lateFee: Number(inst.lateFee) || 0,
        lateNote: inst.lateNote || '',
      };
      if (inst.kind) row.kind = inst.kind;
      if (inst.latePctDaily != null && inst.latePctDaily !== '') {
        row.latePctDaily = Number(inst.latePctDaily);
      }
      return row;
    }),
    hand: contract.hand || '',
  };
  if (typeof contract.auto === 'boolean') doc.auto = contract.auto;
  if (contract.fac?.length) doc.fac = contract.fac;
  if (contract.doc && typeof contract.doc === 'object') {
    doc.doc = {
      title: contract.doc.title || '',
      birth: contract.doc.birth || '',
      addr: contract.doc.addr || '',
      phone: contract.doc.phone || '',
      loc: contract.doc.loc || '',
      area: contract.doc.area || '',
      floor: contract.doc.floor || '',
      unitNo: contract.doc.unitNo || '',
      start: contract.doc.start || '',
      end: contract.doc.end || '',
      handDate: contract.doc.handDate || '',
      qarzTotal: Number(contract.doc.qarzTotal) || 0,
      qarzPays: Array.isArray(contract.doc.qarzPays)
        ? contract.doc.qarzPays.map((row) => ({
          id: row.id || '',
          amt: Number(row.amt) || 0,
          date: row.date || '',
          bank: row.bank || '',
          ref: row.ref || '',
        }))
        : [],
      payDayLabel: contract.doc.payDayLabel || '',
      coolDays: contract.doc.coolDays || '',
      qarzRefundCount: contract.doc.qarzRefundCount || '',
      payBank: contract.doc.payBank || '',
      payCard: contract.doc.payCard || '',
      paySheba: contract.doc.paySheba || '',
      payAcct: contract.doc.payAcct || '',
      payName: contract.doc.payName || '',
      postal: contract.doc.postal || '',
      block: contract.doc.block || '',
      landAddr: contract.doc.landAddr || '',
      chequeNo: contract.doc.chequeNo || '',
      delayFineDaily: Number(contract.doc.delayFineDaily) || 0,
      delayExtraDays: contract.doc.delayExtraDays || '',
    };
  }
  if (contract.ed) doc.ed = contract.ed;
  return doc;
}

function reservationDoc(reservation) {
  const doc = {
    _id: reservation.id,
    no: reservation.no,
    cust: reservation.cust,
    proj: reservation.proj,
    unit: reservation.unit,
    need: reservation.need,
    fine: reservation.fine,
    deadline: reservation.deadline,
    date: reservation.date,
    st: reservation.st,
    pays: reservation.pays,
    by: reservation.by || '',
    appr: reservation.appr || '',
    log: reservation.log || [],
  };
  if (reservation.cancel) doc.cancel = reservation.cancel;
  if (reservation.doc && typeof reservation.doc === 'object') {
    doc.doc = {
      title: reservation.doc.title || '',
      total: Number(reservation.doc.total) || 0,
      loc: reservation.doc.loc || '',
      floor: reservation.doc.floor || '',
      unitNo: reservation.doc.unitNo || '',
      fromBank: reservation.doc.fromBank || '',
      supportPhone: reservation.doc.supportPhone || '',
      refundMonths: Number(reservation.doc.refundMonths) || 0,
      schedule: Array.isArray(reservation.doc.schedule)
        ? reservation.doc.schedule.map((row) => ({
          amt: Number(row.amt) || 0,
          date: row.date || '',
        }))
        : [],
      payBank: reservation.doc.payBank || '',
      payCard: reservation.doc.payCard || '',
      paySheba: reservation.doc.paySheba || '',
      payAcct: reservation.doc.payAcct || '',
      payName: reservation.doc.payName || '',
    };
  }
  if (reservation.ed) doc.ed = reservation.ed;
  return doc;
}

function leadDoc(lead) {
  return {
    _id: lead.id,
    name: lead.name,
    phone: lead.phone,
    src: lead.src || '',
    proj: lead.proj || '',
    stage: lead.stage,
    next: lead.next || '',
    loan: lead.loan || 'no',
    rep: lead.rep || '',
    note: lead.note || '',
    cust: lead.cust || '',
    vcName: lead.vcName || '',
    vcPhone: lead.vcPhone || '',
    visitAt: lead.visitAt || '',
    visitDoneAt: lead.visitDoneAt || '',
    h: lead.h || [],
  };
}

function partyDoc(party) {
  return {
    _id: party.id,
    name: party.name,
    kind: party.kind,
    title: party.title || '',
    phone: party.phone || '',
    nid: party.nid || '',
    custId: party.custId || '',
    note: party.note || '',
  };
}

function ledgerDoc(row) {
  return {
    _id: row.id,
    party: row.party,
    date: row.date,
    type: row.type,
    amt: row.amt,
    desc: row.desc || '',
    ref: row.ref || '',
    by: row.by || '',
    source: row.source === 'check' ? 'check' : 'manual',
    checkId: row.checkId || '',
  };
}

function checkDoc(ch) {
  return {
    _id: ch.id,
    type: ch.type,
    party: ch.party,
    amt: ch.amt,
    checkDate: ch.checkDate || '',
    dueDate: ch.dueDate || '',
    regDate: ch.regDate,
    bank: ch.bank || '',
    branch: ch.branch || '',
    sayad: ch.sayad || '',
    serial: ch.serial || '',
    accountNo: ch.accountNo || '',
    holder: ch.holder || '',
    status: ch.status || 'pending',
    desc: ch.desc || '',
    note: ch.note || '',
    by: ch.by || '',
    ledgerId: ch.ledgerId || '',
  };
}

export async function loadState() {
  const [projects, customers, contracts, reservations, leads, parties, ledger, checks, meta] = await Promise.all([
    Project.find().sort({ createdAt: 1 }).lean(),
    Customer.find().sort({ createdAt: 1 }).lean(),
    Contract.find().sort({ createdAt: 1 }).lean(),
    Reservation.find().sort({ createdAt: 1 }).lean(),
    Lead.find().sort({ createdAt: 1 }).lean(),
    Party.find().sort({ createdAt: 1 }).lean(),
    Ledger.find().sort({ date: 1, createdAt: 1 }).lean(),
    Check.find().sort({ regDate: 1, createdAt: 1 }).lean(),
    Meta.findById('crm').lean(),
  ]);
  return {
    version: meta?.version || 0,
    data: {
      projects: projects.map(toClient),
      customers: customers.map(toClient),
      contracts: contracts.map(toClient),
      reservations: reservations.map(toClient),
      leads: leads.map(toClient),
      parties: parties.map(toClient),
      ledger: ledger.map(toClient),
      checks: checks.map(toClient),
      cfg: {
        fine: meta?.fine ?? DEFAULT_FINE,
        days: meta?.days ?? DEFAULT_DAYS,
        legalDays: meta?.legalDays ?? 7,
        autoLegal: meta?.autoLegal !== false,
      },
      me: meta?.me || '',
      pn: meta?.pn ?? 1000,
      cn: meta?.cn ?? 1000,
      rn: meta?.rn ?? 1000,
    },
  };
}

export async function saveState(user, version, raw) {
  const data = validateState(raw);
  const cn = Math.max(data.cn || 0, maxTrailing(data.contracts, (contract) => contract.no), 1000);
  const rn = Math.max(data.rn || 0, maxTrailing(data.reservations, (reservation) => reservation.no), 1000);
  const pn = Math.max(
    data.pn || 0,
    maxTrailing(data.reservations.flatMap((reservation) => reservation.pays), (pay) => pay.id),
    1000,
  );
  let result = null;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const meta = await Meta.findById('crm').session(session);
      const current = meta?.version || 0;
      if ((version || 0) !== current) {
        const error = new AppError('شخص دیگری داده‌ها را تغییر داده است. صفحه را تازه‌سازی کنید.', 409);
        error.version = current;
        throw error;
      }
      await replaceAll(Project, data.projects.map(projectDoc), session);
      await replaceAll(Customer, data.customers.map(customerDoc), session);
      await replaceAll(Contract, data.contracts.map(contractDoc), session);
      await replaceAll(Reservation, data.reservations.map(reservationDoc), session);
      await replaceAll(Lead, data.leads.map(leadDoc), session);
      await replaceAll(Party, data.parties.map(partyDoc), session);
      await replaceAll(Ledger, data.ledger.map(ledgerDoc), session);
      await replaceAll(Check, data.checks.map(checkDoc), session);
      const now = new Date();
      const nextVersion = current + 1;
      await Meta.updateOne(
        { _id: 'crm' },
        {
          $set: {
            version: nextVersion,
            fine: data.cfg?.fine > 0 ? data.cfg.fine : (meta?.fine ?? DEFAULT_FINE),
            days: data.cfg?.days > 0 ? data.cfg.days : (meta?.days ?? DEFAULT_DAYS),
            me: data.me || '',
            pn,
            cn,
            rn,
            updatedBy: user.username,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true, session },
      );
      result = { version: nextVersion, pn, cn, rn };
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err?.code === 11000 || err?.cause?.code === 11000) {
      throw new AppError('یک مقدار یکتا تکراری است. شماره قرارداد، رزرو یا کد ملی را بررسی کنید.', 409);
    }
    throw err;
  } finally {
    await session.endSession();
  }
  if (!result) throw new AppError('ذخیره انجام نشد', 500);
  return result;
}
