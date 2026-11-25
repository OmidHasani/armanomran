const COMPANY='هلدینگ آرمان', PENALTY_TO='آقای مجید اسحاقی (کدملی ۲۱۳۷۶۶۹۸۱۱)';
const TYPES={
 lease:{name:'اجاره به شرط تملیک',a:'موجر',b:'مستاجر',pr:'مال‌الاجاره',dur:'مدت اجاره',end:'پس از تسویه کامل مال‌الاجاره و ایفای تعهدات، مالکیت واحد به مستاجر منتقل و سند رسمی به نام وی تنظیم می‌شود.'},
 partner:{name:'مشارکت در ساخت',a:'شرکت سازنده',b:'سرمایه‌گذار',pr:'مبلغ مشارکت',dur:'مدت تحویل',end:'پس از اتمام ساخت و تسویه کامل مبلغ قرارداد، واحد به سرمایه‌گذار تحویل و سند منتقل می‌شود.'},
 invest:{name:'سرمایه‌گذاری در ساخت (متن کامل)',a:'شرکت سازنده',b:'سرمایه‌گذار',pr:'',dur:'',end:'',full:1}
};
const typeName=t=>(TYPES[t]&&TYPES[t].name)||'—';
const fullC=(c,cu,p,u,t)=>{const L=[['ماده ۱ – طرفین قرارداد',`شرکت سازنده: ${COMPANY} (اطلاعات ثبتی و نشانی: ........................). سرمایه‌گذار: ${esc(cu.name)} فرزند ${esc(cu.father||'—')} کد ملی ${F(cu.nid)} شماره شناسنامه ${F(cu.bc||'—')} همراه ${F(cu.phone)} نشانی: ${esc(cu.addr||'—')}.`],
['ماده ۲ – موضوع قرارداد','تعهد سرمایه‌گذار به پرداخت مبلغ مقرر و تعهد شرکت سازنده به انجام عملیات ساخت‌وساز و واگذاری یک واحد آپارتمان مسکونی به سرمایه‌گذار، مطابق شرایط و مشخصات این قرارداد.'],
['ماده ۳ – محل پروژه',`پروژه ${esc(p.name)} به نشانی ${esc(p.addr)}.`],
['ماده ۴ – مدت قرارداد',`مدت قرارداد ${F(c.dur)} ماه از تاریخ انعقاد (${F(c.date)}) است. تأخیر ناشی از قوه قهریه، موانع اداری و قانونی یا عدم پرداخت به‌موقع اقساط، موجب تمدید این مدت می‌شود و مستوجب جریمه شرکت نیست.`],
['ماده ۵ – مشخصات واحد',`واحد مسکونی شماره <b>${esc(u.no)}</b> طبقه ${esc(u.floor||'—')} با متراژ تقریبی ${F(u.area)} متر مربع به همراه سهم مشاعات و پارکینگ. انتخاب پارکینگ و انباری اختصاصی با شرکت سازنده است. متراژ نهایی پس از پایان کار طبق نقشه اجرایی تعیین می‌شود. مشخصات فنی و مصالح طبق فهرست پیوست و استانداردهای موجود است و جایگزینی مصالح مشابه با تشخیص سازنده بلامانع است.`],
['ماده ۶ – مبلغ قرارداد و نحوه پرداخت',`مبلغ کل قرارداد <b>${TW(c.total)}</b> است که از این مبلغ <b>${TW(payParts(c).down)}</b> پیش‌پرداخت، <b>${TW(payParts(c).inst)}</b> اقساط، و <b>${TW(payParts(c).cash)}</b> تسویه نقدی/الباقی می‌باشد و طبق جدول پرداخت پیوست به حساب اعلام‌شده شرکت واریز می‌شود. تاریخ و زمان ثبت واریز در سامانه بانکی ملاک است. تأخیر در پرداخت هر قسط بیش از ........ روز، شرکت را مجاز به فسخ قرارداد می‌کند و پس از کسر ........ درصد مبلغ قرارداد و هزینه‌های ایجادشده، مابقی مبالغ پرداختی مسترد می‌شود.`],
['ماده ۷ – تحویل واحد','پس از پایان عملیات ساخت و تسویه کامل مبلغ قرارداد، شرکت سازنده واحد را با تنظیم صورتجلسه تحویل به سرمایه‌گذار تحویل می‌دهد. سرمایه‌گذار پس از تحویل، ادعایی بابت متراژ، مشاعات، مصالح یا شکل ظاهری واحد نخواهد داشت.'],
['ماده ۸ – انتقال سند','پس از تشکیل پرونده مالکیت و اخذ مجوزهای لازم، شرکت سازنده مکلف است سند رسمی واحد را به نام سرمایه‌گذار منتقل نماید. هزینه‌های نقل‌وانتقال، حق ثبت، تمبر، عوارض و مالیات انتقال بر عهده سرمایه‌گذار است.'],
['ماده ۹ – شروط ضمن عقد','۹-۱) انشعابات آب، برق، گاز و فاضلاب و هزینه اخذ آن‌ها و شارژ مشاعات بر عهده سرمایه‌گذار است.<br>۹-۲) تغییر در نقشه یا مصالح به درخواست سرمایه‌گذار، منوط به موافقت کتبی شرکت و پرداخت مابه‌التفاوت است.<br>۹-۳) ابلاغ‌ها و اخطارها به نشانی و شماره همراه مندرج در قرارداد (از جمله پیام‌رسان ایتا یا بله) ابلاغ قانونی تلقی می‌شود.<br>۹-۴) سرمایه‌گذار پیش از تسویه کامل، حق واگذاری قرارداد یا واحد به غیر را بدون رضایت کتبی شرکت ندارد.<br>۹-۵) در صورت اخذ تسهیلات بانکی با وثیقه واحد، هزینه‌های آن بر عهده سرمایه‌گذار است و مبلغ وام جزئی از مبلغ قرارداد محسوب می‌شود.<br>۹-۶) چک‌های مربوط به قرارداد در صورت ثبت در سامانه صیاد معتبر است و عدم ثبت آن موجب فسخ قرارداد می‌شود.<br>۹-۷) در صورت احراز مغایرت یا فساد در اسناد پرداخت، قرارداد فسخ می‌گردد و سرمایه‌گذار متعهد به پرداخت وجه التزام طبق فرم اعلام پرداخت است.<br>۹-۸) اختلافات ابتدا با مذاکره و در غیر این صورت از طریق داور مرضی‌الطرفین حل‌وفصل می‌شود و رأی داور لازم‌الاجراست.'],
['ماده ۱۰ – نسخ',`این قرارداد در ۹ ماده و دو نسخه با اعتبار یکسان تنظیم و پس از مطالعه کامل امضا شد. ${esc(c.note||'')}`]];
 return L.map(([h,b])=>`<p><b>${h}:</b> ${b}</p>`).join('')};
const UST={free:'آزاد',res:'رزرو',sold:'فروخته'};
let S={projects:[],customers:[],contracts:[],reservations:[],leads:[],parties:[],ledger:[],checks:[],cfg:{},me:'',pn:1000,cn:1000,rn:1000,_v:0},V={n:'dash'},Q='';
let ME={name:'',username:'',role:'',perms:[],unitIds:[]},USERS=[],ORG_UNITS=[],DIR_USERS=[],LEGAL=[],LEGAL_STATS={},WORK=[],WORK_STATS={},LEGAL_OPTS={caseStatus:[],caseKinds:[],followActions:[],followSubjects:[],followResults:[],perms:[],roles:{}},LEAD_DRAFT={},LEAD_FOCUS=null,UNIT_EDIT=null,UNIT_DUP_HINT=null,UNIT_FILTER='all',INST_EDIT=null,syncText='',saveTimer=null,saveBusy=false,saveQueued=false;
const nowH=()=>{const d=new Date();return[d.getHours(),d.getMinutes(),d.getSeconds()].map(n=>String(n).padStart(2,'0')).join(':')};
const actor=()=>ME.name||S.me||ME.username||'—';
let LEAD_DND={id:null,from:null,dirty:false};
const can=k=>ME.role==='admin'||(ME.perms||[]).includes(k);
const roleLabel=r=>({admin:'مدیر',staff:'کارشناس فروش',legal:'واحد حقوقی'}[r]||r);
const $=s=>document.querySelector(s),uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const F=s=>String(s).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const N=s=>String(s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[,٬،]/g,'').replace(/٫/g,'.');
const nm=s=>String(s||'').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/\s+/g,'').toLowerCase();
const num=s=>+N(s)||0;
const money=n=>F(Math.round(Number(n)||0).toLocaleString('en')).replace(/,/g,'٬');
const T=n=>money(n)+' تومان';
const sum=(a,f)=>a.reduce((s,x)=>s+f(x),0),toast=t=>{const e=$('#toast');e.textContent=t;e.style.display='block';setTimeout(()=>e.style.display='none',2600)};
const U1=['','یک','دو','سه','چهار','پنج','شش','هفت','هشت','نه','ده','یازده','دوازده','سیزده','چهارده','پانزده','شانزده','هفده','هجده','نوزده'],T1=['','','بیست','سی','چهل','پنجاه','شصت','هفتاد','هشتاد','نود'],H1=['','صد','دویست','سیصد','چهارصد','پانصد','ششصد','هفتصد','هشتصد','نهصد'],B1=['','هزار','میلیون','میلیارد','تریلیون'];
function w3(n){const p=[];if(n>=100)p.push(H1[~~(n/100)]);n%=100;if(n>=20){p.push(T1[~~(n/10)]);if(n%10)p.push(U1[n%10])}else if(n)p.push(U1[n]);return p.join(' و ')}
function words(n){n=Math.round(n);if(!Number.isFinite(n))return '';if(n<0)return 'منفی '+words(-n);if(!n)return 'صفر';const g=[];let i=0;while(n){const r=n%1000;if(r)g.unshift(w3(r)+(B1[i]?' '+B1[i]:''));n=Math.floor(n/1000);i++}return g.join(' و ')}
const TW=n=>`${T(n)} (${words(n)} تومان)`;
const moneyWordsHint=n=>{const v=Math.round(Number(n)||0);return v?words(v)+' تومان':''};
function ensureMoneyWords(input){
  if(!input||input.dataset.wordsBound)return;
  input.dataset.wordsBound='1';
  let hint=input.parentElement?.querySelector(':scope > .money-words');
  if(!hint){hint=document.createElement('small');hint.className='money-words';hint.setAttribute('aria-live','polite');input.insertAdjacentElement('afterend',hint)}
  const sync=()=>{hint.textContent=moneyWordsHint(num(input.value))};
  input.addEventListener('input',sync);sync();
}
/** تفکیک مبلغ قرارداد: پیش‌پرداخت / اقساط / نقدی */
function payParts(c){
  const rows=c.inst||[];
  const down=sum(rows.filter(i=>i.kind==='deposit'||/پیش.پرداخت|قرض.الحسنه/.test(i.title||'')),i=>i.amt);
  const cash=sum(rows.filter(i=>i.kind==='lump'||(typeof isLumpInst==='function'?isLumpInst(i):/الباقی|نقدی|یکجا|تسویه\s*نهایی/.test(i.title||''))),i=>i.amt);
  const instRows=rows.filter(i=>i.kind!=='deposit'&&i.kind!=='lump'&&!/پیش.پرداخت|قرض.الحسنه|الباقی|نقدی|یکجا|تسویه\s*نهایی/.test(i.title||''));
  return{down,cash,inst:sum(instRows,i=>i.amt)||num(c.installBudget),instRows,total:Number(c.total)||0};
}
function financialSummary(total,rows){
  return `<section class="financial-summary"><header><span>قیمت کل واحد</span><strong>${T(total)}</strong></header><dl>${rows.map(([label,value])=>`<div><dt>${label}</dt><dd>${value==null?'تعیین نشده':T(value)}</dd></div>`).join('')}</dl></section>`;
}
function payPlanHtml(c){
  const p=payParts(c),remaining=p.total-p.down-p.cash-p.inst;
  return financialSummary(p.total,[['پیش‌پرداخت',p.down],['نقدی',p.cash],['اقساط',p.inst],...(remaining>0?[['توزیع‌نشده',remaining]]:[])]);
}
function payBreakdownPanelHtml(opts){
  opts=opts||{};
  const edit=!!opts.edit;
  return `<div class="pay-break" id="payBreak">
    <div class="pay-break-h">توافق پرداخت</div>
    
    <div class="pay-break-total">
      <span>قیمت تمام‌شده واحد</span>
      <strong data-pp-total>۰</strong><em>تومان</em>
      
    </div>
    ${edit?`<label class="w" style="margin:0">مبلغ کل قرارداد (تومان)<input name="total" inputmode="numeric" class="fa-num"></label>`:''}
    <fieldset class="pay-fields"><legend>پیش‌پرداخت</legend><div class="grid">
      <label>مبلغ (تومان، اختیاری)<input name="down" inputmode="numeric" class="fa-num" placeholder="۰"></label>
      ${edit||opts.existing?'':`<label>تاریخ پرداخت پیش‌پرداخت<input name="ddate" readonly style="cursor:pointer" placeholder="انتخاب از تقویم"></label>
      <label class="w">شماره پیگیری پرداخت اولیه<input name="downRef" class="fa-num" lang="fa" inputmode="numeric" autocomplete="off" placeholder="در صورت وصول"></label>`}
      </div></fieldset><fieldset class="pay-fields"><legend>تسویه نقدی</legend><div class="grid"><label>مبلغ (تومان، اختیاری)<input name="cash" inputmode="numeric" class="fa-num" placeholder="۰"></label>
      <label>سررسید تسویه نقدی<input name="cashDate" readonly style="cursor:pointer" placeholder="انتخاب از تقویم"></label>
      </div></fieldset><fieldset class="pay-fields"><legend>اقساط</legend><div class="grid"><label>مبلغ (تومان، اختیاری)<input name="installBudget" inputmode="numeric" placeholder="مانده پس از پیش‌پرداخت و نقدی"></label><label>تعداد اقساط (اختیاری)<input name="count" inputmode="numeric" class="fa-num" placeholder="۰"></label>
      <label>تاریخ اولین قسط<input name="first" readonly style="cursor:pointer" placeholder="انتخاب از تقویم"></label>
      <label>فاصله اقساط (ماه)<input name="step" inputmode="numeric" class="fa-num" placeholder="۱"></label>
    </div></fieldset>
    <p class="fd" style="margin:0" data-pp-line></p>
    <p class="pay-plan-err" data-pp-err hidden></p>
  </div>`;
}
function syncPayPlan(m){
  if(!m)return null;
  const total=num(m.querySelector('[name=total]')?.value)||num(m.querySelector('#cprice [data-final]')?.textContent)||0;
  const down=num(m.querySelector('[name=down]')?.value);
  const cash=num(m.querySelector('[name=cash]')?.value);
  const budget=m.querySelector('[name=installBudget]');
  const scheduled=num(m.querySelector('[name=count]')?.value)>0;
  const inst=budget?.value?num(budget.value):scheduled?Math.max(0,total-down-cash):num(m.dataset.paidInstallments);
  const box=m.querySelector('#payBreak')||m.querySelector('#payPlanBox');
  if(box){
    const set=(sel,v)=>{const el=box.querySelector(sel);if(el)el.textContent=money(v)};
    set('[data-pp-total]',total);set('[data-pp-down]',down);set('[data-pp-inst]',inst);set('[data-pp-cash]',cash);
    const w=box.querySelector('[data-pp-words]');
    if(w)w.textContent=total?words(total)+' تومان':'';
    const line=box.querySelector('[data-pp-line]');
    if(line)line.textContent=total&&total>down+cash+inst?'مانده برای تعیین نحوه پرداخت: '+T(total-down-cash-inst):'';
    const err=box.querySelector('[data-pp-err]');
    const overflow=down+cash+inst>total&&total>0;
    if(err){err.hidden=!overflow;err.textContent=overflow?'جمع مبالغ از قیمت تمام‌شده بیشتر است.':''}
  }
  const cashDate=m.querySelector('[name=cashDate]')?.closest('label');
  if(cashDate)cashDate.hidden=!(cash>0);
  const firstLab=m.querySelector('[name=first]')?.closest('label');
  const stepLab=m.querySelector('[name=step]')?.closest('label');
  const n=Math.max(0,parseInt(N(m.querySelector('[name=count]')?.value||'0'),10)||0);
  if(firstLab)firstLab.hidden=n<1;
  if(stepLab)stepLab.hidden=n<1;
  return{total,down,cash,inst,n};
}
function autoModeOf(c){
  if(c?.autoMode==='all'||c?.autoMode==='year'||c?.autoMode==='off')return c.autoMode;
  return c?.auto===false?'off':'all';
}
function setAutoMode(id,mode){
  const c=S.contracts.find(x=>x.id==id);if(!c)return;
  const next=autoModeOf(c)===mode?'off':mode;
  c.autoMode=next;delete c.auto;save();render();
  toast(next==='all'?'مانده کلی فعال شد':next==='year'?'مانده سالانه فعال شد':'محاسبه مانده خاموش شد');
}
// تاریخ شمسی
function j2g(jy,jm,jd){jy+=1595;let days=-355668+365*jy+~~(jy/33)*8+~~((jy%33+3)/4)+jd+(jm<7?(jm-1)*31:(jm-7)*30+186),gy=400*~~(days/146097);days%=146097;if(days>36524){gy+=100*~~(--days/36524);days%=36524;if(days>=365)days++}gy+=4*~~(days/1461);days%=1461;if(days>365){gy+=~~((days-1)/365);days=(days-1)%365}let gd=days+1,sa=[0,31,(gy%4==0&&gy%100!=0)||gy%400==0?29:28,31,30,31,30,31,31,30,31,30,31],gm;for(gm=0;gm<13;gm++){if(gd<=sa[gm])break;gd-=sa[gm]}return[gy,gm,gd]}
const pj=s=>N(s).replace(/-/g,'/').split('/').map(Number);
const fj=(y,m,d)=>y+'/'+String(m).padStart(2,'0')+'/'+String(d).padStart(2,'0');
function todayJ(dt){const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{year:'numeric',month:'numeric',day:'numeric'}).formatToParts(dt||new Date()),g=t=>p.find(x=>x.type==t).value;return fj(+g('year'),+g('month'),+g('day'))}
const toDate=s=>{const[a,b,c]=j2g(...pj(s));return new Date(a,b-1,c)};
const addD=(s,k)=>{const d=toDate(s);d.setDate(d.getDate()+k);return todayJ(d)};
const diff=s=>Math.round((toDate(s)-toDate(todayJ()))/864e5);
function normJ(s){const[y,m,d]=pj(s||'');return y>1300&&y<1600&&m>=1&&m<=12&&d>=1&&Number.isInteger(y)&&Number.isInteger(m)&&Number.isInteger(d)&&d<=mlen(y,m)?fj(y,m,d):''}
function addM(s,k){let[y,m,d]=pj(s);m+=k;y+=~~((m-1)/12);m=(m-1)%12+1;return fj(y,m,Math.min(d,mlen(y,m)))}
function addY(s,k){let[y,m,d]=pj(s);y+=+k||0;return fj(y,m,Math.min(d,mlen(y,m)))}
/** تاریخ شروع سال اقساط = سررسید اولین قسط عادی (پیش‌پرداخت ملاک نیست) */
function firstInstallDate(c){
  const rows=(c.inst||[]).filter(i=>i.kind!=='deposit'&&i.kind!=='lump'&&!/پیش.پرداخت|قرض.الحسنه|الباقی/.test(i.title||''));
  return rows.length?[...rows].sort((a,b)=>a.date.localeCompare(b.date))[0].date:'';
}
/** شماره سال اقساط از سالگرد قسط اول: ۱ = [اولین قسط، همان روز سال بعد) */
function instYearKey(c,date){
  const a=firstInstallDate(c);if(!a||!date)return '1';
  if(date<a)return '1';
  let n=1;while(date>=addY(a,n))n++;return String(n);
}
function instYearParts(c,key){
  const a=firstInstallDate(c),n=Math.max(1,+key||1);
  return{n,title:'سال '+F(n),from:a?addY(a,n-1):'',to:a?addY(a,n):''};
}
function instYearLabel(c,key){
  const p=instYearParts(c,key);
  return p.from?p.title+' — از '+F(p.from)+' تا '+F(p.to):p.title;
}
// ذخیره‌سازی روی سرور
function setSync(t){syncText=t||'';const e=$('#sync');if(e)e.textContent=syncText}
function nextSeq(key){S[key]=Math.max(1000,S[key]||0)+1;return S[key]}
function trailNo(v){const m=String(N(v||'')).match(/(\d+)\s*$/);return m?+m[1]:0}
/** شماره رزرونامه: ماه+روز / سال + حرف یکتا — مثال تاریخ ۰۲/۰۵/۱۴۰۵ → ۵۲ / ۱۴۰۵ ب */
function nextReserveNo(dateStr){
  const j=normJ(dateStr)||todayJ();
  const[y,m,d]=pj(j);
  const md=String(m)+String(d);
  const letters='ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی';
  const re=new RegExp('^\\s*'+md+'\\s*/\\s*'+y+'\\s*(.+)\\s*$');
  const taken=new Set();
  (S.reservations||[]).forEach(r=>{
    const raw=N(String(r.no||'')).replace(/ي/g,'ی').replace(/ك/g,'ک').trim();
    const hit=raw.match(re);
    if(hit)taken.add(hit[1].replace(/\s+/g,''));
  });
  const pool=[...letters].filter(ch=>!taken.has(ch));
  let mark=pool.length?pool[Math.floor(Math.random()*pool.length)]:'';
  if(!mark){
    for(const a of letters){for(const b of letters){const pair=a+b;if(!taken.has(pair)){mark=pair;break}}if(mark)break}
    if(!mark)mark=letters[0]+String((Date.now()%90)+10);
  }
  return `${F(md)} / ${F(y)} ${mark}`;
}
function bumpCounters(){
  S.cn=Math.max(1000,S.cn||0,...S.contracts.map(c=>trailNo(c.no)));
  S.rn=Math.max(1000,S.rn||0,...S.reservations.map(r=>trailNo(r.no)));
  let pn=Math.max(1000,S.pn||0);
  S.reservations.forEach(r=>(r.pays||[]).forEach(p=>{pn=Math.max(pn,trailNo(p.id))}));
  S.pn=pn;
}
function repairLinks(){
  const sold=new Set(S.contracts.map(c=>c.proj+'|'+c.unit));
  const held=new Set(S.reservations.filter(r=>r.st==='active'||r.st==='cancelling').map(r=>r.proj+'|'+r.unit));
  S.projects.forEach(p=>(p.units||[]).forEach(u=>{
    const k=p.id+'|'+u.id;
    if(!can('admin')&&((u.st==='sold'&&!can('cont'))||(u.st==='res'&&!can('res'))))return;
    if(sold.has(k)&&held.has(k))return;
    u.st=sold.has(k)?'sold':held.has(k)?'res':'free';
  }));
}
function applyState(data,version){
  const d=data||{};
  S={
    projects:Array.isArray(d.projects)?d.projects:[],
    customers:Array.isArray(d.customers)?d.customers:[],
    contracts:Array.isArray(d.contracts)?d.contracts:[],
    reservations:Array.isArray(d.reservations)?d.reservations:[],
    leads:Array.isArray(d.leads)?d.leads:[],
    parties:Array.isArray(d.parties)?d.parties:[],
    ledger:Array.isArray(d.ledger)?d.ledger:[],
    checks:Array.isArray(d.checks)?d.checks:[],
    cfg:d.cfg&&typeof d.cfg==='object'?d.cfg:{},
    me:d.me||'',
    pn:+d.pn||1000,
    cn:+d.cn||1000,
    rn:+d.rn||1000,
    _v:version||0
  };
  S.projects.forEach(p=>{
    if(!Array.isArray(p.units))p.units=[];
    p.units.forEach(u=>{u.ppmRaw=num(u.ppmRaw);u.totalRaw=num(u.totalRaw);u.ppm=num(u.ppm);u.total=num(u.total);u.area=num(u.area)});
  });
  S.contracts.forEach(c=>{if(!Array.isArray(c.inst))c.inst=[]});
  S.reservations.forEach(r=>{if(!Array.isArray(r.pays))r.pays=[];if(!Array.isArray(r.log))r.log=[]});
  if(!S.me&&ME.name)S.me=ME.name;
  repairLinks();
  bumpCounters();
}
function snapshot(){
  repairLinks();
  bumpCounters();
  const copy=JSON.parse(JSON.stringify(S));
  delete copy._v;
  return copy;
}
function save(){if(!can('write')&&!can('admin')&&!can('acct')){toast('اجازه ثبت و ویرایش ندارید');return}saveQueued=true;setSync('در حال ذخیره…');clearTimeout(saveTimer);saveTimer=setTimeout(flushSave,350)}
async function flushSave(){
  if(saveBusy||!saveQueued)return;
  if(!can('write')&&!can('admin')&&!can('acct')){saveQueued=false;setSync('فقط مشاهده');return}
  saveQueued=false;
  saveBusy=true;
  let delayRetry=false;
  try{
    const version=S._v||0;
    const res=await fetch('/api/state',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({version,data:snapshot()})});
    const body=await res.json().catch(()=>({}));
    if(res.status===401){showLogin();return}
    if(!res.ok){setSync(res.status===409?'تعارض نسخه':'ذخیره نشد');toast(body.message||'ذخیره نشد');return}
    S._v=body.version;
    if(body.pn)S.pn=Math.max(S.pn||0,body.pn);
    if(body.cn)S.cn=Math.max(S.cn||0,body.cn);
    if(body.rn)S.rn=Math.max(S.rn||0,body.rn);
    setSync('ذخیره شد');
  }catch(e){
    saveQueued=true;
    delayRetry=true;
    setSync('قطع ارتباط');
    toast('ارتباط با سرور قطع شد. ذخیره دوباره تلاش می‌شود.');
    setTimeout(()=>{if(!saveBusy)flushSave()},4000);
  }finally{
    saveBusy=false;
  }
  if(saveQueued&&!delayRetry)flushSave();
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushSave()});
window.addEventListener('beforeunload',()=>{
  if(!saveQueued&&!saveBusy)return;
  try{fetch('/api/state',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({version:S._v||0,data:snapshot()}),keepalive:true})}catch(e){}
});
function showLogin(msg){
  $('#boot').hidden=true;$('#shell').hidden=true;$('#login').hidden=false;
  const err=$('#loginErr');
  if(msg){err.hidden=false;err.textContent=msg}else err.hidden=true;
  const input=document.querySelector('#loginForm [name=username]');
  if(input)input.focus();
}
function showShell(){$('#boot').hidden=true;$('#login').hidden=true;$('#shell').hidden=false}
// مدل
const proj=id=>S.projects.find(p=>p.id==id),cust=id=>S.customers.find(c=>c.id==id)||{name:'—'};
const unitOf=(pid,id)=>(proj(pid)||{units:[]}).units.find(u=>u.id==id)||{no:'—',area:0};
const setSt=(pid,id,v)=>{const u=unitOf(pid,id);if(u.id)u.st=v};
const paidSum=c=>sum(c.inst||[],collected);
const lateSum=c=>sum(c.inst||[],i=>Number(i.lateFee)||0);
const unitTxt=(pid,id)=>`${(proj(pid)||{}).name||'—'} – واحد ${unitOf(pid,id).no}`;
const daysBetween=(a,b)=>{if(!a||!b||!normJ(a)||!normJ(b))return 0;return Math.round((toDate(normJ(b))-toDate(normJ(a)))/864e5)};
const instLatePct=(c,i)=>{if(i&&i.latePctDaily!=null&&i.latePctDaily!=='')return Number(i.latePctDaily)||0;return Number(c&&c.latePctDaily)||0};
const calcLateFee=(amt,pct,days)=>{const d=Math.max(0,Number(days)||0),p=Number(pct)||0;if(!d||!p||!amt)return 0;return Math.round(Number(amt)*(p/100)*d)};
const clearLateFields=i=>{i.lateDays=0;i.lateCalc=0;i.lateFee=0;i.lateNote=''};
const lateDocLine=i=>{
  const days=Number(i.lateDays)||0,calc=Number(i.lateCalc)||0,fee=Number(i.lateFee)||0,pct=i._latePctUsed!=null?i._latePctUsed:null;
  if(!days&&!fee&&!calc)return '';
  const parts=[`تأخیر ${F(days)} روز`];
  if(pct!=null)parts.push(`نرخ ${F(pct)}٪ روزانه`);
  parts.push(`محاسبه سیستم ${money(calc)} تومان`);
  parts.push(fee===calc?`اعمال‌شده ${money(fee)} تومان`:`اعمال‌شده ${money(fee)} تومان (تعدیل دستی)`);
  if(i.lateNote)parts.push(i.lateNote);
  return parts.join(' — ');
};
const empty=t=>`<div class=empty>${t}</div>`,tbl=(h,r)=>`<div class=wrap><table><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr>${r}</table></div>`;
function remember(){try{sessionStorage.setItem('armanView',JSON.stringify(V))}catch(e){}}
function go(n,id){setMenu(false);if(id&&['cd','rd','cv','ad','ld','wd'].includes(n))api('/api/view-event',{method:'POST',body:JSON.stringify({view:n,id})}).catch(()=>{});V={n,id};Q='';if(n!=='pd'){UNIT_EDIT=null;UNIT_DUP_HINT=null;UNIT_FILTER='all'}if(n!=='cd')INST_EDIT=null;remember();if(n==='dash')loadReferralSources();if(n==='admin'){loadUsers();loadOrgUnits()}if(n==='legal'||n==='ld')loadLegal();if(n==='inbox'||n==='wd'||n==='dash'&&canInbox())loadInbox();render();scrollTo(0,0)}
const canSaveData=()=>can('write')||can('admin')||can('acct');
const canInbox=()=>can('inbox')||can('legal')||can('admin')||(ME.unitIds||[]).length>0;
const canRefer=()=>can('write')||can('admin')||can('legal')||can('inbox');
function edKey(){return V.k==='rc'&&V.i?('rc_'+V.i):V.k}
function openRc(cid,iid){V={n:'doc',id:cid,k:'rc',i:iid};remember();render();scrollTo(0,0)}
function firstNav(){const all=[['dash','میز کار'],['lead','سرنخ‌ها و قیف فروش'],['proj','پروژه‌ها و واحدها'],['cust','مشتریان'],['cont','قراردادها'],['res','رزرونامه‌ها'],['acct','حسابداری'],['inbox','صندوق ارجاعات'],['legal','واحد حقوقی'],['rep','گزارش‌ها و پشتیبان']];return all.filter(([k])=>k==='legal'?can('legal'):k==='inbox'?canInbox():can(k)||(k==='dash'&&(can('legal')||canInbox())))}
function render(){document.querySelector('#main').dataset.view=V.n;const nav=firstNav(),act={cv:'cust',rep:'rep',rd:'res',pd:'proj',cd:'cont',ld:'legal',wd:'inbox',lv:'lead',ad:'acct',admin:'admin',doc:V.k=='res'?'res':(V.k=='acct'||V.k=='checks')?'acct':'cont'}[V.n]||V.n;
 if(!nav.some(([k])=>k===act)){V={n:nav[0]?nav[0][0]:'dash'};remember()}
 $('#nav').innerHTML=workspaceNav(nav,act);
 const foot=$('#sidefoot');
 if(foot)foot.innerHTML=`<div class=who>${esc(ME.name||ME.username||'')}<small style="display:block;color:var(--mut);font-weight:400">${esc(roleLabel(ME.role))}</small></div><div class=sidebtns>${can('admin')?`<a class=sm href="/admin" style="display:inline-flex;align-items:center;text-decoration:none">مدیریت</a>`:''}<button type=button class=sm onclick="chPass()">تغییر رمز</button><button type=button class=sm onclick="logout()">خروج</button></div><div id=sync class=sync></div>`;
 const views={dash,lead:leadV,proj:projV,pd,cust:custV,cont,cd,res,rd,doc,rep:repV,cv:cuV,admin:()=>{location.href='/admin';return empty('در حال انتقال به پنل مدیریت…')},legal:legalV,ld:legalDetail,inbox:inboxV,wd:workDetail,lv:leadDetail,acct:typeof acctV==='function'?acctV:()=>empty('ماژول حسابداری بارگذاری نشده'),ad:typeof ad==='function'?ad:()=>empty('ماژول حسابداری بارگذاری نشده')};
 const view=views[V.n];
 $('#main').innerHTML=view?view():empty('به این بخش دسترسی ندارید');
 if(V.n=='doc'&&window.SourceForms?.mapped())SourceForms.mount();
 if(V.n=='doc'){const p=$('.paper'),o=docObj();if(p){const editable=V.k!=='acct'&&V.k!=='checks'&&!!can('write');p.contentEditable=editable;const k=edKey();if(editable&&o&&o.ed&&o.ed[k])p.innerHTML=o.ed[k];
  if(p.classList.contains('legal')&&typeof fitLegalPages==='function'){requestAnimationFrame(()=>{fitLegalPages(p);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>fitLegalPages(p))})}}}
 if((V.n==='wd'||V.n==='ld'||V.n==='cd'||V.n==='cv')&&typeof listFiles==='function'){
  requestAnimationFrame(()=>document.querySelectorAll('#main .file-fold[open]').forEach(el=>listFiles(el)));
 }
 setSync(syncText)}
