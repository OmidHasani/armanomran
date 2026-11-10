/* Admin console — /admin */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const ROLE_LABEL = { admin: 'مدیر', staff: 'کارشناس فروش', legal: 'واحد حقوقی' };
const PERM_DEFS = [
  { k: 'dash', l: 'داشبورد' },
  { k: 'lead', l: 'سرنخ‌ها' },
  { k: 'proj', l: 'پروژه‌ها' },
  { k: 'cust', l: 'مشتریان' },
  { k: 'cont', l: 'قراردادها' },
  { k: 'res', l: 'رزروها' },
  { k: 'acct', l: 'حسابداری' },
  { k: 'rep', l: 'گزارش‌ها' },
  { k: 'legal', l: 'حقوقی' },
  { k: 'inbox', l: 'صندوق ارجاعات' },
  { k: 'write', l: 'ویرایش CRM' },
  { k: 'admin', l: 'مدیریت سیستم' },
];
const ROLE_DEFAULTS = {
  admin: PERM_DEFS.map((p) => p.k),
  staff: ['dash', 'lead', 'proj', 'cust', 'cont', 'res', 'acct', 'rep', 'write', 'inbox'],
  legal: ['dash', 'cust', 'cont', 'legal', 'inbox'],
};

const NAV = [
  { id: 'overview', label: 'نمای کلی', eyebrow: 'خلاصه وضعیت' },
  { id: 'users', label: 'کاربران', eyebrow: 'حساب‌ها و دسترسی‌ها' },
  { id: 'units', label: 'واحدهای سازمانی', eyebrow: 'ساختار ارجاع' },
  { id: 'settings', label: 'تنظیمات', eyebrow: 'قوانین خودکار' },
];

const state = {
  me: null,
  users: [],
  units: [],
  settings: { legalDays: 7, days: 20, fine: 30000000, autoLegal: true },
  tab: 'overview',
  qUsers: '',
  qUnits: '',
};

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
function fa(n) {
  try { return Number(n || 0).toLocaleString('fa-IR'); } catch { return String(n || 0); }
}
function money(n) {
  return fa(Math.round(Number(n) || 0));
}
function parseMoney(s) {
  return Number(String(s || '').replace(/[^\d.-]/g, '')) || 0;
}
function unitName(id) {
  return state.units.find((u) => u.id === id)?.name || '—';
}
function permLabel(k) {
  return PERM_DEFS.find((p) => p.k === k)?.l || k;
}
function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  el.classList.add('open');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    el.classList.remove('open');
    el.hidden = true;
  }, 2800);
}
function closeModal() {
  const m = $('#modal');
  if (!m) return;
  m.classList.remove('open');
  m.hidden = true;
  m.innerHTML = '';
  document.body.style.overflow = '';
}
function openModal(html) {
  const m = $('#modal');
  if (!m) return;
  m.innerHTML = html;
  m.hidden = false;
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
  m.onclick = (e) => { if (e.target === m) closeModal(); };
}

async function api(url, opts = {}) {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (res.status === 401) {
    const err = new Error('auth');
    throw err;
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'خطا در ارتباط با سرور');
  return body;
}

function hasAdmin(user) {
  return user && (user.role === 'admin' || (user.perms || []).includes('admin'));
}

async function loadAll() {
  const [users, units, settings] = await Promise.all([
    api('/api/users'),
    api('/api/units/all'),
    api('/api/admin/settings'),
  ]);
  state.users = users;
  state.units = units;
  state.settings = settings;
}

function hideBoot() {
  const boot = $('#boot');
  if (boot) { boot.hidden = true; boot.classList.add('done'); }
}

function showLogin(msg) {
  hideBoot();
  closeModal();
  const shell = $('#shell');
  const login = $('#login');
  if (shell) shell.hidden = true;
  if (login) login.hidden = false;
  const err = $('#loginErr');
  if (err) {
    if (msg) { err.hidden = false; err.textContent = msg; }
    else err.hidden = true;
  }
}

