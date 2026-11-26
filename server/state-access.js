import {isDeepStrictEqual as equal} from 'node:util';
import {hasPerm, resolveDashKind} from './perms.js';
import {AppError,validateState} from './validate.js';
export const modules={projects:'proj',customers:'cust',contracts:'cont',reservations:'res',leads:'lead',parties:'acct',ledger:'acct',checks:'acct'};
export const labels={projects:'پروژه',customers:'مشتری',contracts:'قرارداد',reservations:'رزرو',leads:'سرنخ',parties:'طرف حساب',ledger:'سند مالی',checks:'چک'};
// Reports and queues use summary fields. Documents, bank details, receipts and customer notes stay in their own modules.
const pick=(row,keys)=>Object.fromEntries(keys.filter(k=>row[k]!==undefined).map(k=>[k,row[k]]));
const CONTRACT_CORE=['no','type','cust','proj','unit','date','total','baseTotal','extraOn','extraPct','extraAmt','profitOn','profitPct','profitAmt','dur','note','latePctDaily','hand','owners','doc','sourceFields','reservationId','accountId','fac','auto','autoMode','depositLabel','rates','transfers','installBudget'];
const INST_CORE=['title','amt','date','kind','latePctDaily'];
function blank(v){return v==null||v===''}
function same(a,b){
  if(blank(a)&&blank(b))return true;
  if(typeof a==='boolean'||typeof b==='boolean')return !!a===!!b;
  return equal(a??null,b??null);
}
function legacyAct(user,key,moduleKey){
  return hasPerm(user,key)||(hasPerm(user,'write')&&hasPerm(user,moduleKey));
}
function paySlice(i){
  return {paid:!!i?.paid,pdate:i?.pdate||'',ref:i?.ref||'',parts:i?.parts||[],lateDays:Number(i?.lateDays)||0,lateCalc:Number(i?.lateCalc)||0,lateFee:Number(i?.lateFee)||0,lateNote:i?.lateNote||''};
}
function coreChanged(prev,next){
  return CONTRACT_CORE.some(k=>!same(prev?.[k],next?.[k]));
}
function instCore(i){
  return {title:i?.title||'',amt:Number(i?.amt)||0,date:i?.date||'',kind:i?.kind||'',latePctDaily:i?.latePctDaily??null};
}
function assertPayChange(oldInst,nextInst,flags){
  if(equal(paySlice(oldInst),paySlice(nextInst)))return;
  if(flags.payEdit)return;
  if(!flags.payAdd)throw new AppError('اجازه ثبت یا تغییر پرداخت را ندارید',403);
  const oldPay=paySlice(oldInst),nextPay=paySlice(nextInst);
  if(oldPay.paid&&!nextPay.paid)throw new AppError('اجازه برگشت پرداخت را ندارید',403);
  if(nextPay.parts.length<oldPay.parts.length)throw new AppError('اجازه حذف واریز را ندارید',403);
  for(let i=0;i<oldPay.parts.length;i++)if(!equal(oldPay.parts[i],nextPay.parts[i]))throw new AppError('اجازه ویرایش واریز ثبت‌شده را ندارید',403);
  if(oldPay.ref&&oldPay.ref!==nextPay.ref)throw new AppError('اجازه ویرایش واریز ثبت‌شده را ندارید',403);
  if(oldPay.pdate&&oldPay.pdate!==nextPay.pdate)throw new AppError('اجازه ویرایش واریز ثبت‌شده را ندارید',403);
  if(oldPay.lateFee!==nextPay.lateFee||oldPay.lateNote!==nextPay.lateNote)throw new AppError('اجازه تغییر جریمه ثبت‌شده را ندارید',403);
}
function clearPay(inst){
  return {...inst,paid:false,pdate:'',ref:'',parts:[],lateDays:0,lateCalc:0,lateFee:0,lateNote:''};
}
function mergeInst(prevList,nextList,flags){
  const prev=Array.isArray(prevList)?prevList:[];
  const next=Array.isArray(nextList)?nextList:[];
  const prevBy=new Map(prev.map(i=>[i.id,i]));
  const seen=new Set();
  const out=[];
  for(const inst of next){
    const old=prevBy.get(inst.id);
    if(!old){
      if(!flags.edit)throw new AppError('اجازه تغییر برنامه اقساط را ندارید',403);
      const fresh=flags.payAdd||flags.payEdit?inst:clearPay(inst);
      if(!flags.payAdd&&!flags.payEdit&&(fresh.paid||(fresh.parts||[]).length))throw new AppError('اجازه ثبت پرداخت ندارید',403);
      out.push(fresh);continue;
    }
    seen.add(inst.id);
    if(!flags.edit&&INST_CORE.some(k=>!same(instCore(old)[k],instCore(inst)[k])))throw new AppError('اجازه ویرایش قرارداد را ندارید',403);
    assertPayChange(old,inst,flags);
    out.push(flags.edit?inst:{...old,...paySlice(inst),parts:paySlice(inst).parts});
  }
  for(const old of prev){
    if(seen.has(old.id))continue;
    if(!flags.edit)throw new AppError('اجازه حذف قسط را ندارید',403);
    if((old.paid||(old.parts||[]).length)&&!flags.payEdit)throw new AppError('قسط دارای واریز را نمی‌توان بدون اجازه ویرایش پرداخت حذف کرد',403);
  }
  return out;
}
function mergeContracts(user,submitted,prior){
  const flags={
    add:legacyAct(user,'cont_add','cont'),
    edit:legacyAct(user,'cont_edit','cont'),
    payAdd:hasPerm(user,'pay_add')||(hasPerm(user,'write')&&hasPerm(user,'cont')),
    payEdit:hasPerm(user,'pay_edit')||(hasPerm(user,'write')&&hasPerm(user,'cont')),
  };
  if(!flags.add&&!flags.edit&&!flags.payAdd&&!flags.payEdit)return null;
  const prevBy=new Map((prior||[]).map(c=>[c.id,c]));
  const seen=new Set();
  const out=[];
  for(const row of submitted||[]){
    const prev=prevBy.get(row.id);
    if(!prev){
      if(!flags.add)throw new AppError('اجازه ثبت قرارداد ندارید',403);
      const inst=(row.inst||[]).map(i=>flags.payAdd||flags.payEdit?i:clearPay(i));
      out.push({...row,inst});continue;
    }
    seen.add(row.id);
    if(!flags.edit&&coreChanged(prev,row))throw new AppError('اجازه ویرایش قرارداد را ندارید',403);
    const inst=mergeInst(prev.inst,Array.isArray(row.inst)?row.inst:prev.inst,flags);
    out.push(flags.edit?{...row,inst}:{...prev,inst});
  }
  for(const prev of prior||[]){
    if(!seen.has(prev.id)&&!flags.edit)throw new AppError('اجازه حذف قرارداد را ندارید',403);
  }
  return out;
}
function mergeReservations(user,submitted,prior){
  const full=legacyAct(user,'res_write','res');
  if(full)return submitted;
  const payAdd=hasPerm(user,'pay_add')||(hasPerm(user,'write')&&hasPerm(user,'res'));
  const payEdit=hasPerm(user,'pay_edit')||(hasPerm(user,'write')&&hasPerm(user,'res'));
  if(!payAdd&&!payEdit)return null;
  const prevBy=new Map((prior||[]).map(r=>[r.id,r]));
  if((submitted||[]).length!==(prior||[]).length)throw new AppError('اجازه ثبت یا حذف رزرو را ندارید',403);
  return (submitted||[]).map(row=>{
    const prev=prevBy.get(row.id);
    if(!prev)throw new AppError('اجازه ثبت رزرو را ندارید',403);
    for(const k of ['no','cust','proj','unit','need','deadline','date','st','fine'])if(!same(prev[k],row[k]))throw new AppError('اجازه ویرایش رزرو را ندارید',403);
    const oldPays=prev.pays||[],nextPays=row.pays||[];
    if(equal(oldPays,nextPays))return prev;
    if(payEdit)return {...prev,pays:nextPays};
    if(nextPays.length<oldPays.length)throw new AppError('اجازه حذف پرداخت رزرو را ندارید',403);
    for(let i=0;i<oldPays.length;i++)if(!equal(oldPays[i],nextPays[i]))throw new AppError('اجازه ویرایش پرداخت رزرو را ندارید',403);
    return {...prev,pays:nextPays};
  });
}
export function scopedState(user,data){
  if(hasPerm(user,'admin'))return data;
  const view={...data,cfg:{...data.cfg}};
  const kind=resolveDashKind(user);
  const aggregate=hasPerm(user,'rep')||(kind==='manage'&&hasPerm(user,'dash'));
  const deals=hasPerm(user,'cont')||hasPerm(user,'res')||hasPerm(user,'cont_add')||hasPerm(user,'cont_edit');
  const showPrices=hasPerm(user,'proj')||hasPerm(user,'rep')||hasPerm(user,'cont_add')||hasPerm(user,'cont_edit')||(kind==='manage'&&hasPerm(user,'dash'));
  const unitKeys=kind==='legal'
    ?['id','no','area','floor','block','kind']
    :showPrices?['id','no','area','st','floor','block','kind','total','totalRaw','ppm','ppmRaw']:['id','no','area','st','floor','block','kind'];
  for(const [key,permission] of Object.entries(modules)){
    const explicit=key==='projects'?hasPerm(user,'proj_write'):key==='customers'?hasPerm(user,'cust_write'):key==='leads'?hasPerm(user,'lead_write'):key==='reservations'?hasPerm(user,'res_write')||hasPerm(user,'pay_add')||hasPerm(user,'pay_edit'):key==='contracts'?hasPerm(user,'cont_add')||hasPerm(user,'cont_edit')||hasPerm(user,'pay_add')||hasPerm(user,'pay_edit'):false;
    if(hasPerm(user,permission)||explicit)continue;
    const rows=data[key];
    view[key]=[];
    if(key==='customers'&&(aggregate||deals||hasPerm(user,'acct')||hasPerm(user,'lead')))
      view[key]=rows.map(r=>pick(r,deals?['id','name','nid','phone','father','addr']:['id','name']));
    if(key==='projects'&&(aggregate||deals||hasPerm(user,'lead')||hasPerm(user,'cont_add')))
      view[key]=rows.map(r=>({...pick(r,['id','name','addr',...(showPrices?['accountId']:[]),...(hasPerm(user,'lead')?['vcName','vcPhone','vcNote']:[])]),units:(r.units||[]).map(u=>pick(u,unitKeys))}));
    if(!aggregate)continue;
    if(key==='contracts')view[key]=rows.map(r=>({...pick(r,['id','no','proj','unit','cust','owners','date','total']),inst:r.inst.map(i=>({...pick(i,['id','title','amt','date','paid','kind']),...(i.parts?{parts:i.parts.map(p=>({amt:p.amt}))}:{})}))}));
    if(key==='reservations')view[key]=rows.map(r=>({...pick(r,['id','no','proj','unit','cust','st','need','deadline','date']),pays:r.pays.map(p=>({amt:p.amt})),...(r.cancel?{cancel:{...pick(r.cancel,['date','refund','fine']),h:(r.cancel.h||[]).map(()=>({}))}}:{})}));
    if(key==='leads')view[key]=rows.map(r=>({...pick(r,['id','name','proj','rep','stage','src','next']),h:(r.h||[]).map(h=>({s:h.s}))}));
  }
  if(!hasPerm(user,'cont')||!(hasPerm(user,'write')||hasPerm(user,'cont_add')||hasPerm(user,'cont_edit')))view.cfg.drafts=[];
  const needsAccounts=hasPerm(user,'acct')||hasPerm(user,'proj')||hasPerm(user,'proj_write')||hasPerm(user,'cont_add')||hasPerm(user,'cont_edit')||(hasPerm(user,'write')&&hasPerm(user,'cont'));
  if(!needsAccounts)view.cfg.accounts=[];
  return view;
}
export function mergeState(user,raw,prior){
  if(!raw||typeof raw!=='object'||!Array.isArray(raw.projects)||!Array.isArray(raw.customers)||!Array.isArray(raw.contracts)||!Array.isArray(raw.reservations))throw new AppError('اطلاعات ارسالی ناقص است');
  if(hasPerm(user,'admin'))return raw;
  const data={...raw,cfg:{...raw.cfg}};
  const visible=scopedState(user,prior);
  const open={
    projects:legacyAct(user,'proj_write','proj'),
    customers:legacyAct(user,'cust_write','cust'),
    leads:legacyAct(user,'lead_write','lead'),
    parties:hasPerm(user,'acct'),
    ledger:hasPerm(user,'acct'),
    checks:hasPerm(user,'acct'),
  };
  for(const key of Object.keys(modules)){
    if(key==='contracts'){
      const merged=mergeContracts(user,raw.contracts,prior.contracts);
      if(merged){data.contracts=merged;continue}
    }else if(key==='reservations'){
      const merged=mergeReservations(user,raw.reservations,prior.reservations);
      if(merged){data.reservations=merged;continue}
    }else if(open[key])continue;
    const expected=visible[key],submitted=raw[key]||[];
    if(!Array.isArray(submitted)||submitted.length!==expected.length)throw new AppError('اجازه تغییر این بخش را ندارید',403);
    const byId=new Map(expected.map(r=>[r.id,r]));
    for(const r of submitted){
      const other=byId.get(r.id);
      if(!other)throw new AppError('اجازه تغییر این پرونده را ندارید',403);
      for(const k of ['name','no','date','total','cust','unit','proj','note','owners','amt','phone','nid']){
        if(!equal(r[k],other[k]))throw new AppError('اجازه ویرایش '+labels[key]+' را ندارید',403);
      }
    }
    data[key]=prior[key];
  }
  if(!hasPerm(user,'cont')||!(hasPerm(user,'write')||hasPerm(user,'cont_add')||hasPerm(user,'cont_edit')))data.cfg.drafts=prior.cfg.drafts;
  if(!hasPerm(user,'acct'))data.cfg.accounts=prior.cfg.accounts;
  for(const k of ['fine','days','autoLegal','legalDays'])data.cfg[k]=prior.cfg[k];
  return data;
}
export function changes(before,after,user){
  const events=[],prior=validateState(before);
  for(const [key,title] of Object.entries(labels)){
    const old=new Map(prior[key].map(r=>[r.id,r]));
    const add=(action,row,fields)=>events.push({actor:user.name,user:user.username,action:action+' '+title,target:row.no||row.name||row.id,details:fields.join('، ')});
    for(const row of after[key]){
      const prev=old.get(row.id);old.delete(row.id);
      if(!prev)add('ثبت',row,[]);
      else if(!equal(prev,row)){
        const fields=[...new Set([...Object.keys(prev),...Object.keys(row)])].filter(k=>!equal(prev[k],row[k]));
        const names={owners:'سهم مالکیت',total:'مبلغ کل',inst:'جدول اقساط و واریزها',note:'یادداشت',units:'واحدهای پروژه',doc:'متن سند',ed:'ویرایش سند',log:'تاریخچه',pays:'پرداخت‌ها',cust:'مشتری',name:'نام',date:'تاریخ',unit:'واحد',proj:'پروژه',phone:'شماره تماس',nid:'کد ملی',stage:'مرحله فروش'};
        const describe=k=>{
          if(k==='total'||k==='stage'||k==='date')return (names[k]||k)+' '+String(prev[k]??'—')+' ← '+String(row[k]??'—');
          if(k==='owners')return 'سهم مالکیت '+(row.owners||[{customer:row.cust,share:6000}]).map(o=>(after.customers.find(c=>c.id===o.customer)?.name||o.customer)+' '+o.share/1000+' دانگ').join('، ');
          return names[k]||k;
        };
        add('ویرایش',row,fields.map(describe));
      }
    }
    for(const r of old.values())add('حذف',r,[]);
  }
  for(const k of ['accounts','drafts','fine','days'])if(!equal(prior.cfg[k],after.cfg[k]))events.push({actor:user.name,user:user.username,action:'ویرایش تنظیمات',target:k});
  return events;
}
