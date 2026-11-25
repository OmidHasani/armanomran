import {isDeepStrictEqual as equal} from 'node:util';
import {hasPerm} from './perms.js';
import {AppError,validateState} from './validate.js';
export const modules={projects:'proj',customers:'cust',contracts:'cont',reservations:'res',leads:'lead',parties:'acct',ledger:'acct',checks:'acct'};
export const labels={projects:'پروژه',customers:'مشتری',contracts:'قرارداد',reservations:'رزرو',leads:'سرنخ',parties:'طرف حساب',ledger:'سند مالی',checks:'چک'};
// Reports and queues use summary fields. Documents, bank details, receipts and customer notes stay in their own modules.
const pick=(row,keys)=>Object.fromEntries(keys.filter(k=>row[k]!==undefined).map(k=>[k,row[k]]));
export function scopedState(user,data){
  if(hasPerm(user,'admin'))return data;
  const view={...data,cfg:{...data.cfg}};
  const aggregate=hasPerm(user,'rep')||hasPerm(user,'dash');
  const deals=hasPerm(user,'cont')||hasPerm(user,'res');
  for(const [key,permission] of Object.entries(modules)){
    if(hasPerm(user,permission))continue;
    const rows=data[key];
    view[key]=[];
    if(key==='customers'&&(aggregate||deals||hasPerm(user,'acct')||hasPerm(user,'lead')))
      view[key]=rows.map(r=>pick(r,deals?['id','name','nid','phone','father','addr']:['id','name']));
    if(key==='projects'&&(aggregate||deals||hasPerm(user,'lead')))
      view[key]=rows.map(r=>({...pick(r,['id','name','addr','accountId']),units:r.units.map(u=>pick(u,['id','no','area','st','floor','block','total','totalRaw','ppm','ppmRaw']))}));
    if(!aggregate)continue;
    if(key==='contracts')view[key]=rows.map(r=>({...pick(r,['id','no','proj','unit','cust','owners','date','total']),inst:r.inst.map(i=>({...pick(i,['id','title','amt','date','paid','kind']),...(i.parts?{parts:i.parts.map(p=>({amt:p.amt}))}:{})}))}));
    if(key==='reservations')view[key]=rows.map(r=>({...pick(r,['id','no','proj','unit','cust','st','need','deadline','date']),pays:r.pays.map(p=>({amt:p.amt})),...(r.cancel?{cancel:{...pick(r.cancel,['date','refund','fine']),h:(r.cancel.h||[]).map(()=>({}))}}:{})}));
    if(key==='leads')view[key]=rows.map(r=>({...pick(r,['id','name','proj','rep','stage','src','next']),h:(r.h||[]).map(h=>({s:h.s}))}));
  }
  if(!hasPerm(user,'cont'))view.cfg.drafts=[];
  if(!['acct','cont','proj'].some(k=>hasPerm(user,k)))view.cfg.accounts=[];
  return view;
}
export function mergeState(user,raw,prior){
  if(!raw||typeof raw!=='object'||!Array.isArray(raw.projects)||!Array.isArray(raw.customers)||!Array.isArray(raw.contracts)||!Array.isArray(raw.reservations))throw new AppError('اطلاعات ارسالی ناقص است');
  if(hasPerm(user,'admin'))return raw;
  const data={...raw,cfg:{...raw.cfg}};
  const visible=scopedState(user,prior);
  for(const [key,perm] of Object.entries(modules)){
    if(hasPerm(user,perm)&&(hasPerm(user,'write')||perm==='acct'))continue;
    // Ignore derived display fields; reject changes to protected records explicitly.
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
  if(!hasPerm(user,'cont')||!hasPerm(user,'write'))data.cfg.drafts=prior.cfg.drafts;
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