function showShell() {
  hideBoot();
  closeModal();
  const login = $('#login');
  const shell = $('#shell');
  if (login) login.hidden = true;
  if (shell) shell.hidden = false;
  const who = $('#who');
  if (who && state.me) {
    who.innerHTML = `<b>${esc(state.me.name)}</b><small>${esc(state.me.username)} · ${esc(ROLE_LABEL[state.me.role] || state.me.role)}</small>`;
  }
  renderNav();
  render();
}

function renderNav() {
  $('#nav').innerHTML = NAV.map((n) => (
    `<button type="button" data-tab="${n.id}" class="${state.tab === n.id ? 'on' : ''}">${esc(n.label)}</button>`
  )).join('');
  $$('#nav [data-tab]').forEach((btn) => {
    btn.onclick = () => {
      state.tab = btn.dataset.tab;
      renderNav();
      render();
    };
  });
}

function matchQ(text, q) {
  if (!q) return true;
  return String(text || '').toLowerCase().includes(q.toLowerCase());
}

function render() {
  const page = NAV.find((n) => n.id === state.tab) || NAV[0];
  $('#eyebrow').textContent = page.eyebrow;
  $('#pageTitle').textContent = page.label;
  const actions = $('#headActions');
  const content = $('#content');

  if (state.tab === 'overview') {
    actions.innerHTML = `<button class="btn" type="button" id="btnRefresh">بروزرسانی</button>`;
    $('#btnRefresh').onclick = async () => {
      try { await loadAll(); render(); toast('به‌روز شد'); }
      catch (e) { if (e.message === 'auth') return showLogin(); toast(e.message); }
    };
    content.innerHTML = overviewHtml();
    return;
  }

  if (state.tab === 'users') {
    actions.innerHTML = `<button class="btn pri" type="button" id="btnAddUser">کاربر جدید</button>`;
    $('#btnAddUser').onclick = () => userForm();
    content.innerHTML = usersHtml();
    $('#userSearch').oninput = (e) => { state.qUsers = e.target.value; content.innerHTML = usersHtml(); bindUserTable(); $('#userSearch').focus(); $('#userSearch').setSelectionRange(state.qUsers.length, state.qUsers.length); };
    bindUserTable();
    return;
  }

  if (state.tab === 'units') {
    actions.innerHTML = `<button class="btn pri" type="button" id="btnAddUnit">واحد جدید</button>`;
    $('#btnAddUnit').onclick = () => unitForm();
    content.innerHTML = unitsHtml();
    $('#unitSearch').oninput = (e) => { state.qUnits = e.target.value; content.innerHTML = unitsHtml(); bindUnitCards(); $('#unitSearch').focus(); $('#unitSearch').setSelectionRange(state.qUnits.length, state.qUnits.length); };
    bindUnitCards();
    return;
  }

  if (state.tab === 'settings') {
    actions.innerHTML = '';
    content.innerHTML = settingsHtml();
    $('#saveSettings').onclick = saveSettings;
    $('#syncLegal').onclick = syncLegal;
    $('#fineAmt').oninput = (e) => { e.target.value = money(parseMoney(e.target.value)); };
    return;
  }
}

