import assert from 'node:assert/strict';
import test from 'node:test';
import { validateState } from './validate.js';

function base() {
  return {
    projects: [{
      id: 'proj0001',
      name: 'برج آسمان',
      addr: 'تهران',
      note: '',
      units: [{
        id: 'unit0001',
        no: '12',
        floor: '3',
        kind: 'مسکونی',
        area: 80,
        ppm: 1000000,
        total: 80000000,
        st: 'free',
      }],
    }],
    customers: [{
      id: 'cust0001',
      name: 'علی رضایی',
      father: 'حسن',
      nid: '۰۰۱۳۵۴۲۴۱۹',
      bc: '123',
      phone: '۰۹۱۲۱۲۳۴۵۶۷',
      addr: 'تهران',
    }],
    contracts: [],
    reservations: [],
    leads: [],
    cfg: {},
    me: '',
    pn: 1000,
    cn: 1000,
    rn: 1000,
  };
}

test('normalizes digits and keeps an empty crm valid', () => {
  const data = validateState(base());
  assert.equal(data.customers[0].nid, '0013542419');
  assert.equal(data.customers[0].phone, '09121234567');
  assert.equal(data.projects[0].units[0].st, 'free');
});

test('accepts extended unit details', () => {
  const raw = base();
  Object.assign(raw.projects[0].units[0], {
    block: 'A',
    rooms: 3,
    face: 'شمال شرقی',
    parking: true,
    parkingCount: 2,
    storage: true,
    storageCount: 1,
    storageArea: 8.5,
    handReady: false,
    handDate: '1405/12/01',
  });
  const data = validateState(raw);
  const u = data.projects[0].units[0];
  assert.equal(u.block, 'A');
  assert.equal(u.rooms, 3);
  assert.equal(u.face, 'شمال شرقی');
  assert.equal(u.parkingCount, 2);
  assert.equal(u.storageArea, 8.5);
  assert.equal(u.handDate, '1405/12/01');
});

test('marks a contracted unit as sold and strips script from the document', () => {
  const raw = base();
  raw.projects[0].units[0].st = 'free';
  raw.contracts.push({
    id: 'cont0001',
    no: 'ق-۱۰۰۱',
    type: 'invest',
    cust: 'cust0001',
    proj: 'proj0001',
    unit: 'unit0001',
    date: '1404/01/15',
    total: 80000000,
    dur: '12',
    note: '',
    inst: [{
      id: 'inst0001',
      title: 'پیش‌پرداخت',
      amt: 80000000,
      date: '1404/01/15',
      paid: false,
      pdate: '',
      ref: '',
    }],
    ed: { c: '<p>سلام</p><script>alert(1)</script><img src=x onerror=alert(1)>', dm: '<p>یادآوری</p>' },
  });
  const data = validateState(raw);
  assert.equal(data.projects[0].units[0].st, 'sold');
  assert.match(data.contracts[0].ed.c, /سلام/);
  assert.doesNotMatch(data.contracts[0].ed.c, /script|onerror/i);
});

test('rejects a repeated payment reference', () => {
  const raw = base();
  raw.projects[0].units.push({
    id: 'unit0002', no: '13', floor: '3', kind: 'مسکونی', area: 70, ppm: 1, total: 70, st: 'res',
  });
  const pay = (id, ref) => ({
    id, amt: 1000, date: '1404/02/01', ref, acct: '6037', payer: 'علی رضایی', tp: false, rel: '', appv: '', s: 'ok',
  });
  raw.reservations.push({
    id: 'resv0001',
    no: 'ر-1001',
    cust: 'cust0001',
    proj: 'proj0001',
    unit: 'unit0001',
    need: 5000,
    fine: 1000,
    deadline: '1404/03/01',
    date: '1404/02/01',
    st: 'active',
    pays: [pay('پ-1001', 'ABC-12')],
    by: 'کارشناس',
    appr: 'مدیر',
    log: [{ d: '1404/02/01', h: '10:15', by: 'کارشناس', t: 'ثبت' }],
  });
  raw.reservations.push({
    id: 'resv0002',
    no: 'ر-1002',
    cust: 'cust0001',
    proj: 'proj0001',
    unit: 'unit0002',
    need: 5000,
    fine: 1000,
    deadline: '1404/03/01',
    date: '1404/02/01',
    st: 'active',
    pays: [pay('پ-1002', 'abc-12')],
    by: 'کارشناس',
    appr: 'مدیر',
    log: [],
  });
  assert.throws(() => validateState(raw), /شماره پیگیری/);
});

