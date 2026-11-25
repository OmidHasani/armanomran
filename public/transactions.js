function ownerList(c) {
  return c.owners?.length ? c.owners : [{customer:c.cust,share:6000}];
}
function ownerText(c) {
  return ownerList(c).map(o=>cust(o.customer).name+' — '+F(o.share/1000)+' دانگ').join('، ');
}
function holderMap(){
  const names=new Map(S.customers.map(c=>[c.id,c.name])),holders=new Map();
  for(const r of S.reservations)if(['active','cancelling'].includes(r.st))holders.set(r.proj+'|'+r.unit,names.get(r.cust)||'—');
  for(const c of S.contracts)holders.set(c.proj+'|'+c.unit,ownerList(c).map(o=>(names.get(o.customer)||'—')+' — '+F(o.share/1000)+' دانگ').join('، '));
  return holders;
}
function shareRows(){
  return [...document.querySelectorAll('#buyerShares .buyer-row')].map(row=>({
    customer:row.querySelector('select')?.value||'',
    share:Math.round(num(row.querySelector('input').value)*1000)
  }));
}
function readOwnership(primary){
  const rows=shareRows();
  if([...document.querySelectorAll('#buyerShares input')].some(e=>!/^\d+(?:\.\d{1,3})?$/.test(N(e.value)))||rows.some(o=>!o.customer||o.share<=0)||rows[0]?.customer!==primary||
     new Set(rows.map(o=>o.customer)).size!==rows.length||sum(rows,o=>o.share)!==6000){
    toast('برای هر خریدار سهم مثبت و مجزا وارد کنید. مجموع سهم‌ها باید ۶ دانگ باشد.');return null;
  }
  return rows;
}
function customerOptions(){
  return [['','انتخاب مشتری'],...S.customers.map(c=>[c.id,c.name+' — '+F(c.nid)])];
}
function optionList(options){
  return options.map(([key,label])=>'<option value="'+esc(key)+'">'+esc(F(label))+'</option>').join('');
}
function buildOwners(host,rows,addPartner){
  const holder=document.createElement('div');holder.id='buyerShares';
  holder.innerHTML='<header><b>سهم خریداران</b><output></output></header><div class="buyer-list"></div><button type="button" class="sm">＋ افزودن شریک</button>';host.append(holder);
  const list=holder.querySelector('.buyer-list');
  const refresh=()=>{
    const left=6000-sum(shareRows(),o=>o.share);
    holder.querySelector('output').textContent=left?F(left/1000)+' دانگ باقی‌مانده':'۶ دانگ کامل';
  };
  function row(o,first){
    const div=document.createElement('div');div.className='buyer-row';
    div.innerHTML=(first?'<span>خریدار اصلی</span>':'<select aria-label="شریک قرارداد">'+optionList(customerOptions())+'</select>')+'<label>دانگ<input inputmode="decimal" aria-label="سهم به دانگ"></label>'+(first?'':'<button type="button" aria-label="حذف شریک">حذف</button>');
    list.append(div);const input=div.querySelector('input');input.value=F(o.share/1000);input.oninput=()=>{
      fmtFaDigits(input);
      if(num(input.value)<0)input.value='۰';
      const other=[...list.querySelectorAll('input')].filter(e=>e!==input).reduce((n,e)=>n+Math.round(num(e.value)*1000),0);
      const limit=Math.max(0,Math.min(6000,6000-other));
      if(Math.round(num(input.value)*1000)>limit)input.value=F(limit/1000);
      refresh();
    };
    if(first){
      const select=$('#modal [name=cust]'),label=select.parentElement;
      div.querySelector('span').replaceWith(label);
      label.firstChild.textContent='خریدار اصلی';
    }
    if(!first){const select=div.querySelector('select'),label=document.createElement('label');label.textContent='شریک قرارداد';select.replaceWith(label);label.append(select);select.value=o.customer;div.querySelector('button').onclick=()=>{div.remove();refresh()}}
    if(!first&&can('cust')){
      const more=document.createElement('button');more.type='button';more.className='sm';more.textContent='مشتری جدید';more.onclick=()=>addPartner([...list.children].indexOf(div));div.append(more);
    }
    refresh();
  }
  rows.forEach((o,i)=>row(o,!i));holder.querySelector(':scope > button').onclick=()=>{
    const shares=shareRows(),remainder=6000-sum(shares,o=>o.share);
    let share=remainder;
    if(!share){
      const index=shares.reduce((best,o,i)=>o.share>shares[best].share?i:best,0);
      share=Math.floor(shares[index].share/2);
      if(!share)return toast('سهم قابل تقسیم باقی نمانده است');
      list.children[index].querySelector('input').value=F((shares[index].share-share)/1000);
    }
    row({customer:'',share},false);
  };
}
function section(title){
  return {t:'html',html:'<h4 class="deal-heading">'+title+'</h4>'};
}
function dealTools(pre,record,kind){
  const modal=$('#modal'),field=k=>modal.querySelector('[name='+k+']');
  const project=field('project'),unit=field('unit'),customer=field('cust'),isContract=kind==='contract';
  modal.querySelector('.box').classList.add('deal-box');
  let shareRowsSnapshot=[];
  const current=record?record.proj+'|'+record.unit:pre.resId?pre.unit:'';
  const locked=!!pre.resId||!!record?.reservationId;
  function fill(keep){
    unit.innerHTML=optionList([['','انتخاب واحد'],...unitOpts(current).filter(([key])=>key.split('|')[0]===project.value)]);
    unit.value=keep||'';unit.disabled=locked||!project.value;
  }
  project.value=pre.project??pre.unit?.split('|')[0]??'';fill(pre.unit);
  project.disabled=locked;customer.disabled=locked||!!record?.transfers?.length||!!record?.pays?.length||!!record?.inst?.some(i=>collected(i));
  project.onchange=()=>{fill('');if(field('accountId'))field('accountId').value=proj(project.value)?.accountId||'';unit.onchange?.()};
  if(isContract){
    modal.dataset.paidInstallments=record?sum(payParts(record).instRows.filter(i=>collected(i)),i=>i.amt):0;
    let owners=record?ownerList(record):[{customer:customer.value,share:6000}];
    if(pre.shares){try{owners=JSON.parse(pre.shares)}catch{}}
    buildOwners(modal.querySelector('#ownerArea'),owners,index=>child(addCu,c=>{
      const next=shareRowsSnapshot;next[index]={...next[index],customer:c.id};return {shares:JSON.stringify(next)};
    }));
    const deposit=field('depositLabel'),type=field('type');
    type.onchange=()=>{deposit.parentElement.hidden=type.value!=='lease'};type.onchange();
  }else unit.onchange=()=>setM(modal,'total',unitSaleTotal(unitOf(...unit.value.split('|'))));
  function snapshot(){
    const values=captureContract(pre);
    for(const k of ['need','fine','amt','plannedCash','plannedInstallments'])if(field(k))values[k]=num(field(k).value);
    if(isContract)values.shares=JSON.stringify(shareRows());
    return values;
  }
  const reopen=v=>isContract?addC(v):addR(v);
  function button(parent,label,fn){const b=document.createElement('button');b.type='button';b.className='sm link-add';b.textContent=label;b.onclick=fn;parent.append(b)}
  function child(open,updated){
    const v=snapshot();shareRowsSnapshot=isContract?shareRows():[];window.returnDeal=()=>reopen(v);
    open(item=>{window.returnDeal=null;reopen({...v,...updated(item)})});
  }
  if(!locked&&can('proj')){
    button(project.parentElement,'＋ پروژه جدید',()=>child(addP,p=>({project:p.id,unit:'',base:0,total:0,accountId:p.accountId})));
    button(unit.parentElement,'＋ واحد جدید',()=>{const p=proj(project.value);if(!p)return toast('ابتدا پروژه را انتخاب کنید');child(done=>addU(p,done),u=>({unit:p.id+'|'+u.id,total:unitSaleTotal(u),base:unitSaleTotal(u)}))});
  }
  if(can('cust'))button(customer.parentElement,'＋ مشتری جدید',()=>child(addCu,c=>customer.disabled?{}:{cust:c.id}));
  groupDealFields(modal,isContract);
  if(isContract&&!record&&!pre.resId)button(modal.querySelector('.act'),'ذخیره پیش‌نویس',()=>saveDraft(snapshot()));
}
function editC(id){
  const c=S.contracts.find(x=>x.id===id);if(!c)return;
  const parts=payParts(c),regs=parts.instRows.filter(i=>!collected(i)),first=regs[0];
  const computed=calcInstPrice(c.baseTotal||c.total,c.extraOn,c.profitOn);
  const consistent=computed.total===c.total;
  const gap=regs.length>1?(pj(regs[1].date)[0]-pj(first.date)[0])*12+pj(regs[1].date)[1]-pj(first.date)[1]:1;
  addC({...c,editId:id,unit:c.proj+'|'+c.unit,extraOn:consistent&&c.extraOn,profitOn:consistent&&c.profitOn,base:consistent?(c.baseTotal||c.total):c.total,down:parts.down,cash:parts.cash,
    cashDate:c.inst.find(i=>i.kind==='lump'||isLumpInst(i))?.date||addM(c.date,12),count:regs.length,first:first?.date||addM(c.date,1),step:Math.max(1,gap)});
}
async function updateAgreement(c,v,owners,price){
  const copy=JSON.parse(JSON.stringify(c)),parts=payParts(c),regs=parts.instRows.filter(i=>!collected(i));
  const dep=c.inst.find(i=>i.kind==='deposit'||/پیش.پرداخت|قرض.الحسنه/.test(i.title));
  const lump=c.inst.find(i=>i.kind==='lump'||isLumpInst(i));
  const paidReg=sum(parts.instRows.filter(i=>collected(i)),i=>i.amt);
  const count=num(v.count),pool=(num(v.installBudget)||price.total-num(v.down)-num(v.cash))-paidReg;
  if(pool<0||count<0||!Number.isInteger(count)||count>pool||count+parts.instRows.filter(i=>collected(i)).length+Number(!!num(v.down))+Number(!!num(v.cash))>500||
    (dep&&collected(dep)&&dep.amt!==num(v.down))||(lump&&collected(lump)&&lump.amt!==num(v.cash))){
    toast('مبلغ، تعداد اقساط و ردیف‌های دارای واریز را بررسی کنید');return false;
  }
  if(c.transfers?.length&&v.date>c.transfers[0].date){toast('تاریخ قرارداد بعد از انتقال است');return false}
  const step=regs.length>1?(pj(regs[1].date)[0]-pj(regs[0].date)[0])*12+pj(regs[1].date)[1]-pj(regs[0].date)[1]:1;
  if(num(v.installBudget)!==num(c.installBudget)||price.total!==c.total||num(v.down)!==parts.down||num(v.cash)!==parts.cash||count!==regs.length||
    (regs.length&&(v.first!==regs[0].date||num(v.step)!==Math.max(1,step)))||(lump&&v.cashDate!==lump.date)){
    if(!applyPayBreakdown(copy,v))return false;
  }
  const [pid,unit]=v.unit.split('|');
  if((pid!==c.proj||unit!==c.unit)&&unitOf(pid,unit).st!=='free'){toast('واحد آزاد نیست');return false}
  if(!await confirmUI({title:'ذخیره تغییرات قرارداد',body:'<p>'+esc(ownerText({...c,owners}))+'</p><b>'+T(price.total)+'</b>'}))return false;
  if(c.accountId!==v.accountId)copy.doc={...copy.doc,payBank:'',payName:'',payCard:'',payAcct:'',paySheba:'',...bankDoc(v.accountId)};
  Object.assign(c,copy,{owners,cust:v.cust,type:v.type,proj:pid,unit,date:v.date,dur:v.dur,note:v.note,latePctDaily:num(v.latePctDaily),total:price.total,installBudget:num(v.installBudget)||undefined,baseTotal:price.base,extraOn:price.extraOn,profitOn:price.profitOn,extraPct:price.extraPct,profitPct:price.profitPct,extraAmt:price.extraAmt,profitAmt:price.profitAmt,accountId:v.accountId,depositLabel:v.depositLabel});
  delete c.ed;repairLinks();save();render();return true;
}
function addR(pre={}){
  const r=S.reservations.find(x=>x.id===pre.editId);
  if(r&&r.st!=='active')return toast('این رزرو بسته شده است');
  const init={...(r?{...r,unit:r.proj+'|'+r.unit,plannedCash:r.plannedCash,plannedInstallments:r.plannedInstallments,total:r.doc?.total??unitSaleTotal(unitOf(r.proj,r.unit))}:{}),...pre,_boxClass:'deal-box'};
  form(r?'ویرایش رزرونامه '+esc(r.no):'رزرونامه جدید',[
    section('طرف رزرو و مشخصات ملک'),{k:'project',l:'پروژه',t:'select',r:1,o:[['','انتخاب پروژه'],...S.projects.map(p=>[p.id,p.name])]},
    {k:'unit',l:'واحد',t:'select',r:1,o:unitOpts(init.unit)},{k:'cust',l:'رزروکننده',t:'select',r:1,o:customerOptions()},
    {k:'date',l:'تاریخ رزرونامه',j:1,r:1,d:todayJ()},section('مبالغ و مهلت رزرو'),
    {k:'total',l:'قیمت کل واحد (تومان)',t:'money'},{k:'need',l:'پیش‌پرداخت توافق‌شده (تومان)',t:'money'},
    {k:'plannedCash',l:'تسویه نقدی توافق‌شده (اختیاری)',t:'money'},{k:'plannedInstallments',l:'سهم اقساط توافق‌شده (اختیاری)',t:'money'},
    {k:'fine',l:'کسری انصراف (تومان)',t:'money',d:RF()},{k:'deadline',l:'مهلت تکمیل وجه',j:1,r:1,d:addD(todayJ(),RD())},
    ...(!r?[section('واریز اولیه (اختیاری)'),{k:'amt',l:'مبلغ واریزی (تومان)',t:'money'},{k:'pdate',l:'تاریخ واریز',j:1,d:todayJ()},...PF.map(f=>({...f,r:0}))]:[]),
    section('ثبت و تأیید'),{k:'by',l:'ثبت‌کننده',d:actor(),r:1},{k:'appr',l:'تأییدکننده',r:1}
  ],init,v=>{
    const [pid,unit]=v.unit.split('|');
    if((!r||r.unit!==unit||r.proj!==pid)&&unitOf(pid,unit).st!=='free'){toast('واحد آزاد نیست');return false}
    if([v.total,v.need,v.fine,v.amt,v.plannedCash,v.plannedInstallments].some(x=>x<0)){toast('مبلغ منفی معتبر نیست');return false}
    if(v.deadline<v.date||((v.need+v.plannedCash+v.plannedInstallments)>v.total&&v.total)){toast('مهلت رزرو یا مبلغ پیش‌پرداخت را بررسی کنید');return false}
    if(v.amt&&(!v.ref||!v.acct||!v.pdate)){toast('برای واریز، تاریخ، حساب مبدأ و شماره پیگیری لازم است');return false}
    const pay=v.amt?mkPay({...v,date:v.pdate,payer:v.payer||cust(v.cust).name},cust(v.cust)):null;
    if(v.amt&&!pay)return false;
    const row=r||{id:uid(),no:nextReserveNo(v.date),st:'active',log:[],pays:pay?[pay]:[]};
    Object.assign(row,{cust:v.cust,proj:pid,unit,need:v.need,plannedCash:v.plannedCash,plannedInstallments:v.plannedInstallments,fine:v.fine,deadline:v.deadline,date:v.date,by:v.by,appr:v.appr,doc:{...row.doc,total:v.total}});
    delete row.ed;lg(row,r?'ویرایش مشخصات رزرو':'ثبت رزرونامه',actor());
    if(!r)S.reservations.push(row);repairLinks();save();go('rd',row.id);
  });
  dealTools(init,r,'reservation');
}
let inventoryIndex=[],stockMatches=[],stockOffset=0;
function stockPage(project='',status='',query=''){
  const matches=inventoryIndex.filter(r=>(!project||project===r.project)&&(!status||status===r.status)&&r.search.includes(nm(N(query))));
  stockMatches=matches;stockOffset=0;
  return '<div class="stock-scroll" onscroll="extendStock(this)">'+tbl(['پروژه','واحد / بلوک','متراژ','وضعیت','مالک / رزروکننده','قیمت واحد (تومان)'],nextStockRows())+'</div>'+(!matches.length?empty('واحدی با این مشخصات پیدا نشد.'):'')+`<footer class="page-controls">${F(matches.length)} واحد</footer>`;
}
function nextStockRows(){
  const rows=stockMatches.slice(stockOffset,stockOffset+80);stockOffset+=rows.length;
  return rows.map(r=>`<tr data-project="${esc(r.project)}" data-status="${esc(r.status)}"><td>${esc(F(r.name))}</td><td>${esc(F(r.unit))}</td><td>${F(r.area)}</td><td><span class="badge ${esc(r.status)}">${esc(UST[r.status])}</span></td><td>${esc(F(r.holder))}</td><td>${money(r.price)}</td></tr>`).join('');
}
function extendStock(el){
  if(stockOffset<stockMatches.length&&el.scrollTop+el.clientHeight>=el.scrollHeight-120)el.querySelector('tbody').insertAdjacentHTML('beforeend',nextStockRows());
}
function inventoryReport(){
  const holders=holderMap();
  inventoryIndex=S.projects.flatMap(p=>p.units.map(u=>{
    const holder=holders.get(p.id+'|'+u.id)||'—',unit=[u.no,u.block].filter(Boolean).join(' / ');
    return {project:p.id,status:u.st,name:p.name,unit,area:u.area,holder,price:unitSaleTotal(u),search:nm(N([p.name,unit,holder,UST[u.st]].join(' ')))};
  }));
  return '<section class="inventory-report"><h3>موجودی واحدها</h3><header><input type="search" id="stockQuery" aria-label="جستجوی موجودی" placeholder="جستجوی پروژه، واحد یا مالک" oninput="filterInventory()"><select aria-label="پروژه گزارش" onchange="filterInventory()" id="reportProject">'+optionList([['','همه پروژه‌ها'],...S.projects.map(p=>[p.id,p.name])])+'</select><select aria-label="وضعیت واحد" onchange="filterInventory()" id="reportStatus">'+optionList([['','همه وضعیت‌ها'],...Object.entries(UST)])+'</select></header><div id="stockResults">'+stockPage()+'</div></section>';
}
function filterInventory(){
  $('#stockResults').innerHTML=stockPage($('#reportProject').value,$('#reportStatus').value,$('#stockQuery').value);
}
function ownershipPrint(c){
  return ownerList(c).length>1?'<p class="art"><b>خریداران و سهم هر یک از شش دانگ واحد</b></p>'+ownerList(c).map(o=>'<p class="art">'+esc(cust(o.customer).name)+'، کد ملی '+esc(F(cust(o.customer).nid))+'، '+F(o.share/1000)+' دانگ</p>').join(''):'';
}
function assignedPreview(){
  const notices=WORK.flatMap(c=>(c.notices||[]).map(n=>({c,n}))).sort((a,b)=>String(b.n.at).localeCompare(String(a.n.at)));
  if(!notices.length)return '<p class="notice-empty">ارجاع تازه‌ای برای بررسی ندارید.</p>';
  return '<div class="notice-scroll">'+notices.map(({c,n})=>`<article data-open-card class="notice-row"><div><small>${n.kind==='incoming'?'در انتظار بررسی شما':'پیگیری تازه برای ارجاع شما'}</small><button data-card-primary class="row-title" onclick="go('wd','${c.id}')">${esc(c.title||kindLabel(c.kind))}</button>${n.by?`<small>${esc(n.by)}</small>`:''}</div><button class="sm" onclick="seeNotice(this,'${c.id}','${esc(n.key)}')">✓ مشاهده کردم</button></article>`).join('')+'</div>';
}
async function seeNotice(button,id,key){
  button.disabled=true;
  try{await api('/api/workcases/'+id+'/seen',{method:'POST',body:JSON.stringify({key})});const c=WORK.find(c=>c.id===id);if(c)c.notices=(c.notices||[]).filter(n=>n.key!==key);refreshCaseCounts()}
  catch(e){button.disabled=false;if(e.message!=='auth')toast(e.message)}
}
function referralCard(c,view){
  const follow=lastFollowOf(c),recipient=c.assignedName||c.currentUnitName;
  return `<article data-open-card class="ref-ticket mini-row" dir="rtl"><div class="mini-main"><button data-card-primary class="row-title" onclick="go('${view}','${c.id}')">${esc(c.title||c.customer?.name||kindLabel(c.kind))}</button>${c.priority==='high'?'<small class="badge warn">فوری</small>':''}</div>
    <div class="row-meta">${[c.customer?.name,recipient&&'گیرنده '+recipient,follow?.next&&'موعد '+F(follow.next)].filter(Boolean).map(v=>'<span>'+esc(v)+'</span>').join('')}</div></article>`;
}
function queueKey(x){
  return x.pid?'inst:'+x.cid+':'+x.pid:x.rid?'res:'+x.rid:'text:lead:'+x.lid+':'+x.date;
}
function referDue(key){
  const x=dueList().find(r=>queueKey(r)===key);
  if(!x)return;
  openReferDialog({kind:x.pid?'installment':x.rid?'reservation':'text',contractId:x.cid,instId:x.pid,reservationId:x.rid,sourceKey:key,title:x.k+' — '+x.who,body:x.desc,priority:x.d<0?'high':'normal'});
}
function compactQueue(title,items){
  if(!items.length)return '';
  const cases=new Map([...LEGAL,...WORK].map(c=>[c.sourceKey,c]));
  return '<section class="queue-group"><header><h4>'+esc(title)+'</h4><small>'+F(items.length)+' مورد</small></header>'+items.map(x=>{
    const key=queueKey(x),linked=cases.get(key),days=x.d<0?F(-x.d)+' روز تأخیر':x.d===0?'امروز':F(x.d)+' روز مانده';
    return `<article data-open-card class="due-ticket" data-s="${esc(N([x.who,x.desc,x.ph,x.k].join(' ')))}"><header><div><small>${esc(x.k)}</small><h4>${esc(F(x.who))}</h4></div>${linked||referredSources.has(key)?'<span class="badge ok">ارجاع شده</span>':''}</header><p>${esc(F(x.desc))}</p><dl><div><dt>موعد پیگیری</dt><dd>${F(x.date)} <span class="badge ${x.d<0?'bad':'warn'}">${days}</span></dd></div>${x.amt==null?'':`<div><dt>${x.k==='لغو رزرو'?'قابل استرداد':'مانده قابل پرداخت'}</dt><dd>${T(x.amt)}</dd></div>`}</dl><footer><button data-card-primary onclick="${x.go}">پرونده</button>${x.pid&&can('write')?`<button onclick="pay('${x.pid}')">ثبت پرداخت</button>`:''}${linked?`<button onclick="go('${canInbox()?'wd':'ld'}','${linked.id}')">پیگیری ارجاع</button>`:canRefer()&&!referredSources.has(key)?`<button onclick="referDue('${esc(key)}')">ارجاع</button>`:''}</footer></article>`;
  }).join('')+'</section>';
}
let referredSources=new Set();
function localizeNode(root){
  if(root.nodeType===3){
    if(!root.parentElement?.closest('script,style,textarea,[contenteditable=true]:focus,code')&&/[0-9٠-٩]/.test(root.data))
      root.data=root.data.replace(/[0-9٠-٩]/g,c=>'۰۱۲۳۴۵۶۷۸۹'[c.charCodeAt(0)>=1632?c.charCodeAt(0)-1632:Number(c)]);
    return;
  }
  if(root.nodeType!==1)return;
  if(root.matches('input:not([type]),input[type=text],input[type=tel],textarea')&&!root.closest('#login')&&!['username','password','code'].includes(root.name))fmtFaDigits(root);
  for(const child of root.childNodes)localizeNode(child);
}
const displayObserver=new MutationObserver(records=>{for(const r of records)for(const node of r.addedNodes)localizeNode(node)});
for(const id of ['main','modal'])displayObserver.observe(document.getElementById(id),{childList:true,subtree:true});
document.addEventListener('input',e=>{
  if(e.target.matches('#main input:not([type]),#modal input:not([type]),#modal textarea,#main textarea')&&!['username','password','code'].includes(e.target.name))fmtFaDigits(e.target);
});
function legalScope(items){
  const mode=V.legalFocus;
  if(mode==='due')return items.filter(c=>c.status!=='done'&&lastFollowOf(c)?.next&&diff(lastFollowOf(c).next)<=0);
  if(mode==='urgent')return items.filter(c=>c.status!=='done'&&c.priority==='high');
  if(mode==='unassigned')return items.filter(c=>c.status!=='done'&&!c.assignedTo);
  return items;
}
function legalDesk(items){
  const next=items.filter(c=>c.status!=='done'&&lastFollowOf(c)?.next).sort((a,b)=>lastFollowOf(a).next.localeCompare(lastFollowOf(b).next));
  const filters=[['all','کل پرونده‌ها'],['due','موعد رسیده'],['urgent','اولویت بالا'],['unassigned','بدون مسئول']];
  return '<section class="legal-desk"><h3>موعدهای پیگیری حقوقی</h3>'+(!next.length?'<p>برای پرونده‌های باز، موعد پیگیری ثبت نشده است.</p>':next.slice(0,5).map(c=>'<button class="legal-date" onclick="go(\'ld\',\''+c.id+'\')"><time>'+F(lastFollowOf(c).next)+'</time><b>'+esc(c.title||kindLabel(c.kind))+'</b><span>'+esc(c.assignedName||'همه اعضای حقوقی')+'</span></button>').join(''))+'</section><div class="stage-picks">'+filters.map(([k,l])=>'<button aria-pressed="'+((V.legalFocus||'all')===k)+'" onclick="V.legalFocus=\''+k+'\';render()">'+l+'</button>').join('')+'</div>';
}
function referralDestination(modal){
  const id=modal.querySelector('[name=assignedTo]').value;
  return id==='*'?{delivery:'members'}:id?{assignedTo:id}:{};
}
function groupDealFields(modal,contract){
  const grid=modal.querySelector('.deal-box>.grid');
  const icons=contract?['proj','cont','acct']:['proj','acct','acct','cust'];
  let group,heading,index=0;
  for(const child of [...grid.children]){
    const label=child.querySelector('.deal-heading');
    if(label){
      const optional=label.textContent.includes('واریز اولیه');
      group=document.createElement(optional?'details':'section');
      group.className='deal-section';
      heading=document.createElement(optional?'summary':'h4');
      heading.innerHTML=uiIcon(icons[index++]||'cont')+'<span>'+esc(label.textContent)+'</span>';
      group.append(heading);child.replaceWith(group);
      if(optional&&num(modal.querySelector('[name=amt]')?.value))group.open=true;
      const fields=document.createElement('div');fields.className='grid';group.append(fields);
    }else group?.lastElementChild.append(child);
  }
  const headingEl=modal.querySelector('.deal-box>h3');
  headingEl.classList.add('deal-title');headingEl.insertAdjacentHTML('afterbegin',uiIcon(contract?'cont':'res'));
  modal.scrollTop=0;
}
function agreementCard(c){
  const status=contStatus(c),paid=paidSum(c),remaining=Math.max(0,c.total-paid),percent=c.total?Math.min(100,Math.round(100*paid/c.total)):0;
  const next=c.inst.filter(i=>!i.paid).sort((a,b)=>a.date.localeCompare(b.date))[0];
  const home=unitTxt(c.proj,c.unit),owners=ownerList(c),search=[home,c.no,typeName(c.type),...owners.flatMap(o=>[cust(o.customer).name,cust(o.customer).phone])];
  return `<article data-open-card class="agreement-card" data-s="${esc(N(search.join(' ')))}">
    <header><span class="agreement-symbol">${uiIcon('cont')}</span><div><small>${esc(typeName(c.type))}</small><h4><button data-card-primary onclick="go('cd','${c.id}')">${esc(home)}</button></h4></div><span class="badge ${status.k}">${esc(status.l)}</span></header>
    <p class="agreement-meta">${esc(F(c.no))} <span>—</span> ${F(c.date)}</p>
    <ul class="buyer-chips">${owners.map(o=>'<li>'+esc(cust(o.customer).name)+' <b>'+F(o.share/1000)+' دانگ</b></li>').join('')}</ul>
    <div class="agreement-amount"><span>مبلغ قرارداد</span><strong>${T(c.total)}</strong></div><div class="barwrap"><div class="barfill" style="width:${percent}%"></div></div>
    <div class="agreement-balance"><span>وصول ${T(paid)}</span><span>مانده ${T(remaining)}</span></div>
    <footer><small>${next?'نزدیک‌ترین سررسید — '+F(next.date):remaining?'در انتظار تعیین سررسید':'تسویه شده'}</small><button class="sm" onclick="go('cd','${c.id}')">مشاهده قرارداد ‹</button></footer>
  </article>`;
}
setInterval(()=>{
  if(!document.hidden&&!$('#shell').hidden&&V.n==='dash'&&!$('#modal.on')){loadReferralSources();if(canInbox())loadInbox()}
},45000);

