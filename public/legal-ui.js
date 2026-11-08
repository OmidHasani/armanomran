/* ابزار مشترک فرم و چاپ قراردادهای حقوقی */
(function () {
  const LEGAL_FONT = "'B Nazanin','BNazanin',Nazanin,Tahoma,sans-serif";

  function parseDays(v, fallback) {
    const raw = String(v ?? '').trim();
    if (!raw && fallback != null) return fallback;
    const n = parseInt(N(raw), 10);
    if (n > 0) return n;
    if (/یکماه|یک\s*ماه|۳۰\s*روز|30\s*روز|سی\s*روز/.test(raw)) return 30;
    if (/پانزده/.test(raw)) return 15;
    if (/هشت/.test(raw)) return 8;
    return fallback || 0;
  }
  function daysPhrase(n) {
    const d = Number(n) || 0;
    return d ? `${F(d)} روز` : '........ روز';
  }
  function parsePayDay(v) {
    const n = parseInt(N(String(v || '')), 10);
    return n >= 1 && n <= 31 ? n : 0;
  }
  function bindDate(el) {
    if (!el) return;
    el.readOnly = true;
    el.style.cursor = 'pointer';
    el.placeholder = el.placeholder || 'انتخاب از تقویم';
    el.onclick = () => dpick(el);
  }
  function hintFor(el, make) {
    if (!el) return;
    let h = el.parentElement?.querySelector('.fld-hint');
    if (!h) {
      h = document.createElement('small');
      h.className = 'fld-hint';
      el.parentElement?.appendChild(h);
    }
    const paint = () => { h.textContent = make(el.value); };
    el.addEventListener('input', paint);
    paint();
  }
  function crmSnapHtml(c, cu, p, u) {
    return `<div class="crm-snap">
      <div class="crm-snap-h">اطلاعات متصل از سامانه</div>
      <div class="crm-snap-grid">
        <div><span>مشتری</span><b>${esc(cu.name || '—')}</b></div>
        <div><span>کد ملی</span><b>${F(cu.nid || '—')}</b></div>
        <div><span>نام پدر</span><b>${esc(cu.father || '—')}</b></div>
        <div><span>همراه</span><b>${F(cu.phone || '—')}</b></div>
        <div class="span2"><span>آدرس مشتری</span><b>${esc(cu.addr || '—')}</b></div>
        <div><span>پروژه</span><b>${esc(p.name || '—')}</b></div>
        <div><span>واحد</span><b>${esc(u.no || '—')}</b></div>
        <div><span>طبقه</span><b>${esc(u.floor || '—')}</b></div>
        <div><span>متراژ</span><b>${u.area ? F(u.area) + ' م²' : '—'}</b></div>
        <div class="span2"><span>نشانی پروژه</span><b>${esc(p.addr || '—')}</b></div>
        <div><span>شماره قرارداد</span><b>${esc(c.no || '—')}</b></div>
        <div><span>تاریخ قرارداد</span><b>${F(c.date || '—')}</b></div>
        <div><span>مبلغ کل</span><b>${c.total ? money(c.total) + ' تومان' : '—'}</b></div>
        <div><span>مدت</span><b>${c.dur ? F(c.dur) + ' ماه' : '—'}</b></div>
        <div><span>تعداد اقساط</span><b>${F((c.inst || []).length)}</b></div>
      </div>
      <p class="fd" style="margin:8px 0 0">نام، کد ملی، پروژه، واحد، مبلغ و اقساط از پرونده‌ها خوانده می‌شود. اگر چیزی این‌جا غلط است همان پرونده را اصلاح کنید تا متن قرارداد هم درست شود.</p>
    </div>`;
  }
  function leaseFoot() {
    return `<div class="sig-row sig-4 sig-bare">
      <div><b>موجر</b><span>امضاء / اثر انگشت</span></div>
      <div><b>مستاجر</b><span>امضاء / اثر انگشت</span></div>
      <div><b>شاهد ۱</b><span>امضاء / اثر انگشت</span></div>
      <div><b>شاهد ۲</b><span>امضاء / اثر انگشت</span></div>
    </div>`;
  }
  function investFoot() {
    return `<div class="sig-row sig-2 sig-bare">
      <div><b>شرکت سازنده</b><span>نام و امضاء</span></div>
      <div><b>سرمایه‌گذار</b><span>امضاء و اثر انگشت</span></div>
    </div>`;
  }
  function legalPages(chunks, footHtml) {
    const total = chunks.length;
    return chunks.map((html, i) => `<section class="legal-page" data-page="${i + 1}" data-pages="${total}">
      <div class="legal-page-inner">
        <div class="legal-page-body">${html}</div>
        <footer class="legal-page-foot">
          ${footHtml}
          <div class="legal-pn">صفحه ${F(i + 1)} از ${F(total)}</div>
        </footer>
      </div>
    </section>`).join('');
  }
  function legalHead(no, date, bism, title) {
    return `<div class="legal-head">
      <table class="legal-meta" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border:0;margin:0 0 2pt;border-collapse:collapse">
        <tr>
          <td style="border:0;text-align:right;padding:0">شماره: ${esc(no)}</td>
          <td style="border:0;text-align:left;padding:0">تاریخ: ${F(date)}</td>
        </tr>
      </table>
      <p class=bism>${bism}</p>
      <h4>${esc(title)}</h4>
    </div>`;
  }

  function sigRowToTable(footHtml) {
    const wrap = document.createElement('div');
    wrap.innerHTML = footHtml;
    const row = wrap.querySelector('.sig-row');
    const pn = wrap.querySelector('.legal-pn')?.textContent || '';
    if (!row) return footHtml;
    const cells = [...row.children].map((cell) => {
      const title = cell.querySelector('b')?.textContent || '';
      const sub = cell.querySelector('span')?.textContent || '';
      const w = Math.floor(100 / row.children.length);
      return `<td width="${w}%" valign="bottom" style="border:0;width:${w}%;padding:2pt 4pt;text-align:center;vertical-align:bottom;font-family:${LEGAL_FONT}">
  <div style="font-weight:bold;font-size:11pt;margin-bottom:18pt">${esc(title)}</div>
  <div style="font-size:10pt;color:#444;border-top:1px solid #666;padding-top:4pt">${esc(sub)}</div>
</td>`;
    }).join('');
    const pnHtml = pn ? `<p style="text-align:center;font-size:10pt;margin:6pt 0 0;font-family:${LEGAL_FONT}">${esc(pn)}</p>` : '';
    return `<table width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;margin-top:8pt;border:0"><tr>${cells}</tr></table>${pnHtml}`;
  }

  /** اندازه فونت را برای برگه‌های A4 طوری تنظیم می‌کند که جا شود و متن تا پایین کشیده شود */
  function fitLegalPages(root) {
    if (!root) return { fontPt: 12, lineHeight: 1.7 };
    const pages = [...root.querySelectorAll('.legal-page')];
    if (!pages.length) return { fontPt: 12, lineHeight: 1.7 };

    const apply = (fs, lh) => {
      root.style.setProperty('--legal-fs', `${fs}pt`);
      root.style.setProperty('--legal-lh', String(lh));
      root.style.fontSize = `${fs}pt`;
      root.style.lineHeight = String(lh);
    };
    const overflows = () => pages.some((page) => {
      const inner = page.querySelector('.legal-page-inner') || page;
      return inner.scrollHeight > inner.clientHeight + 2;
    });

    // اول بزرگ‌ترین فونت قابل‌جا شدن
    let fontPt = 11;
    for (let pt = 14; pt >= 10; pt -= 0.25) {
      apply(pt, 1.55);
      if (!overflows()) { fontPt = pt; break; }
      fontPt = pt;
    }
    apply(fontPt, 1.55);

    // بعد فاصله خطوط را زیاد کن تا متن تا پایین برسد
    let lineHeight = 1.55;
    for (let lh = 1.55; lh <= 2.05; lh += 0.05) {
      apply(fontPt, lh);
      if (overflows()) {
        lineHeight = Math.max(1.45, lh - 0.05);
        apply(fontPt, lineHeight);
        break;
      }
      lineHeight = lh;
    }
    root.dataset.legalFs = String(fontPt);
    root.dataset.legalLh = String(lineHeight);
    return { fontPt, lineHeight };
  }

  function bufToB64(buf) {
    const bytes = new Uint8Array(buf);
    let s = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(s);
  }

  function fontFaceCss(fontB64) {
    const localSrc = "local('B Nazanin'),local('BNazanin'),local('Nazanin')";
    const fileSrc = "url('/fonts/BNazanin.woff2') format('woff2'),url('/fonts/BNazanin.ttf') format('truetype')";
    const dataSrc = fontB64
      ? `url(data:font/ttf;base64,${fontB64}) format('truetype')`
      : fileSrc;
    return `@font-face{font-family:'B Nazanin';src:${localSrc},${dataSrc};font-weight:400;font-style:normal}
@font-face{font-family:'B Nazanin';src:local('B Nazanin Bold'),local('BNazanin Bold'),${dataSrc};font-weight:700;font-style:normal}`;
  }

  function sharedDocCss(fontB64, fontPt, lineHeight) {
    const size = `${fontPt || 12}pt`;
    const lh = lineHeight || 1.7;
    const title = `${Math.min(16, (fontPt || 12) + 2)}pt`;
    return `
${fontFaceCss(fontB64)}
@page{size:A4 portrait;margin:0}
@page WordSection1{size:210mm 297mm;margin:12mm 14mm 12mm 14mm;mso-page-orientation:portrait}
div.WordSection1{page:WordSection1}
*{box-sizing:border-box}
html,body{
  margin:0;padding:0;background:#fff;color:#000;
  font-family:${LEGAL_FONT} !important;
  font-size:${size};
  line-height:${lh};
  direction:rtl;text-align:justify;
}
p{margin:0 0 2pt;padding:0;font-family:${LEGAL_FONT} !important;font-size:${size};line-height:${lh};text-align:justify}
h4{text-align:center;font-size:${title};margin:2pt 0 8pt;font-weight:700;font-family:${LEGAL_FONT} !important}
.bism{text-align:center;font-weight:700;margin:2pt 0;font-size:${size}}
.legal-head{margin-bottom:6pt}
.legal-meta{width:100%;border:0;border-collapse:collapse;margin:0 0 2pt;font-size:${size}}
.art-title{font-weight:700;margin:8pt 0 2pt;text-align:justify;font-size:${size}}
.art{margin:0 0 2pt;text-align:justify;font-size:${size}}
.note-box{margin-top:6pt}
.bank-line{font-weight:700;margin-top:4pt}
.legal-page{
  width:210mm;height:297mm;max-height:297mm;
  page-break-after:always;break-after:page;
  overflow:hidden;background:#fff;
}
.legal-page:last-child{page-break-after:auto;break-after:auto}
.legal-page-inner{
  width:100%;height:297mm;min-height:297mm;max-height:297mm;
  padding:12mm 14mm;display:flex;flex-direction:column;box-sizing:border-box;
}
.legal-page-body{flex:1 1 auto}
.legal-page-foot{margin-top:auto;padding-top:8pt;flex:0 0 auto}
.sig-row{display:block;margin-top:4pt}
.sig-bare>div,.sig-row.sig-bare>div{border:0!important;min-height:0!important;padding:0 4pt!important}
.legal-pn{text-align:center;font-size:10pt;margin-top:6pt}
table{border-collapse:collapse}
td,th{font-family:${LEGAL_FONT} !important}
`;
  }

  function readFit(paperEl) {
    const fs = parseFloat(paperEl?.dataset?.legalFs || paperEl?.style?.getPropertyValue('--legal-fs') || '12');
    const lh = parseFloat(paperEl?.dataset?.legalLh || paperEl?.style?.getPropertyValue('--legal-lh') || '1.7');
    return {
      fontPt: Number.isFinite(fs) && fs > 0 ? fs : 12,
      lineHeight: Number.isFinite(lh) && lh > 0 ? lh : 1.7,
    };
  }

  function extractPages(paperEl) {
    return [...(paperEl?.querySelectorAll('.legal-page') || [])].map((page) => ({
      body: page.querySelector('.legal-page-body')?.innerHTML || page.innerHTML,
      foot: page.querySelector('.legal-page-foot')?.innerHTML || '',
    }));
  }

  async function loadFontB64() {
    try {
      const r = await fetch('/fonts/BNazanin.ttf', { cache: 'force-cache' });
      if (!r.ok) return '';
      return bufToB64(await r.arrayBuffer());
    } catch (e) {
      return '';
    }
  }

  async function buildWordHtml(paperEl, fileTitle) {
    if (typeof fitLegalPages === 'function') fitLegalPages(paperEl);
    const fit = readFit(paperEl);
    const pages = extractPages(paperEl);
    const title = fileTitle || 'قرارداد';
    const fontB64 = await loadFontB64();
    if (!pages.length) {
      return `<html dir="rtl"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>${sharedDocCss(fontB64, fit.fontPt, fit.lineHeight)}</style></head><body>${paperEl?.innerHTML || ''}</body></html>`;
    }
    const parts = pages.map((page, i) => {
      const foot = sigRowToTable(page.foot);
      const br = i > 0
        ? `<br clear="all" style="page-break-before:always;mso-break-type:section-break">`
        : '';
      // جدول ثابت ارتفاع برای چسباندن امضا به پایین برگه در Word
      return `${br}<div class="WordSection1">
<table width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;border:0">
  <tr><td valign="top" style="border:0;padding:0;vertical-align:top">${page.body}</td></tr>
  <tr><td valign="bottom" style="border:0;padding:0;padding-top:12pt;vertical-align:bottom;height:70pt">${foot}</td></tr>
</table>
</div>`;
    }).join('\n');

    return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:w="urn:schemas-microsoft-com:office:word"
 xmlns="http://www.w3.org/TR/REC-html40" dir="rtl" lang="fa">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>${esc(title)}</title>
<!--[if gte mso 9]><xml>
 <o:OfficeDocumentSettings><o:AllowPNG/></o:OfficeDocumentSettings>
</xml><![endif]-->
<!--[if gte mso 9]><xml>
 <w:WordDocument>
  <w:View>Print</w:View>
  <w:Zoom>100</w:Zoom>
  <w:DoNotOptimizeForBrowser/>
 </w:WordDocument>
</xml><![endif]-->
<style>
${sharedDocCss(fontB64, fit.fontPt, fit.lineHeight)}
</style>
</head>
<body dir="rtl" lang="fa" style="font-family:'B Nazanin','BNazanin',Tahoma,sans-serif;font-size:${fit.fontPt}pt;line-height:${fit.lineHeight}">${parts}</body>
</html>`;
  }

  function buildPrintHtml(paperEl, fileTitle) {
    if (typeof fitLegalPages === 'function') fitLegalPages(paperEl);
    const fit = readFit(paperEl);
    const pages = extractPages(paperEl);
    const title = fileTitle || 'قرارداد';
    const body = pages.length
      ? pages.map((page) => `<section class="legal-page">
  <div class="legal-page-inner">
    <div class="legal-page-body">${page.body}</div>
    <footer class="legal-page-foot">${sigRowToTable(page.foot)}</footer>
  </div>
</section>`).join('')
      : (paperEl?.innerHTML || '');

    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<style>
${sharedDocCss('', fit.fontPt, fit.lineHeight)}
@media print{
  .noprint{display:none!important}
  html,body{margin:0!important;padding:0!important;background:#fff!important}
  @page{size:A4 portrait;margin:0}
  .legal-page{
    width:210mm!important;height:297mm!important;
    page-break-after:always;break-after:page;
    margin:0;padding:0;border:0;box-shadow:none;overflow:hidden;
  }
  .legal-page:last-child{page-break-after:auto;break-after:auto}
  .legal-page-inner{height:297mm;min-height:297mm;padding:12mm 14mm;display:flex;flex-direction:column}
  .legal-page-foot{margin-top:auto;page-break-inside:avoid}
}
@media screen{
  body{background:#d9d9d9;padding:20px;font-family:Tahoma,sans-serif}
  .legal-page{
    background:#fff;width:210mm;height:297mm;margin:0 auto 18px;
    box-shadow:0 2px 10px rgba(0,0,0,.18);overflow:hidden;
    font-family:${LEGAL_FONT};
  }
  .print-hint{
    max-width:210mm;margin:0 auto 14px;padding:10px 12px;
    background:#fff8e6;border:1px solid #e6d39a;border-radius:6px;
    font-size:13px;line-height:1.7;
  }
}
</style>
</head>
<body>
<div class="print-hint noprint">
  برگه‌ها A4 هستند (${pages.length || '—'} صفحه). در چاپ، تیک
  <b>Headers and footers</b> را بردارید و Scale را روی <b>100%</b> بگذارید.
  <div style="margin-top:8px">
    <button type="button" onclick="window.print()" style="padding:6px 14px;cursor:pointer">چاپ</button>
    <button type="button" onclick="window.close()" style="padding:6px 14px;cursor:pointer;margin-right:6px">بستن</button>
  </div>
</div>
${body}
<script>
(function(){
  function go(){try{window.print()}catch(e){}}
  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){setTimeout(go,200)})}
  else setTimeout(go,400);
})();
</script>
</body>
</html>`;
  }

  window.parseDays = parseDays;
  window.daysPhrase = daysPhrase;
  window.parsePayDay = parsePayDay;
  window.bindDate = bindDate;
  window.hintFor = hintFor;
  window.crmSnapHtml = crmSnapHtml;
  window.leaseFoot = leaseFoot;
  window.investFoot = investFoot;
  window.legalPages = legalPages;
  window.legalHead = legalHead;
  window.fitLegalPages = fitLegalPages;
  window.buildWordHtml = buildWordHtml;
  window.buildPrintHtml = buildPrintHtml;
  window.loadFontB64 = loadFontB64;
})();
