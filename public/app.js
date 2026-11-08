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
['ماده ۶ – مبلغ قرارداد و نحوه پرداخت',`مبلغ کل قرارداد <b>${TW(c.total)}</b> است که طبق جدول پرداخت پیوست به حساب اعلام‌شده شرکت واریز می‌شود. تاریخ و زمان ثبت واریز در سامانه بانکی ملاک است. تأخیر در پرداخت هر قسط بیش از ........ روز، شرکت را مجاز به فسخ قرارداد می‌کند و پس از کسر ........ درصد مبلغ قرارداد و هزینه‌های ایجادشده، مابقی مبالغ پرداختی مسترد می‌شود.`],
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
function words(n){n=Math.round(n);if(!n)return 'صفر';const g=[];let i=0;while(n){const r=n%1000;if(r)g.unshift(w3(r)+(B1[i]?' '+B1[i]:''));n=~~(n/1000);i++}return g.join(' و ')}
const TW=n=>`${T(n)} (${words(n)} تومان)`;
// تاریخ شمسی
function j2g(jy,jm,jd){jy+=1595;let days=-355668+365*jy+~~(jy/33)*8+~~((jy%33+3)/4)+jd+(jm<7?(jm-1)*31:(jm-7)*30+186),gy=400*~~(days/146097);days%=146097;if(days>36524){gy+=100*~~(--days/36524);days%=36524;if(days>=365)days++}gy+=4*~~(days/1461);days%=1461;if(days>365){gy+=~~((days-1)/365);days=(days-1)%365}let gd=days+1,sa=[0,31,(gy%4==0&&gy%100!=0)||gy%400==0?29:28,31,30,31,30,31,31,30,31,30,31],gm;for(gm=0;gm<13;gm++){if(gd<=sa[gm])break;gd-=sa[gm]}return[gy,gm,gd]}
const pj=s=>N(s).replace(/-/g,'/').split('/').map(Number);
const fj=(y,m,d)=>y+'/'+String(m).padStart(2,'0')+'/'+String(d).padStart(2,'0');
function todayJ(dt){const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{year:'numeric',month:'numeric',day:'numeric'}).formatToParts(dt||new Date()),g=t=>p.find(x=>x.type==t).value;return fj(+g('year'),+g('month'),+g('day'))}
const toDate=s=>{const[a,b,c]=j2g(...pj(s));return new Date(a,b-1,c)};
const addD=(s,k)=>{const d=toDate(s);d.setDate(d.getDate()+k);return todayJ(d)};
const diff=s=>Math.round((toDate(s)-toDate(todayJ()))/864e5);
function normJ(s){const[y,m,d]=pj(s||'');return y>1300&&y<1600&&m>=1&&m<=12&&d>=1&&d<=31?fj(y,m,d):''}
function addM(s,k){let[y,m,d]=pj(s);m+=k;y+=~~((m-1)/12);m=(m-1)%12+1;return fj(y,m,Math.min(d,m<=6?31:m<=11?30:29))}
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
const paidSum=c=>sum((c.inst||[]).filter(i=>i.paid),i=>i.amt);
const lateSum=c=>sum((c.inst||[]).filter(i=>i.paid),i=>Number(i.lateFee)||0);
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
  return parts.join(' · ');
};
const empty=t=>`<div class=empty>${t}</div>`,tbl=(h,r)=>`<div class=wrap><table><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr>${r}</table></div>`;
function remember(){try{sessionStorage.setItem('armanView',JSON.stringify(V))}catch(e){}}
function go(n,id){V={n,id};Q='';if(n!=='pd'){UNIT_EDIT=null;UNIT_DUP_HINT=null;UNIT_FILTER='all'}if(n!=='cd')INST_EDIT=null;remember();if(n==='admin'){loadUsers();loadOrgUnits()}if(n==='legal'||n==='ld')loadLegal();if(n==='inbox'||n==='wd')loadInbox();render();scrollTo(0,0)}
const canSaveData=()=>can('write')||can('admin')||can('acct');
const canInbox=()=>can('inbox')||can('legal')||can('admin')||(ME.unitIds||[]).length>0;
const canRefer=()=>can('write')||can('admin')||can('legal')||can('inbox');
function edKey(){return V.k==='rc'&&V.i?('rc_'+V.i):V.k}
function openRc(cid,iid){V={n:'doc',id:cid,k:'rc',i:iid};remember();render();scrollTo(0,0)}
function firstNav(){const all=[['dash','پیگیری و داشبورد'],['lead','سرنخ‌ها و قیف فروش'],['proj','پروژه‌ها و واحدها'],['cust','مشتریان'],['cont','قراردادها'],['res','رزرونامه‌ها'],['acct','حسابداری'],['inbox','صندوق ارجاعات'],['legal','واحد حقوقی'],['rep','گزارش‌ها و پشتیبان']];return all.filter(([k])=>k==='legal'?can('legal'):k==='inbox'?canInbox():can(k)||(k==='dash'&&(can('legal')||canInbox())))}
function render(){const nav=firstNav(),act={cv:'cust',rep:'rep',rd:'res',pd:'proj',cd:'cont',ld:'legal',wd:'inbox',lv:'lead',ad:'acct',admin:'admin',doc:V.k=='res'?'res':(V.k=='acct'||V.k=='checks')?'acct':'cont'}[V.n]||V.n;
 if(!nav.some(([k])=>k===act)&&!['pd','cd','rd','cv','doc','ld','wd','lv','ad'].includes(V.n)){V={n:nav[0]?nav[0][0]:'dash'};remember()}
 $('#nav').innerHTML=nav.map(([k,l])=>`<button type=button class="nav ${act==k?'on':''}" onclick="go('${k}')">${l}</button>`).join('');
 const foot=$('#sidefoot');
 if(foot)foot.innerHTML=`<div class=who>${esc(ME.name||ME.username||'')}<small style="display:block;color:var(--mut);font-weight:400">${esc(roleLabel(ME.role))}</small></div><div class=sidebtns>${can('admin')?`<a class=sm href="/admin" style="display:inline-flex;align-items:center;text-decoration:none">مدیریت</a>`:''}<button type=button class=sm onclick="chPass()">رمز</button><button type=button class=sm onclick="logout()">خروج</button></div><div id=sync class=sync></div>`;
 const views={dash,lead:leadV,proj:projV,pd,cust:custV,cont,cd,res,rd,doc,rep:repV,cv:cuV,admin:()=>{location.href='/admin';return empty('در حال انتقال به پنل مدیریت…')},legal:legalV,ld:legalDetail,inbox:inboxV,wd:workDetail,lv:leadDetail,acct:typeof acctV==='function'?acctV:()=>empty('ماژول حسابداری بارگذاری نشده'),ad:typeof ad==='function'?ad:()=>empty('ماژول حسابداری بارگذاری نشده')};
 const view=views[V.n];
 $('#main').innerHTML=view?view():empty('به این بخش دسترسی ندارید');
 if(V.n=='doc'){const p=$('.paper'),o=docObj();if(p){const editable=V.k!=='acct'&&V.k!=='checks'&&!!can('write');p.contentEditable=editable;const k=edKey();if(editable&&o&&o.ed&&o.ed[k])p.innerHTML=o.ed[k];
  if(p.classList.contains('legal')&&typeof fitLegalPages==='function'){requestAnimationFrame(()=>{fitLegalPages(p);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>fitLegalPages(p))})}}}
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
 m.classList.add('on');const el=k=>m.querySelector(`[name=${k}]`),fm=v=>v?F((+v).toLocaleString('en')).replace(/,/g,'٬'):'';
 initCboxes(m);
 fields.forEach(f=>{
  if(f.t==='html'||!f.k)return;
  const e=el(f.k);if(!e)return;
  const v=init[f.k]??f.d??'';
  if(f.t==='check'){e.checked=!!v;if(f.on){e.onchange=()=>f.on(m,0);f.on(m,1)}return}
  e.value=f.t=='money'?fm(v):f.j?F(v):v;
  if(f.t==='search')syncCbox(e);
  if(f.j){e.readOnly=true;e.style.cursor='pointer';e.onclick=()=>dpick(e)}
  if(f.t=='money')e.oninput=()=>{e.value=fm(num(e.value));if(f.on)f.on(m,0)};
  if(f.on&&f.t!=='money'){e.onchange=()=>f.on(m,0);f.on(m,1)}
  else if(f.on&&f.t=='money')f.on(m,1);
 });
 $('#ok').onclick=async()=>{const v={};for(const f of fields){
  if(f.t==='html'||f.skip||!f.k)continue;
  const e=el(f.k);if(!e)continue;
  if(f.t==='check'){v[f.k]=!!e.checked;continue}
  const x=e.value.trim();v[f.k]=f.t=='money'?num(x):x;
  if(f.r&&!v[f.k]&&v[f.k]!==0){toast('«'+f.l+'» را وارد کنید');return}
  if(f.j&&v[f.k]){v[f.k]=normJ(x);if(!v[f.k]){toast('تاریخ «'+f.l+'» معتبر نیست (مثال: ۱۴۰۵/۰۸/۱۰)');return}}
 }
  const btn=$('#ok');btn.disabled=true;try{const result=await ok(v);if(result!==false)closeM()}finally{if($('#ok'))$('#ok').disabled=false}}}
const closeM=()=>{$('#modal').classList.remove('on');$('#modal').innerHTML=''};
function askConfirm({title,body,okLabel='تأیید و ذخیره',cancelLabel='انصراف',danger=false},onOk){
  const m=$('#modal');
  m.innerHTML=`<div class="box confirm-box"><h3 style="margin-top:0">${esc(title||'تأیید')}</h3><div class=confirm-body>${body||''}</div><div class=act><button type=button class="${danger?'x':'pri'}" id=ok>${esc(okLabel)}</button><button type=button id=cancel>${esc(cancelLabel)}</button></div></div>`;
  m.classList.add('on');
  $('#cancel').onclick=()=>closeM();
  $('#ok').onclick=async()=>{
    const btn=$('#ok');btn.disabled=true;
    try{const r=await onOk();if(r!==false)closeM()}finally{if($('#ok'))$('#ok').disabled=false}
  };
}
const MN=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
function mlen(y,m){const a=m==12?[y+1,1]:[y,m+1];return Math.round((toDate(fj(a[0],a[1],1))-toDate(fj(y,m,1)))/864e5)}
function dpick(el,cb){const sel=normJ(el.value),t=todayJ();let[y,m]=pj(sel||t);const c=document.createElement('div');c.id='cal';document.body.appendChild(c);
 const draw=()=>{const first=(toDate(fj(y,m,1)).getDay()+1)%7,L=mlen(y,m);let cells='';for(let i=0;i<first;i++)cells+='<i></i>';for(let d=1;d<=L;d++){const s=fj(y,m,d);cells+=`<b class="${s==sel?'s':''} ${s==t?'t':''}" data-d="${s}">${F(d)}</b>`}
  c.innerHTML=`<div class=cb><div class=ch><button data-a=py>«</button><button data-a=pm>‹</button><span>${MN[m-1]} ${F(y)}</span><button data-a=nm>›</button><button data-a=ny>»</button></div><div class=cg>${['ش','ی','د','س','چ','پ','ج'].map(x=>`<u>${x}</u>`).join('')}${cells}</div><div class=cf><button data-a=t>امروز</button><button data-a=x>بستن</button></div></div>`};
 c.onclick=e=>{const a=e.target.dataset.a,d=e.target.dataset.d;if(e.target==c||a=='x')return c.remove();if(d||a=='t'){const v=d||t;el.value=F(v);c.remove();if(cb)cb(v);return}if(a=='py')y--;if(a=='ny')y++;if(a=='pm'&&--m<1){m=12;y--}if(a=='nm'&&++m>12){m=1;y++}draw()};draw()}
const sb=()=>'<input class=sb placeholder="جستجو (نام، شماره تماس، کد ملی، واحد، شماره قرارداد...)" oninput="filt(this.value)">';
const filt=v=>{const q=N(v).toLowerCase().trim();document.querySelectorAll('[data-s]').forEach(e=>e.hidden=!!q&&!e.dataset.s.toLowerCase().includes(q))};
const grq=(t,f)=>{const r=dueList().filter(f);if(!r.length)return '';
 return `<section class=block><div class=sec><h3>${t}</h3><span class=count>${F(r.length)}</span></div><div class=fcs>${r.map(x=>{
  const tone=x.d<0?'late':x.d==0?'today':'soon';
  const label=x.d<0?F(-x.d)+' روز تأخیر':x.d==0?'سررسید امروز':F(x.d)+' روز مانده';
  return `<article class="tc ${tone}" data-s="${esc(N(x.who+x.desc+(x.ph||'')))}">
   <header class=tc-head>
    <span class=tc-type>${esc(x.k)}</span>
    <span class="tc-status ${tone}">${label}</span>
   </header>
   <h4 class=tc-name>${esc(x.who)}</h4>
   <p class=tc-ref>${esc(x.desc)}</p>
   <div class=tc-facts>
    <div class=tc-fact><span>مبلغ</span><strong>${x.amt?T(x.amt):'—'}</strong></div>
    <div class=tc-fact><span>سررسید</span><strong>${F(x.date)}</strong></div>
    <div class=tc-fact><span>تماس</span><strong>${x.ph?`<a class=ph href="tel:${N(x.ph)}">${F(x.ph)}</a>`:'—'}</strong></div>
    <div class=tc-fact><span>وضعیت پیگیری</span><strong>${x.legal?'آماده ارجاع حقوقی':'در صف پیگیری'}</strong></div>
   </div>
   <footer class=tc-actions>
    ${x.pid&&can('write')?`<button class=pri onclick="pay('${x.pid}')">ثبت پرداخت</button>`:''}
    ${x.cid&&x.pid&&x.legal&&canRefer()?`<button onclick="referInst('${x.cid}','${x.pid}')">ارجاع</button>`:''}
    <button onclick="${x.go}">مشاهده پرونده</button>
   </footer>
  </article>`;
 }).join('')}</div></section>`};
const fmtIn=e=>{const v=Math.round(num(e.value));e.value=v?F(v.toLocaleString('en')).replace(/,/g,'٬'):''};
const setAuto=(id,v)=>{const c=S.contracts.find(x=>x.id==id);if(!c)return;c.auto=v;save();toast(v?'محاسبه خودکار روشن شد':'محاسبه خودکار خاموش شد')};
function redist(c,ch){const o=c.inst.filter(x=>!x.paid&&x!==ch);if(!o.length)return;let rest=c.total-sum(c.inst.filter(x=>x.paid),x=>x.amt)-ch.amt;if(rest<0){toast('مبلغ قسط از مانده قرارداد بیشتر است');rest=0}const w=sum(o,x=>x.amt);let left=rest;o.forEach((x,k)=>{x.amt=k==o.length-1?left:Math.floor(rest*(w?x.amt/w:1/o.length)/1000)*1000;left-=x.amt})}
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
function editC(id){const c=S.contracts.find(x=>x.id==id);form('ویرایش قرارداد',[{k:'type',l:'نوع قرارداد',t:'select',o:Object.entries(TYPES).map(([k,v])=>[k,v.name])},{k:'cust',l:'خریدار',t:'select',o:S.customers.map(x=>[x.id,x.name+' – '+x.nid])},{k:'date',l:'تاریخ قرارداد',j:1,r:1},{k:'total',l:'مبلغ کل (تومان)',t:'money',r:1},{k:'dur',l:'مدت (ماه)'},{k:'latePctDaily',l:'جریمه دیرکرد روزانه (٪ از مبلغ قسط)',d:String(c.latePctDaily||0)},{k:'note',l:'توضیحات',t:'area',w:1}],{...c,latePctDaily:c.latePctDaily||0},v=>{askConfirm({title:'تأیید ذخیره قرارداد',body:`<p>تغییرات قرارداد <b>${esc(c.no)}</b> ذخیره شود؟</p>`},()=>{Object.assign(c,{type:v.type,cust:v.cust,date:v.date,total:v.total,dur:v.dur,note:v.note,latePctDaily:num(v.latePctDaily)});delete c.ed;save();render();toast('قرارداد ذخیره شد');return true});return false})}
function regen(id){const c=S.contracts.find(x=>x.id==id),rest=c.total-paidSum(c);form('بازسازی اقساط پرداخت‌نشده',[{k:'rest',l:'مبلغ باقی‌مانده برای تقسیم (تومان)',t:'money',r:1},{k:'count',l:'تعداد اقساط',d:'12'},{k:'first',l:'تاریخ اولین قسط',j:1,r:1,d:addM(todayJ(),1)},{k:'step',l:'فاصله اقساط (ماه)',d:'1'},{k:'day',l:'روز ثابت هر ماه (اختیاری، مثلاً ۲۵)'}],{rest},v=>{const n=parseInt(N(v.count))||0,step=Math.max(1,parseInt(N(v.step))||1),day=parseInt(N(v.day))||0,each=n?Math.floor(v.rest/n/1000)*1000:0;if(!n){toast('تعداد اقساط را وارد کنید');return false}
 c.inst=c.inst.filter(i=>i.paid);for(let i=0;i<n;i++){let d=addM(v.first,i*step);if(day){const[y,m]=pj(d);d=fj(y,m,Math.min(day,mlen(y,m)))}c.inst.push({id:uid(),title:'قسط '+F(i+1),amt:i==n-1?v.rest-each*(n-1):each,date:d,paid:false,pdate:'',ref:'',lateDays:0,lateCalc:0,lateFee:0,lateNote:''})}c.inst.sort((a,b)=>a.date<b.date?-1:1);save();render()})}
