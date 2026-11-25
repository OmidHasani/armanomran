import mongoose from 'mongoose';
import { Contract } from './models.js';
const eventSchema = new mongoose.Schema({contract:String,version:Number,actor:String,at:Date,changes:[String]}, {versionKey:false});
eventSchema.index({contract:1,version:-1});
export const ContractEvent=mongoose.model('ContractEvent',eventSchema);
function paymentMap(c){
  const result=new Map();
  for(const i of c.inst||[]){
    const parts=i.parts||(i.paid?[{id:i.id,date:i.pdate||i.date,amt:i.amt,ref:i.ref,owner:c.cust,fee:i.lateFee}]:[]);
    for(const p of parts){
      result.set(i.id+'/'+p.id,[i.title,p.date,p.amt+' تومان',p.ref||'بدون پیگیری',p.name||p.owner||'',p.fee?'جریمه '+p.fee:'',p.note||''].filter(Boolean).join(' · '));
    }
  }
  return result;
}
export async function recordFinancialChanges(contracts,session,user,version){
  const existing=await Contract.find({},{cust:1,inst:1,no:1,total:1,transfers:1}).session(session).lean();
  const prior=new Map(existing.map(c=>[String(c._id),c]));
  const events=[];
  for(const c of contracts){
    const previous=prior.get(c.id);
    const changes=[];
    if(!previous)changes.push('ثبت قرارداد '+c.no);
    if(previous&&previous.total!==c.total)changes.push('مبلغ قرارداد از '+previous.total+' به '+c.total+' تومان');
    if(previous&&previous.cust!==c.cust){
      const t=c.transfers?.at(-1);
      changes.push('انتقال از '+(t?.fromName||previous.cust)+' به '+(t?.toName||c.cust)+' · '+(t?.date||''));
    }
    const before=paymentMap(previous||{}),after=paymentMap(c);
    for(const [id,value] of after){
      const old=before.get(id);
      if(old!==value)changes.push(old?'ویرایش واریز · '+old+' ← '+value:'ثبت واریز · '+value);
    }
    for(const [id,value] of before)if(!after.has(id))changes.push('حذف واریز · '+value);
    if(changes.length)events.push({contract:c.id,version,actor:user.name||user.username,at:new Date(),changes});
  }
  if(events.length)await ContractEvent.insertMany(events,{session});
}
