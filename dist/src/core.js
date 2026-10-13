export const STAGES = ['easy', 'master', 'challenge'];
export const TARGETS = [12, 10, 8];
export const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function dayDate(day) { return new Date(`${day}T12:00:00`); }
const PROFILES = [
  {focus:'FIELD + MOBILITY',items:[]},
  {focus:'BACK',items:['Lat Pulldown','Low Row','Chest Press','Lateral Raise','Biceps Curl','Cable Crunch']},
  {focus:'CHEST',items:['Chest Press','Incline Press','Lat Pulldown','Lateral Raise','Triceps Pressdown','Dead Bug']},
  {focus:'ARMS',items:['Biceps Curl','Hammer Curl','Triceps Pressdown','Low Row','Chest Press','Cable Crunch']},
  {focus:'CORE',items:['Cable Crunch','Pallof Press','Dead Bug','Lat Pulldown','Lateral Raise','Chest Press']},
  {focus:'BACK + SHOULDERS',items:['Lat Pulldown','Low Row','Lateral Raise','Rear Delt Fly','Chest Press','Biceps Curl','Cable Crunch']},
  {focus:'UPPER BODY TECHNIQUE',items:['Assisted Pull-up','Chest Press','Low Row','Biceps Curl','Triceps Pressdown','Dead Bug']}
];
export function profile(day) { return structuredClone(PROFILES[dayDate(day).getDay()]); }
export const DEFAULTS = {'Lat Pulldown':{easy:55,master:70,challenge:80},'Low Row':{easy:40,master:55,challenge:65},'Chest Press':{easy:20,master:25,challenge:30},'Incline Press':{easy:15,master:20,challenge:25},'Lateral Raise':{easy:5,master:8,challenge:10},'Rear Delt Fly':{easy:5,master:8,challenge:10},'Biceps Curl':{easy:10,master:15,challenge:20},'Hammer Curl':{easy:10,master:15,challenge:20},'Triceps Pressdown':{easy:15,master:20,challenge:25},'Cable Crunch':{easy:15,master:20,challenge:25},'Pallof Press':{easy:10,master:12,challenge:15},'Dead Bug':{easy:0,master:0,challenge:0},'Assisted Pull-up':{easy:150,master:145,challenge:140}};
export function freshState() { return {schema:2,weights:{},confirmed:{},sets:[],runs:[],completed:{},workouts:{},runSession:null,recovery:{end:0},timer:{remaining:90,end:0,running:false},recapSeen:{},skillMilestones:{},rest:90}; }
export function migrate(input) {
  const state = Object.assign(freshState(), input || {});
  if (state.schema > 2) throw new Error('This backup needs a newer app version.');
  if(!state.skillMilestones||typeof state.skillMilestones!=='object'||Array.isArray(state.skillMilestones))state.skillMilestones={};
  state.sets = state.sets.map((s,i)=>({...s,id:s.id || `legacy-set-${i}`,actualReps:s.actualReps ?? s.reps,targetReps:s.targetReps ?? s.reps,completed:s.completed ?? true}));
  state.runs = state.runs.map((r,i)=>({...r,id:r.id || `legacy-run-${i}`}));
  // Old prototype completion flags cannot prove a workout finished. Recompute from real sessions.
  state.completed = {};
  state.schema = 2;
  for (const day of Object.keys(state.workouts)) checkDay(state,day);
  for (const run of state.runs) if (run.day) checkDay(state,run.day);
  return state;
}
export function workout(state, day) {
  return state.workouts[day] ||= {day,index:0,stage:0,round:1,extra:0,done:false,stopped:false,items:profile(day).items};
}
export function nextSet(state,day) {
  const w=workout(state,day); if(w.done || w.stopped || !w.items.length) return null;
  const name=w.items[w.index], stage=STAGES[w.stage], weight=(state.weights[name] || DEFAULTS[name] || {easy:0,master:0,challenge:0})[stage];
  return {name,stage,target:TARGETS[w.stage],actual:Math.max(0,TARGETS[w.stage]+w.extra),weight};
}
export function adjustRep(state,day,delta) { const w=workout(state,day); const x=nextSet(state,day); if(x)w.extra=Math.max(-x.target,Math.min(100,w.extra+delta)); }
export function adjustWeight(state,day,delta) {
  const x=nextSet(state,day); if(!x)return;
  const weights={...(state.weights[x.name] || DEFAULTS[x.name])}; weights[x.stage]=Math.max(0,weights[x.stage]+delta); state.weights[x.name]=weights;
  // Every stage estimate requires confirmation; changing it still leaves that explicit step available.
}
export function confirmLoad(state,day) { const x=nextSet(state,day); if(x)state.confirmed[`${x.name}:${x.stage}`]=true; }
export function loadConfirmed(state,day) { const x=nextSet(state,day); return !!x && (x.name==='Dead Bug' || !!state.confirmed[`${x.name}:${x.stage}`]); }
function id() { return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
export function logSet(state,day,now=Date.now()) {
  const w=workout(state,day), x=nextSet(state,day); if(!x || !loadConfirmed(state,day))return false;
  state.sets.push({id:id(),timestamp:new Date(now).toISOString(),day,exercise:x.name,stage:x.stage,round:w.round,targetReps:x.target,actualReps:x.actual,reps:x.actual,weight:x.weight,resistanceType:x.name==='Assisted Pull-up'?'assistance':x.name==='Dead Bug'?'bodyweight':'load',completed:true});
  w.extra=0; w.stage++;
  if(w.stage===3){w.stage=0;w.round++;}
  if(w.round>3){w.round=1;w.index++;}
  if(w.index>=w.items.length){w.done=true;w.finishedAt=new Date(now).toISOString();}
  state.recovery={end:w.done?0:now+state.rest*1000,day}; checkDay(state,day);return true;
}
export function stopWorkout(state,day,now=Date.now()) { const w=workout(state,day); if(!w.done){w.stopped=true;w.finishedAt=new Date(now).toISOString();}state.recovery={end:0};checkDay(state,day); }
export function resumeWorkout(state,day) { const w=workout(state,day); if(!w.done && w.items.length){w.stopped=false;delete w.finishedAt;}return !w.done; }
export function moreRest(state,now=Date.now()) {state.recovery.end=Math.max(now,state.recovery.end || 0)+state.rest*1000;}
export function ready(state){state.recovery.end=0;}
export function runChoice(day) {
  const d=dayDate(day).getDay();
  if(d===0||d===4)return {name:'EASY WALK + MOBILITY',segments:[['Easy walk',300],['Gentle mobility',120]],rounds:2};
  if(d===2||d===6)return {name:'FIELD SHUTTLES',segments:[['Shuttle out / back',20],['Walk recovery',100]],rounds:4};
  return {name:'RUN/WALK',segments:[['Easy jog',60],['Walk',120]],rounds:5};
}
export function ensureRun(state,day) {
  if(!state.runSession)state.runSession={id:id(),day,choice:runChoice(day),round:1,seg:0,completedIntervals:0,end:0,remaining:runChoice(day).segments[0][1],elapsed:0,done:false,startedAt:0};
  return state.runSession;
}
export function advanceRun(state,now=Date.now()) {
  const r=state.runSession; if(!r || !r.end || r.done)return false;
  let changed=false;
  while(r.end && now>=r.end && !r.done){
    r.elapsed+=(r.end-r.startedAt)/1000; const boundary=r.end;
    r.completedIntervals++;r.seg++;
    if(r.seg>=r.choice.segments.length){r.seg=0;r.round++;}
    if(r.round>r.choice.rounds){r.done=true;r.round=r.choice.rounds;r.seg=r.choice.segments.length-1;r.end=0;r.startedAt=0;r.remaining=0;}
    else{r.remaining=r.choice.segments[r.seg][1];r.startedAt=boundary;r.end=boundary+r.remaining*1000;}
    changed=true;
  }
  return changed;
}
export function toggleRun(state,now=Date.now()) {
  advanceRun(state,now); const r=state.runSession;if(!r || r.done)return;
  if(r.end){r.elapsed+=(now-r.startedAt)/1000;r.remaining=Math.max(0,(r.end-now)/1000);r.end=0;r.startedAt=0;}
  else{r.startedAt=now;r.end=now+r.remaining*1000;}
}
export function moreRun(state,now=Date.now()) {advanceRun(state,now);const r=state.runSession;if(!r||r.done)return;if(r.end)r.end+=30000;else r.remaining+=30;}
export function finishRun(state,now=Date.now()) {
  advanceRun(state,now);const r=state.runSession;if(!r)return false;
  const durationSeconds=Math.round(r.elapsed+(r.end?(now-r.startedAt)/1000:0));
  if(durationSeconds<=0)return false;
  state.runs.push({id:r.id,day:r.day,timestamp:new Date(now).toISOString(),name:r.choice.name,rounds:Math.floor(r.completedIntervals/r.choice.segments.length),completedIntervals:r.completedIntervals,durationSeconds,completed:r.done,plannedSeconds:r.choice.segments.reduce((a,s)=>a+s[1],0)*r.choice.rounds});
  const day=r.day;state.runSession=null;checkDay(state,day);return true;
}
export function checkDay(state,day) {
  const strength=profile(day).items.length===0 || state.workouts[day]?.done===true;
  const moved=state.runs.some(r=>r.day===day && r.completed===true && r.durationSeconds>0);
  if(strength && moved)state.completed[day]=true;else delete state.completed[day];return !!state.completed[day];
}
export function dayStatus(state,day,today=localDay()) {
  if(state.completed[day])return 'complete';
  if(profile(day).items.length===0)return 'planned recovery';
  if(state.workouts[day]?.stopped)return 'stopped';
  if(day<today)return state.sets.some(s=>s.day===day)||state.runs.some(r=>r.day===day)?'partial':'skipped';
  return day===today?'today':'planned';
}
export function timerRemaining(state,now=Date.now()) {return state.timer.running?Math.max(0,(state.timer.end-now)/1000):state.timer.remaining;}
export function toggleTimer(state,now=Date.now()) {const t=state.timer;if(t.running){t.remaining=timerRemaining(state,now);t.running=false;t.end=0;}else if(t.remaining>0){t.end=now+t.remaining*1000;t.running=true;}}
export function addTimer(state,now=Date.now()) {const t=state.timer;if(t.running){t.remaining=timerRemaining(state,now)+30;t.end=now+t.remaining*1000;}else t.remaining+=30;}
export function setTimer(state,seconds=90){state.timer={remaining:seconds,end:0,running:false};}
export function tickTimer(state,now=Date.now()){if(state.timer.running && now>=state.timer.end){setTimer(state,0);return true;}return false;}
export function recap(state,day){const sets=state.sets.filter(s=>s.day===day),runs=state.runs.filter(r=>r.day===day);return {sets,runs,reps:sets.reduce((a,s)=>a+s.actualReps,0),movementSeconds:runs.reduce((a,r)=>a+(r.durationSeconds||0),0),complete:!!state.completed[day]};}
export function personalRecords(state){const prs={};for(const s of state.sets){if(!s.completed || s.actualReps<=0 || s.resistanceType==='bodyweight')continue;const old=prs[s.exercise],assist=s.exercise==='Assisted Pull-up';if(!old || (assist?s.weight<old.weight:s.weight>old.weight) || (s.weight===old.weight && s.actualReps>old.actualReps))prs[s.exercise]=s;}return prs;}
export function recapDue(state,date=new Date()){const day=localDay(date);return date.getHours()>=22 && !state.recapSeen[day];}
export function validateBackup(value){
  if(!value || !Array.isArray(value.sets)||!Array.isArray(value.runs)||typeof value.weights!=='object'||!value.weights)throw new Error('Not a Kitty Quest backup.');
  const dayPattern=/^\d{4}-\d{2}-\d{2}$/;
  for(const s of value.sets)if(!dayPattern.test(s.day)||typeof s.exercise!=='string'||!Object.hasOwn(DEFAULTS,s.exercise)||!STAGES.includes(s.stage)||!Number.isFinite(s.weight)||s.weight<0||!Number.isFinite(s.actualReps ?? s.reps)||(s.actualReps ?? s.reps)<0)throw new Error('Invalid set in backup.');
  for(const r of value.runs)if(!dayPattern.test(r.day)||typeof r.name!=='string'||!['RUN/WALK','FIELD SHUTTLES','EASY JOG','EASY WALK + MOBILITY'].includes(r.name)||(r.durationSeconds!==undefined && (!Number.isFinite(r.durationSeconds)||r.durationSeconds<0)))throw new Error('Invalid movement in backup.');
  for(const [name,loads] of Object.entries(value.weights)){if(!Object.hasOwn(DEFAULTS,name)||!loads||STAGES.some(s=>!Number.isFinite(loads[s])||loads[s]<0))throw new Error('Invalid loads in backup.');}
  // Validate persisted sessions rather than trusting imported HTML or arbitrary executable text.
  const safe=migrate(value);
  if(Object.entries(safe.skillMilestones).some(([key,flag])=>!['pullup','muscleup','rope','climb','deadlift','carry','grip','run'].includes(key)||typeof flag!=='boolean'))throw new Error('Invalid skill milestones in backup.');
  for(const [day,w] of Object.entries(safe.workouts))if(!dayPattern.test(day)||!w||!Array.isArray(w.items)||w.items.some(n=>!Object.hasOwn(DEFAULTS,n))||!Number.isInteger(w.index)||w.index<0||w.index>w.items.length||!Number.isInteger(w.stage)||w.stage<0||w.stage>2||!Number.isInteger(w.round)||w.round<1||w.round>3||!Number.isFinite(w.extra))throw new Error('Invalid workout in backup.');
  const r=safe.runSession;if(r && (!dayPattern.test(r.day)||!r.choice||!['RUN/WALK','FIELD SHUTTLES','EASY WALK + MOBILITY'].includes(r.choice.name)||!Number.isInteger(r.choice.rounds)||r.choice.rounds<1||r.choice.rounds>20||!Array.isArray(r.choice.segments)||!Number.isInteger(r.seg)||r.seg<0||r.seg>=r.choice.segments.length||!Number.isInteger(r.round)||r.round<1||r.round>r.choice.rounds||!Number.isFinite(r.elapsed)||r.elapsed<0||!Number.isFinite(r.remaining)||r.remaining<0||!Number.isFinite(r.end)||!Number.isFinite(r.startedAt)||!Number.isInteger(r.completedIntervals)||r.completedIntervals<0||r.completedIntervals>r.choice.rounds*r.choice.segments.length||r.choice.segments.some(s=>!Array.isArray(s)||typeof s[0]!=='string'||!['Easy walk','Gentle mobility','Shuttle out / back','Walk recovery','Easy jog','Walk','Jog'].includes(s[0])||!Number.isFinite(s[1])||s[1]<=0)))throw new Error('Invalid running session in backup.');
  if(!safe.timer||!Number.isFinite(safe.timer.remaining)||safe.timer.remaining<0||!Number.isFinite(safe.timer.end)||!safe.recovery||!Number.isFinite(safe.recovery.end))throw new Error('Invalid timer in backup.');
  return safe;
}
