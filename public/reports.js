let BRIEF_ROWS = null;
let BRIEF_AUTHORS = [];
let BRIEF = null;
let BRIEF_OPTIONS = null;
let BRIEF_OPTIONS_ERR = '';
let briefQuery = '';
let briefAuthor = '';
let briefTicket = 0;
let briefLoad = '';
let briefOptionsTicket = 0;
let briefDraft = null;

function briefStamp(value) {
  if (!value) return '—';
  const time = new Date(value);
  if (Number.isNaN(time.getTime())) return '—';
  return time.toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Asia/Tehran' });
}

function briefIdOk(id) {
  return /^[a-z0-9]{8,32}$/.test(String(id || ''));
}

function briefUserId(id) {
  return /^[a-f0-9]{24}$/i.test(String(id || '')) ? String(id) : '';
}

function briefUnitId(id) {
  return /^[a-z0-9_-]{1,40}$/i.test(String(id || '')) ? String(id) : '';
}

function briefAuthorOptions() {
  const ids = new Set(BRIEF_AUTHORS.map((row) => row.id));
  const extra = briefAuthor && !ids.has(briefAuthor)
    ? `<option value="${briefAuthor}">نویسنده انتخاب‌شده</option>` : '';
  return `<option value="">همه نویسنده‌ها</option>${extra}${BRIEF_AUTHORS.map((row) => {
    const id = briefUserId(row.id);
    if (!id) return '';
    return `<option value="${id}">${esc(row.name || row.username || 'کاربر')}</option>`;
  }).join('')}`;
}

function briefFilterNote() {
  if (!briefAuthor) return '';
  const author = BRIEF_AUTHORS.find((row) => row.id === briefAuthor);
  const name = author?.name || author?.username || 'این نویسنده';
  return `<p class="brief-filter">گزارش‌های ${esc(name)} <button type="button" onclick="filterBriefAuthor('')">نمایش همه</button></p>`;
}

function paintBriefList() {
  const note = document.querySelector('#briefFilter');
  if (note) note.innerHTML = briefFilterNote();
  const box = document.querySelector('#briefList');
  if (box) box.innerHTML = briefCards();
  const select = document.querySelector('#briefAuthor');
  if (select && document.activeElement !== select) {
    select.innerHTML = briefAuthorOptions();
    select.value = briefAuthor;
  }
}

async function loadBriefList() {
  const ticket = ++briefTicket;
  const params = new URLSearchParams();
  const q = briefQuery.trim();
  if (q) params.set('q', q);
  if (briefAuthor) params.set('author', briefAuthor);
  const query = params.toString();
  try {
    const data = await api('/api/reports' + (query ? '?' + query : ''));
    if (ticket !== briefTicket) return;
    BRIEF_ROWS = Array.isArray(data?.rows) ? data.rows : [];
    BRIEF_AUTHORS = Array.isArray(data?.authors) ? data.authors : [];
  } catch (error) {
    if (ticket !== briefTicket) return;
    BRIEF_ROWS = [];
    if (error.message && error.message !== 'auth') toast(error.message);
  }
  if (V.n !== 'brief') return;
  if (!document.querySelector('#briefList')) render();
  else paintBriefList();
}

function searchBriefs(value) {
  briefQuery = value;
  clearTimeout(searchBriefs.timer);
  searchBriefs.timer = setTimeout(loadBriefList, 280);
}

function filterBriefAuthor(id) {
  briefAuthor = briefUserId(id);
  BRIEF_ROWS = null;
  go('brief');
}

function briefShareBadge(row) {
  const kind = row.visibility === 'private' ? 'private' : 'public';
  return `<span class="brief-badge ${kind}">${esc(row.shareLabel || (kind === 'private' ? 'خصوصی' : 'عمومی'))}</span>`;
}