let pipeline;
function stagePipeline(view,cols,items){
  const lead=view==='lead',previous=pipeline?.view===view?pipeline:{};
  const projects=new Map(S.projects.map(p=>[p.id,p.name]));
  const records=items.map(item=>({
    item,stage:String(lead?item.stage:item.status),
    search:nm(N((lead?[item.name,item.phone,item.rep,item.src,projects.get(item.proj),LS[item.stage]]:
      [item.title,item.body,item.customer?.name,item.contract?.no,item.project?.name,item.referredBy,item.currentUnitName,caseHolder(item),stLabel(item.status)]).join(' ')))
  }));
  records.sort((a,b)=>lead?(a.item.next||'9999').localeCompare(b.item.next||'9999'):
    Number(b.item.priority==='high')-Number(a.item.priority==='high')||(b.item.overdueDays||0)-(a.item.overdueDays||0));
  pipeline={view,cols,records,stage:previous.stage??null,query:previous.query||'',page:previous.page||0};
  return `<section class="flow"><input type="search" aria-label="جستجو در مراحل" placeholder="جستجو در همه مراحل…" value="${esc(pipeline.query)}" oninput="changeFlow(null,this.value)"><div id="flowBody">${flowBody()}</div></section>`;
}
function changeFlow(stage,query,step=0){
  if(query!=null){pipeline.query=query;pipeline.stage=null}
  if(stage!=null)pipeline.stage=stage;
  pipeline.page=step?pipeline.page+step:0;
  $('#flowBody').innerHTML=flowBody();
}
function flowBody(){
  const {cols,records,view,query}=pipeline,lead=view==='lead',term=nm(N(query));
  const groups=new Map(cols.map(c=>[String(c.k),[]]));
  for(const r of records)if(r.search.includes(term))groups.get(r.stage)?.push(r.item);
  const stage=pipeline.stage??String(cols.find(c=>groups.get(String(c.k)).length)?.k??cols[0].k);
  const rows=groups.get(stage)||[],pages=Math.max(1,Math.ceil(rows.length/20));
  pipeline.page=Math.max(0,Math.min(pipeline.page,pages-1));
  const page=rows.slice(20*pipeline.page,20*(pipeline.page+1));
  return `<nav class="flow-rail" aria-label="مراحل">${cols.map(c=>`<button data-stage="${c.k}" aria-pressed="${stage===String(c.k)}" onclick="changeFlow('${c.k}')" ${lead?'ondragover="leadDragOver(event)" ondragleave="leadDragLeave(event)" ondrop="leadDrop(event)"':''}><span>${esc(c.l)}</span><b>${F(groups.get(String(c.k)).length)}</b></button>`).join('')}</nav><section class="flow-stage"><header><h3>${esc(cols.find(c=>String(c.k)===stage)?.l||'')}</h3><span>${F(rows.length)} ${lead?'سرنخ':'ارجاع'}</span></header><div class="flow-cards">${page.map(r=>lead?leadCardHtml(r):referralCard(r,view)).join('')||empty('موردی در این مرحله پیدا نشد.')}</div>${pages>1?`<footer class="page-controls"><button ${pipeline.page?'':'disabled'} onclick="changeFlow(null,null,-1)">قبلی</button><span>${F(pipeline.page+1)} از ${F(pages)}</span><button ${pipeline.page+1<pages?'':'disabled'} onclick="changeFlow(null,null,1)">بعدی</button></footer>`:''}</section>`;
}
let sourceRequest=0;
async function loadReferralSources(){
  const seq=++sourceRequest;
  try{
    const keys=await api('/api/referral-sources');
    if(seq===sourceRequest&&V.n==='dash'&&Array.isArray(keys)){referredSources=new Set(keys);refreshCaseCounts()}
  }catch(e){if(e.message!=='auth')toast(e.message)}
}

document.getElementById('main').addEventListener('click',event=>{
  if(event.defaultPrevented||event.target.closest('a,button,input,select,textarea,summary,label,[contenteditable=true]')||window.getSelection()?.toString())return;
  const card=event.target.closest('[data-open-card]');
  card?.querySelector('[data-card-primary]')?.click();
});