function setDay(id){const c=S.contracts.find(x=>x.id==id);form('روز ثابت ماه برای اقساط پرداخت‌نشده',[{k:'day',l:'روز ماه (۱ تا ۳۱)',r:1,d:'25'}],0,v=>{const d=parseInt(N(v.day));if(!(d>=1&&d<=31)){toast('روز معتبر نیست');return false}c.inst.forEach(i=>{if(!i.paid){const[y,m]=pj(i.date);i.date=fj(y,m,Math.min(d,mlen(y,m)))}});c.inst.sort((a,b)=>a.date<b.date?-1:1);save();render()})}
const setM=(m,k,v)=>{const e=m.querySelector(`[name=${k}]`);e.value=v?F((+v).toLocaleString('en')).replace(/,/g,'٬'):''};
// داشبورد
function dueList(){const L=[],legalDays=Math.max(1,Number(S.cfg?.legalDays)||7);
 S.contracts.forEach(c=>(c.inst||[]).forEach(i=>{if(!i.paid){const d=diff(i.date);if(d<=7||d<=-legalDays)L.push({d,k:'قسط',who:cust(c.cust).name,ph:cust(c.cust).phone,pid:i.id,cid:c.id,legal:d<=-legalDays,desc:`${c.no} – ${i.title}`,amt:i.amt,date:i.date,go:`go('cd','${c.id}')`})}}));
 S.reservations.forEach(r=>{if(r.st=='cancelling'){L.push({d:diff(r.cancel.date),k:'لغو رزرو',who:cust(r.cust).name,ph:cust(r.cust).phone,desc:`${r.no} – مرحله بعد: ${CS[r.cancel.h.length]}`,amt:r.cancel.refund,date:r.cancel.date,go:`go('rd','${r.id}')`})}if(r.st=='active'){const d=diff(r.deadline),rem=r.need-sum(r.pays,p=>p.amt);if(d<=7||rem<=0||d<=-legalDays)L.push({d,k:rem>0?'مهلت رزرو':'تکمیل وجه؛ تعیین تکلیف',who:cust(r.cust).name,ph:cust(r.cust).phone,legal:d<=-legalDays&&rem>0,desc:`${r.no} – ${unitTxt(r.proj,r.unit)}`,amt:rem,date:r.deadline,go:`go('rd','${r.id}')`})}});
 S.leads.forEach(l=>{if(l.next&&l.stage<8){const d=diff(l.next);if(d<=7)L.push({d,k:'پیگیری سرنخ',who:l.name,ph:l.phone,desc:LS[l.stage],amt:0,date:l.next,go:`go('lead')`})}});
 return L.sort((a,b)=>a.d-b.d)}