test('rejects a contract whose customer does not exist', () => {
  const raw = base();
  raw.contracts.push({
    id: 'cont0001',
    no: 'ق-1001',
    type: 'lease',
    cust: 'missing1',
    proj: 'proj0001',
    unit: 'unit0001',
    date: '1404/01/15',
    total: 10,
    dur: '12',
    inst: [],
  });
  assert.throws(() => validateState(raw), /مشتری ناموجود/);
});

test('accepts lease contract document fields and lump installment kind', () => {
  const raw = base();
  raw.projects[0].units[0].st = 'sold';
  raw.contracts.push({
    id: 'cont0002',
    no: 'ق-1002',
    type: 'lease',
    cust: 'cust0001',
    proj: 'proj0001',
    unit: 'unit0001',
    date: '1405/08/05',
    total: 10780000000,
    dur: '36',
    note: '',
    inst: [
      { id: 'inst0002', title: 'قسط ۱', amt: 20000000, date: '1405/08/10', paid: false, pdate: '', ref: '' },
      { id: 'inst0003', title: 'الباقی نقدی', amt: 9700000000, date: '1408/06/05', paid: false, pdate: '', ref: '', kind: 'lump' },
    ],
    doc: {
      title: 'خانم',
      birth: '',
      loc: 'اصفهان- کوی پرتو- مجتمع بام پرتو',
      area: '145',
      floor: 'ششم',
      unitNo: '602',
      start: '1405/08/05',
      end: '1408/08/05',
      handDate: '1405/08/05',
      qarzTotal: 2000000000,
      qarzPays: [{ id: 'q1', amt: 100000000, date: '1405/03/13', bank: 'صادرات', ref: '140503130191024137' }],
      coolDays: 'سی روز',
    },
  });
  const data = validateState(raw);
  assert.equal(data.contracts[0].doc.title, 'خانم');
  assert.equal(data.contracts[0].doc.qarzPays.length, 1);
  assert.equal(data.contracts[0].inst[1].kind, 'lump');
});

test('accepts invest contract document fields', () => {
  const raw = base();
  raw.projects[0].units[0].st = 'sold';
  raw.contracts.push({
    id: 'cont0003',
    no: 'ق-1003',
    type: 'invest',
    cust: 'cust0001',
    proj: 'proj0001',
    unit: 'unit0001',
    date: '1405/05/19',
    total: 5000000000,
    dur: '24',
    note: '',
    inst: [
      { id: 'inst0004', title: 'واریز', amt: 100000000, date: '1405/05/19', paid: true, pdate: '1405/05/19', ref: '140505190161821409' },
      { id: 'inst0005', title: 'قسط ۱', amt: 20000000, date: '1405/06/10', paid: false, pdate: '', ref: '' },
      { id: 'inst0006', title: 'الباقی نقدی', amt: 1000000000, date: '1406/12/01', paid: false, pdate: '', ref: '', kind: 'lump' },
    ],
    doc: {
      title: 'خانم',
      postal: '8131111111',
      landAddr: 'اصفهان- خیابان چهارباغ بالا',
      block: 'A',
      chequeNo: '19/05/1405- 1003/1405/الف',
      delayFineDaily: 150000,
      delayExtraDays: 'پانزده',
    },
  });
  const data = validateState(raw);
  assert.equal(data.contracts[0].doc.postal, '8131111111');
  assert.equal(data.contracts[0].doc.block, 'A');
  assert.equal(data.contracts[0].doc.delayFineDaily, 150000);
});