function cboxOptParts(label){
  const s=String(label||'');
  const i=s.indexOf(' – ');
  if(i<0)return{title:s,meta:''};
  return{title:s.slice(0,i),meta:s.slice(i+3)};
}
function cboxHtml(f){
  const opts=f.o||[];
  const items=opts.map(([val,label])=>{
    const {title,meta}=cboxOptParts(label);
    const needle=N(`${label} ${val}`).toLowerCase();
    return `<li role=option class=cbox-opt tabindex=-1 data-v="${esc(val)}" data-s="${esc(needle)}" data-label="${esc(label)}">
      <span class=cbox-opt-t>${esc(title||label)}</span>
      ${meta?`<span class=cbox-opt-m>${esc(meta)}</span>`:''}
    </li>`;
  }).join('');
  return `<div class=cbox data-cbox>
    <input type=hidden name=${f.k} value="">
    <button type=button class=cbox-trig aria-haspopup=listbox aria-expanded=false>
      <span class=cbox-val data-ph=1>— انتخاب کنید —</span>
      <span class=cbox-chev aria-hidden=true></span>
    </button>
    <div class=cbox-panel hidden>
      <input type=search class=cbox-q placeholder="جستجو: نام، کد ملی، موبایل…" autocomplete=off>
      <ul class=cbox-list role=listbox>${items||'<li class="cbox-opt empty" aria-disabled=true>موردی ثبت نشده</li>'}</ul>
      <div class=cbox-empty hidden>نتیجه‌ای پیدا نشد</div>
    </div>
  </div>`;
}
function syncCbox(inp){
  const root=inp?.closest?.('[data-cbox]');if(!root)return;
  const val=String(inp.value||'');
  const opt=[...root.querySelectorAll('.cbox-opt[data-v]')].find(o=>o.dataset.v===val);
  const show=root.querySelector('.cbox-val');if(!show)return;
  if(opt){
    const {title,meta}=cboxOptParts(opt.dataset.label||opt.textContent);
    show.innerHTML=`<b>${esc(title)}</b>${meta?`<small>${esc(meta)}</small>`:''}`;
    show.removeAttribute('data-ph');
    root.querySelectorAll('.cbox-opt[aria-selected]').forEach(o=>o.removeAttribute('aria-selected'));
    opt.setAttribute('aria-selected','true');
  }else{
    show.textContent='— انتخاب کنید —';
    show.setAttribute('data-ph','1');
    root.querySelectorAll('.cbox-opt[aria-selected]').forEach(o=>o.removeAttribute('aria-selected'));
  }
}
function setCboxValue(root,val,fire){
  const inp=root.querySelector('input[type=hidden]');if(!inp)return;
  inp.value=val||'';
  syncCbox(inp);
  if(fire)inp.dispatchEvent(new Event('change',{bubbles:true}));
}
function filterCbox(root,q){
  const needle=N(q||'').toLowerCase().trim();
  let n=0,first=null;
  root.querySelectorAll('.cbox-opt[data-v]').forEach(o=>{
    const show=!needle||(o.dataset.s||'').includes(needle);
    o.hidden=!show;
    if(show){n++;if(!first)first=o}
  });
  const empty=root.querySelector('.cbox-empty');
  if(empty)empty.hidden=n>0;
  root.querySelectorAll('.cbox-opt.on').forEach(o=>o.classList.remove('on'));
  if(first)first.classList.add('on');
}
function closeCbox(root){
  if(!root)return;
  const panel=root.querySelector('.cbox-panel');
  const trig=root.querySelector('.cbox-trig');
  if(panel)panel.hidden=true;
  if(trig)trig.setAttribute('aria-expanded','false');
  root.classList.remove('open');
}
function openCbox(root){
  document.querySelectorAll('[data-cbox].open').forEach(r=>{if(r!==root)closeCbox(r)});
  const panel=root.querySelector('.cbox-panel');
  const trig=root.querySelector('.cbox-trig');
  const q=root.querySelector('.cbox-q');
  if(panel)panel.hidden=false;
  if(trig)trig.setAttribute('aria-expanded','true');
  root.classList.add('open');
  if(q){q.value='';filterCbox(root,'');setTimeout(()=>q.focus(),0)}
  const sel=root.querySelector('.cbox-opt[aria-selected="true"]');
  root.querySelectorAll('.cbox-opt.on').forEach(o=>o.classList.remove('on'));
  if(sel&&!sel.hidden){sel.classList.add('on');sel.scrollIntoView({block:'nearest'})}
}
function cboxMove(root,dir){
  const opts=[...root.querySelectorAll('.cbox-opt[data-v]:not([hidden])')];
  if(!opts.length)return;
  let i=opts.findIndex(o=>o.classList.contains('on'));
  if(i<0)i=opts.findIndex(o=>o.getAttribute('aria-selected')==='true');
  i=Math.max(0,Math.min(opts.length-1,(i<0?0:i)+dir));
  opts.forEach(o=>o.classList.remove('on'));
  opts[i].classList.add('on');
  opts[i].scrollIntoView({block:'nearest'});
}
function initCboxes(scope){
  const rootEl=scope||document;
  rootEl.querySelectorAll('[data-cbox]').forEach(root=>{
    if(root.dataset.ready)return;
    root.dataset.ready='1';
    const trig=root.querySelector('.cbox-trig');
    const panel=root.querySelector('.cbox-panel');
    const q=root.querySelector('.cbox-q');
    const list=root.querySelector('.cbox-list');
    syncCbox(root.querySelector('input[type=hidden]'));
    trig?.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();
      root.classList.contains('open')?closeCbox(root):openCbox(root);
    });
    q?.addEventListener('input',()=>filterCbox(root,q.value));
    q?.addEventListener('keydown',e=>{
      if(e.key==='ArrowDown'){e.preventDefault();cboxMove(root,1)}
      else if(e.key==='ArrowUp'){e.preventDefault();cboxMove(root,-1)}
      else if(e.key==='Enter'){
        e.preventDefault();
        const on=root.querySelector('.cbox-opt.on:not([hidden])')||root.querySelector('.cbox-opt[data-v]:not([hidden])');
        if(on){setCboxValue(root,on.dataset.v,true);closeCbox(root);trig?.focus()}
      }else if(e.key==='Escape'){e.preventDefault();closeCbox(root);trig?.focus()}
    });
    list?.addEventListener('click',e=>{
      const opt=e.target.closest('.cbox-opt[data-v]');
      if(!opt)return;
      e.preventDefault();
      setCboxValue(root,opt.dataset.v,true);
      closeCbox(root);
      trig?.focus();
    });
    trig?.addEventListener('keydown',e=>{
      if(e.key==='ArrowDown'||e.key==='Enter'||e.key===' '){
        e.preventDefault();
        if(!root.classList.contains('open'))openCbox(root);
        else if(e.key==='ArrowDown')cboxMove(root,1);
      }else if(e.key==='Escape')closeCbox(root);
    });
  });
}
if(!window.__cboxDocBound){
  window.__cboxDocBound=1;
  document.addEventListener('click',e=>{
    document.querySelectorAll('[data-cbox].open').forEach(root=>{
      if(!root.contains(e.target))closeCbox(root);
    });
  });
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    document.querySelectorAll('[data-cbox].open').forEach(closeCbox);
  });
}
function form(title,fields,init,ok){const m=$('#modal');init=init||{};
 const fieldHtml=(f)=>{
  if(f.t==='html')return f.html||'';
  if(f.t==='search')return cboxHtml(f);
  if(f.t==='check')return `<span class=chkline><input type=checkbox name=${f.k} ${f.d?'checked':''}> ${f.l}</span>`;
  if(f.t==='select')return `<select name=${f.k}>${(f.o||[]).map(o=>`<option value="${esc(o[0])}">${esc(o[1])}</option>`).join('')}</select>`;
  if(f.t==='area')return `<textarea name=${f.k} rows=2></textarea>`;
  return `<input name=${f.k} ${f.t=='pass'?'type=password autocomplete=new-password':''} placeholder="${f.p||''}" ${f.t=='money'?'inputmode=numeric':''} ${f.ro?'readonly':''}>`;
 };
 m.innerHTML=`<div class="box ${init._boxClass||''}"><h3 style="margin-top:0">${title}</h3><div class=grid>${fields.map(f=>{
  if(f.skipRender)return '';
  if(f.t==='html')return `<div class="field w">${fieldHtml(f)}</div>`;
  if(f.t==='search')return `<div class="field w"><span class=fl>${f.l}</span>${fieldHtml(f)}</div>`;
  if(f.t==='check')return `<label class="chk-lab ${f.w?'w':''}">${fieldHtml(f)}</label>`;
  return `<label class="${f.w?'w':''}">${f.l}${fieldHtml(f)}</label>`;
 }).join('')}</div><div class=act><button type=button class=pri id=ok>ذخیره</button><button type=button onclick="closeM()">انصراف</button></div></div>`;
 openM();const el=k=>m.querySelector(`[name=${k}]`),fm=v=>v?F((+v).toLocaleString('en')).replace(/,/g,'٬'):'';
 initCboxes(m);
 fields.forEach(f=>{
  if(f.t==='html'||!f.k)return;
  const e=el(f.k);if(!e)return;
  const v=init[f.k]??f.d??'';
  if(f.t==='check'){e.checked=!!v;if(f.on){e.onchange=()=>f.on(m,0);f.on(m,1)}return}
  const faKey=/^(bc|area|storageArea|no|ref|acct|nid|phone|card|iban|number|branch|chequeNo|vcPhone|count|step|dur|day|latePctDaily|fine|need|amt)$/.test(f.k)||f.t==='fa'||f.j;
  e.value=f.t=='money'?fm(v):f.j?F(v||''):faKey?F(String(v??'')):v;
  if(f.t==='select'){e.value=String(v);if(!v&&e.selectedIndex<0)e.selectedIndex=0}if(f.t==='search')syncCbox(e);
  if(f.j){e.setAttribute('aria-haspopup','dialog');e.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();dpick(e)}};e.readOnly=true;e.style.cursor='pointer';e.placeholder=e.placeholder||'انتخاب از تقویم';e.onclick=ev=>{ev.preventDefault();dpick(e)}}
  if(f.t=='money'){e.classList.add('fa-num');e.oninput=()=>{e.value=fm(num(e.value));ensureMoneyWords(e);if(f.on)f.on(m,0)};ensureMoneyWords(e)}
  else if(faKey&&e.tagName==='INPUT')bindFaDigits(e);
  if(f.on&&f.t!=='money'){e.onchange=()=>f.on(m,0);f.on(m,1)}
  else if(f.on&&f.t=='money')f.on(m,1);
 });
 m.querySelectorAll('input[inputmode=numeric],input[inputmode=decimal],input[inputmode=tel],input.fa-num').forEach(el=>{if(el.type!=='checkbox')bindFaDigits(el)});
 $('#ok').onclick=async()=>{const v={};for(const f of fields){
  if(f.t==='html'||f.skip||!f.k)continue;
  const e=el(f.k);if(!e)continue;
  if(f.t==='check'){v[f.k]=!!e.checked;continue}
  const x=e.value.trim();v[f.k]=f.t=='money'?num(x):x;
  if(f.r&&!v[f.k]&&v[f.k]!==0){e.focus();toast('«'+f.l+'» را وارد کنید');return}
  if(f.j&&v[f.k]){v[f.k]=normJ(x);if(!v[f.k]){toast('تاریخ «'+f.l+'» معتبر نیست (مثال: ۱۴۰۵/۰۸/۱۰)');return}}
 }
  const btn=$('#ok');btn.disabled=true;try{const result=await ok(v);if(result!==false)closeM()}finally{if($('#ok'))$('#ok').disabled=false}}}
