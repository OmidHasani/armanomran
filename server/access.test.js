import assert from 'node:assert/strict';
import test from 'node:test';
import { canAct, resolveDashKind } from './perms.js';
import { mergeState, scopedState } from './state-access.js';

function crm() {
  return {
    projects: [{
      id: 'p1', name: 'برج', addr: '', units: [{
        id: 'u1', no: '1', area: 80, st: 'free', floor: '1', block: '', kind: 'مسکونی',
        total: 500, ppm: 10, totalRaw: 400, ppmRaw: 8,
      }],
    }],
    customers: [{ id: 'c1', name: 'علی', phone: '09120000000', nid: '0013542419' }],
    contracts: [{
      id: 'k1', no: 'ق-1', type: 'invest', cust: 'c1', proj: 'p1', unit: 'u1',
      date: '1404/01/01', total: 1000,
      inst: [{ id: 'i1', title: 'قسط', amt: 1000, date: '1404/02/01', paid: false, pdate: '', ref: '', parts: [] }],
    }],
    reservations: [],
    leads: [{ id: 'l1', name: 'سرنخ', stage: 1 }],
    parties: [],
    ledger: [{ id: 'g1', amt: 10 }],
    checks: [],
    cfg: { accounts: [{ id: 'a', holder: 'بانک' }], drafts: [{ id: 'd' }], fine: 1, days: 20 },
  };
}

const legal = { role: 'legal', perms: ['dash', 'cust', 'cont', 'legal', 'inbox'], dashKind: '', $locals: { unitPerms: [] } };
const clerk = { role: 'staff', perms: ['dash', 'cust', 'cont', 'cont_add', 'cont_edit'], dashKind: 'contracts', $locals: { unitPerms: [] } };
const payer = { role: 'staff', perms: ['cont', 'pay_add'], dashKind: 'manage', $locals: { unitPerms: [] } };

function submit(user, mutate) {
  const prior = crm();
  const body = structuredClone(scopedState(user, prior));
  mutate(body);
  return { prior, body };
}

test('legal desk resolves from role and can be overridden', () => {
  assert.equal(resolveDashKind(legal), 'legal');
  assert.equal(resolveDashKind({ ...legal, dashKind: 'manage' }), 'manage');
  assert.equal(resolveDashKind({ role: 'staff', perms: ['dash'], dashKind: '', $locals: { dashKind: 'contracts' } }), 'contracts');
  assert.equal(canAct(legal, 'pay_add'), false);
  assert.equal(canAct(legal, 'cont_edit'), false);
  assert.equal(canAct({ role: 'staff', perms: ['cont', 'write'] }, 'pay_add'), true);
  assert.equal(canAct(clerk, 'cont_add'), true);
  assert.equal(canAct(clerk, 'pay_add'), false);
});

test('legal state hides sales inventory, revenue sources and bank accounts', () => {
  const view = scopedState(legal, crm());
  assert.equal(view.contracts.length, 1);
  assert.equal(view.projects[0].units[0].total, undefined);
  assert.equal(view.projects[0].units[0].st, undefined);
  assert.equal(view.projects[0].units[0].no, '1');
  assert.deepEqual(view.reservations, []);
  assert.deepEqual(view.leads, []);
  assert.deepEqual(view.ledger, []);
  assert.deepEqual(view.cfg.accounts, []);
  assert.deepEqual(view.cfg.drafts, []);
});

test('legal user cannot change a contract or mark a payment', () => {
  const edited = submit(legal, (body) => { body.contracts[0].total = 5; });
  assert.throws(() => mergeState(legal, edited.body, edited.prior), /ویرایش قرارداد/);
  const paid = submit(legal, (body) => { body.contracts[0].inst[0].paid = true; });
  const kept = mergeState(legal, paid.body, paid.prior);
  assert.equal(kept.contracts[0].inst[0].paid, false);
  assert.equal(kept.leads.length, 1);
});

test('contract desk can edit terms but not record a payment', () => {
  const edited = submit(clerk, (body) => { body.contracts[0].total = 2500; });
  const saved = mergeState(clerk, edited.body, edited.prior);
  assert.equal(saved.contracts[0].total, 2500);
  const paid = submit(clerk, (body) => {
    body.contracts[0].inst[0].paid = true;
    body.contracts[0].inst[0].parts = [{ amt: 1000, ref: '1' }];
  });
  assert.throws(() => mergeState(clerk, paid.body, paid.prior), /پرداخت/);
  const created = submit(clerk, (body) => {
    body.contracts.push({
      id: 'k2', no: 'ق-2', type: 'invest', cust: 'c1', proj: 'p1', unit: 'u1', date: '1404/03/01', total: 800,
      inst: [{ id: 'i2', title: 'پیش', amt: 800, date: '1404/03/01', paid: true, parts: [{ amt: 800 }], pdate: '1404/03/01', ref: '9' }],
    });
  });
  const next = mergeState(clerk, created.body, created.prior);
  const added = next.contracts.find((c) => c.id === 'k2');
  assert.equal(added.inst[0].paid, false);
  assert.deepEqual(added.inst[0].parts, []);
  assert.equal(next.projects[0].units[0].total, 500);
});

test('payment permission appends a receipt without changing the contract amount', () => {
  const bumped = submit(payer, (body) => { body.contracts[0].total = 9; });
  assert.throws(() => mergeState(payer, bumped.body, bumped.prior), /ویرایش قرارداد/);
  const paid = submit(payer, (body) => { body.contracts[0].inst[0].parts = [{ amt: 400, ref: '22' }]; });
  const saved = mergeState(payer, paid.body, paid.prior);
  assert.equal(saved.contracts[0].total, 1000);
  assert.equal(saved.contracts[0].inst[0].parts.length, 1);
  const again = structuredClone(scopedState(payer, saved));
  again.contracts[0].inst[0].parts = [{ amt: 400, ref: '22' }, { amt: 100, ref: '23' }];
  const more = mergeState(payer, again, saved);
  assert.equal(more.contracts[0].inst[0].parts[0].ref, '22');
  const altered = structuredClone(scopedState(payer, saved));
  altered.contracts[0].inst[0].parts = [{ amt: 1, ref: '22' }];
  assert.throws(() => mergeState(payer, altered, saved), /ویرایش واریز/);
});
