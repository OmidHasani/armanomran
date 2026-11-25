const depositDefault='پیش‌پرداخت';
function receipts(c,i){
  if(Array.isArray(i.parts))return i.parts;
  if(!i.paid)return [];
  const owner=ownerOn(c,i.pdate||i.date);
  return [{id:i.id,amt:i.amt,date:i.pdate||i.date,ref:i.ref||'',owner,name:cust(owner).name,fee:i.lateFee||0,note:i.lateNote||''}];
}
function collected(i){return Array.isArray(i.parts)?sum(i.parts,p=>p.amt):i.paid?i.amt:0}
function balance(i){return Math.max(0,i.amt-collected(i))}
function ownerOn(c,date){
  const changes=c.transfers||[];
  return changes.find(t=>date<t.date)?.from||c.cust;
}
function panelMenu(label,buttons){return '<details class="action-menu"><summary>'+label+'</summary><div>'+buttons+'</div></details>'}
function payEditor(id){
  const [c,i]=gi(id), old=receipts(c,i);
  const m=$('#modal');
  m.innerHTML=`<div class="box box-wide pay-editor"><h3>واریزهای ${esc(i.title)}</h3><p class="pay-editor-meta">مبلغ قسط <b>${T(i.amt)}</b> — مانده <b>${T(balance(i))}</b></p>
    <div id="receiptRows"></div><button id="moreReceipt">＋ افزودن واریز</button><div class="act"><button id="postReceipts" class="pri">ثبت تغییرات</button><button onclick="closeM()">انصراف</button></div><p role="alert" class="payment-error"></p></div>`;
  openM();
  function append(p){
    const row=document.createElement('fieldset');row.className='receipt-row';row.dataset.id=p.id;
    row.innerHTML=`<legend>واریز</legend><div class="grid">
    <label>مبلغ اصل (تومان)<input name="amount" class="fa-num" inputmode="numeric" lang="fa" value="${money(p.amt)}" oninput="fmtIn(this);ensureMoneyWords(this)"><small class="money-words">${esc(moneyWordsHint(p.amt))}</small></label>
    <label>تاریخ واریز<input name="date" class="fa-num" value="${F(p.date)}" readonly onclick="dpick(this)"></label>
    <label>شماره پیگیری<input name="ref" class="fa-num" maxlength="80" lang="fa" inputmode="numeric" autocomplete="off" value="${esc(F(p.ref||''))}"></label>
    <label>جریمه وصول‌شده (تومان)<input name="fee" class="fa-num" inputmode="numeric" lang="fa" value="${money(p.fee||0)}" oninput="fmtIn(this);ensureMoneyWords(this)"><small class="money-words">${esc(moneyWordsHint(p.fee||0))}</small></label>
    <label class="w">توضیح واریز یا تعدیل جریمه<input name="note" maxlength="1000" value="${esc(p.note||'')}"></label></div><button class="sm x" type="button">حذف این واریز</button>`;
    row.querySelector('button').onclick=()=>row.remove();
    bindFaDigits(row.querySelector('[name=ref]'));
    ensureMoneyWords(row.querySelector('[name=amount]'));
    ensureMoneyWords(row.querySelector('[name=fee]'));
    m.querySelector('#receiptRows').append(row);
  }
  const add=()=>append({id:uid(),amt:old.length?0:balance(i),date:todayJ(),ref:'',fee:old.length?0:calcLateFee(i.amt,instLatePct(c,i),Math.max(0,-diff(i.date)))});
  old.forEach(append);if(!old.length)add();
  $('#moreReceipt').onclick=add;
  $('#postReceipts').onclick=async()=>{
    const parts=[],seen=new Set(),warnings=[];
    const err=m.querySelector('.payment-error');if(err)err.textContent='';
    try{
      for(const row of m.querySelectorAll('fieldset')){
        const get=k=>row.querySelector('[name='+k+']').value.trim();
        const amt=num(get('amount')),date=normJ(get('date')),ref=F(N(get('ref'))),fee=num(get('fee'));
        const original=old.find(p=>p.id===row.dataset.id);
        if(!Number.isSafeInteger(amt)||amt<=0||amt>1e15||!date||!Number.isSafeInteger(fee)||fee<0||fee>1e15)throw Error('مبلغ مثبت و تاریخ معتبر وارد کنید.');
        if(!ref&&!original)throw Error('شماره پیگیری هر واریز را وارد کنید.');
        const hit=findPayRefHit(ref,{kind:'inst',id:i.id});
        if(hit)throw Error('شماره پیگیری '+F(ref)+' در '+hit.kind+' '+hit.no+' برای '+hit.who+' ثبت شده است.');
        const key=refKey(ref);if(key&&seen.has(key))throw Error('شماره پیگیری در دو واریز همین قسط تکرار شده است.');seen.add(key);
        const owner=original?.date===date?original.owner:ownerOn(c,date);
        parts.push({id:row.dataset.id,amt,date,ref,fee,note:get('note'),owner,name:original?.owner===owner?original.name:cust(owner).name});
        if(original?.amt!==amt&&(amt>i.amt||amt<i.amt/2))warnings.push(T(amt)+(amt>i.amt?' بیشتر از مبلغ قسط':' کمتر از نصف مبلغ قسط'));
      }
      const total=sum(parts,p=>p.amt);
      const mode=autoModeOf(c);
      if(total>i.amt){
        warnings.push('جمع واریزها '+T(total)+'، بیشتر از مبلغ قسط '+T(i.amt));
        if(mode!=='off')warnings.push(mode==='year'
          ? 'مازاد از اقساط بازِ همین سال کم و تقسیم می‌شود'
          : 'مازاد از بقیه اقساط باز کم و به‌طور مساوی تقسیم می‌شود');
        else warnings.push('محاسبه مانده خاموش است؛ فقط مبلغ همین قسط به '+T(total)+' به‌روز می‌شود');
      }
      const removed=old.some(p=>!parts.some(x=>x.id===p.id));
      if(removed)warnings.push('برخی واریزهای قبلی از این قسط حذف می‌شوند');
      if(warnings.length){
        const ok=await confirmUI({
          title:'بررسی مبلغ واریز',
          warn:true,
          body:`<p>قبل از ثبت، این موارد را یک‌بار دیگر ببینید. در صورت صحت، تأیید کنید.</p><p class="sheet-meta">مبلغ قسط <b>${T(i.amt)}</b> — جمع واریزها <b>${T(total)}</b>${total?` — ${esc(moneyWordsHint(total))}`:''}</p>`,
          items:warnings,
          okLabel:'تأیید و ثبت',
          cancelLabel:'بازگشت به ویرایش'
        });
        if(!ok)return;
      }
      if(total>i.amt)applyOverpay(c,i,total);
      i.parts=parts.sort((a,b)=>a.date.localeCompare(b.date));i.paid=total>0&&total>=i.amt;
      const last=parts.at(-1);i.ref=last?.ref||'';i.pdate=last?.date||'';i.lateFee=sum(parts,p=>p.fee);
      i.lateDays=last?Math.max(0,daysBetween(i.date,last.date)):0;i.lateCalc=calcLateFee(i.amt,instLatePct(c,i),i.lateDays);i.lateNote=last?.note||'';
      if(c.ed){delete c.ed['rc_'+id];delete c.ed.sched}
      save();closeM();render();
    }catch(e){m.querySelector('.payment-error').textContent=e.message}
  };
}
function installmentRow(c,i){
  if(INST_EDIT===i.id)return installmentEditForm(c,i);
  const paid=collected(i),rest=balance(i),list=receipts(c,i);
  const tone=i.paid?'ok':diff(i.date)<0?'bad':'warn';
  const status=i.paid?'تسویه':paid?'پرداخت بخشی':diff(i.date)<0?'معوق':'در انتظار';
  const extra=[can('write')?`<button onclick="startInstEdit('${i.id}')">ویرایش قسط</button>`:'',
    canRefer()&&!i.paid?`<button onclick="referInst('${c.id}','${i.id}')">ارجاع قسط</button>`:'',
    can('write')&&!paid?`<button class="x" onclick="delI('${i.id}')">حذف قسط</button>`:'',
    list.length?`<button onclick="openRc('${c.id}','${i.id}')">رسید واریزها</button>`:''].join('');
  return `<article data-open-card class="install-line"><div class="install-main"><div><b>${esc(i.title)}</b><small>سررسید ${F(i.date)}</small></div>
  <div><small>مبلغ قسط</small><b>${T(i.amt)}</b></div><div><small>مانده</small><b>${T(rest)}</b></div>
  <span class="badge ${tone}">${status}</span><div class="line-tools">${can('write')?`<button ${list.length?'':'data-card-primary'} class="sm btn-soft" onclick="payEditor('${i.id}')">${paid?'مدیریت واریزها':'＋ ثبت واریز'}</button>`:''}${extra?panelMenu('عملیات',extra):''}</div></div>
  ${list.length?`<details class="receipt-detail"><summary data-card-primary>${F(list.length)} واریز — ${T(paid)}</summary>${list.map(p=>`<p>${F(p.date)} — ${esc(p.name)} — ${T(p.amt)} — پیگیری ${esc(F(p.ref||'—'))}${p.fee?' — جریمه '+T(p.fee):''}</p>`).join('')}</details>`:''}</article>`;
}
const regular=i=>!collected(i)&&i.kind!=='deposit'&&i.kind!=='lump'&&!/پیش.پرداخت|قرض.الحسنه|الباقی/.test(i.title);
function annualPlan(c,rates){
  const open=c.inst.filter(regular);
  const flexible=open.filter(i=>!rates[instYearKey(c,i.date)]);
  const freeIds=new Set(flexible.map(i=>i.id));
  const amounts=new Map();
  let rest=c.total;
  for(const i of c.inst){
    if(freeIds.has(i.id))continue;
    const amount=regular(i)?rates[instYearKey(c,i.date)]:i.amt;
    rest-=amount;amounts.set(i.id,amount);
  }
  if(rest<0||(!flexible.length&&rest!==0)||rest<flexible.length)throw Error('مبالغ تعیین‌شده با کل قرارداد سازگار نیست. مبلغ یک سال را آزاد بگذارید یا نرخ‌ها را اصلاح کنید.');
  const each=flexible.length?Math.floor(rest/flexible.length):0;
  flexible.forEach((i,k)=>amounts.set(i.id,each+(k===flexible.length-1?rest-each*flexible.length:0)));
  return amounts;
}
function yearly(id){
  const c=S.contracts.find(x=>x.id===id),years=[...new Set(c.inst.filter(regular).map(i=>instYearKey(c,i.date)))].sort((a,b)=>+a-+b);
  if(!years.length)return toast('قسط عادی بدون واریز برای تنظیم نرخ وجود ندارد.');
  form('تنظیم مبلغ هر قسط به تفکیک سال',[{t:'html',html:'<p>هر سال اقساط از تاریخ اولین قسط تا همان روز در سال بعد محاسبه می‌شود (نه از اول فروردین). مبلغ هر قسط را به تومان وارد کنید؛ مانده بین سال‌های خالی تقسیم می‌شود. پیش‌پرداخت و اقساط دارای واریز محفوظ‌اند.</p>'},...years.map(y=>({k:'y'+y,l:'مبلغ هر قسط — '+instYearLabel(c,y),t:'money',d:c.rates?.[y]}))],{},async v=>{
    const rates=Object.fromEntries(years.filter(y=>v['y'+y]>0).map(y=>[y,v['y'+y]]));
    try{
      const plan=annualPlan(c,rates);
      const items=years.map(y=>{const rows=c.inst.filter(i=>regular(i)&&instYearKey(c,i.date)===y);return instYearLabel(c,y)+' — '+F(rows.length)+' قسط — مجموع '+T(sum(rows,i=>plan.get(i.id)))});
      const ok=await confirmUI({title:'اعمال برنامه سالانه',body:'<p>مبالغ جدید اقساط طبق این برنامه ثبت شود؟</p>',items,okLabel:'اعمال برنامه',cancelLabel:'بازگشت'});
      if(!ok)return false;
      c.inst.forEach(i=>i.amt=plan.get(i.id));c.rates=rates;if(c.ed){delete c.ed.c;delete c.ed.sched}save();render();
    }catch(e){toast(e.message);return false}
  });
}
function transferContract(id){
  const c=S.contracts.find(x=>x.id===id);
  form('انتقال تعهدات قرارداد',[{k:'to',l:'مشتری جدید',t:'select',o:[['','انتخاب مشتری'],...S.customers.filter(x=>x.id!==c.cust).map(x=>[x.id,x.name+' — '+F(x.nid)])],r:1},{k:'date',l:'تاریخ مؤثر انتقال',j:1,r:1,d:todayJ()}],{},async v=>{
    const last=c.transfers?.at(-1)?.date||c.date;
    if(v.date<last||v.date>todayJ()){toast('تاریخ انتقال باید بین آخرین مالکیت و امروز باشد.');return false}
    if(c.owners?.some(o=>o.customer===v.to)){toast('مشتری مقصد از قبل سهم دارد');return false}
    const latest=c.inst.flatMap(i=>receipts(c,i)).some(p=>p.date>v.date);
    if(latest){toast('برای بعد از تاریخ انتقال، پرداخت ثبت شده است. تاریخ انتقال را بررسی کنید.');return false}
    const ok=await confirmUI({title:'تأیید انتقال قرارداد',body:`<p>مانده <b>${T(c.total-paidSum(c))}</b> به <b>${esc(cust(v.to).name)}</b> منتقل شود؟</p>`,okLabel:'تأیید انتقال',cancelLabel:'انصراف'});
    if(!ok)return false;
    for(const i of c.inst)if(i.paid&&!i.parts)i.parts=receipts(c,i);
    (c.transfers||=[]).push({date:v.date,from:c.cust,to:v.to,fromName:cust(c.cust).name,toName:cust(v.to).name,by:actor()});
    if(c.owners)for(const o of c.owners)if(o.customer===c.cust)o.customer=v.to;
    c.cust=v.to;if(c.ed)delete c.ed.c;save();render();
  });
}
function contractTimeline(c){
  const events=[{date:c.date,label:'ثبت قرارداد',detail:c.transfers?.[0]?.fromName||cust(c.cust).name}];
  for(const t of c.transfers||[])events.push({date:t.date,label:'انتقال قرارداد',detail:t.fromName+' ← '+t.toName+' — ثبت‌کننده '+t.by});
  for(const i of c.inst)for(const p of receipts(c,i))events.push({date:p.date,label:i.title,detail:p.name+' — '+T(p.amt)+' — پیگیری '+F(p.ref||'—')});
  return `<details open class="file-fold"><summary>تاریخچه مالکیت و پرداخت‌ها <small>${F(events.length)} رویداد</small></summary>${events.sort((a,b)=>b.date.localeCompare(a.date)).map(e=>`<div class="event-row"><time>${F(e.date)}</time><b>${esc(e.label)}</b><span>${esc(e.detail)}</span></div>`).join('')}<div class="audit-log"><button onclick="showAudit(this,'${c.id}')">سوابق ثبت و اصلاح واریزها</button></div></details>`;
}
function bankField(){return {k:'accountId',l:'حساب دریافت وجه',t:'select',o:[['','انتخاب حساب'],...(S.cfg.accounts||[]).map(a=>[a.id,a.bank+' — '+a.holder+' — '+F(a.number||a.iban||a.card)])]}}
function bankBook(){
  const items=S.cfg.accounts||[];
  const m=$('#modal');
  m.innerHTML=`<div class="box"><h3>حساب‌های بانکی پروژه‌ها</h3>${items.map((a,k)=>`<div class="bank-row"><div><b>${esc(a.bank)} — ${esc(a.holder)}</b><small>${esc(F(a.iban||a.number||a.card))} — شعبه ${esc(F(a.branch||'—'))}</small></div>${can('write')?`<button onclick="editBank(${k})">ویرایش</button>`:''}</div>`).join('')||empty('حسابی تعریف نشده است.')}
  <div class="act">${can('write')?'<button class="pri" onclick="editBank(-1)">＋ حساب جدید</button>':''}<button onclick="closeM()">بستن</button></div></div>`;
  openM();
}
function editBank(index){
  const accounts=S.cfg.accounts||=[],fields=[['bank','نام بانک'],['holder','صاحب حساب'],['branch','کد شعبه'],['number','شماره حساب'],['card','شماره کارت'],['iban','شماره شبا']];
  form('مشخصات حساب بانکی',fields.map(([k,l])=>({k,l,r:k==='bank'||k==='holder'})),accounts[index],v=>{
    for(const key of ['iban','card','number','branch'])v[key]=N(v[key]).replace(/[\s-]/g,'').toUpperCase();
    if(!v.number&&!v.card&&!v.iban||v.card&&!/^\d{16}$/.test(v.card)||v.iban&&!/^(IR)?\d{24}$/.test(v.iban)||v.number&&!/^\d+$/.test(v.number)){toast('شماره حساب، کارت ۱۶ رقمی یا شبای ۲۴ رقمی معتبر وارد کنید.');return false}
    if(v.iban)v.iban='IR'+v.iban.replace(/^IR/,'');
    if(index<0)accounts.push({id:uid(),...v});else Object.assign(accounts[index],v);
    S.cfg.accounts=accounts;save();render();bankBook();return false;
  });
}
function bankDoc(id){const a=(S.cfg.accounts||[]).find(x=>x.id===id);return a?{payBank:a.bank,payName:a.holder,payCard:a.card,payAcct:a.number,paySheba:a.iban}:{}}
function captureContract(pre){
  const values={};for(const el of $('#modal').querySelectorAll('[name]'))values[el.name]=el.type==='checkbox'?el.checked:el.value;
  for(const key of ['base','down','total','cash','installBudget'])values[key]=num(values[key]);
  for(const key of ['date','ddate','first','cashDate'])values[key]=N(values[key]);
  return {...pre,...values};
}
function saveDraft(pre){
  const values=captureContract(pre),drafts=S.cfg.drafts||=[];
  const id=pre.draftId||uid();values.draftId=id;
  S.cfg.drafts=[...drafts.filter(d=>d.id!==id),{id,values}];save();closeM();go('cont');
}
function draftList(){
  const drafts=S.cfg.drafts||[];
  return `<details class="file-fold"><summary>پیش‌نویس قراردادها <small>${F(drafts.length)}</small></summary>${drafts.map((d,n)=>`<div class="bank-row"><b>${esc(cust(d.values.cust).name)} — ${esc(proj(d.values.project)?.name||'پروژه انتخاب نشده')}</b><div><button onclick="addC(S.cfg.drafts[${n}].values)">ادامه</button> <button class="x" onclick="removeDraft(${n})">حذف</button></div></div>`).join('')||empty('پیش‌نویسی ذخیره نشده است.')}</details>`;
}
async function removeDraft(n){if(await confirmUI({title:'حذف پیش‌نویس',body:'<p>این پیش‌نویس برای همیشه حذف شود؟</p>',okLabel:'بله، حذف شود',danger:true})){S.cfg.drafts.splice(n,1);save();render()}}
function filesPanel(kind,parent){
  const labels=kind==='customer'?[...KY,'سایر مدارک']:kind==='workcase'?['پیوست ارجاع','نامه / مدرک','فیش / رسید','سایر']:['قرارداد امضاشده','الحاقیه','فیش پرداخت','سایر مدارک'];
  const canUp=kind==='workcase'?(can('write')||canRefer()||canInbox()):can('write');
  const open=kind==='contract'?'open':'';
  return `<details ${open} class="file-fold" ontoggle="if(this.open)listFiles(this)" data-kind="${kind}" data-parent="${parent}"><summary>${kind==='workcase'?'پیوست‌های ارجاع':'مدارک و پیوست‌های پرونده'}</summary><div class="files-body"><div class="file-results"></div>${canUp?`<div class="upload-row"><label>نوع مدرک<select>${labels.map(l=>'<option>'+esc(l)+'</option>').join('')}</select></label><label>PDF، تصویر، Word یا Excel — تا ۸ مگابایت<input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx"></label><button onclick="uploadFiles(this.closest('details'))">بارگذاری</button></div>`:''}<p role="status"></p></div></details>`;
}
const filesUrl=el=>'/api/files/'+el.dataset.kind+'/'+encodeURIComponent(el.dataset.parent);
async function listFiles(el){
  try{
    const rows=await api(filesUrl(el));
    const canDel=el.dataset.kind==='workcase'?(can('write')||canRefer()||canInbox()):can('write');
    el.querySelector('.file-results').innerHTML=rows.map(f=>`<div class="bank-row"><div><a href="${filesUrl(el)}/${f._id}">${esc(f.title)}</a><small>${esc(f.category)} — ${F(Math.ceil(f.size/1024))} کیلوبایت</small></div>${canDel?`<button class="sm x" onclick="removeFile(this.closest('details'),'${f._id}')">حذف</button>`:''}</div>`).join('')||'<p>هنوز فایلی پیوست نشده است.</p>';
  }catch(e){el.querySelector('[role=status]').textContent=e.message}
}
async function uploadFiles(el){
  const input=el.querySelector('input'),status=el.querySelector('[role=status]'),button=el.querySelector('.upload-row button');
  if(!input.files.length)return status.textContent='یک فایل انتخاب کنید.';
  button.disabled=true;
  try{
    for(const f of [...input.files]){
      if(f.size>8*1024*1024)throw Error('حجم '+f.name+' بیش از ۸ مگابایت است.');
      status.textContent='در حال ارسال '+f.name;
      const params=new URLSearchParams({title:f.name,category:el.querySelector('select').value});
      const r=await fetch(filesUrl(el)+'?'+params,{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:f});
      if(!r.ok)throw Error((await r.json()).message||'بارگذاری ناموفق بود');
      await listFiles(el);
    }
    status.textContent='فایل‌ها پیوست شدند.';
  }catch(e){status.textContent=e.message}finally{input.value='';button.disabled=false}
}
async function removeFile(el,id){
  if(!(await confirmUI({title:'حذف فایل',body:'<p>این پیوست حذف شود؟</p>',okLabel:'بله، حذف شود',danger:true})))return;
  try{await api(filesUrl(el)+'/'+id,{method:'DELETE'});await listFiles(el)}catch(e){toast(e.message)}
}
function scheduleHtml(c){
  const groups=new Map();
  for(const i of [...c.inst].sort((a,b)=>a.date.localeCompare(b.date))){
    const year=instYearKey(c,i.date);if(!groups.has(year))groups.set(year,[]);groups.get(year).push(i);
  }
  const primary=[...groups].find(([,rows])=>rows.some(i=>!i.paid))?.[0]||groups.keys().next().value;
  return [...groups].map(([year,rows])=>{
    const p=instYearParts(c,year),total=sum(rows,i=>i.amt);
    return `<details class="schedule-year" ${year===primary||rows.some(i=>i.id===INST_EDIT)?'open':''}>
      <summary>
        <span class="sy-main">
          <span class="sy-badge">${esc(p.title)}</span>
          ${p.from?`<span class="sy-range"><span>از ${F(p.from)}</span><i aria-hidden="true"></i><span>تا ${F(p.to)}</span></span>`:''}
        </span>
        <span class="sy-meta">
          <span class="sy-count">${F(rows.length)} ردیف</span>
          <span class="sy-amt">${T(total)}</span>
        </span>
      </summary>
      ${rows.map(i=>installmentRow(c,i)).join('')}
    </details>`;
  }).join('');
}
function caseQueue(cols,items,view){
  return stagePipeline(view,cols,items);
}
function receiptTable(c,rows){
  return tbl(['شرح','پرداخت‌کننده','اصل (تومان)','جریمه','تاریخ','پیگیری'],rows.flatMap(i=>receipts(c,i).map(p=>`<tr><td>${esc(i.title)}</td><td>${esc(p.name)}</td><td>${money(p.amt)}</td><td>${money(p.fee)}</td><td>${F(p.date)}</td><td>${esc(F(p.ref||'—'))}</td></tr>`)).join(''));
}
function leadQueue(items,stage){
  const sorted=items.filter(l=>stage==null||+l.stage===stage).sort((a,b)=>(a.next||'9999').localeCompare(b.next||'9999'));
  return sorted.length?'<div class="prospect-list">'+sorted.map(l=>{
    const days=l.next?diff(l.next):null,p=proj(l.proj);
    return `<article data-s="${esc(N([l.name,l.phone,l.rep,p?.name,l.src].join(' ')))}">
      <header><span class="prospect-avatar">${esc(l.name?.trim()[0]||'؟')}</span><div><h4>${esc(l.name)}</h4><a class=ph href="tel:${esc(N(l.phone))}">${esc(F(l.phone))}</a></div><span class="badge">${esc(LS[l.stage])}</span></header>
      <dl><dt>پروژه</dt><dd>${esc(p?.name||'تعیین نشده')}</dd><dt>کارشناس</dt><dd>${esc(l.rep||'تعیین نشده')}</dd></dl>
      <footer><span class="${days!==null&&days<0?'late-date':''}">${days===null?'بدون موعد پیگیری':days===0?'پیگیری امروز':(days<0?'پیگیری عقب‌افتاده':'پیگیری بعدی')+' — '+F(l.next)}</span><button class="sm" onclick="go('lv','${l.id}')">پرونده ‹</button></footer>
    </article>`;
  }).join('')+'</div>':empty('سرنخی در این مرحله ثبت نشده است.');
}
async function showAudit(button,id,before){
  try{
    const rows=await api('/api/contract-history/'+id+(before?'?before='+before:''));
    button.insertAdjacentHTML('beforebegin',rows.map(row=>`<section><b>${esc(row.actor)} — ${new Intl.DateTimeFormat('fa-IR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(row.at))}</b>${row.changes.map(x=>'<p>'+esc(F(x))+'</p>').join('')}</section>`).join('')||'<p>رویداد دیگری ثبت نشده است.</p>');
    if(rows.length===30){button.textContent='رویدادهای قدیمی‌تر';button.onclick=()=>showAudit(button,id,rows.at(-1).version)}else button.remove();
  }catch(e){toast(e.message)}
}
function editReservationPayment(id,index){
  const r=S.reservations.find(x=>x.id===id),p=r?.pays[index];
  if(!p||r.st!=='active')return;
  form('ویرایش واریز رزرو',[{k:'amt',l:'مبلغ واریز',t:'money',r:1},{k:'date',l:'تاریخ',j:1,r:1},...PF],p,v=>{
    const next=mkPay(v,cust(r.cust),p);if(!next)return false;
    lg(r,'ویرایش واریز '+p.id+' — از '+T(p.amt)+' با پیگیری '+p.ref+' به '+T(next.amt)+' با پیگیری '+next.ref);
    Object.assign(p,next);save();render();
  });
}
function previousContracts(id){
  const items=S.contracts.filter(c=>c.cust!==id&&c.transfers?.some(t=>t.from===id));
  if(!items.length)return '';
  return '<details class="file-fold"><summary>قراردادهای واگذارشده</summary>'+items.map(c=>`<div class="bank-row"><b>${esc(c.no)}</b><span>انتقال در ${F(c.transfers.filter(t=>t.from===id).at(-1).date)}</span><button onclick="go('cd','${c.id}')">تاریخچه قرارداد</button></div>`).join('')+'</details>';
}
document.addEventListener('click',e=>{
  for(const menu of document.querySelectorAll('.action-menu[open]'))if(!menu.contains(e.target))menu.open=false;
});
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  const menu=document.querySelector('.action-menu[open]');if(menu){menu.open=false;menu.querySelector('summary')?.focus()}
});