function overviewHtml() {
  const activeUsers = state.users.filter((u) => u.active !== false).length;
  const activeUnits = state.units.filter((u) => u.active !== false).length;
  const admins = state.users.filter((u) => u.role === 'admin' && u.active !== false).length;
  const recent = [...state.users]
    .filter((u) => u.lastLoginAt)
    .sort((a, b) => new Date(b.lastLoginAt) - new Date(a.lastLoginAt))
    .slice(0, 6);

  return `
  <div class="stats">
    <div class="stat"><span>کاربران فعال</span><b>${fa(activeUsers)}</b><em>از ${fa(state.users.length)} حساب</em></div>
    <div class="stat"><span>واحدهای فعال</span><b>${fa(activeUnits)}</b><em>از ${fa(state.units.length)} واحد</em></div>
    <div class="stat"><span>مدیران</span><b>${fa(admins)}</b><em>دسترسی کامل سیستم</em></div>
    <div class="stat"><span>آستانه حقوقی</span><b>${fa(state.settings.legalDays)}</b><em>روز تأخیر تا ارجاع خودکار</em></div>
  </div>
  <div class="grid-2">
    <section class="panel">
      <div class="panel-h"><div><h3>آخرین ورودها</h3><p>فعالیت اخیر حساب‌های مدیریتی و کارشناسی</p></div></div>
      <div class="table-wrap">
        ${recent.length ? `<table><thead><tr><th>نام</th><th>نقش</th><th>آخرین ورود</th></tr></thead><tbody>
          ${recent.map((u) => `<tr><td>${esc(u.name)}<div class="muted">${esc(u.username)}</div></td><td>${esc(ROLE_LABEL[u.role] || u.role)}</td><td>${esc(new Date(u.lastLoginAt).toLocaleString('fa-IR'))}</td></tr>`).join('')}
        </tbody></table>` : `<div class="empty">هنوز ورودی ثبت نشده است.</div>`}
      </div>
    </section>
    <section class="panel">
      <div class="panel-h"><div><h3>وضعیت سیستم</h3><p>ارجاع خودکار و پیکربندی جاری</p></div></div>
      <div style="padding:16px;display:flex;flex-direction:column;gap:12px">
        <div class="row" style="display:flex;justify-content:space-between;gap:8px">
          <span>ارجاع خودکار به حقوقی</span>
          <span class="badge ${state.settings.autoLegal !== false ? 'ok' : 'bad'}">${state.settings.autoLegal !== false ? 'فعال' : 'غیرفعال'}</span>
        </div>
        <div class="row" style="display:flex;justify-content:space-between;gap:8px">
          <span>مهلت پیش‌فرض رزرو</span>
          <b>${fa(state.settings.days)} روز</b>
        </div>
        <div class="row" style="display:flex;justify-content:space-between;gap:8px">
          <span>کسر لغو رزرو</span>
          <b>${money(state.settings.fine)} تومان</b>
        </div>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
          <button class="btn" type="button" onclick="document.querySelector('[data-tab=settings]')?.click()">تنظیمات</button>
          <a class="btn ghost" href="/">باز کردن CRM</a>
        </div>
      </div>
    </section>
  </div>`;
}

function usersHtml() {
  const rows = state.users.filter((u) => matchQ(
    [u.name, u.username, ROLE_LABEL[u.role], ...(u.unitIds || []).map(unitName), ...(u.perms || []).map(permLabel)].join(' '),
    state.qUsers,
  ));
  return `
  <section class="panel">
    <div class="panel-h">
      <div><h3>فهرست کاربران</h3><p>نقش، عضویت واحد و دسترسی‌های بخشی</p></div>
      <div class="toolbar"><input class="search" id="userSearch" placeholder="جستجوی نام، نقش یا دسترسی…" value="${esc(state.qUsers)}"></div>
    </div>
    <div class="table-wrap">
      ${rows.length ? `<table><thead><tr>
        <th>کاربر</th><th>نقش</th><th>وضعیت</th><th>واحدها</th><th>دسترسی‌ها</th><th>آخرین ورود</th><th></th>
      </tr></thead><tbody>
      ${rows.map((u) => `
        <tr>
          <td><b>${esc(u.name)}</b><div class="muted">${esc(u.username)}</div></td>
          <td>${esc(ROLE_LABEL[u.role] || u.role)}</td>
          <td><span class="badge ${u.active === false ? 'bad' : 'ok'}">${u.active === false ? 'غیرفعال' : 'فعال'}</span></td>
          <td><div class="tags">${(u.unitIds || []).map((id) => `<span class="tag">${esc(unitName(id))}</span>`).join('') || '<span class="muted">—</span>'}</div></td>
          <td><div class="tags">${(u.role === 'admin' ? PERM_DEFS : (u.perms || []).map((k) => PERM_DEFS.find((p) => p.k === k) || { k, l: k })).slice(0, 4).map((p) => `<span class="tag">${esc(p.l)}</span>`).join('')}${(u.role === 'admin' || (u.perms || []).length > 4) ? `<span class="tag">+${fa(u.role === 'admin' ? PERM_DEFS.length - 4 : Math.max(0, (u.perms || []).length - 4))}</span>` : ''}</div></td>
          <td>${u.lastLoginAt ? esc(new Date(u.lastLoginAt).toLocaleString('fa-IR')) : '—'}</td>
          <td style="white-space:nowrap">
            <button class="btn sm" data-edit="${u.id}">ویرایش</button>
            ${u.id === state.me.id ? '' : `<button class="btn sm danger" data-del="${u.id}">حذف</button>`}
          </td>
        </tr>`).join('')}
      </tbody></table>` : `<div class="empty">کاربری با این جستجو پیدا نشد.</div>`}
    </div>
  </section>`;
}