function lockShell(on){
  const shell=$('#shell');
  if(shell){if(on)shell.setAttribute('inert','');else if(!$('.sheet.on')&&!$('#modal.on'))shell.removeAttribute('inert')}
  document.body.classList.toggle('modal-open',!!(on||$('#modal.on')||$('.sheet.on')));
}
const openM=()=>{const m=$('#modal');m.classList.add('on');m.scrollTop=0;lockShell(true)};
const closeM=()=>{if(window.returnDeal){const resume=window.returnDeal;window.returnDeal=null;resume();return}const m=$('#modal');m.classList.remove('on');m.innerHTML='';lockShell(false)};
/** تأیید داخلی روی لایه جدا — مودال زیر را نگه می‌دارد و پس‌زمینه را بلر و قفل می‌کند */
function confirmUI({title,body='',items,okLabel='تأیید',cancelLabel='انصراف',danger=false,warn=false}={}){
  return new Promise(resolve=>{
    document.querySelectorAll('.sheet').forEach(el=>el.remove());
    const layer=document.createElement('div');
    layer.className='sheet on';
    layer.setAttribute('role','dialog');
    layer.setAttribute('aria-modal','true');
    const tone=danger?'danger':warn?'warn':'ok';
    const list=(items||[]).filter(Boolean).map(t=>`<li>${esc(t)}</li>`).join('');
    layer.innerHTML=`<div class="sheet-panel sheet-${tone}" tabindex="-1">
      <div class="sheet-glow" aria-hidden="true"></div>
      <header class="sheet-head"><span class="sheet-ico" aria-hidden="true"></span><div><p class="sheet-kicker">${danger?'نیاز به تأیید حذف':warn?'هشدار مبلغ':'تأیید نهایی'}</p><h3>${esc(title||'تأیید')}</h3></div></header>
      <div class="confirm-body">${body}</div>
      ${list?`<ul class="sheet-warns">${list}</ul>`:''}
      <div class="act sheet-act"><button type="button" class="${danger?'x':'pri'}" data-ok>${esc(okLabel)}</button><button type="button" class="btn-ghost" data-cancel>${esc(cancelLabel)}</button></div>
    </div>`;
    document.body.appendChild(layer);
    $('#modal')?.classList.add('under-sheet');
    lockShell(true);
    let done=false;
    const onKey=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish(false)}};
    const finish=ok=>{
      if(done)return;done=true;
      document.removeEventListener('keydown',onKey,true);
      layer.classList.add('out');
      const drop=()=>{if(!layer.isConnected)return;layer.remove();$('#modal')?.classList.remove('under-sheet');lockShell(!!$('#modal.on'));resolve(ok)};
      layer.addEventListener('animationend',drop,{once:true});
      setTimeout(drop,240);
    };
    layer.querySelector('[data-cancel]').onclick=()=>finish(false);
    layer.querySelector('[data-ok]').onclick=()=>finish(true);
    layer.addEventListener('click',e=>{if(e.target===layer)finish(false)});
    document.addEventListener('keydown',onKey,true);
    layer.querySelector('[data-ok]').focus();
  });
}
function askConfirm({title,body,okLabel='تأیید و ذخیره',cancelLabel='انصراف',danger=false,warn=false,items},onOk){
  const m=$('#modal');
  const previous=m.classList.contains('on')?[...m.childNodes]:[];
  const previousScroll=m.scrollTop;
  const tone=danger?'danger':warn?'warn':'ok';
  const list=(items||[]).filter(Boolean).map(t=>`<li>${esc(t)}</li>`).join('');
  m.innerHTML=`<div class="box confirm-box sheet-panel sheet-${tone}"><div class="sheet-glow" aria-hidden="true"></div>
    <header class="sheet-head"><span class="sheet-ico" aria-hidden="true"></span><div><p class="sheet-kicker">${danger?'نیاز به تأیید حذف':warn?'هشدار':'تأیید نهایی'}</p><h3 style="margin:0">${esc(title||'تأیید')}</h3></div></header>
    <div class=confirm-body>${body||''}</div>${list?`<ul class="sheet-warns">${list}</ul>`:''}
    <div class="act sheet-act"><button type=button class="${danger?'x':'pri'}" id=ok>${esc(okLabel)}</button><button type=button class="btn-ghost" id=cancel>${esc(cancelLabel)}</button></div></div>`;
  openM();
  $('#cancel').onclick=()=>{if(!previous.length)return closeM();m.replaceChildren(...previous);m.querySelectorAll('#ok').forEach(btn=>btn.disabled=false);m.scrollTop=previousScroll};
  $('#ok').onclick=async()=>{
    const btn=$('#ok');btn.disabled=true;
    try{const r=await onOk();if(r!==false)closeM()}finally{if($('#ok'))$('#ok').disabled=false}
  };
}
const MN=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
function mlen(y,m){const a=m==12?[y+1,1]:[y,m+1];return Math.round((toDate(fj(a[0],a[1],1))-toDate(fj(y,m,1)))/864e5)}
function dpick(el,cb){
  document.getElementById('cal')?.remove();
  const sel=normJ(el.value),t=todayJ();
  let y,m;
  try{([y,m]=pj(sel||t))}catch(_){([y,m]=pj(t))}
  if(!(y>1300)||!(m>=1&&m<=12)){([y,m]=pj(t))}
  const c=document.createElement('div');c.id='cal';c.setAttribute('role','dialog');c.setAttribute('aria-modal','true');
  document.body.appendChild(c);
  const draw=()=>{
    const first=(toDate(fj(y,m,1)).getDay()+1)%7,L=mlen(y,m);let cells='';
    for(let i=0;i<first;i++)cells+='<i></i>';
    for(let d=1;d<=L;d++){const s=fj(y,m,d);cells+=`<button type=button class="${s==sel?'s':''} ${s==t?'t':''}" data-d="${s}">${F(d)}</button>`}
    c.innerHTML=`<div class=cb><div class=ch><button type=button aria-label="ماه قبل" data-a=pm>‹</button><select aria-label="ماه" data-month>${MN.map((name,k)=>'<option value="'+(k+1)+'" '+(m===k+1?'selected':'')+'>'+name+'</option>').join('')}</select><select aria-label="سال" data-year>${Array.from({length:299},(_,k)=>k+1301).map(n=>'<option value="'+n+'" '+(y===n?'selected':'')+'>'+F(n)+'</option>').join('')}</select><button type=button aria-label="ماه بعد" data-a=nm>›</button></div><div class=cg>${['ش','ی','د','س','چ','پ','ج'].map(x=>`<u>${x}</u>`).join('')}${cells}</div><div class=cf><button type=button data-a=t>امروز</button><button type=button data-a=x>بستن</button></div></div>`;
  };
  c.onchange=e=>{if(e.target.matches('[data-month]'))m=Number(e.target.value);if(e.target.matches('[data-year]'))y=Number(e.target.value);draw()};
  c.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();c.remove();el.focus()}});
  c.onclick=e=>{
    e.stopPropagation();
    const a=e.target.closest('[data-a]')?.dataset?.a,d=e.target.closest('[data-d]')?.dataset?.d;
    if(e.target==c||a=='x')return c.remove();
    if(d||a=='t'){const v=d||t;el.value=F(v);c.remove();el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));if(cb)cb(v);return}
    if(!a)return;if(a=='pm'&&--m<1){m=12;y--}if(a=='nm'&&++m>12){m=1;y++}if(y<1301){y=1301;m=1}if(y>1599){y=1599;m=12}draw();
  };
  draw();c.querySelector('[data-d].s,[data-d].t,[data-d]')?.focus();
}
const sb=()=>'<input class=sb placeholder="جستجو (نام، شماره تماس، کد ملی، واحد، شماره قرارداد...)" oninput="filt(this.value)">';
const filt=v=>{const q=N(v).toLowerCase().trim();document.querySelectorAll('[data-s]').forEach(e=>e.hidden=!!q&&!e.dataset.s.toLowerCase().includes(q))};
const fmtIn=e=>{const v=Math.round(num(e.value));e.value=v?F(v.toLocaleString('en')).replace(/,/g,'٬'):''};
/** ارقام ورودی را فارسی می‌کند (حروف و نمادها حفظ می‌شوند) — مناسب شماره پیگیری و کارت */
function fmtFaDigits(e){
  const pos=e.selectionStart,raw=String(e.value??'');
  const next=raw.replace(/[٠-٩]/g,d=>'۰۱۲۳۴۵۶۷۸۹'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]).replace(/[0-9]/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
  if(next===raw)return;
  e.value=next;
  try{if(pos!=null)e.setSelectionRange(pos,pos)}catch(_){}
}
const bindFaDigits=el=>{if(!el||el.dataset.faBound)return;el.dataset.faBound='1';el.classList.add('fa-num');el.setAttribute('lang','fa');el.setAttribute('inputmode','numeric');el.addEventListener('input',()=>fmtFaDigits(el));if(el.value)fmtFaDigits(el)};
function redistTargets(c,ch,mode){
  let o=c.inst.filter(x=>regular(x)&&x!==ch);
  if(mode==='year'){
    const y=ch?instYearKey(c,ch.date):'1';
    o=o.filter(x=>instYearKey(c,x.date)===y);
  }else{
    o=o.filter(x=>!c.rates?.[instYearKey(c,x.date)]);
  }
  return o;
}
/** تقسیم مانده بین اقساط باز — mode: all | year ؛ prevAmt مبلغ قبلی ch قبل از تغییر */
function redist(c,ch,prevAmt){
  const mode=autoModeOf(c);if(mode==='off'||!ch)return;
  const o=redistTargets(c,ch,mode);if(!o.length)return;
  let pool;
  if(mode==='year'){
    const y=instYearKey(c,ch.date);
    const yearRows=c.inst.filter(x=>instYearKey(c,x.date)===y&&x.kind!=='deposit'&&x.kind!=='lump'&&!(typeof isLumpInst==='function'&&isLumpInst(x)));
    const locked=sum(yearRows.filter(x=>!o.includes(x)&&x!==ch),x=>x.amt);
    const yearBudget=sum(yearRows.filter(x=>x!==ch),x=>x.amt)+(prevAmt!=null?Number(prevAmt):Number(ch.amt)||0);
    pool=Math.max(0,yearBudget-locked-ch.amt);
  }else{
    pool=Math.max(0,c.total-sum(c.inst.filter(x=>!o.includes(x)&&x!==ch),x=>x.amt)-ch.amt);
  }
  if(ch.amt>0&&pool===0&&o.length)toast('مبلغ از مانده قابل‌توزیع بیشتر است');
  const w=sum(o,x=>x.amt);let left=pool;
  o.forEach((x,k)=>{x.amt=k===o.length-1?Math.max(0,left):Math.max(0,Math.floor(pool*(w?x.amt/w:1/o.length)/1000)*1000);left-=x.amt});
}
/** وقتی واریز بیشتر از مبلغ قسط است، مازاد را از اقساط باقی‌مانده کم می‌کند */
function applyOverpay(c,i,paidTotal){
  const prev=Number(i.amt)||0,paid=Math.round(Number(paidTotal)||0);
  if(!(paid>prev))return{changed:false,excess:0};
  const excess=paid-prev;i.amt=paid;
  const mode=autoModeOf(c);
  if(mode==='off')return{changed:true,excess,mode};
  const o=redistTargets(c,i,mode);if(!o.length)return{changed:true,excess,mode};
  const cut=Math.min(excess,sum(o,x=>x.amt));
  let left=cut;const w=sum(o,x=>x.amt)||o.length;
  o.forEach((x,k)=>{
    const share=k===o.length-1?left:Math.min(x.amt,Math.floor(cut*(x.amt/w)/1000)*1000);
    x.amt=Math.max(0,x.amt-share);left-=share;
  });
  return{changed:true,excess,mode,cut,targets:o.length};
}
const openDoc=(id,k)=>{V={n:'doc',id,k};remember();render();scrollTo(0,0)};
const docObj=()=>V.k=='res'?S.reservations.find(x=>x.id==V.id):S.contracts.find(x=>x.id==V.id);
function saveDoc(){const o=docObj();if(!o||!$('.paper'))return toast('سند پیدا نشد');o.ed=o.ed||{};o.ed[edKey()]=$('.paper').innerHTML;save();toast('متن ویرایش‌شده ذخیره شد')}
function resetDoc(){const o=docObj();if(!o)return;if(o.ed)delete o.ed[edKey()];save();render();toast('به متن الگو برگشت')}
function printDoc(){
  const paper=$('.paper');if(!paper)return toast('سند پیدا نشد');
  const o=docObj()||{};
  const title=V.k==='acct'?(V.mode==='summary'?'گزارش-کامل-حسابداری':'ریز-گزارش-حسابداری'):V.k==='checks'?'گزارش-چک‌ها':String(o.no||'قرارداد');
  if(typeof fitLegalPages==='function'&&paper.classList.contains('legal'))fitLegalPages(paper);
  if(typeof buildPrintHtml!=='function'||!paper.querySelector('.legal-page')){
    const prev=document.title;document.title=title;
    try{print()}catch(e){}
    setTimeout(()=>{document.title=prev},500);
    return toast('در تنظیمات چاپ، Headers and footers را خاموش کنید');
  }
  const html=buildPrintHtml(paper,title);
  const w=window.open('','_blank');
  if(!w)return toast('پنجره چاپ مسدود شد؛ اجازه pop-up بدهید');
  w.document.open();w.document.write(html);w.document.close();
  toast('در پنجره چاپ: Headers and footers خاموش، Scale=100%');
}
async function dlDoc(){
  const paper=$('.paper');if(!paper)return toast('سند پیدا نشد');
  const o=docObj()||{};
  const title='قرارداد-'+(o.no||'crm');
  if(typeof fitLegalPages==='function'&&paper.classList.contains('legal'))fitLegalPages(paper);
  toast('در حال آماده‌سازی Word…');
  let h;
  try{
    if(typeof buildWordHtml==='function'&&paper.querySelector('.legal-page')){
      h=await buildWordHtml(paper,title);
    }else{
      h='<html dir="rtl"><head><meta charset="utf-8"><style>body{font-family:\'B Nazanin\',Tahoma;line-height:1.7;direction:rtl;font-size:12pt}table{border-collapse:collapse;width:100%}td,th{border:1px solid #444;padding:3px;text-align:center}</style></head><body>'+paper.innerHTML+'</body></html>';
    }
  }catch(e){
    return toast('خطا در ساخت فایل Word');
  }
  const blob=new Blob(['\ufeff'+h],{type:'application/msword'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=title+'.doc';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  toast('فایل Word آماده شد');
}
function applyPayBreakdown(c,v){
  const total=num(v.total),down=Math.max(0,num(v.down)),cash=Math.max(0,num(v.cash));
  const nWant=Math.max(0,parseInt(N(v.count))||0);
  const step=Math.max(1,parseInt(N(v.step))||1);
  const first=normJ(v.first)||'';
  const cashDate=normJ(v.cashDate)||'';
  if(!(total>0)){toast('قیمت تمام‌شده باید مثبت باشد');return false}
  if(down+cash>total){toast('جمع پیش‌پرداخت و نقدی از قیمت تمام‌شده بیشتر است');return false}
  if(nWant>0&&!first){toast('تاریخ اولین قسط را انتخاب کنید');return false}
  if(cash&&!cashDate){toast('سررسید تسویه نقدی را انتخاب کنید');return false}
  const rest=num(v.installBudget)||Math.max(0,total-down-cash);
  const depTitle=v.type==='lease'?(v.depositLabel||c.depositLabel||depositDefault):depositDefault;
  const isDep=i=>i.kind==='deposit'||/پیش.پرداخت|قرض.الحسنه/.test(i.title||'');
  const isCash=i=>i.kind==='lump'||(typeof isLumpInst==='function'?isLumpInst(i):/الباقی|نقدی|یکجا|تسویه\s*نهایی/.test(i.title||''));
  let dep=c.inst.find(isDep);
  if(down){
    if(dep){dep.amt=down;dep.title=depTitle;dep.kind='deposit'}
    else c.inst.unshift({id:uid(),kind:'deposit',title:depTitle,amt:down,date:v.date||c.date,paid:false,pdate:'',ref:'',lateDays:0,lateCalc:0,lateFee:0,lateNote:''});
  }else if(dep&&!collected(dep)&&!dep.paid){c.inst=c.inst.filter(i=>i!==dep)}
  let lump=c.inst.find(isCash);
  if(cash){
    if(lump){lump.amt=cash;lump.kind='lump';lump.title='الباقی نقدی';if(cashDate)lump.date=cashDate}
    else c.inst.push({id:uid(),kind:'lump',title:'الباقی نقدی',amt:cash,date:cashDate||c.date,paid:false,pdate:'',ref:'',lateDays:0,lateCalc:0,lateFee:0,lateNote:''});
  }else if(lump&&!collected(lump)&&!lump.paid){c.inst=c.inst.filter(i=>i!==lump)}
  const regs=c.inst.filter(i=>!isDep(i)&&!isCash(i));
  const paidRegs=regs.filter(i=>i.paid||collected(i));
  const unpaidRegs=regs.filter(i=>!i.paid&&!collected(i));
  const paidAmt=sum(paidRegs,i=>i.amt);
  const pool=Math.max(0,rest-paidAmt);
  if(nWant===0){
    if(unpaidRegs.some(i=>collected(i))){toast('اقساط دارای واریز جزئی را ابتدا تسویه یا ویرایش کنید');return false}
    c.inst=c.inst.filter(i=>isDep(i)||isCash(i)||paidRegs.includes(i));
  }else if(unpaidRegs.length===nWant){
    const each=nWant?Math.floor(pool/nWant):0;let left=pool;
    unpaidRegs.forEach((row,i)=>{
      row.amt=i===nWant-1?Math.max(0,left):each;left-=row.amt;
      if(first)row.date=addM(first,i*step);
    });
  }else{
    if(unpaidRegs.some(i=>collected(i))){toast('برای تغییر تعداد اقساط، واریز جزئی نباید روی اقساط باز باشد');return false}
    c.inst=c.inst.filter(i=>isDep(i)||isCash(i)||paidRegs.includes(i));
    const each=nWant?Math.floor(pool/nWant):0;
    for(let i=0;i<nWant;i++)c.inst.push({id:uid(),title:'قسط '+F(paidRegs.length+i+1),amt:i===nWant-1?pool-each*(nWant-1):each,date:addM(first,i*step),paid:false,pdate:'',ref:'',lateDays:0,lateCalc:0,lateFee:0,lateNote:''});
  }
  c.inst.sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  c.total=total;
  return true;
}
function regen(id){const c=S.contracts.find(x=>x.id==id);if(c.inst.some(i=>collected(i)&&!i.paid))return toast('برای اقساط دارای واریز جزئی از تنظیم سالانه استفاده کنید.');const rest=c.total-sum(c.inst.filter(i=>i.paid||i.kind==='deposit'),i=>i.amt);form('بازسازی اقساط پرداخت‌نشده',[{k:'rest',l:'مبلغ باقی‌مانده برای تقسیم (تومان)',t:'money',r:1},{k:'count',l:'تعداد اقساط',d:'12'},{k:'first',l:'تاریخ اولین قسط',j:1,r:1,d:addM(todayJ(),1)},{k:'step',l:'فاصله اقساط (ماه)',d:'1'},{k:'day',l:'روز ثابت هر ماه (اختیاری، مثلاً ۲۵)'}],{rest},v=>{const n=parseInt(N(v.count))||0,step=Math.max(1,parseInt(N(v.step))||1),day=parseInt(N(v.day))||0,each=n?Math.floor(v.rest/n/1000)*1000:0;if(n<1||n+c.inst.filter(i=>i.paid).length>500||v.rest<=0){toast('تعداد اقساط یا مبلغ مانده معتبر نیست');return false}
 c.inst=c.inst.filter(i=>i.paid||i.kind==='deposit');c.rates={};for(let i=0;i<n;i++){let d=addM(v.first,i*step);if(day){const[y,m]=pj(d);d=fj(y,m,Math.min(day,mlen(y,m)))}c.inst.push({id:uid(),title:'قسط '+F(i+1),amt:i==n-1?v.rest-each*(n-1):each,date:d,paid:false,pdate:'',ref:'',lateDays:0,lateCalc:0,lateFee:0,lateNote:''})}c.inst.sort((a,b)=>a.date<b.date?-1:1);save();render()})}
function setDay(id){const c=S.contracts.find(x=>x.id==id);form('روز ثابت ماه برای اقساط پرداخت‌نشده',[{k:'day',l:'روز ماه (۱ تا ۳۱)',r:1,d:'25'}],0,v=>{const d=parseInt(N(v.day));if(!(d>=1&&d<=31)){toast('روز معتبر نیست');return false}c.inst.forEach(i=>{if(!i.paid){const[y,m]=pj(i.date);i.date=fj(y,m,Math.min(d,mlen(y,m)))}});c.inst.sort((a,b)=>a.date<b.date?-1:1);save();render()})}
const setM=(m,k,v)=>{const e=m.querySelector(`[name=${k}]`);e.value=v?F((+v).toLocaleString('en')).replace(/,/g,'٬'):''};
// داشبورد
function dueList(){const L=[],legalDays=Math.max(1,Number(S.cfg?.legalDays)||7);
 S.contracts.forEach(c=>(c.inst||[]).forEach(i=>{if(!i.paid){const d=diff(i.date);if(d<=7||d<=-legalDays)L.push({d,k:'قسط',who:cust(c.cust).name,ph:cust(c.cust).phone,pid:i.id,cid:c.id,legal:d<=-legalDays,desc:`${c.no} – ${i.title}`,amt:balance(i),date:i.date,go:`go('cd','${c.id}')`})}}));
 S.reservations.forEach(r=>{if(r.st=='cancelling'){L.push({d:diff(r.cancel.date),rid:r.id,k:'لغو رزرو',who:cust(r.cust).name,ph:cust(r.cust).phone,desc:`${r.no} – مرحله بعد: ${CS[r.cancel.h.length]}`,amt:r.cancel.refund,date:r.cancel.date,go:`go('rd','${r.id}')`})}if(r.st=='active'){const d=diff(r.deadline),rem=r.need-sum(r.pays,p=>p.amt);if(d<=7||rem<=0||d<=-legalDays)L.push({d,rid:r.id,k:rem>0?'مهلت رزرو':'تکمیل وجه؛ تعیین تکلیف',who:cust(r.cust).name,ph:cust(r.cust).phone,legal:d<=-legalDays&&rem>0,desc:`${r.no} – ${unitTxt(r.proj,r.unit)}`,amt:Math.max(0,rem),date:r.deadline,go:`go('rd','${r.id}')`})}});
 S.leads.forEach(l=>{if(l.next&&l.stage<8){const d=diff(l.next);if(d<=7)L.push({d,lid:l.id,k:'پیگیری سرنخ',who:l.name,ph:l.phone,desc:LS[l.stage],amt:null,date:l.next,go:`go('lv','${l.id}')`})}});
 return L.sort((a,b)=>a.d-b.d)}
// پروژه‌ها
const PF_PROJ=[{k:'name',l:'نام پروژه',r:1},{k:'addr',l:'نشانی',w:1},{k:'vcName',l:'نام و نام‌خانوادگی مسئول بازدید',r:1},{k:'vcPhone',l:'شماره تماس مسئول بازدید',r:1},{k:'vcNote',l:'راهنمای هماهنگی بازدید',t:'area',w:1},{k:'note',l:'توضیحات پروژه',t:'area',w:1}];
const UF_KIND=[['مسکونی','مسکونی'],['تجاری','تجاری'],['اداری','اداری'],['پارکینگ','پارکینگ'],['انباری','انباری']];
const UF_FACE=[
  ['','— انتخاب موقعیت —'],
  ['شمالی','شمالی'],
  ['جنوبی','جنوبی'],
  ['شرقی','شرقی'],
  ['غربی','غربی'],
  ['شمالی-جنوبی','شمالی-جنوبی'],
  ['شرقی-غربی','شرقی-غربی'],
  ['شمال شرقی','شمال شرقی'],
  ['شمال غربی','شمال غربی'],
  ['جنوب شرقی','جنوب شرقی'],
  ['جنوب غربی','جنوب غربی'],
];
const UF_YN=[['0','ندارد'],['1','دارد']];
const UF_HAND=[['0','تاریخ تکمیل / تحویل'],['1','آماده تحویل']];
const UF_FLOOR=[
  ['','— انتخاب طبقه —'],
  ['منفی ۲','منفی ۲'],['منفی ۱','منفی ۱'],['همکف','همکف'],
  ...Array.from({length:20},(_,i)=>[String(i+1),F(i+1)]),
  ['پنت‌هاوس','پنت‌هاوس'],
];
const UF_ROOMS=[['', '— انتخاب —'],...Array.from({length:8},(_,i)=>[String(i+1),F(i+1)])];
const UF_PARK_N=Array.from({length:6},(_,i)=>[String(i+1),`${F(i+1)} ماشین`]);
const UF_STORE_N=Array.from({length:5},(_,i)=>[String(i+1),`${F(i+1)} عدد`]);
const unitSelOpts=(list,cur)=>{
  const v=cur==null||cur===''?'':String(cur);
  const opts=list.slice();
  if(v&&!opts.some(([k])=>String(k)===v))opts.push([v,F(v)]);
  return opts.map(([k,l])=>`<option value="${esc(k)}" ${String(k)===v?'selected':''}>${esc(l)}</option>`).join('');
};
const unitSearchBlob=u=>N([u.no,u.floor,u.kind,u.block,u.face,u.rooms,UST[u.st],u.handReady?'آماده':'',u.handDate||''].join(' '));
const unitHandLabel=u=>u.handReady?(`آماده تحویل${u.handDate?' — '+F(u.handDate):''}`):(u.handDate?F(u.handDate):'—');
const unitParkLabel=u=>u.parking||u.parkingCount?`${F(u.parkingCount||1)} ماشین`:'ندارد';
const unitStoreLabel=u=>{
  if(!(u.storage||u.storageCount))return 'ندارد';
  const parts=[`${F(u.storageCount||1)} عدد`];
  if(u.storageArea)parts.push(`${F(u.storageArea)} م²`);
  return parts.join(' — ');
};
/** Derive ppm/total pair from whichever side the user filled. */
const pairPrices=(area,ppm,total)=>{
  let p=num(ppm),t=num(total),a=num(area);
  if(!t&&p&&a)t=Math.round(a*p);
  if(!p&&t&&a)p=Math.round(t/a);
  return{ppm:p||0,total:t||0};
};
const unitSaleTotal=u=>num(u?.total)||num(u?.totalRaw)||0;
const unitHasPrice=u=>(num(u?.total)||num(u?.ppm)||num(u?.totalRaw)||num(u?.ppmRaw))>0;
const unitPriceSummary=(u)=>[
  (num(u.totalRaw)||num(u.ppmRaw))?`خام شرکتی ${money(u.totalRaw||Math.round(num(u.area)*num(u.ppmRaw)))}`:'',
  (num(u.total)||num(u.ppm))?`تکمیل‌شده ${money(u.total||Math.round(num(u.area)*num(u.ppm)))}`:'',
].filter(Boolean).join(' — ')||'—';
function unitNoKey(no,block){return `${String(no||'').trim()}|${String(block||'').trim()}`}
function unitNoConflict(p,no,block,exceptId){
  const key=unitNoKey(no,block);
  if(!String(no||'').trim())return false;
  return (p.units||[]).some(u=>u.id!==exceptId&&unitNoKey(u.no,u.block)===key);
}
function suggestUnitNo(p,src){
  const base=String(src.no||'').trim()||'1';
  const block=src.block||'';
  const taken=no=>unitNoConflict(p,no,block);
  const m=base.match(/^(.*?)(\d+)$/);
  if(m){
    let n=parseInt(m[2],10);
    const prefix=m[1],pad=m[2].length;
    for(let i=0;i<500;i++){
      n+=1;
      const cand=prefix+String(n).padStart(pad,'0');
      if(!taken(cand))return cand;
    }
  }
  for(let i=2;i<200;i++){
    const cand=`${base}-${i}`;
    if(!taken(cand))return cand;
  }
  return `${base}-کپی`;
}
function cloneUnitData(src,overrides){
  return {
    id:uid(),
    st:'free',
    no:src.no,
    floor:src.floor||'',
    kind:src.kind||'',
    area:num(src.area),
    ppm:num(src.ppm),
    total:num(src.total),
    ppmRaw:num(src.ppmRaw),
    totalRaw:num(src.totalRaw),
    block:src.block||'',
    rooms:num(src.rooms),
    face:src.face||'',
    parking:!!src.parking,
    parkingCount:num(src.parkingCount),
    storage:!!src.storage,
    storageCount:num(src.storageCount),
    storageArea:num(src.storageArea),
    handReady:!!src.handReady,
    handDate:src.handDate||'',
    ...(overrides||{}),
  };
}
function focusUnitEdit(){
  requestAnimationFrame(()=>{
    const card=document.querySelector('.uc.edit');
    if(card)card.scrollIntoView({behavior:'smooth',block:'center'});
    const inp=$('#ue_no');
    if(inp){inp.focus();inp.select()}
  });
}
function addP(done){form('پروژه جدید',[...PF_PROJ,bankField()],0,v=>{askConfirm({title:'تأیید ثبت پروژه',body:`<p>پروژه <b>${esc(v.name)}</b> ثبت شود؟</p>`},()=>{const created={id:uid(),accountId:v.accountId,name:v.name,addr:v.addr,note:v.note,vcName:v.vcName,vcPhone:N(v.vcPhone),vcNote:v.vcNote,units:[]};S.projects.push(created);save();render();if(typeof done==='function'){done(created);return false}toast('پروژه ثبت شد');return true});return false})}
function editP(){const p=proj(V.id);if(!p)return;form('ویرایش پرونده پروژه',[...PF_PROJ,bankField()],p,v=>{
  askConfirm({title:'تأیید ذخیره پروژه',body:`<p>تغییرات پروژه <b>${esc(v.name)}</b> ذخیره شود؟</p><div class=confirm-summary><p>مسئول بازدید: <b>${esc(v.vcName)}</b></p><p>شماره: <b>${F(v.vcPhone||'—')}</b></p></div>`},()=>{Object.assign(p,{accountId:v.accountId,name:v.name,addr:v.addr,note:v.note,vcName:v.vcName,vcPhone:N(v.vcPhone),vcNote:v.vcNote});save();render();toast('پروژه ذخیره شد');return true});
  return false;
})}
function unitCardHtml(u,holders){
  const editing=UNIT_EDIT===u.id&&can('write');
  if(editing){
    const p=proj(V.id);
    const dupNow=p&&unitNoConflict(p,u.no,u.block,u.id);
    const hint=UNIT_DUP_HINT&&UNIT_DUP_HINT.id===u.id?UNIT_DUP_HINT:null;
    return `<article class="unit-line uc edit" data-s="${esc(unitSearchBlob(u))}">
      ${hint?`<div class=uc-dup-banner>
        <b>کپی از واحد ${esc(hint.from)}${hint.fromBlock?' — '+esc(hint.fromBlock):''}</b>
        <span>همه مشخصات عین واحد قبلی است. شماره واحد را عوض کنید یا همین پیشنهاد را تأیید و ذخیره کنید.</span>
      </div>`:''}
      ${dupNow?`<div class="uc-dup-banner bad">شماره <b>${esc(u.no)}</b>${u.block?' در بلوک '+esc(u.block):''} تکراری است و تا تغییر ندهید قابل ذخیره نیست.</div>`:''}
      <div class=uc-edit-grid>
        <label class="${hint||dupNow?'need-no':''}">شماره واحد<input id=ue_no value="${esc(u.no)}" aria-invalid="${dupNow?'true':'false'}"><small class=fld-hint>${dupNow?'این شماره تکراری است':'در پروژه یکتا باشد'}</small></label>
        <label>بلوک / فاز<input id=ue_block value="${esc(u.block||'')}" placeholder="مثلاً A یا بلوک غرب"></label>
        <label>طبقه<select id=ue_floor>${unitSelOpts(UF_FLOOR,u.floor||'')}</select></label>
        <label>کاربری<select id=ue_kind>${UF_KIND.map(([k,l])=>`<option value="${k}" ${u.kind===k?'selected':''}>${l}</option>`).join('')}</select></label>
        <label>متراژ واحد (م²)<input id=ue_area inputmode=numeric value="${esc(F(u.area))}" oninput="fmtIn(this)"></label>
        <label>تعداد خواب<select id=ue_rooms>${unitSelOpts(UF_ROOMS,u.rooms?String(u.rooms):'')}</select></label>
        <label class=span2>موقعیت واحد<select id=ue_face>${UF_FACE.map(([k,l])=>`<option value="${esc(k)}" ${(u.face||'')===k?'selected':''}>${esc(l)}</option>`).join('')}</select></label>
        <div class="uc-price-block span2">
          <div class=uc-price-h>قیمت خام شرکتی <small>یکی از متری یا کل کافی است</small></div>
          <div class=uc-price-row>
            <label>قیمت هر متر<input id=ue_ppmRaw inputmode=numeric value="${esc(money(u.ppmRaw||0))}" oninput="fmtIn(this);syncUnitEditTotals('raw','ppm')"></label>
            <label>قیمت کل<input id=ue_totalRaw inputmode=numeric value="${esc(money(u.totalRaw||0))}" oninput="fmtIn(this);syncUnitEditTotals('raw','total')"></label>
          </div>
        </div>
        <div class="uc-price-block span2">
          <div class=uc-price-h>قیمت تکمیل‌شده <small>یکی از متری یا کل کافی است</small></div>
          <div class=uc-price-row>
            <label>قیمت هر متر<input id=ue_ppm inputmode=numeric value="${esc(money(u.ppm))}" oninput="fmtIn(this);syncUnitEditTotals('fin','ppm')"></label>
            <label>قیمت کل<input id=ue_total inputmode=numeric value="${esc(money(u.total))}" oninput="fmtIn(this);syncUnitEditTotals('fin','total')"></label>
          </div>
        </div>
        <label class=span2 style="display:flex;gap:8px;align-items:center"><input id=ue_parking type=checkbox style="width:auto" ${u.parking||u.parkingCount?'checked':''} onchange="toggleUnitExtra('park',this.checked)"> پارکینگ دارد</label>
        <label id=ue_park_wrap ${u.parking||u.parkingCount?'':'hidden'}>تعداد ماشین<select id=ue_parkingCount>${unitSelOpts(UF_PARK_N,u.parkingCount||1)}</select></label>
        <label class=span2 style="display:flex;gap:8px;align-items:center"><input id=ue_storage type=checkbox style="width:auto" ${u.storage||u.storageCount?'checked':''} onchange="toggleUnitExtra('store',this.checked)"> انباری دارد</label>
        <label id=ue_store_c_wrap ${u.storage||u.storageCount?'':'hidden'}>تعداد انباری<select id=ue_storageCount>${unitSelOpts(UF_STORE_N,u.storageCount||1)}</select></label>
        <label id=ue_store_a_wrap ${u.storage||u.storageCount?'':'hidden'}>متراژ انباری (م²)<input id=ue_storageArea inputmode=decimal value="${u.storageArea?esc(F(u.storageArea)):''}"></label>
        <label>وضعیت تحویل<select id=ue_handReady onchange="toggleUnitExtra('hand',this.value==='1')">${UF_HAND.map(([k,l])=>`<option value="${k}" ${(u.handReady?'1':'0')===k?'selected':''}>${l}</option>`).join('')}</select></label>
        <label id=ue_hand_wrap>تاریخ تکمیل / تحویل<input id=ue_handDate readonly style="cursor:pointer" value="${u.handDate?F(u.handDate):''}" placeholder="انتخاب از تقویم" onclick="dpick(this)"></label>
      </div>
      <div class=uc-actions>
        <button class=pri onclick="saveUnitEdit('${u.id}')">ذخیره تغییرات</button>
        <button onclick="cancelUnitEdit()">انصراف</button>
      </div>
    </article>`;
  }
  const ops=can('write')?panelMenu('عملیات',`<button onclick="startUnitEdit('${u.id}')">ویرایش واحد</button><button onclick="dupU('${u.id}')">تکثیر واحد</button><button class="x" onclick="delU('${u.id}')">حذف واحد</button>`):'';
  return `<article data-open-card class="unit-line uc" data-s="${esc(unitSearchBlob(u))}">
    <div class="unit-main">
      <div class="unit-id">
        <b>واحد ${esc(u.no)}${u.block?`<small class="unit-block">${esc(u.block)}</small>`:''}</b>
        <span class="badge ${u.st}">${UST[u.st]}</span>
      </div>
      <div class="unit-fact"><small>مالک / رزروکننده</small><b>${esc(holders.get(V.id+'|'+u.id)||'—')}</b></div><div class="unit-fact"><small>متراژ</small><b>${F(u.area)} م²</b></div>
      <div class="unit-fact"><small>طبقه</small><b>${esc(u.floor||'—')}</b></div>
      <div class="unit-fact unit-price"><small>قیمت تکمیل‌شده</small><b>${T(u.total||u.totalRaw||0)}</b></div>
      <div class="line-tools">${ops}</div>
    </div>
    <details class="unit-details">
      <summary data-card-primary>مشخصات فنی و قیمت</summary>
      <div class="uc-facts">
        <div><span>کاربری</span><strong>${esc(u.kind||'—')}</strong></div>
        <div><span>خواب</span><strong>${u.rooms?F(u.rooms):'—'}</strong></div>
        <div><span>موقعیت</span><strong>${esc(u.face||'—')}</strong></div>
        <div><span>پارکینگ</span><strong>${esc(unitParkLabel(u))}</strong></div>
        <div><span>انباری</span><strong>${esc(unitStoreLabel(u))}</strong></div>
        <div><span>تحویل</span><strong>${esc(unitHandLabel(u))}</strong></div>
        <div class="span2"><span>خام شرکتی</span><strong>${(num(u.totalRaw)||num(u.ppmRaw))?`${money(u.ppmRaw||0)} /م² — <b class="uc-price">${money(u.totalRaw||0)} تومان</b>`:'—'}</strong></div>
        <div class="span2"><span>تکمیل‌شده</span><strong>${(num(u.total)||num(u.ppm))?`${money(u.ppm||0)} /م² — <b class="uc-price">${money(u.total||0)} تومان</b>`:'—'}</strong></div>
      </div>
    </details>
  </article>`;
}
function toggleUnitExtra(kind,on){
  if(kind==='park'){const w=$('#ue_park_wrap');if(w)w.hidden=!on;if(on&&!$('#ue_parkingCount').value)$('#ue_parkingCount').value='1'}
  if(kind==='store'){['ue_store_c_wrap','ue_store_a_wrap'].forEach(id=>{const w=$('#'+id);if(w)w.hidden=!on});if(on&&!$('#ue_storageCount').value)$('#ue_storageCount').value='1'}
  if(kind==='hand'){/* تاریخ همیشه قابل ثبت است؛ برای آماده هم تاریخ اختیاری می‌ماند */}
}
function setUnitFilter(f){UNIT_FILTER=f;render()}
function pd(){const p=proj(V.id);if(!p)return projV();
 if(UNIT_EDIT&&!p.units.some(u=>u.id===UNIT_EDIT))UNIT_EDIT=null;
 const waiting=S.leads.filter(l=>l.proj===p.id&&(l.stage===2||l.stage===5)).length;
 const n=p.units.length,free=p.units.filter(u=>u.st==='free').length,res=p.units.filter(u=>u.st==='res').length,sold=p.units.filter(u=>u.st==='sold').length;
 const pct=n?Math.round(sold/n*100):0;
 const area=+sum(p.units,u=>+u.area).toFixed(2),val=sum(p.units,u=>u.total),valRaw=sum(p.units,u=>u.totalRaw||0),soldVal=sum(p.units.filter(u=>u.st==='sold'),u=>u.total);
 const avgPpm=area?Math.round(val/area):0;
 const meter=[['sold',sold],['res',res],['free',free]].filter(x=>x[1]).map(([k,v])=>`<i class="m-${k}" style="flex:${v}"></i>`).join('');
 const legend=[['sold','فروخته‌شده',sold],['res','رزرو',res],['free','آزاد',free]].map(([k,l,v])=>`<span class="leg-${k}">${l}<em>${F(v)}</em></span>`).join('');
 const fig=(k,v,big)=>`<dt>${k}</dt><dd${big?' class=big':''}>${v}</dd>`;
 const holders=holderMap();
 const units=p.units.filter(u=>UNIT_FILTER==='all'||u.st===UNIT_FILTER);
 const av=(p.vcName||'؟').trim().charAt(0);
 const filters=[['all','همه'],['free','آزاد'],['res','رزرو'],['sold','فروخته‌شده']];
 return `<div class=pd>
  <div class=pd-bar>
    <button class=btn-ghost onclick="go('proj')">بازگشت ←</button>
    <div class=pd-bar-actions>
      ${can('write')?`<button class=btn-soft onclick="addU()"><span class=plus>+</span> واحد جدید</button>
      ${panelMenu('مدیریت پروژه','<button onclick="editP()">ویرایش مشخصات و حساب</button><button class="x" onclick="delP()">حذف پروژه</button>')}`:''}
    </div>
  </div>

  <article class=file>
    <header class=file-head>
      <div>
        <div class=dossier-k>پرونده پروژه</div>
        <h2>${esc(p.name)}</h2>
        <p class=dossier-addr>${esc(p.addr||'نشانی ثبت نشده')}</p>
        ${p.note?`<p class=dossier-note>${esc(p.note)}</p>`:''}
      </div>
      ${can('write')?`<button class="icon-btn lg" title="ویرایش پروژه" onclick="editP()">✎</button>`:''}
    </header>

    <section class=prog aria-label="وضعیت فروش">
      <div class=prog-top><b>${F(pct)}٪ فروخته‌شده</b><span>${F(sold)} از ${F(n)} واحد</span></div>
      <div class=meter>${meter||'<i class="m-free" style="flex:1;opacity:.25"></i>'}</div>
      <div class=legend>${legend}</div>
    </section>

    <div class=file-cols ${V.tab==='info'?'':'hidden'}>
      <section class=file-sec>
        <h3 class=file-h>مشخصات مالی و متراژ</h3>
        <dl class=fig>
          ${fig('تعداد واحد',F(n))}${fig('حساب پروژه',esc((S.cfg.accounts||[]).find(a=>a.id===p.accountId)?.holder||'تعیین نشده'))}
          ${fig('متراژ کل',`${F(area)}<span class=u>متر مربع</span>`)}
          ${fig('ارزش خام شرکتی',`${money(valRaw)}<span class=u>تومان</span>`)}
          ${fig('ارزش تکمیل‌شده',`${money(val)}<span class=u>تومان</span>`,1)}
          ${fig('ارزش فروخته‌شده',`${money(soldVal)}<span class=u>تومان</span>`,1)}
          ${fig('ارزش باقی‌مانده',`${money(val-soldVal)}<span class=u>تومان</span>`)}
          ${fig('میانگین متری تکمیل‌شده',area?`${money(avgPpm)}<span class=u>تومان</span>`:'—')}
        </dl>
      </section>
      <section class=file-sec>
        <h3 class=file-h>هماهنگی بازدید</h3>
        ${p.vcName?`<div class=coord>
          <div class=av aria-hidden=true>${esc(av)}</div>
          <div>
            <b>${esc(p.vcName)}</b>
            <a class=ph href="tel:${N(p.vcPhone||'')}">${F(p.vcPhone||'—')}</a>
          </div>
        </div>`:`<div class=vc-empty>هنوز مسئول بازدید تعریف نشده است.${can('write')?` <button class="btn-soft sm" onclick="editP()">ثبت مسئول</button>`:''}</div>`}
        <dl class=fig>
          ${fig('راهنمای هماهنگی',esc(p.vcNote||'—'))}
          ${fig('سرنخ در صف بازدید',`${F(waiting)} نفر`)}
          ${fig('نشانی',esc(p.addr||'—'))}
        </dl>
      </section>
    </div>
  </article>

  <nav class="dossier-tabs" aria-label="بخش‌های پروژه"><button aria-pressed="${V.tab!=='info'}" onclick="V.tab='units';render()">واحدها</button><button aria-pressed="${V.tab==='info'}" onclick="V.tab='info';render()">مشخصات و مسئول بازدید</button></nav>
  <section class="units-panel units-panel-list" ${V.tab==='info'?'hidden':''}>
    <div class="u-toolbar">
      <div class="u-toolbar-top">
        <h3>واحدها <span class="count">${F(units.length)}${UNIT_FILTER!=='all'?` از ${F(n)}`:''}</span></h3>
        <div class="unit-filters" role="group" aria-label="فیلتر وضعیت واحد">
          ${filters.map(([k,l])=>{
            const c=k==='all'?n:k==='free'?free:k==='res'?res:sold;
            return `<button type="button" class="${UNIT_FILTER===k?'pri':''}" aria-pressed="${UNIT_FILTER===k}" onclick="setUnitFilter('${k}')">${l}<em>${F(c)}</em></button>`;
          }).join('')}
        </div>
      </div>
      <label class="u-search">
        <span class="u-search-ico" aria-hidden="true"></span>
        <input class="sb" placeholder="جستجوی واحد، بلوک، طبقه، موقعیت…" oninput="filt(this.value)" aria-label="جستجوی واحد">
      </label>
    </div>
    ${units.length?`<div class="unit-stack">${units.map(u=>unitCardHtml(u,holders)).join('')}</div>`:empty(p.units.length?'واحدی با این مشخصات پیدا نشد.':'واحدی تعریف نشده است.')}
  </section>
 </div>`;}
function startUnitEdit(id){UNIT_EDIT=id;UNIT_DUP_HINT=null;render();focusUnitEdit()}
function cancelUnitEdit(){UNIT_EDIT=null;UNIT_DUP_HINT=null;render()}
function dupU(id){
  if(!can('write'))return toast('اجازه ثبت ندارید');
  const p=proj(V.id);if(!p)return;
  const src=p.units.find(x=>x.id===id);if(!src)return;
  const nextNo=suggestUnitNo(p,src);
  const copy=cloneUnitData(src,{no:nextNo});
  const idx=p.units.findIndex(x=>x.id===id);
  p.units.splice(idx<0?p.units.length:idx+1,0,copy);
  UNIT_EDIT=copy.id;
  UNIT_DUP_HINT={id:copy.id,from:src.no,fromBlock:src.block||'',suggested:nextNo};
  save();
  render();
  focusUnitEdit();
  toast(`کپی واحد ${src.no} ساخته شد — شماره را بررسی کنید`);
}
function syncUnitEditTotals(pair,src){
  const area=num($('#ue_area')?.value);
  const ppmEl=$(pair==='raw'?'#ue_ppmRaw':'#ue_ppm');
  const totEl=$(pair==='raw'?'#ue_totalRaw':'#ue_total');
  if(!ppmEl||!totEl)return;
  const ppm=num(ppmEl.value),total=num(totEl.value);
  if(src==='ppm'&&area)totEl.value=F(Math.round(area*ppm).toLocaleString('en'));
  if(src==='total'&&area)ppmEl.value=F(Math.round(total/area).toLocaleString('en'));
}
function readUnitExtraFromForm(v){
  const parking=v.parking==='1'||v.parking===true;
  const storage=v.storage==='1'||v.storage===true;
  const handReady=v.handReady==='1'||v.handReady===true;
  const parkingCount=parking?Math.max(1,num(v.parkingCount)||1):0;
  const storageCount=storage?Math.max(1,num(v.storageCount)||1):0;
  const storageArea=storage?num(v.storageArea):0;
  const handDate=v.handDate?normJ(v.handDate)||'':'';
  return {
    block:(v.block||'').trim(),
    rooms:num(v.rooms),
    face:v.face||'',
    parking,parkingCount,
    storage,storageCount,storageArea,
    handReady,handDate,
  };
}
function saveUnitEdit(id){
  const p=proj(V.id);if(!p)return;const u=p.units.find(x=>x.id==id);if(!u)return;
  const parking=!!$('#ue_parking')?.checked;
  const storage=!!$('#ue_storage')?.checked;
  const fin=pairPrices($('#ue_area')?.value,$('#ue_ppm')?.value,$('#ue_total')?.value);
  const raw=pairPrices($('#ue_area')?.value,$('#ue_ppmRaw')?.value,$('#ue_totalRaw')?.value);
  const next={
    no:($('#ue_no')?.value||'').trim(),
    floor:($('#ue_floor')?.value||'').trim(),
    kind:$('#ue_kind')?.value||u.kind,
    area:num($('#ue_area')?.value),
    ppm:fin.ppm,
    total:fin.total,
    ppmRaw:raw.ppm,
    totalRaw:raw.total,
    ...readUnitExtraFromForm({
      block:$('#ue_block')?.value,
      rooms:$('#ue_rooms')?.value,
      face:$('#ue_face')?.value,
      parking,storage,
      parkingCount:$('#ue_parkingCount')?.value,
      storageCount:$('#ue_storageCount')?.value,
      storageArea:$('#ue_storageArea')?.value,
      handReady:$('#ue_handReady')?.value==='1',
      handDate:$('#ue_handDate')?.value,
    }),
  };
  if(!next.no)return toast('شماره واحد را وارد کنید');
  if(!next.area)return toast('متراژ را وارد کنید');
  if(!unitHasPrice(next))return toast('حداقل یکی از قیمت‌های خام شرکتی یا تکمیل‌شده را وارد کنید');
  if(unitNoConflict(p,next.no,next.block,u.id)){
    return toast(next.block
      ?`شماره واحد «${next.no}» در بلوک «${next.block}» تکراری است`
      :`شماره واحد «${next.no}» تکراری است؛ عوضش کنید`);
  }
  askConfirm({title:'تأیید ذخیره واحد',body:`<p>تغییرات واحد <b>${esc(next.no)}</b> ذخیره شود؟</p><div class=confirm-summary><p>${esc(next.kind)}${next.block?' — بلوک '+esc(next.block):''} — طبقه ${esc(next.floor||'—')} — ${F(next.area)} م²${next.rooms?' — '+F(next.rooms)+' خواب':''}${next.face?' — '+esc(next.face):''}</p><p>پارکینگ: ${esc(unitParkLabel(next))} — انباری: ${esc(unitStoreLabel(next))} — تحویل: ${esc(unitHandLabel(next))}</p><p>${esc(unitPriceSummary(next))}</p></div>`},()=>{
    Object.assign(u,next);UNIT_EDIT=null;UNIT_DUP_HINT=null;save();render();toast('واحد ذخیره شد');return true;
  });
}
function addU(target,done){form('واحد جدید',[
  {k:'no',l:'شماره واحد',r:1},{k:'block',l:'بلوک / فاز'},{k:'floor',l:'طبقه',t:'select',o:UF_FLOOR},{k:'kind',l:'کاربری',t:'select',o:UF_KIND},
  {k:'area',l:'متراژ واحد (متر مربع)',r:1},{k:'rooms',l:'تعداد خواب',t:'select',o:UF_ROOMS},{k:'face',l:'موقعیت واحد',t:'select',o:UF_FACE},
  {k:'ppmRaw',l:'خام شرکتی – قیمت هر متر (تومان)',t:'money'},{k:'totalRaw',l:'خام شرکتی – قیمت کل (تومان)',t:'money'},
  {k:'ppm',l:'تکمیل‌شده – قیمت هر متر (تومان)',t:'money'},{k:'total',l:'تکمیل‌شده – قیمت کل (تومان)',t:'money'},
  {k:'parking',l:'پارکینگ',t:'select',o:UF_YN},{k:'parkingCount',l:'تعداد ماشین (اگر دارد)',t:'select',o:UF_PARK_N,d:'1'},
  {k:'storage',l:'انباری',t:'select',o:UF_YN},{k:'storageCount',l:'تعداد انباری (اگر دارد)',t:'select',o:UF_STORE_N,d:'1'},{k:'storageArea',l:'متراژ انباری (م²)'},
  {k:'handReady',l:'وضعیت تحویل',t:'select',o:UF_HAND},{k:'handDate',l:'تاریخ تکمیل / تحویل',j:1},
],0,v=>{
  const p=target||proj(V.id);if(!p)return false;
  const a=num(v.area);v.area=a;
  const fin=pairPrices(a,v.ppm,v.total);
  const raw=pairPrices(a,v.ppmRaw,v.totalRaw);
  v.ppm=fin.ppm;v.total=fin.total;v.ppmRaw=raw.ppm;v.totalRaw=raw.total;
  if(a<=0){toast('متراژ باید مثبت باشد');return false}
  if(!unitHasPrice(v)){toast('حداقل یکی از قیمت‌های خام شرکتی یا تکمیل‌شده را وارد کنید');return false}
  const extra=readUnitExtraFromForm(v);
  if(unitNoConflict(p,v.no,extra.block)){
    toast(extra.block?`شماره واحد «${v.no}» در بلوک «${extra.block}» تکراری است`:`شماره واحد «${v.no}» تکراری است`);
    return false;
  }
  askConfirm({title:'تأیید ثبت واحد',body:`<p>واحد <b>${esc(v.no)}</b>${extra.block?' — بلوک '+esc(extra.block):''} اضافه شود؟</p><p class=fd>${esc(v.kind)} — ${F(a)} م² — ${esc(unitPriceSummary(v))}</p><p class=fd>پارکینگ ${esc(unitParkLabel(extra))} — انباری ${esc(unitStoreLabel(extra))} — تحویل ${esc(unitHandLabel(extra))}</p>`},()=>{
    p.units.push(cloneUnitData({...v,...extra},{no:v.no,st:'free'}));
    save();render();if(done){done(p.units.at(-1));return false}toast('واحد ثبت شد');return true;
  });
  return false;
})}
function canDeleteRec(){return can('write')||can('admin')}
function delSummary(items){
  const rows=items.filter(x=>x && x.n>0).map(x=>`<li><b>${F(x.n)}</b> ${esc(x.l)}</li>`).join('');
  return rows?`<ul class=del-sum>${rows}</ul><p class=fd style="margin-top:10px">این کار قابل بازگشت نیست.</p>`:'<p class=fd>مورد وابسته‌ای ندارد.</p>';
}
function dropLocalCases(pred){
  WORK=(WORK||[]).filter(c=>!pred(c));
  LEGAL=(LEGAL||[]).filter(c=>!pred(c));
}
async function purgeLinkedCases(refs){
  try{
    const r=await api('/api/workcases/purge',{method:'POST',body:JSON.stringify(refs||{})});
    return r.deleted||0;
  }catch(e){
    if(e.message!=='auth')console.warn('purge cases',e.message);
    return 0;
  }
}
function removeAcctForCustomer(custId){
  const pids=new Set((S.parties||[]).filter(p=>p.custId===custId).map(p=>p.id));
  if(!pids.size)return 0;
  S.parties=(S.parties||[]).filter(p=>p.custId!==custId);
  S.ledger=(S.ledger||[]).filter(r=>!pids.has(r.party));
  S.checks=(S.checks||[]).filter(c=>!pids.has(c.party));
  return pids.size;
}
function removeContractCore(c){
  if(!c)return;
  setSt(c.proj,c.unit,'free');
  S.contracts=S.contracts.filter(x=>x.id!==c.id);
  dropLocalCases(x=>x.contract?.id===c.id);
}
function removeReservationCore(r){
  if(!r)return;
  if(r.st==='active'||r.st==='cancelling')setSt(r.proj,r.unit,'free');
  S.reservations=S.reservations.filter(x=>x.id!==r.id);
  dropLocalCases(x=>x.reservation?.id===r.id);
}
function delU(id){
  if(!canDeleteRec())return toast('اجازه حذف ندارید');
  const p=proj(V.id);if(!p)return;const u=p.units.find(x=>x.id==id);if(!u)return;
  const cs=S.contracts.filter(c=>c.proj===p.id&&c.unit===u.id);
  const rs=S.reservations.filter(r=>r.proj===p.id&&r.unit===u.id);
  askConfirm({
    title:'حذف واحد',
    body:`<p>واحد <b>${esc(u.no)}</b> از پروژه <b>${esc(p.name)}</b> حذف شود؟</p>${delSummary([
      {n:cs.length,l:'قرارداد (واحد آزاد می‌شود)'},
      {n:rs.length,l:'رزرو'},
    ])}`,
    okLabel:'بله، حذف کامل',
    danger:true,
  },async()=>{
    const contractIds=cs.map(c=>c.id),reservationIds=rs.map(r=>r.id);
    cs.forEach(removeContractCore);
    rs.forEach(removeReservationCore);
    p.units=p.units.filter(x=>x.id!=id);
    if(UNIT_EDIT===id)UNIT_EDIT=null;
    if(UNIT_DUP_HINT&&UNIT_DUP_HINT.id===id)UNIT_DUP_HINT=null;
    await purgeLinkedCases({contractIds,reservationIds});
    save();render();toast('واحد و وابستگی‌ها حذف شد');return true;
  });
}
function delP(){
  if(!canDeleteRec())return toast('اجازه حذف ندارید');
  const p=proj(V.id);if(!p)return;
  const cs=S.contracts.filter(c=>c.proj===p.id);
  const rs=S.reservations.filter(r=>r.proj===p.id);
  const ls=S.leads.filter(l=>l.proj===p.id);
  askConfirm({
    title:'حذف کامل پروژه',
    body:`<p>پروژه <b>${esc(p.name)}</b> با همه واحدها و پرونده‌های وابسته حذف شود؟</p>${delSummary([
      {n:(p.units||[]).length,l:'واحد'},
      {n:cs.length,l:'قرارداد'},
      {n:rs.length,l:'رزرو'},
      {n:ls.length,l:'سرنخ (پروژه خالی می‌شود)'},
    ])}`,
    okLabel:'بله، حذف کامل',
    danger:true,
  },async()=>{
    const contractIds=cs.map(c=>c.id),reservationIds=rs.map(r=>r.id);
    cs.forEach(removeContractCore);
    rs.forEach(removeReservationCore);
    S.leads.forEach(l=>{if(l.proj===p.id)l.proj=''});
    dropLocalCases(x=>x.project?.id===p.id);
    S.projects=S.projects.filter(x=>x.id!=p.id);
    UNIT_EDIT=null;
    await purgeLinkedCases({projectIds:[p.id],contractIds,reservationIds});
    save();go('proj');toast('پروژه حذف شد');return true;
  });
}
// مشتریان
const digKey=s=>N(String(s||'')).replace(/[^\d]/g,'');
const refKey=s=>nm(N(String(s||'')));
function findCustByNid(nid,exceptId){
  const k=digKey(nid);if(!k)return null;
  return (S.customers||[]).find(c=>c.id!==exceptId&&digKey(c.nid)===k)||null;
}
function findCustByPhone(phone,exceptId){
  const k=digKey(phone);if(!k)return null;
  return (S.customers||[]).find(c=>c.id!==exceptId&&digKey(c.phone)===k)||null;
}
function findLeadByPhone(phone,exceptId){
  const k=digKey(phone);if(!k)return null;
  return (S.leads||[]).find(l=>l.id!==exceptId&&!l.cust&&digKey(l.phone)===k)||null;
}
function findPayRefHit(ref,except){
  const k=refKey(ref);if(!k)return null;
  for(const r of S.reservations||[]){
    for(const p of r.pays||[]){
      if(except?.kind==='pay'&&except.id===p.id)continue;
      if(p.ref&&refKey(p.ref)===k)return{kind:'رزرو',no:r.no,who:(cust(r.cust)||{}).name||'—'};
    }
  }
  for(const c of S.contracts||[]){
    for(const p of c.doc?.qarzPays||[])if(p.ref&&refKey(p.ref)===k&&!(except?.kind==='qarz'&&except.contract===c.id))return{kind:'ودیعه قرارداد',no:c.no+' / '+F(p.date),who:cust(c.cust).name};
    for(const i of c.inst||[]){
      if(i.parts){
        if(except?.kind==='inst'&&except.id===i.id)continue;
        const part=i.parts.find(p=>p.ref&&refKey(p.ref)===k);
        if(part)return{kind:i.title,no:c.no+' / '+F(part.date),who:part.name};
        continue;
      }
      if(!i.paid||!i.ref)continue;
      if(except?.kind==='inst'&&except.id===i.id)continue;
      if(refKey(i.ref)===k)return{kind:i.title,no:c.no+' / '+F(i.pdate),who:(cust(c.cust)||{}).name||'—'};
    }
  }
  for(const row of S.ledger||[]){
    if(!row.ref)continue;
    if(except?.kind==='ledger'&&except.id===row.id)continue;
    if(refKey(row.ref)===k){
      const p=(S.parties||[]).find(x=>x.id===row.party);
      return{kind:'حسابداری',no:row.desc||'',who:p?.name||'—'};
    }
  }
  return null;
}
function assertCustUniq(v,exceptId){
  const nid=digKey(v.nid),phone=digKey(v.phone);
  if(!nid){toast('کد ملی را وارد کنید');return false}
  if(nid.length<8||nid.length>14){toast('کد ملی معتبر نیست');return false}
  if(!phone){toast('شماره تماس را وارد کنید');return false}
  if(phone.length<8||phone.length>15){toast('شماره تماس معتبر نیست');return false}
  const byNid=findCustByNid(nid,exceptId);
  if(byNid){toast(`کد ملی «${F(nid)}» تکراری است — قبلاً برای مشتری «${byNid.name}» ثبت شده`);return false}
  const byPhone=findCustByPhone(phone,exceptId);
  if(byPhone){toast(`شماره تماس «${F(phone)}» تکراری است — قبلاً برای مشتری «${byPhone.name}» ثبت شده`);return false}
  v.nid=nid;v.phone=phone;if(v.bc!=null)v.bc=digKey(v.bc)||v.bc;
  return true;
}
function assertLeadPhone(phone,exceptId){
  const p=digKey(phone);
  if(!p){toast('شماره تماس را وارد کنید');return null}
  if(p.length<8||p.length>15){toast('شماره تماس معتبر نیست');return null}
  const self=(S.leads||[]).find(l=>l.id===exceptId);
  const lead=(S.leads||[]).find(l=>l.id!==exceptId&&!l.cust&&digKey(l.phone)===p);
  if(lead){toast(`شماره تماس «${F(p)}» تکراری است — قبلاً برای سرنخ «${lead.name}» ثبت شده`);return null}
  // سرنخ تبدیل‌شده می‌تواند همان موبایل مشتری لینک‌شده را نگه دارد
  if(!(self&&self.cust)){
    const cu=findCustByPhone(p);
    if(cu){toast(`شماره تماس «${F(p)}» تکراری است — قبلاً برای مشتری «${cu.name}» ثبت شده`);return null}
  }
  return p;
}
function assertPayRef(ref,except){
  const raw=String(ref||'').trim();
  if(!raw)return true;
  const hit=findPayRefHit(raw,except);
  if(!hit)return true;
  toast(`شماره پیگیری «${F(raw)}» تکراری است — قبلاً در ${hit.kind}${hit.no?' '+hit.no:''}${hit.who?' ('+hit.who+')':''} ثبت شده`);
  return false;
}
const CF=[{k:'name',l:'نام و نام خانوادگی / شرکت',r:1},{k:'father',l:'نام پدر'},{k:'nid',l:'کد ملی / شناسه ملی',r:1},{k:'bc',l:'شماره شناسنامه'},{k:'phone',l:'شماره همراه',r:1},{k:'addr',l:'نشانی',t:'area',w:1}];
const addCu=done=>form('مشتری جدید',CF,0,v=>{
  if(!assertCustUniq(v))return false;
  askConfirm({title:'تأیید ثبت مشتری',body:`<p>مشتری <b>${esc(v.name)}</b> با کد ملی <b>${F(v.nid)}</b> ثبت شود؟</p>`},()=>{
    const customer={id:uid(),...v,kyc:{},notes:[]};S.customers.push(customer);save();render();if(typeof done==='function'){done(customer);return false}toast('مشتری ثبت شد');return true;
  });
  return false;
});
const editCu=id=>form('ویرایش مشتری',CF,cust(id),v=>{
  if(!assertCustUniq(v,id))return false;
  askConfirm({title:'تأیید ذخیره مشتری',body:`<p>تغییرات مشتری <b>${esc(v.name)}</b> ذخیره شود؟</p>`},()=>{
    Object.assign(cust(id),v);save();render();toast('مشتری ذخیره شد');return true;
  });
  return false;
});
function delCu(id){
  if(S.contracts.some(c=>c.owners?.length>1&&c.owners.some(o=>o.customer===id)))return toast('ابتدا سهم این مشتری را در قرارداد مشترک بررسی کنید.');
  if(S.contracts.some(c=>c.cust!==id&&(c.transfers?.some(t=>t.from===id||t.to===id)||c.inst.some(i=>i.parts?.some(p=>p.owner===id)))))return toast('این مشتری در سابقه انتقال یا پرداخت یک قرارداد دیگر ثبت شده است.');
  if(!canDeleteRec())return toast('اجازه حذف ندارید');
  const c=cust(id);if(!c?.id)return;
  const cs=S.contracts.filter(x=>x.cust==id);
  const rs=S.reservations.filter(x=>x.cust==id);
  const ls=S.leads.filter(x=>x.cust==id);
  const parties=(S.parties||[]).filter(p=>p.custId===id);
  const ledgers=parties.length?(S.ledger||[]).filter(r=>parties.some(p=>p.id===r.party)).length:0;
  const checks=parties.length?(S.checks||[]).filter(ch=>parties.some(p=>p.id===ch.party)).length:0;
  askConfirm({
    title:'حذف کامل پرونده مشتری',
    body:`<p>مشتری <b>${esc(c.name)}</b> و همه پرونده‌های وابسته حذف شود؟</p>${delSummary([
      {n:cs.length,l:'قرارداد'},
      {n:rs.length,l:'رزرو'},
      {n:ls.length,l:'پیوند سرنخ (جدا می‌شود)'},
      {n:parties.length,l:'پرونده حسابداری'},
      {n:ledgers,l:'تراکنش دفترکل'},
      {n:checks,l:'چک'},
    ])}`,
    okLabel:'بله، حذف کامل',
    danger:true,
  },async()=>{
    const contractIds=cs.map(x=>x.id),reservationIds=rs.map(x=>x.id);
    cs.forEach(removeContractCore);
    rs.forEach(removeReservationCore);
    S.leads.forEach(l=>{if(l.cust===id)l.cust=''});
    removeAcctForCustomer(id);
    dropLocalCases(x=>x.customer?.id===id);
    S.customers=S.customers.filter(x=>x.id!=id);
    await purgeLinkedCases({customerIds:[id],contractIds,reservationIds});
    save();
    if(V.n==='cv'&&V.id===id)go('cust');else render();
    toast('مشتری و وابستگی‌ها حذف شد');
    return true;
  });
}
// قراردادها
const unitOpts=pre=>S.projects.flatMap(p=>p.units.filter(u=>u.st=='free'||p.id+'|'+u.id==pre).map(u=>[p.id+'|'+u.id,`${p.name} – واحد ${u.no} (${F(u.area)} م²)`]));
function contStatus(c){
  const unpaid=(c.inst||[]).filter(i=>!i.paid);
  if(!unpaid.length)return paidSum(c)>=c.total?{k:'ok',l:'تسویه کامل'}:{k:'warn',l:'در انتظار برنامه پرداخت'};
  const late=unpaid.filter(i=>diff(i.date)<0);
  if(late.length)return{k:'bad',l:F(late.length)+' قسط معوق'};
  const soon=unpaid.filter(i=>diff(i.date)<=7);
  if(soon.length)return{k:'warn',l:'سررسید نزدیک'};
  return{k:'ok',l:'جاری'};
}
function cont(){
  return `<div class=top><div><h2>قراردادها</h2><p class=fd>${F(S.contracts.length)} قرارداد ثبت‌شده</p></div>
    ${can('write')?'<button class=pri onclick="addC()">＋ قرارداد جدید</button>':''}</div>${can('write')?draftList():''}${sb()}
    ${S.contracts.length?'<div class="agreement-cards">'+S.contracts.map(agreementCard).join('')+'</div>':empty('هنوز قراردادی ثبت نشده است.')}`;
}
const INST_EXTRA_PCT=27,INST_PROFIT_PCT=24;
function calcInstPrice(base,extraOn,profitOn,extraPct,profitPct){
  const b=Math.max(0,num(base));
  const ep=extraPct==null?INST_EXTRA_PCT:num(extraPct);
  const pp=profitPct==null?INST_PROFIT_PCT:num(profitPct);
  const extraAmt=extraOn?Math.round(b*ep/100):0;
  const afterExtra=b+extraAmt;
  const profitAmt=profitOn?Math.round(afterExtra*pp/100):0;
  return{base:b,extraOn:!!extraOn,extraPct:ep,extraAmt,afterExtra,profitOn:!!profitOn,profitPct:pp,profitAmt,total:afterExtra+profitAmt};
}
function contractPricePanelHtml(){
  return `<div class=cprice id=cprice>
    <div class=cprice-h>مدل پرداخت اقساطی</div>
    <p class=fd style="margin:0 0 8px">اگر خریدار اقساطی پرداخت می‌کند، هر مورد را جدا تیک بزنید تا به مبلغ اضافه شود.</p>
    <label class=cprice-row>
      <span class=cprice-chk><input type=checkbox name=extraOn> هزینه مازاد اقساطی <b>${F(INST_EXTRA_PCT)}٪</b> از قیمت پایه</span>
      <strong data-extra>اعمال نشده</strong>
    </label>
    <div class=cprice-sub data-after-extra hidden>مبلغ پس از هزینه مازاد: <b></b></div>
    <label class=cprice-row>
      <span class=cprice-chk><input type=checkbox name=profitOn> سود اقساطی <b>${F(INST_PROFIT_PCT)}٪</b> از مبلغ به‌روزشده</span>
      <strong data-profit>اعمال نشده</strong>
    </label>
    <div class=cprice-final>مبلغ نهایی قرارداد <b data-final>۰</b> <span>تومان</span></div>
    <input type=hidden name=total value="">
  </div>`;
}
function syncContractPrice(m){
  if(!m)return null;
  const fm=v=>v?F((+v).toLocaleString('en')).replace(/,/g,'٬'):'';
  const base=num(m.querySelector('[name=base]')?.value);
  const extraOn=!!m.querySelector('[name=extraOn]')?.checked;
  const profitOn=!!m.querySelector('[name=profitOn]')?.checked;
  const r=calcInstPrice(base,extraOn,profitOn);
  const root=m.querySelector('#cprice');
  if(root){
    const ex=root.querySelector('[data-extra]');
    const pr=root.querySelector('[data-profit]');
    const ae=root.querySelector('[data-after-extra]');
    const fin=root.querySelector('[data-final]');
    if(ex)ex.textContent=r.extraOn?`+ ${money(r.extraAmt)} تومان`:'اعمال نشده';
    if(ae){ae.hidden=!r.extraOn;const b=ae.querySelector('b');if(b)b.textContent=`${money(r.afterExtra)} تومان`}
    if(pr)pr.textContent=r.profitOn?`+ ${money(r.profitAmt)} تومان`:'اعمال نشده';
    if(fin)fin.textContent=money(r.total);
  }
  const tot=m.querySelector('[name=total]');
  if(tot)tot.value=fm(r.total);
  syncPayPlan(m);
  return r;
}
function contractPriceSummaryHtml(r){
  if(!r)return '';
  const rows=[`<div><span>قیمت پایه</span><b>${money(r.base)} تومان</b></div>`];
  if(r.extraOn)rows.push(`<div><span>هزینه مازاد ${F(r.extraPct)}٪</span><b>+ ${money(r.extraAmt)} تومان</b></div>`);
  if(r.profitOn)rows.push(`<div><span>سود ${F(r.profitPct)}٪</span><b>+ ${money(r.profitAmt)} تومان</b></div>`);
  rows.push(`<div class=cprice-sum-final><span>مبلغ نهایی</span><b>${money(r.total)} تومان</b></div>`);
  return `<div class=cprice-sum>${rows.join('')}</div>`;
}
function addC(pre){pre=pre||{};
 const firstUnit=pre.unit||'';
 const [fp,fu]=String(firstUnit).split('|');
 const startBase=pre.base!=null?num(pre.base):pre.total!=null&&pre.total!==''?num(pre.total):unitSaleTotal(unitOf(fp,fu));
 const editing=S.contracts.find(c=>c.id===pre.editId);
 form(editing?'ویرایش قرارداد '+esc(editing.no):'قرارداد جدید',[
  section('ملک و خریداران'),
  {k:'project',l:'پروژه',r:1,t:'select',o:[['','انتخاب پروژه'],...S.projects.map(p=>[p.id,p.name])]},
  {k:'unit',l:'واحد',r:1,t:'select',o:unitOpts(pre.unit),on:(m,f)=>{if(f&&pre.total!=null&&pre.total!==''){syncContractPrice(m);return}const[a,b]=m.querySelector('[name=unit]').value.split('|');setM(m,'base',unitSaleTotal(unitOf(a,b)));syncContractPrice(m)}},
  {k:'cust',l:'خریدار',r:1,t:'select',o:[['','انتخاب مشتری'],...S.customers.map(c=>[c.id,c.name+' – '+c.nid])]},
  {t:'html',html:'<div id="ownerArea"></div>'},section('مشخصات قرارداد'),
  {k:'type',l:'نوع قرارداد',t:'select',o:Object.entries(TYPES).map(([k,v])=>[k,v.name])},
  bankField(),{k:'depositLabel',l:'عنوان پرداخت اولیه',t:'select',d:depositDefault,o:[[depositDefault,depositDefault],['قرض‌الحسنه','قرض‌الحسنه']]},
  {k:'date',l:'تاریخ قرارداد',d:todayJ(),r:1,j:1},
  section('قیمت و برنامه پرداخت'),{k:'base',l:'قیمت پایه واحد (تومان)',t:'money',r:1,on:(m)=>syncContractPrice(m)},
  {t:'html',html:'<details class=price-options><summary>هزینه و سود اقساطی (اختیاری)</summary>'+contractPricePanelHtml()+'</details>'},
  {k:'extraOn',t:'check',skipRender:1,on:(m)=>syncContractPrice(m)},
  {k:'profitOn',t:'check',skipRender:1,on:(m)=>syncContractPrice(m)},
  {k:'total',t:'money',skipRender:1,r:1,l:'قیمت تمام‌شده واحد'},
  {t:'html',html:payBreakdownPanelHtml(editing?{existing:true}:{})},
  {k:'down',t:'money',skipRender:1,l:'پیش‌پرداخت',on:m=>syncPayPlan(m)},
  {k:'ddate',j:1,skipRender:1,l:'تاریخ پرداخت پیش‌پرداخت',d:pre.rdate||''},
  {k:'downRef',t:'fa',skipRender:1,l:'شماره پیگیری پرداخت اولیه'},
  {k:'cash',t:'money',skipRender:1,l:'تسویه نقدی',d:0,on:m=>syncPayPlan(m)},
  {k:'cashDate',j:1,skipRender:1,l:'سررسید تسویه نقدی',d:addM(todayJ(),12)},
  {k:'installBudget',skipRender:1,t:'money',l:'سهم اقساط',on:m=>syncPayPlan(m)},
  {k:'count',skipRender:1,l:'تعداد اقساط',d:'0',on:m=>syncPayPlan(m)},
  {k:'first',j:1,skipRender:1,l:'تاریخ اولین قسط',d:addM(todayJ(),1)},
  {k:'step',skipRender:1,l:'فاصله اقساط',d:'1'},
  {k:'latePctDaily',l:'جریمه دیرکرد روزانه (٪ از مبلغ قسط)',d:'0'},
  {k:'dur',l:'مدت قرارداد / تحویل (ماه)',d:'12'},
  {k:'note',l:'توضیحات',t:'area',w:1}
 ],{type:'lease',extraOn:false,profitOn:false,...pre,base:startBase,total:startBase,cash:pre.cash||0,count:pre.count??'0',_boxClass:'box-wide'},v=>{
 const owners=readOwnership(v.cust);if(!owners)return false;
 const price=calcInstPrice(v.base,v.extraOn,v.profitOn);
 v.total=price.total;
 if(!(v.total>0)){toast('قیمت تمام‌شده واحد معتبر نیست');return false}
 const cash=Math.max(0,num(v.cash)),down=Math.max(0,num(v.down));
 const nCount=Math.max(0,parseInt(N(v.count))||0);
 if([v.down,v.cash,v.installBudget].some(x=>x<0)||down+cash+num(v.installBudget)>v.total||nCount>499||!Number.isInteger(num(v.count))||num(v.count)<0||!Number.isSafeInteger(num(v.step))||num(v.step)<1){toast('پیش‌پرداخت، نقدی یا تعداد اقساط معتبر نیست');return false}
 const [selectedProject,selectedUnit]=v.unit.split('|');
 const reservation=pre.resId&&S.reservations.find(r=>r.id===pre.resId);
 if(pre.resId&&(!reservation||reservation.st!=='active'||reservation.proj!==selectedProject||reservation.unit!==selectedUnit||reservation.cust!==v.cust||num(v.down)!==rPaid(reservation))){toast('مشخصات یا وجه رزرو تغییر کرده است؛ تبدیل را از پرونده همان رزرو شروع کنید.');return false}
 if(editing)return updateAgreement(editing,v,owners,price);
 if(!reservation&&unitOf(selectedProject,selectedUnit).st!=='free'){toast('واحد انتخاب‌شده آزاد نیست');return false}
 if(v.down<0||v.cash<0||v.installBudget<0){toast('مبلغ منفی معتبر نیست');return false}
 if(v.down&&v.ddate&&!pre.resId){if(!v.downRef){toast('شماره پیگیری پرداخت اولیه را وارد کنید');return false}if(!assertPayRef(v.downRef))return false}
 if(cash&&!normJ(v.cashDate)){toast('سررسید تسویه نقدی را وارد کنید');return false}
 if(nCount>0&&!normJ(v.first)){toast('تاریخ اولین قسط را انتخاب کنید');return false}
 const[pid,unit]=v.unit.split('|'),rest=num(v.installBudget)||(nCount?Math.max(0,v.total-down-cash):0),n=rest?nCount:0,step=Math.max(1,parseInt(N(v.step))||1),each=n?Math.floor(rest/n):0,inst=[];if(n>rest||n+Number(!!cash)+Number(!!down)>500){toast('تعداد اقساط با مبلغ و سقف ردیف‌ها سازگار نیست');return false};
 if(down){
  const downPaid=!!pre.resId||!!v.ddate;
  const downPdate=pre.rdate||v.ddate||'';
  inst.push({id:uid(),kind:'deposit',title:v.type==='lease'?v.depositLabel:depositDefault,amt:down,date:v.date,paid:downPaid,pdate:downPaid?(downPdate||v.date):'',ref:downPaid&&!pre.resId?v.downRef:'',lateDays:0,lateCalc:0,lateFee:0,lateNote:''});
 }
 for(let i=0;i<n;i++)inst.push({id:uid(),title:'قسط '+F(i+1),amt:i==n-1?rest-each*(n-1):each,date:addM(v.first,i*step),paid:false,pdate:'',ref:'',lateDays:0,lateCalc:0,lateFee:0,lateNote:''});
 if(cash)inst.push({id:uid(),kind:'lump',title:'الباقی نقدی',amt:cash,date:normJ(v.cashDate)||addM(v.first||v.date,Math.max(1,n)*step),paid:false,pdate:'',ref:'',lateDays:0,lateCalc:0,lateFee:0,lateNote:''});
 askConfirm({title:'تأیید ثبت قرارداد',body:`<p>قرارداد برای <b>${esc(cust(v.cust).name)}</b> ثبت شود؟</p>${contractPriceSummaryHtml(price)}<div class=confirm-summary><p>قیمت تمام‌شده: <b>${money(v.total)}</b></p><p>پیش‌پرداخت: <b>${money(down)}</b></p><p>اقساط: <b>${money(rest)}</b>${n?` — ${F(n)} قسط`:''}</p><p>تسویه نقدی: <b>${money(cash)}</b></p></div>`},()=>{
  S.contracts.push({
    id:uid(),no:'ق-'+F(nextSeq('cn')),type:v.type,cust:v.cust,owners,proj:pid,unit,date:v.date,
    total:v.total,installBudget:num(v.installBudget)||undefined,reservationId:pre.resId||'',accountId:v.accountId,doc:bankDoc(v.accountId),depositLabel:v.type==='lease'?v.depositLabel:depositDefault,baseTotal:price.base,
    extraOn:price.extraOn,extraPct:price.extraPct,extraAmt:price.extraAmt,
    profitOn:price.profitOn,profitPct:price.profitPct,profitAmt:price.profitAmt,
    dur:v.dur,note:v.note,latePctDaily:num(v.latePctDaily),autoMode:'all',inst
  });
  if(pre.draftId)S.cfg.drafts=(S.cfg.drafts||[]).filter(d=>d.id!==pre.draftId);
  setSt(pid,unit,'sold');if(pre.resId){const r=S.reservations.find(x=>x.id==pre.resId);r.st='conv';r.pays.forEach(p=>p.s='used');lg(r,'تبدیل به قرارداد؛ وجوه پرداختی در قرارداد مصرف شد')}save();go('cont');toast('قرارداد ثبت شد');return true;
 });return false});dealTools(pre,editing,'contract');syncContractPrice($('#modal'));syncPayPlan($('#modal'))}
function installmentEditForm(c,i){
  const ownPct=i.latePctDaily!=null&&i.latePctDaily!=='';
    return `<article class="ic edit">
      <div class=uc-edit-grid>
        <label class=span2>شرح قسط<input id=ie_title value="${esc(i.title||'')}"></label>
        <label>مبلغ<input id=ie_amt class=fa-num inputmode=numeric lang=fa value="${esc(money(i.amt))}" oninput="fmtIn(this);ensureMoneyWords(this)"><small class=money-words>${esc(moneyWordsHint(i.amt))}</small></label>
        <label>سررسید<input id=ie_date readonly style="cursor:pointer" value="${F(i.date)}" onclick="dpick(this)"></label>
        <label>جریمه دیرکرد روزانه (٪)<input id=ie_latepct inputmode=decimal placeholder="خالی = ${F(c.latePctDaily||0)}٪ قرارداد" value="${ownPct?esc(F(String(i.latePctDaily))):''}"></label>
        <label class=span2 style="display:flex;gap:8px;align-items:center"><input id=ie_lump type=checkbox style="width:auto" ${i.kind==='lump'||(typeof isLumpInst==='function'&&isLumpInst(i))?'checked':''}> الباقی نقدی (بند پایانی ماده ۵ قرارداد اجاره)</label>
      </div>
      <div class=uc-actions>
        <button class=pri onclick="saveInstEdit('${i.id}')">ذخیره قسط</button>
        <button onclick="cancelInstEdit()">انصراف</button>
      </div>
    </article>`;
}
function cd(){
  const c=S.contracts.find(x=>x.id==V.id);if(!c)return cont();
  if(INST_EDIT&&!(c.inst||[]).some(i=>i.id===INST_EDIT))INST_EDIT=null;
  const cu=cust(c.cust),p=paidSum(c),fees=lateSum(c),all=sum(c.inst||[],i=>i.amt),rem=Math.max(0,c.total-p),pct=c.total>0?Math.min(100,Math.round(p/c.total*100)):0;
  const unpaid=(c.inst||[]).filter(i=>!i.paid),late=unpaid.filter(i=>diff(i.date)<0);
  const st=contStatus(c),chip=st.k==='bad'?'late':!unpaid.length?'paid':'next';
  const av=(cu.name||'؟').trim().charAt(0);
  const pr=proj(c.proj),u=unitOf(c.proj,c.unit);
  const fig=(k,v)=>`<dt>${k}</dt><dd>${v}</dd>`;
  const tab=V.tab||'schedule';
  return `<div class=pd>
  <div class=pd-bar>
    <button class=btn-ghost onclick="go('cont')">بازگشت ←</button>
    <div class="pd-bar-actions cd-tools noprint"><details class="action-menu"><summary>اسناد و عملیات قرارداد</summary><div>
      <button class=btn-soft onclick="openDoc('${c.id}','c')">متن قرارداد</button>
      ${c.type==='lease'&&can('write')?`<button class=btn-soft onclick="editLeaseDoc('${c.id}')">تکمیل فیلدهای قرارداد</button>`:''}
      ${c.type==='invest'&&can('write')?`<button class=btn-soft onclick="editInvestDoc('${c.id}')">تکمیل فیلدهای قرارداد</button>`:''}
      <button class=btn-ghost onclick="openDoc('${c.id}','sched')">چاپ جدول اقساط</button>
      <button class=btn-ghost onclick="openDoc('${c.id}','p')">فرم پرداخت</button>
      <button class=btn-ghost onclick="openDoc('${c.id}','dm')">اظهارنامه</button>
      ${canRefer()?`<button class=btn-soft onclick="referContract('${c.id}')">ارجاع سازمانی</button>`:''}
      ${can('write')?`<span class=vr></span>
      <button class=btn-ghost onclick="editC('${c.id}')">ویرایش</button>
      <button class=btn-ghost onclick="regen('${c.id}')">بازسازی اقساط</button>
      <button class=btn-ghost onclick="setDay('${c.id}')">روز ثابت</button>
      <span class=vr></span>
      <button class="btn-ghost danger" onclick="transferContract('${c.id}')">انتقال قرارداد</button><button class="btn-ghost danger" onclick="delC('${c.id}')">حذف</button>`:''}
    </div></details></div>
  </div>

  <article class=file>
    <header class=file-head>
      <div>
        <div class=dossier-k>پرونده قرارداد</div><p class="ownership-line">${esc(ownerText(c))}</p>
        <div class=title-row>
          <h2>${esc(c.no)}</h2>
          <span class="chip ${chip}">${esc(st.l)}</span>
        </div>
        <p class=dossier-addr><b>${esc(cu.name)}</b> — ${esc(pr?.name||'—')} — واحد ${esc(u.no)}<br>${esc(typeName(c.type))} — از ${F(c.date)}${c.dur?` — ${F(c.dur)} ماهه`:''}</p>
        ${c.note?`<p class=dossier-note>${esc(c.note)}</p>`:''}
        ${tab==='info'&&c.type==='lease'&&typeof leaseMissing==='function'&&leaseMissing(c).length?`<p class=warn-line>برای چاپ رسمی هنوز کامل نیست: ${esc(leaseMissing(c).join('، '))}</p>`:''}
        ${tab==='info'&&c.type==='invest'&&typeof investMissing==='function'&&investMissing(c).length?`<p class=warn-line>برای چاپ رسمی هنوز کامل نیست: ${esc(investMissing(c).join('، '))}</p>`:''}
      </div>
      ${can('write')?`<button class="icon-btn lg" title="ویرایش قرارداد" onclick="editC('${c.id}')">✎</button>`:''}
    </header>

    <section class=pay-block aria-label="وضعیت پرداخت">
      <div class=pay-row>
        
        <div><small>پرداخت‌شده</small><b class=ok-txt>${money(p)}<span>تومان</span></b></div>
        <div class=rem><small>مانده</small><b>${money(rem)}<span>تومان</span></b></div>
      </div>
      <div class=pay-meter role=progressbar aria-valuemin=0 aria-valuemax=100 aria-valuenow="${pct}"><i style="width:${pct}%"></i></div>
      <div class=pnote>${F(pct)}٪ از مبلغ قرارداد پرداخت شده است${fees?` — جریمه دیرکرد وصول‌شده ${money(fees)} تومان`:''}</div>
      ${payPlanHtml(c)}
      ${tab==='info'&&(c.extraOn||c.profitOn)?`<div class=cprice-sum style="margin-top:10px">
        <div><span>قیمت پایه</span><b>${money(c.baseTotal||c.total)} تومان</b></div>
        ${c.extraOn?`<div><span>هزینه مازاد ${F(c.extraPct||INST_EXTRA_PCT)}٪</span><b>+ ${money(c.extraAmt||0)} تومان</b></div>`:''}
        ${c.profitOn?`<div><span>سود ${F(c.profitPct||INST_PROFIT_PCT)}٪</span><b>+ ${money(c.profitAmt||0)} تومان</b></div>`:''}
        <div class=cprice-sum-final><span>مبلغ نهایی</span><b>${money(c.total)} تومان</b></div>
      </div>`:''}
      ${Number(c.latePctDaily)?`<p class=fd style="margin:6px 0 0">نرخ پیش‌فرض جریمه دیرکرد: <b>${F(c.latePctDaily)}٪</b> از مبلغ هر قسط به‌ازای هر روز تأخیر</p>`:''}
      ${all!=c.total?`<p class=warn-line>جمع اقساط (${money(all)}) با مبلغ کل قرارداد (${money(c.total)}) برابر نیست.</p>`:''}
    </section>

    <div class=file-cols ${tab!=='info'?'hidden':''}>
      <section class=file-sec>
        <h3 class=file-h>خریدار</h3>
        <div class=coord>
          <div class=av aria-hidden=true>${esc(av)}</div>
          <div>
            <b>${esc(cu.name)}</b>
            <a class=ph href="tel:${N(cu.phone||'')}">${F(cu.phone||'—')}</a>
          </div>
        </div>
        <dl class=fig>
          ${fig('کد ملی',F(cu.nid||'—'))}${c.reservationId&&can('res')?fig('مبدأ پیش‌پرداخت',`<button onclick="go('rd','${c.reservationId}')">ریز واریزهای رزرو</button>`):''}
          ${fig('نام پدر',esc(cu.father||'—'))}
        </dl>
        ${cu.id?`<button class="sm btn-soft" style="margin-top:12px" onclick="go('cv','${cu.id}')">پرونده مشتری</button>`:''}
      </section>
      <section class=file-sec>
        <h3 class=file-h>واحد و اقساط</h3>
        <dl class=fig>
          ${fig('پروژه',esc(pr?.name||'—'))}${fig('حساب مقصد',esc([c.doc?.payBank,c.doc?.payName,c.doc?.payAcct].filter(Boolean).join(' — ')||'تعیین نشده'))}
          ${fig('واحد',esc(u.no||'—')+(u.area?` — ${F(u.area)} م²`:''))}
          ${fig('اقساط باقی‌مانده',F(unpaid.length))}
          ${fig('اقساط معوق',late.length?`<span class="chip late">${F(late.length)}</span>`:F(0))}
        </dl>
      </section>
    </div>
  </article>

  <nav class="dossier-tabs" aria-label="بخش‌های قرارداد">${[['schedule','برنامه اقساط'],['info','مشخصات'],['files','پیوست‌ها'],['history','تاریخچه'],['handover','تحویل']].map(([key,label])=>`<button aria-pressed="${tab===key}" onclick="V.tab='${key}';remember();render()">${label}</button>`).join('')}</nav>
  <section class="units-panel noprint" ${tab!=='schedule'?'hidden':''}>
    <div class=u-head>
      <h3>جدول اقساط <span class=count>${F((c.inst||[]).length)}</span></h3>
      <div class=u-tools>
        ${can('write')?`<div class="bal-mode" role="group" aria-label="محاسبه مانده">
          <button type="button" class="sm ${autoModeOf(c)==='year'?'pri':''}" aria-pressed="${autoModeOf(c)==='year'}" onclick="setAutoMode('${c.id}','year')">مانده سالانه</button>
          <button type="button" class="sm ${autoModeOf(c)==='all'?'pri':''}" aria-pressed="${autoModeOf(c)==='all'}" onclick="setAutoMode('${c.id}','all')">مانده کلی</button>
        </div>
        <button class="btn-soft sm" onclick="yearly('${c.id}')">مبلغ سالانه</button><button class="btn-soft sm" onclick="addI('${c.id}')"><span class=plus>+</span> ردیف جدید</button>`:''}
      </div>
    </div>
    <div class=inst-pad>
      ${tab!=='schedule'?'':(c.inst||[]).length?`<div class=inst-stack>${scheduleHtml(c)}</div>`:empty('هنوز قسطی ثبت نشده است. با «ردیف جدید» یک قسط اضافه کنید.')}
    </div>
  </section>
  ${tab==='files'?filesPanel('contract',c.id):tab==='history'?contractTimeline(c):tab==='handover'?facV(c):''}
 </div>`;
}
const gi=id=>{for(const c of S.contracts){const i=c.inst.find(x=>x.id==id);if(i)return[c,i]}};
function startInstEdit(id){INST_EDIT=id;render();document.querySelector('#ie_title')?.focus()}
function cancelInstEdit(){INST_EDIT=null;render()}
function saveInstEdit(id){
  const pair=gi(id);if(!pair)return;const[c,i]=pair;
  const title=($('#ie_title')?.value||'').trim();
  const amt=num($('#ie_amt')?.value);
  const date=normJ($('#ie_date')?.value||'');
  const lump=!!$('#ie_lump')?.checked;
  const lateRaw=($('#ie_latepct')?.value||'').trim();
  if(!title)return toast('شرح قسط را وارد کنید');
  if(!date)return toast('سررسید معتبر نیست');
  askConfirm({title:'تأیید ذخیره قسط',body:`<p>«${esc(title)}» به مبلغ <b>${money(amt)}</b> و سررسید <b>${F(date)}</b> ذخیره شود؟</p><p class=fd>${esc(moneyWordsHint(amt))}</p>`},()=>{
    if(!(amt>0)){toast('مبلغ قسط باید مثبت باشد');return false}
    const prev=i.amt;
    if(i.paid&&!i.parts)i.parts=receipts(c,i);i.amt=amt;i.date=date;i.kind=lump?'lump':i.kind==='deposit'?'deposit':'';if(i.parts)i.paid=collected(i)>0&&collected(i)>=amt;
    if(lateRaw==='')delete i.latePctDaily;else i.latePctDaily=num(lateRaw);
    if(lump){i.title=/الباقی|نقدی/.test(title)?title:'الباقی نقدی'}
    else{i.title=title==='الباقی نقدی'?'قسط':title}
    if(autoModeOf(c)!=='off'&&!i.paid&&!lump)redist(c,i,prev);
    c.inst.sort((a,b)=>a.date<b.date?-1:1);
    if(c.ed)delete c.ed.c;
    INST_EDIT=null;save();render();toast('قسط ذخیره شد');return true;
  });
}
function setI(id,k,v){const pair=gi(id);if(!pair)return;const[c,i]=pair;if(k=='amt'){const prev=i.amt;i.amt=num(v);if(autoModeOf(c)!=='off'&&!i.paid)redist(c,i,prev)}else if(k=='date'){const d=normJ(v);if(!d)return toast('تاریخ معتبر نیست');i.date=d}else i.title=v;c.inst.sort((a,b)=>a.date<b.date?-1:1);save();render()}
const pay=id=>payEditor(id);
const editPay=id=>payEditor(id);
const unpay=id=>{askConfirm({title:'لغو پرداخت',body:'وضعیت این قسط به پرداخت‌نشده برگردد و جریمه ثبت‌شده پاک شود؟',okLabel:'بله، لغو شود',danger:true},()=>{const pair=gi(id);if(!pair)return false;pair[1].paid=false;pair[1].pdate='';pair[1].ref='';clearLateFields(pair[1]);save();render();return true})};
const delI=id=>{const pair=gi(id);if(!pair)return;askConfirm({title:'حذف قسط',body:`<p>ردیف «${esc(pair[1].title||'قسط')}» حذف شود؟</p>`,okLabel:'بله، حذف شود',danger:true},()=>{pair[0].inst=pair[0].inst.filter(i=>i.id!=id);if(INST_EDIT===id)INST_EDIT=null;save();render();return true})};
const addI=cid=>{const c=S.contracts.find(x=>x.id==cid);if(!c)return;c.inst.push({id:uid(),title:'ردیف جدید',amt:0,date:todayJ(),paid:false,pdate:'',ref:'',lateDays:0,lateCalc:0,lateFee:0,lateNote:''});INST_EDIT=c.inst[c.inst.length-1].id;save();render()};
function delC(id){
  if(!canDeleteRec())return toast('اجازه حذف ندارید');
  const c=S.contracts.find(x=>x.id==id);if(!c)return;
  const caseN=[...WORK,...LEGAL].filter((x,i,a)=>x.contract?.id===id&&a.findIndex(y=>y.id===x.id)===i).length;
  askConfirm({
    title:'حذف کامل قرارداد',
    body:`<p>قرارداد <b>${esc(c.no)}</b> مربوط به <b>${esc(cust(c.cust).name)}</b> حذف شود و واحد آزاد گردد؟</p>${delSummary([
      {n:(c.inst||[]).length,l:'قسط'},
      {n:caseN,l:'ارجاع سازمانی / حقوقی'},
      {n:1,l:'بازگشت واحد به آزاد'},
    ])}`,
    okLabel:'بله، حذف کامل',
    danger:true,
  },async()=>{
    removeContractCore(c);
    await purgeLinkedCases({contractIds:[id]});
    save();go('cont');toast('قرارداد حذف شد');return true;
  });
}
function delR(id){
  if(!canDeleteRec())return toast('اجازه حذف ندارید');
  const r=S.reservations.find(x=>x.id==id);if(!r)return;
  askConfirm({
    title:'حذف کامل رزرو',
    body:`<p>رزرو <b>${esc(r.no)}</b> برای <b>${esc(cust(r.cust).name)}</b> حذف شود؟</p>${delSummary([
      {n:(r.pays||[]).length,l:'پرداخت رزرو'},
      {n:(r.st==='active'||r.st==='cancelling')?1:0,l:'آزاد شدن واحد'},
    ])}`,
    okLabel:'بله، حذف کامل',
    danger:true,
  },async()=>{
    removeReservationCore(r);
    await purgeLinkedCases({reservationIds:[id]});
    save();
    if(V.n==='rd')go('res');else render();
    toast('رزرو حذف شد');return true;
  });
}
function delLead(id){
  if(!canDeleteRec())return toast('اجازه حذف ندارید');
  const l=S.leads.find(x=>x.id==id);if(!l)return;
  askConfirm({
    title:'حذف سرنخ',
    body:`<p>سرنخ <b>${esc(l.name)}</b> و سابقه مراحلش حذف شود؟</p>${l.cust?`<p class=fd>پیوند به مشتری حفظ می‌ماند و فقط خود سرنخ پاک می‌شود.</p>`:''}`,
    okLabel:'بله، حذف شود',
    danger:true,
  },()=>{
    S.leads=S.leads.filter(x=>x.id!=id);
    delete LEAD_DRAFT[id];
    save();
    if(V.n==='lv')go('lead');else render();
    toast('سرنخ حذف شد');return true;
  });
}
async function delWorkCase(id,back){
  if(!canDeleteRec()&&!canInbox())return toast('اجازه حذف ندارید');
  const c=WORK.find(x=>x.id===id)||LEGAL.find(x=>x.id===id);
  askConfirm({
    title:'حذف ارجاع',
    body:`<p>ارجاع «${esc(c?.title||c?.customer?.name||id)}» برای همیشه حذف شود؟</p>`,
    okLabel:'بله، حذف شود',
    danger:true,
  },async()=>{
    try{
      await api('/api/workcases/'+id,{method:'DELETE'});
      dropLocalCases(x=>x.id===id);
      toast('ارجاع حذف شد');
      go(back||'inbox');
      return true;
    }catch(e){
      if(e.message!=='auth')toast(e.message);
      return false;
    }
  });
}
// رزرو
const CS=['درخواست لغو','تأیید لغو','محاسبه مبلغ استرداد','صدور چک/حواله','تحویل مدارک','تحویل چک/وجه','تسویه نهایی'],PS={ok:'تأییدشده',used:'مصرف‌شده در قرارداد',ref:'مسترد شد',closed:'تسویه و مختومه'},RS={active:'فعال',cancelling:'در حال لغو',cancel:'لغو و تسویه‌شده',conv:'تبدیل به قرارداد'};
const allPays=()=>[...S.reservations.flatMap(r=>r.pays.map(p=>({...p,r}))),...S.contracts.flatMap(c=>c.inst.flatMap(i=>receipts(c,i).map(p=>({...p,c,title:i.title})))),...(S.ledger||[]).filter(r=>r.ref).map(r=>({ref:r.ref,ledger:r}))];
const dupRef=(x,except)=>!!findPayRefHit(x,except);
const lg=(r,t,by)=>(r.log=r.log||[]).push({d:todayJ(),h:new Date().toTimeString().slice(0,5),by:by||S.me||'—',t});
const rPaid=r=>sum(r.pays,p=>p.amt),RF=()=>S.cfg.fine||30000000,RD=()=>S.cfg.days||20;
const PF=[{k:'payer',l:'نام صاحب حساب مبدأ (پرداخت‌کننده)',r:1,on:(m,f)=>{if(f){const e=m.querySelector('[name=cust]');if(e)m.querySelector('[name=payer]').value=cust(e.value).name}}},{k:'acct',l:'شماره حساب/کارت مبدأ',r:1},{k:'ref',l:'شماره پیگیری / فیش',r:1},{k:'rel',l:'رابطه با مشتری (فقط پرداخت شخص ثالث)'},{k:'appv',l:'تأییدکننده مدیریتی (فقط شخص ثالث)'}];
function mkPay(v,c,existing){if(!(v.amt>0)){toast('مبلغ واریز باید مثبت باشد');return}if(!assertPayRef(v.ref,existing?{kind:'pay',id:existing.id}:null))return;
 const tp=nm(v.payer)!=nm(c.name);if(tp&&(!v.rel||!v.appv)){toast('پرداخت‌کننده با مشتری یکی نیست؛ رابطه و تأییدکننده مدیریتی را ثبت کنید');return}
 return{id:existing?.id||'پ-'+F(S.pn=(S.pn||1000)+1),amt:v.amt,date:v.date||v.pdate,ref:v.ref,acct:v.acct,payer:v.payer,tp,rel:v.rel,appv:v.appv,s:'ok'}}

const payR=id=>{const r=S.reservations.find(x=>x.id==id);form('پرداخت جدید رزرو',[{k:'amt',l:'مبلغ (تومان)',t:'money',r:1},{k:'date',l:'تاریخ',d:todayJ(),j:1,r:1},...PF,{k:'by',l:'ثبت‌کننده',r:1,d:S.me||''}],{payer:cust(r.cust).name},v=>{const p=mkPay(v,cust(r.cust));if(!p)return false;S.me=v.by;r.pays.push(p);lg(r,`پرداخت ${p.id} به مبلغ ${T(p.amt)} ثبت شد (فیش ${F(p.ref)})`,v.by);save();render()})};
const cancelR=id=>{const r=S.reservations.find(x=>x.id==id);form('ثبت درخواست لغو رزرو',[{k:'reason',l:'علت لغو',t:'area',w:1,r:1},{k:'date',l:'تاریخ درخواست',d:todayJ(),j:1,r:1},{k:'fine',l:'مبلغ کسر بابت لغو (قابل تنظیم)',t:'money',d:r.fine||RF()},{k:'by',l:'ثبت‌کننده',r:1,d:S.me||''}],0,v=>{const paid=rPaid(r);r.st='cancelling';r.fine=v.fine;r.cancel={reason:v.reason,date:v.date,fine:v.fine,refund:Math.max(0,paid-v.fine),h:[{s:0,d:v.date,by:v.by,doc:''}]};S.me=v.by;lg(r,`درخواست لغو ثبت شد (واحد تا تسویه نهایی قفل می‌ماند). علت: ${v.reason}. پرداختی ${T(paid)}، کسر ${T(v.fine)}، قابل استرداد ${T(r.cancel.refund)}`,v.by);save();render()})};
function nextC(id){const r=S.reservations.find(x=>x.id==id),k=r.cancel.h.length,need=k==3||k==5;form('مرحله: '+CS[k],[{k:'date',l:'تاریخ انجام',d:todayJ(),j:1,r:1},{k:'doc',l:need?'شماره چک / حواله / سند':'شماره سند (اختیاری)',r:need},{k:'by',l:'انجام‌دهنده',r:1,d:S.me||''}],0,v=>{r.cancel.h.push({s:k,d:v.date,by:v.by,doc:v.doc});S.me=v.by;lg(r,`مرحله «${CS[k]}» انجام شد${v.doc?' – سند '+F(v.doc):''}`,v.by);if(k==5)r.pays.forEach(p=>p.s='ref');if(k==CS.length-1){r.st='cancel';r.pays.forEach(p=>p.s='closed');setSt(r.proj,r.unit,'free');lg(r,'تسویه نهایی؛ پرونده مختومه و واحد آزاد شد',v.by)}save();render()})}
const toC=id=>{const r=S.reservations.find(x=>x.id==id);addC({cust:r.cust,cash:r.plannedCash||0,installBudget:r.plannedInstallments||'',unit:r.proj+'|'+r.unit,total:r.doc?.total||unitSaleTotal(unitOf(r.proj,r.unit)),down:rPaid(r),resId:id,rdate:r.pays.at(-1)?.date||r.date})};
const cfgR=()=>form('تنظیمات رویه رزرو',[{k:'fine',l:'مبلغ کسر پیش‌فرض لغو (تومان)',t:'money',d:RF()},{k:'days',l:'مهلت پیش‌فرض تکمیل وجه (روز)',d:String(RD())}],0,v=>{S.cfg={...S.cfg,fine:v.fine,days:parseInt(N(v.days))||20};save();toast('تنظیمات ذخیره شد')});
const chkF=()=>form('استعلام فیش / پرداخت',[{k:'ref',l:'شماره فیش، پیگیری یا شناسه پرداخت',r:1}],0,v=>{
  const q=refKey(v.ref);
  const hit=findPayRefHit(v.ref);
  const h=allPays().filter(p=>refKey(p.ref||'')==q||refKey(p.id||'')==q);
  const lines=h.length?h.map(p=>{
    if(p.r)return `<p>پرداخت ${p.id||''} (${T(p.amt)}) – ${esc(cust(p.r.cust).name)} – ${p.r.no} – ${esc(unitTxt(p.r.proj,p.r.unit))} – ${PS[p.s]||'تأییدشده'} – رزرو: ${RS[p.r.st]}</p>`;
    if(p.c)return `<p>قبلاً بابت «${esc(p.title)}» قرارداد ${esc(p.c.no)} — ${F(p.date)} — ${T(p.amt)} (${esc(p.name||cust(p.c.cust).name)}) ثبت شده است.</p>`;
    if(p.ledger)return `<p>قبلاً در حسابداری ثبت شده است${p.ledger.desc?' – '+esc(p.ledger.desc):''} (${T(p.ledger.amt||0)}).</p>`;
    return '';
  }).join(''):(hit?`<p class=warn-line>شماره پیگیری تکراری است — قبلاً در ${esc(hit.kind)}${hit.no?' '+esc(hit.no):''}${hit.who?' ('+esc(hit.who)+')':''} ثبت شده.</p>`:'<p>این شماره تاکنون در سامانه ثبت نشده است.</p>');
  $('#modal').innerHTML=`<div class=box><h3 style="margin-top:0">نتیجه استعلام</h3>${lines}<div class=act><button onclick=closeM()>بستن</button></div></div>`;
  return false;
});
function msgs(id){const r=S.reservations.find(x=>x.id==id),c=cust(r.cust),u=unitTxt(r.proj,r.unit),p=rPaid(r),k=r.cancel||{fine:r.fine,refund:0},n=c.name,L=[['تأیید ثبت رزرو',`${n} عزیز، سلام و احترام.\nرزرو ${u} با دریافت ${T(p)} ثبت شد و واحد تا تاریخ ${F(r.deadline)} به نام شما نگه‌داری می‌شود. از اعتماد شما سپاسگزاریم و در تمام مراحل در کنار شما هستیم.\n${COMPANY}`],['یادآوری مهلت تکمیل وجه',`${n} عزیز، سلام و وقت بخیر.\nبه‌عنوان یادآوری دوستانه، مهلت تکمیل وجه رزرو ${u} تا تاریخ ${F(r.deadline)} است و مانده مبلغ ${T(Math.max(0,r.need-p))} می‌باشد. اگر برای هماهنگی یا تمدید مهلت نیاز به راهنمایی دارید، همکاران ما آماده‌اند.\n${COMPANY}`],['اطلاع‌رسانی لغو رزرو',`${n} عزیز، سلام و احترام.\nدرخواست لغو رزرو ${u} ثبت شد و شرایط شما را به‌خوبی درک می‌کنیم. طبق رزرونامه، از مبلغ پرداختی ${T(p)}، مبلغ ${T(k.fine)} کسر و ${T(k.refund)} به شما مسترد خواهد شد. مراحل تسویه طبق روال شرکت پیگیری می‌شود و از هر مرحله به شما اطلاع می‌دهیم.\n${COMPANY}`],['آماده بودن چک/وجه استرداد',`${n} عزیز، سلام و وقت بخیر.\nمبلغ استرداد رزرو ${u} آماده تحویل است. لطفاً با همراه داشتن مدارک لازم به دفتر مراجعه فرمایید تا مراحل تسویه نهایی انجام شود.\n${COMPANY}`]];
 $('#modal').innerHTML=`<div class=box><h3 style="margin-top:0">پیام‌های آماده – ${esc(n)}</h3>${L.map((m,i)=>`<label>${m[0]}<textarea rows=5 id=m${i}>${esc(m[1])}</textarea></label><button class=sm onclick="cp(${i})">کپی</button><hr>`).join('')}<div class=act><a class=ph href="tel:${N(c.phone||'')}">☎ ${F(c.phone||'')}</a><button onclick=closeM()>بستن</button></div></div>`;openM()}
const cp=i=>{const t=$('#m'+i);t.select();try{navigator.clipboard.writeText(t.value)}catch(e){document.execCommand('copy')}toast('کپی شد')};
function rd(){const r=S.reservations.find(x=>x.id==V.id);if(!r)return res();const c=cust(r.cust),pd=rPaid(r),rem=Math.max(0,r.need-pd),d=diff(r.deadline),a=r.st=='active',k=r.cancel,cur=k?k.h.length:0;
 return `<section class="record-page reserve-record" dir="rtl"><div class=top><h2>پرونده رزرو ${r.no}</h2><div class=noprint><button onclick="go('res')">بازگشت</button> ${a&&can('write')?`<button class="pri" onclick="payR('${r.id}')">ثبت پرداخت</button>`: ''} <details class="record-menu"><summary>اقدام‌های پرونده</summary><div><button onclick="msgs('${r.id}')">پیام‌های آماده</button> <button onclick="openDoc('${r.id}','res')">رزرونامه (چاپ)</button>${a&&can('write')?` <button onclick="addR({editId:'${r.id}'})">ویرایش رزرو</button> <button class=pri onclick="toC('${r.id}')">تبدیل به قرارداد</button> <button class=x onclick="cancelR('${r.id}')">درخواست لغو</button>`:''}${canDeleteRec()?` <button class="btn-ghost danger" onclick="delR('${r.id}')">حذف کامل</button>`:''}</div></details></div></div>
 <header class="record-head"><span class="record-kind">رزروکننده</span><h2>${esc(c.name)}</h2><span class="badge ${a?'warn':''}">${RS[r.st]}</span></header>
 <section class="record-overview"><dl>${recordFacts([['ملک',unitTxt(r.proj,r.unit)],['شماره تماس',c.phone],['مهلت تکمیل وجه',r.deadline],['مانده تا تکمیل',T(rem)]])}</dl>${a&&d<0&&rem>0?`<p class="bad-txt">${F(-d)} روز از مهلت تکمیل وجه گذشته است</p>`:''}</section>
 <details class="record-fold"><summary>توافق مالی و مشخصات ثبت</summary>${financialSummary(r.doc?.total??unitSaleTotal(unitOf(r.proj,r.unit)),[['پیش‌پرداخت توافقی',r.need],['نقدی',r.plannedCash],['اقساط',r.plannedInstallments]])}<dl>${recordFacts([['پرداخت‌شده',T(pd)],['ثبت‌کننده',r.by],['تأییدکننده',r.appr],['تاریخ ثبت',r.date]])}</dl></details>
 ${k?`<h3>فرآیند لغو و استرداد</h3><div class=st style="margin-bottom:10px">علت: ${esc(k.reason)}<br>پرداختی ${T(pd)} − کسر ${T(k.fine)} = <b>قابل استرداد ${T(k.refund)}</b></div><div class=fcs>${CS.map((s,i)=>{const h=k.h[i];return `<div class="fc ${h?'okish':i==cur?'today':''}"><b>${F(i+1)} — ${s}</b><span class=fd>${h?F(h.d)+' – '+esc(h.by)+(h.doc?' – سند '+F(h.doc):''):i==cur?'مرحله جاری':'در انتظار'}</span></div>`}).join('')}</div>${r.st=='cancelling'?`<button class="pri noprint" onclick="nextC('${r.id}')">انجام مرحله: ${CS[cur]}</button>`:''}`:''}
 <details class="record-fold"><summary>پرداخت‌های ثبت‌شده <span>${F(r.pays.length)}</span></summary>${tbl(['شناسه یکتا','تاریخ','مبلغ','پرداخت‌کننده (صاحب حساب)','حساب مبدأ','فیش / پیگیری','وضعیت'],r.pays.map((p,idx)=>`<tr><td>${esc(p.id||'—')}</td><td>${F(p.date)}</td><td>${money(p.amt)}</td><td>${esc(p.payer||'—')}${p.tp?` <span class="badge warn">شخص ثالث – ${esc(p.rel||'')} – تأیید: ${esc(p.appv||'')}</span>`:''}</td><td>${F(p.acct||'—')}</td><td>${F(p.ref||'—')}</td><td><span class="badge ${p.s=='closed'?'':'ok'}">${PS[p.s]||'تأییدشده'}</span> ${a&&can('write')?`<button class='sm' onclick="editReservationPayment('${r.id}',${idx})">ویرایش</button>`:''}</td></tr>`).join(''))}
 </details><details class="record-fold"><summary>تاریخچه پرونده</summary>${tbl(['تاریخ','ساعت','کاربر','رویداد'],(r.log||[]).map(l=>`<tr><td>${F(l.d)}</td><td>${F(l.h)}</td><td>${esc(l.by)}</td><td style="white-space:normal">${esc(l.t)}</td></tr>`).join('')||'<tr><td colspan=4>—</td></tr>')}</details></section>`}
// سرنخ‌ها و قیف فروش
const LS=['جذب (آگهی/تماس)','هدایت به کانال اطلاع‌رسانی','درخواست بازدید','بازدید انجام شد','جلسه با مسئول فروش','بازدید مجدد','تصمیم به خرید','رزرو','قرارداد','لغو / از دست رفته'],SRC=['دیوار','تلفن ثابت شرکت','موبایل','ایتا','بله','تلگرام','معرفی','سایر'];
const VISIT_STAGES=new Set([2,5]);
const lf=()=>[{k:'name',l:'نام مشتری',r:1},{k:'phone',l:'شماره تماس',r:1},{k:'src',l:'منبع جذب',t:'select',o:SRC.map(x=>[x,x])},{k:'proj',l:'پروژه موردعلاقه',t:'select',o:[['','—'],...S.projects.map(p=>[p.id,p.name+(p.vcName?' – بازدید: '+p.vcName:'')])]},{k:'stage',l:'مرحله',t:'select',o:LS.map((s,i)=>[i,s])},{k:'rep',l:'مسئول فروش',d:S.me||ME.name||''},{k:'next',l:'تاریخ پیگیری بعدی',j:1},{k:'loan',l:'نیاز به تسهیلات',t:'select',o:[['no','خیر'],['yes','بله']]},{k:'note',l:'یادداشت',t:'area',w:1}];
function vcOf(pid){const p=proj(pid)||{};return{name:p.vcName||'',phone:p.vcPhone||'',note:p.vcNote||'',pname:p.name||'—'}}
function pushLeadHist(l,{from,to,note='',kind='stage',vcName='',vcPhone='',visitAt=''}){
  l.h=l.h||[];
  l.h.push({id:uid(),d:todayJ(),h:nowH(),by:actor(),from:from??l.stage,s:to,note,kind,vcName,vcPhone,visitAt});
}
function applyVisitAssign(l){
  const vc=vcOf(l.proj);
  l.vcName=vc.name;l.vcPhone=vc.phone;
  if(!l.visitAt)l.visitAt='';
  return vc;
}
function leadHistKindLabel(kind){
  return({create:'ثبت سرنخ',visit_done:'انجام بازدید',visit_assign:'تخصیص هماهنگی بازدید',stage:'انتقال مرحله',edit:'ویرایش مشخصات',cust:'تبدیل به مشتری'}[kind])||'رویداد';
}
function leadHistHtml(l){
  const rows=[...(l.h||[])].slice().reverse();
  if(!rows.length)return '<div class="empty soft">هنوز سابقه‌ای ثبت نشده است.</div>';
  return `<ol class=timeline>${rows.map(ev=>{
    const from=ev.from!=null?LS[ev.from]:null,to=LS[ev.s]!=null?LS[ev.s]:(ev.s!=null?'مرحله '+ev.s:null);
    const moved=from!=null&&to!=null&&from!==to;
    return `<li class=tl-item>
      <div class=tl-dot></div>
      <div class=tl-card>
        <div class=tl-top>
          <strong>${esc(ev.kind==='stage'&&from&&from===to?'ثبت پیگیری':leadHistKindLabel(ev.kind))}</strong>
          <time class=tl-when>${F(ev.d||'—')}${ev.h?` — ساعت ${F(ev.h)}`:''}</time>
        </div>
        ${moved?`<div class=tl-flow><span>${esc(from)}</span><span class=tl-arrow>←</span><span class=on>${esc(to)}</span></div>`
          :(to?`<div class=tl-flow><span class=on>${esc(to)}</span></div>`:'')}
        ${ev.vcName?`<div class=fd>هماهنگ‌کننده: ${esc(ev.vcName)}${ev.vcPhone?' — '+F(ev.vcPhone):''}</div>`:''}
        ${ev.visitAt?`<div class=fd>زمان بازدید: ${F(ev.visitAt)}</div>`:''}
        ${ev.note?`<p class=tl-note>${esc(ev.note)}</p>`:''}
        <div class=tl-by>توسط <b>${esc(ev.by||'—')}</b></div>
      </div>
    </li>`;
  }).join('')}</ol>`;
}
function showLeadHist(id){
  const l=S.leads.find(x=>x.id==id);if(!l)return;
  const m=$('#modal');
  m.innerHTML=`<div class="box hist-box">
    <h3 style="margin-top:0">تاریخچه سرنخ</h3>
    <p class=fd style="margin:0 0 12px"><b>${esc(l.name)}</b> — ${F(l.phone)} — الان در «${esc(LS[l.stage]||'—')}»</p>
    <div class=hist-scroll>${leadHistHtml(l)}</div>
    <div class=act>
      <button type=button class=pri onclick="closeM();go('lv','${l.id}')">پرونده کامل</button>
      <button type=button onclick="closeM()">بستن</button>
    </div>
  </div>`;
  m.classList.add('on');
}
function leadPipeHtml(l,sel){
  return can('write')?`<label class="stage-select">مرحله پیگیری<select onchange="pickLeadStage('${l.id}',Number(this.value))">${LS.map((name,i)=>`<option value="${i}" ${i===sel?'selected':''}>${esc(name)}</option>`).join('')}</select></label>`:'';
}
function leadCardHtml(l){
  const project=proj(l.proj)?.name,write=can('write')||can('admin');
  const name=l.name||'سرنخ',initials=name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('‌');
  const due=l.next&&diff(l.next);
  return `<article class="lb-card prospect-entry" dir="rtl" data-id="${l.id}" data-stage="${l.stage}" ${write?'draggable=true ondragstart="leadDragStart(event)" ondragend="leadDragEnd(event)"':''} onclick="leadCardClick(event,'${l.id}')">
    <div class="prospect-person"><span class="prospect-initials" aria-hidden="true">${esc(initials)}</span><div><button class="row-title" onclick="go('lv','${l.id}')">${esc(name)}</button>${l.phone?`<a class="prospect-phone" dir="ltr" href="tel:${esc(N(l.phone))}">${esc(F(l.phone))}</a>`:''}</div></div>
    <div class="prospect-fields">${[[project,'پروژه'],[l.rep,'مسئول پیگیری']].filter(([v])=>v).map(([v,k])=>`<div><small>${k}</small><b>${esc(v)}</b></div>`).join('')}</div>
    <div class="prospect-next">${l.next?`<time class="${due<0?'overdue':''}">${uiIcon('clock')}${due===0?'پیگیری امروز':F(l.next)}</time>`:''}${write&&+l.stage===2?`<button class="sm" onclick="markVisitDone('${l.id}')">ثبت بازدید</button>`:''}</div></article>`;

}
function leadCardClick(e,id){
  if(e.target.closest('a,button,.lb-grip'))return;
  if(LEAD_DND.dirty){LEAD_DND.dirty=false;return}
  go('lv',id);
}
function leadDragStart(e){
  if(!can('write')&&!can('admin')){e.preventDefault();return}
  const card=e.currentTarget;
  LEAD_DND={id:card.dataset.id,from:+card.dataset.stage,dirty:false};
  e.dataTransfer.setData('text/plain',card.dataset.id);
  e.dataTransfer.effectAllowed='move';
  card.classList.add('dragging');
  document.body.classList.add('lead-dnd');
}
function leadDragEnd(){
  document.querySelectorAll('.lb-col.drop-on,.lb-body.drop-on').forEach(el=>el.classList.remove('drop-on'));
  document.querySelectorAll('.lb-card.dragging').forEach(el=>el.classList.remove('dragging'));
  document.body.classList.remove('lead-dnd');
  setTimeout(()=>{LEAD_DND.dirty=false},0);
}
function leadDragOver(e){
  if(!LEAD_DND.id)return;
  e.preventDefault();
  e.dataTransfer.dropEffect='move';
  const col=e.currentTarget.closest('.lb-col');
  if(col)col.classList.add('drop-on');
  e.currentTarget.classList.add('drop-on');
}
function leadDragLeave(e){
  const col=e.currentTarget.closest('.lb-col');
  if(col&&!col.contains(e.relatedTarget))col.classList.remove('drop-on');
  e.currentTarget.classList.remove('drop-on');
}
function leadDrop(e){
  e.preventDefault();
  const col=e.currentTarget.closest('.lb-col')||e.currentTarget;
  col.classList.remove('drop-on');
  e.currentTarget.classList.remove('drop-on');
  const to=+(col.dataset.stage);
  const id=LEAD_DND.id||e.dataTransfer.getData('text/plain');
  if(!id||Number.isNaN(to))return;
  const l=S.leads.find(x=>x.id==id);if(!l)return;
  if(+l.stage===to){toast('سرنخ همین الان در این مرحله است');return}
  LEAD_DND.dirty=true;
  moveLeadToStage(id,to);
}
function moveLeadToStage(id,to){
  if(!can('write')&&!can('admin'))return toast('اجازه ویرایش ندارید');
  const l=S.leads.find(x=>x.id==id);if(!l)return;
  to=+to;const from=+l.stage;
  if(to===from)return;
  if(VISIT_STAGES.has(to)&&!l.proj){toast('برای مرحله بازدید، ابتدا پروژه سرنخ را مشخص کنید');return}
  if(VISIT_STAGES.has(to)){
    const vc=vcOf(l.proj);
    if(!vc.name||!vc.phone){toast('برای این پروژه مسئول هماهنگی بازدید تعریف نشده؛ ابتدا در پروژه ثبت کنید');return}
  }
  const vc=VISIT_STAGES.has(to)?vcOf(l.proj):{name:l.vcName||'',phone:l.vcPhone||''};
  const body=`<div class=confirm-summary>
    <p>سرنخ: <b>${esc(l.name)}</b> – ${F(l.phone)}</p>
    <p>انتقال مرحله:</p>
    <p><span class=tag>${esc(LS[from])}</span> <span class=tl-arrow>←</span> <span class="tag okish">${esc(LS[to])}</span></p>
    ${VISIT_STAGES.has(to)?`<p class=visit-line>هماهنگی بازدید با: <b>${esc(vc.name)}</b> ☎ ${F(vc.phone)}</p>
      <label>تاریخ بازدید (اختیاری)<input id=mvVisit readonly style="cursor:pointer" value="${l.visitAt?F(l.visitAt):''}" placeholder="انتخاب تاریخ" onclick="dpick(this)"></label>`:''}
    <label>یادداشت انتقال<textarea id=mvNote rows=3 placeholder="دلیل انتقال یا نتیجه پیگیری…">${esc(LEAD_DRAFT[id]?.note||'')}</textarea></label>
    <p class=fd>پس از تأیید، تاریخ و ساعت و نام شما در تاریخچه ثبت می‌شود.</p>
  </div>`;
  askConfirm({title:'تأیید انتقال سرنخ',body,okLabel:'تأیید انتقال'},()=>{
    const note=($('#mvNote')||{}).value||'';
    const visitAt=normJ(($('#mvVisit')||{}).value||'')||l.visitAt||'';
    const kind=VISIT_STAGES.has(to)&&to!==from?'visit_assign':(to===3&&from===2?'visit_done':'stage');
    if(VISIT_STAGES.has(to)){
      applyVisitAssign(l);
      if(visitAt)l.visitAt=visitAt;
    }
    if(to===3&&from===2)l.visitDoneAt=todayJ();
    pushLeadHist(l,{from,to,note,kind,vcName:l.vcName||vc.name||'',vcPhone:l.vcPhone||vc.phone||'',visitAt:l.visitAt||visitAt||''});
    l.stage=to;
    delete LEAD_DRAFT[id];
    save();render();toast('انتقال ثبت شد');
    return true;
  });
}
function leadV(){
  if(!can('lead')&&!can('admin'))return empty('به سرنخ‌ها دسترسی ندارید');
  return `<div class="top"><h2>قیف فروش</h2>${can('write')?'<button class="pri" onclick="addL()">سرنخ جدید</button>':''}</div>`+
    stagePipeline('lead',LS.map((l,i)=>({k:String(i),l})),S.leads);
}
function filtLeadStage(k){LEAD_FOCUS=k==null?null:+k;render()}
function leadDetail(){
  if(!can('lead')&&!can('admin'))return empty('به سرنخ‌ها دسترسی ندارید');
  const l=S.leads.find(x=>x.id===V.id);
  if(!l)return '<button onclick="go(\'lead\')">بازگشت به قیف فروش</button>'+empty('سرنخ پیدا نشد.');
  const id=l.id,project=proj(l.proj),write=can('write'),stage=Number(l.stage);
  const draft=LEAD_DRAFT[id], selected=Number(draft?.stage??stage);
  const visit=VISIT_STAGES.has(stage),coordinator=vcOf(l.proj);
  const phone=value=>value?`<a class="lf-phone" dir="ltr" href="tel:${esc(N(value))}">${esc(F(value))}</a>`:'ثبت نشده';
  const fact=(label,value)=>`<div><dt>${label}</dt><dd>${value||'ثبت نشده'}</dd></div>`;
  const edit=write?`<button onclick="editL('${id}')">ویرایش مشخصات</button>`:'';
  const linked=l.cust&&can('cust')?`<button onclick="go('cv','${l.cust}')">مشاهده پرونده مشتری</button>`:!l.cust&&write?`<button onclick="toCust('${id}')">تبدیل به مشتری</button>`:'';
  const del=canDeleteRec()?`<button class="danger" onclick="delLead('${id}')">حذف سرنخ</button>`:'';
  const name=l.name||'سرنخ بدون نام',h=l.h||[];
  return `<article class="lead-file" dir="rtl">
    <header class="lf-hero">
      <nav aria-label="مسیر صفحه"><button onclick="go('lead')">قیف فروش</button><span aria-hidden="true">‹</span>پرونده سرنخ</nav>
      <div class="lf-person"><div class="lf-avatar" aria-hidden="true">${esc(name.trim().split(/\s+/).slice(0,2).map(s=>s[0]).join('‌'))}</div>
      <div class="lf-name"><h2>${esc(name)}</h2>${phone(l.phone)}</div>
      ${edit||linked||del?`<details class="lf-menu"><summary>گزینه‌های پرونده</summary><div>${edit}${linked}${del}</div></details>`:''}</div>
    </header>
    <div class="lf-columns"><div class="lf-stack">
      <section class="lf-card lf-current"><header>${uiIcon(visit?'res':'lead')}<h3>${visit?'هماهنگی بازدید':'وضعیت پیگیری'}</h3><span class="lf-stage">${esc(LS[stage])}</span></header>
        ${visit?`<dl class="lf-visit">${fact('تاریخ بازدید',l.visitAt?esc(F(l.visitAt)):'تعیین نشده')}${fact('هماهنگ‌کننده',esc(l.vcName||coordinator.name))}${fact('تماس هماهنگ‌کننده',phone(l.vcPhone||coordinator.phone))}</dl>${project?.vcNote?`<p class="lf-note">${esc(project.vcNote)}</p>`:''}`:
        `<dl class="lf-visit">${fact('پیگیری بعدی',l.next?esc(F(l.next)):'تعیین نشده')}${l.visitDoneAt?fact('آخرین بازدید انجام‌شده',esc(F(l.visitDoneAt))):''}</dl>`}
        ${write?`<div class="lf-buttons">${stage===2?`<button class="pri" onclick="markVisitDone('${id}')">ثبت انجام بازدید</button>`:''}<button class="${stage===2?'':'pri'}" aria-expanded="${!!draft}" aria-controls="lf-editor" onclick="openLeadEditor(this,'${id}')">ثبت پیگیری یا تغییر مرحله</button></div>`:''}
        ${write?`<div id="lf-editor" ${draft?'':'hidden'}>${leadPipeHtml(l,selected)}
        ${VISIT_STAGES.has(selected)?`<label>تاریخ بازدید<input id="lsVisit" readonly value="${esc(F(draft?.visitAt??l.visitAt??''))}" placeholder="انتخاب تاریخ" onclick="dpick(this,d=>{this.value=F(d);LEAD_DRAFT['${id}'].visitAt=d})"></label>`:''}
        <label>نتیجه پیگیری<textarea id="lsNote" rows="3" oninput="LEAD_DRAFT['${id}'].note=this.value" placeholder="نتیجه تماس یا توافق با مشتری">${esc(draft?.note||'')}</textarea></label>
        <div class="lf-buttons"><button class="pri" onclick="commitLeadStage('${id}')">ذخیره پیگیری</button><button onclick="cancelLeadStage('${id}')">انصراف</button></div></div>`:''}
      </section>
      <section class="lf-card lf-history"><header>${uiIcon('clock')}<h3>سوابق پیگیری</h3><span class="lf-count">${F(h.length)} رویداد</span></header>
        ${leadHistHtml({...l,h:h.slice(-3)})}
        ${h.length>3?`<details class="lf-older"><summary>نمایش ${F(h.length-3)} رویداد پیشین</summary>${leadHistHtml({...l,h:h.slice(0,-3)})}</details>`:''}
      </section>
    </div><section class="lf-card lf-profile"><header>${uiIcon('cust')}<h3>مشخصات سرنخ</h3></header><dl>
    ${fact('پروژه',esc(project?.name))}${fact('مسئول فروش',esc(l.rep))}${fact('نحوه آشنایی',esc(l.src))}
    ${visit?fact('پیگیری بعدی',l.next?esc(F(l.next)):'تعیین نشده'):''}${l.loan==='yes'?fact('درخواست تسهیلات','دارد'):''}</dl>
    ${!visit&&(l.visitAt||l.vcName||l.vcPhone)?`<details class="lf-older"><summary>جزئیات آخرین بازدید</summary><dl>${fact('تاریخ بازدید',esc(F(l.visitAt||'')))}${fact('هماهنگ‌کننده',esc(l.vcName))}${fact('تماس',phone(l.vcPhone))}</dl></details>`:''}
    ${l.note?`<div class="lf-note"><b>یادداشت پرونده</b><p>${esc(l.note)}</p></div>`:''}</section></div>
  </article>`;
}
function openLeadEditor(button,id){
  const l=S.leads.find(x=>x.id===id);
  if(!l||!can('write'))return;
  const editor=document.getElementById('lf-editor');
  if(!editor.hidden){editor.hidden=true;button.setAttribute('aria-expanded','false');return}
  LEAD_DRAFT[id]??={stage:l.stage,note:'',visitAt:l.visitAt||''};
  editor.hidden=false;button.setAttribute('aria-expanded','true');editor.querySelector('select').focus();
}
function pickLeadStage(id,stage){
  const l=S.leads.find(x=>x.id==id);if(!l||!can('write'))return;
  const note=$('#lsNote')?.value||(LEAD_DRAFT[id]?.note||'');
  const visitAt=$('#lsVisit')?normJ($('#lsVisit').value)||LEAD_DRAFT[id]?.visitAt||l.visitAt||'':(LEAD_DRAFT[id]?.visitAt||l.visitAt||'');
  LEAD_DRAFT[id]={stage:+stage,note,visitAt};
  if(V.n==='lv'||V.n==='lead')render();
}
function commitLeadStage(id){
  const l=S.leads.find(x=>x.id==id);if(!l)return;
  const note=$('#lsNote')?.value||'';
  const visitAt=normJ($('#lsVisit')?.value||'')||(LEAD_DRAFT[id]?.visitAt||l.visitAt||'');
  const stage=LEAD_DRAFT[id]?+LEAD_DRAFT[id].stage:+l.stage;
  LEAD_DRAFT[id]={stage,note,visitAt};
  saveLeadStage(id);
}
function draftLeadStage(id,stage){
  const l=S.leads.find(x=>x.id==id);if(!l)return;
  const prev=LEAD_DRAFT[id]||{};
  LEAD_DRAFT[id]={stage:+stage,note:prev.note||'',visitAt:prev.visitAt||l.visitAt||''};
  if(V.n==='lead'||V.n==='lv')render();
}
function cancelLeadStage(id){delete LEAD_DRAFT[id];if(V.n==='lv'||V.n==='lead')render();toast('تغییر مرحله لغو شد')}
function saveLeadStage(id){
  if(!can('write')&&!can('admin'))return toast('اجازه ویرایش ندارید');
  const l=S.leads.find(x=>x.id==id);if(!l)return;
  const draft=LEAD_DRAFT[id];if(!draft)return toast('مرحله‌ای برای ذخیره نیست');
  const noteEl=$('#dn_'+id)||$('#lsNote'),visitEl=$('#dv_'+id)||$('#lsVisit');
  if(noteEl)draft.note=noteEl.value||'';
  if(visitEl)draft.visitAt=normJ(visitEl.value)||draft.visitAt||'';
  const to=+draft.stage,from=+l.stage;
  if(to===from&&!(draft.note||'')&&(draft.visitAt||'')===(l.visitAt||'')){delete LEAD_DRAFT[id];return toast('تغییری برای ذخیره نیست')}
  if(VISIT_STAGES.has(to)&&!l.proj){toast('برای مرحله بازدید، ابتدا پروژه سرنخ را مشخص کنید');return}
  if(VISIT_STAGES.has(to)){
    const vc=vcOf(l.proj);
    if(!vc.name||!vc.phone){toast('برای این پروژه مسئول هماهنگی بازدید تعریف نشده؛ ابتدا در پروژه ثبت کنید');return}
  }
  const vc=VISIT_STAGES.has(to)?vcOf(l.proj):{name:l.vcName||'',phone:l.vcPhone||''};
  const body=`<div class=confirm-summary>
    <p>سرنخ: <b>${esc(l.name)}</b> – ${F(l.phone)}</p>
    <p>پروژه: <b>${esc((proj(l.proj)||{}).name||'—')}</b></p>
    <p>مرحله: <span class=tag>${esc(LS[from])}</span> ← <span class="tag okish">${esc(LS[to])}</span></p>
    ${VISIT_STAGES.has(to)?`<p class=visit-line>هماهنگی بازدید با: <b>${esc(vc.name)}</b> ☎ ${F(vc.phone)}</p>${draft.visitAt?`<p>زمان بازدید: <b>${F(draft.visitAt)}</b></p>`:''}`:''}
    ${draft.note?`<p>یادداشت: ${esc(draft.note)}</p>`:'<p class=fd>بدون یادداشت</p>'}
    <p class=fd>پس از تأیید، سابقه مرحله در پرونده ثبت می‌شود.</p>
   </div>`;
  askConfirm({title:'تأیید تغییر مرحله سرنخ',body,okLabel:'تأیید و ذخیره'},()=>{
    const kind=VISIT_STAGES.has(to)&&to!==from?'visit_assign':(to===3&&from===2?'visit_done':'stage');
    if(VISIT_STAGES.has(to)){
      applyVisitAssign(l);
      if(draft.visitAt)l.visitAt=draft.visitAt;
    }
    if(to===3&&from===2){l.visitDoneAt=todayJ()}
    pushLeadHist(l,{from,to,note:draft.note||'',kind,vcName:l.vcName||vc.name||'',vcPhone:l.vcPhone||vc.phone||'',visitAt:l.visitAt||draft.visitAt||''});
    l.stage=to;
    delete LEAD_DRAFT[id];
    save();render();toast('مرحله ذخیره و در سوابق ثبت شد');
    return true;
  });
}
function markVisitDone(id){
  if(!can('write')&&!can('admin'))return toast('اجازه ویرایش ندارید');
  const l=S.leads.find(x=>x.id==id);if(!l)return;
  if(+l.stage!==2){LEAD_DRAFT[id]={stage:3,note:'بازدید انجام شد',visitAt:l.visitAt||''};return saveLeadStage(id)}
  askConfirm({title:'تأیید انجام بازدید',body:`<p>بازدید سرنخ <b>${esc(l.name)}</b> انجام شده و به مرحله <b>${esc(LS[3])}</b> برود؟</p>
   <p class=fd>هماهنگ‌کننده: ${esc(l.vcName||vcOf(l.proj).name||'—')} | پروژه: ${esc((proj(l.proj)||{}).name||'—')}</p>
   <label>یادداشت نتیجه بازدید<textarea id=vdNote rows=3 placeholder="نتیجه بازدید، بازخورد مشتری..."></textarea></label>`,okLabel:'بله، انجام شد'},()=>{
    const note=($('#vdNote')||{}).value||'بازدید انجام شد';
    const from=l.stage;
    l.visitDoneAt=todayJ();
    pushLeadHist(l,{from,to:3,note,kind:'visit_done',vcName:l.vcName||'',vcPhone:l.vcPhone||'',visitAt:l.visitAt||''});
    l.stage=3;
    delete LEAD_DRAFT[id];
    save();render();toast('بازدید ثبت و مرحله جلو رفت');
    return true;
  });
}
const addL=()=>form('سرنخ جدید',lf(),0,v=>{
  const stage=+v.stage||0;
  const phone=assertLeadPhone(v.phone);if(!phone)return false;
  if(VISIT_STAGES.has(stage)&&!v.proj){toast('برای مرحله بازدید، پروژه را انتخاب کنید');return false}
  if(VISIT_STAGES.has(stage)){const vc=vcOf(v.proj);if(!vc.name){toast('مسئول بازدید این پروژه تعریف نشده است');return false}}
  askConfirm({title:'تأیید ثبت سرنخ',body:`<p>سرنخ <b>${esc(v.name)}</b> در مرحله <b>${esc(LS[stage])}</b> ثبت شود؟</p>${VISIT_STAGES.has(stage)?`<p>هماهنگ‌کننده بازدید: <b>${esc(vcOf(v.proj).name)}</b></p>`:''}`},()=>{
    const lead={id:uid(),name:v.name,phone,src:v.src,proj:v.proj,stage,rep:v.rep,next:v.next||'',loan:v.loan||'no',note:v.note||'',cust:'',vcName:'',vcPhone:'',visitAt:'',visitDoneAt:'',h:[]};
    if(VISIT_STAGES.has(stage))applyVisitAssign(lead);
    pushLeadHist(lead,{from:stage,to:stage,note:v.note||'ثبت اولیه سرنخ',kind:'create',vcName:lead.vcName,vcPhone:lead.vcPhone});
    S.leads.push(lead);S.me=v.rep||S.me;save();render();toast('سرنخ ثبت شد');return true;
  });
  return false;
});
const editL=id=>{const l=S.leads.find(x=>x.id==id);form('ویرایش سرنخ',lf().filter(f=>f.k!=='stage'),l,v=>{
  const phone=assertLeadPhone(v.phone,id);if(!phone)return false;
  askConfirm({title:'تأیید ویرایش سرنخ',body:`<p>مشخصات سرنخ <b>${esc(v.name)}</b> ذخیره شود؟</p><p class=fd>تغییر مرحله از این فرم انجام نمی‌شود؛ کارت را بکشید یا از مسیر فروش پرونده استفاده کنید.</p>`},()=>{
    const prevProj=l.proj;
    Object.assign(l,{name:v.name,phone,src:v.src,proj:v.proj,rep:v.rep,next:v.next||'',loan:v.loan||'no',note:v.note||''});
    pushLeadHist(l,{from:l.stage,to:l.stage,note:v.note?`ویرایش مشخصات — ${v.note}`:'ویرایش مشخصات سرنخ',kind:'edit',vcName:l.vcName||'',vcPhone:l.vcPhone||'',visitAt:l.visitAt||''});
    if(VISIT_STAGES.has(+l.stage)&&(l.proj!==prevProj||!l.vcName)){
      const vc=applyVisitAssign(l);
      pushLeadHist(l,{from:l.stage,to:l.stage,note:'به‌روزرسانی هماهنگ‌کننده بازدید پس از تغییر پروژه',kind:'visit_assign',vcName:vc.name,vcPhone:vc.phone,visitAt:l.visitAt||''});
    }
    S.me=v.rep||S.me;save();render();toast('سرنخ ذخیره شد');return true;
  });
  return false;
})};
const toCust=id=>{const l=S.leads.find(x=>x.id==id);form('ثبت به‌عنوان مشتری',CF,{name:l.name,phone:l.phone},v=>{
  if(!assertCustUniq(v))return false;
  askConfirm({title:'تأیید تبدیل به مشتری',body:`<p>سرنخ <b>${esc(l.name)}</b> به‌عنوان مشتری ثبت شود؟</p>`},()=>{
    const c={id:uid(),...v,kyc:{},notes:[]};S.customers.push(c);l.cust=c.id;
    pushLeadHist(l,{from:l.stage,to:l.stage,note:'تبدیل سرنخ به مشتری',kind:'cust',vcName:l.vcName||'',vcPhone:l.vcPhone||'',visitAt:l.visitAt||''});
    save();render();toast('مشتری از روی سرنخ ساخته شد');return true;
  });
  return false;
})};
// تسهیلات و تحویل
const FD=['اوراق','رهن','کارشناسی','بیمه','مالیات','سایر هزینه‌ها و امور اداری'],HS=['—','واحد آماده – در انتظار تحویل','پروژه در حال ساخت','تحویل شد'],cc=id=>S.contracts.find(c=>c.id==id);
const setFac=(id,v)=>{const c=cc(id);if(!c)return;c.fac=v?FD.map(t=>({t,cost:0,done:false})):undefined;save();render()},setHand=(id,v)=>{const c=cc(id);if(!c)return;c.hand=v;save()},setF=(id,i,k,v)=>{const c=cc(id);if(!c||!c.fac||!c.fac[i])return;c.fac[i][k]=v;save();if(k=='done')render()};
function facV(c){const f=c.fac;return `<section class="units-panel noprint">
  <div class=u-head><h3>تسهیلات و تحویل</h3></div>
  <div class=fac-fields>
    <div>
      <label class=fac-l>خرید با تسهیلات</label>
      <label class="fac-sw sw"><span>فعال</span><input type=checkbox ${f?'checked':''} onchange="setFac('${c.id}',this.checked)" ${can('write')?'':'disabled'}></label>
    </div>
    <div>
      <label class=fac-l for="hand-${c.id}">وضعیت تحویل</label>
      <select id="hand-${c.id}" onchange="setHand('${c.id}',this.value)" ${can('write')?'':'disabled'}>${HS.map(x=>`<option ${c.hand==x?'selected':''}>${x}</option>`).join('')}</select>
    </div>
  </div>
  ${f?`<div class=fac-table>${tbl(['اقدام','هزینه (تومان)','انجام شد'],f.map((x,i)=>`<tr><td>${x.t}</td><td><input inputmode=numeric oninput="fmtIn(this)" value="${x.cost?money(x.cost):''}" onchange="setF('${c.id}',${i},'cost',num(this.value))" ${can('write')?'':'readonly'}></td><td><input type=checkbox style="width:auto" ${x.done?'checked':''} onchange="setF('${c.id}',${i},'done',this.checked)" ${can('write')?'':'disabled'}></td></tr>`).join(''))}<p class=fd style="padding:0 18px 14px">جمع هزینه‌ها: ${T(sum(f,x=>x.cost))} | انجام‌شده: ${F(f.filter(x=>x.done).length)} از ${F(f.length)}</p></div>`:''}
</section>`}
// پرونده مشتری، گزارش‌ها، پشتیبان
const KY=['تصویر کارت ملی','تصویر شناسنامه','شبا/حساب بانکی متعلق به خود مشتری','نشانی و شماره تماس تأییدشده','فرم اعلام پرداخت امضاشده'];
const setK=(id,k,v)=>{const c=cust(id);if(!c.id)return;(c.kyc=c.kyc||{})[k]=!!v;if(!v)delete c.kyc[k];save();render()};
const addN=id=>form('ثبت تماس / یادداشت',[{k:'d',l:'تاریخ',d:todayJ(),j:1,r:1},{k:'t',l:'شرح تماس یا پیگیری',t:'area',w:1,r:1},{k:'by',l:'ثبت‌کننده',r:1,d:S.me||ME.name||''}],0,v=>{S.me=v.by;const c=cust(id);if(!c.id)return false;(c.notes=c.notes||[]).push(v);save();render()});
function cuV(){const c=S.customers.find(x=>x.id==V.id);if(!c)return custV();const cs=S.contracts.filter(x=>ownerList(x).some(o=>o.customer===c.id)),rv=S.reservations.filter(x=>x.cust==c.id),ls=S.leads.filter(x=>x.cust==c.id),k=c.kyc||{};
 return `<div class=top><h2>${esc(c.name)}</h2><div><button onclick="go('cust')">بازگشت</button><details class='action-menu'><summary>عملیات مشتری</summary><div> <button onclick="addR({cust:'${c.id}'})">رزرو</button> <button onclick="addC({cust:'${c.id}'})">قرارداد</button> ${(can('acct')||can('admin'))?`<button class=btn-soft onclick="openAcctForCustomer('${c.id}')">حسابداری / پرداخت</button>`:''} <button class=pri onclick="addN('${c.id}')">ثبت تماس</button> ${canDeleteRec()?`<button class="btn-ghost danger" onclick="delCu('${c.id}')">حذف کامل پرونده</button>`:''}</div></details></div></div><p>کد ملی ${F(c.nid)} | پدر: ${esc(c.father||'—')} | ☎ <a class=ph href="tel:${N(c.phone)}">${F(c.phone)}</a> | ${esc(c.addr||'')}</p>
 <div class=stats><div class=st><b>${F(cs.length)}</b><span>قرارداد</span></div><div class=st><b>${money(sum(S.contracts,x=>sum(x.inst,i=>sum(receipts(x,i).filter(p=>p.owner===c.id),p=>p.amt))))}</b><span>پرداخت‌شده</span></div><div class=st><b>${money(sum(cs,x=>x.total-paidSum(x)))}</b><span>مانده کل قراردادهای مرتبط</span></div><div class=st><b>${F(rv.length)}</b><span>رزرو</span></div></div>
 ${previousContracts(c.id)}${filesPanel('customer',c.id)}<h3>مدارک و احراز هویت (${F(KY.filter(x=>k[x]).length)} از ${F(KY.length)})</h3><div class=wrap style="padding:8px 12px">${KY.map(x=>`<label style="display:flex;gap:8px;align-items:center"><input type=checkbox style="width:auto" ${k[x]?'checked':''} onchange="setK('${c.id}','${x}',this.checked)"> ${x}</label>`).join('')}</div>
 ${ls.length?`<h3>سرنخ</h3>`+tbl(['منبع','مرحله','مسئول','هماهنگ‌کننده بازدید','پیگیری بعدی',''],ls.map(l=>`<tr><td>${esc(l.src||'')}</td><td>${LS[l.stage]}</td><td>${esc(l.rep||'—')}</td><td>${esc(l.vcName||'—')}${l.vcPhone?' – '+F(l.vcPhone):''}</td><td>${l.next?F(l.next):'—'}</td><td><button class=sm onclick="go('lv','${l.id}')">پرونده سرنخ</button></td></tr>`).join('')):''}
 <h3>رزروها</h3>${rv.length?tbl(['شماره','واحد','پرداخت‌شده','وضعیت',''],rv.map(r=>`<tr><td>${r.no}</td><td>${esc(unitTxt(r.proj,r.unit))}</td><td>${money(rPaid(r))}</td><td>${RS[r.st]}</td><td><button class=sm onclick="go('rd','${r.id}')">پرونده</button></td></tr>`).join('')):empty('رزروی ندارد.')}
 <h3>قراردادها</h3>${cs.length?tbl(['شماره','نوع','واحد','سهم این مشتری','مبلغ کل','پرداخت‌شده','مانده',''],cs.map(x=>`<tr><td>${x.no}</td><td>${typeName(x.type)}</td><td>${esc(unitTxt(x.proj,x.unit))}</td><td>${F(ownerList(x).find(o=>o.customer===c.id).share/1000)} دانگ</td><td>${money(x.total)}</td><td>${money(paidSum(x))}</td><td>${money(x.total-paidSum(x))}</td><td><button class=sm onclick="go('cd','${x.id}')">باز کردن</button></td></tr>`).join('')):empty('قراردادی ندارد.')}
 <h3>تاریخچه تماس‌ها و پیگیری‌ها</h3>${(c.notes||[]).length?tbl(['تاریخ','ثبت‌کننده','شرح'],[...c.notes].reverse().map(n=>`<tr><td>${F(n.d)}</td><td>${esc(n.by)}</td><td style="white-space:normal">${esc(n.t)}</td></tr>`).join('')):empty('هنوز تماسی ثبت نشده است.')}`}
const dmDoc=(c,cu)=>{const L=(c.inst||[]).filter(i=>!i.paid&&diff(i.date)<=30);return `<div class=hd><span>شماره: ${c.no}</span><span>تاریخ: ${F(todayJ())}</span></div><h4>یادآوری / اظهارنامه پرداخت اقساط</h4><p>${esc(cu.name)} گرامی (کد ملی ${F(cu.nid)})؛ با سلام و احترام</p><p>بر اساس قرارداد ${c.no} مورخ ${F(c.date)} مربوط به ${esc(unitTxt(c.proj,c.unit))}، اقساط زیر سررسید شده یا نزدیک به سررسید است. خواهشمند است تا تاریخ‌های مقرر، وجه را از حساب بانکی متعلق به خودتان واریز و شماره پیگیری را به دفتر شرکت اعلام فرمایید. در صورت نیاز به هماهنگی، همکاران ما آماده راهنمایی هستند.</p>${L.length?tbl(['ردیف','شرح','مبلغ اصل','تخمین جریمه','سررسید','وضعیت'],L.map((i,k)=>{const d=diff(i.date),days=Math.max(0,-d),pct=instLatePct(c,i),fee=calcLateFee(i.amt,pct,days);return `<tr><td>${F(k+1)}</td><td>${esc(i.title)}</td><td>${money(balance(i))}</td><td>${days&&pct?money(fee)+` (${F(days)} روز × ${F(pct)}٪)`:'—'}</td><td>${F(i.date)}</td><td>${d<0?F(-d)+' روز تأخیر':d==0?'امروز':F(d)+' روز مانده'}</td></tr>`}).join('')):'<p>قسط سررسیدشده‌ای وجود ندارد.</p>'}<p>جمع اصل مبالغ: <b>${TW(sum(L,balance))}</b></p>${Number(c.latePctDaily)?`<p class=fd>نرخ جریمه دیرکرد قرارداد: ${F(c.latePctDaily)}٪ از مبلغ قسط به‌ازای هر روز تأخیر.</p>`:''}${sg([COMPANY,'خریدار'])}`};
const rcDoc=(c,cu,i)=>{
  if(i.parts)return '<h4>رسید واریزهای '+esc(i.title)+'</h4><p>قرارداد '+esc(c.no)+'</p>'+receiptTable(c,[i])+'<p>جمع اصل دریافتی '+T(collected(i))+' — مانده قسط '+T(balance(i))+'</p>'+sg([COMPANY,'تحویل‌گیرنده']);
  const fee=Number(i&&i.lateFee)||0,base=Number(i&&i.amt)||0,pct=i?instLatePct(c,i):0;
  const total=base+fee;
  const lateHtml=fee||(i&&i.lateDays)?`<p>جزئیات جریمه دیرکرد: ${esc(lateDocLine({...i,_latePctUsed:pct}))}</p><p>اصل قسط: <b>${T(base)}</b> + جریمه: <b>${T(fee)}</b> = مبلغ دریافتی: <b>${TW(total)}</b></p>`:`<p>مبلغ اصل قسط: <b>${TW(base)}</b></p>`;
  return `<div class=hd><span>شماره قرارداد: ${c.no}</span><span>تاریخ: ${F((i&&i.pdate)||todayJ())}</span></div><h4>رسید دریافت وجه</h4><p>از ${esc(cu.name)} (کد ملی ${F(cu.nid)}) بابت «${esc((i&&i.title)||'—')}» ${esc(unitTxt(c.proj,c.unit))} با شماره پیگیری ${F((i&&i.ref)||'—')} دریافت شد.</p>${lateHtml}<p>جمع اصل پرداختی تا این تاریخ: ${T(paidSum(c))} | مانده قرارداد: ${T(c.total-paidSum(c))}${lateSum(c)?` | جمع جریمه‌های وصول‌شده: ${T(lateSum(c))}`:''}</p>${sg([COMPANY,'تحویل‌گیرنده'])}`;
};
const schedDoc=(c,cu)=>{
  const rows=(c.inst||[]).map((i,k)=>{
    const pct=instLatePct(c,i);
    const days=i.paid?(Number(i.lateDays)||0):Math.max(0,-diff(i.date));
    const fee=i.paid?(Number(i.lateFee)||0):calcLateFee(i.amt,pct,days);
    const status=i.paid?'پرداخت شد':collected(i)?'واریز جزئی — مانده '+T(balance(i)):(diff(i.date)<0?F(-diff(i.date))+' روز تأخیر':diff(i.date)===0?'سررسید امروز':F(diff(i.date))+' روز مانده');
    const note=i.paid?lateDocLine({...i,_latePctUsed:pct}):(days&&pct?`تخمین: ${F(days)} روز × ${F(pct)}٪`:'');
    return `<tr><td>${F(k+1)}</td><td>${esc(i.title||'قسط')}</td><td>${money(i.amt)}</td><td>${F(i.date)}</td><td>${status}</td><td>${i.paid?F(i.pdate||'—'):'—'}</td><td>${days?F(days):'—'}</td><td>${fee?money(fee):'—'}</td><td>${i.paid||fee?money(i.amt+fee):money(i.amt)}</td><td>${i.ref?F(i.ref):'—'}</td><td style="text-align:right;white-space:normal">${esc(note||'—')}</td></tr>`;
  }).join('');
  return `<div class=hd><span>شماره قرارداد: ${c.no}</span><span>تاریخ چاپ: ${F(todayJ())}</span></div>
  <h4>جدول اقساط و پرداخت‌ها</h4>
  <p>خریدار: <b>${esc(cu.name)}</b> — کد ملی ${F(cu.nid)} — ${esc(unitTxt(c.proj,c.unit))}</p>
  <p>مبلغ کل قرارداد: <b>${T(c.total)}</b> — پرداخت اصل: <b>${T(paidSum(c))}</b> — مانده: <b>${T(Math.max(0,c.total-paidSum(c)))}</b>${lateSum(c)?` — جریمه وصول‌شده: <b>${T(lateSum(c))}</b>`:''}</p>
  ${Number(c.latePctDaily)?`<p>نرخ پیش‌فرض جریمه دیرکرد: <b>${F(c.latePctDaily)}٪</b> از مبلغ هر قسط به‌ازای هر یک روز تأخیر از سررسید. فرمول: مبلغ قسط × نرخ٪ × تعداد روز تأخیر.</p>`:`<p class=fd>برای این قرارداد نرخ جریمه دیرکرد پیش‌فرض صفر است؛ در صورت تعریف روی قسط یا هنگام ثبت پرداخت اعمال می‌شود.</p>`}
  ${tbl(['ردیف','شرح','مبلغ اصل','سررسید','وضعیت','تاریخ پرداخت','روز تأخیر','جریمه','جمع','پیگیری','مستند جریمه'],rows)}
  ${sg([COMPANY,esc(cu.name)])}`;
};
function rstr(inp){if(!can('admin'))return toast('فقط مدیر می‌تواند بازیابی کند');const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const parsed=JSON.parse(r.result);const data=prepImport(parsed.data||parsed);if(!confirm('اطلاعات فعلی با فایل پشتیبان جایگزین شود؟'))return;applyState(data,S._v||0);save();render();toast('در حال بازیابی روی سرور…')}catch(e){toast('فایل پشتیبان معتبر نیست')}};r.readAsText(f);inp.value=''}
function repV(){if(!can('rep')&&!can('admin'))return empty('به گزارش‌ها دسترسی ندارید');const lv=l=>Math.max(...[l.stage,...(l.h||[]).map(x=>x.s)].filter(s=>s<9).concat([0])),LL=S.leads,od=S.contracts.flatMap(c=>(c.inst||[]).filter(i=>!i.paid&&diff(i.date)<0)),ag=[[1,30],[31,60],[61,1e9]].map(([a,b])=>sum(od.filter(i=>{const d=-diff(i.date);return d>=a&&d<=b}),balance)),rv=S.reservations,grp=(f)=>[...new Set(LL.map(f))].map(g=>{const a=LL.filter(l=>f(l)==g);return `<tr><td>${esc(g||'—')}</td><td>${F(a.length)}</td><td>${F(a.filter(l=>lv(l)>=8).length)}</td><td>${a.length?F(Math.round(a.filter(l=>lv(l)>=8).length/a.length*100))+'٪':'—'}</td></tr>`}).join('');
 return `<div class=top><h2>گزارش‌ها و پشتیبان</h2><div>${can('admin')?`<button onclick="expData()">دانلود پشتیبان</button> <label class=sm style="display:inline-block;cursor:pointer;border:1px solid var(--line);border-radius:6px;padding:2px 9px;width:auto">بازیابی از فایل<input type=file accept=.json,.JSON hidden onchange="rstr(this)"></label>`:'<span style="color:var(--mut);font-size:12px">پشتیبان فقط برای مدیر فعال است</span>'}</div></div>
 ${inventoryReport()}<details class="report-group"><summary>وصولی و مطالبات پروژه‌ها</summary><div class=stats><div class=st><b>${money(sum(od,balance))}</b><span>مطالبات معوق (تومان)</span></div><div class=st><b>${money(ag[0])}</b><span>معوق تا ۳۰ روز</span></div><div class=st><b>${money(ag[1])}</b><span>معوق ۳۱ تا ۶۰ روز</span></div><div class=st><b>${money(ag[2])}</b><span>معوق بیش از ۶۰ روز</span></div><div class=st><b>${money(sum(rv.filter(r=>r.st=='cancel'&&r.cancel),r=>r.cancel.fine||0))}</b><span>مبالغ کسرشده بابت لغو</span></div></div>
 <h3>فروش و وصولی به تفکیک پروژه</h3>${S.projects.length?tbl(['پروژه','واحد','آزاد','رزرو','فروخته','ارزش فروش','وصول‌شده','مانده'],S.projects.map(p=>{const cs=S.contracts.filter(c=>c.proj==p.id);return `<tr><td>${esc(p.name)}</td><td>${F((p.units||[]).length)}</td><td>${F((p.units||[]).filter(u=>u.st=='free').length)}</td><td>${F((p.units||[]).filter(u=>u.st=='res').length)}</td><td>${F((p.units||[]).filter(u=>u.st=='sold').length)}</td><td>${money(sum(cs,c=>c.total))}</td><td>${money(sum(cs,paidSum))}</td><td>${money(sum(cs,c=>c.total-paidSum(c)))}</td></tr>`}).join('')):empty('پروژه‌ای ثبت نشده است.')}
 </details><details class="report-group"><summary>قیف فروش و عملکرد کارشناسان</summary><h3>سرنخ‌های رسیده به هر مرحله</h3><div class=wrap style="padding:10px 14px">${LS.slice(0,9).map((s,i)=>{const n=LL.filter(l=>lv(l)>=i).length;return `<div style="display:flex;gap:10px;align-items:center;margin:4px 0"><span style="width:210px;flex:none">${s}</span><div style="flex:1;background:var(--in);border-radius:4px"><div style="width:${LL.length?n/LL.length*100:0}%;background:var(--acc);height:14px;border-radius:4px"></div></div><b style="width:36px">${F(n)}</b></div>`}).join('')||empty('سرنخی ثبت نشده است.')}</div>
 <h3>عملکرد منابع جذب</h3>${LL.length?tbl(['منبع','سرنخ','به قرارداد رسیده','نرخ تبدیل'],grp(l=>l.src)):empty('داده‌ای نیست.')}
 <h3>عملکرد مسئولان فروش</h3>${LL.length?tbl(['مسئول','سرنخ','به قرارداد رسیده','نرخ تبدیل'],grp(l=>l.rep)):empty('داده‌ای نیست.')}
 </details><details class="report-group"><summary>وضعیت رزروها</summary><div class=stats><div class=st><b>${F(rv.filter(r=>r.st=='active').length)}</b><span>فعال</span></div><div class=st><b>${F(rv.filter(r=>r.st=='conv').length)}</b><span>تبدیل به قرارداد</span></div><div class=st><b>${F(rv.filter(r=>r.st=='cancelling').length)}</b><span>در حال لغو</span></div><div class=st><b>${F(rv.filter(r=>r.st=='cancel').length)}</b><span>لغو و تسویه‌شده</span></div></div></details>`}
