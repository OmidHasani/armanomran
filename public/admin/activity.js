let activityUser='',activityBefore='',activityPage=0;
async function renderActivity(){
  const content=$('#content'),nowTab=state.tab;
  $('#headActions').innerHTML='<button id="reloadActivity" class="btn">تازه‌سازی</button>';
  $('#reloadActivity').onclick=()=>{activityBefore='';activityPage=0;renderActivity()};
  const params=new URLSearchParams({user:activityUser,before:activityBefore,sessionPage:activityPage}),key=params.toString();
  content.dataset.activity=key;
  try{
    const result=await api('/api/admin/activity?'+params);
    if(state.tab!==nowTab||content.dataset.activity!==key)return;
    const date=v=>v?new Date(v).toLocaleString('fa-IR',{dateStyle:'short',timeStyle:'short',timeZone:'Asia/Tehran'}):'—';
    const table=(heads,rows)=>'<div class="activity-table"><table><thead><tr>'+heads.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table>'+(!rows.length?'<p>سابقه‌ای ثبت نشده است.</p>':'')+'</div>';
    content.innerHTML='<label>نمایش سوابق <select id="activityUser"><option value="">همه کاربران</option>'+state.users.map(u=>'<option value="'+esc(u.username)+'">'+esc(u.name)+'</option>').join('')+'</select></label><h3>نشست‌های کاربران</h3><p class="muted">حضور بر اساس باز بودن صفحه در پیش‌زمینه محاسبه می‌شود. پس از ۹۰ ثانیه بدون سیگنال، نشست غیرفعال نمایش داده می‌شود.</p>'+
    table(['کاربر','وضعیت','ورود','آخرین حضور','خروج ثبت‌شده','مدت حضور'],result.sessions.map(s=>{
      const active=!s.end&&new Date(result.now)-new Date(s.last)<90000;
      return '<tr><td>'+esc(s.actor)+'<small>'+esc(s.user)+'</small></td><td><span class="tag">'+(s.end?'خارج‌شده':active?'آنلاین':'غیرفعال')+'</span></td><td>'+date(s.start)+'</td><td>'+date(s.last)+'</td><td>'+date(s.end)+'</td><td>'+fa(Math.floor(s.seconds/3600))+' ساعت و '+fa(Math.floor(s.seconds/60)%60)+' دقیقه</td></tr>';
    }))+'<div class="toolbar"><button id="prevSessions">جدیدتر</button><button id="nextSessions">قدیمی‌تر</button></div><h3>فعالیت و تغییر اطلاعات</h3>'+
    table(['تاریخ و ساعت','کاربر','عملیات','پرونده یا مسیر','جزئیات'],result.events.map(e=>'<tr><td>'+date(e.at)+'</td><td>'+esc(e.actor)+'<small>'+esc(e.user)+'</small></td><td>'+esc(e.action)+'</td><td>'+esc(e.target)+'</td><td>'+esc(e.details||'—')+'</td></tr>'))+
    '<div class="toolbar"><button id="latestActivity">آخرین رویدادها</button><button id="olderActivity">رویدادهای قدیمی‌تر</button></div>';
    $('#activityUser').value=activityUser;$('#activityUser').onchange=e=>{activityUser=e.target.value;activityBefore='';activityPage=0;renderActivity()};
    $('#prevSessions').disabled=!activityPage;$('#prevSessions').onclick=()=>{activityPage--;renderActivity()};
    $('#nextSessions').disabled=!result.moreSessions;$('#nextSessions').onclick=()=>{activityPage++;renderActivity()};
    $('#latestActivity').onclick=()=>{activityBefore='';renderActivity()};$('#olderActivity').disabled=!result.more;
    $('#olderActivity').onclick=()=>{activityBefore=result.events.at(-1)._id;renderActivity()};
  }catch(e){if(state.tab===nowTab)content.textContent=e.message}
}
let securityUser='',securityBefore='';
function auditCard(event,date){
  const snap=event.snapshot||{};
  const hadPrevious=!!(snap.previousTitle||snap.previousBody);
  const changed=hadPrevious&&(String(snap.previousTitle||'')!==String(snap.title||'')||String(snap.previousBody||'')!==String(snap.body||''));
  const units=(Array.isArray(snap.unitNames)?snap.unitNames:[]).filter(Boolean).join('، ');
  const file=snap.file?`<p>فایل: <b>${esc(snap.file)}</b></p>`:'';
  const before=changed?`<h4>متن پیش از ویرایش</h4><p class="audit-meta">عنوان: ${esc(snap.previousTitle||'—')}</p><pre>${esc(snap.previousBody||'')}</pre>`:'';
  const afterLabel=changed?'متن پس از ویرایش':snap.file?'متن گزارش در زمان تغییر پیوست':'متن ثبت‌شده';
  const after=(snap.body||snap.title||event.target)?`<h4>${afterLabel}</h4><p class="audit-meta">عنوان: ${esc(snap.title||event.target||'—')}</p><pre>${esc(snap.body||'')}</pre>`:'';
  return `<article class="audit-card"><header><b>${esc(event.action||'تغییر گزارش')}</b><time>${date(snap.at||event.at)}</time></header><p>${esc(event.actor||snap.authorName||'')} <small>${esc(event.user||snap.authorUser||'')}</small>${units?' · واحد '+esc(units):''}</p>${file}${before}${after}</article>`;
}
async function renderSecurity(){
  const content=$('#content'),nowTab=state.tab;
  $('#headActions').innerHTML='<button id="reloadSecurity" class="btn" type="button">تازه‌سازی</button>';
  $('#reloadSecurity').onclick=()=>{securityBefore='';renderSecurity()};
  const params=new URLSearchParams({kind:'report',user:securityUser,before:securityBefore}),key=params.toString();
  content.dataset.security=key;
  try{
    const result=await api('/api/admin/activity?'+params);
    if(state.tab!==nowTab||content.dataset.security!==key)return;
    const date=v=>v?new Date(v).toLocaleString('fa-IR',{dateStyle:'medium',timeStyle:'medium',timeZone:'Asia/Tehran'}):'—';
    const users=state.users||[];
    content.innerHTML='<p class="muted">هر ثبت، ویرایش و تغییر پیوست با نام کاربر، واحد، تاریخ و ساعت، و خود متن قبل و بعد از تغییر اینجا می‌ماند. ویرایش هر گزارش فقط برای نویسندهٔ همان گزارش ممکن است.</p><div class="security-tools"><label>کاربر <select id="securityUser"><option value="">همه کاربران</option>'+users.map(u=>'<option value="'+esc(u.username)+'">'+esc(u.name)+'</option>').join('')+'</select></label></div><div class="audit-list">'+((result.events||[]).map(e=>auditCard(e,date)).join('')||'<p>هنوز تغییری در گزارش‌ها ثبت نشده است.</p>')+'</div><div class="toolbar"><button id="latestSecurity" class="btn" type="button">آخرین تغییرات</button><button id="olderSecurity" class="btn" type="button">تغییرات قدیمی‌تر</button></div>';
    $('#securityUser').value=securityUser;
    $('#securityUser').onchange=e=>{securityUser=e.target.value;securityBefore='';renderSecurity()};
    $('#latestSecurity').onclick=()=>{securityBefore='';renderSecurity()};
    $('#olderSecurity').disabled=!result.more;
    $('#olderSecurity').onclick=()=>{securityBefore=result.events.at(-1)._id;renderSecurity()};
  }catch(e){if(state.tab===nowTab)content.textContent=e.message}
}
document.addEventListener('input',e=>{
  if(e.target.matches('[inputmode=numeric],[inputmode=tel]'))e.target.value=e.target.value.replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
});
setInterval(()=>{
  if(document.hidden||$('#shell').hidden||$('#content').contains(document.activeElement))return;
  if(state.tab==='activity'&&!activityPage&&!activityBefore)renderActivity();
  if(state.tab==='security'&&!securityBefore)renderSecurity();
},30000);