function bindUserTable() {
  $$('[data-edit]').forEach((b) => { b.onclick = () => userForm(state.users.find((u) => u.id === b.dataset.edit)); });
  $$('[data-del]').forEach((b) => { b.onclick = () => delUser(b.dataset.del); });
}

function unitsHtml() {
  const list = state.units.filter((u) => matchQ(
    [u.name, u.code, u.note, (u.memberIds || []).length].join(' '),
    state.qUnits,
  ));
  return `
  <section class="panel">
    <div class="panel-h">
      <div><h3>واحدهای سازمانی</h3><p>مقصد ارجاع‌ها و صندوق هر واحد</p></div>
      <div class="toolbar"><input class="search" id="unitSearch" placeholder="جستجوی واحد…" value="${esc(state.qUnits)}"></div>
    </div>
    ${list.length ? `<div class="cards">${list.map((u) => `
      <article class="card">
        <div class="row">
          <h4>${esc(u.name)}</h4>
          <span class="badge ${u.active === false ? 'bad' : 'ok'}">${u.active === false ? 'غیرفعال' : 'فعال'}</span>
        </div>
        <div class="meta"><code>${esc(u.code)}</code> · ${fa((u.memberIds || []).length)} عضو</div>
        <div class="meta">${esc(u.note || 'بدون توضیح')}</div>
        <div class="actions">
          <button class="btn sm" data-uedit="${u.id}">ویرایش</button>
          ${u.code === 'legal' ? '' : `<button class="btn sm danger" data-udel="${u.id}">حذف</button>`}
        </div>
      </article>`).join('')}</div>` : `<div class="empty">واحدی پیدا نشد.</div>`}
  </section>`;
}

function bindUnitCards() {
  $$('[data-uedit]').forEach((b) => { b.onclick = () => unitForm(state.units.find((u) => u.id === b.dataset.uedit)); });
  $$('[data-udel]').forEach((b) => { b.onclick = () => delUnit(b.dataset.udel); });
}

function settingsHtml() {
  const s = state.settings;
  return `
  <section class="panel">
    <div class="panel-h"><div><h3>تنظیمات ارجاع حقوقی</h3><p>آستانه‌ها و جریمه‌های خودکار سامانه</p></div></div>
    <div class="settings-grid">
      <div class="field"><label>حد آستانه ارجاع خودکار (روز)</label><input id="legalDays" inputmode="numeric" value="${esc(s.legalDays ?? 7)}"></div>
      <div class="field"><label>مهلت پیش‌فرض رزرو (روز)</label><input id="resDays" inputmode="numeric" value="${esc(s.days ?? 20)}"></div>
      <div class="field span2"><label>مبلغ کسر پیش‌فرض لغو رزرو (تومان)</label><input id="fineAmt" inputmode="numeric" value="${money(s.fine ?? 30000000)}"></div>
      <div class="field span2"><label class="checkline"><input id="autoLegal" type="checkbox" ${s.autoLegal !== false ? 'checked' : ''}> ارجاع خودکار به واحد حقوقی فعال باشد</label></div>
    </div>
    <div class="drawer-actions" style="padding:0 16px 16px">
      <button class="btn" type="button" id="syncLegal">همگام‌سازی فوری ارجاع‌ها</button>
      <button class="btn pri" type="button" id="saveSettings">ذخیره تنظیمات</button>
    </div>
  </section>`;
}