test('accepts accounting parties and ledger rows', () => {
  const raw = base();
  raw.parties = [{
    id: 'party001',
    name: 'پیمانکار نمونه',
    kind: 'contractor',
    title: 'نقاش',
    phone: '09131112233',
    nid: '',
    custId: '',
    note: '',
  }];
  raw.ledger = [{
    id: 'ledg0001',
    party: 'party001',
    date: '1405/08/01',
    type: 'out',
    amt: 5000000,
    desc: 'پیش‌پرداخت قرارداد نقاشی',
    ref: 'ACC-1',
    by: 'حسابدار',
  }, {
    id: 'ledg0002',
    party: 'party001',
    date: '1405/08/10',
    type: 'in',
    amt: 1000000,
    desc: 'عودت بخشی از وجه',
    ref: '',
    by: 'حسابدار',
  }];
  const data = validateState(raw);
  assert.equal(data.parties.length, 1);
  assert.equal(data.ledger.length, 2);
  assert.equal(data.ledger[0].type, 'out');
  assert.equal(data.ledger[1].amt, 1000000);
});

test('accepts accounting checks linked to ledger', () => {
  const raw = base();
  raw.parties = [{
    id: 'party002',
    name: 'مشتری چک',
    kind: 'cust',
    title: '',
    phone: '09120001122',
    nid: '',
    custId: '',
    note: '',
  }];
  raw.checks = [{
    id: 'chk00001',
    type: 'in',
    party: 'party002',
    amt: 25000000,
    checkDate: '1405/07/01',
    dueDate: '1405/09/01',
    regDate: '1405/07/05',
    bank: 'ملی',
    branch: 'چهارباغ',
    sayad: '1234567890123456',
    serial: 'A-100',
    accountNo: '010203',
    holder: 'مشتری چک',
    status: 'pending',
    desc: 'بابت قسط',
    note: '',
    by: 'حسابدار',
    ledgerId: 'ledg0003',
  }];
  raw.ledger = [{
    id: 'ledg0003',
    party: 'party002',
    date: '1405/07/05',
    type: 'in',
    amt: 25000000,
    desc: 'چک دریافتی · بانک ملی',
    ref: '1234567890123456',
    by: 'حسابدار',
    source: 'check',
    checkId: 'chk00001',
  }];
  const data = validateState(raw);
  assert.equal(data.checks.length, 1);
  assert.equal(data.checks[0].sayad, '1234567890123456');
  assert.equal(data.ledger[0].source, 'check');
  assert.equal(data.ledger[0].checkId, 'chk00001');
});

test('accepts late fee fields on contract and installments', () => {
  const raw = base();
  raw.projects[0].units[0].st = 'sold';
  raw.contracts.push({
    id: 'cont0004',
    no: 'ق-1004',
    type: 'lease',
    cust: 'cust0001',
    proj: 'proj0001',
    unit: 'unit0001',
    date: '1405/01/10',
    total: 120000000,
    dur: '12',
    note: '',
    latePctDaily: 0.5,
    inst: [
      {
        id: 'inst0010',
        title: 'پیش‌پرداخت',
        amt: 20000000,
        date: '1405/01/10',
        paid: true,
        pdate: '1405/01/09',
        ref: 'DOWN-1',
        lateDays: 0,
        lateCalc: 0,
        lateFee: 0,
        lateNote: '',
      },
      {
        id: 'inst0011',
        title: 'قسط ۱',
        amt: 10000000,
        date: '1405/02/10',
        paid: true,
        pdate: '1405/02/15',
        ref: 'PAY-LATE-1',
        latePctDaily: 1,
        lateDays: 5,
        lateCalc: 500000,
        lateFee: 200000,
        lateNote: 'بخشی از جریمه بخشیده شد',
      },
      {
        id: 'inst0012',
        title: 'قسط ۲',
        amt: 90000000,
        date: '1405/03/10',
        paid: false,
        pdate: '',
        ref: '',
      },
    ],
  });
  const data = validateState(raw);
  assert.equal(data.contracts[0].latePctDaily, 0.5);
  assert.equal(data.contracts[0].inst[0].pdate, '1405/01/09');
  assert.equal(data.contracts[0].inst[1].latePctDaily, 1);
  assert.equal(data.contracts[0].inst[1].lateDays, 5);
  assert.equal(data.contracts[0].inst[1].lateCalc, 500000);
  assert.equal(data.contracts[0].inst[1].lateFee, 200000);
  assert.match(data.contracts[0].inst[1].lateNote, /بخشیده/);
});

