let BRIEF_ROWS = null;
let BRIEF = null;
let briefQuery = '';
let briefTicket = 0;
let briefLoad = '';

function briefStamp(value) {
  if (!value) return '—';
  const time = new Date(value);
  if (Number.isNaN(time.getTime())) return '—';
  return time.toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Asia/Tehran' });
}

function briefIdOk(id) {
  return /^[a-z0-9]{8,32}$/.test(String(id || ''));
}

async function loadBriefList() {
  const ticket = ++briefTicket;
  const q = briefQuery.trim();
  try {
    const rows = await api('/api/reports' + (q ? '?q=' + encodeURIComponent(q) : ''));
    if (ticket !== briefTicket) return;
    BRIEF_ROWS = rows;
  } catch (error) {
    if (ticket !== briefTicket) return;
    BRIEF_ROWS = [];
    if (error.message && error.message !== 'auth') toast(error.message);
  }
  if (V.n !== 'brief') return;
  const box = document.querySelector('#briefList');
  if (box) box.innerHTML = briefCards();
  else render();
}

function searchBriefs(value) {
  briefQuery = value;
  clearTimeout(searchBriefs.timer);
  searchBriefs.timer = setTimeout(loadBriefList, 280);
}

function briefCards() {
  const rows = BRIEF_ROWS || [];
  if (!rows.length) return empty(briefQuery.trim() ? 'گزارشی با این عبارت پیدا نشد.' : 'هنوز گزارشی ثبت نشده است.');
  return rows.map((row) => {
    const id = briefIdOk(row.id) ? row.id : '';
    const units = (row.unitNames || []).join('، ');
    return `<article class="brief-card">
      <button type="button" class="brief-open" ${id ? `onclick="openBrief('${id}')"` : 'disabled'}>
        <strong>${esc(row.title)}</strong>
        <p>${esc(row.excerpt || '')}</p>
      </button>
      <footer>
        <span>${esc(row.authorName || row.authorUser || 'کاربر')}</span>
        <span>${esc(units || 'بدون واحد')}</span>
        <time>ثبت ${esc(briefStamp(row.createdAt))}</time>
        ${row.updatedAt && row.updatedAt !== row.createdAt ? `<time>ویرایش ${esc(briefStamp(row.updatedAt))}</time>` : ''}
        ${row.mine ? '<em>گزارش شما</em>' : '<em class="brief-read-only">فقط خواندنی</em>'}
      </footer>
    </article>`;
  }).join('');
}

function briefV() {
  if (!can('brief')) return empty('به گزارش‌نویسی دسترسی ندارید');
  if (!BRIEF_ROWS) {
    loadBriefList();
    return empty('در حال دریافت گزارش‌ها…');
  }
  return `<section class="brief-page">
    <header class="brief-head">
      <div>
        <h2>گزارش‌نویسی</h2>
        <p class="brief-note">عنوان، متن و پیوست را ثبت کنید. زمان ثبت روی خود گزارش می‌ماند و فقط نویسنده می‌تواند بعداً آن را ویرایش کند.</p>
      </div>
      <button type="button" class="pri" onclick="openBriefNew()">گزارش جدید</button>
    </header>
    <input class="sb brief-search" type="search" placeholder="جستجو در عنوان، متن، نویسنده یا واحد" value="${esc(briefQuery)}" oninput="searchBriefs(this.value)">
    <div id="briefList" class="brief-list">${briefCards()}</div>
  </section>`;
}

function openBriefNew() {
  BRIEF = null;
  V = { n: 'bd', id: 'new' };
  remember();
  render();
  scrollTo(0, 0);
}

function openBrief(id) {
  if (!briefIdOk(id)) return;
  BRIEF = null;
  V = { n: 'bd', id };
  remember();
  render();
  scrollTo(0, 0);
}

function editBrief() {
  if (!BRIEF || !BRIEF.mine) return;
  V.edit = 1;
  remember();
  render();
}

function cancelBrief() {
  V.edit = 0;
  remember();
  render();
}

async function loadBrief(id) {
  if (!briefIdOk(id) || briefLoad === id) return;
  briefLoad = id;
  try {
    const row = await api('/api/reports/' + id);
    if (V.n === 'bd' && V.id === id) {
      BRIEF = row;
      render();
    }
  } catch (error) {
    if (error.message && error.message !== 'auth') toast(error.message);
    if (V.n === 'bd' && V.id === id) go('brief');
  } finally {
    if (briefLoad === id) briefLoad = '';
  }
}

function briefMeta(row) {
  const units = (row.unitNames || []).join('، ');
  const edited = row.updatedAt && row.updatedAt !== row.createdAt;
  return `<div class="brief-meta">
    <span>نویسنده: ${esc(row.authorName || row.authorUser || '')}</span>
    <span>واحد: ${esc(units || '—')}</span>
    <time>تاریخ ثبت: ${esc(briefStamp(row.createdAt))}</time>
    ${edited ? `<time>آخرین ویرایش: ${esc(briefStamp(row.updatedAt))}</time>` : ''}
  </div>`;
}