function permChecks(selected, role) {
  const set = new Set(selected || []);
  return `<div class="checks" id="permBox">${PERM_DEFS.map((p) => `
    <label><input type="checkbox" data-p="${p.k}" ${role === 'admin' || set.has(p.k) ? 'checked' : ''} ${role === 'admin' ? 'disabled' : ''}> ${esc(p.l)}</label>
  `).join('')}</div>`;
}
function unitChecks(selected) {
  const set = new Set(selected || []);
  if (!state.units.length) return `<div class="muted" id="unitBox">ابتدا یک واحد بسازید.</div>`;
  return `<div class="checks" id="unitBox">${state.units.map((u) => `
    <label><input type="checkbox" data-u="${u.id}" ${set.has(u.id) ? 'checked' : ''}> ${esc(u.name)}</label>
  `).join('')}</div>`;
}

function userForm(init) {
  init = init || { role: 'staff', perms: ROLE_DEFAULTS.staff, unitIds: [], active: true };
  const editing = !!init.id;
  openModal(`
  <div class="drawer">
    <h3>${editing ? 'ویرایش کاربر' : 'تعریف کاربر و دسترسی ورود'}</h3>
    <p class="sub">نام کاربری و رمز را برای ورود به سامانه تعیین کنید. نقش، قالب دسترسی را می‌سازد؛ تیک‌ها را می‌توانید جداگانه تنظیم کنید.</p>
    <div class="form-grid">
      <div class="field"><label>نام و نام خانوادگی</label><input name="name" value="${esc(init.name || '')}" placeholder="مثلاً سارا احمدی" autofocus></div>
      <div class="field"><label>نقش</label>
        <select name="role">
          <option value="staff" ${init.role === 'staff' ? 'selected' : ''}>کارشناس فروش</option>
          <option value="legal" ${init.role === 'legal' ? 'selected' : ''}>واحد حقوقی</option>
          <option value="admin" ${init.role === 'admin' ? 'selected' : ''}>مدیر</option>
        </select>
      </div>
      <div class="field"><label>نام کاربری ورود ${editing ? '' : '<span class="req">*</span>'}</label>
        <input name="username" ${editing ? 'readonly' : ''} autocomplete="off" spellcheck="false"
          placeholder="latin_username" value="${esc(init.username || '')}">
        <small class="hint">فقط انگلیسی، عدد، نقطه، خط تیره و زیرخط · ۳ تا ۳۲ نویسه</small>
      </div>
      <div class="field"><label>رمز عبور ورود ${editing ? '' : '<span class="req">*</span>'}</label>
        <input name="password" type="password" autocomplete="new-password"
          placeholder="${editing ? 'خالی بگذارید تا رمز عوض نشود' : 'حداقل ۵ کاراکتر'}">
      </div>
      ${editing ? '' : `<div class="field span2"><label>تکرار رمز عبور <span class="req">*</span></label>
        <input name="password2" type="password" autocomplete="new-password" placeholder="همان رمز را دوباره وارد کنید">
      </div>`}
      <div class="field span2"><label>عضویت در واحدهای سازمانی</label>${unitChecks(init.unitIds)}</div>
      <div class="field span2"><label>دسترسی‌های بخشی سامانه</label>${permChecks(init.perms, init.role || 'staff')}</div>
      ${editing ? `<div class="field span2"><label class="checkline"><input name="active" type="checkbox" ${init.active !== false ? 'checked' : ''}> حساب فعال باشد (غیرفعال = عدم ورود)</label></div>` : ''}
    </div>
    <div class="drawer-actions">
      <button class="btn" type="button" id="cancel">انصراف</button>
      <button class="btn pri" type="button" id="ok">${editing ? 'ذخیره تغییرات' : 'ایجاد حساب و دسترسی'}</button>
    </div>
  </div>`);
  const box = $('#modal .drawer');
  box.querySelector('[name=role]').onchange = (e) => {
    const role = e.target.value;
    const cur = $$('#permBox [data-p]:checked').map((el) => el.dataset.p);
    const applyDefaults = !editing || role === 'admin' || confirm('دسترسی‌های پیش‌فرض این نقش اعمال شود؟\nانصراف = نگه داشتن تیک‌های فعلی');
    box.querySelector('#permBox').outerHTML = permChecks(applyDefaults ? (ROLE_DEFAULTS[role] || []) : cur, role);
  };
  $('#cancel').onclick = closeModal;
  $('#ok').onclick = async () => {
    const payload = {
      name: box.querySelector('[name=name]').value.trim(),
      username: box.querySelector('[name=username]').value.trim().toLowerCase(),
      password: box.querySelector('[name=password]').value,
      role: box.querySelector('[name=role]').value,
      perms: $$('#permBox [data-p]:checked').map((e) => e.dataset.p),
      unitIds: $$('#unitBox [data-u]:checked').map((e) => e.dataset.u),
    };
    if (editing) payload.active = !!box.querySelector('[name=active]')?.checked;
    if (!payload.name || !payload.username) return toast('نام و نام کاربری را وارد کنید');
    if (!/^[a-z0-9._-]{3,32}$/.test(payload.username)) return toast('نام کاربری فقط انگلیسی، عدد، نقطه، - و _ باشد');
    if (!editing) {
      const p2 = box.querySelector('[name=password2]')?.value || '';
      if (payload.password.length < 5) return toast('رمز حداقل ۵ کاراکتر باشد');
      if (payload.password !== p2) return toast('تکرار رمز با رمز یکسان نیست');
    } else if (payload.password && payload.password.length < 5) {
      return toast('رمز حداقل ۵ کاراکتر باشد');
    }
    const btn = $('#ok');
    btn.disabled = true;
    try {
      if (editing) await api('/api/users/' + init.id, { method: 'PUT', body: JSON.stringify(payload) });
      else await api('/api/users', { method: 'POST', body: JSON.stringify(payload) });
      toast(editing ? 'کاربر به‌روز شد' : `حساب «${payload.username}» ساخته شد — می‌تواند وارد شود`);
      closeModal();
      await loadAll();
      render();
    } catch (e) {
      if (e.message === 'auth') return showLogin();
      toast(e.message);
    } finally {
      if ($('#ok')) $('#ok').disabled = false;
    }
  };
}

