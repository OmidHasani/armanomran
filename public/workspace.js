// Presentation layer shared by the workspace navigation and dashboard.
const glyphs = {
  dash:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  proj:'M3 21h18 M5 21V8l8-5v18 M13 10l6 3v8 M8 10v2m0 3v2m8-2v2',
  cust:'M16 21v-2a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v2 M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M17 5q5 3 0 7m1 3q4 1 3 6',
  lead:'M3 4h18l-7 9v5l-4 2v-7z',
  cont:'M5 3h10l4 4v14H5z M14 3v5h5 M8 12h8m-8 4h6',
  res:'M4 5h16v16H4z M8 3v5m8-5v5M4 10h16 M8 15l3 3 5-5',
  acct:'M3 7h18v13H3z M3 7l14-4v4 M16 12h5v4h-5z',
  inbox:'M3 14l3-9h12l3 9v6H3z M3 14h5l2 3h4l2-3h5',
  legal:'M12 3v17m-6 1h12M3 7l18-2 M6 7l-3 7h6zm12-2-3 8h6z',
  rep:'M4 3v17h17 M8 16v-4m5 4V7m5 9v-6',
  list:'M9 6h12M9 12h12M9 18h12 M3 6h1m-1 6h1m-1 6h1',
  clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 7v6l4 2'
};
function uiIcon(key) {
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="${glyphs[key]}"/></svg>`;
}
function setMenu(open) {
  document.querySelector('#shell aside').classList.toggle('expanded',open);
  document.querySelector('#menuToggle').setAttribute('aria-expanded',String(open));
}
document.querySelector('#menuToggle').onclick = e => setMenu(e.currentTarget.getAttribute('aria-expanded') !== 'true');
function workspaceNav(nav, active) {
  const groups=[['فضای کار',['dash','inbox']],['فروش و املاک',['lead','cust','proj','res','cont']],['مالی و سازمان',['acct','legal','rep']]];
  return groups.map(([title,keys])=>{
    const links=keys.map(key=>nav.find(([k])=>k===key)).filter(Boolean);
    if(!links.length)return '';
    return `<div class="nav-group"><span>${title}</span>${links.map(([key,label])=>`<button type="button" class="nav ${active===key?'on':''}" ${active===key?'aria-current="page"':''} onclick="go('${key}')">${uiIcon(key)}${label}</button>`).join('')}</div>`;
  }).join('');
}
function metric(label,value,unit,icon,tone) {
  return `<article class="metric ${tone}"><div><i>${uiIcon(icon)}</i><span>${label}</span></div><strong>${money(value)}</strong> <small>${unit}</small></article>`;
}
function inventoryPanel(units) {
  const states=[['free','آزاد'],['res','رزرو'],['sold','فروخته‌شده']];
  const counts=states.map(([key])=>units.filter(u=>u.st===key).length);
  const degrees=n=>units.length?n*360/units.length:0;
  return `<section class="ws-panel"><header><h3>وضعیت واحدها</h3>${can('proj')?`<button onclick="go('proj')">مشاهده پروژه‌ها ‹</button>`:''}</header><div class="inventory"><div class="ring" style="--free:${degrees(counts[0])}deg;--held:${degrees(counts[0]+counts[1])}deg;${units.length?'':'background:var(--line)'}"><div><b>${F(units.length)}</b><small>کل واحدها</small></div></div><div class="legend">${states.map(([key,label],i)=>`<div><i class="dot-${key}"></i><span>${label}</span><b>${F(counts[i])}</b></div>`).join('')}</div></div></section>`;
}
let queuePeriod='all';
function updateQueue(period) {
  queuePeriod=period;
  document.querySelector('#workQueue').innerHTML=queueContent(dueList());
}
function queueContent(items) {
  const periods=[['all','همه',()=>true],['late','عقب‌افتاده',x=>x.d<0],['today','امروز',x=>x.d===0],['soon','پیش رو',x=>x.d>0]];
  const tabs=periods.map(([key,label,match])=>`<button aria-pressed="${queuePeriod===key}" onclick="updateQueue('${key}')">${label} <b>${F(items.filter(match).length)}</b></button>`).join('');
  const groups=periods.slice(1).filter(([key])=>queuePeriod==='all'||queuePeriod===key);
  return `<header><h3>صف پیگیری</h3></header><div class="queue-tabs">${tabs}</div>${items.length?'<input class="queue-search" type="search" aria-label="جستجو در پیگیری‌ها" placeholder="جستجو در پیگیری‌ها…" oninput="filt(this.value)">':''}`+
    (groups.map(([,label,match])=>compactQueue(label,items.filter(match))).join('')||'<div class="queue-empty">'+uiIcon('list')+'<strong>پیگیری در این بازه ندارید</strong><span>موعد اقساط، رزروها و تماس بعدی سرنخ‌ها اینجا نمایش داده می‌شود.</span></div>');
}
const openCount=stats=>['new','working','waiting'].reduce((n,k)=>n+(stats[k]?.count||0),0);
function refreshCaseCounts() {
  const queue=$('#workQueue');
  if(queue){
    const groups=queue.querySelectorAll('.queue-group,.queue-empty');
    const fresh=document.createElement('div');fresh.innerHTML=queueContent(dueList());
    groups.forEach(el=>el.remove());queue.append(...fresh.querySelectorAll('.queue-group,.queue-empty'));
    const query=queue.querySelector('input')?.value;if(query)filt(query);
  }
  const inbox=document.querySelector('#openInbox'),legal=document.querySelector('#openLegal');
  if(inbox)inbox.textContent=F(inboxScoped(WORK,'tome').filter(c=>c.status!=='done').length);
  const mine=document.getElementById('assignedPreview');if(mine)mine.innerHTML=assignedPreview();
  if(legal)legal.textContent=F(openCount(LEGAL_STATS));
}
function dash() {
  const units=S.projects.flatMap(p=>p.units||[]);
  const due=dueList();
  const paid=sum(S.contracts,paidSum);
  const total=sum(S.contracts,c=>c.total);
  const date=new Intl.DateTimeFormat('fa-IR',{dateStyle:'full'}).format(new Date());

  return `<div class="desk-top"><span>فضای کار / <b>میز کار</b></span><time>${uiIcon('res')}${date}</time></div>
    <section class="desk-cover"><div><h2>میز کار فروش و پیگیری</h2><p>${esc(actor())}، امروز ${F(due.filter(x=>x.d===0).length)} مورد سررسید و ${F(due.filter(x=>x.d<0).length)} پیگیری عقب‌افتاده دارید.</p><div class="cover-actions">${can('write')&&can('lead')?'<button onclick="addL()">＋ ثبت سرنخ</button>':''}${canRefer()?'<button onclick="openReferDialog()">ارجاع جدید</button>':''}</div></div></section>
    <div class="metrics">${metric('واحد قابل فروش',units.filter(u=>u.st==='free').length,'واحد','proj','jade')}${metric('قراردادهای ثبت‌شده',S.contracts.length,'قرارداد','cont','blue')}${metric('مبلغ وصول‌شده',paid,'تومان','acct','honey')}${metric('مانده مطالبات',total-paid,'تومان','clock','rose')}</div>
    <div class="desk-grid"><section id="workQueue" class="ws-panel">${queueContent(due)}</section><div class="desk-rail">${canInbox()?`<section class="ws-panel"><header><h3>ارجاع‌های نیازمند مشاهده</h3></header><div id="assignedPreview">${assignedPreview()}</div></section>`:''}${inventoryPanel(units)}
    ${canInbox()||can('legal')?`<section class="ws-panel"><header><h3>ارجاعات و حقوقی</h3></header>${canInbox()?`<button class="rail-link" onclick="go('inbox')">${uiIcon('inbox')}ارجاع باز من <b id="openInbox">${F(inboxScoped(WORK,'tome').filter(c=>c.status!=='done').length)}</b> ‹</button>`:''}${can('legal')?`<button class="rail-link" onclick="go('legal')">${uiIcon('legal')}پرونده باز حقوقی <b id="openLegal">${F(openCount(LEGAL_STATS))}</b> ‹</button>`:''}</section>`:''}
    </div></div>`;
}

function projectCard(project,index) {
  const units=project.units||[];
  const free=units.filter(u=>u.st==='free').length;
  const reserved=units.filter(u=>u.st==='res').length;
  const width=count=>units.length?count*100/units.length:0;
  return `<button type="button" class="project-card" data-project="${index}" onclick="go('pd',S.projects[${index}].id)">
    <div class="project-heading"><i class="project-symbol">${uiIcon('proj')}</i><strong>${esc(project.name)}</strong></div>
    <p>${esc(project.addr||'نشانی ثبت نشده')}</p>
    <div class="project-data"><b>${F(free)} واحد آزاد</b><span>از ${F(units.length)} واحد</span></div>
    <div class="project-bar" aria-hidden="true"><i class="dot-free" style="width:${width(free)}%"></i><i class="dot-res" style="width:${width(reserved)}%"></i><i class="dot-sold" style="width:${width(units.length-free-reserved)}%"></i></div>
    <div class="project-foot">مسئول بازدید — ${esc(project.vcName||'تعیین نشده')} ${esc(F(project.vcPhone||''))}<br>ارزش کل واحدها — ${T(sum(units,u=>u.total))}</div></button>`;
}
function filterProjects() {
  const query=nm(N(document.querySelector('#projectQuery').value));
  const onlyFree=document.querySelector('#onlyFree').checked;
  let count=0;
  document.querySelectorAll('[data-project]').forEach(card=>{
    const p=S.projects[Number(card.dataset.project)];
    const text=[p.name,p.addr,p.vcName,p.vcPhone,...p.units.map(u=>u.no)].join(' ');
    card.hidden=!nm(N(text)).includes(query)||(onlyFree&&!p.units.some(u=>u.st==='free'));
    if(!card.hidden)count++;
  });
  document.querySelector('#projectNoMatch').hidden=count>0;
}
function projV() {
  return `<div class="top"><h2>پروژه‌ها و واحدها</h2><div class="cover-tools"><button onclick="bankBook()">حساب‌های بانکی</button>${can('write')?'<button class="pri" onclick="addP()">＋ پروژه جدید</button>':''}</div></div>
  ${S.projects.length?`<div class="project-tools"><input id="projectQuery" type="search" aria-label="جستجوی پروژه" placeholder="نام پروژه، نشانی، مسئول بازدید یا شماره واحد" oninput="filterProjects()"><label><input type="checkbox" id="onlyFree" onchange="filterProjects()"> دارای واحد آزاد</label></div><div class="cards">${S.projects.map(projectCard).join('')}</div><div id="projectNoMatch" class="empty" hidden>پروژه‌ای با این مشخصات پیدا نشد.</div>`:empty('هنوز پروژه‌ای ثبت نشده است.')}`;
}

function customerRow(person,index,contractCounts) {
  const current=`S.customers[${index}].id`;
  const actions=can('write')?`<details class="record-actions"><summary>عملیات</summary><div>
    <button onclick="editCu(${current})">ویرایش مشخصات</button>
    ${can('cont')?`<button onclick="addC({cust:${current}})">ثبت قرارداد</button>`:''}
    ${can('res')?`<button onclick="addR({cust:${current}})">ثبت رزرو</button>`:''}
    <button class="x" onclick="delCu(${current})">حذف مشتری</button></div></details>`:'';
  return `<article data-open-card class="person-row" data-s="${esc(N([person.name,person.father,person.nid,person.phone].join(' ')))}">
    <div class="person-title"><span class="avatar" aria-hidden="true">${esc((person.name||'').trim()[0]||'')}</span>
      <div><strong>${esc(person.name)}</strong><small>کد ملی ${esc(F(person.nid||'—'))}</small></div></div>
    <div class="person-contact"><a class="ph" href="tel:${esc(N(person.phone))}">${esc(F(person.phone))}</a><small>نام پدر — ${esc(person.father||'—')}</small></div>
    <span>${F(contractCounts.get(person.id)||0)} قرارداد</span>
    <div class="person-actions"><button data-card-primary onclick="go('cv',${current})">پرونده مشتری ‹</button>${actions}</div>
    </article>`;
}
function custV() {
  const counts=new Map();
  S.contracts.forEach(c=>ownerList(c).forEach(o=>counts.set(o.customer,(counts.get(o.customer)||0)+1)));
  return `<div class="top"><h2>مشتریان</h2>${can('write')?'<button class="pri" onclick="addCu()">＋ مشتری جدید</button>':''}</div>
    ${S.customers.length?`<input type="search" class="sb" aria-label="جستجوی مشتری" placeholder="جستجو با نام، کد ملی یا شماره همراه" oninput="filterPeople(this.value)"><div class="people-list">${S.customers.map((c,i)=>customerRow(c,i,counts)).join('')}</div><div id="noPeople" class="empty" hidden>مشتری‌ای با این مشخصات پیدا نشد.</div>`:empty('هنوز مشتری‌ای ثبت نشده است.')}`;
}
function filterPeople(query) {
  filt(query);
  document.querySelector('#noPeople').hidden=Boolean(document.querySelector('.person-row:not([hidden])'));
}

function reservationCard(r,index) {
  const paid=rPaid(r);
  const remaining=Math.max(0,r.need-paid);
  const days=diff(r.deadline);
  const due=r.st==='active'&&remaining>0&&days<=7;
  const person=cust(r.cust);
  const unit=unitTxt(r.proj,r.unit);
  const search=N([r.no,person.name,person.phone,unit].join(' '));
  const cancelStep=r.st==='cancelling'&&r.cancel?CS[r.cancel.h.length]:'';
  return `<article data-open-card class="booking" data-search="${esc(search)}" data-status="${esc(r.st)}">
    <header><b>${esc(r.no)}</b><span class="badge ${r.st==='active'?'ok':r.st==='cancelling'?'warn':''}">${esc(RS[r.st]||'—')}</span></header>
    <h3>${esc(person.name)}</h3><p>${esc(unit)}</p>
    <dl><div><dt>وجه پرداخت‌شده</dt><dd>${T(paid)}</dd></div><div><dt>مانده رزرو</dt><dd>${T(remaining)}</dd></div></dl>
    <div class="booking-due">مهلت تکمیل وجه <b>${esc(F(r.deadline))}</b>${due?`<span class="badge ${days<0?'bad':'warn'}">${days<0?F(-days)+' روز تأخیر':days===0?'امروز':F(days)+' روز مانده'}</span>`:''}</div>
    ${cancelStep?`<p>مرحله لغو — ${esc(cancelStep)}</p>`:''}
    <footer><button data-card-primary onclick="go('rd',S.reservations[${index}].id)">پرونده رزرو ‹</button>${canDeleteRec()?`<button class="sm x" onclick="delR(S.reservations[${index}].id)">حذف</button>`:''}</footer></article>`;
}
function filterBookings() {
  const q=nm(N(document.querySelector('#bookingQuery').value));
  const status=document.querySelector('#bookingStatus').value;
  let visible=0;
  document.querySelectorAll('.booking').forEach(card=>{
    card.hidden=!nm(card.dataset.search).includes(q)||(status&&card.dataset.status!==status);
    if(!card.hidden)visible++;
  });
  document.querySelector('#noBookings').hidden=visible>0;
}
function res() {
  const write=can('write');
  return `<div class="top"><h2>رزروها و رزرونامه‌ها</h2><div class="cover-tools"><button onclick="chkF()">استعلام فیش</button>${write?'<button onclick="cfgR()">تنظیمات رزرو</button><button class="pri" onclick="addR()">＋ رزرو جدید</button>':''}</div></div>
    ${S.reservations.length?`<div class="project-tools"><input id="bookingQuery" type="search" aria-label="جستجوی رزرو" placeholder="شماره رزرو، نام مشتری، همراه یا واحد" oninput="filterBookings()"><select aria-label="وضعیت رزرو" id="bookingStatus" onchange="filterBookings()"><option value="">همه وضعیت‌ها</option>${Object.entries(RS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></div>
    <div class="cards">${S.reservations.map(reservationCard).join('')}</div><div id="noBookings" class="empty" hidden>رزروی با این مشخصات پیدا نشد.</div>`:empty('هنوز رزروی ثبت نشده است.')}`;
}