// اسناد چاپی
const sg=(a)=>`<div class=sign>${a.map(x=>`<div>${x}</div>`).join('')}</div>`;
function doc(){if(window.SourceForms?.mapped())return SourceForms.view();const back=V.k=='res'?'res':(V.k=='acct'||V.k=='checks')?'acct':'cont';
 const backGo=V.k=='acct'?(V.id&&V.id!=='all'?`go('ad','${V.id}')`:`go('acct')`):V.k=='checks'?`setAcctTab('checks');go('acct')`:`go('${back}')`;
 const bar=`<div class="top noprint"><button onclick="${backGo}">بازگشت</button><button class=pri onclick="printDoc()">چاپ</button>${V.k=='acct'||V.k=='checks'?'':`<button onclick="dlDoc()">دانلود Word</button><button onclick="saveDoc()">ذخیره ویرایش‌ها</button><button onclick="resetDoc()">بازنشانی به الگو</button><span style="color:var(--mut);font-size:12px">متن سند را مستقیم روی صفحه می‌توانید ویرایش کنید.</span>`}</div>`;
 if((V.k=='acct'||V.k=='checks')&&typeof acctDocView==='function')return acctDocView(bar);
 if(V.k=='res'){
  const r=S.reservations.find(x=>x.id==V.id);if(!r)return bar+empty('رزرونامه پیدا نشد');
  const c=cust(r.cust),p=proj(r.proj)||{name:'—',addr:''},u=unitOf(r.proj,r.unit);
  if(typeof reserveDoc==='function'){
    const miss=typeof reserveMissing==='function'?reserveMissing(r):[];
    return bar+`${miss.length?`<div class="note noprint">برای متن کامل‌تر این موارد را پر کنید: ${esc(miss.join('، '))} — <button class=sm onclick="editReserveDoc('${r.id}')">تکمیل فیلدها</button></div>`:`<div class="noprint" style="margin:0 0 10px"><button class=sm onclick="editReserveDoc('${r.id}')">تکمیل / ویرایش فیلدها</button></div>`}<div class="paper legal">${reserveDoc(r,c,p,u)}</div>`;
  }
  return bar+empty('قالب رزرونامه بارگذاری نشده است');
 }
 const c=S.contracts.find(x=>x.id==V.id);if(!c)return bar+empty('قرارداد پیدا نشد');const cu=cust(c.cust),p=proj(c.proj)||{name:'—',addr:''},u=unitOf(c.proj,c.unit);
 const sched=tbl(['ردیف','شرح','مبلغ (تومان)','سررسید'],(c.inst||[]).map((i,k)=>`<tr><td>${F(k+1)}</td><td>${esc(i.title)}</td><td>${money(i.amt)}</td><td>${F(i.date)}</td></tr>`).join(''));
 if(V.k=='dm')return bar+`<div class=paper>${dmDoc(c,cu)}</div>`;
 if(V.k=='sched')return bar+`<div class=paper>${schedDoc(c,cu)}</div>`;
 if(V.k=='rc')return bar+`<div class=paper>${rcDoc(c,cu,(c.inst||[]).find(x=>x.id==V.i)||(c.inst||[])[0]||{amt:0,title:'',pdate:'',ref:''})}</div>`;
 if(V.k=='p')return bar+`<div class=paper><h4>فرم اعلام پرداخت اقساط / بدهی</h4><p>آقای/خانم/شرکت: <b>${esc(cu.name)}</b> کد ملی: ${F(cu.nid)} شماره همراه: ${F(cu.phone)}</p>
  <p>اینجانب ${esc(cu.name)} فرزند ${esc(cu.father||'')} دارای کد ملی ${F(cu.nid)} در کمال صحت و سلامت عقلی اعلام می‌دارم در صورت احراز هرگونه مغایرت یا کشف فسادی در ارائه اطلاعات و اسناد (اصل و کپی) مربوط به پرداخت وجوه اقساط قرارداد ${c.no} مورخ ${F(c.date)}، متعهد به پرداخت دو برابر وجه کل قرارداد مذکور به ${PENALTY_TO} به عنوان وجه التزام می‌باشم و هرگونه ادعایی در این رابطه را از خود سلب و ساقط می‌نمایم.</p>
  ${Number(c.latePctDaily)?`<p class=fd>جریمه دیرکرد این قرارداد: ${F(c.latePctDaily)}٪ از مبلغ هر قسط به‌ازای هر روز تأخیر از سررسید.</p>`:''}
  ${receiptTable(c,c.inst)}
  <div class=pay-sign>
    <div class=pay-sign-box><span>امضا</span></div>
    <div class=pay-sign-box fp><span>اثر انگشت ۱</span></div>
    <div class=pay-sign-box fp><span>اثر انگشت ۲</span></div>
  </div>
  </div>`;
 const t=TYPES[c.type];if(!t)return bar+empty('نوع قرارداد نامعتبر است');
 if(c.type==='lease'&&typeof leaseDoc==='function'){
  const miss=typeof leaseMissing==='function'?leaseMissing(c):[];
  return bar+`${miss.length?`<div class="note noprint">برای متن کامل‌تر این موارد را پر کنید: ${esc(miss.join('، '))} — <button class=sm onclick="editLeaseDoc('${c.id}')">تکمیل فیلدها</button></div>`:''}<div class="paper legal">${leaseDoc(c,cu,p,u)}</div>`;
 }
 if(c.type==='invest'&&typeof investDoc==='function'){
  const miss=typeof investMissing==='function'?investMissing(c):[];
  return bar+`${miss.length?`<div class="note noprint">برای متن کامل‌تر این موارد را پر کنید: ${esc(miss.join('، '))} — <button class=sm onclick="editInvestDoc('${c.id}')">تکمیل فیلدها</button></div>`:''}<div class="paper legal">${investDoc(c,cu,p,u)}</div>`;
 }
 return bar+`<div class=paper><div class=hd><span>شماره: ${c.no}</span><span>تاریخ: ${F(c.date)}</span></div><p style="text-align:center">بسم الله الرحمن الرحیم</p><h4>قرارداد ${t.name}</h4>${ownershipPrint(c)}
 ${t.full?fullC(c,cu,p,u,t):`<p><b>ماده ۱ – طرفین:</b> ${t.a}: ${COMPANY}. ${t.b}: ${esc(cu.name)} فرزند ${esc(cu.father||'—')} کد ملی ${F(cu.nid)} شماره شناسنامه ${F(cu.bc||'—')} همراه ${F(cu.phone)} نشانی: ${esc(cu.addr||'—')}.</p>
 <p><b>ماده ۲ – موضوع:</b> ${t.name} یک واحد ${esc(u.kind||'')} به شماره <b>${esc(u.no)}</b> طبقه ${esc(u.floor||'—')} با متراژ ${F(u.area)} متر مربع در پروژه ${esc(p.name)} به نشانی ${esc(p.addr)} همراه با مشاعات و پارکینگ/انباری مرتبط، طبق مشخصات فنی توافق‌شده.</p>
 <p><b>ماده ۳ – ${t.dur}:</b> ${F(c.dur)} ماه از تاریخ ${F(c.date)}.</p>
 <p><b>ماده ۴ – ${t.pr} و نحوه پرداخت:</b> مبلغ کل <b>${TW(c.total)}</b> است که از این مبلغ <b>${TW(payParts(c).down)}</b> به‌عنوان پیش‌پرداخت، <b>${TW(payParts(c).inst)}</b> در قالب اقساط، و <b>${TW(payParts(c).cash)}</b> به‌صورت نقدی/الباقی تسویه می‌شود و طبق جدول پیوست به حساب اعلام‌شده توسط ${t.a} پرداخت می‌گردد. تاریخ ثبت واریز در سامانه بانکی ملاک است.</p>
 <p><b>ماده ۵ – تعهدات ${t.b}:</b> پرداخت به‌موقع اقساط، حفظ و نگهداری واحد، رعایت مقررات ساختمان و عدم واگذاری به غیر بدون رضایت کتبی ${t.a}.</p>
 <p><b>ماده ۶ – تخلف و فسخ:</b> عدم پرداخت هر قسط در سررسید و پس از ۳ روز مهلت، ${t.a} را مجاز به فسخ قرارداد می‌کند و هزینه‌های ایجادشده از مبالغ پرداختی کسر می‌گردد.</p>
 <p><b>ماده ۷ – تحویل و انتقال:</b> ${t.end}</p>
 <p><b>ماده ۸ – حل اختلاف:</b> اختلافات ابتدا با مذاکره و در غیر این صورت از طریق داور مرضی‌الطرفین حل و فصل می‌شود و رأی داور لازم‌الاجراست.</p>
 <p><b>ماده ۹ – نسخ:</b> این قرارداد در ۹ ماده و ۲ نسخه با اعتبار یکسان تنظیم و امضا شد. ${esc(c.note||'')}</p>`}
 <h4 style="font-size:14px">جدول پرداخت</h4>${sched}${sg([t.a,t.b,'شاهد ۱','شاهد ۲'])}</div>`}
