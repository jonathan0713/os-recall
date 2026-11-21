(function(root){
'use strict';
const KEY='os-recall-demo-progress-v1',MINUTE=60000,DAY=86400000;
const EXAM_AT=0,EXAM_CUTOFF=EXAM_AT-30*MINUTE;
const SETTINGS={newPerDay:20,reviewsPerDay:200,studyMode:'standard'};
const RATINGS=['again','hard','good','easy'];
function number(v,fallback=0,min=0,max=1e15){const n=Number(v);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;}
function dayKey(now=Date.now()){const d=new Date(now);d.setHours(d.getHours()-4);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function nextDay(now=Date.now()){const d=new Date(now);if(d.getHours()>=4)d.setDate(d.getDate()+1);d.setHours(4,0,0,0);return +d;}
function empty(){return {version:2,cards:{},log:[],settings:{...SETTINGS}};}
function valid(x){return !!x&&[1,2].includes(x.version)&&x.cards&&typeof x.cards==='object'&&!Array.isArray(x.cards)&&Array.isArray(x.log);}
function settings(x={}){return {newPerDay:Math.round(number(x.newPerDay,20,0,500)),reviewsPerDay:Math.round(number(x.reviewsPerDay,200,0,2000)),studyMode:x.studyMode==='exam'?'exam':'standard'};}
function normalize(x,ids){
 if(!valid(x))throw new Error('不是有效的 OS Recall 進度檔');
 const out=empty(),allowed=new Set(ids);out.settings=settings(x.settings);
 for(const [id,p]of Object.entries(x.cards)){
  if(!allowed.has(id)||!p||typeof p!=='object')continue;
  const seen=number(p.seen,0,0,1e7),rating=RATINGS.includes(p.rating)?p.rating:'again',last=number(p.last);
  const phase=seen?(['learning','review','relearning'].includes(p.phase)?p.phase:(rating==='again'||rating==='hard'?'learning':'review')):'new';
  out.cards[id]={seen,good:number(p.good),lapses:number(p.lapses),due:number(p.due),last,rating,star:p.star===true,phase,step:Math.round(number(p.step,0,0,1)),interval:number(p.interval,seen?Math.max(1,(number(p.due)-last)/DAY):0,0,36500),ease:number(p.ease,2.5,1.3,4),firstStudied:number(p.firstStudied,seen?last:0),suspended:p.suspended===true,buriedUntil:number(p.buriedUntil)};
 }
 out.log=x.log.filter(e=>e&&allowed.has(e.id)&&Number.isFinite(e.at)&&e.at>=0&&RATINGS.includes(e.rating)).map(e=>({id:e.id,rating:e.rating,at:e.at,phase:['new','learning','review','relearning'].includes(e.phase)?e.phase:'legacy'})).slice(-20000);
 for(const [id,p]of Object.entries(out.cards)){if(p.seen&&!x.cards[id].firstStudied){const history=out.log.filter(l=>l.id===id);if(history.length)p.firstStudied=Math.min(p.last,...history.map(l=>l.at));}}
 return out;
}
function phase(p){return p?.seen?(p.phase||((p.rating==='again'||p.rating==='hard')?'learning':'review')):'new';}
function status(p){if(!p?.seen)return 'new';return ['learning','relearning'].includes(phase(p))?'weak':'learned';}
function blank(){return {seen:0,good:0,lapses:0,due:0,last:0,star:false,phase:'new',step:0,interval:0,ease:2.5,firstStudied:0,suspended:false,buriedUntil:0};}
function outcome(previous,rating,now){
 if(!RATINGS.includes(rating))throw new Error('Invalid rating');
 const p={...blank(),...previous},from=phase(p);let interval=p.interval,delay,step=p.step,next=from,ease=p.ease;
 if(from==='review'){
  if(rating==='again'){next='relearning';step=0;delay=10*MINUTE;interval=Math.max(1,Math.round(interval*.2));ease=Math.max(1.3,ease-.2);}
  else{const base=Math.max(1,interval),late=Math.max(0,(now-p.due)/DAY);next='review';step=0;
   if(rating==='hard'){interval=Math.max(base+1,Math.round(base*1.2));ease=Math.max(1.3,ease-.15);}
   if(rating==='good')interval=Math.max(base+1,Math.round((base+late*.5)*ease));
   if(rating==='easy'){interval=Math.max(base+2,Math.max(base+1,Math.round((base+late*.5)*ease))+1,Math.round((base+late)*ease*1.3));ease=Math.min(4,ease+.15);}
   delay=Math.min(36500,interval)*DAY;
  }
 }else if(from==='relearning'){
  if(rating==='again'){step=0;delay=10*MINUTE;}
  if(rating==='hard'){delay=15*MINUTE;}
  if(rating==='good'){next='review';interval=Math.max(1,interval);delay=interval*DAY;}
  if(rating==='easy'){next='review';interval=Math.max(4,interval+1);delay=interval*DAY;}
 }else{
  next='learning';
  if(rating==='again'){step=0;delay=MINUTE;}
  if(rating==='hard'){delay=(step===0?5.5:10)*MINUTE;}
  if(rating==='good'){if(step===0){step=1;delay=10*MINUTE;}else{next='review';interval=1;step=0;delay=DAY;}}
  if(rating==='easy'){next='review';interval=4;step=0;delay=4*DAY;}
 }
 return {...p,seen:p.seen+1,good:rating==='again'?0:p.good+1,lapses:p.lapses+(rating==='again'&&from==='review'?1:0),due:now+delay,last:now,rating,phase:next,step,interval:Math.min(36500,interval),ease,firstStudied:p.firstStudied||now};
}
function examActive(store,now=Date.now()){return store.settings?.studyMode==='exam'&&now<EXAM_AT;}
function scheduledOutcome(store,id,rating,now){
 const card=outcome(store.cards[id],rating,now);
 if(examActive(store,now)){
  const cap={again:1,hard:10,good:30,easy:120}[rating]*MINUTE;
  const delay=Math.min(card.due-now,cap,Math.max(0,EXAM_CUTOFF-now));
  card.due=now+delay;
  if(card.phase==='review')card.interval=delay/DAY;
 }
 return card;
}
function prepareExam(store,now=Date.now()){
 if(!examActive(store,now))return;
 for(const p of Object.values(store.cards))if(p.seen&&p.due>EXAM_CUTOFF)p.due=now;
}
function preview(store,id,now=Date.now()){return Object.fromEntries(RATINGS.map(r=>{const card=scheduledOutcome(store,id,r,now);return [r,{card,delay:card.due-now}];}));}
function grade(store,id,rating,now=Date.now()){const from=phase(store.cards[id]);store.cards[id]=scheduledOutcome(store,id,rating,now);store.log.push({id,rating,at:now,phase:from});store.log=store.log.slice(-20000);return store.cards[id];}
function formatDelay(ms){if(ms<=0)return '立即再練';if(ms<60000)return '不到 1 分鐘';if(ms<DAY){const m=ms/MINUTE;return m<60?`${Number(m.toFixed(1))} 分鐘`:`${Number((m/60).toFixed(1))} 小時`;}const d=Math.round(ms/DAY);return d<30?`${d} 天`:d<365?`${Number((d/30).toFixed(1))} 個月`:`${Number((d/365).toFixed(1))} 年`;}
function available(p,now){return !p?.suspended&&!(p?.buriedUntil>now);}
function today(store,now=Date.now()){const key=dayKey(now);return {newUsed:Object.values(store.cards).filter(p=>p.seen&&p.firstStudied&&dayKey(p.firstStudied)===key).length,reviewsUsed:store.log.filter(l=>l.phase==='review'&&dayKey(l.at)===key).length,answers:store.log.filter(l=>dayKey(l.at)===key).length};}
function matches(c,store,{category='all',filter='all',now=Date.now()}={}){const p=store.cards[c.id];return (category==='all'||c.category===category)&&available(p,now)&&(filter==='all'||filter==='exam'&&!!c.exam||filter==='weak'&&status(p)==='weak'||filter==='star'&&!!p?.star||filter==='due'&&!!p?.seen&&p.due<=now);}
function select(cards,store,{category='all',filter='all',limit=500,now=Date.now(),practice=false,ahead=true}={}){
 const base=cards.filter(c=>matches(c,store,{category,filter,now}));
 if(practice)return base.slice(0,limit);
 const options=settings(store.settings),used=today(store,now);
 const learning=base.filter(c=>['learning','relearning'].includes(phase(store.cards[c.id]))&&store.cards[c.id].due<=now).sort((a,b)=>store.cards[a.id].due-store.cards[b.id].due);
 const review=base.filter(c=>phase(store.cards[c.id])==='review'&&store.cards[c.id].due<=now).sort((a,b)=>store.cards[a.id].due-store.cards[b.id].due).slice(0,Math.max(0,options.reviewsPerDay-used.reviewsUsed));
 const fresh=base.filter(c=>phase(store.cards[c.id])==='new').slice(0,Math.max(0,options.newPerDay-used.newUsed));
 const queue=[...learning,...review,...fresh];
 if(!queue.length&&ahead&&filter!=='due'){const early=base.filter(c=>['learning','relearning'].includes(phase(store.cards[c.id]))&&store.cards[c.id].due<=now+20*MINUTE).sort((a,b)=>store.cards[a.id].due-store.cards[b.id].due);if(early.length)queue.push(early[0]);}
 return queue.slice(0,limit);
}
function nextDue(cards,store,{category='all',filter='all',now=Date.now()}={}){const list=cards.filter(c=>matches(c,store,{category,filter:filter==='due'?'all':filter,now})).map(c=>store.cards[c.id]).filter(p=>p?.seen&&p.due>now);return list.length?Math.min(...list.map(p=>p.due)):null;}
function summarize(cards,store,now=Date.now()){let learned=0,weak=0,seen=0,due=0,fresh=0,learning=0,review=0,suspended=0,buried=0;for(const c of cards){const p=store.cards[c.id];if(p?.suspended)suspended++;if(p?.buriedUntil>now)buried++;if(p?.seen)seen++;if(status(p)==='learned')learned++;if(status(p)==='weak')weak++;if(!available(p,now))continue;const state=phase(p);if(state==='new')fresh++;if(['learning','relearning'].includes(state))learning++;if(p?.seen&&p.due<=now){due++;if(state==='review')review++;}}return {total:cards.length,learned,weak,seen,due,new:fresh,learning,review,suspended,buried};}
function shuffle(arr,random=Math.random){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function makeOptions(c,random=Math.random){return shuffle([{text:c.answer_en||c.answer,correct:true},...(c.distractors_en||c.distractors).map(text=>({text,correct:false}))],random);}
const api={KEY,MINUTE,DAY,EXAM_AT,EXAM_CUTOFF,examActive,prepareExam,SETTINGS,empty,valid,normalize,settings,dayKey,nextDay,phase,status,blank,available,today,preview,grade,formatDelay,select,nextDue,summarize,shuffle,makeOptions};root.RecallEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
