import 'dotenv/config';
import mongoose from 'mongoose';
import {loadState,saveState} from '../server/persist.js';
import {LegalCase} from '../server/models.js';
import {DossierFile} from '../server/files.js';
import {Activity} from '../server/activity.js';
import {safeError} from '../server/db.js';

// Only rendered business text is inspected. Technical fields include English enum values on every record.
const matches=(...values)=>values.flat(Infinity).some(v=>typeof v==='string'&&/[A-Za-z]/.test(v));
const byId=rows=>new Map(rows.map(row=>[row.id,row]));
async function cleanup(){
  await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:5000});
  const {data,version}=await loadState(),customers=byId(data.customers),projects=byId(data.projects),parties=byId(data.parties);
  const property=r=>{const p=projects.get(r.proj),u=p?.units.find(u=>u.id===r.unit);return [customers.get(r.cust)?.name,p?.name,u?.no,u?.block]};
  const counts={},blocked=[];
  function remove(group,rows,predicate){
    const kept=rows.filter(row=>!predicate(row));
    counts[group]=(counts[group]||0)+rows.length-kept.length;return kept;
  }
  data.contracts=remove('contracts',data.contracts,c=>matches(property(c),c.note,c.doc?.title,c.owners?.map(o=>customers.get(o.customer)?.name)));
  for(const c of data.contracts)c.inst=remove('installments',c.inst||[],i=>matches(i.title));
  data.reservations=remove('reservations',data.reservations,r=>matches(property(r),r.doc?.title,r.by,r.appr,r.cancel?.reason));
  const held=new Set([...data.contracts,...data.reservations].map(r=>r.proj+'|'+r.unit));
  data.leads=remove('leads',data.leads,l=>matches(l.name,l.note,l.rep,l.src,projects.get(l.proj)?.name));
  data.ledger=remove('ledger',data.ledger,x=>matches(x.desc,parties.get(x.party)?.name));
  data.checks=remove('checks',data.checks,x=>matches(x.desc,x.note,x.holder,x.bank,parties.get(x.party)?.name));
  const partyRefs=new Set([...data.checks,...data.ledger].map(x=>x.party));
  data.parties=remove('parties',data.parties,x=>{
    if(!matches(x.name,x.title,x.note))return false;
    if(partyRefs.has(x.id)){blocked.push(['parties',x.id]);return false}return true;
  });
  const ownerRefs=new Set([...data.contracts,...data.reservations].flatMap(c=>[c.cust,...(c.owners||[]).map(o=>o.customer),...(c.transfers||[]).flatMap(t=>[t.from,t.to]),...(c.inst||[]).flatMap(i=>(i.parts||[]).map(p=>p.owner))]));
  data.customers=remove('customers',data.customers,c=>{
    if(!matches(c.name))return false;
    if(ownerRefs.has(c.id)){blocked.push(['customers',c.id]);return false}return true;
  });
  for(const p of data.projects)p.units=remove('units',p.units,u=>{
    if(!matches(p.name,u.no,u.kind,u.block))return false;
    if(held.has(p.id+'|'+u.id)){blocked.push(['units',u.id]);return false}return true;
  });
  data.projects=remove('projects',data.projects,p=>{
    if(!matches(p.name,p.note))return false;
    if(p.units.length){blocked.push(['projects',p.id]);return false}return true;
  });
  const reservations=new Set(data.reservations.map(r=>r.id));
  for(const c of data.contracts)if(c.reservationId&&!reservations.has(c.reservationId))delete c.reservationId;
  const fields=['title','body','customer.name','project.name','unit.no','unit.block','installment.title','assignedName','currentUnitName','referredBy'];
  const filter={$or:fields.map(field=>({[field]:/[a-z]/i}))};
  const cases=await LegalCase.find(filter).select('_id').lean();
  counts.referrals=cases.length;
  console.log(JSON.stringify({counts,blocked}));
  if(!process.argv.includes('--apply')||!Object.values(counts).some(Boolean))return;
  await saveState({role:'admin',username:'maintenance',name:'پاک‌سازی کارت‌ها'},version,data,async session=>{
    const query={...filter,_id:{$in:cases.map(c=>c._id)}};
    const ids=await LegalCase.find(query).distinct('_id').session(session);
    await LegalCase.deleteMany({_id:{$in:ids}}).session(session);
    await DossierFile.deleteMany({kind:'workcase',parent:{$in:ids}}).session(session);
    await Activity.create([{actor:'پاک‌سازی کارت‌ها',user:'maintenance',action:'حذف کارت‌های دارای متن انگلیسی',details:JSON.stringify({...counts,referrals:ids.length})}],{session});
  });
  console.log('پاک‌سازی ثبت شد.');
}
try{await cleanup()}catch(e){console.error(safeError(e));process.exitCode=1}finally{await mongoose.disconnect()}