function unitNameById(id){return (ORG_UNITS.find(u=>u.id===id)||{}).name||'—'}
function adminV(){location.href='/admin';return empty('در حال انتقال به پنل مدیریت…')}
async function loadUsers(){
  try{USERS=await api('/api/users');if(V.n==='admin')render()}catch(e){if(e.message!=='auth')toast(e.message)}
}
async function loadOrgUnits(){
  try{ORG_UNITS=await api(can('admin')?'/api/units/all':'/api/units');if(V.n==='inbox'||V.n==='wd'&&!document.querySelector('.follow-entry[data-editing]'))render()}catch(e){if(e.message!=='auth')toast(e.message)}
}
async function loadDirectory(){
  try{DIR_USERS=await api('/api/users/directory')}catch(e){DIR_USERS=[]}
}
function permChecks(selected,role){
  const defs=LEGAL_OPTS.perms.length?LEGAL_OPTS.perms:[{k:'dash',l:'داشبورد'},{k:'lead',l:'سرنخ'},{k:'proj',l:'پروژه'},{k:'cust',l:'مشتری'},{k:'cont',l:'قرارداد'},{k:'res',l:'رزرو'},{k:'rep',l:'گزارش'},{k:'legal',l:'حقوقی'},{k:'inbox',l:'صندوق ارجاعات'},{k:'write',l:'ویرایش'},{k:'admin',l:'ادمین'}];
  const set=new Set(selected||[]);
  return `<div class="checks w" id=permBox>${defs.map(p=>`<label><input type=checkbox data-p="${p.k}" ${role==='admin'||set.has(p.k)?'checked':''} ${role==='admin'?'disabled':''}> ${esc(p.l)}</label>`).join('')}</div>`;
}
function unitChecks(selected){
  const set=new Set(selected||[]);
  if(!ORG_UNITS.length)return `<div class="fd w" id=unitBox>ابتدا یک واحد سازمانی بسازید.</div>`;
  return `<div class="checks w" id=unitBox>${ORG_UNITS.map(u=>`<label><input type=checkbox data-u="${u.id}" ${set.has(u.id)?'checked':''}> ${esc(u.name)}</label>`).join('')}</div>`;
}
function collectPerms(m){return [...m.querySelectorAll('#permBox [data-p]:checked')].map(e=>e.dataset.p)}
function collectUnits(m){return [...m.querySelectorAll('#unitBox [data-u]:checked')].map(e=>e.dataset.u)}
function userForm(title,init,ok){
  const m=$('#modal');init=init||{};
  m.innerHTML=`<div class=box><h3 style="margin-top:0">${title}</h3><div class=grid>
   <label>نام<input name=name></label>
   <label>نام کاربری انگلیسی<input name=username ${init.id?'readonly':''}></label>
   <label>رمز عبور<input name=password type=password autocomplete=new-password placeholder="${init.id?'خالی = بدون تغییر':''}"></label>
   <label>نقش<select name=role><option value=staff>کارشناس فروش</option><option value=legal>واحد حقوقی</option><option value=admin>مدیر</option></select></label>
   <label class=w>عضویت در واحدها${unitChecks(init.unitIds)}</label>
   <label class=w>دسترسی‌های بخشی${permChecks(init.perms,init.role||'staff')}</label>
   ${init.id?`<label class=w style="display:flex;gap:8px;align-items:center"><input name=active type=checkbox style="width:auto" ${init.active!==false?'checked':''}> حساب فعال باشد</label>`:''}
  </div><div class=act><button type=button class=pri id=ok>ثبت</button><button type=button onclick="closeM()">انصراف</button></div></div>`;
  m.classList.add('on');
  m.querySelector('[name=name]').value=init.name||'';
  m.querySelector('[name=username]').value=init.username||'';
  m.querySelector('[name=role]').value=init.role||'staff';
  m.querySelector('[name=role]').onchange=e=>{
    const role=e.target.value;
    const defs=LEGAL_OPTS.roleDefaults?.[role]||[];
    m.querySelector('#permBox').outerHTML=permChecks(defs,role);
  };
  $('#ok').onclick=async()=>{
    const v={name:m.querySelector('[name=name]').value.trim(),username:m.querySelector('[name=username]').value.trim(),password:m.querySelector('[name=password]').value,role:m.querySelector('[name=role]').value,perms:collectPerms(m),unitIds:collectUnits(m)};
    if(init.id)v.active=!!m.querySelector('[name=active]')?.checked;
    if(!v.name||!v.username){toast('نام و نام کاربری را وارد کنید');return}
    if(!init.id&&v.password.length<5){toast('رمز حداقل ۵ کاراکتر باشد');return false}
    if(init.id&&v.password&&v.password.length<5){toast('رمز حداقل ۵ کاراکتر باشد');return false}
    const btn=$('#ok');btn.disabled=true;
    try{const r=await ok(v);if(r!==false)closeM()}finally{if($('#ok'))$('#ok').disabled=false}
  };
}
function addUser(){userForm('کاربر جدید',{role:'staff',perms:LEGAL_OPTS.roleDefaults?.staff||[],unitIds:[]},async v=>{try{await api('/api/users',{method:'POST',body:JSON.stringify(v)});toast('کاربر ساخته شد');loadUsers();loadOrgUnits()}catch(e){if(e.message!=='auth')toast(e.message);return false}})}
function editUser(id){const u=USERS.find(x=>x.id===id);if(!u)return;userForm('ویرایش کاربر',u,async v=>{try{await api('/api/users/'+id,{method:'PUT',body:JSON.stringify(v)});toast('کاربر به‌روز شد');loadUsers();loadOrgUnits()}catch(e){if(e.message!=='auth')toast(e.message);return false}})}
async function delUser(id){
  if(!confirm('این کاربر حذف شود؟'))return;
  try{await api('/api/users/'+id,{method:'DELETE'});loadUsers();loadOrgUnits()}catch(e){if(e.message!=='auth')toast(e.message)}
}
function orgUnitForm(title,init,ok){
  const m=$('#modal');init=init||{};
  const memberSet=new Set(init.memberIds||[]);
  const memberChecks=USERS.length?`<div class="checks w" id=memberBox>${USERS.filter(u=>u.active!==false).map(u=>`<label><input type=checkbox data-m="${u.id}" ${memberSet.has(u.id)?'checked':''}> ${esc(u.name)} <span class=fd>(${esc(u.username)})</span></label>`).join('')}</div>`:'<div class=fd>ابتدا کاربر بسازید.</div>';
  m.innerHTML=`<div class=box><h3 style="margin-top:0">${title}</h3><div class=grid>
   <label>نام واحد<input name=name placeholder="مثلاً امور قراردادها"></label>
   <label>کد انگلیسی<input name=code ${init.code==='legal'?'readonly':''} placeholder="contracts"></label>
   <label class=w>توضیح<textarea name=note rows=2></textarea></label>
   <label class=w>اعضای واحد${memberChecks}</label>
   ${init.id&&init.code!=='legal'?`<label class=w style="display:flex;gap:8px;align-items:center"><input name=active type=checkbox style="width:auto" ${init.active!==false?'checked':''}> واحد فعال باشد</label>`:''}
  </div><div class=act><button type=button class=pri id=ok>ثبت</button><button type=button onclick="closeM()">انصراف</button></div></div>`;
  m.classList.add('on');
  m.querySelector('[name=name]').value=init.name||'';
  m.querySelector('[name=code]').value=init.code||'';
  m.querySelector('[name=note]').value=init.note||'';
  $('#ok').onclick=async()=>{
    const v={name:m.querySelector('[name=name]').value.trim(),code:m.querySelector('[name=code]').value.trim().toLowerCase(),note:m.querySelector('[name=note]').value.trim(),memberIds:[...m.querySelectorAll('#memberBox [data-m]:checked')].map(e=>e.dataset.m)};
    if(init.id&&init.code!=='legal')v.active=!!m.querySelector('[name=active]')?.checked;
    if(!v.name||!v.code){toast('نام و کد واحد را وارد کنید');return}
    const btn=$('#ok');btn.disabled=true;
    try{const r=await ok(v);if(r!==false)closeM()}finally{if($('#ok'))$('#ok').disabled=false}
  };
}
function addOrgUnit(){orgUnitForm('واحد سازمانی جدید',{},async v=>{try{await api('/api/units',{method:'POST',body:JSON.stringify(v)});toast('واحد ساخته شد');await loadOrgUnits();loadUsers()}catch(e){if(e.message!=='auth')toast(e.message);return false}})}
function editOrgUnit(id){const u=ORG_UNITS.find(x=>x.id===id);if(!u)return;orgUnitForm('ویرایش واحد',u,async v=>{try{await api('/api/units/'+id,{method:'PUT',body:JSON.stringify(v)});toast('واحد به‌روز شد');await loadOrgUnits();loadUsers()}catch(e){if(e.message!=='auth')toast(e.message);return false}})}
async function delOrgUnit(id){
  if(!confirm('این واحد حذف شود؟'))return;
  try{await api('/api/units/'+id,{method:'DELETE'});toast('واحد حذف شد');loadOrgUnits();loadUsers()}catch(e){if(e.message!=='auth')toast(e.message)}
}
async function saveAdminSettings(){
  try{
    const body={legalDays:num($('#legalDays').value),days:num($('#resDays').value),fine:num($('#fineAmt').value),autoLegal:$('#autoLegal').checked};
    const saved=await api('/api/admin/settings',{method:'PUT',body:JSON.stringify(body)});
    S.cfg={...S.cfg,legalDays:saved.legalDays,days:saved.days,fine:saved.fine,autoLegal:saved.autoLegal};
    toast(`تنظیمات ذخیره شد${saved.synced?.created?`؛ ${F(saved.synced.created)} پرونده جدید ارجاع شد`:''}`);
    render();
  }catch(e){if(e.message!=='auth')toast(e.message)}
}
async function uploadWorkAttachments(caseId,fileList){
  const files=[...fileList||[]];
  if(!files.length)return 0;
  let n=0;
  for(const f of files){
    if(f.size>8*1024*1024)throw Error('حجم «'+f.name+'» بیش از ۸ مگابایت است.');
    const params=new URLSearchParams({title:f.name,category:'پیوست ارجاع'});
    const r=await fetch('/api/files/workcase/'+encodeURIComponent(caseId)+'?'+params,{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:f,credentials:'same-origin'});
    if(!r.ok)throw Error((await r.json().catch(()=>({}))).message||'بارگذاری فایل ناموفق بود');
    n+=1;
  }
  return n;
}
async function openReferDialog(pre){
  if(!canRefer())return toast('اجازه ارجاع ندارید');
  pre=pre||{};
  if(!ORG_UNITS.length)await loadOrgUnits();
  if(!DIR_USERS.length)await loadDirectory();
  const units=(ORG_UNITS.filter(u=>u.active!==false));
  const legal=units.find(u=>u.code==='legal');
  const defaultUnit=pre.unitId||(pre.unitCode==='legal'&&legal?legal.id:'')||(units[0]?.id||'');
  const m=$('#modal');
  const kindOpts=((LEGAL_OPTS.caseKinds?.length&&LEGAL_OPTS.caseKinds)||[{k:'text',l:'متن آزاد'},{k:'installment',l:'قسط معوق'},{k:'contract',l:'قرارداد'},{k:'reservation',l:'رزرو'},{k:'report',l:'گزارش'},{k:'payment',l:'پرداخت'}]).filter(k=>pre.kind?k.k===pre.kind:['text','report'].includes(k.k));
  m.innerHTML=`<div class="box refer-box"><h3 style="margin-top:0">ارجاع جدید</h3>
  <p class="fd" style="margin:-4px 0 12px">متن، فایل یا هر دو را به واحد یا شخص موردنظر بفرستید.</p>
  <div class=grid>
   <label>واحد مقصد<select name=unitId>${units.map(u=>`<option value="${u.id}" ${u.id===defaultUnit?'selected':''}>${esc(u.name)}</option>`).join('')}</select></label>
   <label>گیرنده ارجاع<select name=assignedTo><option value="">صندوق مشترک واحد</option><option value="*">همه اعضای فعلی واحد</option></select></label>
   <label>نوع ارجاع<select name=kind>${kindOpts.map(k=>`<option value="${k.k}" ${(pre.kind||'text')===k.k?'selected':''}>${esc(k.l)}</option>`).join('')}</select></label>
   <label>اولویت<select name=priority><option value=normal>عادی</option><option value=high ${pre.priority==='high'?'selected':''}>بالا</option></select></label>
   <label class=w>عنوان<input name=title placeholder="خلاصهٔ کوتاه ارجاع"></label>
   <label class=w>متن ارجاع<textarea name=body rows=5 placeholder="شرح کار، انتظار، مهلت و نکات مهم…"></textarea></label>
   <label class=w>پیوست فایل (اختیاری)<input type=file name=attach multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx"><span class="fd">PDF، تصویر، Word یا Excel — تا ۸ مگابایت</span></label>
  </div><div class=act><button type=button class=pri id=ok>ثبت و ارسال ارجاع</button><button type=button onclick="closeM()">انصراف</button></div></div>`;
  openM();
  if(pre.title)m.querySelector('[name=title]').value=pre.title;
  if(pre.body)m.querySelector('[name=body]').value=pre.body;
  const fillMembers=()=>{
    const uid=m.querySelector('[name=unitId]').value;
    const unit=ORG_UNITS.find(u=>u.id===uid);
    const members=DIR_USERS.filter(u=>(u.unitIds||[]).includes(uid)||(unit?.memberIds||[]).includes(u.id));
    m.querySelector('[name=assignedTo]').innerHTML=`<option value="">صندوق مشترک واحد</option><option value="*">همه اعضای فعلی واحد</option>`+members.map(u=>`<option value="${u.id}">${esc(u.name)}</option>`).join('');
  };
  fillMembers();
  m.querySelector('[name=unitId]').onchange=fillMembers;
  $('#ok').onclick=async()=>{
    const payload={
      unitId:m.querySelector('[name=unitId]').value,
      ...referralDestination(m),
      kind:m.querySelector('[name=kind]').value,
      priority:m.querySelector('[name=priority]').value,
      title:m.querySelector('[name=title]').value.trim(),
      body:m.querySelector('[name=body]').value.trim(),
      contractId:pre.contractId,instId:pre.instId,reservationId:pre.reservationId,
      sourceKey:pre.sourceKey,ledgerId:pre.ledgerId,checkId:pre.checkId,
    };
    if(pre.kind)payload.kind=pre.kind;
    if(!payload.unitId){toast('واحد مقصد را انتخاب کنید');return}
    if(payload.kind==='text'||payload.kind==='report'){if(!payload.title&&!payload.body){toast('عنوان یا توضیحات لازم است');return}}
    const files=m.querySelector('[name=attach]')?.files;
    const btn=$('#ok');btn.disabled=true;btn.textContent='در حال ثبت…';
    try{
      const c=await api('/api/workcases',{method:'POST',body:JSON.stringify(payload)});
      if(files?.length){
        btn.textContent='در حال پیوست فایل…';
        await uploadWorkAttachments(c.id,files);
      }
      toast('ارجاع ثبت شد');closeM();
      if(canInbox()){V={n:'wd',id:c.id};remember();loadInbox()}else render();
    }catch(e){if(e.message!=='auth')toast(e.message)}
    finally{if($('#ok')){$('#ok').disabled=false;$('#ok').textContent='ثبت و ارسال ارجاع'}}
  };
}
async function referInst(cid,iid){
  const c=S.contracts.find(x=>x.id===cid);const inst=(c?.inst||[]).find(i=>i.id===iid);
  openReferDialog({
    kind:'installment',unitCode:'legal',priority:'high',
    contractId:cid,instId:iid,
    title:c?`قسط معوق ${c.no}${inst?` – ${inst.title||''}`:''}`:'قسط معوق',
    body:'ارجاع قسط معوق برای پیگیری وصول',
  });
}
function referToLegal(){openReferDialog({unitCode:'legal',kind:'text'})}
function referContract(cid){
  const c=S.contracts.find(x=>x.id===cid);
  openReferDialog({kind:'contract',contractId:cid,title:c?`قرارداد ${c.no}`:'ارجاع قرارداد',body:''});
}
let inboxRead=0,legalRead=0;
async function loadLegal(){
  if(!can('legal'))return;
  const request=++legalRead;
  try{
    const body=await api('/api/legal/cases');
    if(request!==legalRead)return;
    LEGAL=body.cases||[];LEGAL_STATS=body.stats||{};
    if(body.settings)S.cfg={...S.cfg,...body.settings};
    if(V.n==='legal'||V.n==='ld'&&!document.querySelector('.follow-entry[data-editing]'))render();
    if(V.n==='dash')refreshCaseCounts();
  }catch(e){if(e.message!=='auth')toast(e.message)}
}
async function loadInbox(){
  if(!canInbox())return;
  const request=++inboxRead;
  try{
    if(!ORG_UNITS.length)ORG_UNITS=await api('/api/units').catch(()=>[]);
    const q=V.n==='inbox'&&V.unitFilter?`?unitId=${encodeURIComponent(V.unitFilter)}`:'';
    const body=await api('/api/workcases'+q);
    if(request!==inboxRead)return;
    WORK=body.cases||[];WORK_STATS=body.stats||{};
    if(V.n==='inbox'||V.n==='wd'&&!document.querySelector('.follow-entry[data-editing]'))render();
    if(V.n==='dash')refreshCaseCounts();
  }catch(e){if(e.message!=='auth')toast(e.message)}
}
function stLabel(s){return (LEGAL_OPTS.caseStatus.find(x=>x.k===s)||{l:s==='new'?'ارجاع‌شده':s==='working'?'در حال پیگیری':s==='waiting'?'در انتظار':s==='done'?'مختومه':s}).l}
function kindLabel(k){return (LEGAL_OPTS.caseKinds.find(x=>x.k===k)||{l:({installment:'قسط معوق',reservation:'رزرو',contract:'قرارداد',payment:'پرداخت',report:'گزارش',text:'متن آزاد',manual:'دستی'})[k]||'ارجاع'}).l}
function moneyBar(paid,total){const p=total>0?Math.min(100,Math.round(paid/total*100)):0;return `<div class=barwrap title="${F(p)}٪"><div class=barfill style="width:${p}%"></div></div><div class=fd>وصول‌شده ${money(paid)} از ${money(total)} (${F(p)}٪)</div>`}
function meId(){return String(ME.id||'')}
function caseHolder(c){return c.audience?.length?'همه اعضای واحد ('+F(c.audience.length)+' نفر)':c.assignedName||'صندوق مشترک واحد'}
function lastFollowOf(c){
  const tl=(c.timeline||[]).filter(e=>e.type==='follow');
  if(tl.length)return tl[0];
  return (c.follows||[])[0]||null;
}
function followCount(c){return (c.timeline||[]).filter(e=>e.type==='follow').length||(c.follows||[]).length||0}
function inboxScoped(items,scope){
  const id=meId(),name=ME.name||'',units=new Set(ME.unitIds||[]);
  if(scope==='tome')return items.filter(c=>String(c.assignedTo||'')===id||(units.has(String(c.currentUnitId||''))&&(c.audience?.length?c.audience.includes(id):!c.assignedTo)));
  if(scope==='byme')return items.filter(c=>String(c.referredById||'')===id);
  if(scope==='followed')return items.filter(c=>{
    const ev=[...(c.timeline||[]),...(c.follows||[])];
    return ev.some(e=>(!e.type||e.type==='follow')&&(String(e.byId||'')===id||e.by===name));
  });
  return items;
}
function timelineHtml(c){
  const acts=LEGAL_OPTS.followActions||[],subs=LEGAL_OPTS.followSubjects||[],ress=LEGAL_OPTS.followResults||[];
  const typeL={create:'ایجاد ارجاع',follow:'پیگیری',transfer:'انتقال واحد',status:'تغییر وضعیت',assign:'واگذاری مسئول'};
  const events=(c.timeline&&c.timeline.length)?c.timeline:(c.follows||[]).map(f=>({...f,type:'follow'}));
  return events.map(e=>{
    const title=typeL[e.type]||'رویداد',date=[e.d,e.h].filter(Boolean).map(F).join('، ');
    const route=e.type==='transfer'?[e.fromUnitName,e.toUnitName,e.toUserName].filter(Boolean).join(' ← '):'';
    const tags=[...(e.actions||[]).map(k=>acts.find(a=>a.k===k)?.l),...(e.subjects||[]).map(k=>subs.find(a=>a.k===k)?.l),ress.find(a=>a.k===e.result)?.l,e.next&&'پیگیری بعدی '+F(e.next)].filter(Boolean);
    return `<article class="event-entry"><header><strong>${esc(title)}</strong>${e.by?`<span>${esc(e.by)}</span>`:''}<time>${esc(date)}</time></header>
      ${route?`<p>${esc(route)}</p>`:''}${e.note&&![title,'ایجاد پرونده'].includes(e.note)?`<p>${esc(e.note)}</p>`:e.status?`<p>${esc(stLabel(e.status))}</p>`:''}
      ${tags.length?`<div class="event-tags">${tags.map(t=>'<span>'+esc(t)+'</span>').join('')}</div>`:''}</article>`;
  }).join('')||empty('هنوز اقدامی ثبت نشده است.');
}
function linkedRecords(c){
  const groups=[];
  function group(label,icon,title,fields,action=''){
    const facts=recordFacts(fields);
    if(title||facts||action)groups.push(`<section class="linked-group" ${action?'data-open-card':''}><header>${uiIcon(icon)}<span>${label}</span></header>${title?`<h4>${esc(F(title))}</h4>`:''}<dl>${facts}</dl>${action}</section>`);
  }
  function link(view,id,label){
    return id?`<button class="linked-action" data-card-primary onclick="go('${view}','${id}')">${label} ‹</button>`:'';
  }
  const {customer,project,unit,contract,installment,reservation,payment}=c;
  const amount=v=>v==null?'':T(v);
  if(customer)group('مشتری','cust',customer.name,[['کد ملی',customer.nid],['نشانی',customer.addr]],(can('cust')?link('cv',customer.id,'پرونده مشتری'):'')+(customer.phone?`<a class="contact-tel" href="tel:${esc(N(customer.phone))}"><bdi>${esc(F(customer.phone))}</bdi></a>`:''));
  if(project||unit)group('ملک','proj',project?.name,[['واحد',unit?.no],['طبقه',unit?.floor],['متراژ',unit?.area?F(unit.area)+' مترمربع':''],['نشانی',project?.addr]],can('proj')?link('pd',project?.id,'مشاهده پروژه'):'');
  if(contract?.id||contract?.no)group('قرارداد','cont',contract.no,[['تاریخ قرارداد',contract.date],['مبلغ کل',amount(contract.total)],['وصول‌شده',amount(contract.paid)],['مانده',amount(contract.remaining)]],can('cont')?link('cd',contract.id,'مشاهده قرارداد'):'');
  if(installment?.title||installment?.id)group('قسط','clock',installment.title,[['مبلغ قسط',amount(installment.amt)],['سررسید',installment.date]],contract?.id&&can('cont')?`<button class="linked-action" data-card-primary onclick="openRc('${contract.id}','${installment.id}')">مشاهده رسید ‹</button>`:'');
  if(reservation?.id||reservation?.no)group('رزرو','res',reservation.no,[['مبلغ توافقی',amount(reservation.need)],['وصول‌شده',amount(reservation.paid)],['مهلت',reservation.deadline]],can('res')?link('rd',reservation.id,'پرونده رزرو'):'');
  if(payment?.amt!=null)group('پرداخت','acct','',[['مبلغ',amount(payment.amt)],['تاریخ',payment.date],['پیگیری',payment.ref]]);
  return groups.join('');
}
function caseDetailBody(c,backView,apiBase){
  const acts=LEGAL_OPTS.followActions||[],subs=LEGAL_OPTS.followSubjects||[],ress=LEGAL_OPTS.followResults||[];
  const lf=lastFollowOf(c),route=[c.currentUnitName,c.assignedName||(c.audience?.length?caseHolder(c):'')].filter(Boolean).join(' / ');
  const linked=linkedRecords(c);
  return `<article class="record-page" dir="rtl"><div class="record-nav"><button onclick="go('${backView}')">بازگشت به ${backView==='legal'?'امور حقوقی':'صندوق ارجاعات'}</button><div>   ${canRefer()?`<button class="sm" onclick="openTransferDialog('${c.id}')">ارجاع به واحد دیگر</button>`:''}
   ${panelMenu('وضعیت',['new','working','waiting','done'].map(s=>`<button class="${c.status===s?'pri':''} sm" onclick="setWorkStatus('${c.id}','${s}','${apiBase}')">${stLabel(s)}</button>`).join('')+(canDeleteRec()||can('admin')?`<button class="sm x" onclick="delWorkCase('${c.id}','${backView}')">حذف ارجاع</button>`:''))}
</div></div>
    <header class="record-head"><span class="record-kind">${esc(kindLabel(c.kind))}</span><h2>${esc(c.title||c.customer?.name||'پرونده ارجاع')}</h2><span class="badge">${esc(stLabel(c.status))}</span></header>
    <section class="record-overview"><dl>${recordFacts([['گیرنده',route],['فرستنده',c.referredBy],['موعد بعدی',lf?.next],['مبلغ معوق',c.chart?.overdueAmt?T(c.chart.overdueAmt):'']])}</dl>${c.body?`<p>${esc(c.body)}</p>`:''}</section>
    <section class="follow-entry" onfocusin="this.dataset.editing=1" oninput="this.dataset.editing=1" onchange="this.dataset.editing=1"><h3>ثبت پیگیری</h3>    <label>شرح پیگیری<textarea id=ft rows=3 maxlength=4000 placeholder="چه اقدامی انجام شد؟"></textarea></label><div class=grid>
     <label>نتیجه<select id=fr>${ress.map(a=>`<option value="${a.k}">${esc(a.l)}</option>`).join('')}</select></label>
     <label>تاریخ پیگیری بعدی<input id=fn readonly style="cursor:pointer" onclick="dpick(this)"></label>

    </div>
<details class="extra-follow"><summary>نوع اقدام و موضوع</summary>    <div class=fd>اقدام انجام‌شده</div><div class=checks id=fa>${acts.map(a=>`<label><input type=checkbox data-a="${a.k}"> ${esc(a.l)}</label>`).join('')}</div>
    <div class=fd>موضوع</div><div class=checks id=fs>${subs.map(a=>`<label><input type=checkbox data-s="${a.k}"> ${esc(a.l)}</label>`).join('')}</div>
</details><div class=act><button class=pri onclick="saveWorkFollow('${c.id}','${apiBase}',this)">ثبت پیگیری</button></div>
</section>
    ${lf?`<div class="last-action"><b>آخرین پیگیری</b> ${esc(lf.by||'')} <time>${F(lf.d||'')}</time>${lf.note?`<p>${esc(lf.note)}</p>`:''}</div>`:''}
    <details class="record-fold"><summary>تاریخچه اقدامات</summary><div class="tl-feed">${timelineHtml(c)}</div></details>
    ${linked?`<details class="record-fold"><summary>مشخصات و پرونده‌های مرتبط</summary><div class="linked-grid">${linked}</div></details>`:''}
    ${filesPanel('workcase',c.id)}</article>`;
}
function recordFacts(rows){
  return rows.filter(([,value])=>value!=null&&value!=='').map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(F(value))}</dd></div>`).join('');
}
function inboxV(){
  if(!canInbox())return empty('به صندوق ارجاعات دسترسی ندارید');
  const cols=LEGAL_OPTS.caseStatus.length?LEGAL_OPTS.caseStatus:[{k:'new',l:'ارجاع‌شده'},{k:'working',l:'در حال پیگیری'},{k:'waiting',l:'در انتظار'},{k:'done',l:'مختومه'}];
  const unitFilter=V.unitFilter||'';
  const scope=V.inboxScope||'tome';
  const mode=V.inboxMode||'list';
  const scoped=inboxScoped(WORK,scope);
  const id=meId(),units=new Set(ME.unitIds||[]);
  const nToMe=inboxScoped(WORK,'tome').length;
  const nByMe=WORK.filter(c=>String(c.referredById||'')===id).length;
  const nFollowed=inboxScoped(WORK,'followed').length;
  const openN=scoped.filter(c=>c.status!=='done').length;
  const lateN=scoped.filter(c=>(c.overdueDays||0)>0&&c.status!=='done').length;
  const noFollow=scoped.filter(c=>c.status!=='done'&&!followCount(c)).length;
  const scopes=[['all','همه ارجاعات',WORK.length],['tome','ارجاع‌شده به من',nToMe],['byme','ارجاع‌های من',nByMe],['followed','پیگیری‌های من',nFollowed]];
  return `<section class="inbox-shell">
  <header class="inbox-hero">
    <div>
      <p class="inbox-kicker">جریان کار سازمانی</p>
      <h2>صندوق ارجاعات</h2>
      <p>ارجاع‌های دریافتی، مسئول پیگیری و آخرین اقدام را اینجا ببینید.</p>
    </div>
    <div class="inbox-hero-actions">
      <button type=button onclick="loadInbox()">تازه‌سازی</button>
      ${canRefer()?`<button type=button class=pri onclick="openReferDialog()">＋ ارجاع جدید</button>`:''}
    </div>
  </header>
  <div class="inbox-toolbar">
    <div class="inbox-scopes" role="tablist">${scopes.map(([k,l,n])=>`<button type="button" role="tab" aria-selected="${scope===k}" onclick="V.inboxScope='${k}';render()">${esc(l)}<b>${F(n)}</b></button>`).join('')}</div>
    <div class="inbox-tools">
      <select class="inbox-filter" onchange="V.unitFilter=this.value;loadInbox()"><option value="">همه واحدها</option>${ORG_UNITS.map(u=>`<option value="${u.id}" ${unitFilter===u.id?'selected':''}>${esc(u.name)}</option>`).join('')}</select>

    </div>
  </div>
  ${caseQueue(cols,scoped,'wd')}
