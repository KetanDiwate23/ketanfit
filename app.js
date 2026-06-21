// ── STORAGE ───────────────────────────────────────────────────
const DB={
  get(k,d=null){try{const v=localStorage.getItem(k);return v!==null?JSON.parse(v):d;}catch(e){return d;}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
};

// ── STATE ─────────────────────────────────────────────────────
const S={
  page:'home',
  programStart:DB.get('programStart',null),
  workoutLogs:DB.get('workoutLogs',{}),
  cardioLogs:DB.get('cardioLogs',{}),
  mealLogs:DB.get('mealLogs',{}),
  bodyStats:DB.get('bodyStats',[]),
  expandedEx:null,
};
function save(k,v){S[k]=v;DB.set(k,v);}

// ── HELPERS ───────────────────────────────────────────────────
function today(){return new Date().toISOString().split('T')[0];}
function daysBetween(a,b){return Math.floor((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/86400000);}
function fmt(d){return new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'});}
function fmtS(d){return new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short'});}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.style.opacity='1';setTimeout(()=>t.style.opacity='0',2200);}

// ── FIXED ROADMAP ─────────────────────────────────────────────
// 26-week fixed schedule. Each week is 7 entries (Mon–Sun).
// Value: day object id, or 'rest', or 'active'
function buildRoadmap(){
  const map=[];
  // Phase 1: Weeks 1-8 → Full Body A/B/C, 3 days/week
  // Mon=A, Tue=rest, Wed=B, Thu=rest, Fri=C, Sat=active, Sun=rest
  const p1week=['A','rest','B','rest','C','active','rest'];
  for(let w=0;w<8;w++) p1week.forEach(d=>map.push({phase:'p1',entry:d}));

  // Phase 2: Weeks 9-18 → Upper/Lower 4 days/week
  // Mon=UA, Tue=LA, Wed=rest, Thu=UB, Fri=LB, Sat=active, Sun=rest
  const p2week=['UA','LA','rest','UB','LB','active','rest'];
  for(let w=0;w<10;w++) p2week.forEach(d=>map.push({phase:'p2',entry:d}));

  // Phase 3: Weeks 19-26 → PPL 5 days/week
  // Mon=P1, Tue=Pu1, Wed=Le, Thu=P2, Fri=Pu2, Sat=active, Sun=rest
  const p3week=['P1','Pu1','Le','P2','Pu2','active','rest'];
  for(let w=0;w<8;w++) p3week.forEach(d=>map.push({phase:'p3',entry:d}));

  return map;
}
const ROADMAP=buildRoadmap(); // 182 entries

function getTodayInfo(dateStr){
  if(!S.programStart) return null;
  const dayIndex=daysBetween(S.programStart, dateStr);
  if(dayIndex<0||dayIndex>=ROADMAP.length) return null;
  const slot=ROADMAP[dayIndex];
  const phase=PROGRAM.phases.find(p=>p.id===slot.phase);
  const weekNum=Math.floor(dayIndex/7)+1;
  const isRest=slot.entry==='rest';
  const isActive=slot.entry==='active';
  const dayObj=(isRest||isActive)?null:phase.days.find(d=>d.id===slot.entry);
  return {phase, weekNum, dayIndex, slot, isRest, isActive, dayObj};
}

// ── NAVIGATE ──────────────────────────────────────────────────
function go(page){
  S.page=page; S.expandedEx=null;
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('active'));
  const nb=document.getElementById('nb-'+page);
  if(nb) nb.classList.add('active');
  render();
}

// ── RENDER ────────────────────────────────────────────────────
function render(){
  const c=document.getElementById('content');
  c.innerHTML='';
  c.classList.add('fade-up');
  setTimeout(()=>c.classList.remove('fade-up'),300);
  const ts=getTodayInfo(today());
  const hs=document.getElementById('header-sub');
  if(hs&&ts) hs.textContent=`Week ${ts.weekNum} of 26 · ${ts.phase.label}`;
  else if(hs) hs.textContent='6-Month Transformation';
  if(S.page==='home')           renderHome(c,ts);
  else if(S.page==='workout')   renderWorkout(c,ts);
  else if(S.page==='cardio')    renderCardio(c,ts);
  else if(S.page==='nutrition') renderNutrition(c,ts);
  else if(S.page==='stats')     renderStats(c);
}

// ── HOME ──────────────────────────────────────────────────────
function renderHome(c,ts){
  if(!S.programStart){renderOnboard(c);return;}
  const td=today();
  const wLog=S.workoutLogs[td]||{};
  const cLog=S.cardioLogs[td]||{};
  const mLog=S.mealLogs[td]||{};
  const nutrition=PROGRAM.nutrition[ts.phase.id]||PROGRAM.nutrition.p1;
  const mealsDone=nutrition.meals.filter(m=>mLog[m.id]).length;
  const lastStat=S.bodyStats.length?S.bodyStats[S.bodyStats.length-1]:null;
  const curW=lastStat?lastStat.weight:PROGRAM.startWeight;
  const lost=+(PROGRAM.startWeight-curW).toFixed(1);
  const toGo=+(curW-PROGRAM.targetWeight).toFixed(1);
  const pct=Math.min(100,Math.max(0,Math.round((lost/(PROGRAM.startWeight-PROGRAM.targetWeight))*100)));
  const streak=calcStreak();

  let html='';

  // ── TODAY HERO CARD ──
  if(ts.isRest){
    html+=`<div class="card mb16" style="background:var(--s2)">
      <div class="label t3 mb6">TODAY · ${fmt(td)}</div>
      <div style="font-size:26px;font-weight:900;letter-spacing:-.03em;margin-bottom:4px">Rest Day 😴</div>
      <div class="t2 small mb12">Week ${ts.weekNum} · ${ts.phase.label}: ${ts.phase.title}</div>
      <div class="div"></div>
      <div class="small t2" style="line-height:1.65">No gym today. Walk 7,000+ steps, eat your meals, sleep 8 hours. Recovery is when you grow.</div>
    </div>`;
  } else if(ts.isActive){
    html+=`<div class="card mb16" style="background:var(--s2);border-color:#4CC9F030">
      <div class="label mb6" style="color:var(--blue)">TODAY · ${fmt(td)}</div>
      <div style="font-size:26px;font-weight:900;letter-spacing:-.03em;margin-bottom:4px">Active Recovery 🚶</div>
      <div class="t2 small mb12">Week ${ts.weekNum} · ${ts.phase.label}: ${ts.phase.title}</div>
      <div class="div"></div>
      <div class="small t2" style="line-height:1.65">Light walk 20–30 min + ab circuit + stretching. No heavy lifting today.</div>
    </div>`;
  } else if(ts.dayObj){
    const wDone=wLog.done&&wLog.dayId===ts.dayObj.id;
    html+=`<div class="today-badge mb16">
      <div class="phase-label">TODAY · Week ${ts.weekNum} · ${ts.phase.label} · Day ${ts.dayIndex+1}</div>
      <div class="day-title">${ts.dayObj.name}</div>
      <div class="day-sub">${ts.dayObj.focus} · ${ts.dayObj.exercises.length} exercises</div>
      <button class="start-btn" onclick="go('workout')">${wDone?'✓ Done — View Again':'Start Workout →'}</button>
    </div>`;
  }

  // ── WEEK VIEW ──
  const weekStart=Math.floor(ts.dayIndex/7)*7;
  html+=`<div class="label mb8">This Week — Week ${ts.weekNum}</div>
  <div class="week-cal mb16">`;
  const dayLetters=['M','T','W','T','F','S','S'];
  for(let i=0;i<7;i++){
    const slotIndex=weekStart+i;
    const slot=ROADMAP[slotIndex];
    const d=new Date(S.programStart+'T00:00:00');
    d.setDate(d.getDate()+slotIndex);
    const ds=d.toISOString().split('T')[0];
    const isToday=ds===td;
    const isDone=S.workoutLogs[ds]&&S.workoutLogs[ds].done;
    const isRest=slot.entry==='rest';
    const isActive=slot.entry==='active';
    const label=isDone?'✓':isRest?'—':isActive?'~':slot.entry;
    html+=`<div class="wc-day${isToday?' active':''}${isDone&&!isToday?' done':''}${isRest?' rest':''}">
      <div class="wc-name">${dayLetters[i]}</div>
      <div class="wc-label">${label}</div>
    </div>`;
  }
  html+=`</div>`;

  // ── STATS ──
  html+=`<div class="stat-grid">
    <div class="stat-box"><div class="stat-val g">${curW}<span style="font-size:12px"> kg</span></div><div class="stat-sub">Current</div>${lost>0?`<div class="small mt4 g">▼ ${lost} kg lost</div>`:''}</div>
    <div class="stat-box"><div class="stat-val" style="color:var(--orange)">${streak} 🔥</div><div class="stat-sub">Streak</div><div class="small mt4 t3">${toGo>0?toGo+' kg to go':'🎉 Target!'}</div></div>
  </div>`;

  // ── PROGRESS ──
  html+=`<div class="card g mb16">
    <div class="row between mb8"><span class="small bold">Journey Progress</span><span class="mono xs g">${pct}% · Day ${ts.dayIndex+1}/182</span></div>
    <div class="pbar mb6"><div class="pbar-fill" style="width:${Math.round((ts.dayIndex+1)/182*100)}%;background:var(--g)"></div></div>
    <div class="row between xs t3 mono"><span>Day 1</span><span>Day 182 (Week 26)</span></div>
  </div>`;

  // ── CHECKLIST ──
  const wLabel=ts.dayObj?(wLog.done?`${ts.dayObj.name} done`:`${ts.dayObj.name} — tap to start`):(ts.isActive?'Active Recovery':'Rest Day');
  html+=`<div class="label mb8">Today's Checklist</div>
  <div class="card mb16">
    ${chkRow(wLog.done||ts.isRest, wLabel, "go('workout')")}
    ${chkRow(cLog.done, cLog.done?`Cardio done (${cLog.duration} min)`:'20 min Cardio', "go('cardio')")}
    ${chkRow(mealsDone===nutrition.meals.length, `Meals ${mealsDone}/${nutrition.meals.length}`, "go('nutrition')")}
    ${chkRow(DB.get('water-'+td,false), '3.5L Water', 'toggleWater()')}
  </div>`;

  // ── UPCOMING ──
  html+=`<div class="label mb8">Next 3 Days</div><div class="card">`;
  for(let i=1;i<=3;i++){
    const si=ts.dayIndex+i;
    if(si>=ROADMAP.length) break;
    const sl=ROADMAP[si];
    const ph=PROGRAM.phases.find(p=>p.id===sl.phase);
    const dobj=sl.entry==='rest'||sl.entry==='active'?null:ph.days.find(d=>d.id===sl.entry);
    const lbl=sl.entry==='rest'?'Rest Day':sl.entry==='active'?'Active Recovery':(dobj?dobj.name:sl.entry);
    const sub=dobj?dobj.focus:sl.entry==='rest'?'Recovery':'Walk + Abs + Stretch';
    html+=`<div class="row between" style="padding:10px 0;${i<3?'border-bottom:1px solid var(--border)':''}">
      <div><div class="small bold">${['Tomorrow','In 2 days','In 3 days'][i-1]}</div><div class="t3 xs mt4">${lbl}${sub?` · ${sub}`:''}</div></div>
      <span class="chip ${sl.entry==='rest'?'chip-gray':'chip-g'}">${sl.entry==='rest'?'REST':sl.entry==='active'?'ACTIVE':'GYM'}</span>
    </div>`;
  }
  html+=`</div>`;

  c.innerHTML=html;
}

function chkRow(done,label,onclick){
  return `<div class="row gap10" style="padding:11px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="${onclick}">
    <div class="chk${done?' on':''}">${done?`<svg viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`:''}</div>
    <span class="small${done?' t3':''}" style="${done?'text-decoration:line-through':''}">${label}</span>
    <span class="t3" style="margin-left:auto;font-size:16px">›</span>
  </div>`;
}

function toggleWater(){
  const td=today(),k='water-'+td,v=!DB.get(k,false);
  DB.set(k,v);toast(v?'Water goal logged 💧':'Unmarked');render();
}

function calcStreak(){
  let streak=0;
  const base=new Date();
  for(let i=0;i<90;i++){
    const d=new Date(base);d.setDate(base.getDate()-i);
    const ds=d.toISOString().split('T')[0];
    const info=getTodayInfo(ds);
    if(!info) break;
    if(info.isRest||info.isActive) continue;
    if(S.workoutLogs[ds]&&S.workoutLogs[ds].done) streak++;
    else if(i>0) break;
  }
  return streak;
}

// ── ONBOARD ───────────────────────────────────────────────────
function renderOnboard(c){
  c.innerHTML=`<div style="min-height:80vh;display:flex;flex-direction:column;justify-content:center;">
    <div class="center mb20">
      <div style="width:76px;height:76px;background:var(--g);border-radius:22px;margin:0 auto 18px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:38px;font-weight:900;color:#0D0D0D;font-family:var(--mono)">K</span>
      </div>
      <div style="font-size:28px;font-weight:900;letter-spacing:-.03em;margin-bottom:8px">Welcome, Ketan</div>
      <div class="t2 small" style="line-height:1.75">Set your start date once.<br/>The app handles everything from there.</div>
    </div>
    <div class="card g mb16">
      <div class="label mb10">What the app does automatically</div>
      ${['Tells you exactly what to do every day','Switches Phase 1 → 2 → 3 on schedule','Shows upcoming days so you can plan','Tracks workouts, cardio, meals, weight','26-week fixed roadmap — no decisions needed'].map(t=>`
        <div class="row gap8" style="padding:8px 0;border-bottom:1px solid var(--border)">
          <span class="g bold">→</span><span class="small t2">${t}</span>
        </div>`).join('')}
    </div>
    <div class="card mb16">
      <div class="inp-group" style="margin-bottom:0">
        <label>Your Program Start Date</label>
        <input type="date" id="startDate" value="${today()}" max="${today()}"/>
      </div>
    </div>
    <button class="btn btn-g btn-full" style="padding:16px;font-size:15px;letter-spacing:-.01em" onclick="setStart()">Start My Transformation →</button>
  </div>`;
}

function setStart(){
  const v=document.getElementById('startDate').value;
  if(!v)return;
  save('programStart',v);
  toast('Program started! 💪');render();
}

// ── WORKOUT ───────────────────────────────────────────────────
function renderWorkout(c,ts){
  if(!S.programStart||!ts){c.innerHTML=`<div class="t3 small center mt20">Set your start date on the Home tab first.</div>`;return;}
  const td=today();
  const wLog=S.workoutLogs[td]||{};

  // If rest/active day
  if(ts.isRest||ts.isActive){
    c.innerHTML=`<div class="card" style="margin-top:20px;text-align:center">
      <div style="font-size:40px;margin-bottom:12px">${ts.isRest?'😴':'🚶'}</div>
      <div style="font-size:20px;font-weight:800;margin-bottom:8px">${ts.isRest?'Rest Day':'Active Recovery'}</div>
      <div class="t2 small" style="line-height:1.7">${ts.isRest?'No workout today. Eat your meals, stay hydrated, sleep 8 hours.':'Light walk 20–30 min + ab circuit (3 rounds) + 10 min stretching. Keep it easy.'}</div>
    </div>`;
    return;
  }

  const day=ts.dayObj;
  const exDone=wLog.exercises||{};
  const doneCount=day.exercises.filter(e=>exDone[e.id]).length;
  const sessionDone=wLog.done&&wLog.dayId===day.id;

  let html=`<div style="background:var(--g);border-radius:14px;padding:14px 16px;margin-bottom:16px">
    <div style="color:#0D0D0D;font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;margin-bottom:3px">Week ${ts.weekNum} · ${ts.phase.label} · Day ${ts.dayIndex+1}</div>
    <div style="color:#0D0D0D;font-size:22px;font-weight:900;letter-spacing:-.03em;margin-bottom:2px">${day.name}</div>
    <div style="color:#0D0D0D;opacity:.7;font-size:12px">${day.focus}</div>
  </div>
  <div class="row gap6 mb16">
    <span class="chip chip-g">${doneCount}/${day.exercises.length} done</span>
    ${sessionDone?'<span class="chip chip-g">✓ Logged today</span>':''}
  </div>`;

  // Warmup
  html+=`<div class="label-o label mb8">🔥 Warm-Up (10–12 min)</div>
  <div class="card o mb16">
    ${day.warmup.map((w,i)=>`
      <div style="display:flex;align-items:flex-start;justify-content:space-between;padding:10px 0;gap:10px;${i<day.warmup.length-1?'border-bottom:1px solid var(--border)':''}">
        <div><div class="small bold">${w.name}</div><div class="t3 xs mt4">${w.cue}</div></div>
        <span class="chip chip-o" style="flex-shrink:0">${w.sets}</span>
      </div>`).join('')}
  </div>`;

  // Exercises
  html+=`<div class="label-g label mb8">💪 Main Workout</div>`;
  day.exercises.forEach((ex,i)=>{
    const done=!!exDone[ex.id];
    const open=S.expandedEx===ex.id;
    html+=`<div class="ex${done?' done':''}${open?' open':''}">
      <div class="ex-top" onclick="S.expandedEx=S.expandedEx==='${ex.id}'?null:'${ex.id}';render()">
        <div onclick="event.stopPropagation();toggleExDone('${ex.id}','${day.id}','${day.name}')" class="chk${done?' on':''}">
          ${done?`<svg viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`:''}
        </div>
        <div style="flex:1">
          <div class="small bold${done?' t3':''}" style="${done?'text-decoration:line-through':''}">${i+1}. ${ex.name}</div>
          <div class="t3 xs mt4">${ex.muscles}</div>
        </div>
        <span class="chip chip-g" style="margin-right:6px;flex-shrink:0">${ex.sets}</span>
        <span class="t3" style="font-size:18px;display:block;transform:${open?'rotate(90deg)':'none'};transition:transform .2s">›</span>
      </div>
      ${open?`<div class="ex-body">
        <div class="ex-how">${ex.how}</div>
        ${ex.cue?`<div class="ex-cue">💡 ${ex.cue}</div>`:''}
      </div>`:''}
    </div>`;
  });

  html+=`<div style="height:16px"></div>
  <button class="btn btn-full ${doneCount>0?'btn-g':'btn-ghost'}" style="padding:15px;font-size:15px" onclick="finishWorkout('${day.id}','${day.name}')">
    ${sessionDone?'✓ Workout Logged — Mark Again':'✓ Mark Workout Complete'}
  </button>
  ${sessionDone?`<div class="t3 xs center mt8">Logged ${fmt(td)}</div>`:''}
  <div style="height:20px"></div>`;

  c.innerHTML=html;
}

function toggleExDone(exId,dayId,dayName){
  const td=today();
  const wLog={...S.workoutLogs[td]||{exercises:{}}};
  wLog.exercises={...wLog.exercises||{}};
  wLog.dayId=dayId;wLog.dayName=dayName;
  wLog.exercises[exId]=!wLog.exercises[exId];
  save('workoutLogs',{...S.workoutLogs,[td]:wLog});render();
}

function finishWorkout(dayId,dayName){
  const td=today();
  const ts=getTodayInfo(td);
  const phase=ts?ts.phase:PROGRAM.phases[0];
  const day=phase.days.find(d=>d.id===dayId);
  const wLog={...S.workoutLogs[td]||{exercises:{}}};
  if(day) day.exercises.forEach(e=>{wLog.exercises=wLog.exercises||{};wLog.exercises[e.id]=true;});
  wLog.dayId=dayId;wLog.dayName=dayName;wLog.done=true;wLog.phaseId=phase.id;
  save('workoutLogs',{...S.workoutLogs,[td]:wLog});
  toast('Workout logged! 💪');render();
}

// ── CARDIO ────────────────────────────────────────────────────
function renderCardio(c,ts){
  const td=today();
  const cLog=S.cardioLogs[td]||{};
  const wk=ts?ts.weekNum:1;
  const block=getCardioBlock(wk);
  const recent=Object.entries(S.cardioLogs).filter(([,v])=>v.done).sort(([a],[b])=>b.localeCompare(a));

  let html=`<div style="font-size:20px;font-weight:800;letter-spacing:-.03em;margin-bottom:4px">Cardio</div>
  <div class="t2 small mb16">Week ${wk} · ${block.block}</div>`;

  html+=`<div class="card mb16" style="background:${block.color}12;border-color:${block.color}35">
    <div class="row between mb10">
      <div>
        <div style="color:${block.color};font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:3px">${block.block} · ${block.weeks}</div>
        <div style="font-size:17px;font-weight:700">${block.type}</div>
      </div>
      <span class="chip" style="background:${block.color}18;color:${block.color};border:1px solid ${block.color}35">${block.sessionsPerWeek}×/wk</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div style="background:var(--s3);border-radius:9px;padding:10px 12px">
        <div class="label t3 mb4">DO THIS</div>
        <div style="color:${block.color};font-size:13px;font-weight:700">${block.work}</div>
        <div class="t2 xs mt4">${block.rest}</div>
        <div class="t3 xs mt4 mono">${block.rounds}</div>
      </div>
      <div style="background:var(--s3);border-radius:9px;padding:10px 12px">
        <div class="label t3 mb4">TOTAL</div>
        <div class="small bold">${block.totalRun}</div>
        <div class="t2 xs mt4">RPE: ${block.rpe}</div>
        <div class="t3 xs mt4">Post-workout</div>
      </div>
    </div>
    <div style="background:${block.color}10;border-radius:9px;padding:10px 12px">
      <div style="color:${block.color};font-size:12px;font-weight:700;margin-bottom:4px">🎯 ${block.goal}</div>
      <div class="t2 xs" style="line-height:1.65">${block.tip}</div>
    </div>
  </div>`;

  html+=`<div class="card${cLog.done?' g':''} mb16">
    <div class="small bold mb12">${cLog.done?'✓ Logged — Update':'Log Today\'s Cardio'}</div>
    <div class="inp-group"><label>Duration (minutes)</label><input type="number" id="cDur" value="${cLog.duration||20}" min="5" max="60"/></div>
    <div class="inp-group"><label>Notes (optional)</label><input type="text" id="cNote" value="${cLog.note||''}" placeholder="How did it feel?"/></div>
    <button class="btn btn-full ${cLog.done?'btn-ghost':'btn-g'}" onclick="logCardio(${wk})">${cLog.done?'Update Log':'Log Cardio ✓'}</button>
  </div>`;

  html+=`<div class="label mb8">Recent Sessions</div>`;
  if(!recent.length) html+=`<div class="t3 small">No cardio logged yet.</div>`;
  else recent.slice(0,6).forEach(([date,log])=>{
    html+=`<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--border)">
      <div><div class="small bold">${log.duration} min${log.note?' · '+log.note:''}</div><div class="t3 xs">${fmt(date)}</div></div>
      <span class="chip chip-g">✓</span>
    </div>`;
  });
  c.innerHTML=html;
}

function getCardioBlock(wk){
  if(wk<=3)return PROGRAM.cardioBlocks[0];
  if(wk<=6)return PROGRAM.cardioBlocks[1];
  if(wk<=10)return PROGRAM.cardioBlocks[2];
  if(wk<=14)return PROGRAM.cardioBlocks[3];
  if(wk<=18)return PROGRAM.cardioBlocks[4];
  if(wk<=22)return PROGRAM.cardioBlocks[5];
  return PROGRAM.cardioBlocks[6];
}

function logCardio(wk){
  const td=today();
  const dur=parseInt(document.getElementById('cDur').value)||20;
  const note=document.getElementById('cNote').value||'';
  const block=getCardioBlock(wk||1);
  save('cardioLogs',{...S.cardioLogs,[td]:{done:true,duration:dur,note,blockId:block.id}});
  toast('Cardio logged! 🏃');render();
}

// ── NUTRITION ─────────────────────────────────────────────────
function renderNutrition(c,ts){
  const td=today();
  const mLog=S.mealLogs[td]||{};
  const ph=ts?ts.phase:PROGRAM.phases[0];
  const nutrition=PROGRAM.nutrition[ph.id]||PROGRAM.nutrition.p1;
  const done=nutrition.meals.filter(m=>mLog[m.id]).length;
  const pct=Math.round((done/nutrition.meals.length)*100);

  let html=`<div style="font-size:20px;font-weight:800;letter-spacing:-.03em;margin-bottom:16px">Today's Meals</div>`;

  html+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
    <div class="stat-box"><div class="stat-val g" style="font-size:16px">${nutrition.calories}</div><div class="stat-sub">kcal target</div></div>
    <div class="stat-box"><div class="stat-val" style="color:var(--blue);font-size:16px">${nutrition.protein}</div><div class="stat-sub">protein target</div></div>
  </div>
  <div class="card g mb16">
    <div class="row between mb8"><span class="small bold">Meals Tracked Today</span><span class="mono xs g">${done}/${nutrition.meals.length}</span></div>
    <div class="pbar"><div class="pbar-fill" style="width:${pct}%;background:var(--g)"></div></div>
  </div>
  <div class="card b mb16"><div class="small bold mb4" style="color:var(--blue)">${ph.label} Phase Note</div><div class="t2 small" style="line-height:1.6">${nutrition.note}</div></div>`;

  nutrition.meals.forEach(meal=>{
    const isDone=!!mLog[meal.id];
    html+=`<div class="meal${isDone?' done':''}">
      <div class="meal-hd">
        <div class="row gap8"><span style="font-size:18px">${meal.icon}</span><span class="meal-time${isDone?' t3':''}" style="${isDone?'text-decoration:line-through':''}">${meal.time}</span></div>
        <button onclick="toggleMeal('${meal.id}')" class="chk${isDone?' on':''}">${isDone?`<svg viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`:''}</button>
      </div>
      <div class="row between mb8"><span class="chip chip-g">${meal.protein}</span><span class="t3 xs mono">${meal.kcal}</span></div>
      <ul class="meal-items">${meal.items.map(i=>`<li>${i}</li>`).join('')}</ul>
    </div>`;
  });

  html+=`<div class="label mt20 mb8">Budget Protein Guide</div><div class="card">
    ${[
      {f:'1 Egg',p:'6g',c:'₹7–8'},
      {f:'50g Soy Chunks (dry)',p:'25g',c:'₹10–12'},
      {f:'50g Roasted Chana',p:'11g',c:'₹6–8'},
      {f:'200ml Milk',p:'7g',c:'₹12–14'},
      {f:'20g Sattu',p:'8g',c:'₹5–7'},
      {f:'30g Peanuts',p:'8g',c:'₹5–6'},
      {f:'1 katori Dal',p:'8–10g',c:'₹8–10'},
    ].map((s,i,a)=>`<div class="row between" style="padding:9px 0;${i<a.length-1?'border-bottom:1px solid var(--border)':''}">
      <div><div class="small bold">${s.f}</div><div class="t3 xs">${s.c}</div></div>
      <span class="chip chip-g">${s.p}</span>
    </div>`).join('')}
  </div>`;
  c.innerHTML=html;
}

function toggleMeal(id){
  const td=today();
  const mLog={...S.mealLogs[td]||{}};
  mLog[id]=!mLog[id];
  save('mealLogs',{...S.mealLogs,[td]:mLog});
  toast(mLog[id]?'Meal logged ✓':'Unmarked');render();
}

// ── STATS ─────────────────────────────────────────────────────
function renderStats(c){
  const stats=S.bodyStats;
  const last=stats.length?stats[stats.length-1]:null;
  const curW=last?last.weight:PROGRAM.startWeight;
  const lost=+(PROGRAM.startWeight-curW).toFixed(1);
  const toGo=+(curW-PROGRAM.targetWeight).toFixed(1);

  let html=`<div style="font-size:20px;font-weight:800;letter-spacing:-.03em;margin-bottom:16px">Body Stats</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
    <div class="stat-box"><div class="stat-val" style="font-size:16px">${curW}</div><div class="stat-sub">kg now</div></div>
    <div class="stat-box"><div class="stat-val g" style="font-size:16px">${lost>0?'▼'+lost:'-'}</div><div class="stat-sub">kg lost</div></div>
    <div class="stat-box"><div class="stat-val" style="color:var(--orange);font-size:16px">${toGo>0?toGo:'✓'}</div><div class="stat-sub">to go</div></div>
  </div>`;

  if(stats.length>=2) html+=weightChart(stats);

  html+=`<div class="card g mb16">
    <div class="small bold mb12">Log Today's Stats</div>
    <div class="inp-group"><label>Weight (kg)</label><input type="number" id="sW" step="0.1" min="50" max="120" placeholder="${curW}"/></div>
    <div class="inp-group"><label>Waist (cm) — optional</label><input type="number" id="sWaist" step="0.5" min="50" max="120" placeholder="e.g. 88"/></div>
    <div class="inp-group" style="margin-bottom:0"><label>Notes</label><input type="text" id="sNote" placeholder="How do you feel?"/></div>
    <div style="height:12px"></div>
    <button class="btn btn-g btn-full" onclick="logStat()">Save ✓</button>
  </div>`;

  html+=`<div class="label mb8">History</div><div class="card mb16">`;
  if(!stats.length) html+=`<div class="t3 small">No stats yet.</div>`;
  else [...stats].reverse().slice(0,15).forEach((s,i,arr)=>{
    const prev=arr[i+1];
    const diff=prev?+(s.weight-prev.weight).toFixed(1):null;
    html+=`<div class="row between" style="padding:10px 0;${i<arr.length-1?'border-bottom:1px solid var(--border)':''}">
      <div><div class="small bold">${s.weight} kg${s.waist?' · '+s.waist+' cm':''}</div><div class="t3 xs">${fmt(s.date)}${s.note?' · '+s.note:''}</div></div>
      ${diff!==null?`<span class="mono xs" style="color:${diff<0?'var(--g)':diff>0?'var(--red)':'var(--t3)'}">${diff>0?'+':''}${diff} kg</span>`:'<span class="t3 xs">start</span>'}
    </div>`;
  });
  html+=`</div>`;

  html+=`<div class="label mb8">Expected Timeline</div><div class="card mb16">
    ${[
      {w:'Weeks 1–3',kg:'~79 kg',n:'Water weight drops. Energy adjusts.'},
      {w:'Weeks 4–8',kg:'~77–78 kg',n:'Face leaner. Waist smaller.'},
      {w:'Weeks 9–14',kg:'~75–76 kg',n:'Abs start showing.'},
      {w:'Weeks 15–20',kg:'~73–74 kg',n:'V-taper visible. Much stronger.'},
      {w:'Weeks 21–26',kg:'~72 kg',n:'Target. Clear abs. Lean face.'},
    ].map((r,i,a)=>`<div class="row between" style="padding:10px 0;${i<a.length-1?'border-bottom:1px solid var(--border)':''}">
      <div><div class="xs mono g mb2">${r.w}</div><div class="t2 small">${r.n}</div></div>
      <span class="mono small bold">${r.kg}</span>
    </div>`).join('')}
  </div>`;

  html+=`<button class="btn btn-red btn-full" onclick="confirmReset()">Reset All Data</button><div class="t3 xs center mt8">Cannot be undone</div>`;
  c.innerHTML=html;
}

function weightChart(stats){
  const recent=stats.slice(-10);
  const weights=recent.map(s=>s.weight);
  const mn=Math.floor(Math.min(...weights,PROGRAM.targetWeight)-1);
  const mx=Math.ceil(Math.max(...weights)+1);
  const W=320,H=120,pl=30,pr=14,pt=10,pb=22;
  const iW=W-pl-pr,iH=H-pt-pb;
  const x=i=>pl+i*(iW/Math.max(1,recent.length-1));
  const y=v=>pt+(1-(v-mn)/(mx-mn))*iH;
  const pts=recent.map((s,i)=>`${x(i)},${y(s.weight)}`).join(' ');
  const tY=y(PROGRAM.targetWeight);
  return `<div class="card mb16"><div class="small bold mb8">Weight Chart</div>
    <div style="overflow-x:auto"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      ${[mn,Math.round((mn+mx)/2),mx].map(v=>`
        <line x1="${pl}" y1="${y(v)}" x2="${W-pr}" y2="${y(v)}" stroke="#2A2A2A" stroke-width="1"/>
        <text x="${pl-4}" y="${y(v)+4}" fill="#4A4A4A" font-size="9" text-anchor="end" font-family="Space Mono">${v}</text>`).join('')}
      <line x1="${pl}" y1="${tY}" x2="${W-pr}" y2="${tY}" stroke="#B8FF3C40" stroke-width="1.5" stroke-dasharray="5,3"/>
      <text x="${W-pr+2}" y="${tY+4}" fill="#B8FF3C" font-size="8" font-family="Space Mono">72</text>
      <polyline points="${pts}" fill="none" stroke="#B8FF3C" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      ${recent.map((s,i)=>`<circle cx="${x(i)}" cy="${y(s.weight)}" r="4" fill="#B8FF3C" stroke="#0D0D0D" stroke-width="2"/>`).join('')}
      ${recent.map((s,i)=>i%Math.max(1,Math.floor(recent.length/4))===0?`<text x="${x(i)}" y="${H-4}" fill="#4A4A4A" font-size="8" text-anchor="middle" font-family="Space Mono">${fmtS(s.date)}</text>`:'').join('')}
    </svg></div>
  </div>`;
}

function logStat(){
  const w=parseFloat(document.getElementById('sW').value);
  if(!w||w<40||w>200){toast('Enter a valid weight');return;}
  const waist=parseFloat(document.getElementById('sWaist').value)||null;
  const note=document.getElementById('sNote').value||'';
  const td=today();
  const stats=[...S.bodyStats];
  const ei=stats.findIndex(s=>s.date===td);
  const entry={date:td,weight:w,waist,note};
  if(ei>=0) stats[ei]=entry; else stats.push(entry);
  stats.sort((a,b)=>a.date.localeCompare(b.date));
  save('bodyStats',stats);toast('Saved ✓');render();
}

function confirmReset(){
  if(confirm('Delete ALL progress data? Cannot be undone.')){localStorage.clear();location.reload();}
}

// ── INIT ──────────────────────────────────────────────────────
render();
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
