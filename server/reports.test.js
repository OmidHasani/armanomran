import assert from 'node:assert/strict';
import test from 'node:test';
import { PERM_DEFS, ROLE_DEFAULTS, hasPerm } from './perms.js';
import {
  canReadReport,
  presetAgainst,
  readAudience,
  readReportInput,
  revisionOf,
  sameAuthor,
  shareLabel,
  userHasBrief,
  visibleFilter,
} from './reports.js';

test('report writing is opt-in and separate from full edit', () => {
  assert.equal(PERM_DEFS.some((item) => item.k === 'brief' && item.g === 'view'), true);
  assert.equal(ROLE_DEFAULTS.staff.includes('brief'), false);
  assert.equal(ROLE_DEFAULTS.legal.includes('brief'), false);
  assert.equal(ROLE_DEFAULTS.admin.includes('brief'), true);
  assert.equal(hasPerm({ role: 'staff', perms: ROLE_DEFAULTS.staff, $locals: { unitPerms: [] } }, 'brief'), false);
  assert.equal(hasPerm({ role: 'staff', perms: ['brief'], $locals: { unitPerms: [] } }, 'brief'), true);
});

test('only the author can edit a report, including when the other user is an admin', () => {
  const report = { authorId: 'author-1', title: 'عنوان', body: 'متن اول' };
  assert.equal(sameAuthor({ _id: 'author-1', role: 'staff' }, report), true);
  assert.equal(sameAuthor({ _id: { toString: () => 'author-1' }, role: 'admin' }, report), true);
  assert.equal(sameAuthor({ _id: 'someone-else', role: 'admin' }, report), false);
  assert.equal(sameAuthor({ _id: 'someone-else', role: 'staff', perms: ['brief', 'write', 'admin'] }, report), false);
});

test('an edit keeps the exact previous title and body with its time', () => {
  const at = new Date('2026-11-26T05:24:00.000Z');
  const revision = revisionOf(
    { title: 'گزارش اول', body: 'متن قبلی\nخط دوم' },
    { title: 'گزارش اصلاح‌شده', body: 'متن جدید' },
    at,
  );
  assert.equal(revision.previousTitle, 'گزارش اول');
  assert.equal(revision.previousBody, 'متن قبلی\nخط دوم');
  assert.equal(revision.nextTitle, 'گزارش اصلاح‌شده');
  assert.equal(revision.nextBody, 'متن جدید');
  assert.equal(revision.at, at);
});

const directory = [
  { id: 'sales', name: 'فروش', users: [{ id: 'u1', name: 'علی' }, { id: 'u2', name: 'سارا' }] },
  { id: 'legal', name: 'حقوقی', users: [{ id: 'u3', name: 'مریم' }] },
];

test('private reports stay with the author, even for an admin outside the audience', () => {
  const report = { authorId: 'me', visibility: 'private', audienceScope: 'units', audienceUnits: [{ id: 'sales', everyone: true, userIds: [] }] };
  assert.equal(canReadReport({ _id: 'me', unitIds: [] }, report), true);
  assert.equal(canReadReport({ _id: 'other', role: 'admin', unitIds: ['sales'] }, report), false);
});

test('a public report for selected units reaches only those units and people', () => {
  const picked = {
    visibility: 'public',
    audienceScope: 'units',
    audienceUnits: [
      { id: 'sales', everyone: false, userIds: ['u1'] },
      { id: 'legal', everyone: false, userIds: ['u3'] },
    ],
  };
  assert.equal(canReadReport({ _id: 'u1', unitIds: ['sales'] }, picked), true);
  assert.equal(canReadReport({ _id: 'u1', unitIds: ['legal'] }, picked), false);
  assert.equal(canReadReport({ _id: 'u2', unitIds: ['sales'] }, picked), false);
  assert.equal(canReadReport({ _id: 'u3', unitIds: ['legal'] }, picked), true);
  assert.equal(canReadReport({ _id: 'u9', unitIds: ['sales', 'legal'] }, picked), false);

  const mixed = {
    visibility: 'public',
    audienceScope: 'units',
    audienceUnits: [
      { id: 'sales', everyone: true, userIds: [] },
      { id: 'legal', everyone: false, userIds: ['u3'] },
    ],
  };
  assert.equal(canReadReport({ _id: 'u2', unitIds: ['sales'] }, mixed), true);
  assert.equal(canReadReport({ _id: 'u2', unitIds: ['legal'] }, mixed), false);
  assert.equal(canReadReport({ _id: 'u3', unitIds: ['legal'] }, mixed), true);
  assert.equal(canReadReport({ _id: 'outsider', unitIds: [] }, mixed), false);
});