async function delUser(id) {
  if (!confirm('این کاربر حذف شود؟')) return;
  try {
    await api('/api/users/' + id, { method: 'DELETE' });
    toast('کاربر حذف شد');
    await loadAll();
    render();
  } catch (e) {
    if (e.message === 'auth') return showLogin();
    toast(e.message);
  }
}

function unitForm(init) {
  init = init || {};
  const editing = !!init.id;
  const memberSet = new Set(init.memberIds || []);
  const memberChecks = state.users.filter((u) => u.active !== false).length
    ? `<div class="checks" id="memberBox">${state.users.filter((u) => u.active !== false).map((u) => `
        <label><input type="checkbox" data-m="${u.id}" ${memberSet.has(u.id) ? 'checked' : ''}> ${esc(u.name)} <span class="muted">(${esc(u.username)})</span></label>
      `).join('')}</div>`
    : '<div class="muted">ابتدا کاربر بسازید.</div>';

  openModal(`
  <div class="drawer">
    <h3>${editing ? 'ویرایش واحد' : 'واحد سازمانی جدید'}</h3>
    <p class="sub">اعضا را با تیک مشخص کنید؛ ارجاع‌ها به این واحد می‌روند.</p>
    <div class="form-grid">
      <div class="field"><label>نام واحد</label><input name="name" placeholder="مثلاً امور قراردادها" value="${esc(init.name || '')}"></div>
      <div class="field"><label>کد انگلیسی</label><input name="code" ${init.code === 'legal' ? 'readonly' : ''} placeholder="contracts" value="${esc(init.code || '')}"></div>
      <div class="field span2"><label>توضیح</label><textarea name="note" rows="2">${esc(init.note || '')}</textarea></div>
      <div class="field span2"><label>اعضای واحد</label>${memberChecks}</div>
      ${editing && init.code !== 'legal' ? `<div class="field span2"><label class="checkline"><input name="active" type="checkbox" ${init.active !== false ? 'checked' : ''}> واحد فعال باشد</label></div>` : ''}
    </div>
    <div class="drawer-actions">
      <button class="btn" type="button" id="cancel">انصراف</button>
      <button class="btn pri" type="button" id="ok">ثبت</button>
    </div>
  </div>`);
  const box = $('#modal .drawer');
  $('#cancel').onclick = closeModal;
  $('#ok').onclick = async () => {
    const payload = {
      name: box.querySelector('[name=name]').value.trim(),
      code: box.querySelector('[name=code]').value.trim().toLowerCase(),
      note: box.querySelector('[name=note]').value.trim(),
      memberIds: $$('#memberBox [data-m]:checked').map((e) => e.dataset.m),
    };
    if (editing && init.code !== 'legal') payload.active = !!box.querySelector('[name=active]')?.checked;
    if (!payload.name || !payload.code) return toast('نام و کد واحد را وارد کنید');
    const btn = $('#ok');
    btn.disabled = true;
    try {
      if (editing) await api('/api/units/' + init.id, { method: 'PUT', body: JSON.stringify(payload) });
      else await api('/api/units', { method: 'POST', body: JSON.stringify(payload) });
      toast(editing ? 'واحد به‌روز شد' : 'واحد ساخته شد');
      closeModal();
      await loadAll();
      render();
    } catch (e) {
      if (e.message === 'auth') return showLogin();
      toast(e.message);
    } finally {
      if ($('#ok')) $('#ok').disabled = false;
    }
  };
}

