import mongoose from 'mongoose';
import {createHash} from 'node:crypto';
const Schema=mongoose.Schema;
const activity=new Schema({actor:String,user:String,action:String,target:String,details:String,at:{type:Date,default:Date.now}},{versionKey:false});
activity.index({at:-1});activity.index({user:1,_id:-1});
export const Activity=mongoose.model('Activity',activity);
const visit=new Schema({_id:String,user:String,actor:String,start:Date,last:Date,end:Date,seconds:{type:Number,default:0}},{versionKey:false});
visit.index({last:-1});
export const Visit=mongoose.model('Visit',visit);
const key=req=>createHash('sha256').update(req.sessionID).digest('hex');
export async function enter(req,user){
  const now=new Date();
  await Visit.create({_id:key(req),user:user.username,actor:user.name,start:now,last:now});
}
export async function pulse(req,logout=false){
  const now=new Date();
  await Visit.updateOne({_id:key(req),end:null},[{$set:{seconds:{$add:[{$ifNull:['$seconds',0]},{$cond:[{$lte:[{$subtract:[now,'$last']},90000]},{$max:[0,{$divide:[{$subtract:[now,'$last']},1000]}]},0]}]},last:now,...(logout?{end:now}:{})}}]);
}
export function activityMiddleware(req,res,next){
  if(req.path!=='/view-event'&&req.path!=='/presence'&&req.path!=='/admin/activity'&&(req.path!=='/state'||req.method==='GET')&&
    (req.method!=='GET'||/^\/(state$|admin\/export|files\/|contract-history\/|users$|workcases|legal\/cases)/.test(req.path))){
    res.on('finish',()=>{
      if(!req.user)return;
      const path=req.path.split('/').filter(Boolean);
      const title=({state:'اطلاعات سامانه',users:'کاربر',units:'واحد سازمانی',files:'فایل پرونده',workcases:'ارجاع',legal:'حقوقی',admin:'مدیریت',auth:'حساب کاربری','contract-history':'تاریخچه مالی'})[path[0]]||'سامانه';
      const op=({GET:'مشاهده',POST:'ثبت',PATCH:'تغییر',PUT:'ویرایش',DELETE:'حذف'})[req.method]||req.method;
      const details=[req.body?.username,req.body?.name,Array.isArray(req.body?.perms)?'دسترسی‌ها '+req.body.perms.join('، '):'',req.body?.status,req.body?.unitId,req.body?.assignedTo,Array.isArray(req.body?.unitIds)?'عضویت '+req.body.unitIds.join('، '):'',Array.isArray(req.body?.memberIds)?'اعضا '+req.body.memberIds.join('، '):'',req.body?.password&&req.path!=='/auth/login'?'تنظیم رمز':''].filter(v=>typeof v==='string'&&v).join(' · ').slice(0,1000);
      Activity.create({actor:req.user.name,user:req.user.username,action:op+' '+title,target:req.path.slice(0,220),details:(res.statusCode>=400?'ناموفق '+res.statusCode+' · ':'')+details}).catch(e=>console.error('Activity store:',e.name));
    });
  }
  next();
}