function briefCards() {
  const rows = BRIEF_ROWS || [];
  if (!rows.length) {
    if (briefQuery.trim() && briefAuthor) return empty('گزارشی از این نویسنده با این عبارت پیدا نشد.');
    if (briefAuthor) return empty('گزارشی از این نویسنده برای شما منتشر نشده است.');
    if (briefQuery.trim()) return empty('گزارشی با این عبارت پیدا نشد.');
    return empty('هنوز گزارشی برای شما منتشر نشده است.');
  }
  return rows.map((row) => {
    const id = briefIdOk(row.id) ? row.id : '';
    const authorId = briefUserId(row.authorId);
    const units = (row.unitNames || []).join('، ');
    const author = esc(row.authorName || row.authorUser || 'کاربر');
    return `<article class="brief-card">
      <button type="button" class="brief-open" ${id ? `onclick="openBrief('${id}')"` : 'disabled'}>
        <strong>${esc(row.title)}</strong>
        <p>${esc(row.excerpt || '')}</p>
      </button>
      <footer>
        ${authorId ? `<button type="button" class="brief-by" onclick="filterBriefAuthor('${authorId}')">${author}</button>` : `<span>${author}</span>`}
        <span>${esc(units || 'بدون واحد')}</span>
        ${briefShareBadge(row)}
        ${row.mine ? '<em>گزارش شما</em>' : '<em class="brief-read-only">فقط خواندنی</em>'}
        <time>ثبت ${esc(briefStamp(row.createdAt))}</time>
        ${row.updatedAt && row.updatedAt !== row.createdAt ? `<time>ویرایش ${esc(briefStamp(row.updatedAt))}</time>` : ''}
      </footer>
    </article>`;
  }).join('');
}

function briefV() {
  if (!can('brief')) return empty('به گزارش‌نویسی دسترسی ندارید');
  if (!BRIEF_ROWS) loadBriefList();
  if (!BRIEF_OPTIONS && !BRIEF_OPTIONS_ERR) loadBriefOptions();
  queueMicrotask(() => {
    const select = document.querySelector('#briefAuthor');
    if (select && briefAuthor) select.value = briefAuthor;
  });
  return `<section class="brief-page">
    <header class="brief-head">
      <div>
        <h2>گزارش‌نویسی</h2>
        <p class="brief-note">گزارش را خصوصی نگه دارید، یا برای همه، چند واحد، یا چند نفر از همان واحدها منتشر کنید. انتخاب انتشار برای گزارش بعدی‌تان می‌ماند تا خودتان عوضش کنید.</p>
      </div>
      <button type="button" class="pri" onclick="openBriefNew()">گزارش جدید</button>
    </header>
    <div class="brief-tools">
      <input class="sb brief-search" type="search" placeholder="جستجو در عنوان، متن، نویسنده یا واحد" value="${esc(briefQuery)}" oninput="searchBriefs(this.value)">
      <label class="brief-author">نویسنده
        <select id="briefAuthor" onchange="filterBriefAuthor(this.value)">${briefAuthorOptions()}</select>
      </label>
    </div>
    <div id="briefFilter">${briefFilterNote()}</div>
    <div id="briefList" class="brief-list">${BRIEF_ROWS ? briefCards() : empty('در حال دریافت گزارش‌ها…')}</div>
  </section>`;
}

function openBriefNew() {
  BRIEF = null;
  briefDraft = null;
  V = { n: 'bd', id: 'new' };
  remember();
  render();
  scrollTo(0, 0);
}

function openBrief(id) {
  if (!briefIdOk(id)) return;
  BRIEF = null;
  briefDraft = null;
  V = { n: 'bd', id };
  remember();
  render();
  scrollTo(0, 0);
}

function editBrief() {
  if (!BRIEF || !BRIEF.mine) return;
  briefDraft = null;
  V.edit = 1;
  remember();
  render();
}