async function delUnit(id) {
  if (!confirm('این واحد حذف شود؟')) return;
  try {
    await api('/api/units/' + id, { method: 'DELETE' });
    toast('واحد حذف شد');
    await loadAll();
    render();
  } catch (e) {
    if (e.message === 'auth') return showLogin();
    toast(e.message);
  }
}

async function saveSettings() {
  try {
    const body = {
      legalDays: Number($('#legalDays').value) || 7,
      days: Number($('#resDays').value) || 20,
      fine: parseMoney($('#fineAmt').value),
      autoLegal: $('#autoLegal').checked,
    };
    const saved = await api('/api/admin/settings', { method: 'PUT', body: JSON.stringify(body) });
    state.settings = saved;
    toast(`تنظیمات ذخیره شد${saved.synced?.created ? `؛ ${fa(saved.synced.created)} پرونده جدید` : ''}`);
    render();
  } catch (e) {
    if (e.message === 'auth') return showLogin();
    toast(e.message);
  }
}

async function syncLegal() {
  try {
    const r = await api('/api/admin/legal-sync', { method: 'POST', body: '{}' });
    toast(r.created ? `${fa(r.created)} پرونده همگام شد` : 'پرونده جدیدی برای ارجاع نبود');
  } catch (e) {
    if (e.message === 'auth') return showLogin();
    toast(e.message);
  }
}

async function boot() {
  try {
    const me = await api('/api/auth/me');
    state.me = me.user;
    if (!hasAdmin(state.me)) {
      showLogin('فقط مدیر سیستم به این پنل دسترسی دارد');
      await api('/api/auth/logout', { method: 'POST', body: '{}' }).catch(() => {});
      return;
    }
    await loadAll();
    showShell();
  } catch (e) {
    showLogin();
  } finally {
    hideBoot();
  }
}

const loginForm = $('#loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const err = $('#loginErr');
    if (err) err.hidden = true;
    const btn = e.target.querySelector('button[type=submit]');
    if (btn) btn.disabled = true;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: fd.get('username'), password: fd.get('password') }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (err) { err.hidden = false; err.textContent = body.message || 'ورود ناموفق بود'; }
        return;
      }
      state.me = body.user;
      if (!hasAdmin(state.me)) {
        if (err) { err.hidden = false; err.textContent = 'این حساب به پنل مدیریت دسترسی ندارد'; }
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
        return;
      }
      await loadAll();
      showShell();
    } catch {
      if (err) { err.hidden = false; err.textContent = 'ارتباط با سرور برقرار نشد'; }
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

const btnLogout = $('#btnLogout');
if (btnLogout) {
  btnLogout.onclick = async () => {
    try { await api('/api/auth/logout', { method: 'POST', body: '{}' }); } catch {}
    state.me = null;
    showLogin();
  };
}

// Escape closes modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

boot();
