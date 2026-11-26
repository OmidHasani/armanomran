import assert from 'node:assert/strict';
import test from 'node:test';
import { ROLE_DEFAULTS, canSaveState } from './perms.js';
import { mergeState, scopedState } from './state-access.js';
import { validateState } from './validate.js';

function priorState() {
  return validateState({
    projects: [{
      id: 'proj0001', name: 'برج آسمان', addr: 'تهران', note: '',
      units: [
        { id: 'unit0001', no: '12', floor: '3', kind: 'مسکونی', area: 80, ppm: 1000000, total: 80000000, st: 'free' },
        { id: 'unit0002', no: '13', floor: '3', kind: 'مسکونی', area: 70, ppm: 900000, total: 63000000, st: 'free' },
      ],
    }],
    customers: [{
      id: 'cust0001', name: 'علی رضایی', father: 'حسن', nid: '0013542419', bc: '123', phone: '09121234567', addr: 'تهران',
    }],
    contracts: [],
    reservations: [],
    leads: [{ id: 'lead0001', name: 'سرنخ', phone: '09120000000', src: 'تماس', stage: 1, loan: 'no', h: [] }],
    parties: [],
    ledger: [],
    checks: [],
    cfg: { accounts: [{ id: 'bank0001', bank: 'ملت', holder: 'آرمان', iban: '', card: '', number: '100', branch: '' }], drafts: [], fine: 1, days: 20 },
    me: '', pn: 1000, cn: 1000, rn: 1000,
  });
}

const staff = { role: 'staff', perms: ROLE_DEFAULTS.staff, dashKind: 'manage', $locals: { unitPerms: [] } };
const clerk = { role: 'staff', perms: ['dash', 'cust', 'cont', 'cont_add', 'cont_edit'], dashKind: 'contracts', $locals: { unitPerms: [] } };
const payer = { role: 'staff', perms: ['dash', 'cont', 'pay_add'], dashKind: 'manage', $locals: { unitPerms: [] } };
const reader = { role: 'legal', perms: ['dash', 'cust', 'cont', 'legal', 'inbox'], dashKind: 'legal', $locals: { unitPerms: [] } };

function commit(user, prior, mutate) {
  const body = structuredClone(scopedState(user, prior));
  mutate(body);
  return validateState(mergeState(user, body, prior));
}

const contract = (id, unit, extra = {}) => ({
  id, no: 'ق-' + id.slice(-4), type: 'invest', cust: 'cust0001', proj: 'proj0001', unit,
  date: '1404/01/15', total: 80000000, note: '',
  inst: [{ id: 'inst' + id.slice(-4), title: 'پیش‌پرداخت', amt: 80000000, date: '1404/01/15', paid: false, pdate: '', ref: '' }],
  ...extra,
});

test('save permission follows contract, payment and other write actions', () => {
  assert.equal(canSaveState(staff), true);
  assert.equal(canSaveState(clerk), true);
  assert.equal(canSaveState(payer), true);
  assert.equal(canSaveState(reader), false);
  assert.equal(canSaveState({ role: 'staff', perms: ['brief'], $locals: { unitPerms: [] } }), false);
});

