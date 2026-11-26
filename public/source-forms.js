/* Native Word templates. The same populated package drives preview, print and download. */
(() => {
  const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const blank = '................';
  const labels = {
    delayFine:'خسارت روزانه',delayDays:'تأخیر در تحویل به ازای هر روز',partyPerson:'نام و عنوان طرف قرارداد',name:'نام مشتری',person:'نام و عنوان طرف قرارداد',nid:'کد ملی',phone:'شماره همراه',floor:'طبقه',unitNo:'شماره واحد',
    loc:'نشانی ملک',total:'مبلغ کل',holder:'نام صاحب حساب',bank:'بانک مقصد',iban:'شبا',card:'شماره کارت',acct:'شماره حساب',
    payAmount:'مبلغ پرداخت',payDate:'تاریخ پرداخت',fromBank:'بانک مبدأ',ref:'شماره پیگیری',schedule:'مبالغ و سررسیدهای رزرو',
    remaining:'مانده رزرو',deadline:'مهلت رزرو',fee:'هزینه انصراف',refund:'مهلت استرداد',support:'تلفن پشتیبانی',
    date:'تاریخ سند',no:'شماره سند',father:'نام پدر',addr:'نشانی',birth:'تاریخ تولد یا ثبت',post:'کد پستی',block:'بلوک',
    builder:'نام و عنوان سازنده',builderFather:'نام پدر سازنده',builderNid:'کد ملی سازنده',builderBirthNo:'شماره شناسنامه سازنده',
    builderCity:'محل صدور شناسنامه',builderPhone:'تلفن سازنده',builderAddr:'نشانی سازنده',parcelSub:'پلاک فرعی',parcelMain:'پلاک اصلی',
    section:'بخش ثبتی',registryCity:'شهر ثبتی',landArea:'مساحت عرصه',deed:'شماره سند',municipal:'کد نوسازی',landPost:'کد پستی ملک',
    water:'انشعاب آب',power:'انشعاب برق',gas:'انشعاب گاز',telephone:'خط تلفن',notary:'شماره دفترخانه',notaryAddr:'نشانی دفترخانه',
    district:'منطقه شهرداری',representative:'نام و عنوان نماینده مالکان',city:'شهر تنظیم سند',dur:'مدت به ماه',area:'متراژ واحد',
    start:'آغاز اجاره',end:'پایان اجاره',handDate:'تاریخ تحویل',depositLabel:'عنوان ودیعه',depositTotal:'ودیعه دریافت‌شده',
    refundCount:'تعداد اقساط استرداد',coolDays:'مهلت فسخ',payer:'نام پرداخت‌کننده',groupTotal:'جمع اقساط',each:'مبلغ هر قسط',
    count:'تعداد اقساط',first:'اولین سررسید',day:'روز پرداخت',lumpDate:'سررسید تسویه',lumpAmount:'مبلغ تسویه'
  };
  const date = s => normJ(s || '') ? F(normJ(s).split('/').reverse().join('/')) : s || '';
  const amount = n => n == null || n === '' || !Number.isFinite(+n) || +n < 0 ? '' : words(+n)+' تومان';
  const totalOf = rows => rows.reduce((n,r)=>n+Number(r.amt||0),0);
  const kindOf = () => V.k==='res'?'res':V.k==='c'?docObj()?.type:'';
  const mapped = () => ['res','partner','lease','invest'].includes(kindOf());
  function model(r,k) {
    const d=r.doc||{}, p=proj(r.proj)||{}, u=unitOf(r.proj,r.unit), c=cust(r.cust);
    const accountId=r.accountId||p.accountId;
    const bank=accountId?bankDoc(accountId):d;
    const face = c.name==='—'?'':c.name;
    const title=d.title||'';
    const person=[title,face].filter(Boolean).join(' ');
    const start=d.start||r.date, duration=parseInt(N(r.dur||''),10);
    const v={name:face,person,father:c.father,nid:c.nid,phone:d.phone||c.phone,addr:d.addr||c.addr,birth:date(d.birth),
      no:r.no,date:date(r.date),area:d.area||u.area||'',block:d.block||u.block,unitNo:d.unitNo||u.no,floor:d.floor||u.floor,
      loc:(k==='invest'&&d.landAddr)||d.loc||p.addr,post:d.postal,start:date(start),end:date(d.end||(normJ(start)&&duration>0?addM(start,duration):'')),
      dur:r.dur&&String(r.dur).replace(/\s*ماه\s*$/,''),handDate:date(d.handDate||r.hand),total:amount(r.total),city:'اصفهان',
      bank:bank.payBank,holder:bank.payName,iban:bank.paySheba,card:bank.payCard,acct:bank.payAcct,
      depositLabel:r.depositLabel||'قرض الحسنه',refundCount:d.qarzRefundCount||'۸',coolDays:d.coolDays?String(d.coolDays).replace(/\s*روز$/,'')+' روز':'سی روز'};
    if(k==='invest'){
      v.coolDays=d.coolDays ? String(d.coolDays).replace(/\s*روز$/,'')+' روز' : 'یکماه';
      v.delayFine=amount(d.delayFineDaily??150000);
      v.delayDays=d.delayExtraDays ? String(d.delayExtraDays).replace(/\s*روز$/,'')+' روز' : 'پانزده روز';
    }
    const groups={partyPerson:[],ownerIndex:[],groupIndex:[],lumpIndex:[],payAmount:[]};
    const row=(id,caption,values)=>({id,caption,values});
    if(k==='lease'||k==='invest'){
      const parties=ownerList(r).map(o=>cust(o.customer));
      v.name=parties.map(a=>a.name).join(' و ');
      v.person=parties.map(a=>[a.id===r.cust?title:'',a.name].filter(Boolean).join(' ')).join(' و ');
      parties.forEach((a,i)=>{
        const primary=a.id===r.cust;
        groups.partyPerson.push(row('o'+a.id,'طرف قرارداد '+F(i+1),{
          partyPerson:[primary?title:'',a.name].filter(Boolean).join(' '),father:a.father,nid:a.nid,
          phone:(primary&&d.phone)||a.phone,addr:(primary&&d.addr)||a.addr,
          birth:primary?v.birth:'',post:primary?d.postal:''}));
      });
    }
    if(k==='partner'){
      ownerList(r).forEach((o,i)=>{
        const a=cust(o.customer);
        groups.ownerIndex.push(row('o'+o.customer,'مالک '+F(i+1),{ownerIndex:F(i+1),person:[o.customer===r.cust?title:'',a.name].filter(Boolean).join(' '),father:a.father,nid:a.nid,addr:a.addr,phone:a.phone}));
      });
    }
    let pays=[];
    if(k==='res'){
      pays=r.pays||[];
      const plan=(d.schedule||[]).filter(s=>s.amt||s.date);
      const total=d.total||u.total||u.totalRaw;
      Object.assign(v,{total:amount(total),remaining:total?amount(total-totalOf(pays)-totalOf(plan)):'',
        schedule:plan.map(s=>(amount(s.amt)||blank)+' را حداکثر تا تاریخ '+(date(s.date)||blank)).join(' و مبلغ '),
        deadline:date(r.deadline),fee:amount(r.fine??S.cfg.fine),refund:words(Number(d.refundMonths)||3)+' ماه',support:d.supportPhone||'۰۹۱۳۳۲۰۶۶۲۵'});
    }
    if(k==='lease'||k==='invest'){
      const scheduled=[], lumps=[];
      for(const i of [...(r.inst||[])].sort((a,b)=>a.date.localeCompare(b.date))){
        const dep=i.kind==='deposit'||/پیش.پرداخت|قرض.الحسنه/.test(i.title||'');
        const lump=isLumpInst(i);
        const parts=receipts(r,i);
        if(k==='lease'){
          if(dep){pays.push(...parts);continue}
          (lump?lumps:scheduled).push(i);
        } else {
          pays.push(...parts);
          const rest=i.amt-totalOf(parts);
          if(rest>0)(lump||dep?lumps:scheduled).push({...i,amt:rest});
        }
      }
      if(k==='lease'){
        const refs=new Set(pays.map(p=>p.ref).filter(Boolean));
        for(const x of d.qarzPays||[])if(!x.ref||!refs.has(x.ref))pays.push(x);
        v.depositTotal=amount(pays.length?totalOf(pays):d.qarzTotal||undefined);
      }
      const runs=[];
      for(const i of scheduled){
        const g=runs.at(-1);
        if(g&&g.amt===i.amt&&addM(g.last,1)===i.date&&pj(g.first)[2]===pj(i.date)[2]){g.count++;g.last=i.date}
        else runs.push({amt:i.amt,first:i.date,last:i.date,count:1});
      }
      let index=k==='invest'?pays.length:0;
      for(const g of runs)groups.groupIndex.push(row('g'+index,'اقساط',{groupIndex:F(++index),groupTotal:amount(g.amt*g.count),each:amount(g.amt),count:F(g.count),day:F(pj(g.first)[2]),first:date(g.first)}));
      for(const l of lumps)groups.lumpIndex.push(row('l'+l.id,'تسویه',{lumpIndex:F(++index),lumpAmount:amount(l.amt),lumpDate:date(l.date)}));
    }
    pays.forEach((x,i)=>groups.payAmount.push(row('p'+Array.from(String(x.id||x.ref||i), ch=>ch.codePointAt(0).toString(36)).join('_'),'پرداخت '+F(i+1),{payIndex:F(i+1),payAmount:amount(x.amt),payDate:date(x.date),fromBank:x.bank||d.fromBank,ref:x.ref,payer:x.payer||x.name||person})));
    return {v,groups};
  }
  const titles={res:'رزرونامه',partner:'مشارکت در ساخت',invest:'سرمایه‌گذاری در ساخت',lease:'اجاره به شرط تملیک'};
  const cache=new Map();
  async function populate(r,k,raw=false){
    if(!cache.has(k)){
      const response=await fetch('/templates/'+k+'.docx');
      if(!response.ok)throw Error('قالب Word در دسترس نیست');
      cache.set(k,await response.arrayBuffer());
    }
    const zip=await JSZip.loadAsync(cache.get(k)), {v,groups}=model(r,k);
    const fields=new Map(),overrides=r.sourceFields||{};
    const calculated=new Set(['total','remaining','payAmount','payDate','ref','count','each','groupTotal','first','day','lumpAmount','lumpDate','fee','deadline','depositTotal','schedule','date','no']);
    const token=/\{\{(\w+)\}\}/g;
    const filled=new WeakSet();
    function fill(el,values,scope){
      for(const t of el.getElementsByTagNameNS(W,'t')){
        if(filled.has(t)||!t.textContent.includes('{{'))continue;
        filled.add(t);
        t.textContent=t.textContent.replace(token,(_,key)=>{
          const local=scope&&Object.hasOwn(values,key), id=local?scope.id+'_'+key:key;
          const val=local?values[key]:v[key];
          const locked=calculated.has(key)&&val!=null&&val!=='';
          const result=!locked&&Object.hasOwn(overrides,id)?overrides[id]:val;
          if(labels[key])fields.set(id,{key,id,locked,label:(local?scope.caption+' · ':'')+labels[key],base:val??'',value:result??''});
          return raw||result==null||result===''?blank:String(result);
        });
      }
    }
    for(const path of Object.keys(zip.files).filter(n=>/^word\/(document|header\d+|footer\d+)\.xml$/.test(n))){
      const xml=new DOMParser().parseFromString(await zip.file(path).async('string'),'application/xml');
      for(const para of Array.from(xml.getElementsByTagNameNS(W,'p'))){
        const marker=Object.keys(groups).find(key=>para.textContent.includes('{{'+key+'}}'));
        if(!marker)continue;
        const rows=raw?[rowBlank()]:groups[marker];
        for(const entry of rows){
          const copy=para.cloneNode(true);
          fill(copy,entry.values,entry);para.before(copy);
        }
        para.remove();
      }
      fill(xml,{},null);
      zip.file(path,new XMLSerializer().serializeToString(xml));
    }
    return {blob:await zip.generateAsync({type:'blob',compression:'DEFLATE',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}),fields};
  }
  function rowBlank(){return {id:'',caption:'',values:{}}}
  const view=()=>`<section class="source-form"><header class="source-toolbar"><div><button data-action="back">بازگشت به پرونده</button><h2>${titles[kindOf()]}</h2></div><div><button data-action="raw">فرم خام Word</button><button data-action="print" disabled>چاپ</button><button class="pri" data-action="word" disabled>دانلود Word</button></div></header><details class="source-editor"><summary>اطلاعات درج‌شده در سند</summary><form></form></details><p role="status" class="source-status">در حال آماده‌سازی سند…</p><div class="source-preview" dir="ltr"></div></section>`;
  async function mount(){
    const host=document.querySelector('.source-form');if(!host)return;
    const r=docObj(),k=kindOf(), status=host.querySelector('[role=status]'),form=host.querySelector('form'), preview=host.querySelector('.source-preview');
    const btn=a=>host.querySelector('[data-action="'+a+'"]');
    btn('back').onclick=()=>go(k==='res'?'rd':'cd',r.id);
    function download(blob,raw){
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=titles[k]+'-'+(raw?'خام':r.no)+'.docx';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),30000);
    }
    btn('raw').onclick=async()=>{try{download((await populate(r,k,true)).blob,true)}catch{toast('دریافت فرم خام انجام نشد')}};
    try{
      const {blob,fields}=await populate(r,k);
      if(!host.isConnected)return;
      const missing=[...fields.values()].filter(f=>!String(f.value).trim());
      status.textContent=missing.length?F(missing.length)+' فیلد خالی است. محل آن‌ها در سند با نقطه‌چین مشخص شده است.':'اطلاعات سند جای‌گذاری شد.';
      const write=k==='res'?canAct('res_write'):canAct('cont_edit');
      const config={res:window.editReserveDoc,lease:window.editLeaseDoc,invest:window.editInvestDoc}[k];
      form.innerHTML=(write&&config?'<button type="button" data-config>مشخصات تکمیلی و برنامه پرداخت</button>':'')+'<div class="source-grid">'+[...fields.values()].map(f=>`<label>${esc(f.label)}<input data-id="${esc(f.id)}" maxlength="1000" value="${esc(String(f.value))}" ${write&&!f.locked?'':'readonly'}></label>`).join('')+'</div>'+(write?'<button class="pri">ذخیره اطلاعات سند</button>':'');
      if(write&&config)form.querySelector('[data-config]').onclick=()=>config(r.id);
      form.onsubmit=e=>{
        e.preventDefault();if(!write)return;
        const next={...r.sourceFields};
        for(const input of form.querySelectorAll('input')){
          const f=fields.get(input.dataset.id), value=input.value.trim();
          if(!value||value===String(f.base))delete next[f.id];else next[f.id]=value;
        }
        r.sourceFields=next;save();render();
      };
      btn('word').disabled=false;btn('word').onclick=()=>download(blob,false);
      await docx.renderAsync(blob,preview,preview,{className:'source-page',useBase64URL:true,ignoreLastRenderedPageBreak:false});
      btn('print').disabled=false;btn('print').onclick=()=>window.print();
    }catch(err){status.textContent='نمایش سند انجام نشد. '+err.message}
  }
  window.SourceForms={view,mount,mapped};
})();