</section>`;
}
function workDetail(){
  if(!canInbox())return empty('به صندوق ارجاعات دسترسی ندارید');
  const c=WORK.find(x=>x.id===V.id)||LEGAL.find(x=>x.id===V.id);
  if(!c)return `<div class=top><h2>جزئیات ارجاع</h2><button onclick="go('inbox')">بازگشت</button></div>${empty('ارجاع پیدا نشد یا در حال بارگذاری است.')}`;
  return caseDetailBody(c,'inbox','work');
}
function legalV(){
  if(!can('legal'))return empty('به واحد حقوقی دسترسی ندارید');
  const cols=LEGAL_OPTS.caseStatus.length?LEGAL_OPTS.caseStatus:[{k:'new',l:'ارجاع‌شده'},{k:'working',l:'در حال پیگیری'},{k:'waiting',l:'در انتظار'},{k:'done',l:'مختومه'}];
  const days=S.cfg?.legalDays??7;
  const mode=V.inboxMode||'list';
  return `<section class="inbox-shell">
  <header class="inbox-hero legal-hero">
    <div>
      <p class="inbox-kicker">واحد حقوقی</p>
      <h2>پرونده‌های امور حقوقی</h2>
      <p>معوقات بیش از ${F(days)} روز و ارجاع‌های دستی به این واحد.</p>
    </div>
    <div class="inbox-hero-actions">
      <button type=button onclick="loadLegal()">تازه‌سازی</button>
      ${canRefer()?`<button type=button class=pri onclick="referToLegal()">ارجاع به حقوقی</button>`:''}

    </div>
  </header>
  ${legalDesk(LEGAL)}${caseQueue(cols,legalScope(LEGAL),'ld')}
