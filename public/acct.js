/* بخش حسابداری و چک‌ها – وابسته به توابع سراسری app.js */
(function () {
  const PARTY_KIND = {
    cust: 'مشتری',
    staff: 'عضو تیم شرکت',
    contractor: 'پیمانکار',
  };
  const CHECK_STATUS = {
    pending: 'نزد صندوق / در جریان',
    cleared: 'وصول‌شده',
    bounced: 'برگشتی',
    returned: 'مسترد',
    cancelled: 'باطل',
  };
  const RANGE_OPTS = [
    ['week', 'هفتگی'],
    ['month', 'ماهانه'],
    ['year', 'سالانه'],
    ['custom', 'بازه سفارشی'],
  ];

  let ACCT_TAB = 'home';
  let ACCT_RANGE = 'month';
  let ACCT_FROM = '';
  let ACCT_TO = '';
  let CHECK_FILTER = 'all';
  let HOME_TYPE = 'all';

  const canAcctWrite = () => can('write') || can('admin') || can('acct');
  const partyOf = (id) => (S.parties || []).find((p) => p.id === id);
  const checkOf = (id) => (S.checks || []).find((c) => c.id === id);
  const partyKindLabel = (k) => PARTY_KIND[k] || k || '—';
  const checkStatusLabel = (k) => CHECK_STATUS[k] || k || '—';
  const isCheckRow = (r) => r && (r.source === 'check' || !!r.checkId);

  function ensureAcctState() {
    if (!Array.isArray(S.parties)) S.parties = [];
    if (!Array.isArray(S.ledger)) S.ledger = [];
    if (!Array.isArray(S.checks)) S.checks = [];
  }

  function partyByCust(custId) {
    return (S.parties || []).find((p) => p.custId === custId && p.kind === 'cust');
  }

  /** Find or create accounting party linked to CRM customer — single source of truth. */
  function ensurePartyForCustomer(custId) {
    ensureAcctState();
    const c = (S.customers || []).find((x) => x.id === custId);
    if (!c) return null;
    let p = partyByCust(custId);
    if (p) {
      // Keep identity fields in sync with CRM
      p.name = c.name || p.name;
      p.phone = N(c.phone || p.phone || '');
      p.nid = N(c.nid || p.nid || '');
      return p;
    }
    p = {
      id: uid(),
      name: c.name,
      kind: 'cust',
      title: '',
      phone: N(c.phone || ''),
      nid: N(c.nid || ''),
      custId: c.id,
      note: 'همگام با پرونده مشتری',
    };
    S.parties.push(p);
    return p;
  }

  function resolvePartyRef(ref) {
    const raw = String(ref || '');
    if (raw.startsWith('cust:')) {
      const p = ensurePartyForCustomer(raw.slice(5));
      if (p) save();
      return p;
    }
    return partyOf(raw);
  }

  /** Parties + CRM customers not yet linked — pick customer without redefining. */
  function partyOpts() {
    ensureAcctState();
    const linked = new Set((S.parties || []).filter((p) => p.custId).map((p) => p.custId));
    const fromParties = (S.parties || [])
      .slice()
      .sort((a, b) => (a.name < b.name ? -1 : 1))
      .map((p) => {
        const tag = p.custId ? 'مشتری CRM' : partyKindLabel(p.kind);
        return [p.id, `${p.name} – ${tag}${p.nid ? ' · ' + p.nid : ''}${p.phone ? ' · ' + p.phone : ''}`];
      });
    const fromCust = (S.customers || [])
      .filter((c) => !linked.has(c.id))
      .slice()
      .sort((a, b) => (a.name < b.name ? -1 : 1))
      .map((c) => [`cust:${c.id}`, `${c.name} – مشتری CRM (جدید)${c.nid ? ' · ' + c.nid : ''}${c.phone ? ' · ' + c.phone : ''}`]);
    return fromParties.concat(fromCust);
  }

  function syncAllCustomersAsParties() {
    if (!canAcctWrite()) return toast('اجازه ثبت ندارید');
    ensureAcctState();
    let n = 0;
    (S.customers || []).forEach((c) => {
      if (!partyByCust(c.id)) {
        ensurePartyForCustomer(c.id);
        n += 1;
      } else ensurePartyForCustomer(c.id);
    });
    save();
    render();
    toast(n ? `${F(n)} مشتری به اشخاص حسابداری اضافه شد` : 'همه مشتریان از قبل در حسابداری بودند و همگام شدند');
  }

  function openAcctForCustomer(custId) {
    if (!can('acct') && !can('admin')) return toast('به حسابداری دسترسی ندارید');
    const p = ensurePartyForCustomer(custId);
    if (!p) return toast('مشتری پیدا نشد');
    save();
    go('ad', p.id);
  }

  function partyBalance(partyId, rows) {
    const list = rows || (S.ledger || []).filter((r) => r.party === partyId);
    const debit = sum(list.filter((r) => r.type === 'in'), (r) => r.amt);
    const credit = sum(list.filter((r) => r.type === 'out'), (r) => r.amt);
    return { debit, credit, bal: debit - credit, rows: list };
  }

  function balLabel(bal) {
    if (!bal) return 'تسویه';
    return bal > 0
      ? `شخص به شرکت بدهکار · ${money(bal)} تومان`
      : `شرکت به شخص بدهکار · ${money(-bal)} تومان`;
  }

  function balShort(bal) {
    if (!bal) return 'تسویه';
    return bal > 0 ? `بدهکار ${money(bal)}` : `بستانکار ${money(-bal)}`;
  }

  function balCells(bal) {
    return {
      deb: bal > 0 ? money(bal) : '—',
      cre: bal < 0 ? money(-bal) : '—',
    };
  }

  function sortLedgerAsc(a, b) {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return String(a.id || '').localeCompare(String(b.id || ''));
  }

  /** مانده قبل از تاریخ شروع بازه (برای ریزگزارش با مانده جاری) */
  function openingBalance(partyId, from) {
    if (!from) return 0;
    const prior = (S.ledger || []).filter((r) => r.party === partyId && normJ(r.date) && normJ(r.date) < from);
    return partyBalance(partyId, prior).bal;
  }

  /** تراکنش‌های بازه + مانده پس از هر ردیف (ترتیب زمانی) */
  function detailLedger(partyId) {
    const bounds = rangeBounds(ACCT_RANGE, ACCT_FROM, ACCT_TO);
    const rows = (S.ledger || [])
      .filter((r) => r.party === partyId && inRange(r.date, bounds.from, bounds.to))
      .slice()
      .sort(sortLedgerAsc);
    let bal = openingBalance(partyId, bounds.from);
    const open = bal;
    const mapped = rows.map((r) => {
      bal += r.type === 'in' ? Number(r.amt) || 0 : -(Number(r.amt) || 0);
      return { ...r, runBal: bal };
    });
    const debit = sum(mapped.filter((r) => r.type === 'in'), (r) => r.amt);
    const credit = sum(mapped.filter((r) => r.type === 'out'), (r) => r.amt);
    return { bounds, rows: mapped, open, bal, debit, credit };
  }

  function partiesSummary() {
    const bounds = rangeBounds(ACCT_RANGE, ACCT_FROM, ACCT_TO);
    return (S.parties || [])
      .slice()
      .sort((a, b) => (a.name < b.name ? -1 : 1))
      .map((p) => {
        const all = partyBalance(p.id);
        const inRangeRows = (S.ledger || []).filter((r) => r.party === p.id && inRange(r.date, bounds.from, bounds.to));
        const ranged = partyBalance(p.id, inRangeRows);
        return { party: p, all, ranged };
      });
  }

  function rangeBounds(mode, from, to) {
    const t = todayJ();
    const [y, m] = pj(t);
    if (mode === 'week') return { from: addD(t, -6), to: t, label: 'هفت روز اخیر' };
    if (mode === 'month') return { from: fj(y, m, 1), to: t, label: `ماه ${MN[m - 1]} ${F(y)}` };
    if (mode === 'year') return { from: fj(y, 1, 1), to: t, label: `سال ${F(y)}` };
    const a = normJ(from) || '';
    const b = normJ(to) || t;
    if (!a) return { from: '', to: b, label: 'بازه سفارشی (تاریخ شروع را انتخاب کنید)' };
    return { from: a, to: b, label: `از ${F(a)} تا ${F(b)}` };
  }

  function inRange(date, from, to) {
    const d = normJ(date);
    if (!d) return false;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  }

  function filteredLedger(partyId) {
    const bounds = rangeBounds(ACCT_RANGE, ACCT_FROM, ACCT_TO);
    const rows = (S.ledger || [])
      .filter((r) => r.party === partyId && inRange(r.date, bounds.from, bounds.to))
      .slice()
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    return { bounds, rows, ...partyBalance(partyId, rows) };
  }

  function filteredAllLedger() {
    const bounds = rangeBounds(ACCT_RANGE, ACCT_FROM, ACCT_TO);
    let rows = (S.ledger || [])
      .filter((r) => inRange(r.date, bounds.from, bounds.to))
      .slice()
      .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
    if (HOME_TYPE === 'in' || HOME_TYPE === 'out') rows = rows.filter((r) => r.type === HOME_TYPE);
    const debit = sum(rows.filter((r) => r.type === 'in'), (r) => r.amt);
    const credit = sum(rows.filter((r) => r.type === 'out'), (r) => r.amt);
    return { bounds, rows, debit, credit, bal: debit - credit };
  }

  function rangeToolbar(extra = '') {
    const rangeBtns = RANGE_OPTS.map(([k, l]) =>
      `<button type=button class=f ${ACCT_RANGE === k ? 'aria-pressed=true' : 'aria-pressed=false'} onclick="setAcctRange('${k}')">${l}</button>`).join('');
    return `<div class="u-tools" style="margin-bottom:10px">${rangeBtns}${extra}</div>
    ${ACCT_RANGE === 'custom' ? `<div class=acct-range noprint>
      <label>از تاریخ<input readonly style="cursor:pointer" value="${ACCT_FROM ? F(ACCT_FROM) : ''}" placeholder="انتخاب" onclick="dpick(this,d=>setAcctCustom('from',d))"></label>
      <label>تا تاریخ<input readonly style="cursor:pointer" value="${ACCT_TO ? F(ACCT_TO) : ''}" placeholder="انتخاب" onclick="dpick(this,d=>setAcctCustom('to',d))"></label>
    </div>` : ''}`;
  }

  function filteredChecks() {
    const bounds = rangeBounds(ACCT_RANGE, ACCT_FROM, ACCT_TO);
    let rows = (S.checks || []).filter((c) => inRange(c.regDate || c.checkDate, bounds.from, bounds.to));
    if (CHECK_FILTER === 'in' || CHECK_FILTER === 'out') rows = rows.filter((c) => c.type === CHECK_FILTER);
    rows = rows.slice().sort((a, b) => ((a.regDate || a.dueDate || '') < (b.regDate || b.dueDate || '') ? -1 : 1));
    const debit = sum(rows.filter((c) => c.type === 'in' && c.status !== 'cancelled'), (c) => c.amt);
    const credit = sum(rows.filter((c) => c.type === 'out' && c.status !== 'cancelled'), (c) => c.amt);
    return { bounds, rows, debit, credit };
  }

  function ledgerDescHtml(r) {
    const base = esc(r.desc || '—');
    if (!isCheckRow(r)) return base;
    return `${base}<div class="acct-check-tag">(چک)</div>`;
  }

  function ledgerDescPrint(r) {
    const base = r.desc || '—';
    return isCheckRow(r) ? `${base} (چک)` : base;
  }

  function checkLedgerDesc(ch) {
    const parts = [];
    parts.push(ch.type === 'in' ? 'چک دریافتی' : 'چک پرداختی');
    if (ch.bank) parts.push(`بانک ${ch.bank}`);
    if (ch.sayad) parts.push(`صیاد ${ch.sayad}`);
    else if (ch.serial) parts.push(`سریال ${ch.serial}`);
    if (ch.dueDate) parts.push(`سررسید ${ch.dueDate}`);
    if (ch.desc) parts.push(ch.desc);
    return parts.join(' · ');
  }

  function syncCheckLedger(ch) {
    ensureAcctState();
    const existing = ch.ledgerId ? (S.ledger || []).find((r) => r.id === ch.ledgerId) : null;
    if (ch.status === 'cancelled') {
      if (existing) S.ledger = S.ledger.filter((r) => r.id !== existing.id);
      ch.ledgerId = '';
      return;
    }
    const payload = {
      party: ch.party,
      date: ch.regDate || ch.checkDate || todayJ(),
      type: ch.type,
      amt: ch.amt,
      desc: checkLedgerDesc(ch),
      ref: ch.sayad || ch.serial || '',
      by: ch.by || '',
      source: 'check',
      checkId: ch.id,
    };
    if (existing) {
      Object.assign(existing, payload);
      ch.ledgerId = existing.id;
    } else {
      const id = uid();
      S.ledger.push({ id, ...payload });
      ch.ledgerId = id;
    }
  }

  function setAcctTab(tab) {
    ACCT_TAB = tab === 'checks' ? 'checks' : tab === 'parties' ? 'parties' : 'home';
    render();
  }

  function setCheckFilter(f) {
    CHECK_FILTER = f;
    render();
  }

  function setHomeType(f) {
    HOME_TYPE = f;
    render();
  }

  function acctTabs() {
    return `<div class="u-tools acct-tabs noprint" style="margin-bottom:12px">
      <button type=button class=f ${ACCT_TAB === 'home' ? 'aria-pressed=true' : 'aria-pressed=false'} onclick="setAcctTab('home')">کلی</button>
      <button type=button class=f ${ACCT_TAB === 'parties' ? 'aria-pressed=true' : 'aria-pressed=false'} onclick="setAcctTab('parties')">اشخاص</button>
      <button type=button class=f ${ACCT_TAB === 'checks' ? 'aria-pressed=true' : 'aria-pressed=false'} onclick="setAcctTab('checks')">چک‌ها</button>
    </div>`;
  }

  function acctV() {
    if (!can('acct') && !can('admin')) return empty('به بخش حسابداری دسترسی ندارید');
    ensureAcctState();
    if (ACCT_TAB === 'checks') return checksV();
    if (ACCT_TAB === 'parties') return partiesV();
    return homeV();
  }

  function homeV() {
    const rep = filteredAllLedger();
    const typeBtns = [['all', 'همه'], ['in', 'دریافتی'], ['out', 'پرداختی']].map(([k, l]) =>
      `<button type=button class=f ${HOME_TYPE === k ? 'aria-pressed=true' : 'aria-pressed=false'} onclick="setHomeType('${k}')">${l}</button>`).join('');
    return `<div class=top>
      <h2>حسابداری</h2>
      <div>
        ${canAcctWrite() ? `<button class="pri" onclick="quickPay()">ثبت پرداخت / دریافت</button>
        <button class="btn-soft" onclick="quickCheck()">ثبت چک</button>` : ''}
        <button class=btn-ghost onclick="openAcctReport()">گزارش‌ها</button>
      </div>
    </div>
    ${acctTabs()}
    <p class=fd style="margin:0 0 12px">نمای کلی پرداختی‌ها و دریافتی‌ها در بازه انتخابی. برای پرونده و گزارش اختصاصی هر نفر به تب «اشخاص» بروید.</p>
    ${rangeToolbar(`<span class=vr></span>${typeBtns}`)}
    <div class=stats style="margin-bottom:12px">
      <div class=st><b>${F(rep.rows.length)}</b><span>تراکنش در بازه</span></div>
      <div class=st><b>${money(rep.debit)}</b><span>جمع دریافتی</span></div>
      <div class=st><b>${money(rep.credit)}</b><span>جمع پرداختی</span></div>
      <div class=st><b>${money(Math.abs(rep.bal))}</b><span>${rep.bal > 0 ? 'خالص دریافتی' : rep.bal < 0 ? 'خالص پرداختی' : 'تسویه'}</span></div>
    </div>
    <p class=fd style="margin:0 0 10px">بازه: <b>${esc(rep.bounds.label)}</b></p>
    ${rep.rows.length ? tbl(
      ['تاریخ', 'طرف حساب', 'نوع', 'مبلغ', 'شرح', 'پیگیری', ''],
      rep.rows.map((r) => {
        const p = partyOf(r.party);
        const actions = [
          p ? `<button class=sm onclick="go('ad','${p.id}')">پرونده</button>` : '',
          canAcctWrite() && isCheckRow(r) ? `<button class=sm onclick="editCheck('${r.checkId}')">چک</button>` : '',
          canAcctWrite() ? `<button class="sm btn-ghost danger" onclick="delLedger('${r.id}')">حذف</button>` : '',
        ].filter(Boolean).join(' ');
        return `<tr data-s="${esc(N((p?.name || '') + (r.desc || '') + (r.ref || '')))}">
          <td>${F(r.date)}</td>
          <td>${esc(p?.name || '—')}</td>
          <td>${r.type === 'in' ? 'دریافتی' : 'پرداختی'}</td>
          <td>${money(r.amt)}</td>
          <td style="white-space:normal;text-align:right">${ledgerDescHtml(r)}</td>
          <td>${r.ref ? F(r.ref) : '—'}</td>
          <td>${actions}</td>
        </tr>`;
      }).join(''),
    ) : empty('در این بازه تراکنشی ثبت نشده است.')}
    ${sb()}`;
  }

  function partiesV() {
    const list = (S.parties || []).slice().sort((a, b) => (a.name < b.name ? -1 : 1));
    const linked = new Set(list.filter((p) => p.custId).map((p) => p.custId));
    const orphans = (S.customers || []).filter((c) => !linked.has(c.id)).sort((a, b) => (a.name < b.name ? -1 : 1));
    return `<div class=top>
      <h2>اشخاص طرف حساب</h2>
      <div>
        ${canAcctWrite() ? `<button class="btn-soft" onclick="addParty()"><span class=plus>+</span> شخص جدید</button>
        <button class="btn-soft" onclick="syncAllCustomersAsParties()">همگام‌سازی مشتریان CRM</button>` : ''}
      </div>
    </div>
    ${acctTabs()}
    <p class=fd style="margin:0 0 12px">مشتریان CRM را دوباره تعریف نکنید؛ از لیست مشتری انتخاب کنید یا «همگام‌سازی» بزنید. برای پرداخت/چک هم همان لیست یکپارچه است.</p>
    ${sb()}
    <div class=cards>${list.map((p) => {
      const b = partyBalance(p.id);
      const custTag = p.custId ? ' · لینک CRM' : '';
      return `<div class=card data-s="${esc(N(p.name + (p.title || '') + (p.phone || '') + (p.nid || '') + partyKindLabel(p.kind)))}" onclick="go('ad','${p.id}')">
        <b>${esc(p.name)}</b>
        <small>${esc(partyKindLabel(p.kind))}${custTag}${p.title ? ' · ' + esc(p.title) : ''}${p.phone ? ' · ' + F(p.phone) : ''}</small>
        <div class=meta>
          <span>دریافتی ${money(b.debit)}</span>
          <span>پرداختی ${money(b.credit)}</span>
          <span>${esc(balShort(b.bal))}</span>
        </div>
      </div>`;
    }).join('') || empty('هنوز شخصی ثبت نشده است.')}</div>
    ${orphans.length ? `<h3 style="margin-top:18px">مشتریان CRM بدون پرونده حسابداری <span class=count>${F(orphans.length)}</span></h3>
    <div class=cards>${orphans.map((c) => `<div class=card data-s="${esc(N(c.name + c.nid + c.phone))}" onclick="openAcctForCustomer('${c.id}')">
      <b>${esc(c.name)}</b>
      <small>مشتری CRM · ${F(c.nid || '—')} · ${F(c.phone || '—')}</small>
      <div class=meta><span>برای باز کردن حسابداری کلیک کنید</span></div>
    </div>`).join('')}</div>` : ''}`;
  }

  function checksV() {
    ensureAcctState();
    const rep = filteredChecks();
    const typeBtns = [['all', 'همه'], ['in', 'دریافتی'], ['out', 'پرداختی']].map(([k, l]) =>
      `<button type=button class=f ${CHECK_FILTER === k ? 'aria-pressed=true' : 'aria-pressed=false'} onclick="setCheckFilter('${k}')">${l}</button>`).join('');

    return `<div class=top>
      <h2>چک‌ها</h2>
      <div>
        ${canAcctWrite() ? `<button class="pri" onclick="quickCheck()">ثبت چک</button>` : ''}
        <button class=btn-ghost onclick="openChecksReport()">چاپ گزارش چک‌ها</button>
      </div>
    </div>
    ${acctTabs()}
    <p class=fd style="margin:0 0 12px">چک‌های دریافتی و پرداختی با جزئیات کامل؛ همزمان در دفترکل کلی و پرونده شخص با برچسب «(چک)» دیده می‌شوند.</p>
    ${rangeToolbar(`<span class=vr></span>${typeBtns}`)}
    <div class=stats style="margin-bottom:12px">
      <div class=st><b>${F(rep.rows.length)}</b><span>فقره در بازه</span></div>
      <div class=st><b>${money(rep.debit)}</b><span>جمع دریافتی</span></div>
      <div class=st><b>${money(rep.credit)}</b><span>جمع پرداختی</span></div>
      <div class=st><b>${esc(rep.bounds.label)}</b><span>بازه</span></div>
    </div>
    ${rep.rows.length ? tbl(
      ['نوع', 'طرف حساب', 'مبلغ', 'تاریخ ثبت', 'تاریخ چک', 'سررسید', 'بانک', 'صیاد/سریال', 'وضعیت', ''],
      rep.rows.map((c) => {
        const p = partyOf(c.party);
        return `<tr data-s="${esc(N((p?.name || '') + (c.sayad || '') + (c.serial || '') + (c.bank || '')))}">
          <td>${c.type === 'in' ? 'دریافتی' : 'پرداختی'}</td>
          <td>${esc(p?.name || '—')}</td>
          <td>${money(c.amt)}</td>
          <td>${F(c.regDate || '—')}</td>
          <td>${c.checkDate ? F(c.checkDate) : '—'}</td>
          <td>${c.dueDate ? F(c.dueDate) : '—'}</td>
          <td>${esc(c.bank || '—')}</td>
          <td>${F(c.sayad || c.serial || '—')}</td>
          <td>${esc(checkStatusLabel(c.status))}</td>
          <td>${canAcctWrite() ? `<button class=sm onclick="editCheck('${c.id}')">ویرایش</button> <button class="sm btn-ghost danger" onclick="delCheck('${c.id}')">حذف</button>` : ''}</td>
        </tr>`;
      }).join(''),
    ) : empty('در این بازه چکی ثبت نشده است.')}
    ${sb()}`;
  }

  function partyFields(init) {
    init = init || {};
    const linkedElse = new Set((S.parties || []).filter((p) => p.custId && p.id !== init.id).map((p) => p.custId));
    const custOpts = [['', '— انتخاب مشتری CRM —']].concat(
      (S.customers || [])
        .filter((c) => !linkedElse.has(c.id) || c.id === init.custId)
        .map((c) => [c.id, `${c.name} – ${c.nid || '—'} – ${c.phone || '—'}`]),
    );
    return [
      { k: 'kind', l: 'نوع', t: 'select', o: Object.entries(PARTY_KIND), r: 1 },
      { k: 'custId', l: 'مشتری CRM (برای نوع مشتری اجباری)', t: 'search', o: custOpts, w: 1 },
      { k: 'name', l: 'نام (برای عضو تیم / پیمانکار)', r: 1 },
      { k: 'title', l: 'سمت / پوزیشن' },
      { k: 'phone', l: 'شماره تماس' },
      { k: 'nid', l: 'کد ملی (اختیاری)' },
      { k: 'note', l: 'توضیحات', t: 'area', w: 1 },
    ];
  }

  function buildPartyFromForm(v, existingId) {
    if (v.kind === 'cust') {
      if (!v.custId) { toast('برای نوع مشتری، یک مشتری CRM انتخاب کنید'); return null; }
      const dup = (S.parties || []).find((p) => p.custId === v.custId && p.id !== existingId);
      if (dup) { toast('این مشتری قبلاً در حسابداری تعریف شده است'); return null; }
      const c = (S.customers || []).find((x) => x.id === v.custId);
      if (!c) { toast('مشتری پیدا نشد'); return null; }
      return {
        name: c.name,
        kind: 'cust',
        title: v.title || '',
        phone: N(c.phone || ''),
        nid: N(c.nid || ''),
        custId: c.id,
        note: v.note || '',
      };
    }
    if (!v.name) { toast('نام را وارد کنید'); return null; }
    const phone = N(v.phone || '');
    const nid = N(v.nid || '');
    if (nid && typeof findCustByNid === 'function') {
      const byNid = findCustByNid(nid);
      if (byNid) { toast(`کد ملی «${F(nid)}» تکراری است — قبلاً برای مشتری «${byNid.name}» ثبت شده`); return null; }
    }
    if (phone && typeof findCustByPhone === 'function') {
      const byPhone = findCustByPhone(phone);
      if (byPhone) { toast(`شماره تماس «${F(phone)}» تکراری است — قبلاً برای مشتری «${byPhone.name}» ثبت شده`); return null; }
    }
    const dig = (s) => N(String(s || '')).replace(/[^\d]/g, '');
    const nidKey = dig(nid);
    const phoneKey = dig(phone);
    const other = (S.parties || []).find((p) => p.id !== existingId && p.kind !== 'cust' && (
      (nidKey && dig(p.nid) === nidKey) || (phoneKey && dig(p.phone) === phoneKey)
    ));
    if (other && nidKey && dig(other.nid) === nidKey) {
      toast(`کد ملی «${F(nid)}» تکراری است — قبلاً برای «${other.name}» در حسابداری ثبت شده`);
      return null;
    }
    if (other && phoneKey && dig(other.phone) === phoneKey) {
      toast(`شماره تماس «${F(phone)}» تکراری است — قبلاً برای «${other.name}» در حسابداری ثبت شده`);
      return null;
    }
    return {
      name: v.name,
      kind: v.kind,
      title: v.title || '',
      phone,
      nid,
      custId: '',
      note: v.note || '',
    };
  }

  function addParty() {
    if (!canAcctWrite()) return toast('اجازه ثبت ندارید');
    form('شخص حسابداری جدید', partyFields(), { kind: 'cust' }, (v) => {
      ensureAcctState();
      const row = buildPartyFromForm(v);
      if (!row) return false;
      askConfirm({ title: 'تأیید ثبت شخص', body: `<p><b>${esc(row.name)}</b> به‌عنوان ${esc(partyKindLabel(row.kind))} ثبت شود؟</p>` }, () => {
        S.parties.push({ id: uid(), ...row });
        save();
        render();
        toast('شخص ثبت شد');
        return true;
      });
      return false;
    });
  }

  function editParty(id) {
    if (!canAcctWrite()) return toast('اجازه ویرایش ندارید');
    const p = partyOf(id);
    if (!p) return;
    form('ویرایش شخص حسابداری', partyFields(p), p, (v) => {
      const next = buildPartyFromForm(v, id);
      if (!next) return false;
      askConfirm({ title: 'تأیید ذخیره', body: `<p>تغییرات «${esc(next.name)}» ذخیره شود؟</p>` }, () => {
        Object.assign(p, next);
        save();
        render();
        toast('شخص به‌روز شد');
        return true;
      });
      return false;
    });
  }

  function delParty(id) {
    if (!canAcctWrite()) return toast('اجازه حذف ندارید');
    const p = partyOf(id);
    if (!p) return;
    const n = (S.ledger || []).filter((r) => r.party === id).length;
    const cn = (S.checks || []).filter((c) => c.party === id).length;
    askConfirm({
      title: 'حذف شخص',
      body: `<p>«${esc(p.name)}» حذف شود؟${n ? ` <b>${F(n)}</b> تراکنش` : ''}${cn ? ` و <b>${F(cn)}</b> چک` : ''}${n || cn ? ' مرتبط هم حذف می‌شود.' : ''}</p>`,
      okLabel: 'بله، حذف شود',
      danger: true,
    }, () => {
      S.parties = (S.parties || []).filter((x) => x.id !== id);
      S.ledger = (S.ledger || []).filter((r) => r.party !== id);
      S.checks = (S.checks || []).filter((c) => c.party !== id);
      save();
      go('acct');
      return true;
    });
  }

  function quickPay(pre) {
    if (!canAcctWrite()) return toast('اجازه ثبت ندارید');
    ensureAcctState();
    const parties = partyOpts();
    if (!parties.length) return toast('ابتدا مشتری CRM یا شخص حسابداری تعریف کنید');
    pre = pre || {};
    form('ثبت پرداخت / دریافت', [
      { k: 'type', l: 'نوع تراکنش', t: 'select', o: [['in', 'دریافتی'], ['out', 'پرداختی']], r: 1 },
      { k: 'party', l: 'طرف حساب (مشتری یا شخص)', t: 'search', o: parties, r: 1, w: 1 },
      { k: 'amt', l: 'مبلغ (تومان)', t: 'money', r: 1 },
      { k: 'date', l: 'تاریخ', d: todayJ(), j: 1, r: 1 },
      { k: 'desc', l: 'شرح', t: 'area', w: 1, r: 1 },
      { k: 'ref', l: 'شماره پیگیری / فیش' },
      { k: 'by', l: 'ثبت‌کننده', r: 1, d: S.me || ME.name || '' },
    ], { type: pre.type || 'in', party: pre.party || parties[0][0] }, (v) => {
      if (!(v.amt > 0)) { toast('مبلغ معتبر نیست'); return false; }
      const p = resolvePartyRef(v.party);
      if (!p) { toast('طرف حساب معتبر نیست'); return false; }
      if (typeof assertPayRef === 'function' && !assertPayRef(v.ref)) return false;
      askConfirm({
        title: 'تأیید ثبت تراکنش',
        body: `<p>${v.type === 'in' ? 'دریافتی' : 'پرداختی'} <b>${money(v.amt)}</b> تومان برای <b>${esc(p.name)}</b> در تاریخ <b>${F(v.date)}</b> ثبت شود؟</p><p class=fd>${esc(v.desc)}</p>${v.ref ? `<p class=fd>پیگیری: ${F(v.ref)}</p>` : ''}`,
      }, () => {
        S.me = v.by;
        S.ledger.push({
          id: uid(),
          party: p.id,
          date: v.date,
          type: v.type,
          amt: v.amt,
          desc: v.desc || '',
          ref: v.ref || '',
          by: v.by || '',
          source: 'manual',
          checkId: '',
        });
        save();
        render();
        toast('تراکنش ثبت شد');
        return true;
      });
      return false;
    });
  }

  function addLedger(partyId, type) {
    quickPay({ party: partyId, type: type || 'in' });
  }

  function delLedger(id) {
    if (!canAcctWrite()) return toast('اجازه حذف ندارید');
    const row = (S.ledger || []).find((r) => r.id === id);
    if (!row) return;
    if (isCheckRow(row)) {
      askConfirm({
        title: 'حذف ردیف چک',
        body: '<p>این ردیف از یک چک آمده است. با حذف، خود چک هم حذف می‌شود. ادامه می‌دهید؟</p>',
        okLabel: 'بله، حذف شود',
        danger: true,
      }, () => {
        if (row.checkId) S.checks = (S.checks || []).filter((c) => c.id !== row.checkId);
        S.ledger = (S.ledger || []).filter((r) => r.id !== id);
        save();
        render();
        return true;
      });
      return;
    }
    askConfirm({
      title: 'حذف تراکنش',
      body: `<p>ردیف ${row.type === 'in' ? 'دریافتی' : 'پرداختی'} به مبلغ <b>${money(row.amt)}</b> حذف شود؟</p>`,
      okLabel: 'بله، حذف شود',
      danger: true,
    }, () => {
      S.ledger = (S.ledger || []).filter((r) => r.id !== id);
      save();
      render();
      return true;
    });
  }

  function checkFields(includeType) {
    const parties = partyOpts();
    if (!parties.length) return null;
    const fields = [];
    if (includeType) fields.push({ k: 'type', l: 'نوع چک', t: 'select', o: [['in', 'چک دریافتی'], ['out', 'چک پرداختی']], r: 1 });
    fields.push(
      { k: 'party', l: 'طرف حساب (مشتری یا شخص)', t: 'search', o: parties, r: 1, w: 1 },
      { k: 'amt', l: 'مبلغ چک (تومان)', t: 'money', r: 1 },
      { k: 'regDate', l: 'تاریخ دریافت / پرداخت (ثبت)', d: todayJ(), j: 1, r: 1 },
      { k: 'checkDate', l: 'تاریخ روی چک', j: 1 },
      { k: 'dueDate', l: 'سررسید چک', j: 1 },
      { k: 'bank', l: 'بانک' },
      { k: 'branch', l: 'شعبه' },
      { k: 'sayad', l: 'شماره صیاد' },
      { k: 'serial', l: 'سریال / شماره چک' },
      { k: 'accountNo', l: 'شماره حساب' },
      { k: 'holder', l: 'نام روی چک (صاحب حساب)' },
      { k: 'status', l: 'وضعیت', t: 'select', o: Object.entries(CHECK_STATUS) },
      { k: 'desc', l: 'شرح', t: 'area', w: 1 },
      { k: 'note', l: 'یادداشت داخلی', t: 'area', w: 1 },
      { k: 'by', l: 'ثبت‌کننده', r: 1, d: S.me || ME.name || '' },
    );
    return fields;
  }

  function saveNewCheck(v, type) {
    if (!(v.amt > 0)) { toast('مبلغ معتبر نیست'); return false; }
    const party = resolvePartyRef(v.party);
    if (!party) { toast('طرف حساب معتبر نیست'); return false; }
    const t = type || v.type || 'in';
    const ch = {
      id: uid(),
      type: t,
      party: party.id,
      amt: v.amt,
      checkDate: v.checkDate || '',
      dueDate: v.dueDate || '',
      regDate: v.regDate,
      bank: v.bank || '',
      branch: v.branch || '',
      sayad: v.sayad || '',
      serial: v.serial || '',
      accountNo: v.accountNo || '',
      holder: v.holder || '',
      status: v.status || 'pending',
      desc: v.desc || '',
      note: v.note || '',
      by: v.by || '',
      ledgerId: '',
    };
    askConfirm({
      title: 'تأیید ثبت چک',
      body: `<p>چک ${t === 'in' ? 'دریافتی' : 'پرداختی'} به مبلغ <b>${money(ch.amt)}</b> از/به <b>${esc(partyOf(ch.party)?.name || '')}</b> ثبت و در دفترکل هم بیاید؟</p>`,
    }, () => {
      S.me = ch.by;
      S.checks.push(ch);
      syncCheckLedger(ch);
      save();
      render();
      toast('چک ثبت شد');
      return true;
    });
    return false;
  }

  function quickCheck(pre) {
    if (!canAcctWrite()) return toast('اجازه ثبت ندارید');
    ensureAcctState();
    const fields = checkFields(true);
    if (!fields) return toast('ابتدا مشتری CRM یا شخص حسابداری تعریف کنید');
    pre = pre || {};
    form('ثبت چک', fields, {
      type: pre.type || 'in',
      party: pre.party || partyOpts()[0][0],
      status: 'pending',
    }, (v) => saveNewCheck(v));
  }

  function addCheck(type) {
    quickCheck({ type: type || 'in' });
  }

  function editCheck(id) {
    if (!canAcctWrite()) return toast('اجازه ویرایش ندارید');
    const ch = checkOf(id);
    if (!ch) return;
    const fields = checkFields(true);
    if (!fields) return;
    form('ویرایش چک', fields, ch, (v) => {
      if (!(v.amt > 0)) { toast('مبلغ معتبر نیست'); return false; }
      const party = resolvePartyRef(v.party);
      if (!party) { toast('طرف حساب معتبر نیست'); return false; }
      askConfirm({ title: 'تأیید ذخیره چک', body: `<p>تغییرات چک به مبلغ <b>${money(v.amt)}</b> ذخیره شود؟</p>` }, () => {
        Object.assign(ch, {
          type: v.type || ch.type,
          party: party.id,
          amt: v.amt,
          checkDate: v.checkDate || '',
          dueDate: v.dueDate || '',
          regDate: v.regDate,
          bank: v.bank || '',
          branch: v.branch || '',
          sayad: v.sayad || '',
          serial: v.serial || '',
          accountNo: v.accountNo || '',
          holder: v.holder || '',
          status: v.status || 'pending',
          desc: v.desc || '',
          note: v.note || '',
          by: v.by || '',
        });
        S.me = ch.by;
        syncCheckLedger(ch);
        save();
        render();
        toast('چک به‌روز شد');
        return true;
      });
      return false;
    });
  }

  function delCheck(id) {
    if (!canAcctWrite()) return toast('اجازه حذف ندارید');
    const ch = checkOf(id);
    if (!ch) return;
    askConfirm({
      title: 'حذف چک',
      body: `<p>چک ${ch.type === 'in' ? 'دریافتی' : 'پرداختی'} به مبلغ <b>${money(ch.amt)}</b> و ردیف دفترکل مرتبط حذف شود؟</p>`,
      okLabel: 'بله، حذف شود',
      danger: true,
    }, () => {
      if (ch.ledgerId) S.ledger = (S.ledger || []).filter((r) => r.id !== ch.ledgerId && r.checkId !== ch.id);
      else S.ledger = (S.ledger || []).filter((r) => r.checkId !== ch.id);
      S.checks = (S.checks || []).filter((c) => c.id !== id);
      save();
      render();
      return true;
    });
  }

  function setAcctRange(mode) {
    ACCT_RANGE = mode;
    if (mode !== 'custom') {
      ACCT_FROM = '';
      ACCT_TO = '';
    } else if (!ACCT_FROM || !ACCT_TO) {
      const b = rangeBounds('month');
      ACCT_FROM = b.from;
      ACCT_TO = b.to;
    }
    render();
  }

  function setAcctCustom(which, val) {
    const d = normJ(val);
    if (!d) return toast('تاریخ معتبر نیست');
    if (which === 'from') ACCT_FROM = d;
    else ACCT_TO = d;
    ACCT_RANGE = 'custom';
    render();
  }

  function ad() {
    if (!can('acct') && !can('admin')) return empty('به بخش حسابداری دسترسی ندارید');
    ensureAcctState();
    const p = partyOf(V.id);
    if (!p) return acctV();
    const rep = detailLedger(p.id);
    const all = partyBalance(p.id);
    const fig = (k, v) => `<dt>${k}</dt><dd>${v}</dd>`;
    const rangeBtns = RANGE_OPTS.map(([k, l]) =>
      `<button type=button class=f ${ACCT_RANGE === k ? 'aria-pressed=true' : 'aria-pressed=false'} onclick="setAcctRange('${k}')">${l}</button>`).join('');
    const showRows = rep.rows.slice().reverse();

    return `<div class=pd>
  <div class=pd-bar>
    <button class=btn-ghost onclick="go('acct')">بازگشت ←</button>
    <div class="pd-bar-actions noprint">
      ${canAcctWrite() ? `<button class="pri sm" onclick="quickPay({party:'${p.id}'})">ثبت پرداخت / دریافت</button>
      <button class="btn-soft sm" onclick="quickCheck({party:'${p.id}'})">ثبت چک</button>
      <button class=btn-ghost onclick="editParty('${p.id}')">ویرایش شخص</button>
      <button class="btn-ghost danger" onclick="delParty('${p.id}')">حذف</button>` : ''}
      <button class=pri onclick="openAcctReport('${p.id}')">گزارش‌ها</button>
    </div>
  </div>

  <article class=file>
    <header class=file-head>
      <div>
        <div class=dossier-k>پرونده حسابداری</div>
        <div class=title-row><h2>${esc(p.name)}</h2><span class="chip">${esc(partyKindLabel(p.kind))}</span></div>
        <p class=dossier-addr>${p.title ? esc(p.title) + ' · ' : ''}${p.phone ? '☎ ' + F(p.phone) : '—'}${p.nid ? ' · کد ملی ' + F(p.nid) : ''}</p>
        ${p.note ? `<p class=dossier-note>${esc(p.note)}</p>` : ''}
        ${p.custId ? `<p class=fd><button class="sm btn-soft" onclick="go('cv','${p.custId}')">پرونده مشتری لینک‌شده</button></p>` : ''}
      </div>
    </header>
    <section class=pay-block>
      <div class=pay-row>
        <div><small>جمع دریافتی (کل)</small><b>${money(all.debit)}<span>تومان</span></b></div>
        <div><small>جمع پرداختی (کل)</small><b>${money(all.credit)}<span>تومان</span></b></div>
        <div class=rem><small>${all.bal > 0 ? 'بدهکار' : all.bal < 0 ? 'بستانکار' : 'تسویه'}</small><b>${money(Math.abs(all.bal))}<span>تومان</span></b></div>
      </div>
      <div class=pnote>${esc(balLabel(all.bal))}</div>
    </section>
    <div class=file-cols>
      <section class=file-sec>
        <h3 class=file-h>خلاصه بازه انتخابی</h3>
        <dl class=fig>
          ${fig('بازه', esc(rep.bounds.label))}
          ${fig('ابتدای بازه', esc(balShort(rep.open)))}
          ${fig('دریافتی بازه', money(rep.debit) + ' تومان')}
          ${fig('پرداختی بازه', money(rep.credit) + ' تومان')}
          ${fig('پایان بازه', esc(balShort(rep.bal)))}
        </dl>
      </section>
      <section class=file-sec>
        <h3 class=file-h>راهنما</h3>
        <p class=fd style="margin:0">هر ردیف نوع و مبلغ تراکنش را نشان می‌دهد؛ ستون بدهکار / بستانکار وضعیت حساب را بعد از همان تراکنش می‌نویسد. چک‌ها با برچسب «(چک)» مشخص‌اند.</p>
      </section>
    </div>
  </article>

  <section class="units-panel noprint">
    <div class=u-head>
      <h3>تراکنش‌ها <span class=count>${F(rep.rows.length)}</span></h3>
      <div class=u-tools>${rangeBtns}</div>
    </div>
    ${ACCT_RANGE === 'custom' ? `<div class=acct-range noprint>
      <label>از تاریخ<input readonly style="cursor:pointer" value="${ACCT_FROM ? F(ACCT_FROM) : ''}" placeholder="انتخاب" onclick="dpick(this,d=>setAcctCustom('from',d))"></label>
      <label>تا تاریخ<input readonly style="cursor:pointer" value="${ACCT_TO ? F(ACCT_TO) : ''}" placeholder="انتخاب" onclick="dpick(this,d=>setAcctCustom('to',d))"></label>
    </div>` : ''}
    ${sb()}
    <div class=inst-pad>
      ${showRows.length ? tbl(
        ['تاریخ', 'نوع', 'مبلغ', 'شرح', 'بدهکار', 'بستانکار', 'پیگیری', 'ثبت‌کننده', ''],
        showRows.map((r) => {
          const bc = balCells(r.runBal);
          const actions = canAcctWrite()
            ? (isCheckRow(r)
              ? `<button class=sm onclick="editCheck('${r.checkId}')">چک</button> <button class="sm btn-ghost danger" onclick="delLedger('${r.id}')">حذف</button>`
              : `<button class="sm btn-ghost danger" onclick="delLedger('${r.id}')">حذف</button>`)
            : '';
          return `<tr data-s="${esc(N((r.desc || '') + (r.ref || '') + (r.by || '') + (r.type === 'in' ? 'دریافتی' : 'پرداختی')))}">
            <td>${F(r.date)}</td>
            <td>${r.type === 'in' ? 'دریافتی' : 'پرداختی'}</td>
            <td>${money(r.amt)}</td>
            <td style="white-space:normal;text-align:right">${ledgerDescHtml(r)}</td>
            <td>${bc.deb}</td>
            <td>${bc.cre}</td>
            <td>${r.ref ? F(r.ref) : '—'}</td>
            <td>${esc(r.by || '—')}</td>
            <td>${actions}</td>
          </tr>`;
        }).join(''),
      ) : empty('در این بازه تراکنشی نیست.')}
    </div>
  </section>
</div>`;
  }

  function addCheckForParty(partyId, type) {
    quickCheck({ party: partyId, type: type || 'in' });
  }

  function detailSection(p) {
    const rep = detailLedger(p.id);
    const rows = rep.rows.map((r, i) => {
      const bc = balCells(r.runBal);
      return `<tr>
      <td>${F(i + 1)}</td>
      <td>${F(r.date)}</td>
      <td>${r.type === 'in' ? 'دریافتی' : 'پرداختی'}</td>
      <td>${money(r.amt)}</td>
      <td style="text-align:right;white-space:normal">${esc(ledgerDescPrint(r))}</td>
      <td>${bc.deb}</td>
      <td>${bc.cre}</td>
      <td>${r.ref ? F(r.ref) : '—'}</td>
      <td>${esc(r.by || '—')}</td>
    </tr>`;
    }).join('');
    return `<div class="acct-party-block">
      <h5 style="margin:18px 0 8px">${esc(p.name)} <span style="font-weight:400;font-size:12px">· ${esc(partyKindLabel(p.kind))}${p.title ? ' · ' + esc(p.title) : ''}</span></h5>
      <p class=fd style="margin:0 0 8px">ابتدای بازه: <b>${esc(balShort(rep.open))}</b> · پایان بازه: <b>${esc(balShort(rep.bal))}</b> · دریافتی بازه: ${money(rep.debit)} · پرداختی بازه: ${money(rep.credit)}</p>
      ${tbl(['ردیف', 'تاریخ', 'نوع', 'مبلغ', 'شرح', 'بدهکار', 'بستانکار', 'پیگیری', 'ثبت‌کننده'], rows || '<tr><td colspan="9">تراکنشی در این بازه نیست</td></tr>')}
    </div>`;
  }

  function acctDetailDoc(p) {
    const bounds = rangeBounds(ACCT_RANGE, ACCT_FROM, ACCT_TO);
    const body = p
      ? detailSection(p)
      : (S.parties || []).slice().sort((a, b) => (a.name < b.name ? -1 : 1)).map(detailSection).join('')
        || empty('شخصی ثبت نشده است.');
    return `<div class="paper acct-paper">
      <div class=hd><span>${esc(COMPANY)}</span><span>تاریخ چاپ: ${F(todayJ())}</span></div>
      <h4>ریز گزارش حسابداری</h4>
      ${p ? `<p>طرف حساب: <b>${esc(p.name)}</b></p>` : '<p>ریز تراکنش‌ها به تفکیک طرف‌حساب‌ها با بدهکار / بستانکار پس از هر ردیف</p>'}
      <p>بازه گزارش: <b>${esc(bounds.label)}</b></p>
      ${body}
      <div class=sign><div>تهیه‌کننده</div><div>تأییدکننده</div></div>
    </div>`;
  }

  function acctSummaryDoc(p) {
    const bounds = rangeBounds(ACCT_RANGE, ACCT_FROM, ACCT_TO);
    const list = p
      ? [{ party: p, all: partyBalance(p.id), ranged: partyBalance(p.id, (S.ledger || []).filter((r) => r.party === p.id && inRange(r.date, bounds.from, bounds.to))) }]
      : partiesSummary();
    const rows = list.map((x, i) => {
      const bc = balCells(x.all.bal);
      return `<tr>
        <td>${F(i + 1)}</td>
        <td>${esc(x.party.name)}</td>
        <td>${esc(partyKindLabel(x.party.kind))}</td>
        <td>${x.party.title ? esc(x.party.title) : '—'}</td>
        <td>${money(x.all.debit)}</td>
        <td>${money(x.all.credit)}</td>
        <td>${bc.deb}</td>
        <td>${bc.cre}</td>
      </tr>`;
    }).join('');
    const totDeb = sum(list, (x) => x.all.debit);
    const totCre = sum(list, (x) => x.all.credit);
    return `<div class="paper acct-paper">
      <div class=hd><span>${esc(COMPANY)}</span><span>تاریخ چاپ: ${F(todayJ())}</span></div>
      <h4>گزارش کامل طرف‌حساب‌ها</h4>
      <p>${p ? `خلاصه وضعیت <b>${esc(p.name)}</b>` : 'فهرست اشخاص با جمع دریافتی، پرداختی و بدهکار / بستانکار در لحظه'}</p>
      ${tbl(
        ['ردیف', 'طرف حساب', 'نوع', 'سمت', 'جمع دریافتی', 'جمع پرداختی', 'بدهکار', 'بستانکار'],
        rows || '<tr><td colspan="8">شخصی نیست</td></tr>',
      )}
      <div class=acct-sum>
        <p>جمع کل دریافتی‌ها: <b>${T(totDeb)}</b></p>
        <p>جمع کل پرداختی‌ها: <b>${T(totCre)}</b></p>
        <p>تعداد طرف‌حساب: <b>${F(list.length)}</b></p>
      </div>
      <div class=sign><div>تهیه‌کننده</div><div>تأییدکننده</div></div>
    </div>`;
  }

  function checksReportDoc() {
    const rep = filteredChecks();
    const rows = rep.rows.map((c, i) => {
      const p = partyOf(c.party);
      return `<tr>
        <td>${F(i + 1)}</td>
        <td>${c.type === 'in' ? 'دریافتی' : 'پرداختی'}</td>
        <td>${esc(p?.name || '—')}</td>
        <td>${money(c.amt)}</td>
        <td>${F(c.regDate || '—')}</td>
        <td>${c.checkDate ? F(c.checkDate) : '—'}</td>
        <td>${c.dueDate ? F(c.dueDate) : '—'}</td>
        <td>${esc(c.bank || '—')}</td>
        <td>${F(c.sayad || c.serial || '—')}</td>
        <td>${esc(checkStatusLabel(c.status))}</td>
        <td style="text-align:right;white-space:normal">${esc(c.desc || '—')}</td>
      </tr>`;
    }).join('');
    return `<div class="paper acct-paper">
      <div class=hd><span>${esc(COMPANY)}</span><span>تاریخ چاپ: ${F(todayJ())}</span></div>
      <h4>گزارش چک‌ها</h4>
      <p>بازه: <b>${esc(rep.bounds.label)}</b>${CHECK_FILTER !== 'all' ? ` · فقط چک‌های ${CHECK_FILTER === 'in' ? 'دریافتی' : 'پرداختی'}` : ''}</p>
      ${tbl(['ردیف', 'نوع', 'طرف حساب', 'مبلغ', 'ثبت', 'تاریخ چک', 'سررسید', 'بانک', 'صیاد/سریال', 'وضعیت', 'شرح'], rows || '<tr><td colspan="11">چکی در این بازه نیست</td></tr>')}
      <div class=acct-sum>
        <p>جمع چک‌های دریافتی: <b>${T(rep.debit)}</b></p>
        <p>جمع چک‌های پرداختی: <b>${T(rep.credit)}</b></p>
        <p>تعداد فقره: <b>${F(rep.rows.length)}</b></p>
      </div>
      <div class=sign><div>تهیه‌کننده</div><div>تأییدکننده</div></div>
    </div>`;
  }

  function showAcctReport(id, mode) {
    V = { n: 'doc', id: id || 'all', k: 'acct', mode: mode === 'summary' ? 'summary' : 'detail' };
    remember();
    render();
    scrollTo(0, 0);
  }

  function openAcctReport(id) {
    const scope = id || 'all';
    const m = $('#modal');
    m.innerHTML = `<div class="box confirm-box">
      <h3 style="margin-top:0">نوع گزارش</h3>
      <div class=confirm-body>
        <p>کدام گزارش را می‌خواهید؟</p>
        <p class=fd style="margin:0"><b>ریز گزارش:</b> تراکنش‌ها تک‌به‌تک با مبلغ و بدهکار / بستانکار پس از هر ردیف</p>
        <p class=fd style="margin:8px 0 0"><b>گزارش کامل:</b> فهرست اشخاص با بدهکار و بستانکار کلی در لحظه</p>
      </div>
      <div class=act style="flex-wrap:wrap">
        <button type=button class=pri id=rptDetail>ریز گزارش</button>
        <button type=button class=btn-soft id=rptSum>گزارش کامل</button>
        <button type=button id=rptCancel>انصراف</button>
      </div>
    </div>`;
    m.classList.add('on');
    $('#rptCancel').onclick = () => closeM();
    $('#rptDetail').onclick = () => { closeM(); showAcctReport(scope, 'detail'); };
    $('#rptSum').onclick = () => { closeM(); showAcctReport(scope, 'summary'); };
  }

  function openChecksReport() {
    V = { n: 'doc', id: 'checks', k: 'checks' };
    remember();
    render();
    scrollTo(0, 0);
  }

  function acctDocView(bar) {
    if (V.k === 'checks') return bar + checksReportDoc();
    const p = (!V.id || V.id === 'all') ? null : partyOf(V.id);
    if (V.id && V.id !== 'all' && !p) return bar + empty('شخص پیدا نشد');
    if (V.mode === 'summary') return bar + acctSummaryDoc(p);
    return bar + acctDetailDoc(p);
  }

  window.PARTY_KIND = PARTY_KIND;
  window.acctV = acctV;
  window.ad = ad;
  window.addParty = addParty;
  window.editParty = editParty;
  window.delParty = delParty;
  window.syncAllCustomersAsParties = syncAllCustomersAsParties;
  window.openAcctForCustomer = openAcctForCustomer;
  window.ensurePartyForCustomer = ensurePartyForCustomer;
  window.addLedger = addLedger;
  window.delLedger = delLedger;
  window.quickPay = quickPay;
  window.quickCheck = quickCheck;
  window.addCheck = addCheck;
  window.addCheckForParty = addCheckForParty;
  window.editCheck = editCheck;
  window.delCheck = delCheck;
  window.setAcctTab = setAcctTab;
  window.setCheckFilter = setCheckFilter;
  window.setHomeType = setHomeType;
  window.setAcctRange = setAcctRange;
  window.setAcctCustom = setAcctCustom;
  window.openAcctReport = openAcctReport;
  window.showAcctReport = showAcctReport;
  window.openChecksReport = openChecksReport;
  window.acctDocView = acctDocView;
})();