test('accepts dual unit prices and installment pricing fields', () => {
  const raw = base();
  Object.assign(raw.projects[0].units[0], {
    ppmRaw: 900000,
    totalRaw: 72000000,
    ppm: 1000000,
    total: 80000000,
  });
  raw.projects[0].units[0].st = 'sold';
  raw.contracts.push({
    id: 'cont0099',
    no: 'ق-1099',
    type: 'lease',
    cust: 'cust0001',
    proj: 'proj0001',
    unit: 'unit0001',
    date: '1405/01/01',
    total: 126496000,
    baseTotal: 80000000,
    extraOn: true,
    extraPct: 27,
    extraAmt: 21600000,
    profitOn: true,
    profitPct: 24,
    profitAmt: 24896000,
    dur: '24',
    note: '',
    inst: [],
  });
  const data = validateState(raw);
  const u = data.projects[0].units[0];
  assert.equal(u.ppmRaw, 900000);
  assert.equal(u.totalRaw, 72000000);
  assert.equal(data.contracts[0].extraOn, true);
  assert.equal(data.contracts[0].profitPct, 24);
  assert.equal(data.contracts[0].baseTotal, 80000000);
});

test('rejects duplicate customer phone', () => {
  const raw = base();
  raw.customers.push({
    id: 'cust0002',
    name: 'رضا محمدی',
    father: 'علی',
    nid: '0013542420',
    bc: '2',
    phone: '09121234567',
    addr: 'تهران',
  });
  assert.throws(() => validateState(raw), /شماره تماس.*تکراری/);
});

test('rejects duplicate customer national id', () => {
  const raw = base();
  raw.customers.push({
    id: 'cust0003',
    name: 'سارا احمدی',
    father: 'رضا',
    nid: '0013542419',
    bc: '3',
    phone: '09129876543',
    addr: 'تهران',
  });
  assert.throws(() => validateState(raw), /کد ملی.*تکراری/);
});

test('allows converted lead to keep the same phone as its customer', () => {
  const raw = base();
  raw.leads.push({
    id: 'lead0001',
    name: 'علی رضایی',
    phone: '09121234567',
    src: 'تلفن',
    proj: '',
    stage: 8,
    rep: '',
    next: '',
    loan: 'no',
    note: '',
    cust: 'cust0001',
    h: [],
  });
  const data = validateState(raw);
  assert.equal(data.leads[0].cust, 'cust0001');
  assert.equal(data.leads[0].phone, '09121234567');
});

test('rejects duplicate open lead phones', () => {
  const raw = base();
  raw.leads.push({
    id: 'lead0002',
    name: 'سرنخ ۱',
    phone: '09120001122',
    src: 'تلفن',
    proj: '',
    stage: 0,
    rep: '',
    next: '',
    loan: 'no',
    note: '',
    cust: '',
    h: [],
  });
  raw.leads.push({
    id: 'lead0003',
    name: 'سرنخ ۲',
    phone: '09120001122',
    src: 'تلفن',
    proj: '',
    stage: 1,
    rep: '',
    next: '',
    loan: 'no',
    note: '',
    cust: '',
    h: [],
  });
  assert.throws(() => validateState(raw), /شماره تماس.*تکراری/);
});

test('rejects duplicate ledger payment reference against reservation', () => {
  const raw = base();
  raw.projects[0].units[0].st = 'res';
  raw.reservations.push({
    id: 'resv0099',
    no: 'ر-1099',
    cust: 'cust0001',
    proj: 'proj0001',
    unit: 'unit0001',
    need: 5000,
    fine: 1000,
    deadline: '1404/03/01',
    date: '1404/02/01',
    st: 'active',
    pays: [{
      id: 'پ-1099', amt: 1000, date: '1404/02/01', ref: 'LEDGER-DUP-1', acct: '6037',
      payer: 'علی رضایی', tp: false, rel: '', appv: '', s: 'ok',
    }],
    by: 'کارشناس',
    appr: 'مدیر',
    log: [],
  });
  raw.parties = [{
    id: 'party0099', name: 'علی رضایی', kind: 'cust', title: '', phone: '09121234567',
    nid: '0013542419', custId: 'cust0001', note: '',
  }];
  raw.ledger = [{
    id: 'led0099', party: 'party0099', date: '1404/02/02', type: 'in', amt: 500,
    desc: 'تست', ref: 'ledger-dup-1', by: 'حسابدار', source: 'manual', checkId: '',
  }];
  assert.throws(() => validateState(raw), /شماره پیگیری.*تکراری/);
});