test('older reports without an audience stay visible to anyone with the section', () => {
  assert.equal(canReadReport({ _id: 'any', unitIds: [] }, { authorId: 'me', title: 'قدیمی' }), true);
  assert.equal(canReadReport({ _id: 'any', unitIds: ['sales'] }, { authorId: 'me', visibility: 'public', audienceScope: 'all' }), true);
});

test('publish choice is exact and the next visit keeps the same units', () => {
  assert.throws(() => readAudience({}, directory), /نوع انتشار/);
  assert.throws(() => readAudience({ visibility: 'public', audienceScope: 'units', audienceUnits: [] }, directory), /حداقل یک واحد/);
  assert.throws(() => readAudience({
    visibility: 'public',
    audienceScope: 'units',
    audienceUnits: [{ id: 'sales', userIds: ['nope'] }],
  }, directory), /عضو این واحد نیست/);

  const shared = readAudience({
    visibility: 'public',
    audienceScope: 'units',
    audienceUnits: [
      { id: 'sales', userIds: [] },
      { id: 'legal', userIds: ['u3'] },
    ],
  }, directory);
  assert.deepEqual(shared.audienceUnits, [
    { id: 'sales', everyone: true, userIds: [] },
    { id: 'legal', everyone: false, userIds: ['u3'] },
  ]);

  const kept = readAudience({
    visibility: 'private',
    audienceScope: 'units',
    audienceUnits: [{ id: 'sales', userIds: ['u1'] }, { id: 'missing', userIds: ['u1'] }],
  }, directory);
  assert.equal(kept.visibility, 'private');
  assert.deepEqual(kept.audienceUnits, []);
  assert.deepEqual(kept.preset, {
    mode: 'private',
    scope: 'units',
    units: [{ id: 'sales', everyone: false, userIds: ['u1'] }],
  });
  assert.deepEqual(presetAgainst(kept.preset, directory).units, kept.preset.units);
  assert.deepEqual(presetAgainst({
    mode: 'public',
    scope: 'units',
    units: [
      { id: 'sales', everyone: false, userIds: ['u1', 'gone'] },
      { id: 'old', everyone: true, userIds: [] },
    ],
  }, directory).units, [{ id: 'sales', everyone: false, userIds: ['u1'] }]);
});

test('audience label names the units and the chosen people', () => {
  const names = { sales: 'فروش', legal: 'حقوقی' };
  const people = { u1: 'علی', u3: 'مریم' };
  assert.equal(shareLabel({ visibility: 'private' }), 'خصوصی');
  assert.equal(shareLabel({ visibility: 'public', audienceScope: 'all' }), 'عمومی · همه');
  assert.equal(shareLabel({
    visibility: 'public',
    audienceScope: 'units',
    audienceUnits: [
      { id: 'sales', everyone: true, userIds: [] },
      { id: 'legal', everyone: false, userIds: ['u3'] },
    ],
  }, (id) => names[id], (id) => people[id]), 'عمومی · فروش · حقوقی (مریم)');
});

test('report writing access includes a unit grant and excludes inactive users', () => {
  const perms = new Map([['sales', ['brief']], ['legal', []]]);
  assert.equal(userHasBrief({ role: 'staff', perms: [], unitIds: ['sales'], active: true }, perms), true);
  assert.equal(userHasBrief({ role: 'staff', perms: [], unitIds: ['legal'], active: true }, perms), false);
  assert.equal(userHasBrief({ role: 'staff', perms: ['brief'], unitIds: [], active: true }, perms), true);
  assert.equal(userHasBrief({ role: 'admin', perms: [], unitIds: [], active: true }, perms), true);
  assert.equal(userHasBrief({ role: 'staff', perms: ['brief'], unitIds: ['sales'], active: false }, perms), false);
});

test('the report query does not treat a user picked in one unit as a member of every targeted unit', () => {
  const filter = visibleFilter({ _id: 'u1', unitIds: ['sales', 'sales'] });
  const packed = JSON.stringify(filter);
  assert.match(packed, /"authorId":"u1"/);
  assert.match(packed, /\$elemMatch/);
  assert.match(packed, /"everyone":true/);
  assert.match(packed, /"userIds":"u1"/);
  assert.match(packed, /sales/);
  assert.equal(packed.includes('"audienceUserIds"'), false);
});

test('report text is required and bounded', () => {
  const ok = readReportInput({ title: '  گزارش هفته  ', body: '  انجام شد  ' });
  assert.deepEqual(ok, { title: 'گزارش هفته', body: 'انجام شد' });
  assert.throws(() => readReportInput({ title: 'ا', body: 'متن' }), /عنوان گزارش/);
  assert.throws(() => readReportInput({ title: 'عنوان', body: '   ' }), /متن گزارش/);
  assert.throws(() => readReportInput({ title: 'عنوان', body: 'م'.repeat(20001) }), /متن گزارش/);
});