test('staff can register a contract, record a payment, edit both, and free the unit on delete', () => {
  const prior = priorState();
  const created = commit(staff, prior, (body) => {
    body.contracts.push(contract('cont0001', 'unit0001', {
      note: 'ثبت اولیه',
      inst: [{
        id: 'inst0001', title: 'پیش‌پرداخت', amt: 80000000, date: '1404/01/15', paid: true, pdate: '1404/01/20', ref: '',
        parts: [{ id: 'part0001', amt: 80000000, date: '1404/01/20', ref: '445566', owner: 'cust0001', name: 'علی رضایی', fee: 0, note: '' }],
      }],
    }));
    body.customers[0].phone = '09123334455';
    body.projects[0].units[0].ppm = 1100000;
  });
  assert.equal(created.projects[0].units[0].st, 'sold');
  assert.equal(created.projects[0].units[0].ppm, 1100000);
  assert.equal(created.customers[0].phone, '09123334455');
  assert.equal(created.contracts[0].note, 'ثبت اولیه');
  assert.equal(created.contracts[0].inst[0].paid, true);
  assert.equal(created.contracts[0].inst[0].parts[0].ref, '445566');
  assert.equal(created.leads.length, 1);

  const edited = commit(staff, created, (body) => {
    body.contracts[0].note = 'اصلاح شد';
    body.contracts[0].total = 81000000;
    body.contracts[0].inst[0].parts[0].amt = 81000000;
    body.contracts[0].inst[0].amt = 81000000;
  });
  assert.equal(edited.contracts[0].note, 'اصلاح شد');
  assert.equal(edited.contracts[0].total, 81000000);
  assert.equal(edited.contracts[0].inst[0].parts[0].amt, 81000000);
  assert.equal(edited.projects[0].units[0].st, 'sold');

  const removed = commit(staff, edited, (body) => {
    body.contracts = [];
  });
  assert.equal(removed.contracts.length, 0);
  assert.equal(removed.projects[0].units[0].st, 'free');
  assert.equal(removed.customers[0].phone, '09123334455');
});

test('contract desk can register and edit a contract without changing project prices or recording a payment', () => {
  const prior = priorState();
  assert.equal(scopedState(clerk, prior).projects[0].units[0].total, 80000000);
  assert.equal(scopedState(reader, prior).projects[0].units[0].total, undefined);
  const created = commit(clerk, prior, (body) => {
    body.contracts.push(contract('cont0002', 'unit0001', {
      inst: [{ id: 'inst0002', title: 'پیش‌پرداخت', amt: 80000000, date: '1404/01/15', paid: true, pdate: '1404/01/20', ref: '999', parts: [{ id: 'part0002', amt: 80000000, date: '1404/01/20', ref: '999', owner: 'cust0001', name: 'علی', fee: 0, note: '' }] }],
    }));
    const unit = body.projects[0].units.find((item) => item.id === 'unit0001');
    if (unit) unit.total = 1;
  });
  assert.equal(created.contracts[0].total, 80000000);
  assert.equal(created.contracts[0].inst[0].paid, false);
  assert.deepEqual(created.contracts[0].inst[0].parts, []);
  assert.equal(created.projects[0].units[0].st, 'sold');
  assert.equal(created.projects[0].units[0].total, 80000000);
  assert.equal(created.leads[0].name, 'سرنخ');

  const edited = commit(clerk, created, (body) => { body.contracts[0].note = 'اصلاح کارشناس قرارداد'; });
  assert.equal(edited.contracts[0].note, 'اصلاح کارشناس قرارداد');
  assert.throws(() => commit(clerk, created, (body) => { body.contracts[0].inst[0].paid = true; }), /پرداخت/);
});

test('payment access records a receipt and leaves the contract amount unchanged', () => {
  const prior = commit(staff, priorState(), (body) => {
    body.contracts.push(contract('cont0003', 'unit0002'));
  });
  assert.equal(prior.projects[0].units[1].st, 'sold');
  const paid = commit(payer, prior, (body) => {
    body.contracts[0].inst[0].parts = [{ id: 'part0003', amt: 25000000, date: '1404/02/01', ref: '7788', owner: 'cust0001', name: 'علی رضایی', fee: 0, note: 'علی‌الحساب' }];
  });
  assert.equal(paid.contracts[0].total, 80000000);
  assert.equal(paid.contracts[0].inst[0].parts.length, 1);
  assert.equal(paid.contracts[0].inst[0].paid, false);
  assert.equal(paid.projects[0].units[1].total, 63000000);
  assert.throws(() => commit(payer, prior, (body) => { body.contracts[0].total = 1; }), /ویرایش قرارداد/);
});