function dash(){const us=S.projects.flatMap(p=>p.units||[]),L=dueList(),rec=sum(S.contracts,paidSum),tot=sum(S.contracts,c=>sum(c.inst||[],i=>i.amt)),legalDays=Math.max(1,Number(S.cfg?.legalDays)||7),legalReady=L.filter(x=>x.legal),openLegal=(LEGAL_STATS.new?.count||0)+(LEGAL_STATS.working?.count||0)+(LEGAL_STATS.waiting?.count||0),openWork=(WORK_STATS.new?.count||0)+(WORK_STATS.working?.count||0)+(WORK_STATS.waiting?.count||0);
 const grp=(t,f)=>{const r=L.filter(f);return r.length?`<h3>${t} (${F(r.length)})</h3>`+tbl(['نوع','مشتری','شرح','مبلغ','تاریخ','وضعیت',''],r.map(x=>`<tr><td>${x.k}</td><td>${esc(x.who)}</td><td>${esc(x.desc)}</td><td>${T(x.amt)}</td><td>${F(x.date)}</td><td><span class="badge ${x.d<0?'bad':x.d==0?'warn':'ok'}">${x.d<0?F(-x.d)+' روز تأخیر':x.d==0?'امروز':F(x.d)+' روز مانده'}</span>${x.legal?' <span class="badge bad">حقوقی</span>':''}</td><td><button class=sm onclick="${x.go}">مشاهده</button> ${x.cid&&x.pid&&canRefer()?`<button class="sm x" onclick="referInst('${x.cid}','${x.pid}')">ارجاع</button>`:''}</td></tr>`).join('')):''};
 return `<div class=top><h2>پیگیری و داشبورد</h2><div><span style="color:var(--mut)">امروز: ${F(todayJ())}</span> ${canRefer()?`<button class=pri onclick="openReferDialog()">ارجاع جدید</button>`:''}</div></div>${sb()}
 <section class=block><div class=sec><h3>خلاصه</h3></div><div class=stats><div class=st><b>${F(us.filter(u=>u.st=='free').length)}</b><span>واحد آزاد از ${F(us.length)}</span></div><div class=st><b>${F(us.filter(u=>u.st=='res').length)}</b><span>واحد رزرو</span></div><div class=st><b>${F(us.filter(u=>u.st=='sold').length)}</b><span>واحد فروخته‌شده</span></div><div class=st><b>${money(rec)}</b><span>دریافتی (تومان)</span></div><div class=st><b>${money(tot-rec)}</b><span>مانده مطالبات (تومان)</span></div>${can('legal')?`<div class=st style="cursor:pointer" onclick="go('legal')"><b>${F(openLegal)}</b><span>پرونده باز حقوقی</span></div>`:''}${canInbox()?`<div class=st style="cursor:pointer" onclick="go('inbox')"><b>${F(openWork)}</b><span>ارجاع باز من</span></div>`:''}</div></section>
 ${legalReady.length?`<div class=note>معوقات بیش از ${F(legalDays)} روز: <b>${F(legalReady.length)}</b> مورد آماده ارجاع به واحد حقوقی است.${can('legal')?` <button class="sm pri" onclick="go('legal')">پایپ‌لاین حقوقی</button>`:''}${canRefer()?` <button class="sm" onclick="openReferDialog()">ارجاع سازمانی</button>`:''}</div>`:''}
 ${L.length?grq('عقب‌افتاده',x=>x.d<0)+grq('سررسید امروز',x=>x.d==0)+grq('تا ۷ روز آینده',x=>x.d>0):empty('موردی برای پیگیری نیست. اقساط و رزروهایی که امروز یا ظرف ۷ روز آینده سررسید دارند اینجا نمایش داده می‌شوند.')}`}
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
const unitHandLabel=u=>u.handReady?(`آماده تحویل${u.handDate?' · '+F(u.handDate):''}`):(u.handDate?F(u.handDate):'—');
const unitParkLabel=u=>u.parking||u.parkingCount?`${F(u.parkingCount||1)} ماشین`:'ندارد';
const unitStoreLabel=u=>{
  if(!(u.storage||u.storageCount))return 'ندارد';
  const parts=[`${F(u.storageCount||1)} عدد`];
  if(u.storageArea)parts.push(`${F(u.storageArea)} م²`);
  return parts.join(' · ');
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
].filter(Boolean).join(' · ')||'—';
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
function projV(){return `<div class=top><h2>پروژه‌ها</h2>${can('write')?`<button class="btn-soft" onclick=addP()><span class=plus>+</span> پروژه جدید</button>`:''}</div>${sb()}<div class=cards>${S.projects.map(p=>`<div class=card data-s="${esc(N(p.name+p.addr+(p.vcName||'')+(p.vcPhone||'')+p.units.map(u=>u.no).join(' ')))}" onclick="go('pd','${p.id}')"><b>${esc(p.name)}</b><small>${esc(p.addr)}</small><div class=meta><span>${F(p.units.length)} واحد</span><span>${F(p.units.filter(u=>u.st=='free').length)} آزاد</span><span>ارزش کل: ${money(sum(p.units,u=>u.total))}</span></div><div class=fd style="margin-top:8px">${p.vcName?`مسئول بازدید: <b>${esc(p.vcName)}</b> · ${F(p.vcPhone||'—')}`:'<span class="badge warn">مسئول بازدید تعریف نشده</span>'}</div></div>`).join('')||empty('هنوز پروژه‌ای ثبت نشده. با «پروژه جدید» شروع کنید.')}</div>`}
function addP(){form('پروژه جدید',PF_PROJ,0,v=>{askConfirm({title:'تأیید ثبت پروژه',body:`<p>پروژه <b>${esc(v.name)}</b> ثبت شود؟</p>`},()=>{S.projects.push({id:uid(),name:v.name,addr:v.addr,note:v.note,vcName:v.vcName,vcPhone:N(v.vcPhone),vcNote:v.vcNote,units:[]});save();render();toast('پروژه ثبت شد');return true});return false})}
function editP(){const p=proj(V.id);if(!p)return;form('ویرایش پرونده پروژه',PF_PROJ,p,v=>{
  askConfirm({title:'تأیید ذخیره پروژه',body:`<p>تغییرات پروژه <b>${esc(v.name)}</b> ذخیره شود؟</p><div class=confirm-summary><p>مسئول بازدید: <b>${esc(v.vcName)}</b></p><p>شماره: <b>${F(v.vcPhone||'—')}</b></p></div>`},()=>{Object.assign(p,{name:v.name,addr:v.addr,note:v.note,vcName:v.vcName,vcPhone:N(v.vcPhone),vcNote:v.vcNote});save();render();toast('پروژه ذخیره شد');return true});
  return false;
})}
function unitCardHtml(u){
  const editing=UNIT_EDIT===u.id&&can('write');
  if(editing){
    const p=proj(V.id);
    const dupNow=p&&unitNoConflict(p,u.no,u.block,u.id);
    const hint=UNIT_DUP_HINT&&UNIT_DUP_HINT.id===u.id?UNIT_DUP_HINT:null;
    return `<article class="uc edit" data-s="${esc(unitSearchBlob(u))}">
      ${hint?`<div class=uc-dup-banner>
        <b>کپی از واحد ${esc(hint.from)}${hint.fromBlock?' · '+esc(hint.fromBlock):''}</b>
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
  return `<article class=uc data-s="${esc(unitSearchBlob(u))}">
    <header class=uc-head>
      <div><span class=uc-no>واحد ${esc(u.no)}${u.block?` · ${esc(u.block)}`:''}</span><span class="badge ${u.st}">${UST[u.st]}</span></div>
      ${can('write')?`<div class=uc-tools>
        <button class="icon-btn" title="ویرایش" onclick="startUnitEdit('${u.id}')">✎</button>
        <button class="icon-btn copy" title="کپی همین واحد" onclick="dupU('${u.id}')"><span class=plus>+</span></button>
        <button class="icon-btn danger" title="حذف کامل" onclick="delU('${u.id}')">🗑</button>
      </div>`:''}
    </header>
    <div class=uc-facts>
      <div><span>طبقه</span><strong>${esc(u.floor||'—')}</strong></div>
      <div><span>کاربری</span><strong>${esc(u.kind||'—')}</strong></div>
      <div><span>متراژ</span><strong>${F(u.area)} م²</strong></div>
      <div><span>خواب</span><strong>${u.rooms?F(u.rooms):'—'}</strong></div>
      <div><span>موقعیت</span><strong>${esc(u.face||'—')}</strong></div>
      <div><span>پارکینگ</span><strong>${esc(unitParkLabel(u))}</strong></div>
      <div><span>انباری</span><strong>${esc(unitStoreLabel(u))}</strong></div>
      <div><span>تحویل</span><strong>${esc(unitHandLabel(u))}</strong></div>
      <div class=span2>
        <span>خام شرکتی</span>
        <strong>${(num(u.totalRaw)||num(u.ppmRaw))?`${money(u.ppmRaw||0)} /م² · <b class=uc-price>${money(u.totalRaw||0)} تومان</b>`:'—'}</strong>
      </div>
      <div class=span2>
        <span>تکمیل‌شده</span>
        <strong>${(num(u.total)||num(u.ppm))?`${money(u.ppm||0)} /م² · <b class=uc-price>${money(u.total||0)} تومان</b>`:'—'}</strong>
      </div>
    </div>
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
 const units=p.units.filter(u=>UNIT_FILTER==='all'||u.st===UNIT_FILTER);
 const av=(p.vcName||'؟').trim().charAt(0);
 const filters=[['all','همه'],['free','آزاد'],['res','رزرو'],['sold','فروخته‌شده']];
 return `<div class=pd>
  <div class=pd-bar>
    <button class=btn-ghost onclick="go('proj')">بازگشت ←</button>
    <div class=pd-bar-actions>
      ${can('write')?`<button class=btn-soft onclick="addU()"><span class=plus>+</span> واحد جدید</button>
      <button class=btn-ghost danger onclick="delP()">حذف پروژه</button>`:''}
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

    <div class=file-cols>
      <section class=file-sec>
        <h3 class=file-h>مشخصات مالی و متراژ</h3>
        <dl class=fig>
          ${fig('تعداد واحد',F(n))}
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

  <section class=units-panel>
    <div class=u-head>
      <h3>واحدها <span class=count>${F(n)}</span></h3>
      <div class=u-tools>
        ${filters.map(([k,l])=>`<button type=button class=f ${UNIT_FILTER===k?'aria-pressed=true':'aria-pressed=false'} onclick="setUnitFilter('${k}')">${l}</button>`).join('')}
        <input class=sb placeholder="جستجوی واحد، بلوک، طبقه، موقعیت…" oninput="filt(this.value)" aria-label="جستجوی واحد">
      </div>
    </div>
    ${units.length?`<div class=unit-grid>${units.map(unitCardHtml).join('')}</div>`:empty(p.units.length?'واحدی با این مشخصات پیدا نشد.':'واحدی تعریف نشده است.')}
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
  askConfirm({title:'تأیید ذخیره واحد',body:`<p>تغییرات واحد <b>${esc(next.no)}</b> ذخیره شود؟</p><div class=confirm-summary><p>${esc(next.kind)}${next.block?' · بلوک '+esc(next.block):''} · طبقه ${esc(next.floor||'—')} · ${F(next.area)} م²${next.rooms?' · '+F(next.rooms)+' خواب':''}${next.face?' · '+esc(next.face):''}</p><p>پارکینگ: ${esc(unitParkLabel(next))} · انباری: ${esc(unitStoreLabel(next))} · تحویل: ${esc(unitHandLabel(next))}</p><p>${esc(unitPriceSummary(next))}</p></div>`},()=>{
    Object.assign(u,next);UNIT_EDIT=null;UNIT_DUP_HINT=null;save();render();toast('واحد ذخیره شد');return true;
  });
}
function addU(){form('واحد جدید',[
  {k:'no',l:'شماره واحد',r:1},{k:'block',l:'بلوک / فاز'},{k:'floor',l:'طبقه',t:'select',o:UF_FLOOR},{k:'kind',l:'کاربری',t:'select',o:UF_KIND},
  {k:'area',l:'متراژ واحد (متر مربع)',r:1},{k:'rooms',l:'تعداد خواب',t:'select',o:UF_ROOMS},{k:'face',l:'موقعیت واحد',t:'select',o:UF_FACE},
  {k:'ppmRaw',l:'خام شرکتی – قیمت هر متر (تومان)',t:'money'},{k:'totalRaw',l:'خام شرکتی – قیمت کل (تومان)',t:'money'},
  {k:'ppm',l:'تکمیل‌شده – قیمت هر متر (تومان)',t:'money'},{k:'total',l:'تکمیل‌شده – قیمت کل (تومان)',t:'money'},
  {k:'parking',l:'پارکینگ',t:'select',o:UF_YN},{k:'parkingCount',l:'تعداد ماشین (اگر دارد)',t:'select',o:UF_PARK_N,d:'1'},
  {k:'storage',l:'انباری',t:'select',o:UF_YN},{k:'storageCount',l:'تعداد انباری (اگر دارد)',t:'select',o:UF_STORE_N,d:'1'},{k:'storageArea',l:'متراژ انباری (م²)'},
  {k:'handReady',l:'وضعیت تحویل',t:'select',o:UF_HAND},{k:'handDate',l:'تاریخ تکمیل / تحویل',j:1},
],0,v=>{
  const p=proj(V.id);if(!p)return false;
  const a=num(v.area);v.area=a;
  const fin=pairPrices(a,v.ppm,v.total);
  const raw=pairPrices(a,v.ppmRaw,v.totalRaw);
  v.ppm=fin.ppm;v.total=fin.total;v.ppmRaw=raw.ppm;v.totalRaw=raw.total;
  if(!unitHasPrice(v)){toast('حداقل یکی از قیمت‌های خام شرکتی یا تکمیل‌شده را وارد کنید');return false}
  const extra=readUnitExtraFromForm(v);
  if(unitNoConflict(p,v.no,extra.block)){
    toast(extra.block?`شماره واحد «${v.no}» در بلوک «${extra.block}» تکراری است`:`شماره واحد «${v.no}» تکراری است`);
    return false;
  }
  askConfirm({title:'تأیید ثبت واحد',body:`<p>واحد <b>${esc(v.no)}</b>${extra.block?' · بلوک '+esc(extra.block):''} اضافه شود؟</p><p class=fd>${esc(v.kind)} · ${F(a)} م² · ${esc(unitPriceSummary(v))}</p><p class=fd>پارکینگ ${esc(unitParkLabel(extra))} · انباری ${esc(unitStoreLabel(extra))} · تحویل ${esc(unitHandLabel(extra))}</p>`},()=>{
    p.units.push(cloneUnitData({...v,...extra},{no:v.no,st:'free'}));
    save();render();toast('واحد ثبت شد');return true;
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
    for(const i of c.inst||[]){
      if(!i.paid||!i.ref)continue;
      if(except?.kind==='inst'&&except.id===i.id)continue;
      if(refKey(i.ref)===k)return{kind:'قسط قرارداد',no:c.no,who:(cust(c.cust)||{}).name||'—'};
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
function custV(){const q=N(Q).toLowerCase(),L=S.customers.filter(c=>!q||(c.name+c.nid+c.phone).toLowerCase().includes(q));
 return `<div class=top><h2>مشتریان</h2><div><button class=pri onclick=addCu()>مشتری جدید</button></div></div>${sb()}${L.length?tbl(['نام','پدر','کد ملی','همراه','قراردادها',''],L.map(c=>`<tr data-s="${esc(N(c.name+c.nid+c.phone))}"><td>${esc(c.name)}</td><td>${esc(c.father)}</td><td>${F(c.nid)}</td><td><a class=ph href="tel:${N(c.phone)}">${F(c.phone)}</a></td><td>${F(S.contracts.filter(x=>x.cust==c.id).length)}</td><td><button class="sm pri" onclick="go('cv','${c.id}')">پرونده</button> <button class=sm onclick="editCu('${c.id}')">ویرایش</button> <button class=sm onclick="addC({cust:'${c.id}'})">قرارداد</button> <button class="sm" onclick="addR({cust:'${c.id}'})">رزرو</button> <button class="sm x" onclick="delCu('${c.id}')">حذف</button></td></tr>`).join('')):empty('مشتری‌ای ثبت نشده است.')}`}
const addCu=()=>form('مشتری جدید',CF,0,v=>{
  if(!assertCustUniq(v))return false;
  askConfirm({title:'تأیید ثبت مشتری',body:`<p>مشتری <b>${esc(v.name)}</b> با کد ملی <b>${F(v.nid)}</b> ثبت شود؟</p>`},()=>{
    S.customers.push({id:uid(),...v,kyc:{},notes:[]});save();render();toast('مشتری ثبت شد');return true;
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
  if(!unpaid.length)return{k:'ok',l:'تسویه کامل'};
  const late=unpaid.filter(i=>diff(i.date)<0);
  if(late.length)return{k:'bad',l:F(late.length)+' قسط معوق'};
  const soon=unpaid.filter(i=>diff(i.date)<=7);
  if(soon.length)return{k:'warn',l:'سررسید نزدیک'};
  return{k:'ok',l:'جاری'};
}
function cont(){
  const list=S.contracts;
  return `<div class=top>
    <div><h2>قراردادها</h2><p class=fd style="margin:4px 0 0">پرونده هر قرارداد را باز کنید؛ اقساط و پرداخت‌ها آنجا مدیریت می‌شود.</p></div>
    ${can('write')?`<button class=btn-soft onclick="addC()"><span class=plus>+</span> قرارداد جدید</button>`:''}
  </div>${sb()}
  ${list.length?`<div class=cont-grid>${list.map(c=>{
    const cu=cust(c.cust),paid=paidSum(c),rem=Math.max(0,c.total-paid),next=(c.inst||[]).find(i=>!i.paid),st=contStatus(c);
    const pct=c.total>0?Math.min(100,Math.round(paid/c.total*100)):0;
    const nextDiff=next?diff(next.date):null;
    const nextTone=nextDiff==null?'':nextDiff<0?'is-late':nextDiff<=7?'is-soon':'';
    const nextHint=nextDiff==null?'':nextDiff<0?`${F(-nextDiff)} روز گذشته`:nextDiff===0?'امروز':`${F(nextDiff)} روز مانده`;
    return `<article class="cc tone-${st.k}" data-s="${esc(N(c.no+cu.name+cu.phone+unitTxt(c.proj,c.unit)+typeName(c.type)))}" onclick="go('cd','${c.id}')">
      <header class=cc-head>
        <div class=cc-id>
          <span class=cc-no>${esc(c.no)}</span>
          <span class="tag-st ${st.k}">${esc(st.l)}</span>
        </div>
        <span class=cc-type title="${esc(typeName(c.type))}">${esc(typeName(c.type))}</span>
      </header>
      <div class=cc-who>
        <h4>${esc(cu.name||'—')}</h4>
        <p class=cc-meta>
          <span>${esc(unitTxt(c.proj,c.unit))}</span>
          <span class=cc-dot></span>
          <span>${F(c.date)}</span>
          ${cu.phone?`<span class=cc-dot></span><span class=cc-phone>${F(cu.phone)}</span>`:''}
        </p>
      </div>
      <div class=cc-money>
        <div class=cc-stat>
          <span>مبلغ کل</span>
          <strong>${money(c.total)} <em>تومان</em></strong>
        </div>
        <div class=cc-stat>
          <span>پرداخت‌شده</span>
          <strong class=ok-txt>${money(paid)} <em>تومان</em></strong>
        </div>
        <div class="cc-stat ${rem?'is-rem':''}">
          <span>مانده</span>
          <strong>${money(rem)} <em>تومان</em></strong>
        </div>
      </div>
      <div class=cc-progress>
        <div class=cc-progress-top>
          <span>پیشرفت وصول</span>
          <b>${F(pct)}٪</b>
        </div>
        <div class=barwrap title="${pct}%"><div class=barfill style="width:${pct}%"></div></div>
      </div>
      <div class=cc-foot>
        <div class="cc-next ${nextTone}">
          <span>قسط بعدی</span>
          <strong>${next?F(next.date):'—'}</strong>
          ${nextHint?`<em>${esc(nextHint)}</em>`:''}
        </div>
        <button type=button class="sm btn-soft" onclick="event.stopPropagation();go('cd','${c.id}')">باز کردن پرونده</button>
      </div>
    </article>`;
  }).join('')}</div>`:empty('قراردادی ثبت نشده است. برای شروع، مشتری و پروژه/واحد تعریف کنید.')}`;
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
function addC(pre){pre=pre||{};if(!S.customers.length||!unitOpts(pre.unit).length)return toast('ابتدا یک مشتری و یک واحد آزاد ثبت کنید');
 const firstUnit=pre.unit||(unitOpts('')[0]||[])[0]||'';
 const [fp,fu]=String(firstUnit).split('|');
 const startBase=pre.total!=null&&pre.total!==''?num(pre.total):unitSaleTotal(unitOf(fp,fu));
 form('قرارداد جدید',[
  {k:'type',l:'نوع قرارداد',t:'select',o:Object.entries(TYPES).map(([k,v])=>[k,v.name])},
  {k:'cust',l:'خریدار',t:'select',o:S.customers.map(c=>[c.id,c.name+' – '+c.nid])},
  {k:'unit',l:'واحد',t:'select',o:unitOpts(pre.unit),on:(m,f)=>{if(f&&pre.total!=null&&pre.total!==''){syncContractPrice(m);return}const[a,b]=m.querySelector('[name=unit]').value.split('|');setM(m,'base',unitSaleTotal(unitOf(a,b)));syncContractPrice(m)}},
  {k:'date',l:'تاریخ قرارداد',d:todayJ(),r:1,j:1},
  {k:'base',l:'قیمت پایه واحد (تومان)',t:'money',r:1,on:(m)=>syncContractPrice(m)},
  {t:'html',html:contractPricePanelHtml()},
  {k:'extraOn',t:'check',skipRender:1,on:(m)=>syncContractPrice(m)},
  {k:'profitOn',t:'check',skipRender:1,on:(m)=>syncContractPrice(m)},
  {k:'total',t:'money',skipRender:1,r:1,l:'مبلغ نهایی قرارداد'},
  {k:'down',l:'پیش‌پرداخت (تومان)',t:'money'},
  {k:'ddate',l:'تاریخ پرداخت پیش‌پرداخت (اگر پرداخت شده)',j:1,d:pre.rdate||''},
  {k:'latePctDaily',l:'جریمه دیرکرد روزانه (٪ از مبلغ قسط)',d:'0'},
  {k:'count',l:'تعداد اقساط',d:'12'},
  {k:'first',l:'تاریخ اولین قسط',r:1,j:1,d:addM(todayJ(),1)},
  {k:'step',l:'فاصله اقساط (ماه)',d:'1'},
  {k:'dur',l:'مدت قرارداد / تحویل (ماه)',d:'12'},
  {k:'note',l:'توضیحات',t:'area',w:1}
 ],{...pre,base:startBase,total:startBase,extraOn:false,profitOn:false,_boxClass:'box-wide'},v=>{
 const price=calcInstPrice(v.base,v.extraOn,v.profitOn);
 v.total=price.total;
 if(!(v.total>0)){toast('مبلغ نهایی قرارداد معتبر نیست');return false}
 const[pid,unit]=v.unit.split('|'),rest=Math.max(0,v.total-v.down),n=Math.max(0,parseInt(N(v.count))||0),step=Math.max(1,parseInt(N(v.step))||1),each=n?Math.floor(rest/n/1000)*1000:0,inst=[];
 if(v.down){
  const downPaid=!!pre.resId||!!v.ddate;
  const downPdate=pre.rdate||v.ddate||'';
  inst.push({id:uid(),title:'پیش‌پرداخت',amt:v.down,date:v.date,paid:downPaid,pdate:downPaid?(downPdate||v.date):'',ref:'',lateDays:0,lateCalc:0,lateFee:0,lateNote:''});
 }
 for(let i=0;i<n;i++)inst.push({id:uid(),title:'قسط '+F(i+1),amt:i==n-1?rest-each*(n-1):each,date:addM(v.first,i*step),paid:false,pdate:'',ref:'',lateDays:0,lateCalc:0,lateFee:0,lateNote:''});
 askConfirm({title:'تأیید ثبت قرارداد',body:`<p>قرارداد برای <b>${esc(cust(v.cust).name)}</b> ثبت شود؟</p>${contractPriceSummaryHtml(price)}${v.down?`<p class=fd>پیش‌پرداخت ${money(v.down)}${v.ddate||pre.rdate?` · پرداخت‌شده در ${F(pre.rdate||v.ddate)}`:' · هنوز پرداخت‌نشده'}</p>`:''}${n?`<p class=fd>${F(n)} قسط از مانده ${money(rest)}</p>`:''}`},()=>{
  S.contracts.push({
    id:uid(),no:'ق-'+F(nextSeq('cn')),type:v.type,cust:v.cust,proj:pid,unit,date:v.date,
    total:v.total,baseTotal:price.base,
    extraOn:price.extraOn,extraPct:price.extraPct,extraAmt:price.extraAmt,
    profitOn:price.profitOn,profitPct:price.profitPct,profitAmt:price.profitAmt,
    dur:v.dur,note:v.note,latePctDaily:num(v.latePctDaily),inst
  });
  setSt(pid,unit,'sold');if(pre.resId){const r=S.reservations.find(x=>x.id==pre.resId);r.st='conv';r.pays.forEach(p=>p.s='used');lg(r,'تبدیل به قرارداد؛ وجوه پرداختی در قرارداد مصرف شد')}save();go('cont');toast('قرارداد ثبت شد');return true;
 });return false})}
function instCardHtml(c,i){
  const d=diff(i.date),editing=INST_EDIT===i.id&&can('write')&&!i.paid;
  const tone=i.paid?'ok':d<0?'bad':d<=7?'warn':'ok';
  const label=i.paid?'پرداخت شد':d<0?F(-d)+' روز تأخیر':d==0?'سررسید امروز':F(d)+' روز مانده';
  const pct=instLatePct(c,i),ownPct=i.latePctDaily!=null&&i.latePctDaily!=='';
  const estDays=i.paid?(Number(i.lateDays)||0):Math.max(0,-d);
  const estCalc=i.paid?(Number(i.lateCalc)||0):calcLateFee(i.amt,pct,estDays);
  const fee=Number(i.lateFee)||0;
  if(editing){
    return `<article class="ic edit">
      <div class=uc-edit-grid>
        <label class=span2>شرح قسط<input id=ie_title value="${esc(i.title||'')}"></label>
        <label>مبلغ<input id=ie_amt inputmode=numeric value="${esc(money(i.amt))}" oninput="fmtIn(this)"></label>
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
  return `<article class="ic ${i.paid?'paid':d<0?'late':''}">
    <header class=ic-head>
      <div><b>${esc(i.title||'قسط')}</b>${i.kind==='lump'||(typeof isLumpInst==='function'&&isLumpInst(i))?' <span class="badge warn">الباقی</span>':''}<span class="badge ${tone}">${label}</span></div>
      ${can('write')&&!i.paid?`<button class="icon-btn" title="ویرایش" onclick="startInstEdit('${i.id}')">✎</button>`:''}
    </header>
    <div class=ic-facts>
      <div><span>مبلغ اصل</span><strong>${money(i.amt)} تومان</strong></div>
      <div><span>سررسید</span><strong>${F(i.date)}</strong></div>
      ${i.paid?`<div><span>تاریخ پرداخت</span><strong>${F(i.pdate||'—')}</strong></div><div><span>پیگیری</span><strong>${F(i.ref||'—')}</strong></div>`:''}
      ${pct?`<div><span>نرخ جریمه</span><strong>${F(pct)}٪ روزانه${ownPct?'':' (قرارداد)'}</strong></div>`:''}
      ${!i.paid&&estDays>0&&pct?`<div><span>تخمین جریمه تا امروز</span><strong>${money(estCalc)} تومان</strong></div><div><span>جزئیات</span><strong>${F(estDays)} روز × ${F(pct)}٪ × ${money(i.amt)}</strong></div>`:''}
      ${i.paid&&(fee||estDays)?`<div><span>جریمه اعمال‌شده</span><strong>${money(fee)} تومان</strong></div><div><span>قابل پرداخت</span><strong>${money(i.amt+fee)} تومان</strong></div>`:''}
    </div>
    ${i.paid&&(fee||i.lateNote||estDays)?`<p class="fd late-doc">${esc(lateDocLine({...i,_latePctUsed:pct}))}</p>`:''}
    <div class=ic-actions>
      ${i.paid?`<button class=sm onclick="openRc('${c.id}','${i.id}')">رسید</button>${can('write')?`<button class=sm onclick="editPay('${i.id}')">ویرایش پرداخت</button><button class=sm onclick="unpay('${i.id}')">لغو پرداخت</button>`:''}`:
        `${can('write')?`<button class="sm pri" onclick="pay('${i.id}')">ثبت پرداخت</button>`:''}
         ${canRefer()&&d<0?`<button class=sm onclick="referInst('${c.id}','${i.id}')">ارجاع</button>`:''}
         ${can('write')?`<button class="sm btn-ghost danger" onclick="delI('${i.id}')">حذف</button>`:''}`}
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
  return `<div class=pd>
  <div class=pd-bar>
    <button class=btn-ghost onclick="go('cont')">بازگشت ←</button>
    <div class="pd-bar-actions cd-tools noprint">
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
      <button class="btn-ghost danger" onclick="delC('${c.id}')">حذف</button>`:''}
    </div>
  </div>

  <article class=file>
    <header class=file-head>
      <div>
        <div class=dossier-k>پرونده قرارداد</div>
        <div class=title-row>
          <h2>${esc(c.no)}</h2>
          <span class="chip ${chip}">${esc(st.l)}</span>
        </div>
        <p class=dossier-addr>${esc(typeName(c.type))} · از ${F(c.date)}${c.dur?` · ${F(c.dur)} ماهه`:''}</p>
        ${c.note?`<p class=dossier-note>${esc(c.note)}</p>`:''}
        ${c.type==='lease'&&typeof leaseMissing==='function'&&leaseMissing(c).length?`<p class=warn-line>برای چاپ رسمی هنوز کامل نیست: ${esc(leaseMissing(c).join('، '))}</p>`:''}
        ${c.type==='invest'&&typeof investMissing==='function'&&investMissing(c).length?`<p class=warn-line>برای چاپ رسمی هنوز کامل نیست: ${esc(investMissing(c).join('، '))}</p>`:''}
      </div>
      ${can('write')?`<button class="icon-btn lg" title="ویرایش قرارداد" onclick="editC('${c.id}')">✎</button>`:''}
    </header>

    <section class=pay-block aria-label="وضعیت پرداخت">
      <div class=pay-row>
        <div><small>مبلغ کل</small><b>${money(c.total)}<span>تومان</span></b></div>
        <div><small>پرداخت‌شده</small><b class=ok-txt>${money(p)}<span>تومان</span></b></div>
        <div class=rem><small>مانده</small><b>${money(rem)}<span>تومان</span></b></div>
      </div>
      <div class=pay-meter role=progressbar aria-valuemin=0 aria-valuemax=100 aria-valuenow="${pct}"><i style="width:${pct}%"></i></div>
      <div class=pnote>${F(pct)}٪ از مبلغ قرارداد پرداخت شده است${fees?` · جریمه دیرکرد وصول‌شده ${money(fees)} تومان`:''}</div>
      ${(c.extraOn||c.profitOn||num(c.baseTotal))?`<div class=cprice-sum style="margin-top:10px">
        <div><span>قیمت پایه</span><b>${money(c.baseTotal||c.total)} تومان</b></div>
        ${c.extraOn?`<div><span>هزینه مازاد ${F(c.extraPct||INST_EXTRA_PCT)}٪</span><b>+ ${money(c.extraAmt||0)} تومان</b></div>`:''}
        ${c.profitOn?`<div><span>سود ${F(c.profitPct||INST_PROFIT_PCT)}٪</span><b>+ ${money(c.profitAmt||0)} تومان</b></div>`:''}
        <div class=cprice-sum-final><span>مبلغ نهایی</span><b>${money(c.total)} تومان</b></div>
      </div>`:''}
      ${Number(c.latePctDaily)?`<p class=fd style="margin:6px 0 0">نرخ پیش‌فرض جریمه دیرکرد: <b>${F(c.latePctDaily)}٪</b> از مبلغ هر قسط به‌ازای هر روز تأخیر</p>`:''}
      ${all!=c.total?`<p class=warn-line>جمع اقساط (${money(all)}) با مبلغ کل قرارداد (${money(c.total)}) برابر نیست.</p>`:''}
    </section>

    <div class=file-cols>
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
          ${fig('کد ملی',F(cu.nid||'—'))}
          ${fig('نام پدر',esc(cu.father||'—'))}
        </dl>
        ${cu.id?`<button class="sm btn-soft" style="margin-top:12px" onclick="go('cv','${cu.id}')">پرونده مشتری</button>`:''}
      </section>
      <section class=file-sec>
        <h3 class=file-h>واحد و اقساط</h3>
        <dl class=fig>
          ${fig('پروژه',esc(pr?.name||'—'))}
          ${fig('واحد',esc(u.no||'—')+(u.area?` · ${F(u.area)} م²`:''))}
          ${fig('اقساط باقی‌مانده',F(unpaid.length))}
          ${fig('اقساط معوق',late.length?`<span class="chip late">${F(late.length)}</span>`:F(0))}
        </dl>
      </section>
    </div>
  </article>

  <section class="units-panel noprint">
    <div class=u-head>
      <h3>جدول اقساط <span class=count>${F((c.inst||[]).length)}</span></h3>
      <div class=u-tools>
        ${can('write')?`<label class=sw><input type=checkbox ${c.auto!==false?'checked':''} onchange="setAuto('${c.id}',this.checked)"><span>محاسبه خودکار مانده</span></label>
        <button class="btn-soft sm" onclick="addI('${c.id}')"><span class=plus>+</span> ردیف جدید</button>`:''}
      </div>
    </div>
    <div class=inst-pad>
      ${(c.inst||[]).length?`<div class=inst-grid>${(c.inst||[]).map(i=>instCardHtml(c,i)).join('')}</div>`:empty('هنوز قسطی ثبت نشده است. با «ردیف جدید» یک قسط اضافه کنید.')}
    </div>
  </section>
  ${facV(c)}
 </div>`;
}
const gi=id=>{for(const c of S.contracts){const i=c.inst.find(x=>x.id==id);if(i)return[c,i]}};
function startInstEdit(id){INST_EDIT=id;render()}
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
  askConfirm({title:'تأیید ذخیره قسط',body:`<p>«${esc(title)}» به مبلغ <b>${money(amt)}</b> و سررسید <b>${F(date)}</b> ذخیره شود؟</p>`},()=>{
    i.amt=amt;i.date=date;i.kind=lump?'lump':'';
    if(lateRaw==='')delete i.latePctDaily;else i.latePctDaily=num(lateRaw);
    if(lump){i.title=/الباقی|نقدی/.test(title)?title:'الباقی نقدی'}
    else{i.title=title==='الباقی نقدی'?'قسط':title}
    if(c.auto!==false&&!i.paid&&!lump)redist(c,i);
    c.inst.sort((a,b)=>a.date<b.date?-1:1);
    if(c.ed)delete c.ed.c;
    INST_EDIT=null;save();render();toast('قسط ذخیره شد');return true;
  });
}
function setI(id,k,v){const pair=gi(id);if(!pair)return;const[c,i]=pair;if(k=='amt'){i.amt=num(v);if(c.auto!==false&&!i.paid)redist(c,i)}else if(k=='date'){const d=normJ(v);if(!d)return toast('تاریخ معتبر نیست');i.date=d}else i.title=v;c.inst.sort((a,b)=>a.date<b.date?-1:1);save();render()}
function openPayModal(id,opts){
  opts=opts||{};
  const pair=gi(id);if(!pair)return;const[c,i]=pair;
  const pct=instLatePct(c,i);
  const m=$('#modal');
  const initDate=opts.pdate||i.pdate||todayJ();
  const initRef=opts.ref!=null?opts.ref:(i.ref||'');
  const initNote=opts.note!=null?opts.note:(i.lateNote||'');
  const paint=()=>{
    const pEl=m.querySelector('[name=pdate]'),rEl=m.querySelector('[name=ref]'),fEl=m.querySelector('[name=lateFee]'),nEl=m.querySelector('[name=lateNote]');
    const pdate=normJ(pEl?.value||'')||todayJ();
    const days=Math.max(0,daysBetween(i.date,pdate));
    const calc=calcLateFee(i.amt,pct,days);
    if(fEl&&fEl.dataset.touched!=='1'){fEl.value=calc?F(calc.toLocaleString('en')):'0'}
    const fee=num(fEl?.value);
    const sumPay=i.amt+fee;
    const hint=m.querySelector('#lateHint');
    if(hint)hint.innerHTML=days>0
      ?`تأخیر <b>${F(days)}</b> روز از سررسید ${F(i.date)} · نرخ <b>${F(pct)}٪</b> روزانه · محاسبه سیستم: <b>${money(calc)}</b> تومان${fee!==calc?` · اعمال فعلی: <b>${money(fee)}</b> تومان`:''}`
      :`بدون تأخیر؛ جریمه صفر است (در صورت نیاز می‌توانید دستی مقدار بگذارید).`;
    const tot=m.querySelector('#payTotal');
    if(tot)tot.innerHTML=`اصل قسط <b>${money(i.amt)}</b> + جریمه <b>${money(fee)}</b> = <b>${money(sumPay)}</b> تومان`;
  };
  m.innerHTML=`<div class=box><h3 style="margin-top:0">${opts.edit?'ویرایش پرداخت':'ثبت پرداخت'}</h3>
    <p class=fd>${esc(i.title||'قسط')} · اصل ${money(i.amt)} تومان · سررسید ${F(i.date)}</p>
    <div class=grid>
      <label>تاریخ پرداخت<input name=pdate readonly style="cursor:pointer"></label>
      <label>شماره پیگیری<input name=ref></label>
      <label>جریمه نهایی (تومان)<input name=lateFee inputmode=numeric></label>
      <label class=w>یادداشت تعدیل / لغو جریمه<textarea name=lateNote rows=2 placeholder="اگر جریمه را کمتر یا صفر کردید، دلیل را بنویسید"></textarea></label>
    </div>
    <p class=fd id=lateHint></p>
    <p id=payTotal style="margin:8px 0 0"></p>
    <div class=act style="margin-top:12px">
      <button type=button class=sm data-act=resetLate>بازنشانی جریمه به محاسبه</button>
      <button type=button class=sm data-act=waiveLate>بدون جریمه</button>
      <button type=button class=pri id=ok>${opts.edit?'ذخیره تغییرات':'ثبت پرداخت'}</button>
      <button type=button onclick="closeM()">انصراف</button>
    </div>
  </div>`;
  m.classList.add('on');
  const pEl=m.querySelector('[name=pdate]'),rEl=m.querySelector('[name=ref]'),fEl=m.querySelector('[name=lateFee]'),nEl=m.querySelector('[name=lateNote]');
  pEl.value=F(initDate);rEl.value=initRef;nEl.value=initNote;
  const days0=Math.max(0,daysBetween(i.date,initDate));
  const calc0=calcLateFee(i.amt,pct,days0);
  const initFee=opts.fee!=null?opts.fee:(opts.edit?(Number(i.lateFee)||0):calc0);
  fEl.value=initFee?F(Math.round(initFee).toLocaleString('en')):'0';
  if(opts.edit&&(Number(i.lateFee)||0)!==(Number(i.lateCalc)||0))fEl.dataset.touched='1';
  pEl.onclick=()=>dpick(pEl,()=>{fEl.dataset.touched='';paint()});
  fEl.oninput=()=>{fEl.dataset.touched='1';fmtIn(fEl);paint()};
  paint();
  $('#ok').onclick=async()=>{
    const pdate=normJ(pEl.value);if(!pdate)return toast('تاریخ پرداخت معتبر نیست');
    const ref=rEl.value.trim();
    if(!assertPayRef(ref,{kind:'inst',id:i.id}))return;
    const days=Math.max(0,daysBetween(i.date,pdate));
    const calc=calcLateFee(i.amt,pct,days);
    const fee=num(fEl.value);
    const note=(nEl.value||'').trim();
    if(fee!==calc&&!note)return toast('چون مبلغ جریمه با محاسبه سیستم تفاوت دارد، یادداشت دلیل را بنویسید');
    askConfirm({title:opts.edit?'تأیید ویرایش پرداخت':'تأیید ثبت پرداخت',body:`<p>${esc(i.title||'قسط')} ثبت شود؟</p><div class=confirm-summary><p>تاریخ پرداخت: <b>${F(pdate)}</b>${ref?' · پیگیری '+F(ref):''}</p><p>اصل: <b>${money(i.amt)}</b> · جریمه: <b>${money(fee)}</b>${fee!==calc?` (محاسبه ${money(calc)})`:''}</p><p>جمع قابل پرداخت: <b>${money(i.amt+fee)}</b></p>${note?`<p class=fd>${esc(note)}</p>`:''}</div>`},()=>{
      i.paid=true;i.pdate=pdate;i.ref=ref;i.lateDays=days;i.lateCalc=calc;i.lateFee=fee;i.lateNote=note;
      save();render();toast(opts.edit?'پرداخت به‌روز شد':'پرداخت ثبت شد');return true;
    });
  };
  m.querySelector('[data-act=resetLate]').onclick=()=>{fEl.dataset.touched='';paint()};
  m.querySelector('[data-act=waiveLate]').onclick=()=>{fEl.dataset.touched='1';fEl.value='0';paint()};
}
const pay=id=>openPayModal(id);
const editPay=id=>openPayModal(id,{edit:true});
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
const allPays=()=>[...S.reservations.flatMap(r=>r.pays.map(p=>({...p,r}))),...S.contracts.flatMap(c=>c.inst.filter(i=>i.paid&&i.ref).map(i=>({ref:i.ref,c}))),...(S.ledger||[]).filter(r=>r.ref).map(r=>({ref:r.ref,ledger:r}))];
const dupRef=(x,except)=>!!findPayRefHit(x,except);
const lg=(r,t,by)=>(r.log=r.log||[]).push({d:todayJ(),h:new Date().toTimeString().slice(0,5),by:by||S.me||'—',t});
const rPaid=r=>sum(r.pays,p=>p.amt),RF=()=>S.cfg.fine||30000000,RD=()=>S.cfg.days||20;
const PF=[{k:'payer',l:'نام صاحب حساب مبدأ (پرداخت‌کننده)',r:1,on:(m,f)=>{if(f){const e=m.querySelector('[name=cust]');if(e)m.querySelector('[name=payer]').value=cust(e.value).name}}},{k:'acct',l:'شماره حساب/کارت مبدأ',r:1},{k:'ref',l:'شماره پیگیری / فیش',r:1},{k:'rel',l:'رابطه با مشتری (فقط پرداخت شخص ثالث)'},{k:'appv',l:'تأییدکننده مدیریتی (فقط شخص ثالث)'}];
function mkPay(v,c){if(!assertPayRef(v.ref))return;
 const tp=nm(v.payer)!=nm(c.name);if(tp&&(!v.rel||!v.appv)){toast('پرداخت‌کننده با مشتری یکی نیست؛ رابطه و تأییدکننده مدیریتی را ثبت کنید');return}
 return{id:'پ-'+F(S.pn=(S.pn||1000)+1),amt:v.amt,date:v.date||v.pdate,ref:v.ref,acct:v.acct,payer:v.payer,tp,rel:v.rel,appv:v.appv,s:'ok'}}
function res(){return `<div class=top><h2>رزروها و رزرونامه‌ها</h2><div><button onclick="chkF()">استعلام فیش</button> <button onclick="cfgR()">تنظیمات رویه رزرو</button> <button class=pri onclick="addR()">رزرو جدید</button></div></div>${sb()}${S.reservations.length?tbl(['شماره','مشتری','واحد','پرداخت‌شده','مانده','مهلت','وضعیت',''],S.reservations.map(r=>{const pd=rPaid(r),d=diff(r.deadline),a=r.st=='active';return `<tr data-s="${esc(N(r.no+cust(r.cust).name+cust(r.cust).phone+unitTxt(r.proj,r.unit)))}"><td>${r.no}</td><td>${esc(cust(r.cust).name)}</td><td>${esc(unitTxt(r.proj,r.unit))}</td><td>${money(pd)}</td><td>${money(Math.max(0,r.need-pd))}</td><td>${F(r.deadline)}${a&&pd<r.need?` <span class="badge ${d<0?'bad':d<=7?'warn':'ok'}">${d<0?F(-d)+' روز گذشته':F(d)+' روز'}</span>`:''}</td><td>${RS[r.st]}${r.st=='cancelling'?' – '+CS[r.cancel.h.length]:''}</td><td><button class="sm pri" onclick="go('rd','${r.id}')">پرونده</button>${canDeleteRec()?` <button class="sm x" onclick="delR('${r.id}')">حذف</button>`:''}</td></tr>`}).join('')):empty('رزروی ثبت نشده است.')}`}
function addR(pre){pre=pre||{};if(!S.customers.length||!unitOpts().length)return toast('ابتدا یک مشتری و یک واحد آزاد ثبت کنید');
 form('رزرو جدید',[{k:'cust',l:'مشتری',t:'select',o:S.customers.map(c=>[c.id,c.name+' – '+c.nid]),on:(m,f)=>{if(!f)m.querySelector('[name=payer]').value=cust(m.querySelector('[name=cust]').value).name}},{k:'unit',l:'واحد',t:'select',o:unitOpts()},{k:'need',l:'مبلغ تسویه اولیه (پیش‌پرداخت کامل)',t:'money',r:1},{k:'fine',l:'مبلغ کسر در صورت لغو',t:'money',d:RF()},{k:'amt',l:'مبلغ پرداختی بابت رزرو',t:'money',r:1},{k:'pdate',l:'تاریخ پرداخت',d:todayJ(),j:1,r:1},...PF,{k:'deadline',l:'مهلت تسویه اولیه',j:1,r:1,d:addD(todayJ(),RD())},{k:'by',l:'ثبت‌کننده',r:1,d:S.me||''},{k:'appr',l:'تأییدکننده رزرو',r:1}],pre,v=>{
 const[pid,unit]=v.unit.split('|');if(unitOf(pid,unit).st!='free'){toast('این واحد دیگر آزاد نیست');return false}
 const p=mkPay(v,cust(v.cust));if(!p)return false;S.me=v.by;
 const r={id:uid(),no:nextReserveNo(v.pdate),cust:v.cust,proj:pid,unit,need:v.need,fine:v.fine,deadline:v.deadline,date:v.pdate,st:'active',pays:[p],by:v.by,appr:v.appr,log:[]};
 lg(r,`ثبت رزرو و قفل شدن واحد؛ پرداخت ${p.id} به مبلغ ${T(p.amt)} از حساب ${esc(p.payer)}؛ تأییدکننده: ${v.appr}`,v.by);S.reservations.push(r);setSt(pid,unit,'res');save();go('rd',r.id)})}
const payR=id=>{const r=S.reservations.find(x=>x.id==id);form('پرداخت جدید رزرو',[{k:'amt',l:'مبلغ (تومان)',t:'money',r:1},{k:'date',l:'تاریخ',d:todayJ(),j:1,r:1},...PF,{k:'by',l:'ثبت‌کننده',r:1,d:S.me||''}],{payer:cust(r.cust).name},v=>{const p=mkPay(v,cust(r.cust));if(!p)return false;S.me=v.by;r.pays.push(p);lg(r,`پرداخت ${p.id} به مبلغ ${T(p.amt)} ثبت شد (فیش ${F(p.ref)})`,v.by);save();render()})};
const cancelR=id=>{const r=S.reservations.find(x=>x.id==id);form('ثبت درخواست لغو رزرو',[{k:'reason',l:'علت لغو',t:'area',w:1,r:1},{k:'date',l:'تاریخ درخواست',d:todayJ(),j:1,r:1},{k:'fine',l:'مبلغ کسر بابت لغو (قابل تنظیم)',t:'money',d:r.fine||RF()},{k:'by',l:'ثبت‌کننده',r:1,d:S.me||''}],0,v=>{const paid=rPaid(r);r.st='cancelling';r.fine=v.fine;r.cancel={reason:v.reason,date:v.date,fine:v.fine,refund:Math.max(0,paid-v.fine),h:[{s:0,d:v.date,by:v.by,doc:''}]};S.me=v.by;lg(r,`درخواست لغو ثبت شد (واحد تا تسویه نهایی قفل می‌ماند). علت: ${v.reason}. پرداختی ${T(paid)}، کسر ${T(v.fine)}، قابل استرداد ${T(r.cancel.refund)}`,v.by);save();render()})};
function nextC(id){const r=S.reservations.find(x=>x.id==id),k=r.cancel.h.length,need=k==3||k==5;form('مرحله: '+CS[k],[{k:'date',l:'تاریخ انجام',d:todayJ(),j:1,r:1},{k:'doc',l:need?'شماره چک / حواله / سند':'شماره سند (اختیاری)',r:need},{k:'by',l:'انجام‌دهنده',r:1,d:S.me||''}],0,v=>{r.cancel.h.push({s:k,d:v.date,by:v.by,doc:v.doc});S.me=v.by;lg(r,`مرحله «${CS[k]}» انجام شد${v.doc?' – سند '+F(v.doc):''}`,v.by);if(k==5)r.pays.forEach(p=>p.s='ref');if(k==CS.length-1){r.st='cancel';r.pays.forEach(p=>p.s='closed');setSt(r.proj,r.unit,'free');lg(r,'تسویه نهایی؛ پرونده مختومه و واحد آزاد شد',v.by)}save();render()})}
const toC=id=>{const r=S.reservations.find(x=>x.id==id);addC({cust:r.cust,unit:r.proj+'|'+r.unit,total:unitSaleTotal(unitOf(r.proj,r.unit)),down:rPaid(r),resId:id,rdate:r.pays[r.pays.length-1].date})};
const cfgR=()=>form('تنظیمات رویه رزرو',[{k:'fine',l:'مبلغ کسر پیش‌فرض لغو (تومان)',t:'money',d:RF()},{k:'days',l:'مهلت پیش‌فرض تکمیل وجه (روز)',d:String(RD())}],0,v=>{S.cfg={fine:v.fine,days:parseInt(N(v.days))||20};save();toast('تنظیمات ذخیره شد')});
const chkF=()=>form('استعلام فیش / پرداخت',[{k:'ref',l:'شماره فیش، پیگیری یا شناسه پرداخت',r:1}],0,v=>{
  const q=refKey(v.ref);
  const hit=findPayRefHit(v.ref);
  const h=allPays().filter(p=>refKey(p.ref||'')==q||refKey(p.id||'')==q);
  const lines=h.length?h.map(p=>{
    if(p.r)return `<p>پرداخت ${p.id||''} (${T(p.amt)}) – ${esc(cust(p.r.cust).name)} – ${p.r.no} – ${esc(unitTxt(p.r.proj,p.r.unit))} – ${PS[p.s]||'تأییدشده'} – رزرو: ${RS[p.r.st]}</p>`;
    if(p.c)return `<p>قبلاً بابت قسط قرارداد ${p.c.no} (${esc(cust(p.c.cust).name)}) ثبت شده است.</p>`;
    if(p.ledger)return `<p>قبلاً در حسابداری ثبت شده است${p.ledger.desc?' – '+esc(p.ledger.desc):''} (${T(p.ledger.amt||0)}).</p>`;
    return '';
  }).join(''):(hit?`<p class=warn-line>شماره پیگیری تکراری است — قبلاً در ${esc(hit.kind)}${hit.no?' '+esc(hit.no):''}${hit.who?' ('+esc(hit.who)+')':''} ثبت شده.</p>`:'<p>این شماره تاکنون در سامانه ثبت نشده است.</p>');
  $('#modal').innerHTML=`<div class=box><h3 style="margin-top:0">نتیجه استعلام</h3>${lines}<div class=act><button onclick=closeM()>بستن</button></div></div>`;
  return false;
});
function msgs(id){const r=S.reservations.find(x=>x.id==id),c=cust(r.cust),u=unitTxt(r.proj,r.unit),p=rPaid(r),k=r.cancel||{fine:r.fine,refund:0},n=c.name,L=[['تأیید ثبت رزرو',`${n} عزیز، سلام و احترام.\nرزرو ${u} با دریافت ${T(p)} ثبت شد و واحد تا تاریخ ${F(r.deadline)} به نام شما نگه‌داری می‌شود. از اعتماد شما سپاسگزاریم و در تمام مراحل در کنار شما هستیم.\n${COMPANY}`],['یادآوری مهلت تکمیل وجه',`${n} عزیز، سلام و وقت بخیر.\nبه‌عنوان یادآوری دوستانه، مهلت تکمیل وجه رزرو ${u} تا تاریخ ${F(r.deadline)} است و مانده مبلغ ${T(Math.max(0,r.need-p))} می‌باشد. اگر برای هماهنگی یا تمدید مهلت نیاز به راهنمایی دارید، همکاران ما آماده‌اند.\n${COMPANY}`],['اطلاع‌رسانی لغو رزرو',`${n} عزیز، سلام و احترام.\nدرخواست لغو رزرو ${u} ثبت شد و شرایط شما را به‌خوبی درک می‌کنیم. طبق رزرونامه، از مبلغ پرداختی ${T(p)}، مبلغ ${T(k.fine)} کسر و ${T(k.refund)} به شما مسترد خواهد شد. مراحل تسویه طبق روال شرکت پیگیری می‌شود و از هر مرحله به شما اطلاع می‌دهیم.\n${COMPANY}`],['آماده بودن چک/وجه استرداد',`${n} عزیز، سلام و وقت بخیر.\nمبلغ استرداد رزرو ${u} آماده تحویل است. لطفاً با همراه داشتن مدارک لازم به دفتر مراجعه فرمایید تا مراحل تسویه نهایی انجام شود.\n${COMPANY}`]];
 $('#modal').innerHTML=`<div class=box><h3 style="margin-top:0">پیام‌های آماده – ${esc(n)}</h3>${L.map((m,i)=>`<label>${m[0]}<textarea rows=5 id=m${i}>${esc(m[1])}</textarea></label><button class=sm onclick="cp(${i})">کپی</button><hr>`).join('')}<div class=act><a class=ph href="tel:${N(c.phone||'')}">☎ ${F(c.phone||'')}</a><button onclick=closeM()>بستن</button></div></div>`;$('#modal').classList.add('on')}
const cp=i=>{const t=$('#m'+i);t.select();try{navigator.clipboard.writeText(t.value)}catch(e){document.execCommand('copy')}toast('کپی شد')};
function rd(){const r=S.reservations.find(x=>x.id==V.id);if(!r)return res();const c=cust(r.cust),pd=rPaid(r),rem=Math.max(0,r.need-pd),d=diff(r.deadline),a=r.st=='active',k=r.cancel,cur=k?k.h.length:0;
 return `<div class=top><h2>پرونده رزرو ${r.no}</h2><div class=noprint><button onclick="go('res')">بازگشت</button> <button onclick="msgs('${r.id}')">پیام‌های آماده</button> <button onclick="openDoc('${r.id}','res')">رزرونامه (چاپ)</button>${a?` <button onclick="payR('${r.id}')">پرداخت جدید</button> <button class=pri onclick="toC('${r.id}')">تبدیل به قرارداد</button> <button class=x onclick="cancelR('${r.id}')">درخواست لغو</button>`:''}${canDeleteRec()?` <button class="btn-ghost danger" onclick="delR('${r.id}')">حذف کامل</button>`:''}</div></div>
 <p>مشتری: <b>${esc(c.name)}</b> ☎ ${F(c.phone||'—')} | واحد: <b>${esc(unitTxt(r.proj,r.unit))}</b> | وضعیت: <span class="badge ${a?'warn':r.st=='cancel'?'bad':r.st=='conv'?'ok':''}">${RS[r.st]}</span> ${a&&d<0&&rem>0?'<span class="badge bad">مهلت گذشته؛ نیازمند تعیین تکلیف</span>':''}</p>
 <div class=stats><div class=st><b>${money(pd)}</b><span>پرداخت‌شده (تومان)</span></div><div class=st><b>${money(r.need)}</b><span>تسویه اولیه</span></div><div class=st><b>${money(rem)}</b><span>مانده تا تکمیل</span></div><div class=st><b>${F(r.deadline)}</b><span>مهلت (${d<0?F(-d)+' روز گذشته':F(d)+' روز مانده'})</span></div><div class=st><b>${esc(r.by||'—')} / ${esc(r.appr||'—')}</b><span>ثبت‌کننده / تأییدکننده</span></div></div>
 ${k?`<h3>فرآیند لغو و استرداد</h3><div class=st style="margin-bottom:10px">علت: ${esc(k.reason)}<br>پرداختی ${T(pd)} − کسر ${T(k.fine)} = <b>قابل استرداد ${T(k.refund)}</b></div><div class=fcs>${CS.map((s,i)=>{const h=k.h[i];return `<div class="fc ${h?'okish':i==cur?'today':''}"><b>${F(i+1)}. ${s}</b><span class=fd>${h?F(h.d)+' – '+esc(h.by)+(h.doc?' – سند '+F(h.doc):''):i==cur?'مرحله جاری':'در انتظار'}</span></div>`}).join('')}</div>${r.st=='cancelling'?`<button class="pri noprint" onclick="nextC('${r.id}')">انجام مرحله: ${CS[cur]}</button>`:''}`:''}
 <h3>پرداخت‌ها</h3>${tbl(['شناسه یکتا','تاریخ','مبلغ','پرداخت‌کننده (صاحب حساب)','حساب مبدأ','فیش / پیگیری','وضعیت'],r.pays.map(p=>`<tr><td>${p.id||'—'}</td><td>${F(p.date)}</td><td>${money(p.amt)}</td><td>${esc(p.payer||'—')}${p.tp?` <span class="badge warn">شخص ثالث – ${esc(p.rel||'')} – تأیید: ${esc(p.appv||'')}</span>`:''}</td><td>${F(p.acct||'—')}</td><td>${F(p.ref||'—')}</td><td><span class="badge ${p.s=='closed'?'':'ok'}">${PS[p.s]||'تأییدشده'}</span></td></tr>`).join(''))}
 <h3>گزارش رویدادها (فقط افزودنی و غیرقابل ویرایش)</h3>${tbl(['تاریخ','ساعت','کاربر','رویداد'],(r.log||[]).map(l=>`<tr><td>${F(l.d)}</td><td>${F(l.h)}</td><td>${esc(l.by)}</td><td style="white-space:normal">${esc(l.t)}</td></tr>`).join('')||'<tr><td colspan=4>—</td></tr>')}`}
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
          <strong>${esc(leadHistKindLabel(ev.kind))}</strong>
          <time class=tl-when>${F(ev.d||'—')}${ev.h?` · ساعت ${F(ev.h)}`:''}</time>
        </div>
        ${moved?`<div class=tl-flow><span>${esc(from)}</span><span class=tl-arrow>←</span><span class=on>${esc(to)}</span></div>`
          :(to?`<div class=tl-flow><span class=on>${esc(to)}</span></div>`:'')}
        ${ev.vcName?`<div class=fd>هماهنگ‌کننده: ${esc(ev.vcName)}${ev.vcPhone?' · '+F(ev.vcPhone):''}</div>`:''}
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
    <p class=fd style="margin:0 0 12px"><b>${esc(l.name)}</b> · ${F(l.phone)} · الان در «${esc(LS[l.stage]||'—')}»</p>
    <div class=hist-scroll>${leadHistHtml(l)}</div>
    <div class=act>
      <button type=button class=pri onclick="closeM();go('lv','${l.id}')">پرونده کامل</button>
      <button type=button onclick="closeM()">بستن</button>
    </div>
  </div>`;
  m.classList.add('on');
}
function leadPipeHtml(l,sel){
  const cur=+l.stage;
  const steps=LS.slice(0,9).map((s,i)=>{
    const st=i<cur?'done':i===cur?'on':(sel===i&&sel!==cur?'pick':'');
    const click=can('write')?`onclick="pickLeadStage('${l.id}',${i})"`:'';
    return `<li class="lp-item ${st}">
      <span class=lp-rail aria-hidden=true></span>
      <button type=button class="lp-step ${st}" ${click} ${!can('write')?'disabled':''}>
        <span class=lp-n>${F(i+1)}</span>
        <span class=lp-t>${esc(s)}</span>
        ${i===cur?'<span class=lp-now>مرحله فعلی</span>':i<cur?'<span class=lp-done-lab>عبور کرده</span>':''}
      </button>
    </li>`;
  }).join('');
  const lost=cur===9
    ?`<li class="lp-item lost"><span class=lp-rail aria-hidden=true></span><span class="lp-step lost"><span class=lp-n>×</span><span class=lp-t>${esc(LS[9])}</span></span></li>`
    :(can('write')?`<li class="lp-item lost"><span class=lp-rail aria-hidden=true></span><button type=button class="lp-step lost-btn" onclick="pickLeadStage('${l.id}',9)"><span class=lp-n>×</span><span class=lp-t>${esc(LS[9])}</span></button></li>`:'');
  return `<ol class="lead-pipe" role="list" aria-label="مسیر مراحل سرنخ">${steps}${lost}</ol>`;
}
function visitActionHtml(l){
  if(!VISIT_STAGES.has(+l.stage)&&!l.vcName&&!l.visitAt&&!l.visitDoneAt)return '';
  const p=proj(l.proj),vc=l.vcName?{name:l.vcName,phone:l.vcPhone}:{name:p?.vcName||'',phone:p?.vcPhone||''};
  return `<div class="panel visit-panel">
    <div class=panel-k>اقدام فعلی · هماهنگی بازدید</div>
    <div class=panel-title>${esc(p?.name||'پروژه مشخص نشده')}</div>
    <div class=info-grid>
      <div><span class=k>هماهنگ‌کننده</span><b>${esc(vc.name||'تعریف نشده')}</b></div>
      <div><span class=k>تماس</span>${vc.phone?`<a class=ph href="tel:${N(vc.phone)}">${F(vc.phone)}</a>`:'<b>—</b>'}</div>
      <div><span class=k>زمان بازدید</span><b>${l.visitAt?F(l.visitAt):'هنوز تنظیم نشده'}</b></div>
      <div><span class=k>وضعیت</span><b>${l.visitDoneAt?'انجام‌شده · '+F(l.visitDoneAt):esc(LS[l.stage])}</b></div>
    </div>
    ${p?.vcNote?`<p class=fd>${esc(p.vcNote)}</p>`:''}
    ${can('write')&&+l.stage===2?`<div class=act><button class=pri onclick="markVisitDone('${l.id}')">بازدید انجام شد و برو مرحله بعد</button></div>`:''}
  </div>`;
}
function leadCardHtml(l){
  const d=l.next?diff(l.next):null;
  const p=proj(l.proj);
  const visit=VISIT_STAGES.has(+l.stage);
  const vc=visit?(l.vcName||vcOf(l.proj).name):'';
  const search=N(l.name+l.phone+(l.src||'')+(l.rep||'')+(p?.name||'')+(vc||''));
  const histN=(l.h||[]).length;
  const write=can('write')||can('admin');
  return `<article class="lb-card ${visit?'visit':''}" data-s="${esc(search)}" data-id="${l.id}" data-stage="${l.stage}"
    ${write?'draggable=true ondragstart="leadDragStart(event)" ondragend="leadDragEnd(event)"':''}
    onclick="leadCardClick(event,'${l.id}')">
    ${write?`<span class=lb-grip title="بکشید و در مرحله دیگر رها کنید" aria-hidden=true></span>`:''}
    <div class=lb-card-top>
      <b>${esc(l.name)}</b>
      ${visit?`<span class="badge warn">بازدید</span>`:l.stage===9?`<span class="badge">لغو</span>`:''}
    </div>
    <div class=lb-lines>
      <div><span>پروژه</span><strong>${esc(p?.name||'—')}</strong></div>
      <div><span>مسئول</span><strong>${esc(l.rep||'—')}</strong></div>
      <div><span>تماس</span><strong><a class=ph href="tel:${N(l.phone)}" onclick="event.stopPropagation()">${F(l.phone)}</a></strong></div>
      ${visit?`<div><span>هماهنگ‌کننده</span><strong>${esc(vc||'—')}${l.visitAt?' · '+F(l.visitAt):''}</strong></div>`:''}
      ${l.next?`<div><span>پیگیری</span><strong class="${d<0?'bad-txt':d<=3?'warn-txt':''}">${F(l.next)}${d!=null?` (${d<0?F(-d)+' روز تأخیر':d==0?'امروز':F(d)+' روز'})`:''}</strong></div>`:''}
    </div>
    <div class=lb-card-foot onclick="event.stopPropagation()">
      <button type=button class="sm btn-ghost" onclick="showLeadHist('${l.id}')">تاریخچه${histN?` · ${F(histN)}`:''}</button>
      <button type=button class="sm pri" onclick="go('lv','${l.id}')">پرونده</button>
      ${write&&+l.stage===2?`<button type=button class=sm onclick="markVisitDone('${l.id}')">بازدید انجام شد</button>`:''}
    </div>
  </article>`;
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
  const L=S.leads;
  const focus=LEAD_FOCUS;
  const cols=LS.slice(0,9).map((s,i)=>({k:i,l:s,items:L.filter(x=>+x.stage===i)}));
  const lost=L.filter(x=>+x.stage===9);
  const visitN=L.filter(l=>VISIT_STAGES.has(+l.stage)).length;
  const boardCols=focus===9
    ?[{k:9,l:LS[9],items:lost}]
    :cols.filter(c=>focus==null||focus===c.k).concat(focus==null&&lost.length?[{k:9,l:LS[9],items:lost}]:focus==null?[{k:9,l:LS[9],items:lost}]:[]);
  return `<div class="top lead-top">
    <div>
      <h2>سرنخ‌ها و قیف فروش</h2>
      <p class=lead-sub>مراحل زیر هم چیده شده‌اند؛ کارت را به مرحله بعدی بکشید. قبل از انتقال تأیید می‌گیریم.</p>
    </div>
    ${can('write')?`<button class=pri onclick="addL()">سرنخ جدید</button>`:''}
  </div>
  <div class="funnel" role="tablist" aria-label="فیلتر مراحل">
    <button type=button class="funnel-step ${focus==null?'on':''}" onclick="filtLeadStage(null)"><b>${F(L.length)}</b><span>همه</span></button>
    ${cols.map(c=>`<button type=button class="funnel-step ${focus===c.k?'on':''} ${VISIT_STAGES.has(c.k)?'visit':''}" onclick="filtLeadStage(${c.k})">
      <b>${F(c.items.length)}</b><span>${esc(c.l)}</span>
    </button>`).join('')}
    <button type=button class="funnel-step lost ${focus===9?'on':''}" onclick="filtLeadStage(9)"><b>${F(lost.length)}</b><span>${esc(LS[9])}</span></button>
  </div>
  <div class=lead-toolbar>
    ${sb()}
    <div class=lead-tools>
      <span class=fd>${F(L.length)} سرنخ${visitN?` · ${F(visitN)} در صف بازدید`:''}${can('write')?' · بکشید و رها کنید':''}</span>
    </div>
  </div>
  ${L.length||focus!=null?`<div class="lead-board lead-journey">${boardCols.map((col,idx)=>`<section class="lb-col ${VISIT_STAGES.has(col.k)?'visit':''} ${col.k===9?'lost':''}" data-stage="${col.k}"
      ondragover="leadDragOver(event)" ondragleave="leadDragLeave(event)" ondrop="leadDrop(event)">
      <div class=lb-track aria-hidden=true><span class=lb-dot></span>${idx<boardCols.length-1?'<span class=lb-line></span>':''}</div>
      <header class=lb-h>
        <div><span class=lb-num>${col.k===9?'×':F(col.k+1)}</span><div><strong>${esc(col.l)}</strong><em class=lb-hint>رها کنید اینجا</em></div></div>
        <span class=count>${F(col.items.length)}</span>
      </header>
      <div class=lb-body data-stage="${col.k}" ondragover="leadDragOver(event)" ondragleave="leadDragLeave(event)" ondrop="leadDrop(event)">
        ${col.items.map(leadCardHtml).join('')||'<div class="lb-empty">خالی — کارت را اینجا رها کنید</div>'}
      </div>
    </section>`).join('')}</div>`:empty('هنوز سرنخی ثبت نشده است. با «سرنخ جدید» شروع کنید.')}`;
}
function filtLeadStage(k){LEAD_FOCUS=k==null?null:+k;render()}
function leadDetail(){
  if(!can('lead')&&!can('admin'))return empty('به سرنخ‌ها دسترسی ندارید');
  const l=S.leads.find(x=>x.id==V.id);if(!l)return `<div class=top><h2>پرونده سرنخ</h2><button onclick="go('lead')">بازگشت</button></div>${empty('سرنخ پیدا نشد.')}`;
  const draft=LEAD_DRAFT[l.id]||{stage:l.stage,note:'',visitAt:l.visitAt||''};
  const sel=+draft.stage,dirty=+sel!==+l.stage||!!(draft.note||'')||(draft.visitAt||'')!==(l.visitAt||'');
  const p=proj(l.proj),vc=vcOf(l.proj);
  const nextLabel=sel===l.stage?null:LS[sel];
  return `<div class=ld>
  <div class=ld-head>
    <div>
      <div class=fd>پرونده سرنخ</div>
      <h2>${esc(l.name)}</h2>
      <div class=ld-meta>
        <a class=ph href="tel:${N(l.phone)}">${F(l.phone)}</a>
        <span>${esc(l.src||'بدون منبع')}</span>
        <span>${esc(p?.name||'بدون پروژه')}</span>
        <span>مسئول: ${esc(l.rep||'—')}</span>
        ${l.next?`<span>پیگیری: ${F(l.next)}</span>`:''}
        ${l.loan==='yes'?'<span class="badge warn">تسهیلات</span>':''}
      </div>
      ${l.note?`<p class=ld-note>${esc(l.note)}</p>`:''}
    </div>
    <div class=ld-actions>
      <button onclick="go('lead')">بازگشت</button>
      ${can('write')?`<button onclick="editL('${l.id}')">ویرایش</button>`:''}
      ${l.cust?`<button class=pri onclick="go('cv','${l.cust}')">پرونده مشتری</button>`:(can('write')?`<button class=pri onclick="toCust('${l.id}')">تبدیل به مشتری</button>`:'')}
      ${canDeleteRec()?`<button class="btn-ghost danger" onclick="delLead('${l.id}')">حذف سرنخ</button>`:''}
    </div>
  </div>

  <section class=block>
    <div class=sec><h3>مسیر فروش</h3><span class=count>${esc(LS[l.stage])}</span></div>
    ${leadPipeHtml(l,sel)}
    <p class=fd>روی هر مرحله بزنید تا انتخاب شود؛ بعد یادداشت بنویسید و ذخیره کنید.</p>
  </section>

  <div class=ld-layout>
    <div class=ld-main>
      ${visitActionHtml(l)}
      <div class="panel ${dirty?'open':''}">
        <div class=panel-k>ثبت حرکت مرحله</div>
        <div class=panel-title>${nextLabel?`انتقال به «${esc(nextLabel)}»`:`مرحله فعلی: ${esc(LS[l.stage])}`}</div>
        ${VISIT_STAGES.has(sel)?`<div class=info-grid>
          <div><span class=k>هماهنگ‌کننده پروژه</span><b>${esc(vc.name||'تعریف نشده')}</b></div>
          <div><span class=k>تماس</span><b>${vc.phone?F(vc.phone):'—'}</b></div>
          <div class=span2><span class=k>تاریخ بازدید</span><input id=lsVisit readonly style="cursor:pointer" value="${F(draft.visitAt||'')}" placeholder="انتخاب تاریخ" onclick="dpick(this,d=>{LEAD_DRAFT['${l.id}']=Object.assign(LEAD_DRAFT['${l.id}']||{stage:${sel},note:($('#lsNote')||{}).value||''},{visitAt:d});this.value=F(d)})"></div>
        </div>`:''}
        <label class=field>یادداشت / نتیجه پیگیری<textarea id=lsNote rows=3 placeholder="چه هماهنگی شد؟ چه وعده‌ای گرفته شد؟">${esc(draft.note||'')}</textarea></label>
        <input type=hidden id=lsStage value="${sel}">
        <div class=act>
          ${can('write')?`<button class=pri ${dirty?'':'disabled'} onclick="commitLeadStage('${l.id}')">ذخیره مرحله</button>
          <button onclick="cancelLeadStage('${l.id}')">انصراف</button>`:'<span class=fd>فقط مشاهده</span>'}
        </div>
      </div>
    </div>
    <aside class=ld-side>
      <div class=panel>
        <div class=panel-k>خلاصه پرونده</div>
        <div class=info-grid tight>
          <div><span class=k>مرحله</span><b>${esc(LS[l.stage])}</b></div>
          <div><span class=k>پروژه</span><b>${esc(p?.name||'—')}</b></div>
          <div><span class=k>مسئول فروش</span><b>${esc(l.rep||'—')}</b></div>
          <div><span class=k>پیگیری بعدی</span><b>${l.next?F(l.next):'—'}</b></div>
        </div>
      </div>
      <div class="panel hist-panel">
        <div class=panel-k>تاریخچه کامل · ${F((l.h||[]).length)} رویداد</div>
        <p class=fd style="margin:0 0 10px">تاریخ، ساعت دقیق و نام انجام‌دهنده برای هر انتقال یا اقدام</p>
        ${leadHistHtml(l)}
      </div>
    </aside>
  </div>
 </div>`;
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
    pushLeadHist(l,{from:l.stage,to:l.stage,note:v.note?`ویرایش مشخصات · ${v.note}`:'ویرایش مشخصات سرنخ',kind:'edit',vcName:l.vcName||'',vcPhone:l.vcPhone||'',visitAt:l.visitAt||''});
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
function cuV(){const c=S.customers.find(x=>x.id==V.id);if(!c)return custV();const cs=S.contracts.filter(x=>x.cust==c.id),rv=S.reservations.filter(x=>x.cust==c.id),ls=S.leads.filter(x=>x.cust==c.id),k=c.kyc||{};
 return `<div class=top><h2>${esc(c.name)}</h2><div><button onclick="go('cust')">بازگشت</button> <button onclick="addR({cust:'${c.id}'})">رزرو</button> <button onclick="addC({cust:'${c.id}'})">قرارداد</button> ${(can('acct')||can('admin'))?`<button class=btn-soft onclick="openAcctForCustomer('${c.id}')">حسابداری / پرداخت</button>`:''} <button class=pri onclick="addN('${c.id}')">ثبت تماس</button> ${canDeleteRec()?`<button class="btn-ghost danger" onclick="delCu('${c.id}')">حذف کامل پرونده</button>`:''}</div></div><p>کد ملی ${F(c.nid)} | پدر: ${esc(c.father||'—')} | ☎ <a class=ph href="tel:${N(c.phone)}">${F(c.phone)}</a> | ${esc(c.addr||'')}</p>
 <div class=stats><div class=st><b>${F(cs.length)}</b><span>قرارداد</span></div><div class=st><b>${money(sum(cs,paidSum))}</b><span>پرداخت‌شده</span></div><div class=st><b>${money(sum(cs,x=>x.total-paidSum(x)))}</b><span>مانده قراردادها</span></div><div class=st><b>${F(rv.length)}</b><span>رزرو</span></div></div>
 <h3>مدارک و احراز هویت (${F(KY.filter(x=>k[x]).length)} از ${F(KY.length)})</h3><div class=wrap style="padding:8px 12px">${KY.map(x=>`<label style="display:flex;gap:8px;align-items:center"><input type=checkbox style="width:auto" ${k[x]?'checked':''} onchange="setK('${c.id}','${x}',this.checked)"> ${x}</label>`).join('')}</div>
 ${ls.length?`<h3>سرنخ</h3>`+tbl(['منبع','مرحله','مسئول','هماهنگ‌کننده بازدید','پیگیری بعدی',''],ls.map(l=>`<tr><td>${esc(l.src||'')}</td><td>${LS[l.stage]}</td><td>${esc(l.rep||'—')}</td><td>${esc(l.vcName||'—')}${l.vcPhone?' – '+F(l.vcPhone):''}</td><td>${l.next?F(l.next):'—'}</td><td><button class=sm onclick="go('lv','${l.id}')">پرونده سرنخ</button></td></tr>`).join('')):''}
 <h3>رزروها</h3>${rv.length?tbl(['شماره','واحد','پرداخت‌شده','وضعیت',''],rv.map(r=>`<tr><td>${r.no}</td><td>${esc(unitTxt(r.proj,r.unit))}</td><td>${money(rPaid(r))}</td><td>${RS[r.st]}</td><td><button class=sm onclick="go('rd','${r.id}')">پرونده</button></td></tr>`).join('')):empty('رزروی ندارد.')}
 <h3>قراردادها</h3>${cs.length?tbl(['شماره','نوع','واحد','مبلغ کل','پرداخت‌شده','مانده',''],cs.map(x=>`<tr><td>${x.no}</td><td>${typeName(x.type)}</td><td>${esc(unitTxt(x.proj,x.unit))}</td><td>${money(x.total)}</td><td>${money(paidSum(x))}</td><td>${money(x.total-paidSum(x))}</td><td><button class=sm onclick="go('cd','${x.id}')">باز کردن</button></td></tr>`).join('')):empty('قراردادی ندارد.')}
 <h3>تاریخچه تماس‌ها و پیگیری‌ها</h3>${(c.notes||[]).length?tbl(['تاریخ','ثبت‌کننده','شرح'],[...c.notes].reverse().map(n=>`<tr><td>${F(n.d)}</td><td>${esc(n.by)}</td><td style="white-space:normal">${esc(n.t)}</td></tr>`).join('')):empty('هنوز تماسی ثبت نشده است.')}`}
const dmDoc=(c,cu)=>{const L=(c.inst||[]).filter(i=>!i.paid&&diff(i.date)<=30);return `<div class=hd><span>شماره: ${c.no}</span><span>تاریخ: ${F(todayJ())}</span></div><h4>یادآوری / اظهارنامه پرداخت اقساط</h4><p>${esc(cu.name)} گرامی (کد ملی ${F(cu.nid)})؛ با سلام و احترام</p><p>بر اساس قرارداد ${c.no} مورخ ${F(c.date)} مربوط به ${esc(unitTxt(c.proj,c.unit))}، اقساط زیر سررسید شده یا نزدیک به سررسید است. خواهشمند است تا تاریخ‌های مقرر، وجه را از حساب بانکی متعلق به خودتان واریز و شماره پیگیری را به دفتر شرکت اعلام فرمایید. در صورت نیاز به هماهنگی، همکاران ما آماده راهنمایی هستند.</p>${L.length?tbl(['ردیف','شرح','مبلغ اصل','تخمین جریمه','سررسید','وضعیت'],L.map((i,k)=>{const d=diff(i.date),days=Math.max(0,-d),pct=instLatePct(c,i),fee=calcLateFee(i.amt,pct,days);return `<tr><td>${F(k+1)}</td><td>${esc(i.title)}</td><td>${money(i.amt)}</td><td>${days&&pct?money(fee)+` (${F(days)} روز × ${F(pct)}٪)`:'—'}</td><td>${F(i.date)}</td><td>${d<0?F(-d)+' روز تأخیر':d==0?'امروز':F(d)+' روز مانده'}</td></tr>`}).join('')):'<p>قسط سررسیدشده‌ای وجود ندارد.</p>'}<p>جمع اصل مبالغ: <b>${TW(sum(L,i=>i.amt))}</b></p>${Number(c.latePctDaily)?`<p class=fd>نرخ جریمه دیرکرد قرارداد: ${F(c.latePctDaily)}٪ از مبلغ قسط به‌ازای هر روز تأخیر.</p>`:''}${sg([COMPANY,'خریدار'])}`};
const rcDoc=(c,cu,i)=>{
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
    const status=i.paid?'پرداخت شد':(diff(i.date)<0?F(-diff(i.date))+' روز تأخیر':diff(i.date)===0?'سررسید امروز':F(diff(i.date))+' روز مانده');
    const note=i.paid?lateDocLine({...i,_latePctUsed:pct}):(days&&pct?`تخمین: ${F(days)} روز × ${F(pct)}٪`:'');
    return `<tr><td>${F(k+1)}</td><td>${esc(i.title||'قسط')}</td><td>${money(i.amt)}</td><td>${F(i.date)}</td><td>${status}</td><td>${i.paid?F(i.pdate||'—'):'—'}</td><td>${days?F(days):'—'}</td><td>${fee?money(fee):'—'}</td><td>${i.paid||fee?money(i.amt+fee):money(i.amt)}</td><td>${i.ref?F(i.ref):'—'}</td><td style="text-align:right;white-space:normal">${esc(note||'—')}</td></tr>`;
  }).join('');
  return `<div class=hd><span>شماره قرارداد: ${c.no}</span><span>تاریخ چاپ: ${F(todayJ())}</span></div>
  <h4>جدول اقساط و پرداخت‌ها</h4>
  <p>خریدار: <b>${esc(cu.name)}</b> · کد ملی ${F(cu.nid)} · ${esc(unitTxt(c.proj,c.unit))}</p>
  <p>مبلغ کل قرارداد: <b>${T(c.total)}</b> · پرداخت اصل: <b>${T(paidSum(c))}</b> · مانده: <b>${T(Math.max(0,c.total-paidSum(c)))}</b>${lateSum(c)?` · جریمه وصول‌شده: <b>${T(lateSum(c))}</b>`:''}</p>
  ${Number(c.latePctDaily)?`<p>نرخ پیش‌فرض جریمه دیرکرد: <b>${F(c.latePctDaily)}٪</b> از مبلغ هر قسط به‌ازای هر یک روز تأخیر از سررسید. فرمول: مبلغ قسط × نرخ٪ × تعداد روز تأخیر.</p>`:`<p class=fd>برای این قرارداد نرخ جریمه دیرکرد پیش‌فرض صفر است؛ در صورت تعریف روی قسط یا هنگام ثبت پرداخت اعمال می‌شود.</p>`}
  ${tbl(['ردیف','شرح','مبلغ اصل','سررسید','وضعیت','تاریخ پرداخت','روز تأخیر','جریمه','جمع','پیگیری','مستند جریمه'],rows)}
  ${sg([COMPANY,esc(cu.name)])}`;
};
function rstr(inp){if(!can('admin'))return toast('فقط مدیر می‌تواند بازیابی کند');const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const parsed=JSON.parse(r.result);const data=prepImport(parsed.data||parsed);if(!confirm('اطلاعات فعلی با فایل پشتیبان جایگزین شود؟'))return;applyState(data,S._v||0);save();render();toast('در حال بازیابی روی سرور…')}catch(e){toast('فایل پشتیبان معتبر نیست')}};r.readAsText(f);inp.value=''}
function repV(){if(!can('rep')&&!can('admin'))return empty('به گزارش‌ها دسترسی ندارید');const lv=l=>Math.max(...[l.stage,...(l.h||[]).map(x=>x.s)].filter(s=>s<9).concat([0])),LL=S.leads,od=S.contracts.flatMap(c=>(c.inst||[]).filter(i=>!i.paid&&diff(i.date)<0)),ag=[[1,30],[31,60],[61,1e9]].map(([a,b])=>sum(od.filter(i=>{const d=-diff(i.date);return d>=a&&d<=b}),i=>i.amt)),rv=S.reservations,grp=(f)=>[...new Set(LL.map(f))].map(g=>{const a=LL.filter(l=>f(l)==g);return `<tr><td>${esc(g||'—')}</td><td>${F(a.length)}</td><td>${F(a.filter(l=>lv(l)>=8).length)}</td><td>${a.length?F(Math.round(a.filter(l=>lv(l)>=8).length/a.length*100))+'٪':'—'}</td></tr>`}).join('');
 return `<div class=top><h2>گزارش‌ها و پشتیبان</h2><div>${can('admin')?`<button onclick="expData()">دانلود پشتیبان</button> <label class=sm style="display:inline-block;cursor:pointer;border:1px solid var(--line);border-radius:6px;padding:2px 9px;width:auto">بازیابی از فایل<input type=file accept=.json,.JSON hidden onchange="rstr(this)"></label>`:'<span style="color:var(--mut);font-size:12px">پشتیبان فقط برای مدیر فعال است</span>'}</div></div>
 <div class=stats><div class=st><b>${money(sum(od,i=>i.amt))}</b><span>مطالبات معوق (تومان)</span></div><div class=st><b>${money(ag[0])}</b><span>معوق تا ۳۰ روز</span></div><div class=st><b>${money(ag[1])}</b><span>معوق ۳۱ تا ۶۰ روز</span></div><div class=st><b>${money(ag[2])}</b><span>معوق بیش از ۶۰ روز</span></div><div class=st><b>${money(sum(rv.filter(r=>r.st=='cancel'&&r.cancel),r=>r.cancel.fine||0))}</b><span>مبالغ کسرشده بابت لغو</span></div></div>
 <h3>فروش و وصولی به تفکیک پروژه</h3>${S.projects.length?tbl(['پروژه','واحد','آزاد','رزرو','فروخته','ارزش فروش','وصول‌شده','مانده'],S.projects.map(p=>{const cs=S.contracts.filter(c=>c.proj==p.id);return `<tr><td>${esc(p.name)}</td><td>${F((p.units||[]).length)}</td><td>${F((p.units||[]).filter(u=>u.st=='free').length)}</td><td>${F((p.units||[]).filter(u=>u.st=='res').length)}</td><td>${F((p.units||[]).filter(u=>u.st=='sold').length)}</td><td>${money(sum(cs,c=>c.total))}</td><td>${money(sum(cs,paidSum))}</td><td>${money(sum(cs,c=>c.total-paidSum(c)))}</td></tr>`}).join('')):empty('پروژه‌ای ثبت نشده است.')}
 <h3>قیف فروش (تعداد سرنخی که به هر مرحله رسیده)</h3><div class=wrap style="padding:10px 14px">${LS.slice(0,9).map((s,i)=>{const n=LL.filter(l=>lv(l)>=i).length;return `<div style="display:flex;gap:10px;align-items:center;margin:4px 0"><span style="width:210px;flex:none">${s}</span><div style="flex:1;background:var(--in);border-radius:4px"><div style="width:${LL.length?n/LL.length*100:0}%;background:var(--acc);height:14px;border-radius:4px"></div></div><b style="width:36px">${F(n)}</b></div>`}).join('')||empty('سرنخی ثبت نشده است.')}</div>
 <h3>عملکرد منابع جذب</h3>${LL.length?tbl(['منبع','سرنخ','به قرارداد رسیده','نرخ تبدیل'],grp(l=>l.src)):empty('داده‌ای نیست.')}
 <h3>عملکرد مسئولان فروش</h3>${LL.length?tbl(['مسئول','سرنخ','به قرارداد رسیده','نرخ تبدیل'],grp(l=>l.rep)):empty('داده‌ای نیست.')}
 <h3>رزروها</h3><div class=stats><div class=st><b>${F(rv.filter(r=>r.st=='active').length)}</b><span>فعال</span></div><div class=st><b>${F(rv.filter(r=>r.st=='conv').length)}</b><span>تبدیل به قرارداد</span></div><div class=st><b>${F(rv.filter(r=>r.st=='cancelling').length)}</b><span>در حال لغو</span></div><div class=st><b>${F(rv.filter(r=>r.st=='cancel').length)}</b><span>لغو و تسویه‌شده</span></div></div>`}
// اسناد چاپی
const sg=(a)=>`<div class=sign>${a.map(x=>`<div>${x}</div>`).join('')}</div>`;
function doc(){const back=V.k=='res'?'res':(V.k=='acct'||V.k=='checks')?'acct':'cont';
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
  ${tbl(['ردیف','مبلغ اصل','جریمه','جمع','تاریخ قسط','تاریخ واریز','شماره پیگیری','توضیحات جریمه'],c.inst.map((i,k)=>{const fee=Number(i.lateFee)||0,pct=instLatePct(c,i);return `<tr><td>${F(k+1)}</td><td>${money(i.amt)}</td><td>${fee?money(fee):''}</td><td>${money(i.amt+fee)}</td><td>${F(i.date)}</td><td>${i.paid?F(i.pdate):''}</td><td>${i.ref?F(i.ref):''}</td><td style="white-space:normal;text-align:right">${esc(i.paid?lateDocLine({...i,_latePctUsed:pct}):'')}</td></tr>`}).join(''))}
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
 return bar+`<div class=paper><div class=hd><span>شماره: ${c.no}</span><span>تاریخ: ${F(c.date)}</span></div><p style="text-align:center">بسم الله الرحمن الرحیم</p><h4>قرارداد ${t.name}</h4>
 ${t.full?fullC(c,cu,p,u,t):`<p><b>ماده ۱ – طرفین:</b> ${t.a}: ${COMPANY}. ${t.b}: ${esc(cu.name)} فرزند ${esc(cu.father||'—')} کد ملی ${F(cu.nid)} شماره شناسنامه ${F(cu.bc||'—')} همراه ${F(cu.phone)} نشانی: ${esc(cu.addr||'—')}.</p>
 <p><b>ماده ۲ – موضوع:</b> ${t.name} یک واحد ${esc(u.kind||'')} به شماره <b>${esc(u.no)}</b> طبقه ${esc(u.floor||'—')} با متراژ ${F(u.area)} متر مربع در پروژه ${esc(p.name)} به نشانی ${esc(p.addr)} همراه با مشاعات و پارکینگ/انباری مرتبط، طبق مشخصات فنی توافق‌شده.</p>
 <p><b>ماده ۳ – ${t.dur}:</b> ${F(c.dur)} ماه از تاریخ ${F(c.date)}.</p>
 <p><b>ماده ۴ – ${t.pr} و نحوه پرداخت:</b> مبلغ کل <b>${TW(c.total)}</b> است که طبق جدول پیوست و به حساب اعلام‌شده توسط ${t.a} پرداخت می‌شود. تاریخ ثبت واریز در سامانه بانکی ملاک است.</p>
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
  try{ORG_UNITS=await api(can('admin')?'/api/units/all':'/api/units');if(V.n==='inbox'||V.n==='wd')render()}catch(e){if(e.message!=='auth')toast(e.message)}
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
async function openReferDialog(pre){
  if(!canRefer())return toast('اجازه ارجاع ندارید');
  pre=pre||{};
  if(!ORG_UNITS.length)await loadOrgUnits();
  if(!DIR_USERS.length)await loadDirectory();
  const units=(ORG_UNITS.filter(u=>u.active!==false));
  const legal=units.find(u=>u.code==='legal');
  const defaultUnit=pre.unitId||(pre.unitCode==='legal'&&legal?legal.id:'')||(legal?legal.id:(units[0]?.id||''));
  const m=$('#modal');
  const kindOpts=(LEGAL_OPTS.caseKinds||[{k:'text',l:'متن آزاد'},{k:'installment',l:'قسط'},{k:'contract',l:'قرارداد'},{k:'reservation',l:'رزرو'},{k:'report',l:'گزارش'}]).filter(k=>k.k!=='manual');
  m.innerHTML=`<div class=box style="max-width:560px"><h3 style="margin-top:0">ارجاع سازمانی</h3><div class=grid>
   <label>واحد مقصد<select name=unitId>${units.map(u=>`<option value="${u.id}" ${u.id===defaultUnit?'selected':''}>${esc(u.name)}</option>`).join('')}</select></label>
   <label>مسئول (اختیاری)<select name=assignedTo><option value="">— همه اعضای واحد —</option></select></label>
   <label>نوع<select name=kind>${kindOpts.map(k=>`<option value="${k.k}" ${(pre.kind||'text')===k.k?'selected':''}>${esc(k.l)}</option>`).join('')}</select></label>
   <label>اولویت<select name=priority><option value=normal>عادی</option><option value=high ${pre.priority==='high'?'selected':''}>بالا</option></select></label>
   <label class=w>عنوان<input name=title placeholder="خلاصه ارجاع"></label>
   <label class=w>توضیحات<textarea name=body rows=4 placeholder="شرح کار، انتظار، مهلت، نکات مهم…"></textarea></label>
  </div><div class=act><button type=button class=pri id=ok>ثبت ارجاع</button><button type=button onclick="closeM()">انصراف</button></div></div>`;
  m.classList.add('on');
  if(pre.title)m.querySelector('[name=title]').value=pre.title;
  if(pre.body)m.querySelector('[name=body]').value=pre.body;
  const fillMembers=()=>{
    const uid=m.querySelector('[name=unitId]').value;
    const unit=ORG_UNITS.find(u=>u.id===uid);
    const members=DIR_USERS.filter(u=>(u.unitIds||[]).includes(uid)||(unit?.memberIds||[]).includes(u.id));
    m.querySelector('[name=assignedTo]').innerHTML=`<option value="">— همه اعضای واحد —</option>`+members.map(u=>`<option value="${u.id}">${esc(u.name)}</option>`).join('');
  };
  fillMembers();
  m.querySelector('[name=unitId]').onchange=fillMembers;
  $('#ok').onclick=async()=>{
    const payload={
      unitId:m.querySelector('[name=unitId]').value,
      assignedTo:m.querySelector('[name=assignedTo]').value||undefined,
      kind:m.querySelector('[name=kind]').value,
      priority:m.querySelector('[name=priority]').value,
      title:m.querySelector('[name=title]').value.trim(),
      body:m.querySelector('[name=body]').value.trim(),
      contractId:pre.contractId,instId:pre.instId,reservationId:pre.reservationId,
      ledgerId:pre.ledgerId,checkId:pre.checkId,
    };
    if(pre.kind)payload.kind=pre.kind;
    if(!payload.unitId){toast('واحد مقصد را انتخاب کنید');return}
    if(payload.kind==='text'||payload.kind==='report'){if(!payload.title&&!payload.body){toast('عنوان یا توضیحات لازم است');return}}
    const btn=$('#ok');btn.disabled=true;
    try{
      const c=await api('/api/workcases',{method:'POST',body:JSON.stringify(payload)});
      toast('ارجاع ثبت شد');closeM();
      if(canInbox()){V={n:'wd',id:c.id};remember();loadInbox()}else render();
    }catch(e){if(e.message!=='auth')toast(e.message)}
    finally{if($('#ok'))$('#ok').disabled=false}
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
async function loadLegal(){
  if(!can('legal'))return;
  try{
    const body=await api('/api/legal/cases');
    LEGAL=body.cases||[];LEGAL_STATS=body.stats||{};
    if(body.settings)S.cfg={...S.cfg,...body.settings};
    if(V.n==='legal'||V.n==='ld')render();
  }catch(e){if(e.message!=='auth')toast(e.message)}
}
async function loadInbox(){
  if(!canInbox())return;
  try{
    if(!ORG_UNITS.length)ORG_UNITS=await api('/api/units').catch(()=>[]);
    const q=V.unitFilter?`?unitId=${encodeURIComponent(V.unitFilter)}`:'';
    const body=await api('/api/workcases'+q);
    WORK=body.cases||[];WORK_STATS=body.stats||{};
    if(V.n==='inbox'||V.n==='wd')render();
  }catch(e){if(e.message!=='auth')toast(e.message)}
}
function stLabel(s){return (LEGAL_OPTS.caseStatus.find(x=>x.k===s)||{l:s}).l}
function kindLabel(k){return (LEGAL_OPTS.caseKinds.find(x=>x.k===k)||{l:k}).l}
function moneyBar(paid,total){const p=total>0?Math.min(100,Math.round(paid/total*100)):0;return `<div class=barwrap title="${p}%"><div class=barfill style="width:${p}%"></div></div><div class=fd>وصول‌شده ${money(paid)} از ${money(total)} (${F(p)}٪)</div>`}
function caseCardHtml(c,goView){
  const title=c.title||c.customer?.name||kindLabel(c.kind);
  const blob=N([title,c.currentUnitName,c.assignedName,c.customer?.name,c.customer?.phone,c.customer?.nid,c.contract?.no,c.reservation?.no,c.body,c.referredBy,kindLabel(c.kind)].filter(Boolean).join(' '));
  const amt=c.chart?.overdueAmt||c.installment?.amt||c.contract?.remaining||0;
  const tone=c.priority==='high'?'high':c.status==='done'?'done':c.overdueDays>0?'late':'';
  return `<article class="wcard ${tone}" data-s="${esc(blob)}" onclick="go('${goView}','${c.id}')">
    <header class=wcard-h>
      <span class=wcard-kind>${esc(kindLabel(c.kind))}</span>
      <div class=wcard-tags>
        ${c.priority==='high'?`<span class="tag-prio">اولویت بالا</span>`:''}
        ${c.overdueDays>0?`<span class="tag-late">${F(c.overdueDays)} روز تأخیر</span>`:''}
        ${c.status==='done'?`<span class="tag-done">مختومه</span>`:''}
      </div>
    </header>
    <h4 class=wcard-title>${esc(title)}</h4>
    <p class=wcard-meta>
      <span>${esc(c.currentUnitName||'بدون واحد')}</span>
      ${c.assignedName?`<span class=cc-dot></span><span>${esc(c.assignedName)}</span>`:''}
      ${c.customer?.name?`<span class=cc-dot></span><span>${esc(c.customer.name)}</span>`:''}
    </p>
    ${amt?`<div class=wcard-amt><span>مبلغ</span><strong>${money(amt)}</strong><em>تومان</em></div>`:''}
    <footer class=wcard-f>
      <span>از ${esc(c.referredBy||'سامانه')}</span>
      <button type=button class="sm btn-soft" onclick="event.stopPropagation();go('${goView}','${c.id}')">مشاهده</button>
    </footer>
  </article>`;
}
function timelineHtml(c){
  const acts=LEGAL_OPTS.followActions||[],subs=LEGAL_OPTS.followSubjects||[],ress=LEGAL_OPTS.followResults||[];
  const typeL={create:'ایجاد',follow:'پیگیری',transfer:'انتقال',status:'وضعیت',assign:'واگذاری'};
  const events=(c.timeline&&c.timeline.length)?c.timeline:(c.follows||[]).map(f=>({...f,type:'follow'}));
  return events.map(e=>{
    if(e.type==='follow')return `<div class=item><div class=meta>${F(e.d)} – ${F(e.h)} | ${esc(e.by||'—')} | پیگیری | نتیجه: ${esc((ress.find(x=>x.k===e.result)||{l:e.result||'—'}).l)}${e.next?' | بعدی '+F(e.next):''}</div>
     <div>${(e.actions||[]).map(a=>`<span class=tag>${esc((acts.find(x=>x.k===a)||{l:a}).l)}</span>`).join('')}${(e.subjects||[]).map(a=>`<span class=tag>${esc((subs.find(x=>x.k===a)||{l:a}).l)}</span>`).join('')}</div>
     <div style="white-space:normal;margin-top:6px">${esc(e.note||'—')}</div></div>`;
    if(e.type==='transfer')return `<div class=item><div class=meta>${F(e.d)} – ${F(e.h)} | ${esc(e.by||'—')} | انتقال</div>
     <div class=fd>${esc(e.fromUnitName||'—')} ← ${esc(e.toUnitName||'—')}${e.toUserName?' · مسئول '+esc(e.toUserName):''}</div>
     <div style="white-space:normal;margin-top:6px">${esc(e.note||'')}</div></div>`;
    return `<div class=item><div class=meta>${F(e.d)} – ${F(e.h)} | ${esc(e.by||'—')} | ${esc(typeL[e.type]||e.type)}</div>
     <div style="white-space:normal;margin-top:6px">${esc(e.note||e.status||'—')}</div></div>`;
  }).join('')||'<div class=empty>هنوز رویدادی ثبت نشده است.</div>';
}
function caseDetailBody(c,backView,apiBase){
  const acts=LEGAL_OPTS.followActions||[],subs=LEGAL_OPTS.followSubjects||[],ress=LEGAL_OPTS.followResults||[];
  return `<div class=top><h2>${esc(c.title||c.customer?.name||'ارجاع')}</h2><div><button onclick="go('${backView}')">بازگشت</button>
   ${canRefer()?`<button class=sm onclick="openTransferDialog('${c.id}')">ارجاع به واحد دیگر</button>`:''}
   ${['new','working','waiting','done'].map(s=>`<button class="${c.status===s?'pri':''} sm" onclick="setWorkStatus('${c.id}','${s}','${apiBase}')">${stLabel(s)}</button>`).join('')}
   ${canDeleteRec()||can('admin')?`<button class="sm x" onclick="delWorkCase('${c.id}','${backView}')">حذف ارجاع</button>`:''}</div></div>
 <div class=stats>
  <div class=st><b>${esc(c.currentUnitName||'—')}</b><span>واحد فعلی</span></div>
  <div class=st><b>${esc(c.assignedName||'—')}</b><span>مسئول</span></div>
  <div class=st><b>${esc(stLabel(c.status))}</b><span>وضعیت</span></div>
  <div class=st><b>${esc(kindLabel(c.kind))}</b><span>نوع</span></div>
  ${c.chart?.overdueAmt!=null?`<div class=st><b>${money(c.chart.overdueAmt||0)}</b><span>مبلغ</span></div>`:''}
  ${c.overdueDays?`<div class=st><b>${F(c.overdueDays)}</b><span>روز تأخیر</span></div>`:''}
 </div>
 <div class=admin-grid>
  <div>
   ${c.body?`<div class=note style="white-space:pre-wrap">${esc(c.body)}</div>`:''}
   <h3>مشخصات لینک‌شده</h3>
   ${c.customer?.name?`<p>مشتری: <b>${esc(c.customer.name)}</b> | کد ملی ${F(c.customer.nid||'—')} | ☎ <a class=ph href="tel:${N(c.customer.phone||'')}">${F(c.customer.phone||'—')}</a></p><p>نشانی: ${esc(c.customer.addr||'—')}</p>`:'<p class=fd>بدون پیوند مشتری</p>'}
   ${c.project?`<p>پروژه: <b>${esc(c.project.name||'—')}</b> – ${esc(c.project.addr||'')}</p>`:''}
   ${c.unit?.no?`<p>واحد ملکی: ${esc(c.unit.no)} | طبقه ${esc(c.unit.floor||'—')} | ${F(c.unit.area||0)} م²</p>`:''}
   ${c.contract?`<p>قرارداد ${esc(c.contract.no)} مورخ ${F(c.contract.date)} | مبلغ کل ${money(c.contract.total)} | پرداخت‌شده ${money(c.contract.paid)} | مانده ${money(c.contract.remaining)}</p>${moneyBar(c.contract.paid||0,c.contract.total||0)}`:''}
   ${c.installment?`<p>قسط: <b>${esc(c.installment.title||'')}</b> | مبلغ ${money(c.installment.amt||0)} | سررسید ${F(c.installment.date)}</p>
    ${c.contract?.id?`<button class=sm onclick="go('cd','${c.contract.id}')">قرارداد</button> <button class=sm onclick="openRc('${c.contract.id}','${c.installment.id}')">رسید</button>`:''}`:''}
   ${c.reservation?`<p>رزرو ${esc(c.reservation.no)} | نیاز ${money(c.reservation.need||0)} | پرداختی ${money(c.reservation.paid||0)} | مهلت ${F(c.reservation.deadline)}</p>${c.reservation.id?`<button class=sm onclick="go('rd','${c.reservation.id}')">پرونده رزرو</button>`:''}`:''}
   ${c.payment?`<p>پرداخت / سند: ${money(c.payment.amt||0)} | ${F(c.payment.date||'—')} | ${esc(c.payment.ref||'')}</p>`:''}
   ${c.customer?.id?`<button class=sm onclick="go('cv','${c.customer.id}')">پرونده مشتری</button>`:''}
   <h3>ثبت پیگیری</h3>
   <div class=box style="max-width:none;padding:14px;border:1px solid var(--line)">
    <div class=fd>اقدام انجام‌شده</div><div class=checks id=fa>${acts.map(a=>`<label><input type=checkbox data-a="${a.k}"> ${esc(a.l)}</label>`).join('')}</div>
    <div class=fd>موضوع</div><div class=checks id=fs>${subs.map(a=>`<label><input type=checkbox data-s="${a.k}"> ${esc(a.l)}</label>`).join('')}</div>
    <div class=grid>
     <label>نتیجه<select id=fr>${ress.map(a=>`<option value="${a.k}">${esc(a.l)}</option>`).join('')}</select></label>
     <label>تاریخ پیگیری بعدی<input id=fn readonly style="cursor:pointer" onclick="dpick(this)"></label>
     <label class=w>شرح پیگیری<textarea id=ft rows=3 placeholder="توضیحات پیگیری…"></textarea></label>
    </div>
    <div class=act><button class=pri onclick="saveWorkFollow('${c.id}','${apiBase}')">ثبت پیگیری</button></div>
   </div>
  </div>
  <div>
   <h3>سابقه و تاریخچه</h3>
   <div class=hist>${timelineHtml(c)}</div>
   <div class=fd>ارجاع‌دهنده: ${esc(c.referredBy||'سامانه')} | واحد: ${esc(c.currentUnitName||'—')}</div>
  </div>
 </div>`;
}
function inboxV(){
  if(!canInbox())return empty('به صندوق ارجاعات دسترسی ندارید');
  const cols=LEGAL_OPTS.caseStatus.length?LEGAL_OPTS.caseStatus:[{k:'new',l:'ارجاع‌شده'},{k:'working',l:'در حال پیگیری'},{k:'waiting',l:'در انتظار'},{k:'done',l:'مختومه'}];
  const unitFilter=V.unitFilter||'';
  return `<div class=top>
   <div><h2>صندوق ارجاعات</h2><p class=fd style="margin:4px 0 0">ارجاع‌های واحدهای شما، موارد واگذارشده، و ارجاع‌هایی که خودتان ثبت کرده‌اید.</p></div>
   <div class=inbox-tools>
    <select class=inbox-filter onchange="V.unitFilter=this.value;loadInbox()"><option value="">همه واحدهای من</option>${ORG_UNITS.map(u=>`<option value="${u.id}" ${unitFilter===u.id?'selected':''}>${esc(u.name)}</option>`).join('')}</select>
    <button type=button onclick="loadInbox()">تازه‌سازی</button>
    ${canRefer()?`<button type=button class=pri onclick="openReferDialog()">ارجاع جدید</button>`:''}
   </div>
  </div>
 ${sb()}
 <div class="stats inbox-stats">${cols.map(c=>{const s=WORK_STATS[c.k]||{count:0,amount:0};return `<div class="st inbox-st"><b>${F(s.count||0)}</b><span>${esc(c.l)}</span><strong class=inbox-amt>${money(s.amount||0)} <em>تومان</em></strong></div>`}).join('')}</div>
 <div class=pipeline>${cols.map(col=>{const items=WORK.filter(x=>x.status===col.k);return `<section class="pipe pipe-${col.k}"><header class=pipe-h><h3>${esc(col.l)}</h3><span class=count>${F(items.length)}</span></header><div class=pipe-body>${items.map(c=>caseCardHtml(c,'wd')).join('')||'<div class="empty pipe-empty">موردی نیست</div>'}</div></section>`}).join('')}</div>`;
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
  return `<div class=top>
   <div><h2>واحد حقوقی</h2><p class=fd style="margin:4px 0 0">معوقات بیش از ${F(days)} روز و ارجاع‌های دستی به این واحد.</p></div>
   <div class=inbox-tools>
    <button type=button onclick="loadLegal()">تازه‌سازی</button>
    ${canRefer()?`<button type=button class=pri onclick="referToLegal()">ارجاع به حقوقی</button>`:''}
   </div>
  </div>
 ${sb()}
 <div class="stats inbox-stats">${cols.map(c=>{const s=LEGAL_STATS[c.k]||{count:0,amount:0};return `<div class="st inbox-st"><b>${F(s.count||0)}</b><span>${esc(c.l)}</span><strong class=inbox-amt>${money(s.amount||0)} <em>تومان</em></strong></div>`}).join('')}</div>
 <div class=pipeline>${cols.map(col=>{const items=LEGAL.filter(x=>x.status===col.k);return `<section class="pipe pipe-${col.k}"><header class=pipe-h><h3>${esc(col.l)}</h3><span class=count>${F(items.length)}</span></header><div class=pipe-body>${items.map(c=>caseCardHtml(c,'ld')).join('')||'<div class="empty pipe-empty">موردی نیست</div>'}</div></section>`}).join('')}</div>`;
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
  m.innerHTML=`<div class=box><h3 style="margin-top:0">ارجاع به واحد دیگر</h3><div class=grid>
   <label>واحد مقصد<select name=unitId>${units.map(u=>`<option value="${u.id}" ${c&&u.id===c.currentUnitId?'':''}>${esc(u.name)}</option>`).join('')}</select></label>
   <label>مسئول (اختیاری)<select name=assignedTo><option value="">—</option></select></label>
   <label class=w>توضیح انتقال<textarea name=note rows=3 placeholder="دلیل ارجاع به واحد دیگر…"></textarea></label>
  </div><div class=act><button type=button class=pri id=ok>انتقال</button><button type=button onclick="closeM()">انصراف</button></div></div>`;
  m.classList.add('on');
  const fill=()=>{
    const uid=m.querySelector('[name=unitId]').value;
    const members=DIR_USERS.filter(u=>(u.unitIds||[]).includes(uid));
    m.querySelector('[name=assignedTo]').innerHTML=`<option value="">—</option>`+members.map(u=>`<option value="${u.id}">${esc(u.name)}</option>`).join('');
  };
  fill();m.querySelector('[name=unitId]').onchange=fill;
  $('#ok').onclick=async()=>{
    const body={unitId:m.querySelector('[name=unitId]').value,assignedTo:m.querySelector('[name=assignedTo]').value||undefined,note:m.querySelector('[name=note]').value.trim()};
    try{
      const updated=await api('/api/workcases/'+id+'/transfer',{method:'POST',body:JSON.stringify(body)});
      upsertCase(updated);toast('ارجاع منتقل شد');closeM();render();
    }catch(e){if(e.message!=='auth')toast(e.message)}
  };
}
function upsertCase(updated){
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
async function saveWorkFollow(id,apiBase){
  const actions=[...document.querySelectorAll('#fa [data-a]:checked')].map(e=>e.dataset.a);
  const subjects=[...document.querySelectorAll('#fs [data-s]:checked')].map(e=>e.dataset.s);
  const result=$('#fr')?.value||'other';
  const note=$('#ft')?.value.trim()||'';
  const next=normJ($('#fn')?.value||'')||'';
  try{
    const url=apiBase==='legal'?`/api/legal/cases/${id}/followups`:`/api/workcases/${id}/followups`;
    const updated=await api(url,{method:'POST',body:JSON.stringify({actions,subjects,result,note,next})});
    upsertCase(updated);toast('پیگیری ثبت شد');render();
  }catch(e){if(e.message!=='auth')toast(e.message)}
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