function cancelBrief() {
  briefDraft = null;
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

async function loadBriefOptions(force) {
  if (BRIEF_OPTIONS && !force) return;
  if (force) rememberBriefDraft();
  const ticket = ++briefOptionsTicket;
  try {
    const data = await api('/api/reports/publish-options');
    if (ticket !== briefOptionsTicket) return;
    BRIEF_OPTIONS = data || { preset: null, units: [] };
    BRIEF_OPTIONS_ERR = '';
  } catch (error) {
    if (ticket !== briefOptionsTicket) return;
    BRIEF_OPTIONS_ERR = error.message || 'واحدها دریافت نشد';
    if (error.message && error.message !== 'auth') toast(error.message);
  }
  if (V.n === 'bd') render();
}

function publishState(row) {
  if (row) {
    return {
      mode: row.visibility === 'private' ? 'private' : 'public',
      scope: row.audienceScope === 'units' ? 'units' : 'all',
      units: Array.isArray(row.audienceUnits) ? row.audienceUnits : [],
    };
  }
  return BRIEF_OPTIONS?.preset || { mode: 'public', scope: 'all', units: [] };
}

function editorState(row) {
  if (briefDraft?.audience) {
    return {
      mode: briefDraft.audience.visibility === 'private' ? 'private' : 'public',
      scope: briefDraft.audience.audienceScope === 'units' ? 'units' : 'all',
      units: (briefDraft.audience.audienceUnits || []).map((unit) => ({
        id: unit.id,
        everyone: unit.everyone !== false,
        userIds: unit.everyone === false ? (unit.userIds || []) : [],
      })),
    };
  }
  return publishState(row);
}

function reachFromState(state, units) {
  if (state.mode !== 'public') return 'این گزارش فقط برای خودتان نمایش داده می‌شود.';
  if (state.scope !== 'units') return 'برای همه واحدها و هر کاربری که گزارش‌نویسی دارد منتشر می‌شود.';
  const byId = new Map((units || []).map((unit) => [unit.id, unit]));
  const parts = (state.units || []).map((row) => {
    const unit = byId.get(row.id);
    if (!unit) return '';
    if (row.everyone !== false) return unit.name + '، همه کاربران';
    const names = unit.users.filter((person) => (row.userIds || []).includes(person.id)).map((person) => person.name);
    return unit.name + (names.length ? '، ' + names.join('، ') : '، کسی انتخاب نشده');
  }).filter(Boolean);
  if (!parts.length) return 'واحدها را انتخاب کنید تا گزارش فقط برای همان‌ها منتشر شود.';
  return 'منتشر می‌شود برای: ' + parts.join(' · ');
}

function briefPublish(state, units, fresh) {
  const saved = new Map((state.units || []).filter((unit) => briefUnitId(unit.id)).map((unit) => [unit.id, unit]));
  const cards = (units || []).map((unit) => {
    const id = briefUnitId(unit.id);
    if (!id) return '';
    const picked = saved.get(id);
    const on = !!picked;
    const specific = !!(picked && picked.everyone === false);
    const chosen = new Set(specific ? (picked.userIds || []) : []);
    const people = (unit.users || []).map((person) => {
      const userId = briefUserId(person.id);
      if (!userId) return '';
      const find = esc((person.name || '') + ' ' + (person.username || ''));
      return `<label class="brief-person-check" data-find="${find}">
        <input type="checkbox" name="person" value="${userId}" data-name="${esc(person.name || person.username || '')}" ${chosen.has(userId) ? 'checked' : ''}>
        <span>${esc(person.name || person.username || 'کاربر')}${person.username ? `<small>${esc(person.username)}</small>` : ''}</span>
      </label>`;
    }).join('');
    const many = (unit.users || []).length > 6;
    return `<article class="brief-unit${on ? ' on' : ''}" data-unit="${id}" data-name="${esc(unit.name || 'واحد')}">
      <label class="brief-unit-head">
        <input type="checkbox" name="unit" value="${id}" ${on ? 'checked' : ''}>
        <span><b>${esc(unit.name || 'واحد')}</b><small>${esc(String((unit.users || []).length))} نفر با گزارش‌نویسی</small></span>
      </label>
      <div class="brief-people"${on ? '' : ' hidden'}>
        <div class="brief-who">
          <label><input type="radio" name="who-${id}" data-who value="all" ${specific ? '' : 'checked'}>همه کاربران این واحد</label>
          <label><input type="radio" name="who-${id}" data-who value="picked" ${specific ? 'checked' : ''}>افراد خاص</label>
        </div>
        ${many ? `<input class="brief-person-search" type="search" placeholder="جستجو در افراد این واحد" aria-label="جستجو در افراد این واحد" onkeydown="if(event.key==='Enter')event.preventDefault()" oninput="filterBriefPeople(this)"${specific ? '' : ' hidden'}>` : ''}
        <div class="brief-people-list"${specific ? '' : ' hidden'}>${people}</div>
      </div>
    </article>`;
  }).join('');
  return `<fieldset class="brief-publish" onchange="syncBriefPublish(this)">
    <legend>انتشار</legend>
    <p class="brief-note">${fresh ? 'این انتخاب برای گزارش بعدی شما ذخیره می‌شود، تا وقتی خودتان عوضش کنید.' : 'تغییر انتشار فقط همین گزارش را عوض می‌کند.'}</p>
    <div class="brief-modes" role="radiogroup" aria-label="نوع انتشار">
      <label class="brief-choice${state.mode === 'private' ? ' on' : ''}">
        <input type="radio" name="visibility" value="private" ${state.mode === 'private' ? 'checked' : ''}>
        <b>خصوصی</b><span>فقط برای خودتان</span>
      </label>
      <label class="brief-choice${state.mode !== 'private' ? ' on' : ''}">
        <input type="radio" name="visibility" value="public" ${state.mode !== 'private' ? 'checked' : ''}>
        <b>عمومی</b><span>برای افراد انتخاب‌شده</span>
      </label>
    </div>
    <div class="brief-public"${state.mode === 'private' ? ' hidden' : ''}>
      <div class="brief-modes" role="radiogroup" aria-label="محدوده انتشار">
        <label class="brief-choice${state.scope !== 'units' ? ' on' : ''}">
          <input type="radio" name="audienceScope" value="all" ${state.scope !== 'units' ? 'checked' : ''}>
          <b>همه</b><span>هر واحد و هر کسی که گزارش‌نویسی دارد</span>
        </label>
        <label class="brief-choice${state.scope === 'units' ? ' on' : ''}">
          <input type="radio" name="audienceScope" value="units" ${state.scope === 'units' ? 'checked' : ''}>
          <b>واحدهای انتخابی</b><span>چند واحد، و در صورت نیاز چند نفر از همان‌ها</span>
        </label>
      </div>
      <div class="brief-pick"${state.mode === 'private' || state.scope !== 'units' ? ' hidden' : ''}>
        ${cards || `<p class="brief-note">${esc(BRIEF_OPTIONS_ERR || 'واحدی که عضوش گزارش‌نویسی داشته باشد پیدا نشد.')}${BRIEF_OPTIONS_ERR ? ' <button type="button" onclick="loadBriefOptions(true)">تلاش دوباره</button>' : ''}</p>`}
      </div>
    </div>
    <p class="brief-reach">${esc(reachFromState(state, units))}</p>
  </fieldset>`;
}

function briefMeta(row) {
  const units = (row.unitNames || []).join('، ');
  const edited = row.updatedAt && row.updatedAt !== row.createdAt;
  return `<div class="brief-meta">
    <span>نویسنده: ${esc(row.authorName || row.authorUser || '')}</span>
    <span>واحد: ${esc(units || '—')}</span>
    ${briefShareBadge(row)}
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
      <p class="brief-note">${row.mine ? 'این گزارش برای شما قابل ویرایش است. هر ذخیره، متن قبلی و ساعت تغییر را در امنیت و اطلاعات پنل مدیریت ثبت می‌کند.' : 'این گزارش برای شما منتشر شده است. فقط نویسنده‌اش می‌تواند آن را ویرایش کند.'}</p>
      <p class="brief-body">${esc(row.body || '')}</p>
    </article>
    ${typeof filesPanel === 'function' ? filesPanel('report', row.id, { mine: !!row.mine }) : ''}
  </section>`;
}

function briefEditor(row) {
  if (!BRIEF_OPTIONS && !BRIEF_OPTIONS_ERR) {
    loadBriefOptions();
    return empty('در حال دریافت واحدها و کاربران…');
  }
  const fresh = !row;
  const state = editorState(row);
  const units = BRIEF_OPTIONS?.units || [];
  const title = briefDraft?.title ?? row?.title ?? '';
  const text = briefDraft?.text ?? row?.body ?? '';
  return `<section class="brief-page">
    <form class="brief-form" onsubmit="saveBrief(event)">
      <div class="brief-actions">
        <button type="button" onclick="${fresh ? "go('brief')" : 'cancelBrief()'}">انصراف</button>
      </div>
      <h2>${fresh ? 'گزارش جدید' : 'ویرایش گزارش'}</h2>
      ${row ? briefMeta(row) : '<p class="brief-note">با ثبت، تاریخ و ساعت همین لحظه روی گزارش می‌ماند و فقط خودتان بعداً می‌توانید آن را ویرایش کنید.</p>'}
      <label>عنوان<input name="title" maxlength="180" required value="${esc(title)}" autocomplete="off"></label>
      <label>متن گزارش<textarea name="text" maxlength="20000" required>${esc(text)}</textarea></label>
      ${briefPublish(state, units, fresh)}
      ${fresh ? `<div class="brief-files">
        <label>نوع پیوست<select name="category"><option>پیوست گزارش</option><option>سند</option><option>تصویر</option><option>سایر</option></select></label>
        <label>فایل پیوست — PDF، تصویر، Word یا Excel، تا ۸ مگابایت<input name="files" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx"></label>
      </div>` : '<p class="brief-note">پیوست‌ها را پایین همین صفحه اضافه یا حذف کنید. حذف و افزودن فایل هم در امنیت و اطلاعات ثبت می‌شود.</p>'}
      <div class="brief-actions"><button class="pri" type="submit">${fresh ? 'ثبت و انتشار' : 'ذخیره تغییرات'}</button></div>
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

function syncBriefPublish(node) {
  const form = node?.classList?.contains('brief-form') ? node : node?.closest?.('form');
  if (!form) return;
  const visibility = form.querySelector('[name=visibility]:checked')?.value || 'public';
  form.querySelectorAll('.brief-choice').forEach((el) => {
    el.classList.toggle('on', !!el.querySelector('input')?.checked);
  });
  const pub = form.querySelector('.brief-public');
  if (pub) pub.hidden = visibility !== 'public';
  const scope = form.querySelector('[name=audienceScope]:checked')?.value || 'all';
  const pick = form.querySelector('.brief-pick');
  if (pick) pick.hidden = visibility !== 'public' || scope !== 'units';
  form.querySelectorAll('[data-unit]').forEach((block) => {
    const on = !!block.querySelector('[name=unit]')?.checked;
    block.classList.toggle('on', on);
    const people = block.querySelector('.brief-people');
    if (people) people.hidden = !on;
    const who = block.querySelector('[data-who]:checked')?.value || 'all';
    const list = block.querySelector('.brief-people-list');
    const search = block.querySelector('.brief-person-search');
    if (list) list.hidden = !on || who !== 'picked';
    if (search) search.hidden = !on || who !== 'picked';
  });
  const reach = form.querySelector('.brief-reach');
  if (reach) reach.textContent = briefReachText(form);
}

function briefReachText(form) {
  const visibility = form.querySelector('[name=visibility]:checked')?.value;
  if (visibility !== 'public') return 'این گزارش فقط برای خودتان نمایش داده می‌شود.';
  const scope = form.querySelector('[name=audienceScope]:checked')?.value;
  if (scope !== 'units') return 'برای همه واحدها و هر کاربری که گزارش‌نویسی دارد منتشر می‌شود.';
  const parts = [...form.querySelectorAll('[data-unit]')].filter((block) => block.querySelector('[name=unit]')?.checked).map((block) => {
    const name = block.getAttribute('data-name') || 'واحد';
    const who = block.querySelector('[data-who]:checked')?.value || 'all';
    if (who !== 'picked') return name + '، همه کاربران';
    const people = [...block.querySelectorAll('[name=person]:checked')].map((input) => input.getAttribute('data-name')).filter(Boolean);
    return name + (people.length ? '، ' + people.join('، ') : '، کسی انتخاب نشده');
  });
  if (!parts.length) return 'واحدها را انتخاب کنید تا گزارش فقط برای همان‌ها منتشر شود.';
  return 'منتشر می‌شود برای: ' + parts.join(' · ');
}

function filterBriefPeople(input) {
  const query = input.value.trim().toLowerCase();
  const list = input.parentElement?.querySelector('.brief-people-list');
  if (!list) return;
  list.querySelectorAll('.brief-person-check').forEach((el) => {
    const hay = (el.getAttribute('data-find') || '').toLowerCase();
    el.hidden = !!query && !hay.includes(query);
  });
}

function collectBriefAudience(form) {
  const visibility = form.querySelector('[name=visibility]:checked')?.value === 'private' ? 'private' : 'public';
  const audienceScope = form.querySelector('[name=audienceScope]:checked')?.value === 'units' ? 'units' : 'all';
  const audienceUnits = [];
  let error = '';
  form.querySelectorAll('[data-unit]').forEach((block) => {
    if (!block.querySelector('[name=unit]')?.checked) return;
    const who = block.querySelector('[data-who]:checked')?.value || 'all';
    const userIds = who === 'picked'
      ? [...block.querySelectorAll('[name=person]:checked')].map((input) => input.value).filter(briefUserId)
      : [];
    if (visibility === 'public' && audienceScope === 'units' && who === 'picked' && !userIds.length && !error) {
      error = 'برای افراد خاص، حداقل یک نفر را انتخاب کنید';
    }
    audienceUnits.push({
      id: block.getAttribute('data-unit'),
      everyone: who !== 'picked',
      userIds,
    });
  });
  if (visibility === 'public' && audienceScope === 'units' && !audienceUnits.length && !error) {
    error = 'حداقل یک واحد را برای انتشار انتخاب کنید';
  }
  return { visibility, audienceScope, audienceUnits, error };
}

function rememberBriefDraft() {
  const form = document.querySelector('#main .brief-form');
  if (!form) return;
  briefDraft = {
    title: form.querySelector('[name=title]')?.value || '',
    text: form.querySelector('[name=text]')?.value || '',
    audience: collectBriefAudience(form),
  };
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
  const audience = collectBriefAudience(form);
  if (audience.error) {
    toast(audience.error);
    return;
  }
  const title = form.querySelector('[name=title]').value;
  const text = form.querySelector('[name=text]').value;
  const fresh = V.id === 'new';
  button.disabled = true;
  try {
    const row = await api(fresh ? '/api/reports' : '/api/reports/' + encodeURIComponent(V.id), {
      method: fresh ? 'POST' : 'PUT',
      body: JSON.stringify({
        title,
        body: text,
        visibility: audience.visibility,
        audienceScope: audience.audienceScope,
        audienceUnits: audience.audienceUnits,
      }),
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
    if (fresh && BRIEF_OPTIONS) {
      BRIEF_OPTIONS.preset = {
        mode: audience.visibility,
        scope: audience.audienceScope,
        units: audience.audienceUnits.map((unit) => ({
          id: unit.id,
          everyone: unit.everyone !== false,
          userIds: unit.everyone === false ? unit.userIds : [],
        })),
      };
    }
    briefDraft = null;
    BRIEF = row;
    BRIEF_ROWS = null;
    V = { n: 'bd', id: row.id };
    remember();
    render();
    const published = audience.visibility === 'private' ? 'گزارش خصوصی ثبت شد' : 'گزارش منتشر شد';
    toast(fileError ? 'گزارش ذخیره شد، اما پیوست ارسال نشد: ' + fileError : (fresh ? published : 'تغییرها ذخیره شد'));
  } catch (error) {
    if (error.message && error.message !== 'auth') toast(error.message);
    button.disabled = false;
  }
}
