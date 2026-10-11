(function(){
'use strict';
const config=window.ALKHALEEL_SUPABASE;
if(!config||!config.url||!config.key)return;
const MOSQUE_ID='00000000-0000-4000-8000-000000000001';
const headers={apikey:config.key};
if(!config.key.startsWith('sb_'))headers.Authorization='Bearer '+config.key;
const dateKey=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
let running=false;
async function get(path){const response=await fetch(config.url.replace(/\/$/,'')+'/rest/v1/'+path,{headers,cache:'no-store'});if(!response.ok)throw new Error('Screen data '+response.status);const rows=await response.json();if(!Array.isArray(rows))throw new Error('Invalid screen data');return rows;}
async function refresh(){
if(running)return;running=true;
try{
const now=new Date(),tomorrow=new Date(now);tomorrow.setDate(now.getDate()+1);
const [days,rules]=await Promise.all([
get('effective_prayer_times?select=prayer_date,fajr,sunrise,dhuhr,asr,maghrib,isha&mosque_id=eq.'+MOSQUE_ID+'&prayer_date=gte.'+dateKey(now)+'&prayer_date=lte.'+dateKey(tomorrow)),
get('iqama_rules?select=prayer,mode,value,valid_from,valid_to&mosque_id=eq.'+MOSQUE_ID+'&order=valid_from.asc')]);
const keys={fajr:'Fajr',sunrise:'Shuruq',dhuhr:'Duhur',asr:'Asr',maghrib:'Maghrib',isha:'Ishâ'};
for(const day of days){const date=day.prayer_date+' 00:00:00';let row=prayerData.find(item=>item.Datum===date);if(!row){row={Datum:date};prayerData.push(row);}for(const [remote,local]of Object.entries(keys))row[local]=String(day[remote]||'').slice(0,5);}
window.alkhaleelIqamaRules=rules;
window.alkhaleelRemoteReady=true;
document.body.dataset.remote='ready';
updateTimer();renderTable();
}catch(error){document.body.dataset.remote='offline';console.warn('تعذّر تحديث مواقيت وإقامة مسجد الخليل؛ الاحتفاظ بآخر بيانات محملة.',error);}
finally{running=false;}
}
refresh();setInterval(refresh,30000);
window.addEventListener('online',refresh);
})();
