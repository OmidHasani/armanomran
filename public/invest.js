/* قالب رسمی قرارداد سرمایه‌گذاری در ساخت – وابسته به app.js و legal-ui.js */
(function () {
  const BUILDER = {
    name: 'شرکت آیینه گستر ساختمان اصفهان',
    regNo: '37548',
    nid: '10260551180',
    regDate: '07/05/1388',
    place: 'اصفهان',
    phone: '09133151689',
    addr: 'اصفهان- خیابان چهارباغ بالا-مجموعه متروپل-کوچه باغ ارم-مجتمع ارم-طبقه چهارم-واحد ۴۱',
  };
  const PAY_DEFAULTS = {
    payBank: 'مسکن',
    payCard: '6280231545915190',
    paySheba: '930140040000013010694761',
    payAcct: '13010694761',
    payName: 'فریده بهزادی',
    coolDays: 30,
    delayFineDaily: 150000,
    delayExtraDays: 15,
  };
  const SPECS = 'اجرای پوشش مناسب در محل‌هایی که کانال کولر عبور کرده است. آسانسور و درب اصلی ریموت‌دار، سرویس‌های بهداشتی و آشپزخانه تا سقف از کاشی و کف‌ها کامل از سرامیک، لوله‌کشی واحدها از نوع پنج لایه، درب‌های داخلی (cnc) پیش‌ساخته و کانال‌کشی کولرها با ورق گالوانیزه و پنجره‌های (یو پی وی سی) دوجداره، سرویس بهداشتی و سنگ توالت، کف پشت‌بام ایزوگام، اجرای دستگیره‌ها و قفل‌ها نصب نرده راه‌پله، اجرای لوله‌کشی گاز با استانداردهای موجود، اجرای سیستم آتش‌نشانی بر اساس دستورالعمل‌های موجود، کلید خطای جریان، نصب تهویه مناسب به تناسب حجم پارکینگ، نصب روشنایی اضطراری در پاگردهای دستگاه پله، احداث جان‌پناه اطراف پشت‌بام، سایر موارد به تشخیص و صلاحدید سازنده خواهد بود.';
  const DAY_ORD = ['', 'یکم', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم', 'هشتم', 'نهم', 'دهم', 'یازدهم', 'دوازدهم', 'سیزدهم', 'چهاردهم', 'پانزدهم', 'شانزدهم', 'هفدهم', 'هجدهم', 'نوزدهم', 'بیستم', 'بیست‌ویکم', 'بیست‌ودوم', 'بیست‌وسوم', 'بیست‌وچهارم', 'بیست‌وپنجم', 'بیست‌وششم', 'بیست‌وهفتم', 'بیست‌وهشتم', 'بیست‌ونهم', 'سی‌ام', 'سی‌ویکم'];
  const dayOrd = (d) => DAY_ORD[d] || F(d);
  const WW = (n) => (n ? `${words(Math.round(n))} تومان` : '................................ تومان');
  const fillOr = (v, fb = '........') => {
    const s = String(v ?? '').trim();
    return s ? s : fb;
  };
  const dots = (n = 20) => '.'.repeat(n);
  const lumpOf = (i) => (typeof isLumpInst === 'function' ? isLumpInst(i) : ((i.kind || '') === 'lump' || /الباقی|نقدی|یکجا|تسویه\s*نهایی/.test(i.title || '')));

  function groupUnpaid(inst) {
    const sorted = [...(inst || [])].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const lumps = sorted.filter(lumpOf);
    const paid = sorted.filter((i) => i.paid && !lumpOf(i));
    const regs = sorted.filter((i) => !i.paid && !lumpOf(i));
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
    return { paid, groups, lumps };
  }

  function defaultChequeNo(c) {
    const d = c.doc || {};
    if (d.chequeNo) return d.chequeNo;
    if (!c.date) return '';
    const parts = String(c.date).split('/');
    const y = parts[0] || '';
    const serial = String(c.no || '').replace(/^ق-?/, '');
    return `${c.date}- ${serial || '--'}/${y}/الف`;
  }

  function investDocData(c, cu, p, u) {
    const d = { ...(c.doc || {}) };
    const landAddr = fillOr(d.landAddr || p.addr, 'اصفهان- خیابان ' + dots(28));
    const area = fillOr(d.area || (u.area != null && u.area !== '' ? String(u.area) : ''), '--');
    const floor = fillOr(d.floor || u.floor, '--');
    const block = fillOr(d.block || '', '--');
    const title = fillOr(d.title || 'خانم / آقای', 'خانم / آقای');
    const father = fillOr(cu.father, '----');
    const birth = fillOr(d.birth, '--/--/----');
    const phone = fillOr(d.phone || cu.phone, '----------');
    const addr = fillOr(d.addr || cu.addr, 'اصفهان ' + dots(20));
    const postal = fillOr(d.postal, '----------');
    const dur = fillOr(c.dur, '--');
    const coolN = parseDays(d.coolDays, PAY_DEFAULTS.coolDays);
    const coolDays = daysPhrase(coolN);
    const delayExtraN = parseDays(d.delayExtraDays, PAY_DEFAULTS.delayExtraDays);
    const delayExtraDays = daysPhrase(delayExtraN);
    const delayFineDaily = Number(d.delayFineDaily) || PAY_DEFAULTS.delayFineDaily;
    const chequeNo = fillOr(defaultChequeNo(c), '--/--/----- --/----/الف');
    const payDayNum = parsePayDay(d.payDayLabel);
    const pay = {
      bank: fillOr(d.payBank || PAY_DEFAULTS.payBank, 'مسکن'),
      card: fillOr(d.payCard || PAY_DEFAULTS.payCard, PAY_DEFAULTS.payCard),
      sheba: fillOr(d.paySheba || PAY_DEFAULTS.paySheba, PAY_DEFAULTS.paySheba),
      acct: fillOr(d.payAcct || PAY_DEFAULTS.payAcct, PAY_DEFAULTS.payAcct),
      name: fillOr(d.payName || PAY_DEFAULTS.payName, PAY_DEFAULTS.payName),
    };
    return {
      d, landAddr, area, floor, block, title, father, birth, phone, addr, postal, dur, coolDays, coolN, delayExtraDays, delayExtraN, delayFineDaily, chequeNo, payDayNum, pay,
      name: fillOr(cu.name, dots(12)),
      nid: fillOr(cu.nid, '------'),
    };
  }

  function investArt6Html(c, x) {
    const { paid, groups, lumps } = groupUnpaid(c.inst);
    const empty = !paid.length && !groups.length && !lumps.length;
    if (empty) {
      return `<p class=art><b>۱-۶)</b> مبلغ ((------ میلیون تومان)) در تاریخ --/--/---- از حساب خانم/ آقای -------- به حساب ${esc(x.pay.name)} بانک ${esc(x.pay.bank)} به شماره پیگیری ---------؛ از سوی سرمایه‌گذار تسلیم سازنده گردید.</p>
<p class=art><b>۲-۶)</b> مبلغ ((--------- میلیون تومان)) در تاریخ --/--/---- از حساب خانم/ آقای -------- به حساب بانک ${esc(x.pay.bank)} ${esc(x.pay.name)} به شماره پیگیری ---------؛ از سوی سرمایه‌گذار تسلیم سازنده گردید.</p>
<p class=art><b>۳-۶)</b> مبلغ ((................................ تومان)) طی -- قسط مساوی متوالی (یک ماه به یک ماه) هر قسط به مبلغ ((-- میلیون تومان)) که -- هر ماه باید از سوی مشتری تسلیم شرکت سازنده گردد و سررسید اولین قسط تاریخ --/--/---- خواهد بود. (توضیح آنکه ماه در این قرارداد سی روز محاسبه می‌گردد).</p>
<p class=art><b>۴-۶)</b> الباقی مبلغ قرارداد معادل ((---------- میلیون تومان)) را به صورت نقد یا تسهیلات تا پایان وقت اداری مورخ --/--/---- تسلیم شرکت سازنده نماید.</p>`;
    }
    const parts = [];
    let n = 0;
    paid.forEach((i) => {
      n += 1;
      const when = i.pdate || i.date;
      const who = `${x.title} ${x.name}`;
      parts.push(`<p class=art><b>${F(n)}-۶)</b> مبلغ ((${esc(WW(i.amt))})) در تاریخ ${F(when)} از حساب ${esc(who)} به حساب ${esc(x.pay.name)} بانک ${esc(x.pay.bank)} به شماره پیگیری ${F(fillOr(i.ref, '---------'))}؛ از سوی سرمایه‌گذار تسلیم سازنده گردید.</p>`);
    });
    groups.forEach((g) => {
      n += 1;
      const day = x.payDayNum || pj(g.first)[2] || 0;
      const dayLabel = dayOrd(day);
      parts.push(`<p class=art><b>${F(n)}-۶)</b> مبلغ ((${esc(WW(g.total))})) طی ${F(g.count)} قسط مساوی متوالی (یک ماه به یک ماه) هر قسط به مبلغ ((${esc(WW(g.amt))})) که ${esc(dayLabel)} هر ماه باید از سوی مشتری تسلیم شرکت سازنده گردد و سررسید اولین قسط تاریخ ${F(g.first)} خواهد بود. (توضیح آنکه ماه در این قرارداد سی روز محاسبه می‌گردد).</p>`);
    });
    lumps.forEach((lump) => {
      n += 1;
      parts.push(`<p class=art><b>${F(n)}-۶)</b> الباقی مبلغ قرارداد معادل ((${esc(WW(lump.amt))})) را به صورت نقد یا تسهیلات تا پایان وقت اداری مورخ ${F(lump.date)} تسلیم شرکت سازنده نماید.</p>`);
    });
    return parts.join('\n');
  }

  function investMissing(c) {
    if (c.type !== 'invest') return [];
    const d = c.doc || {};
    const miss = [];
    if (!d.title) miss.push('عنوان سرمایه‌گذار (آقای/خانم)');
    if (!(d.landAddr || '').trim() && !(proj(c.proj) || {}).addr) miss.push('نشانی زمین پروژه');
    if (!(c.inst || []).length) miss.push('اقساط و پرداخت‌ها (برای ماده ۶)');
    return miss;
  }

  function investDoc(c, cu, p, u) {
    const x = investDocData(c, cu, p, u);
    const art6 = investArt6Html(c, x);
    const totalWords = c.total ? WW(c.total) : '--- میلیارد و ----------- میلیون تومان';
    const delayFine = words(Math.round(x.delayFineDaily)) || 'یکصد و پنجاه هزار';
    const head = legalHead(c.no, c.date, '« بسم الله الرحمن الرحیم »', 'قرارداد سرمایه‌گذاری در ساخت');

    const p1 = `${head}
<p class=art-title>ماده ۱- طرفین قرارداد (متعاملین)</p>
<p class=art><b>۱-۱) شرکت سازنده:</b> ${esc(BUILDER.name)} به شماره ثبت: ${F(BUILDER.regNo)} شناسه ملی: ${F(BUILDER.nid)} تاریخ ثبت: ${F(BUILDER.regDate)} محل ثبت: ${esc(BUILDER.place)} به آدرس: ${esc(BUILDER.addr)} تلفن همراه: ${F(BUILDER.phone)} که در این قرارداد از این پس به اختصار شرکت سازنده نامیده می‌شود.</p>
<p class=art><b>۱-۲) سرمایه‌گذار:</b> ${esc(x.title)} ${esc(x.name)} نام پدر: ${esc(x.father)} به کدملی: ${F(x.nid)} ت.ت /تاریخ ثبت: ${F(x.birth)} آدرس ${esc(x.addr)} به کد پستی ${F(x.postal)} همراه ${F(x.phone)} که در این قرارداد از این پس به اختصار سرمایه‌گذار نامیده می‌شود.</p>
<p class=art-title>ماده ۲- موضوع قرارداد</p>
<p class=art>موضوع قرارداد عبارت است از تعهد شرکت سازنده به واگذاری یک واحد آپارتمان با مشخصات اوصاف و شرایط مورد توافق طرفین که پس از اتمام عملیات ساخت‌وساز طبق شرایط این قرارداد، مشروط به انجام به موقع و کامل تعهدات از جانب سرمایه‌گذار به ایشان تملیک و تحویل می‌شود.</p>
<p class=art-title>ماده ۳- نشانی زمین محل اجرای پروژه:</p>
<p class=art>${esc(x.landAddr)}</p>
<p class=art note-box><b>توجه:</b> از زمان انعقاد قرارداد به مدت (${esc(x.coolDays)}) چنانچه سرمایه‌گذار تمایل به فسخ قرارداد داشت فقط اصل مبلغ پرداختی شما بدون کسر هزینه‌های بالاسری و خسارت فسخ قرارداد و حتی هزینه تنظیم قرارداد و یا بدون در نظر گرفتن سود به اصل مبلغ پرداختی‌ها طبق قرارداد برگشت می‌یابد. لذا در هنگام عقد قرارداد و پس از مطالعه آن و قبل از امضای قرارداد در صورت هرگونه ابهام با مشاوران خود و یا مشاوره حقوقی شرکت مشورت و سپس مبادرت به امضای قرارداد نمایید. مضافاً چنانچه مهلت (${esc(x.coolDays)}) بگذرد طبق مفاد قرارداد فی‌مابین عمل می‌شود.</p>
<p class=art-title>ماده ۴- خصوصیات و صفات مورد معامله</p>
<p class=art>${esc(SPECS)}</p>
<p class=art-title>ماده ۵- مشخصات آپارتمان مورد واگذاری (موضوع قرارداد)</p>
<p class=art>مورد واگذاری یک واحد آپارتمان مسکونی به مساحت حدودی ${F(x.area)} مترمربع (اعم از مفید و غیرمفید با احتساب مشاعات و پارکینگ) واقع در بلوک ${esc(F(x.block))} طبقه ${esc(F(x.floor))} که (طبق تبصره ۱) به انتخاب شرکت سازنده می‌باشد و دارای سالن و آشپزخانه و سرویس بهداشتی و یک واحد پارکینگ اختصاصی می‌باشد و همچنین سرمایه‌گذار از کمیت و کیفیت واحد اطلاع کامل دارد و بازدید واحد فوق را انجام داده‌اند و سپس مبادرت به تنظیم این قرارداد نموده‌اند و سرمایه‌گذار اذعان می‌نماید که در طول مراحل ساخت و یا پس از تحویل آپارتمان هیچ‌گونه ادعایی نسبت به زمان تحویل، نحوه احداث، مصالح یا متریال مورد استفاده، مساحت و متراژ و محاسبات ندارد.</p>
<p class=art><b>تبصره ۱:</b> سرمایه‌گذار محترم اولویت واگذاری واحد و طبقه به انجام و اجرای هر یک از تعهدات مندرج در این قرارداد خصوصاً پرداخت به موقع هر یک از اقساط و تاریخ و زمان تسویه حساب مربوط می‌باشد و در این خصوص هرگونه اولویت واگذاری واحد و طبقه و تصمیم‌گیری در این خصوص به عهده شرکت سازنده می‌باشد و سرمایه‌گذار حق هرگونه اعتراض در این خصوص را از خود سلب نموده است.</p>`;

    const p2 = `<p class=art-title>ماده ۶- مبلغ قرارداد و نحوه پرداخت:</p>
<p class=art>بر اساس توافق طرفین مبلغ مقرر جهت اجرای موضوع قرارداد عبارت است از (( ${esc(totalWords)} )) که به شرح ذیل:</p>
${art6}
<p class=art>به سرمایه‌گذار تفهیم گردید که کلیه پرداخت‌های ماده ۶ باید در سررسید معین پرداخت گردد و در صورت عدم پرداخت به هر علتی در سررسید معین قرارداد سرمایه‌گذاری منفسخ و از درجه اعتبار ساقط می‌گردد و پرداخت مبالغ فوق منوط به تحویل آپارتمان نمی‌باشد و سرمایه‌گذار به بهانه عدم تحویل نمی‌تواند از پرداخت مبالغ فوق سر باز زند.</p>
<p class=art-title>ماده ۷- نحوه تملیک و تحویل آپارتمان موضوع قرارداد</p>
<p class=art>آپارتمان موضوع قرارداد مشروط به آنکه سرمایه‌گذار کلیه تعهدات قراردادی خصوصاً تعهدات مالی به شرح مندرج در ماده شش را در سررسید مقرر به شرکت سازنده پرداخت نموده و هیچ‌گونه تعهد مالی معوق به شرکت سازنده نداشته باشد و همچنین در روند اجرایی و اداری پروژه خلل ایجاد نشود که علت تأخیر ناشی از عدم انجام تعهدات سرمایه‌گذار و یا خلل ایجاد شده باشد، ظرف ${F(x.dur)} ماه پس از انعقاد قرارداد حاضر احداث و تکمیل گردیده و سازنده کلیه وجوه پرداختی توسط سرمایه‌گذار به شرح مندرج در ماده شش را به عنوان ثمن تملک نموده و متعهد است آپارتمان موضوع قرارداد را طبق آنچه در این قرارداد مقرر گردیده است به عقد بیع شرعی با مراعات شرایط صحت به تملیک سرمایه‌گذار در آورده و طبق خصوصیات مندرج در قرارداد تسلیم ایشان نماید.</p>
<p class=art>مشروط به تسویه‌حساب کامل و نبودن تعهد انجام‌نشده از سوی سرمایه‌گذار در صورت تأخیر به شرح ماده ۷ روزانه ${esc(delayFine)} تومان خسارت از زمان انجام کلیه تعهدات به شرح قرارداد برای سرمایه‌گذار در نظر گرفته می‌شود.</p>
<p class=art><b>تبصره ۲:</b> به ازای هر روز تأخیر در پرداخت هر یک از تعهدات مالی سرمایه‌گذار نسبت به شرکت سازنده، ${esc(x.delayExtraDays)} به موعد تملیک و تحویل آپارتمان اضافه می‌گردد.</p>
<p class=art-title>ماده ۸- زمان انتقال سند مالکیت آپارتمان موضوع قرارداد</p>
<p class=art>شرکت سازنده متعهد است پس از تسلیم آپارتمان مورد واگذاری به شرح مندرج در ماده (۷)، نسبت به تأمین کلیه مقدمات لازم جهت انتقال رسمی سند مالکیت آن به نام سرمایه‌گذار هر نوع اقدام شایسته معمول دارد.</p>
<p class=art><b>تبصره ۳:</b> هزینه‌های اعم از مالیات و دارایی و شهرداری و هرگونه حقوق ناشی از هزینه حق‌الثبت و حق‌التحریر و مالیات بر ارزش افزوده به عهده سرمایه‌گذار است و تنظیم و انتقال رسمی سند مالکیت منوط به پرداخت وجوه مذکور در این تبصره توسط سرمایه‌گذار می‌باشد.</p>
<p class=art-title>ماده ۹- شروط ضمن العقد</p>
<p class=art><b>۱-۹)</b> سرمایه‌گذار متعهد است نسبت به پرداخت اقساط تعیین‌شده مورد معامله اقدام نماید، در صورت استنکاف مشارالیه از پرداخت در زمان مقرر، قرارداد کان‌لم‌یکن تلقی و بدون مراجعه به مراجع قضایی منفسخ و از درجه اعتبار ساقط گردیده و سرمایه‌گذار حقی بر این قرارداد ندارد و صرفاً مستحق دریافت اصل وجه پرداختی پس از کسر هزینه‌های بالاسری به انضمام کسر ۱۰ درصد از ثمن معامله بابت هزینه‌های ناشی از فسخ قرارداد طی حداقل ۱۲ قسط خواهد بود که پرداخت مذکور منوط به این است که سرمایه‌گذار ظرف مهلت ۲ ماه از تاریخ اعلام به وی از هر طریقی که صلاح بداند با حضور خود در شرکت نسبت به ابطال فیش‌های واریز وجه و امضاء اوراق شرکت اقدام نماید که در صورت عدم حضور کل وجه پرداخت‌شده از جانب سرمایه‌گذار به عنوان وجه التزام موضوع ماده (۲۳۰ قانون مدنی) به شرکت سازنده تعلق گرفته و هیچ‌گونه ایراد و اعتراضی از ناحیه سرمایه‌گذار مسموع نخواهد بود.</p>
<p class=art><b>۲-۹)</b> نصب هر نوع تجهیزات اضافه در مورد معامله که در لیست جدول نازک‌کاری پیوست قرارداد موجود نباشد مشروط به موافقت شرکت و با هزینه سرمایه‌گذار خواهد بود.</p>
<p class=art><b>۳-۹)</b> پس از تحویل آپارتمان رابطه سرمایه‌گذار با سایر مالکین آپارتمان‌های مجموعه مطابق قانون تملک آپارتمان‌ها و آیین‌نامه مربوط خواهد بود. سرمایه‌گذار مکلف است نسبت به پرداخت هزینه‌های متعلقه از بابت حق شارژ و غیره اقدام نماید.</p>
<p class=art><b>۴-۹)</b> تأمین و تهیه کولر، پکیج، رادیاتور، کابینت و ملزومات، پست برق و گاز و انشعابات شهری (آب، فاضلاب، برق، گاز) به عهده سرمایه‌گذار بوده که با مراعات بند (۴-۹) قابل نصب است، (تعیین زمان پرداخت هزینه انشعابات با شرکت سازنده است).</p>
<p class=art><b>۵-۹)</b> اعمال نظر و سلیقه از سرمایه‌گذار در قسمت‌های مشاع ساختمان از قبیل ورودی و راهرو و پارکینگ و نما پذیرفته نیست.</p>`;

    const p3 = `<p class=art><b>۶-۹)</b> در صورت وجود ضرورت نصب شیشه دوجداره تفاوت قیمت با سرمایه‌گذار محاسبه خواهد شد.</p>
<p class=art><b>۷-۹)</b> تأخیر ناشی از موارد فورس‌ماژور از قبیل سیل و زلزله و غیره مجاز محسوب می‌شود.</p>
<p class=art><b>۸-۹)</b> ارسال هر نوع مراسله از ابلاغ، اخطاریه، احضاریه و غیره به نشانی طرفین که در صدر این قرارداد مندرج است به منزله ابلاغ به شخص ایشان است و دریافت‌شده تلقی می‌گردد.</p>
<p class=art><b>۹-۹)</b> تمدید کلیه مواعد و مهلت‌های مندرج در این قرارداد صرفاً با توافق کتبی متعاملین ممکن است و لاغیر.</p>
<p class=art><b>۱۰-۹)</b> تشخیص شرکت سازنده در خصوص تخلف سرمایه‌گذار از ایفای تعهدات و شروط مندرج در این قرارداد و اعلام میزان بدهی و دیون سرمایه‌گذار معتبر بوده و جهت صدور اجراییه و هر نوع اقدام مقتضی کافی می‌باشد و سرمایه‌گذار حق هرگونه ایراد و اعتراضی را در این مورد از خود سلب و اسقاط نمودند.</p>
<p class=art><b>۱۱-۹)</b> سرمایه‌گذار اقرار و اعتراف نمود که از کم‌وکیف و اوصاف و نیز از تمامی مشخصات مورد معامله اطلاع کامل و کافی دارد و به هیچ وجه موضوع مبهم و مجهولی در این رابطه برای وی وجود ندارد.</p>
<p class=art><b>۱۲-۹)</b> اسقاط کافه خیارات متصوره قانونی خصوصاً خیار غبن و تدلیس به هر درجه که باشد از سرمایه‌گذار به عمل آمد لذا این قرارداد قطعی است و آثار آن بر طرفین مترتب است و اجرای کامل شروط ضمن العقد بر طرفین تکلیف است و در صورت عدم تحقق شروط مندرج در این قرارداد، قرارداد منفسخ می‌گردد.</p>
<p class=art><b>۱۳-۹)</b> تا قبل از انتقال رسمی موضوع قرارداد سرمایه‌گذار حق ندارد هیچ یک از حقوق خود ناشی از قرارداد حاضر را در قالب هریک از عقود معین یا غیرمعین که باشد به غیر واگذار نماید.</p>
<p class=art><b>۱۴-۹)</b> داوری در صورت بروز هرگونه اختلاف فی‌مابین طرفین که ناشی و یا در ارتباط با این قرارداد باشد از جمله اختلافات راجع به انعقاد، فسخ، نقص و کلیه اختلافات راجع به ابهام در این قرارداد و حتی در مورد مطالب عنوان‌نشده و مسکوت و به‌طورکلی در هر موردی که ضرورت ایجاب نماید من‌جمله نحوه اجرای این قرارداد و یا تفسیر مندرجات آن موضوع از طریق داوری حل و فصل می‌گردد و طرفین رای داور را فصل‌الخطاب و قاطع دعوی تلقی می‌نمایند لذا وفق تبصره ماده ۴۵۵ قانون آیین دادرسی مدنی متعاملین به آقای جمال باقرزاده تفویض اختیار نمودند تا در موارد لزوم نسبت به تعیین داور واحد مرضی‌الطرفین با حق صلح و سازش اقدام و رفع اختلاف به شرح فوق به عهده داور منتخب خواهد بود. بدیهی است رای صادره توسط داور واحد منتخب مذکور قطعی و مفاد آن برای طرفین لازم‌الاجرا تلقی می‌گردد، شرط داوری حاضر موافقت‌نامه‌ای مستقل از اصل قرارداد تلقی می‌گردد که ضمن‌العقد حاضر و ضمن‌العقد خارج لازم در هر حال بر متعاملین لازم‌الاتباع است.</p>
<p class=art><b>۱۵-۹)</b> در صورت اخذ وام بانکی توسط شرکت، به نمایندگی از متقاضی، اصل مبلغ خالص وام دریافتی جزء پرداخت بخشی از مبلغ قرارداد محسوب خواهد شد و شرکت وکیل تام‌الاختیار متقاضی جهت اخذ وام بانکی می‌باشد، ضمناً کلیه هزینه‌های مربوط به دریافت وام، سود دوران مشارکت و پرداخت اقساط آن بر عهده سرمایه‌گذار است.</p>
<p class=art><b>۱۶-۹)</b> سرمایه‌گذار ضمن عقد خارج لازم به شرکت سازنده وکالت بلاعزل داد و اختیارات شرعی و قانونی را به ایشان تفویض نمود که در صورت به‌وجود آمدن شرایط فسخ این قرارداد به ترتیب مندرج در بند (۱-۹) اصالتاً از طرف خود و به وکالت از طرف سرمایه‌گذار و بدون نیاز به حضور مشارالیه عمل نماید.</p>
<p class=art><b>۱۷-۹)</b> سرمایه‌گذار موظف و متعهد می‌باشد که کلیه چک‌های قید شده در قرارداد را همزمان با عقد قرارداد به نام شرکت سازنده ثبت نماید در صورت عدم ثبت چک‌های قید شده به منزله عدم پرداخت می‌باشد و قرارداد منفسخ می‌گردد.</p>
<p class=art><b>۱۸-۹)</b> در صورتی که معلوم گردد مورد معامله به هر نحو مستحق‌للغیر و یا غصبی باشد و یا قانوناً قابل انتقال به سرمایه‌گذار نباشد و یا به موجب حکم قطعی مرجع صالح، مالکیت آن متعلق به غیر تشخیص داده شود، شرکت سازنده مکلف است علاوه بر استرداد کامل ثمن معامله، مبلغی معادل ده درصد (۱۰٪) از کل «ثمن پرداختی» را به عنوان خسارت ناشی از مستحق‌للغیر درآمدن مبیع، بدون نیاز به اثبات ورود ضرر، به خریدار پرداخت نماید. اجرای این بند مستقل از سایر حقوق قانونی خریدار بوده و شرکت سازنده حق هیچ‌گونه اعتراض نسبت به آن را نخواهد داشت.</p>
<p class=art><b>۱۹-۹)</b> چنانچه هر یک از مبالغ و چک‌های ذکر شده در قرارداد شماره (${F(x.chequeNo)}) که جزء تعهدات سرمایه‌گذار می‌باشد به هر علت وصول نگردد قرارداد منفسخ می‌باشد و سرمایه‌گذار به این موضوع واقف است و هیچ‌گونه اعتراضی از سوی سرمایه‌گذار مسموع نخواهد بود.</p>
<p class=art><b>۲۰-۹)</b> این قرارداد در مورخ ${F(c.date || '--/--/----')} در شهرستان اصفهان و در دو نسخه متحدالمتن طی ۹ ماده و ۳ تبصره هر یک دارای اعتبار واحد است تهیه و تنظیم و پس از امضا بین طرفین مبادله گردید. و در صورت تعارض نسخ، نسخه نزد شرکت سازنده مناط اعتبار می‌باشد.</p>
<p class=art><b>توجه:</b> تحویل آپارتمان به سرمایه‌گذار منوط به انجام تمامی تعهدات و تسویه‌حساب کامل و انجام کلیه مراحل اداری مرتبط با تحویل آپارتمان می‌باشد.</p>
<p class=art-title>مشخصات حساب جهت واریز وجوه:</p>
<p class=art bank-line>*کلیه وجوه پرداختی به حساب بانک ${esc(x.pay.bank)} شماره کارت: ${F(x.pay.card)} شماره شبا: ${F(x.pay.sheba)} شماره حساب: ${F(x.pay.acct)} به نام ${esc(x.pay.name)} واریز گردد.*</p>`;

    return legalPages([p1, p2, p3], investFoot());
  }

  function investDocDefaults(c, cu, p, u) {
    const d = c.doc || {};
    return {
      title: d.title || 'خانم',
      birth: d.birth || '',
      addr: d.addr || cu.addr || '',
      phone: d.phone || cu.phone || '',
      postal: d.postal || '',
      landAddr: d.landAddr || p.addr || '',
      area: d.area || (u.area != null && u.area !== '' ? String(u.area) : ''),
      floor: d.floor || u.floor || '',
      block: d.block || '',
      payDayLabel: parsePayDay(d.payDayLabel) || '',
      coolDays: parseDays(d.coolDays, PAY_DEFAULTS.coolDays),
      chequeNo: d.chequeNo || defaultChequeNo(c),
      delayFineDaily: d.delayFineDaily || PAY_DEFAULTS.delayFineDaily,
      delayExtraDays: parseDays(d.delayExtraDays, PAY_DEFAULTS.delayExtraDays),
      payBank: d.payBank || PAY_DEFAULTS.payBank,
      payCard: d.payCard || PAY_DEFAULTS.payCard,
      paySheba: d.paySheba || PAY_DEFAULTS.paySheba,
      payAcct: d.payAcct || PAY_DEFAULTS.payAcct,
      payName: d.payName || PAY_DEFAULTS.payName,
    };
  }

  function editInvestDoc(id) {
    const c = S.contracts.find((x) => x.id == id);
    if (!c || c.type !== 'invest') return toast('فقط برای قرارداد سرمایه‌گذاری');
    if (!can('write')) return toast('دسترسی ویرایش ندارید');
    const cu = cust(c.cust);
    const p = proj(c.proj) || { name: '', addr: '' };
    const u = unitOf(c.proj, c.unit);
    const init = investDocDefaults(c, cu, p, u);
    const m = $('#modal');
    m.innerHTML = `<div class="box lease-box">
    <div class="lease-form-head">
      <h3>تکمیل فیلدهای قرارداد سرمایه‌گذاری</h3>
      <p class=fd>تاریخ‌ها را از تقویم انتخاب کنید. مهلت فسخ و روز اضافه به تحویل را عدد بزنید تا در متن قرارداد به صورت «۳۰ روز» و «۱۵ روز» بیاید. ماده ۶ از اقساط پرونده ساخته می‌شود.</p>
    </div>
    ${crmSnapHtml(c, cu, p, u)}
    <div class=lease-sec>
      <h4>۱. سرمایه‌گذار</h4>
      <div class=grid>
        <label>عنوان
          <select name=title>
            <option value="آقای">آقای</option>
            <option value="خانم">خانم</option>
            <option value="خانم / آقای">خانم / آقای</option>
          </select>
        </label>
        <label>ت.ت / تاریخ ثبت<input name=birth readonly style="cursor:pointer" placeholder="انتخاب از تقویم"></label>
        <label>همراه<input name=phone inputmode=tel></label>
        <label>کد پستی<input name=postal inputmode=numeric></label>
        <label class=w>آدرس در قرارداد<textarea name=addr rows=2></textarea></label>
      </div>
    </div>
    <div class=lease-sec>
      <h4>۲. پروژه و واحد</h4>
      <div class=grid>
        <label class=w>نشانی زمین محل اجرای پروژه<textarea name=landAddr rows=2></textarea></label>
        <label>متراژ<input name=area inputmode=decimal></label>
        <label>طبقه<input name=floor></label>
        <label>بلوک<input name=block></label>
        <label>روز ثابت پرداخت هر ماه (۱ تا ۳۱)<input name=payDayLabel inputmode=numeric placeholder="مثلاً ۱۰"></label>
      </div>
    </div>
    <div class=lease-sec>
      <h4>۳. مهلت‌ها و شماره قرارداد</h4>
      <div class=grid>
        <label>مهلت فسخ بدون خسارت (روز)<input name=coolDays inputmode=numeric placeholder="مثلاً ۳۰"></label>
        <label>روز اضافه به تحویل به‌ازای هر روز تأخیر<input name=delayExtraDays inputmode=numeric placeholder="مثلاً ۱۵"></label>
        <label>خسارت روزانه تأخیر تحویل (تومان)<input name=delayFineDaily inputmode=numeric></label>
        <label>شماره قرارداد در بند ۱۹-۹<input name=chequeNo></label>
      </div>
    </div>
    <div class=lease-sec>
      <h4>۴. حساب واریز</h4>
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
    set('phone', init.phone); set('postal', init.postal); set('addr', init.addr);
    set('landAddr', init.landAddr); set('area', init.area); set('floor', init.floor); set('block', init.block);
    set('payDayLabel', init.payDayLabel ? F(init.payDayLabel) : '');
    set('coolDays', init.coolDays ? F(init.coolDays) : '');
    set('delayExtraDays', init.delayExtraDays ? F(init.delayExtraDays) : '');
    set('chequeNo', init.chequeNo);
    set('payBank', init.payBank); set('payCard', init.payCard); set('paySheba', init.paySheba); set('payAcct', init.payAcct); set('payName', init.payName);
    m.querySelector('[name=delayFineDaily]').value = init.delayFineDaily ? money(init.delayFineDaily) : '';
    m.querySelector('[name=delayFineDaily]').oninput = function () { fmtIn(this); };
    const birthEl = m.querySelector('[name=birth]');
    birthEl.value = init.birth ? F(init.birth) : '';
    bindDate(birthEl);
    hintFor(m.querySelector('[name=coolDays]'), (v) => {
      const n = parseDays(v, 0);
      return n ? `در متن قرارداد: ${daysPhrase(n)}` : 'عدد روز را وارد کنید';
    });
    hintFor(m.querySelector('[name=delayExtraDays]'), (v) => {
      const n = parseDays(v, 0);
      return n ? `در تبصره ۲ ماده ۷: ${daysPhrase(n)} اضافه می‌شود` : 'عدد روز را وارد کنید';
    });
    hintFor(m.querySelector('[name=payDayLabel]'), (v) => {
      const n = parsePayDay(v);
      return n ? `در متن قرارداد: ${dayOrd(n)} هر ماه` : 'خالی = از تاریخ اولین قسط هر گروه';
    });
    m.querySelector('#ok').onclick = () => {
      const g = (k) => (m.querySelector(`[name=${k}]`)?.value || '').trim();
      const birth = normJ(g('birth'));
      if (g('birth') && !birth) return toast('تاریخ تولد/ثبت معتبر نیست');
      const coolDays = parseDays(g('coolDays'), PAY_DEFAULTS.coolDays);
      const delayExtraDays = parseDays(g('delayExtraDays'), PAY_DEFAULTS.delayExtraDays);
      const payDay = parsePayDay(g('payDayLabel'));
      c.doc = {
        ...(c.doc || {}),
        title: g('title') || 'خانم / آقای',
        birth: birth || '',
        addr: g('addr'),
        phone: N(g('phone')),
        postal: N(g('postal')),
        landAddr: g('landAddr'),
        area: g('area'),
        floor: g('floor'),
        block: g('block'),
        payDayLabel: payDay ? String(payDay) : '',
        coolDays: String(coolDays),
        chequeNo: g('chequeNo'),
        delayFineDaily: num(g('delayFineDaily')) || PAY_DEFAULTS.delayFineDaily,
        delayExtraDays: String(delayExtraDays),
        payBank: g('payBank'),
        payCard: N(g('payCard')),
        paySheba: N(g('paySheba')),
        payAcct: N(g('payAcct')),
        payName: g('payName'),
      };
      if (c.ed) delete c.ed.c;
      save();
      closeM();
      render();
      toast('فیلدهای قرارداد ذخیره شد');
    };
  }

  window.investMissing = investMissing;
  window.investDoc = investDoc;
  window.editInvestDoc = editInvestDoc;
})();
