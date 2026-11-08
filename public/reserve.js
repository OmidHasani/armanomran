/* قالب رسمی رزرونامه – یک برگه A4 – وابسته به app.js و legal-ui.js */
(function () {
  const PAY_DEFAULTS = {
    payBank: 'مسکن',
    payCard: '6280231545915190',
    paySheba: '930140040000013010694761',
    payAcct: '13010694761',
    payName: 'فریده بهزادی',
    supportPhone: '09133206625',
    refundMonths: 3,
  };
  const WW = (n) => (n ? `${words(Math.round(n))} تومان` : '................................ تومان');
  const dots = (n = 16) => '.'.repeat(n);
  const fillOr = (v, fb = '........') => {
    const s = String(v ?? '').trim();
    return s ? s : fb;
  };

  function reserveFoot() {
    return `<div class="sig-row sig-2 sig-bare">
      <div><b>امضای رزروکننده</b><span>&nbsp;</span></div>
      <div><b>امضای نماینده شرکت</b><span>&nbsp;</span></div>
    </div>`;
  }

  function inlineSig() {
    return `<div class="sig-row sig-2 sig-bare" style="margin:8pt 0 6pt">
      <div><b>امضای رزروکننده</b><span>&nbsp;</span></div>
      <div><b>امضای نماینده شرکت</b><span>&nbsp;</span></div>
    </div>`;
  }

  function reserveDocDefaults(r, cu, p, u) {
    const d = r.doc || {};
    const sched = Array.isArray(d.schedule) ? d.schedule : [];
    return {
      title: d.title || 'خانم',
      total: d.total != null && d.total !== '' ? Number(d.total) : (Number(u.total) || Number(u.totalRaw) || Number(r.need) || 0),
      loc: d.loc || [p.name, p.addr].filter(Boolean).join(' - ') || '',
      floor: d.floor || u.floor || '',
      unitNo: d.unitNo || u.no || '',
      fromBank: d.fromBank || '',
      supportPhone: d.supportPhone || PAY_DEFAULTS.supportPhone,
      refundMonths: d.refundMonths != null && d.refundMonths !== '' ? Number(d.refundMonths) : PAY_DEFAULTS.refundMonths,
      schedule: [0, 1, 2, 3].map((i) => ({
        amt: sched[i]?.amt != null && sched[i]?.amt !== '' ? Number(sched[i].amt) : 0,
        date: sched[i]?.date || '',
      })),
      payBank: d.payBank || PAY_DEFAULTS.payBank,
      payCard: d.payCard || PAY_DEFAULTS.payCard,
      paySheba: d.paySheba || PAY_DEFAULTS.paySheba,
      payAcct: d.payAcct || PAY_DEFAULTS.payAcct,
      payName: d.payName || PAY_DEFAULTS.payName,
    };
  }

  function reserveMissing(r) {
    const d = r.doc || {};
    const u = unitOf(r.proj, r.unit);
    const miss = [];
    if (!d.title) miss.push('عنوان (آقای/خانم)');
    if (!(d.total || u.total || u.totalRaw || r.need)) miss.push('مبلغ کل');
    if (!(d.loc || '').trim() && !(proj(r.proj) || {}).addr) miss.push('نشانی واحد');
    if (!(r.pays || []).length) miss.push('حداقل یک پرداخت ثبت‌شده');
    return miss;
  }

  function paidLinesHtml(r, x) {
    const pays = [...(r.pays || [])].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    if (!pays.length) {
      return `<p class=art>مبلغ ${dots(24)} در تاریخ ${dots(12)} از بانک ${dots(10)} به شماره ${dots(18)} به حساب ${esc(x.payName)} نزد بانک ${esc(x.payBank)}، به شماره شبا ${F(x.paySheba)}، طبق اعلام رزروکننده، واریز گردیده است.</p>`;
    }
    return pays.map((p) => {
      const fromBank = fillOr(x.fromBank, '........');
      const ref = fillOr(p.ref, '................');
      return `<p class=art>مبلغ ${esc(WW(p.amt))} در تاریخ ${F(p.date)} از بانک ${esc(fromBank)} به شماره ${F(ref)} به حساب ${esc(x.payName)} نزد بانک ${esc(x.payBank)}، به شماره شبا ${F(x.paySheba)}، طبق اعلام رزروکننده، واریز گردیده است.</p>`;
    }).join('');
  }

  function scheduleLinesHtml(x) {
    const rows = (x.schedule || []).filter((s) => Number(s.amt) > 0 || (s.date || '').trim());
    if (!rows.length) {
      return `<p class=art>مقرر گردید مبلغ ${dots(28)} را حداکثر تا تاریخ ${dots(12)} به حساب ${esc(x.payName)} نزد بانک ${esc(x.payBank)}، به شماره کارت ${F(x.payCard)}، شماره شبا ${F(x.paySheba)} و شماره حساب ${F(x.payAcct)} واریز گردد.</p>`;
    }
    const parts = rows.map((s, i) => {
      const amt = Number(s.amt) > 0 ? WW(s.amt) : dots(24);
      const date = s.date ? F(s.date) : dots(12);
      const lead = i === 0 ? 'مقرر گردید مبلغ' : 'و مبلغ';
      return `${lead} ${esc(amt)} را حداکثر تا تاریخ ${date}`;
    });
    return `<p class=art>${parts.join(' ')} به حساب ${esc(x.payName)} نزد بانک ${esc(x.payBank)}، به شماره کارت ${F(x.payCard)}، شماره شبا ${F(x.paySheba)} و شماره حساب ${F(x.payAcct)} واریز گردد.</p>`;
  }

  function remainingHtml(r, x, paidSumAmt, schedSum) {
    const rem = Math.max(0, Math.round(Number(x.total) || 0) - Math.round(paidSumAmt) - Math.round(schedSum));
    const remTxt = rem > 0 ? WW(rem) : (Number(x.total) ? WW(0) : dots(28));
    const dl = r.deadline ? F(r.deadline) : dots(12);
    return `<p class=art>همچنین مقرر گردید باقی‌مانده مبلغ رزرونامه، معادل ${esc(remTxt)}، حداکثر تا تاریخ ${dl} تسویه و نسبت به تنظیم قرارداد نهایی اقدام گردد.</p>`;
  }

  function reserveDoc(r, cu, p, u) {
    const x = reserveDocDefaults(r, cu, p, u);
    const paidSumAmt = sum(r.pays || [], (pay) => pay.amt);
    const schedSum = sum(x.schedule || [], (s) => Number(s.amt) || 0);
    const fine = Number(r.fine) || RF();
    const floorUnit = `طبقه ${fillOr(x.floor, '....')}– واحد ${fillOr(F(x.unitNo), '....')}`;
    const totalTxt = Number(x.total) > 0 ? WW(x.total) : dots(36);
    const who = `${esc(x.title)} ${esc(cu.name || dots(12))}`;
    const head = legalHead(r.no, r.date, 'بسمه تعالی', 'رزرونامه واحد');

    const body = `${head}
<p class=art>${who} به شماره ملی ${F(cu.nid || dots(10))} و شماره همراه ${F(cu.phone || dots(11))} جهت رزرو یک واحد آپارتمان واقع در ${esc(floorUnit)} به نشانی ${esc(fillOr(x.loc, '................................'))} به مبلغ کل ${esc(totalTxt)}، مبالغ زیر را پرداخت نموده‌اند:</p>
${paidLinesHtml(r, x)}
${scheduleLinesHtml(x)}
${remainingHtml(r, x, paidSumAmt, schedSum)}
<p class=art>در صورت عدم واریز هر یک از مبالغ مذکور در سررسیدهای تعیین‌شده، رزرو‌نامه حاضر خودبه‌خود منفسخ و از درجه اعتبار ساقط خواهد شد.</p>
<p class=art-title>شرایط و ضوابط رزرو واحد</p>
<p class=art><b>۱.</b> رزرو واحد صرفاً به‌منظور اختصاص موقت واحد به متقاضی و فراهم نمودن فرصت لازم جهت انجام امور مالی و قراردادی بوده و تا زمان تسویه کامل مبلغ و تنظیم قرارداد نهایی، هیچ‌گونه تعهد قطعی نسبت به انتقال واحد ایجاد نمی‌نماید.</p>
<p class=art><b>۲.</b> چنانچه رزروکننده به هر دلیل از ادامه خرید منصرف شود، در موعد مقرر جهت تسویه حساب و تنظیم قرارداد مراجعه ننماید، یا قرارداد نهایی در مهلت تعیین‌شده تنظیم نگردد، رزرو حاضر خودبه‌خود خاتمه یافته و شرکت مجاز خواهد بود نسبت به عرضه مجدد واحد به سایر متقاضیان اقدام نماید.</p>
<p class=art><b>۳.</b> در صورت انصراف رزروکننده، عدم مراجعه در موعد مقرر، عدم تسویه مبالغ تعیین‌شده یا عدم تنظیم قرارداد نهایی در مهلت مقرر، مبلغ ${esc(WW(fine))} بابت هزینه‌های رزرو، بازاریابی، معرفی، کارشناسی، خدمات اداری، اختصاص واحد و فرصت فروش از دست‌رفته، از مبالغ پرداختی کسر خواهد شد و مانده وجه پرداختی، حداکثر ظرف مدت ${F(x.refundMonths || 3)} ماه از تاریخ ثبت درخواست انصراف، به رزروکننده مسترد می‌گردد.</p>
<p class=art><b>۴.</b> بدیهی است اختصاص واحد به رزروکننده موجب توقف یا محدود شدن امکان عرضه آن به سایر متقاضیان و همچنین تحمیل هزینه‌های بازاریابی و اداری به شرکت می‌گردد؛ لذا مبلغ مذکور به‌عنوان جبران بخشی از هزینه‌های انجام‌شده و به‌منظور اطمینان از جدیت متقاضی تعیین و دریافت می‌گردد.</p>
<p class=art><b>۵.</b> در صورت عدم مراجعه رزروکننده در تاریخ تعیین‌شده، بدون هماهنگی و توافق قبلی با شرکت، رزرو‌نامه حاضر فاقد اعتبار بوده و آثار مالی آن مطابق مفاد این رزرو‌نامه خواهد بود.</p>
${inlineSig()}
<p class=art><b>۶.</b> رزروکننده موظف است اصل این رزرو‌نامه را که به رسم امانت در اختیار وی قرار گرفته است، حداکثر تا تاریخ ${r.deadline ? F(r.deadline) : dots(12)} به شرکت مسترد نماید.</p>
<p class=art><b>۷.</b> ${who} اقرار و تأیید می‌نماید که پیش از امضای این سند، فرصت کافی برای مطالعه و بررسی کامل مفاد آن را داشته و پس از تفکر و حصول اطمینان، بدون هیچ‌گونه عجله، اکراه یا اجبار، آن را با علم، آگاهی و رضایت کامل امضا نموده است و نسبت به مفاد آن ادعایی نخواهد داشت.</p>
<p class=art><b>۸.</b> اعتبار این رزرو‌نامه منوط به واریز کلیه پرداخت‌های مقرر در سررسیدهای تعیین‌شده بوده و از نظر زمانی حداکثر تا تاریخ ${r.deadline ? F(r.deadline) : dots(12)} معتبر است و پس از تاریخ مذکور، فاقد اعتبار خواهد بود.</p>
<p class=art>امضای رزروکننده به منزله مطالعه، آگاهی کامل و پذیرش تمامی مفاد و شرایط این رزرو‌نامه است.</p>
<p class=art>در صورت وجود هرگونه سؤال، ابهام یا نیاز به توضیحات بیشتر، خواهشمند است ضمن ارسال تصویر رزرونامه، پرسش یا درخواست خود را از طریق پیام‌رسان‌های «ایتا» یا «بله» به شماره ${F(x.supportPhone)} ارسال فرمایید. درخواست شما در اسرع وقت بررسی و پاسخ لازم ارائه خواهد شد.</p>`;

    return legalPages([body], reserveFoot());
  }

  function editReserveDoc(id) {
    const r = S.reservations.find((x) => x.id == id);
    if (!r) return toast('رزرو پیدا نشد');
    if (!can('write')) return toast('دسترسی ویرایش ندارید');
    const cu = cust(r.cust);
    const p = proj(r.proj) || { name: '', addr: '' };
    const u = unitOf(r.proj, r.unit);
    const init = reserveDocDefaults(r, cu, p, u);
    const m = $('#modal');
    m.innerHTML = `<div class="box lease-box">
      <div class="lease-form-head">
        <h3>تکمیل فیلدهای رزرونامه</h3>
        <p class=fd>نام، کد ملی، همراه، پرداخت‌های ثبت‌شده و مهلت از پرونده خوانده می‌شود. اقساط آینده و مبلغ کل را اینجا کامل کنید.</p>
      </div>
      <div class="crm-snap">
        <div class="crm-snap-h">اطلاعات متصل از سامانه</div>
        <div class="crm-snap-grid">
          <div><span>مشتری</span><b>${esc(cu.name || '—')}</b></div>
          <div><span>کد ملی</span><b>${F(cu.nid || '—')}</b></div>
          <div><span>همراه</span><b>${F(cu.phone || '—')}</b></div>
          <div><span>پروژه</span><b>${esc(p.name || '—')}</b></div>
          <div><span>واحد</span><b>${esc(u.no || '—')}</b></div>
          <div><span>مهلت</span><b>${F(r.deadline || '—')}</b></div>
          <div><span>پرداخت‌شده</span><b>${money(rPaid(r))} تومان</b></div>
          <div><span>کسر لغو</span><b>${money(r.fine || RF())} تومان</b></div>
        </div>
      </div>
      <div class=lease-sec>
        <h4>۱. مشخصات در متن</h4>
        <div class=grid>
          <label>عنوان
            <select name=title>
              <option value="آقای">آقای</option>
              <option value="خانم">خانم</option>
              <option value="خانم / آقای">خانم / آقای</option>
            </select>
          </label>
          <label>مبلغ کل واحد (تومان)<input name=total inputmode=numeric></label>
          <label>طبقه<input name=floor></label>
          <label>شماره واحد<input name=unitNo></label>
          <label class=w>نشانی در رزرونامه<textarea name=loc rows=2></textarea></label>
          <label>بانک مبدأ پرداخت‌ها<input name=fromBank placeholder="مثلاً ملت"></label>
          <label>شماره پشتیبانی ایتا/بله<input name=supportPhone inputmode=tel></label>
          <label>مهلت استرداد (ماه)<input name=refundMonths inputmode=numeric></label>
        </div>
      </div>
      <div class=lease-sec>
        <h4>۲. اقساط آینده (هنوز پرداخت‌نشده)</h4>
        <p class=fd>مانده نهایی تا مهلت رزرو خودکار از مبلغ کل منهای پرداخت‌ها و این اقساط حساب می‌شود.</p>
        <div class=grid>
          ${[0, 1, 2, 3].map((i) => `
            <label>مبلغ قسط ${F(i + 1)}<input name=samt${i} inputmode=numeric></label>
            <label>سررسید قسط ${F(i + 1)}<input name=sdate${i} readonly style="cursor:pointer" placeholder="انتخاب از تقویم"></label>
          `).join('')}
        </div>
      </div>
      <div class=lease-sec>
        <h4>۳. حساب مقصد شرکت</h4>
        <div class=grid>
          <label>بانک<input name=payBank></label>
          <label>شماره کارت<input name=payCard inputmode=numeric></label>
          <label>شبا<input name=paySheba></label>
          <label>شماره حساب<input name=payAcct inputmode=numeric></label>
          <label class=w>به نام<input name=payName></label>
        </div>
      </div>
      <div class=act sticky-act>
        <button type=button class=pri id=ok>ذخیره فیلدها</button>
        <button type=button onclick="closeM()">انصراف</button>
      </div>
    </div>`;
    m.classList.add('on');
    m.querySelector('[name=title]').value = init.title;
    const set = (k, v) => { const e = m.querySelector(`[name=${k}]`); if (e) e.value = v == null ? '' : String(v); };
    set('floor', init.floor); set('unitNo', init.unitNo); set('loc', init.loc);
    set('fromBank', init.fromBank); set('supportPhone', init.supportPhone);
    set('refundMonths', init.refundMonths ? F(init.refundMonths) : '۳');
    set('payBank', init.payBank); set('payCard', init.payCard); set('paySheba', init.paySheba);
    set('payAcct', init.payAcct); set('payName', init.payName);
    const totalEl = m.querySelector('[name=total]');
    totalEl.value = init.total ? money(init.total) : '';
    totalEl.oninput = function () { fmtIn(this); };
    init.schedule.forEach((s, i) => {
      const a = m.querySelector(`[name=samt${i}]`);
      const d = m.querySelector(`[name=sdate${i}]`);
      a.value = s.amt ? money(s.amt) : '';
      a.oninput = function () { fmtIn(this); };
      d.value = s.date ? F(s.date) : '';
      bindDate(d);
    });
    m.querySelector('#ok').onclick = () => {
      const numMoney = (el) => num(el.value);
      const schedule = [0, 1, 2, 3].map((i) => {
        const amt = numMoney(m.querySelector(`[name=samt${i}]`));
        let date = m.querySelector(`[name=sdate${i}]`).value.trim();
        if (date) date = normJ(date) || date;
        return { amt, date };
      }).filter((s) => s.amt > 0 || s.date);
      r.doc = {
        ...(r.doc || {}),
        title: m.querySelector('[name=title]').value,
        total: numMoney(totalEl),
        floor: m.querySelector('[name=floor]').value.trim(),
        unitNo: m.querySelector('[name=unitNo]').value.trim(),
        loc: m.querySelector('[name=loc]').value.trim(),
        fromBank: m.querySelector('[name=fromBank]').value.trim(),
        supportPhone: m.querySelector('[name=supportPhone]').value.trim(),
        refundMonths: parseInt(N(m.querySelector('[name=refundMonths]').value), 10) || 3,
        schedule,
        payBank: m.querySelector('[name=payBank]').value.trim(),
        payCard: m.querySelector('[name=payCard]').value.trim(),
        paySheba: m.querySelector('[name=paySheba]').value.trim(),
        payAcct: m.querySelector('[name=payAcct]').value.trim(),
        payName: m.querySelector('[name=payName]').value.trim(),
      };
      if (r.ed) delete r.ed.res;
      save();
      closeM();
      render();
      toast('فیلدهای رزرونامه ذخیره شد');
    };
  }

  window.reserveDoc = reserveDoc;
  window.reserveMissing = reserveMissing;
  window.editReserveDoc = editReserveDoc;
})();