function briefReader(row) {
  return `<section class="brief-page">
    <article class="brief-read">
      <div class="brief-actions">
        <button type="button" onclick="go('brief')">بازگشت به فهرست</button>
        ${row.mine ? '<button type="button" class="pri" onclick="editBrief()">ویرایش</button>' : ''}
      </div>
      <h2>${esc(row.title)}</h2>
      ${briefMeta(row)}
      <p class="brief-note">${row.mine ? 'این گزارش برای شما قابل ویرایش است. هر ذخیره، متن قبلی و ساعت تغییر را در امنیت و اطلاعات پنل مدیریت ثبت می‌کند.' : 'این گزارش را فقط نویسنده‌اش می‌تواند ویرایش کند. برای شما فقط خواندنی است.'}</p>
      <p class="brief-body">${esc(row.body || '')}</p>
    </article>
    ${typeof filesPanel === 'function' ? filesPanel('report', row.id, { mine: !!row.mine }) : ''}
  </section>`;
}

function briefEditor(row) {
  const fresh = !row;
  return `<section class="brief-page">
    <form class="brief-form" onsubmit="saveBrief(event)">
      <div class="brief-actions">
        <button type="button" onclick="${fresh ? "go('brief')" : 'cancelBrief()'}">انصراف</button>
      </div>
      <h2>${fresh ? 'گزارش جدید' : 'ویرایش گزارش'}</h2>
      ${row ? briefMeta(row) : '<p class="brief-note">با ذخیره، تاریخ و ساعت همین لحظه روی گزارش ثبت می‌شود.</p>'}
      <label>عنوان<input name="title" maxlength="180" required value="${esc(row?.title || '')}" autocomplete="off"></label>
      <label>متن گزارش<textarea name="text" maxlength="20000" required>${esc(row?.body || '')}</textarea></label>
      ${fresh ? `<div class="brief-files">
        <label>نوع پیوست<select name="category"><option>پیوست گزارش</option><option>سند</option><option>تصویر</option><option>سایر</option></select></label>
        <label>فایل پیوست — PDF، تصویر، Word یا Excel، تا ۸ مگابایت<input name="files" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx"></label>
      </div>` : '<p class="brief-note">پیوست‌ها را پایین همین صفحه اضافه یا حذف کنید. حذف و افزودن فایل هم در امنیت و اطلاعات ثبت می‌شود.</p>'}
      <div class="brief-actions"><button class="pri" type="submit">ذخیره گزارش</button></div>
    </form>
    ${row && typeof filesPanel === 'function' ? filesPanel('report', row.id, { mine: true }) : ''}
  </section>`;
}

function briefDetail() {
  if (!can('brief')) return empty('به گزارش‌نویسی دسترسی ندارید');
  if (V.id === 'new') return briefEditor(null);
  if (!briefIdOk(V.id)) return empty('گزارش نامعتبر است');
  if (!BRIEF || BRIEF.id !== V.id) {
    loadBrief(V.id);
    return empty('در حال دریافت گزارش…');
  }
  if (V.edit && BRIEF.mine) return briefEditor(BRIEF);
  return briefReader(BRIEF);
}

async function uploadBriefFiles(id, files, category) {
  for (const file of files) {
    if (file.size > 8 * 1024 * 1024) throw Error('حجم ' + file.name + ' بیش از ۸ مگابایت است.');
    const params = new URLSearchParams({ title: file.name, category: category || 'پیوست گزارش' });
    const response = await fetch('/api/files/report/' + encodeURIComponent(id) + '?' + params, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: file,
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw Error(payload.message || 'بارگذاری پیوست ناموفق بود');
    }
  }
}

async function saveBrief(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type=submit]');
  const title = form.querySelector('[name=title]').value;
  const text = form.querySelector('[name=text]').value;
  const fresh = V.id === 'new';
  button.disabled = true;
  try {
    const row = await api(fresh ? '/api/reports' : '/api/reports/' + encodeURIComponent(V.id), {
      method: fresh ? 'POST' : 'PUT',
      body: JSON.stringify({ title, body: text }),
    });
    let fileError = '';
    const input = form.querySelector('[name=files]');
    if (fresh && input?.files?.length) {
      try {
        await uploadBriefFiles(row.id, [...input.files], form.querySelector('[name=category]')?.value);
      } catch (error) {
        fileError = error.message;
      }
    }
    BRIEF = row;
    BRIEF_ROWS = null;
    V = { n: 'bd', id: row.id };
    remember();
    render();
    toast(fileError ? 'گزارش ذخیره شد، اما پیوست ارسال نشد: ' + fileError : (fresh ? 'گزارش ثبت شد' : 'ویرایش ذخیره شد'));
  } catch (error) {
    if (error.message && error.message !== 'auth') toast(error.message);
    button.disabled = false;
  }
}
