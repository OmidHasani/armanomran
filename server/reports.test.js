import assert from 'node:assert/strict';
import test from 'node:test';
import { PERM_DEFS, ROLE_DEFAULTS, hasPerm } from './perms.js';
import { readReportInput, revisionOf, sameAuthor } from './reports.js';

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

test('report text is required and bounded', () => {
  const ok = readReportInput({ title: '  گزارش هفته  ', body: '  انجام شد  ' });
  assert.deepEqual(ok, { title: 'گزارش هفته', body: 'انجام شد' });
  assert.throws(() => readReportInput({ title: 'ا', body: 'متن' }), /عنوان گزارش/);
  assert.throws(() => readReportInput({ title: 'عنوان', body: '   ' }), /متن گزارش/);
  assert.throws(() => readReportInput({ title: 'عنوان', body: 'م'.repeat(20001) }), /متن گزارش/);
});
