/* قالب رسمی قرارداد اجاره به شرط تملیک – وابسته به app.js و legal-ui.js */
(function () {
  const LESSOR = {
    name: 'شرکت آیینه گستر ساختمان اصفهان',
    regNo: '37548',
    nid: '10260551180',
    regDate: '07/05/1388',
    phone: '09131686626',
    addr: 'اصفهان خیابان چهارباغ بالا – کوچه باغ ارم – ساختمان ارم – طبقه چهارم – واحد ۴۱',
  };
  const LEASE_PAY_DEFAULTS = {
    payBank: 'مسکن',
    payCard: '6280231545915190',
    paySheba: '930140040000013010694761',
    payAcct: '13010694761',
    payName: 'فریده بهزادی',
    coolDays: 30,
    qarzRefundCount: 8,
  };
  const DAY_ORD = ['', 'یکم', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم', 'هشتم', 'نهم', 'دهم', 'یازدهم', 'دوازدهم', 'سیزدهم', 'چهاردهم', 'پانزدهم', 'شانزدهم', 'هفدهم', 'هجدهم', 'نوزدهم', 'بیستم', 'بیست‌ویکم', 'بیست‌ودوم', 'بیست‌وسوم', 'بیست‌وچهارم', 'بیست‌وپنجم', 'بیست‌وششم', 'بیست‌وهفتم', 'بیست‌وهشتم', 'بیست‌ونهم', 'سی‌ام', 'سی‌ویکم'];
  const dayOrd = (d) => DAY_ORD[d] || F(d);
  const WW = (n) => (n ? `${words(Math.round(n))} تومان` : '................................');
  const fillOr = (v, fb = '........') => {
    const s = String(v ?? '').trim();
    return s ? s : fb;
  };
  const dots = (n = 20) => '.'.repeat(n);

  function isLumpInst(i) {
    if ((i.kind || '') === 'lump') return true;
    return /الباقی|نقدی|یکجا|تسویه\s*نهایی/.test(i.title || '');
  }

  function groupInstForLease(inst) {
    const sorted = [...(inst || [])].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const lumps = sorted.filter(isLumpInst);
    const regs = sorted.filter((i) => !isLumpInst(i));
    const groups = [];
    for (const i of regs) {
      const last = groups[groups.length - 1];
      if (last && last.amt === i.amt) {
        last.items.push(i);
        last.count += 1;
        last.total += i.amt;
      } else {
        groups.push({ amt: i.amt, count: 1, total: i.amt, first: i.date, items: [i] });
      }
    }
    return { groups, lumps };
  }

  function leaseDocData(c, cu, p, u) {
    const d = { ...(c.doc || {}) };
    const area = fillOr(d.area || (u.area != null && u.area !== '' ? String(u.area) : ''), '........');
    const floor = fillOr(d.floor || u.floor, '........');
    const unitNo = fillOr(d.unitNo || u.no, '........');
    const loc = fillOr(d.loc || [p.name, p.addr].filter(Boolean).join(' - '), dots(40));
    const start = fillOr(d.start || c.date, '..../..../........');
    let end = d.end || '';
    if (!end && c.date && c.dur) {
      const months = parseInt(N(c.dur), 10);
      if (months > 0) end = addM(c.date, months);
    }
    end = fillOr(end, '..../..../........');
    const dur = fillOr(c.dur, '........');
    const title = fillOr(d.title || 'آقای/خانم', 'آقای/خانم');
    const father = fillOr(cu.father, dots(20));
    const birth = fillOr(d.birth, '..../..../........');
    const phone = fillOr(d.phone || cu.phone, dots(20));
    const addr = fillOr(d.addr || cu.addr, dots(44));
    const handDate = fillOr(d.handDate || c.hand || c.date, '..../..../........');
    const coolN = parseDays(d.coolDays, LEASE_PAY_DEFAULTS.coolDays);
    const coolDays = daysPhrase(coolN);
    const qarzRefundCount = parseDays(d.qarzRefundCount, LEASE_PAY_DEFAULTS.qarzRefundCount) || LEASE_PAY_DEFAULTS.qarzRefundCount;
    const payDayNum = parsePayDay(d.payDayLabel);
    const pay = {
      bank: fillOr(d.payBank || LEASE_PAY_DEFAULTS.payBank, 'مسکن'),
      card: fillOr(d.payCard || LEASE_PAY_DEFAULTS.payCard, LEASE_PAY_DEFAULTS.payCard),
      sheba: fillOr(d.paySheba || LEASE_PAY_DEFAULTS.paySheba, LEASE_PAY_DEFAULTS.paySheba),
      acct: fillOr(d.payAcct || LEASE_PAY_DEFAULTS.payAcct, LEASE_PAY_DEFAULTS.payAcct),
      name: fillOr(d.payName || LEASE_PAY_DEFAULTS.payName, LEASE_PAY_DEFAULTS.payName),
    };
    const qarzPays = Array.isArray(d.qarzPays) ? d.qarzPays : [];
    const qarzTotal = Number(d.qarzTotal) || sum(qarzPays, (x) => Number(x.amt) || 0);
    return {
      d, area, floor, unitNo, loc, start, end, dur, title, father, birth, phone, addr, handDate, coolDays, coolN, qarzRefundCount, payDayNum, pay, qarzPays, qarzTotal,
      name: fillOr(cu.name, dots(20)),
      nid: fillOr(cu.nid, dots(20)),
    };
  }

  function leaseArt5Html(c, x) {
    const { groups, lumps } = groupInstForLease(c.inst);
    if (!groups.length && !lumps.length) {
      return `<p class=art><b>۱-۵)</b> مبلغ (( ${dots(32)} تومان )) طی ........ قسط مساوی متوالی (یک ماه به یک ماه)، هر قسط به مبلغ (( ${dots(32)} تومان )) که ........ هر ماه باید از سوی مشتری تسلیم شرکت سازنده گردد و سررسید اولین قسط تاریخ ..../..../........ خواهد بود. (توضیح آنکه ماه در این قرارداد سی روز محاسبه می‌گردد.)</p>
<p class=art><b>۲-۵)</b> مبلغ (( ${dots(32)} تومان )) طی ........ قسط مساوی متوالی (یک ماه به یک ماه)، هر قسط به مبلغ (( ${dots(32)} تومان )) که ........ هر ماه باید از سوی مشتری تسلیم شرکت سازنده گردد و سررسید اولین قسط تاریخ ..../..../........ خواهد بود. (توضیح آنکه ماه در این قرارداد سی روز محاسبه می‌گردد.)</p>
<p class=art><b>۳-۵)</b> مبلغ (( ${dots(32)} تومان )) طی ........ قسط مساوی متوالی (یک ماه به یک ماه)، هر قسط به مبلغ (( ${dots(32)} تومان )) که ........ هر ماه باید از سوی مشتری تسلیم شرکت سازنده گردد و سررسید اولین قسط تاریخ ..../..../........ خواهد بود. (توضیح آنکه ماه در این قرارداد سی روز محاسبه می‌گردد.)</p>
<p class=art><b>۴-۵)</b> الباقی مبلغ قرارداد معادل (${dots(32)} تومان) را به صورت نقد تا پایان وقت اداری مورخ ..../..../........ تسلیم موجر نماید.</p>
<p class=art><b>تبصره:</b> چنانچه این قرارداد در صورت تخلف مستاجر از پرداخت هر یک از مبالغ مذکور مستند به ماده هشت بند ۲ منفسخ گردد، مبالغ پرداخت‌شده بابت اجاره بها به مستاجر مسترد نمی‌گردد و فقط مبلغ قرض‌الحسنه پس از کسر ۱۵٪ از آن، طی ........ قسط ماه به ماه به مستاجر عودت خواهد شد.</p>`;
    }
    const parts = [];
    groups.forEach((g, idx) => {
      const n = idx + 1;
      const day = x.payDayNum || pj(g.first)[2] || 0;
      const dayLabel = dayOrd(day);
      parts.push(`<p class=art><b>${F(n)}-۵)</b> مبلغ ((${esc(WW(g.total))})) طی ${F(g.count)} قسط مساوی متوالی (یک ماه به یک ماه) هر قسط به مبلغ ((${esc(WW(g.amt))})) که ${esc(dayLabel)} هر ماه باید از سوی مشتری تسلیم شرکت سازنده گردد و سررسید اولین قسط تاریخ ${F(g.first)} خواهد بود. (توضیح آنکه ماه در این قرارداد سی روز محاسبه می‌گردد)</p>`);
    });
    lumps.forEach((lump, i) => {
      const n = groups.length + i + 1;
      parts.push(`<p class=art><b>${F(n)}-۵)</b> الباقی مبلغ قرارداد معادل(${esc(WW(lump.amt))}) را به صورت نقد تا پایان وقت اداری مورخ ${F(lump.date)} تسلیم موجر نماید.</p>`);
    });
    parts.push(`<p class=art><b>تبصره:</b> چنانچه این قرارداد در صورت تخلف مستاجر از پرداخت هر یک از مبالغ مذکور مستند به ماده هشت بند ۲ منفسخ گردد، مبالغ پرداخت‌شده بابت اجاره بها به مستاجر مسترد نمی‌گردد و فقط مبلغ قرض‌الحسنه پس از کسر ۱۵٪ از آن، طی ${F(x.qarzRefundCount)} قسط ماه به ماه به مستاجر عودت خواهد شد.</p>`);
    return parts.join('\n');
  }

  function leaseQarzHtml(x) {
    const rows = x.qarzPays.filter((r) => Number(r.amt) || r.date || r.bank || r.ref);
    if (!rows.length) {
      return Array.from({ length: 3 }, (_, i) => `<p class=art><b>${F(i + 1)}-۹)</b> مبلغ ${dots(24)} تومان در تاریخ ..../..../........ از بانک ${dots(16)} به شماره پیگیری ${dots(16)}؛ از سوی مستاجر تسلیم موجر گردید.</p>`).join('\n');
    }
    return rows.map((r, i) => {
      const n = i + 1;
      return `<p class=art><b>${F(n)}-۹)</b> مبلغ ${esc(WW(Number(r.amt) || 0))} در تاریخ ${F(fillOr(r.date, '..../..../........'))} از بانک ${esc(fillOr(r.bank, dots(16)))} به شماره پیگیری ${F(fillOr(r.ref, dots(16)))}؛ از سوی مستاجر تسلیم موجر گردید.</p>`;
    }).join('\n');
  }

  function leaseMissing(c) {
    if (c.type !== 'lease') return [];
    const d = c.doc || {};
    const miss = [];
    if (!d.title) miss.push('عنوان مستاجر (آقای/خانم)');
    if (!(d.start || c.date)) miss.push('شروع اجاره');
    if (!(d.end || (c.date && c.dur))) miss.push('پایان اجاره');
    if (!(d.handDate || c.hand)) miss.push('تاریخ تسلیم');
    if (!(d.loc || '').trim()) miss.push('نشانی واحد در قرارداد');
    if (!(c.inst || []).length) miss.push('اقساط (برای ماده ۵)');
    return miss;
  }

  function leaseDoc(c, cu, p, u) {
    const x = leaseDocData(c, cu, p, u);
    const art5 = leaseArt5Html(c, x);
    const art9 = leaseQarzHtml(x);
    const qarzAmt = x.qarzTotal ? WW(x.qarzTotal) : dots(32) + ' تومان';
    const qarzWho = `${esc(x.title)} ${esc(x.name)}`;
    const head = legalHead(c.no, c.date, '« بسمه تعالی »', 'قرارداد اجاره به شرط تملیک');

    const p1 = `${head}
<p class=art-title>ماده ۱) طرفین قرارداد:</p>
<p class=art><b>۱-۱) موجر:</b> ${esc(LESSOR.name)} به شماره ثبت ${F(LESSOR.regNo)} به شناسه ملی: ${F(LESSOR.nid)} تاریخ ثبت ${F(LESSOR.regDate)} همراه: ${F(LESSOR.phone)} به نشانی: ${esc(LESSOR.addr)} که در این قرارداد از این پس به اختصار موجر نامیده می‌شود.</p>
<p class=art><b>۱-۲) مستاجر:</b> ${esc(x.title)} ${esc(x.name)} نام پدر: ${esc(x.father)} به کدملی: ${F(x.nid)} ت.ت /تاریخ ثبت: ${F(x.birth)}، همراه ${F(x.phone)} و آدرس: ${esc(x.addr)} که در این قرارداد از این پس به اختصار مستاجر نامیده می‌شود.</p>
<p class=art-title>ماده ۲) موضوع قرارداد:</p>
<p class=art>عبارت است از تملیک منافع تمامت شش دانگ یک واحد مسکونی به متراژ ${F(x.area)} مترمربع اعم از مفید و غیرمفید با احتساب مشاعات و پارکینگ به صورت ناخالص واقع در ${esc(x.loc)} طبقه ${esc(F(x.floor))} واحد ${esc(F(x.unitNo))} به مدت مرقوم و معلوم و بر اساس شروط مندرج در قرارداد. در صورت کاهش یا افزایش میزان متراژ موضوع قرارداد طرفین هیچ ادعایی نسبت به کاهش یا افزایش آن ندارند.</p>
<p class=art-title>ماده ۳) مدت اجاره:</p>
<p class=art>مدت اجاره از ${F(x.start)} لغایت ${F(x.end)} به مدت ${F(x.dur)} ماه می‌باشد.</p>
<p class=art-title>ماده ۴) مال‌الاجاره (اجاره بهاء):</p>
<p class=art>کل مبلغ مال‌الاجاره به استناد توافق قطعی طرفین عبارت است از مبلغ (( ${c.total ? esc(WW(c.total)) : dots(40) + ' تومان'} )).</p>
<p class=art-title>ماده ۵) نحوه پرداخت اجاره بهاء:</p>
${art5}`;

    const p2 = `<p class=art-title>ماده ۶) تسلیم مورد اجاره:</p>
<p class=art>مورد اجاره در تاریخ ${F(x.handDate)} تسلیم مستاجر گردید.</p>
<p class=art-title>ماده ۷) مشخصات مورد اجاره:</p>
<p class=art>مساحت ${F(x.area)} مترمربع اعم از مفید و غیرمفید با احتساب مشاعات و پارکینگ به صورت ناخالص با حق استفاده از آب/ دربها/ شیشه‌های سالم/سایر لوازم و منصوبات من حیث المجموع عین مستاجره با کلیه توابع و ملحقات قانونی و عرفی طی چندین جلسه بازدید به رویت مستاجر رسیده و ایشان از کم و کیف آن آگاهی کامل دارد و اقرار به وقوف بر جزئیات آن می‌نماید و به طور کلی هیچ نکته‌ای که درآینده مستاجر استناد به جهل خویش نماید باقی نمانده است.</p>
<p class=art-title>ماده ۸) انقضاء و انحلال قرارداد:</p>
<p class=art>کلیه شرایط صحت قرارداد اعم از قبض و اقباض و قرائت صیغه شرعی ایجاب و قبول و غیره عملی گردید لذا این قرارداد قطعی و لازم‌الاجرا است و آثار قانونی آن بر طرفین مترتب است لیکن با توجه به اسقاط کافه خیارات قانونی از مستاجر که در بند ۲ ماده ۱۲ مندرج است این قرارداد صرفاً به یکی از طرق ذیل‌الذکر قابل انحلال خواهد بود.</p>
<p class=art><b>۸-۱)</b> در صورتی که مدت اجاره تمام شده و مستاجر به شروط مورد توافق در این قرارداد عمل کرده باشد و اقساط مال‌الاجاره را به موقع پرداخته باشد عین مستاجره به ملکیت مستاجر درآمده و عقد اجاره خاتمه یافته تلقی می‌گردد.</p>
<p class=art><b>۸-۲)</b> در صورت تخلف مستاجر از هریک از تعهدات مندرج در این قرارداد خصوصاً عدم پرداخت هریک از اقساط مال‌الاجاره در مواعد مقرر و سررسید معینه مندرج در ماده ۵، قرارداد بدون نیاز به اراده طرفین منفسخ می‌گردد.</p>
<p class=art-title>ماده ۹) قرض‌الحسنه:</p>
<p class=art>مبلغ (( ${esc(qarzAmt)} )) به شرح زیر از جانب مستاجر ${qarzWho} در اختیار موجر قرار دارد و با رضایت ایشان به عنوان مبلغ قرض‌الحسنه در این قرارداد در نظر گرفته و تحویل موجر شد:</p>
${art9}
<p class=art><b>تبصره ۱:</b> در صورت تملیک مورد اجاره به مستاجر به شرح مندرج در ماده (۱۰) این قرارداد کل مبلغ قرض‌الحسنه فوق بابت بخشی از ثمن عین مستاجره متعلق به موجر خواهد بود فلذا مستاجر حق مطالبه و یا استرداد نخواهد داشت.</p>`;

    const p3 = `<p class=art-title>ماده ۱۰) نحوه و شرایط تملیک عین مستاجره:</p>
<p class=art>چنانچه مستاجر کلیه تعهدات و شروط قرارداد را در مواعد معینه ایفا نماید خصوصاً اقساط مال‌الاجاره به شرح مندرج در ماده (۵) این قرارداد را رأس‌الموعد تسلیم موجر نماید در پایان مدت قرارداد کلیه وجوه پرداختی وی به موجر بابت اجاره بهاء و نیز مبلغ قرض‌الحسنه به شرح مندرج در ماده (۹) که به موجر پرداخت نموده است جملگی به عنوان ثمن عین مستاجره محسوب گردیده و مورد اجاره به ملکیت مستاجر درآمده و موجر متعهد است نسبت به انجام مقدمات انتقال رسمی سند مالکیت عین مستاجره در دفترخانه اسناد رسمی به نام مستاجر اقدام نماید.</p>
<p class=art><b>تبصره ۱:</b> کلیه هزینه‌ها اعم از دارایی، شهرداری و غیره همچنین هزینه دفترخانه (حق‌الثبت و حق‌التحریر) بر عهده مستاجر خواهد بود و تنظیم و انتقال رسمی سند مالکیت مورد اجاره منوط به پرداخت وجوه مذکور در این تبصره توسط مستاجر می‌باشد.</p>
<p class=art><b>تبصره ۲:</b> چنانچه مستاجر از هیچ یک از شروط قرارداد تخلف ننموده و کل مبلغ اجاره بها را به صورت یکجا و قبل از مواعد مقرر تسلیم موجر نماید از تاریخ تسویه حساب قطعی با موجر عین مستاجره به ملکیت وی درآمده و متعاقدین مکلف به اجرای ماده (۱۰) خواهند بود.</p>
<p class=art><b>تبصره ۳:</b> مستاجر متعهد گردید ظرف مهلت یک ماه پس از حصول شرایط این قرارداد از جمله پرداخت تمامی اقساط و انجام مقدمات لازم با حضور در دفتر اسناد رسمی نسبت به تنظیم سند رسمی این قرارداد مطابق با قانون الزام به ثبت رسمی معاملات غیرمنقول اقدام نماید.</p>
<p class=art-title>ماده ۱۱) حل اختلاف و داوری:</p>
<p class=art>در صورت بروز هرگونه اختلاف فی‌مابین طرفین چه در مدت اعتبار قرارداد و چه پس از خاتمه آن که ناشی و یا در ارتباط با این قرارداد باشد از جمله اختلافات راجع به انعقاد، فسخ، انفساخ، ابطال، بطلان، اجرای تعهدات، خسارت، نحوه انجام یا عدم انجام تعهد، نقص و کلیه اختلافات راجع به ابهام در مفاد این قرارداد و حتی در مورد مطالب عنوان‌نشده و مسکوت و به طور کلی در هر موردی که ضرورت ایجاب نماید من‌جمله نحوه اجرای این قرارداد و یا تفسیر مندرجات آن موضوع از طریق داوری حل و فصل می‌گردد و طرفین رای داور را فصل‌الخطاب و قاطع دعوی تلقی می‌نمایند لذا وفق تبصره ذیل ماده ۴۵۵ قانون آیین دادرسی مدنی متعاملین به آقای جمال باقرزاده تفویض اختیار نمودند تا در موارد لزوم نسبت به تعیین داور واحد مرضی‌الطرفین با حق صلح و سازش اقدام و رفع اختلاف به شرح فوق به عهده داور منتخب خواهد بود. بدیهی است رای صادره توسط داور واحد منتخب مذکور قطعی و مفاد آن برای طرفین لازم‌الاجرا تلقی می‌گردد. شرط داوری حاضر موافقت‌نامه‌ای مستقل از اصل قرارداد تلقی می‌گردد که ضمن‌العقد حاضر و ضمن‌العقد خارج لازم در هر حال بر متعاملین لازم‌الاتباع است.</p>
<p class=art><b>تبصره:</b> دعوت از طرفین جهت حضور در جلسه داوری و ابلاغ رای داور از طریق ارسال اظهارنامه توسط واحد اظهارنامه مستقر در دادگستری و یا از طریق پست پیشتاز (به انتخاب و صلاحدید داور منتخب) به نشانی طرفین مندرج در ماده یک این قرارداد انجام خواهد شد و ارسال هر نوع مراسله به نشانی مزبور به منزله ابلاغ واقعی تلقی می‌گردد.</p>`;

    const p4 = `<p class=art-title>ماده ۱۲) سایر شروط:</p>
<p class=art><b>۱-۱۲)</b> مستاجر موظف و متعهد می‌باشد که کلیه مبالغ قید شده در ماده ۵ قرارداد را در سررسید و مواعد توافق‌شده به شماره حساب اعلامی پرداخت و فیش واریز آن را به موجر تحویل نماید. در صورت عدم پرداخت هریک از این مبالغ قرارداد منفسخ می‌گردد.</p>
<p class=art><b>۲-۱۲)</b> اسقاط کافه خیارات خصوصاً خیار غبن به اعلی مرتبه فاحشا او افحشا و تدلیس از مستاجر به عمل آمد.</p>
<p class=art><b>۳-۱۲)</b> مستاجر حق انتقال قرارداد و انتقال مورد اجاره را مشاعاً یا مفروزاً جزئاً یا کلاً به هیچ صورت و لو از طریق عقود معین و یا غیرمعین به هیچ شخص حقیقی و یا حقوقی خصوصی یا عمومی ندارد و مورد اجاره صرفاً با وصف قید مباشرت جهت سکونت مستاجر و افراد تکفل وی، همسر و فرزندان ایشان در اختیار مستاجر است.</p>
<p class=art><b>۴-۱۲)</b> مستاجر متعهد به رعایت موازین اسلامی در مورد اجاره می‌باشد.</p>
<p class=art><b>۵-۱۲)</b> مستاجر متعهد به جبران کلیه خسارت وارده به عین مستاجره اعم از جبران کسر و انکسارات درب و پنجره‌ها و شیشه و یراق‌آلات و متعلقات مورد اجاره می‌باشد حتی در صورت عدم تعدی یا تفریط.</p>
<p class=art><b>۶-۱۲)</b> مالیات مستغلاتی و عوارض شهرداری و تعمیرات کلی و تعمیرات جزئی که جهت استفاده بهتر باشد از هر جهت بر عهده مستاجر است.</p>
<p class=art><b>۷-۱۲)</b> پرداخت کلیه هزینه‌های متعلق به عین مستاجره خصوصاً آب/ برق/ گاز/ تلفن/ حق شارژ/ فاضلاب شهری /عوارض و غیره بر عهده مستاجر است در هنگام انقضاء قرارداد و مفاصا حساب مربوطه را ارائه نماید.</p>
<p class=art><b>۸-۱۲)</b> تمدید قرارداد اجاره و یا کلیه مهلت‌ها و مواعد فقط با رضایت کتبی طرفین میسر است.</p>
<p class=art><b>۹-۱۲)</b> تا قبل از تملک مورد اجاره، مستاجر حق اعمال هیچ‌گونه تغییر در مورد اجاره چه به صورت کلی و یا جزئی را ندارد مگر آنکه قبلاً رضایت کتبی موجر را اخذ نموده باشد.</p>
<p class=art><b>۱۰-۱۲)</b> اقامتگاه طرفین این قرارداد از نظر ارسال هرگونه مراسله اعم از ابلاغ، اخطاریه، اظهارنامه و غیره همان است که در ماده (۱) این قرارداد مندرج است لذا طرفین توافق نمودند ارسال هر نوع مراسله به نشانی مزبور به منزله ابلاغ به شخص ایشان تلقی گردد.</p>
<p class=art><b>۱۱-۱۲)</b> مستاجر متعهد است دستورالعمل‌ها و راهنمایی‌های موجر را در خصوص چگونگی حفاظت از مورد اجاره رعایت نماید.</p>
<p class=art><b>۱۲-۱۲)</b> در صورتی که معلوم گردد مورد معامله به هر نحو مستحق‌للغیر و یا غصبی باشد و یا قانوناً قابل انتقال به سرمایه‌گذار نباشد و یا به موجب حکم قطعی مرجع صالح، مالکیت آن متعلق به غیر تشخیص داده شود، شرکت سازنده مکلف است علاوه بر استرداد کامل ثمن معامله، مبلغی معادل ده درصد (۱۰٪) از کل «ثمن پرداختی» را به عنوان خسارت ناشی از مستحق‌للغیر درآمدن مبیع، بدون نیاز به اثبات ورود ضرر، به خریدار پرداخت نماید. اجرای این بند مستقل از سایر حقوق قانونی خریدار بوده و فروشنده حق هیچ‌گونه اعتراض نسبت به آن را نخواهد داشت.</p>
<p class=art>این قرارداد در صحت و سلامت کامل طرفین در مورخ ${F(c.date || '..../..../........')} در شهر اصفهان و در دو نسخه متحدالمتن که اعتبار هر یک در حکم واحد است تهیه و پس از امضاء بین طرفین مبادله گردید. در صورت تعارض نسخ، نسخه نزد شرکت مناط اعتبار می‌باشد.</p>
<p class=art note-box><b>توجه:</b> از آنجا که توضیحات کامل به مستاجر محترم داده شده است و شرایط پرداخت و قرارداد به ایشان تفهیم گردیده است، لذا از زمان انعقاد قرارداد به مدت (${esc(x.coolDays)}) چنانچه مستاجر تمایل به فسخ قرارداد داشت مبلغ پرداختی شما با کسر هزینه‌های بالاسری و ۱٪ مبلغ کل قرارداد بابت خسارت فسخ قرارداد، برگشت می‌یابد. لذا در هنگام عقد قرارداد و پس از مطالعه آن و قبل از امضای قرارداد در صورت هرگونه ابهام با مشاوران خود و یا مشاوره حقوقی شرکت مشورت و سپس مبادرت به امضای قرارداد نمایید. مضافاً چنانچه مهلت (${esc(x.coolDays)}) بگذرد طبق مفاد قرارداد فی‌مابین عمل می‌شود.</p>
<p class=art-title>مشخصات حساب جهت واریز وجوه:</p>
<p class=art bank-line>کلیه وجوه پرداختی به حساب بانک ${esc(x.pay.bank)} به نام ${esc(x.pay.name)} واریز گردد.</p>
<p class=art>شماره کارت: ${F(x.pay.card)}</p>
<p class=art>شماره شبا: ${F(x.pay.sheba)}</p>
<p class=art>شماره حساب: ${F(x.pay.acct)}</p>`;

    return legalPages([p1, p2, p3, p4], leaseFoot());
  }

  function leaseDocDefaults(c, cu, p, u) {
    const d = c.doc || {};
    let end = d.end || '';
    if (!end && c.date && c.dur) {
      const months = parseInt(N(c.dur), 10);
      if (months > 0) end = addM(c.date, months);
    }
    return {
      title: d.title || 'خانم',
      birth: d.birth || '',
      addr: d.addr || cu.addr || '',
      phone: d.phone || cu.phone || '',
      loc: d.loc || [p.name, p.addr].filter(Boolean).join(' - '),
      area: d.area || (u.area != null && u.area !== '' ? String(u.area) : ''),
      floor: d.floor || u.floor || '',
      unitNo: d.unitNo || u.no || '',
      start: d.start || c.date || '',
      end,
      handDate: d.handDate || c.hand || c.date || '',
      qarzTotal: d.qarzTotal || 0,
      qarzPays: Array.isArray(d.qarzPays) && d.qarzPays.length ? d.qarzPays : [{ id: uid(), amt: 0, date: '', bank: '', ref: '' }],
      payDayLabel: parsePayDay(d.payDayLabel) || '',
      coolDays: parseDays(d.coolDays, LEASE_PAY_DEFAULTS.coolDays),
      qarzRefundCount: parseDays(d.qarzRefundCount, LEASE_PAY_DEFAULTS.qarzRefundCount),
      payBank: d.payBank || LEASE_PAY_DEFAULTS.payBank,
      payCard: d.payCard || LEASE_PAY_DEFAULTS.payCard,
      paySheba: d.paySheba || LEASE_PAY_DEFAULTS.paySheba,
      payAcct: d.payAcct || LEASE_PAY_DEFAULTS.payAcct,
      payName: d.payName || LEASE_PAY_DEFAULTS.payName,
    };
  }

  function editLeaseDoc(id) {
    const c = S.contracts.find((x) => x.id == id);
    if (!c || c.type !== 'lease') return toast('فقط برای اجاره به شرط تملیک');
    if (!can('write')) return toast('دسترسی ویرایش ندارید');
    const cu = cust(c.cust);
    const p = proj(c.proj) || { name: '', addr: '' };
    const u = unitOf(c.proj, c.unit);
    const init = leaseDocDefaults(c, cu, p, u);
    const m = $('#modal');
    const qarzRows = () => {
      const box = m.querySelector('#qarzBox');
      if (!box) return;
      box.innerHTML = init.qarzPays.map((row, i) => `<div class="qarz-row" data-i="${i}">
      <label>مبلغ (تومان)<input data-k="amt" inputmode="numeric" value="${esc(row.amt ? money(row.amt) : '')}"></label>
      <label>تاریخ واریز<input data-k="date" readonly style="cursor:pointer" value="${row.date ? F(row.date) : ''}" placeholder="انتخاب از تقویم"></label>
      <label>بانک<input data-k="bank" value="${esc(row.bank || '')}"></label>
      <label>شماره پیگیری<input data-k="ref" value="${esc(row.ref || '')}"></label>
      <button type="button" class="sm x" data-del="${i}">حذف</button>
    </div>`).join('');
      box.querySelectorAll('[data-k=amt]').forEach((el) => {
        el.oninput = () => { const v = Math.round(num(el.value)); el.value = v ? F(v.toLocaleString('en')) : ''; };
      });
      box.querySelectorAll('[data-k=date]').forEach((el) => bindDate(el));
      box.querySelectorAll('[data-del]').forEach((btn) => {
        btn.onclick = () => {
          syncQarzFromDom();
          init.qarzPays.splice(+btn.dataset.del, 1);
          if (!init.qarzPays.length) init.qarzPays.push({ id: uid(), amt: 0, date: '', bank: '', ref: '' });
          qarzRows();
        };
      });
    };
    const syncQarzFromDom = () => {
      const box = m.querySelector('#qarzBox');
      if (!box) return;
      init.qarzPays = [...box.querySelectorAll('.qarz-row')].map((row) => {
        const g = (k) => row.querySelector(`[data-k=${k}]`)?.value?.trim() || '';
        return {
          id: init.qarzPays[+row.dataset.i]?.id || uid(),
          amt: num(g('amt')),
          date: normJ(g('date')) || '',
          bank: g('bank'),
          ref: g('ref'),
        };
      });
    };
    m.innerHTML = `<div class="box lease-box">
    <div class="lease-form-head">
      <h3>تکمیل فیلدهای قرارداد اجاره به شرط تملیک</h3>
      <p class=fd>تاریخ‌ها را از تقویم انتخاب کنید. مهلت فسخ را به عدد وارد کنید تا در متن قرارداد به صورت «۳۰ روز» بیاید. ماده ۵ از اقساط پرونده ساخته می‌شود.</p>
    </div>
    ${crmSnapHtml(c, cu, p, u)}
    <div class=lease-sec>
      <h4>۱. طرفین</h4>
      <div class=grid>
        <label>عنوان مستاجر
          <select name=title>
            <option value="آقای">آقای</option>
            <option value="خانم">خانم</option>
            <option value="آقای/خانم">آقای/خانم</option>
          </select>
        </label>
        <label>ت.ت / تاریخ ثبت<input name=birth readonly style="cursor:pointer" placeholder="انتخاب از تقویم"></label>
        <label>همراه (در صورت نیاز به تغییر)<input name=phone inputmode=tel></label>
        <label class=w>آدرس مستاجر در قرارداد<textarea name=addr rows=2></textarea></label>
      </div>
    </div>
    <div class=lease-sec>
      <h4>۲. موضوع و واحد</h4>
      <div class=grid>
        <label>متراژ<input name=area inputmode=decimal></label>
        <label>طبقه<input name=floor></label>
        <label>شماره واحد<input name=unitNo></label>
        <label class=w>نشانی کامل واحد در متن قرارداد<textarea name=loc rows=2></textarea></label>
      </div>
    </div>
    <div class=lease-sec>
      <h4>۳. مدت، تسلیم و مهلت‌ها</h4>
      <div class=grid>
        <label>شروع اجاره<input name=start readonly style="cursor:pointer" placeholder="انتخاب از تقویم"></label>
        <label>پایان اجاره<input name=end readonly style="cursor:pointer" placeholder="انتخاب از تقویم"></label>
        <label>تاریخ تسلیم مورد اجاره<input name=handDate readonly style="cursor:pointer" placeholder="انتخاب از تقویم"></label>
        <label>روز ثابت پرداخت هر ماه (۱ تا ۳۱)<input name=payDayLabel inputmode=numeric placeholder="مثلاً ۱۰"></label>
        <label>مهلت فسخ بدون خسارت (روز)<input name=coolDays inputmode=numeric placeholder="مثلاً ۳۰"></label>
        <label>تعداد اقساط عودت قرض‌الحسنه<input name=qarzRefundCount inputmode=numeric placeholder="مثلاً ۸"></label>
      </div>
    </div>
    <div class=lease-sec>
      <h4>۴. قرض‌الحسنه</h4>
      <div class=grid>
        <label>جمع قرض‌الحسنه (تومان) – خالی = جمع ردیف‌ها<input name=qarzTotal inputmode=numeric></label>
      </div>
      <div id=qarzBox class=qarz-box></div>
      <button type=button class="sm btn-soft" id=addQarz><span class=plus>+</span> ردیف واریز</button>
    </div>
    <div class=lease-sec>
      <h4>۵. حساب واریز</h4>
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
    set('phone', init.phone); set('addr', init.addr);
    set('area', init.area); set('floor', init.floor); set('unitNo', init.unitNo); set('loc', init.loc);
    set('payDayLabel', init.payDayLabel ? F(init.payDayLabel) : '');
    set('coolDays', init.coolDays ? F(init.coolDays) : '');
    set('qarzRefundCount', init.qarzRefundCount ? F(init.qarzRefundCount) : '');
    set('payBank', init.payBank); set('payCard', init.payCard); set('paySheba', init.paySheba); set('payAcct', init.payAcct); set('payName', init.payName);
    m.querySelector('[name=qarzTotal]').value = init.qarzTotal ? money(init.qarzTotal) : '';
    m.querySelector('[name=qarzTotal]').oninput = function () { fmtIn(this); };
    ['birth', 'start', 'end', 'handDate'].forEach((k) => {
      const e = m.querySelector(`[name=${k}]`);
      e.value = init[k] ? F(init[k]) : '';
      bindDate(e);
    });
    hintFor(m.querySelector('[name=coolDays]'), (v) => {
      const n = parseDays(v, 0);
      return n ? `در متن قرارداد: ${daysPhrase(n)}` : 'عدد روز را وارد کنید';
    });
    hintFor(m.querySelector('[name=payDayLabel]'), (v) => {
      const n = parsePayDay(v);
      return n ? `در متن قرارداد: ${dayOrd(n)} هر ماه` : 'خالی = از تاریخ اولین قسط هر گروه';
    });
    hintFor(m.querySelector('[name=qarzRefundCount]'), (v) => {
      const n = parseDays(v, 0);
      return n ? `در تبصره ماده ۵: طی ${F(n)} قسط` : '';
    });
    qarzRows();
    m.querySelector('#addQarz').onclick = () => {
      syncQarzFromDom();
      init.qarzPays.push({ id: uid(), amt: 0, date: '', bank: '', ref: '' });
      qarzRows();
    };
    m.querySelector('#ok').onclick = () => {
      syncQarzFromDom();
      const g = (k) => (m.querySelector(`[name=${k}]`)?.value || '').trim();
      const birth = normJ(g('birth'));
      const start = normJ(g('start'));
      const end = normJ(g('end'));
      const handDate = normJ(g('handDate'));
      if (g('birth') && !birth) return toast('تاریخ تولد/ثبت معتبر نیست');
      if (g('start') && !start) return toast('تاریخ شروع معتبر نیست');
      if (g('end') && !end) return toast('تاریخ پایان معتبر نیست');
      if (g('handDate') && !handDate) return toast('تاریخ تسلیم معتبر نیست');
      const coolDays = parseDays(g('coolDays'), LEASE_PAY_DEFAULTS.coolDays);
      const qarzRefundCount = parseDays(g('qarzRefundCount'), LEASE_PAY_DEFAULTS.qarzRefundCount);
      const payDay = parsePayDay(g('payDayLabel'));
      const qarzPays = init.qarzPays.filter((r) => r.amt || r.date || r.bank || r.ref).map((r) => ({
        id: r.id || uid(),
        amt: Number(r.amt) || 0,
        date: r.date || '',
        bank: r.bank || '',
        ref: r.ref || '',
      }));
      const qarzTotal = num(g('qarzTotal')) || sum(qarzPays, (r) => r.amt);
      c.doc = {
        ...(c.doc || {}),
        title: g('title') || 'آقای/خانم',
        birth: birth || '',
        addr: g('addr'),
        phone: N(g('phone')),
        loc: g('loc'),
        area: g('area'),
        floor: g('floor'),
        unitNo: g('unitNo'),
        start: start || '',
        end: end || '',
        handDate: handDate || '',
        qarzTotal,
        qarzPays,
        payDayLabel: payDay ? String(payDay) : '',
        coolDays: String(coolDays),
        qarzRefundCount: String(qarzRefundCount),
        payBank: g('payBank'),
        payCard: N(g('payCard')),
        paySheba: N(g('paySheba')),
        payAcct: N(g('payAcct')),
        payName: g('payName'),
      };
      if (handDate) c.hand = handDate;
      if (c.ed) delete c.ed.c;
      save();
      closeM();
      render();
      toast('فیلدهای قرارداد ذخیره شد');
    };
  }

  window.LESSOR = LESSOR;
  window.isLumpInst = isLumpInst;
  window.groupInstForLease = groupInstForLease;
  window.leaseMissing = leaseMissing;
  window.leaseDoc = leaseDoc;
  window.editLeaseDoc = editLeaseDoc;
})();