</section>`;
}
function legalDetail(){
  if(!can('legal'))return empty('به واحد حقوقی دسترسی ندارید');
  const c=LEGAL.find(x=>x.id===V.id);
  if(!c)return `<div class=top><h2>پرونده حقوقی</h2><button onclick="go('legal')">بازگشت</button></div>${empty('پرونده پیدا نشد یا در حال بارگذاری است.')}`;
  return caseDetailBody(c,'legal','legal');
}
async function openTransferDialog(id){
  if(!ORG_UNITS.length)await loadOrgUnits();
  if(!DIR_USERS.length)await loadDirectory();
  const c=WORK.find(x=>x.id===id)||LEGAL.find(x=>x.id===id);
  const units=ORG_UNITS.filter(u=>u.active!==false);
  const m=$('#modal');
  m.innerHTML=`<div class="box refer-box"><h3 style="margin-top:0">ارجاع به واحد دیگر</h3><div class=grid>
   <label>واحد مقصد<select name=unitId>${units.map(u=>`<option value="${u.id}">${esc(u.name)}</option>`).join('')}</select></label>
   <label>گیرنده ارجاع<select name=assignedTo><option value="">صندوق مشترک واحد</option><option value="*">همه اعضای فعلی واحد</option></select></label>
   <label class=w>توضیح انتقال<textarea name=note rows=3 placeholder="دلیل ارجاع به واحد دیگر…"></textarea></label>
  </div><div class=act><button type=button class=pri id=ok>انتقال</button><button type=button onclick="closeM()">انصراف</button></div></div>`;
  m.classList.add('on');
  const fill=()=>{
    const uid=m.querySelector('[name=unitId]').value;
    const members=DIR_USERS.filter(u=>(u.unitIds||[]).includes(uid));
    m.querySelector('[name=assignedTo]').innerHTML=`<option value="">صندوق مشترک واحد</option><option value="*">همه اعضای فعلی واحد</option>`+members.map(u=>`<option value="${u.id}">${esc(u.name)}</option>`).join('');
  };
  fill();m.querySelector('[name=unitId]').onchange=fill;
  $('#ok').onclick=async()=>{
    const body={unitId:m.querySelector('[name=unitId]').value,...referralDestination(m),note:m.querySelector('[name=note]').value.trim()};
    try{
      const updated=await api('/api/workcases/'+id+'/transfer',{method:'POST',body:JSON.stringify(body)});
      upsertCase(updated);toast('ارجاع منتقل شد');closeM();render();
    }catch(e){if(e.message!=='auth')toast(e.message)}
  };
}
function upsertCase(updated){
  ++inboxRead;++legalRead;
  let i=WORK.findIndex(x=>x.id===updated.id);if(i>=0)WORK[i]=updated;else WORK.push(updated);
  i=LEGAL.findIndex(x=>x.id===updated.id);if(i>=0)LEGAL[i]=updated;
}
async function setWorkStatus(id,status,apiBase){
  try{
    const url=apiBase==='legal'?`/api/legal/cases/${id}/status`:`/api/workcases/${id}/status`;
    const updated=await api(url,{method:'PATCH',body:JSON.stringify({status})});
    upsertCase(updated);render();
  }catch(e){if(e.message!=='auth')toast(e.message)}
}
async function setLegalStatus(id,status){return setWorkStatus(id,status,'legal')}
async function saveWorkFollow(id,apiBase,button){
  if(button?.disabled)return;
  if(button)button.disabled=true;
  const actions=[...document.querySelectorAll('#fa [data-a]:checked')].map(e=>e.dataset.a);
  const subjects=[...document.querySelectorAll('#fs [data-s]:checked')].map(e=>e.dataset.s);
  const result=$('#fr')?.value||'other';
  const note=$('#ft')?.value.trim()||'';
  const next=normJ($('#fn')?.value||'')||'';
  try{
    const url=apiBase==='legal'?`/api/legal/cases/${id}/followups`:`/api/workcases/${id}/followups`;
    const updated=await api(url,{method:'POST',body:JSON.stringify({actions,subjects,result,note,next})});
    upsertCase(updated);toast('پیگیری ثبت شد');render();
  }catch(e){if(e.message!=='auth')toast(e.message)}finally{if(button)button.disabled=false}
}
async function saveFollow(id){return saveWorkFollow(id,'legal')}
function chPass(){
  form('تغییر رمز عبور',[{k:'current',l:'رمز فعلی',t:'pass',r:1},{k:'next',l:'رمز جدید',t:'pass',r:1},{k:'next2',l:'تکرار رمز جدید',t:'pass',r:1}],0,async v=>{
    if(v.next.length<5){toast('رمز جدید حداقل ۵ کاراکتر باشد');return false}
    if(v.next!==v.next2){toast('تکرار رمز یکسان نیست');return false}
    try{await api('/api/auth/password',{method:'POST',body:JSON.stringify({current:v.current,next:v.next})});toast('رمز عبور تغییر کرد')}catch(e){if(e.message!=='auth')toast(e.message);return false}
  });
}
async function logout(){await fetch('/api/auth/logout',{method:'POST',credentials:'same-origin'});location.reload()}
async function expData(){
  const res=await fetch('/api/admin/export',{credentials:'same-origin'});
  if(res.status===401)return showLogin();
  if(!res.ok){const b=await res.json().catch(()=>({}));return toast(b.message||'دریافت پشتیبان ناموفق بود')}
  const blob=await res.blob();
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='arman-crm-backup.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
async function api(url,opts){
  opts=opts||{};
  const res=await fetch(url,{credentials:'same-origin',headers:{'Content-Type':'application/json'},method:opts.method||'GET',body:opts.body});
  if(res.status===401){showLogin();const e=new Error('auth');throw e}
  const body=await res.json().catch(()=>({}));
  if(!res.ok){const e=new Error(body.message||'خطا');throw e}
  return body;
}
function prepImport(old){
  const data=JSON.parse(JSON.stringify(old||{}));
  (data.projects||[]).forEach(p=>(p.units||[]).forEach(u=>{u.area=num(u.area);u.ppm=num(u.ppm);u.total=num(u.total);u.ppmRaw=num(u.ppmRaw);u.totalRaw=num(u.totalRaw);if(!u.st)u.st='free'}));
  (data.customers||[]).forEach(c=>{c.notes=Array.isArray(c.notes)?c.notes:[];c.kyc=c.kyc&&typeof c.kyc==='object'?c.kyc:{}});
  (data.contracts||[]).forEach(c=>{c.total=num(c.total);(c.inst||[]).forEach(i=>{i.amt=num(i.amt);i.paid=!!i.paid});(c.fac||[]).forEach(f=>{f.cost=num(f.cost);f.done=!!f.done})});
  (data.reservations||[]).forEach(r=>{r.need=num(r.need);r.fine=num(r.fine);(r.pays||[]).forEach(p=>{p.amt=num(p.amt)});if(r.cancel){r.cancel.fine=num(r.cancel.fine);r.cancel.refund=num(r.cancel.refund)}});
  (data.projects||[]).forEach(p=>{p.vcName=p.vcName||'';p.vcPhone=p.vcPhone||'';p.vcNote=p.vcNote||''});
  (data.leads||[]).forEach(l=>{
    l.stage=+l.stage||0;l.rep=l.rep||'';l.vcName=l.vcName||'';l.vcPhone=l.vcPhone||'';
    l.visitAt=l.visitAt||'';l.visitDoneAt=l.visitDoneAt||'';l.h=Array.isArray(l.h)?l.h:[];
  });
  data.parties=Array.isArray(data.parties)?data.parties:[];
  data.ledger=Array.isArray(data.ledger)?data.ledger:[];
  data.checks=Array.isArray(data.checks)?data.checks:[];
  (data.parties||[]).forEach(p=>{p.phone=N(p.phone||'');p.nid=N(p.nid||'');p.custId=p.custId||'';p.title=p.title||'';p.note=p.note||''});
  (data.ledger||[]).forEach(r=>{r.amt=num(r.amt);r.desc=r.desc||'';r.ref=r.ref||'';r.by=r.by||'';r.source=r.source==='check'?'check':'manual';r.checkId=r.checkId||''});
  (data.checks||[]).forEach(c=>{c.amt=num(c.amt);c.bank=c.bank||'';c.branch=c.branch||'';c.sayad=c.sayad||'';c.serial=c.serial||'';c.accountNo=c.accountNo||'';c.holder=c.holder||'';c.status=c.status||'pending';c.desc=c.desc||'';c.note=c.note||'';c.by=c.by||'';c.ledgerId=c.ledgerId||''});
  if(data.cfg){if(data.cfg.fine!=null)data.cfg.fine=num(data.cfg.fine);if(data.cfg.days!=null)data.cfg.days=parseInt(N(data.cfg.days),10)||20}
  return data;
}
function offerLocalImport(){
  if(sessionStorage.getItem('skipLocalImport'))return;
  let old=null;
  try{const raw=localStorage.getItem('armanCRM');if(raw)old=JSON.parse(raw)}catch(e){return}
  if(!old)return;
  const has=(old.projects&&old.projects.length)||(old.customers&&old.customers.length)||(old.contracts&&old.contracts.length)||(old.reservations&&old.reservations.length)||(old.leads&&old.leads.length);
  const empty=!S.projects.length&&!S.customers.length&&!S.contracts.length&&!S.reservations.length&&!S.leads.length;
  if(!has||!empty)return;
  $('#modal').innerHTML='<div class=box><h3 style="margin-top:0">داده‌های نسخه قبلی پیدا شد</h3><p>در این مرورگر اطلاعات سامانه قدیمی ذخیره شده است. می‌توانید همان را به پایگاه داده سرور منتقل کنید.</p><div class=act><button type=button class=pri id=doImport>انتقال به سرور</button><button type=button id=skipImport>بعداً</button></div></div>';
  $('#modal').classList.add('on');
  $('#skipImport').onclick=()=>{sessionStorage.setItem('skipLocalImport','1');closeM()};
  $('#doImport').onclick=()=>{
    const data=prepImport(old);
    applyState(data,S._v||0);
    closeM();
    save();
    render();
    toast('در حال انتقال داده‌های قبلی به سرور…');
  };
}
async function loadOptions(){
  try{
    const opts=await fetch('/api/meta/options').then(r=>r.json());
    LEGAL_OPTS={
      caseStatus:opts.caseStatus||[],
      caseKinds:opts.caseKinds||[],
      followActions:opts.followActions||[],
      followSubjects:opts.followSubjects||[],
      followResults:opts.followResults||[],
      perms:opts.perms||[],
      roles:opts.roles||{},
      roleDefaults:opts.roleDefaults||{},
    };
  }catch(e){}
}
async function bootData(){
  showShell();
  $('#main').innerHTML='<div class=empty>در حال دریافت اطلاعات…</div>';
  try{
    await loadOptions();
    const res=await fetch('/api/state',{credentials:'same-origin'});
    if(res.status===401)return showLogin();
    const body=await res.json().catch(()=>({}));
    if(!res.ok){$('#main').innerHTML='<div class=empty>'+esc(body.message||'بارگذاری ناموفق بود')+'</div>';return}
    applyState(body.data,body.version);
    try{const raw=sessionStorage.getItem('armanView');if(raw){const v=JSON.parse(raw);if(v&&v.n)V=v}}catch(e){}
    if(V.n==='users')V={n:'admin'};
    if((V.n==='admin'&&!can('admin'))||(V.n==='legal'&&!can('legal'))||(V.n==='ld'&&!can('legal'))||((V.n==='inbox'||V.n==='wd')&&!canInbox())||((V.n==='acct'||V.n==='ad')&&!can('acct')&&!can('admin')))V={n:firstNav()[0]?.[0]||'dash'};
    render();
    if(V.n==='admin'){loadUsers();loadOrgUnits()}
    else if(canRefer()||canInbox()||can('admin'))loadOrgUnits();
    if(can('legal'))loadLegal();
    if(V.n==='dash')loadReferralSources();
    if(canInbox())loadInbox();
    if(can('write'))offerLocalImport();
  }catch(e){
    $('#main').innerHTML='<div class=empty>ارتباط با سرور قطع شد</div>';
  }
}
async function init(){
  $('#loginForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const err=$('#loginErr');
    err.hidden=true;
    try{
      const res=await fetch('/api/auth/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:fd.get('username'),password:fd.get('password')})});
      const body=await res.json().catch(()=>({}));
      if(!res.ok){err.hidden=false;err.textContent=body.message||'ورود ناموفق بود';return}
      ME=body.user;
      await bootData();
    }catch(ex){err.hidden=false;err.textContent='ارتباط با سرور برقرار نشد'}
  });
  try{
    const res=await fetch('/api/auth/me',{credentials:'same-origin'});
    if(!res.ok)return showLogin();
    const body=await res.json();
    ME=body.user;
    await bootData();
  }catch(e){showLogin('ارتباط با سرور برقرار نشد')}
}
init();
