// ── STORAGE ───────────────────────────────────────────────────
const DB = {
  get(k,def=null){try{const v=localStorage.getItem(k);return v!==null?JSON.parse(v):def;}catch(e){return def;}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
};

// ── STATE ─────────────────────────────────────────────────────
const S = {
  page: 'home',
  programStart: DB.get('programStart',null),
  workoutLogs:  DB.get('workoutLogs',{}),
  cardioLogs:   DB.get('cardioLogs',{}),
  mealLogs:     DB.get('mealLogs',{}),
  bodyStats:    DB.get('bodyStats',[]),
  expandedEx:   null,
  viewDay:      null,  // for workout tab browsing
};

function save(k,v){S[k]=v;DB.set(k,v);}

// ── HELPERS ───────────────────────────────────────────────────
function today(){return new Date().toISOString().split('T')[0];}
function daysBetween(a,b){return Math.floor((new Date(b)-new Date(a))/(86400000));}
function fmt(d){return new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'});}
function fmtS(d){return new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short'});}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.style.opacity='1';setTimeout(()=>t.style.opacity='0',2200);}
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ── PROGRAM LOGIC ─────────────────────────────────────────────
// Returns { phase, phaseDay (0-indexed within phase), programDay, weekNum, todayScheduleLabel, todayDayObj, isRest }
function getProgramStatus(dateStr) {
  if (!S.programStart) return null;
  const dayNum = daysBetween(S.programStart, dateStr); // 0-indexed
  if (dayNum < 0) return null;
  const weekNum = Math.floor(dayNum / 7) + 1;
  const dayOfWeek = dayNum % 7; // 0=Mon equiv in schedule

  // Determine phase
  let phase, phaseStartDay;
  if (weekNum <= 8)       { phase = PROGRAM.phases[0]; phaseStartDay = 0; }
  else if (weekNum <= 18) { phase = PROGRAM.phases[1]; phaseStartDay = 8*7; }
  else                    { phase = PROGRAM.phases[2]; phaseStartDay = 18*7; }

  const scheduleLabel = phase.schedule[dayOfWeek];
  const isRest = scheduleLabel.includes('Rest') || scheduleLabel.includes('Active');
  const dayObj = isRest ? null : phase.days.find(d => d.name === scheduleLabel);

  return { phase, programDay: dayNum+1, weekNum, dayOfWeek, scheduleLabel, dayObj, isRest };
}

function getTodayStatus() { return getProgramStatus(today()); }

// ── NAVIGATE ──────────────────────────────────────────────────
function go(page){
  S.page=page; S.expandedEx=null; S.viewDay=null;
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
  if(S.page==='home')      renderHome(c);
  else if(S.page==='workout')   renderWorkout(c);
  else if(S.page==='cardio')    renderCardio(c);
  else if(S.page==='nutrition') renderNutrition(c);
  else if(S.page==='stats')     renderStats(c);
  // Update header sub
  const hs=document.getElementById('header-sub');
  const ts=getTodayStatus();
  if(hs && ts) hs.textContent=`Week ${ts.weekNum} · ${ts.phase.label}`;
  else if(hs) hs.textContent='6-Month Transformation';
}

// ── HOME ──────────────────────────────────────────────────────
function renderHome(c){
  if(!S.programStart){ renderOnboard(c); return; }

  const ts = getTodayStatus();
  const td = today();
  const wLog = S.workoutLogs[td]||{};
  const cLog = S.cardioLogs[td]||{};
  const mLog = S.mealLogs[td]||{};
  const nutrition = PROGRAM.nutrition[ts.phase.id]||PROGRAM.nutrition.p1;
  const mealsDone = nutrition.meals.filter(m=>mLog[m.id]).length;
  const lastStat = S.bodyStats.length ? S.bodyStats[S.bodyStats.length-1] : null;
  const curW = lastStat ? lastStat.weight : PROGRAM.startWeight;
  const lost = +(PROGRAM.startWeight - curW).toFixed(1);
  const toGo = +(curW - PROGRAM.targetWeight).toFixed(1);
  const pct = Math.min(100,Math.max(0,Math.round((lost/(PROGRAM.startWeight-PROGRAM.targetWeight))*100)));
  const streak = calcStreak();

  // Build week calendar
  const weekDays = [];
  for(let i=0;i<7;i++){
    const d=new Date(S.programStart);
    const baseDay=Math.floor((daysBetween(S.programStart,td))/7)*7;
    d.setDate(d.getDate()+baseDay+i);
    const ds=d.toISOString().split('T')[0];
    const st=getProgramStatus(ds);
    const isDone=S.workoutLogs[ds]&&S.workoutLogs[ds].done;
    const isToday=ds===td;
    weekDays.push({ds,st,isDone,isToday,dayName:DAY_NAMES[d.getDay()]});
  }

  let html = ``;

  // TODAY CARD
  if(ts.isRest){
    html+=`<div class="card mb16" style="background:var(--s2);border-color:var(--border)">
      <div class="label mb8">TODAY · ${fmt(td)}</div>
      <div style="font-size:22px;font-weight:800;letter-spacing:-.03em;margin-bottom:4px">${ts.scheduleLabel} 😴</div>
      <div class="t2 small">Week ${ts.weekNum} · ${ts.phase.label}: ${ts.phase.title}</div>
      <div class="div"></div>
      <div class="small t2" style="line-height:1.6">Recovery is when you grow. Walk 7,000+ steps, eat your meals, sleep 8 hours.</div>
    </div>`;
  } else if(ts.dayObj){
    const wDone=wLog.done;
    html+=`<div class="today-badge mb16">
      <div class="phase-label">TODAY · Week ${ts.weekNum} · ${ts.phase.label}</div>
      <div class="day-title">${ts.dayObj.name}</div>
      <div class="day-sub">${ts.dayObj.focus} · ${ts.dayObj.exercises.length} exercises</div>
      <button class="start-btn" onclick="startTodayWorkout()">${wDone?'✓ Done — View Again':'Start Workout →'}</button>
    </div>`;
  }

  // WEEK CALENDAR
  html+=`<div class="label mb8">This Week</div>
  <div class="week-cal mb16">
    ${weekDays.map(wd=>{
      const isRest=wd.st&&(wd.st.isRest);
      const label=wd.st?(wd.isDone?'✓':(isRest?'—':wd.st.scheduleLabel.replace('Full Body ','').replace(' A','A').replace(' B','B').replace('Upper ','U').replace('Lower ','L').replace('Push ','P').replace('Pull ','Pu').replace('Legs','Leg').split(' ')[0])):'·';
      return `<div class="wc-day${wd.isToday?' active':''}${wd.isDone&&!wd.isToday?' done':''}${isRest?' rest':''}">
        <div class="wc-name">${wd.dayName}</div>
        <div class="wc-label">${label}</div>
      </div>`;
    }).join('')}
  </div>`;

  // STATS ROW
  html+=`<div class="stat-grid">
    <div class="stat-box">
      <div class="stat-val g">${curW}<span style="font-size:12px"> kg</span></div>
      <div class="stat-sub">Current Weight</div>
      ${lost>0?`<div class="small mt4" style="color:var(--g)">▼ ${lost} kg lost</div>`:''}
    </div>
    <div class="stat-box">
      <div class="stat-val" style="color:var(--orange)">${streak} 🔥</div>
      <div class="stat-sub">Day Streak</div>
      <div class="small mt4 t3">${toGo>0?toGo+' kg to go':'🎉 Target!'}</div>
    </div>
  </div>`;

  // PROGRESS BAR
  html+=`<div class="card mb16 g">
    <div class="row between mb8">
      <span class="small bold">Overall Progress</span>
      <span class="mono xs g">${pct}%</span>
    </div>
    <div class="pbar mb6"><div class="pbar-fill" style="width:${pct}%;background:var(--g)"></div></div>
    <div class="row between xs t3 mono"><span>${PROGRAM.startWeight} kg</span><span>→ ${PROGRAM.targetWeight} kg</span></div>
  </div>`;

  // TODAY CHECKLIST
  html+=`<div class="label mb8">Today's Checklist</div>
  <div class="card mb16">
    ${checkItem('workout-check', wLog.done?'Workout done':'Workout — '+((ts.dayObj&&ts.dayObj.name)||ts.scheduleLabel), wLog.done, "go('workout')")}
    ${checkItem('cardio-check', cLog.done?`Cardio done (${cLog.duration} min)`:'20 min Cardio', cLog.done, "go('cardio')")}
    ${checkItem('meal-check', `Meals ${mealsDone}/${nutrition.meals.length} tracked`, mealsDone===nutrition.meals.length, "go('nutrition')")}
    ${checkItem('water-check', 'Drink 3.5L water', DB.get('water-'+td,false), "toggleWater()")}
  </div>`;

  // PHASE INFO
  html+=`<div class="label mb8">Current Phase</div>
  <div class="card" style="background:${ts.phase.color}12;border-color:${ts.phase.color}35">
    <div class="row between mb8">
      <div>
        <div style="color:${ts.phase.color};font-family:var(--mono);font-size:10px;letter-spacing:.15em;text-transform:uppercase;margin-bottom:3px">${ts.phase.weeks}</div>
        <div style="font-size:16px;font-weight:700">${ts.phase.label}: ${ts.phase.title}</div>
      </div>
      <span class="chip" style="background:${ts.phase.color}18;color:${ts.phase.color};border:1px solid ${ts.phase.color}35">${ts.phase.tag}</span>
    </div>
    <div class="small t2" style="line-height:1.6">${ts.phase.goal}</div>
  </div>`;

  c.innerHTML=html;
}

function checkItem(id,label,done,onclick){
  return `<div class="row gap10" style="padding:11px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="${onclick}">
    <div class="chk${done?' on':''}">${done?`<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`:''}</div>
    <span class="small${done?' t3':''}" style="${done?'text-decoration:line-through':''}">${label}</span>
    <span class="t3" style="margin-left:auto">›</span>
  </div>`;
}

function toggleWater(){
  const td=today();const key='water-'+td;
  const v=!DB.get(key,false);DB.set(key,v);
  toast(v?'Water goal logged 💧':'Unmarked');render();
}

function startTodayWorkout(){
  const ts=getTodayStatus();
  if(ts&&ts.dayObj){S.viewDay=ts.dayObj.id;S.page='workout';}
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('active'));
  document.getElementById('nb-workout').classList.add('active');
  render();
}

function calcStreak(){
  let streak=0;
  const d=new Date();
  for(let i=0;i<90;i++){
    const dd=new Date(d);dd.setDate(d.getDate()-i);
    const ds=dd.toISOString().split('T')[0];
    const st=getProgramStatus(ds);
    if(!st) break;
    if(st.isRest){continue;} // rest days don't break streak
    if(S.workoutLogs[ds]&&S.workoutLogs[ds].done) streak++;
    else if(i>0) break;
  }
  return streak;
}

// ── ONBOARD ───────────────────────────────────────────────────
function renderOnboard(c){
  c.innerHTML=`<div class="onboard fade-up">
    <div class="center mb20">
      <div style="width:72px;height:72px;background:var(--g);border-radius:20px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:36px;font-weight:900;color:#0D0D0D;font-family:var(--mono)">K</span>
      </div>
      <div style="font-size:26px;font-weight:900;letter-spacing:-.03em;margin-bottom:6px">Welcome, Ketan</div>
      <div class="t2 small" style="line-height:1.7">Your 6-month transformation starts here.<br/>Set your start date to begin.</div>
    </div>
    <div class="card g mb16">
      <div class="label mb12">What this app tracks</div>
      ${['Auto-detects your phase & day each morning','Daily workout with exercise instructions','Cardio progression — beginner to 20 min run','Meal tracking with budget protein guide','Weight & waist progress over 26 weeks'].map(t=>`
        <div class="row gap8" style="padding:7px 0;border-bottom:1px solid var(--border)">
          <span class="g bold">→</span><span class="small t2">${t}</span>
        </div>`).join('')}
    </div>
    <div class="card mb16">
      <div class="inp-group" style="margin-bottom:0">
        <label>Program Start Date</label>
        <input type="date" id="startDate" value="${today()}" max="${today()}"/>
      </div>
    </div>
    <button class="btn btn-g btn-full" style="padding:16px;font-size:15px" onclick="setStart()">Begin My Transformation →</button>
  </div>`;
}

function setStart(){
  const v=document.getElementById('startDate').value;
  if(!v)return;
  save('programStart',v);
  toast('Program started! 💪');
  render();
}

// ── WORKOUT ───────────────────────────────────────────────────
function renderWorkout(c){
  const ts=getTodayStatus();
  const ph=ts?ts.phase:PROGRAM.phases[0];
  const td=today();
  const wLog=S.workoutLogs[td]||{};

  if(S.viewDay){
    // Show specific day
    const day=ph.days.find(d=>d.id===S.viewDay)||ph.days[0];
    renderDayDetail(c,day,ph,td,wLog);
    return;
  }

  // Phase overview + day list
  let html=`<div class="label mb4">${ph.label} · ${ph.weeks}</div>
  <div style="font-size:20px;font-weight:800;letter-spacing:-.03em;margin-bottom:4px">${ph.title} Phase</div>
  <div class="t2 small mb16">${ph.tag} · ${ph.goal}</div>`;

  // Today highlight
  if(ts&&!ts.isRest&&ts.dayObj){
    html+=`<div class="label-g label mb8">TODAY</div>
    <button onclick="S.viewDay='${ts.dayObj.id}';render()" class="card g mb16" style="width:100%;text-align:left;cursor:pointer;border-color:var(--gb)">
      <div class="row between">
        <div>
          <div class="label-g label mb4">Tap to start</div>
          <div style="font-size:17px;font-weight:700;margin-bottom:2px">${ts.dayObj.name}</div>
          <div class="t2 small">${ts.dayObj.focus}</div>
        </div>
        <div style="text-align:right">
          ${wLog.done&&wLog.dayId===ts.dayObj.id?'<span class="chip chip-g">✓ Done</span>':'<span class="g" style="font-size:24px">→</span>'}
        </div>
      </div>
    </button>`;
  }

  // All days
  html+=`<div class="label mb8">All Training Days</div>`;
  ph.days.forEach(day=>{
    html+=`<button onclick="S.viewDay='${day.id}';render()" class="card mb8" style="width:100%;text-align:left;cursor:pointer">
      <div class="row between">
        <div>
          <div class="label t3 mb4">${day.id}</div>
          <div style="font-size:15px;font-weight:600;margin-bottom:2px">${day.name}</div>
          <div class="t3 small">${day.focus}</div>
        </div>
        <div style="text-align:right">
          <div class="t3 xs mb4">${day.exercises.length} exercises</div>
          <span class="t3" style="font-size:18px">›</span>
        </div>
      </div>
    </button>`;
  });

  // Recent logs
  html+=`<div class="label mt20 mb8">Recent Sessions</div>`;
  const recent=Object.entries(S.workoutLogs).filter(([,v])=>v.done).sort(([a],[b])=>b.localeCompare(a)).slice(0,5);
  if(!recent.length) html+=`<div class="t3 small">No sessions yet. Do today's workout!</div>`;
  else recent.forEach(([date,log])=>{
    html+=`<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--border)">
      <div><div class="small bold">${log.dayName||log.dayId}</div><div class="t3 xs">${fmt(date)}</div></div>
      <span class="chip chip-g">✓ Done</span>
    </div>`;
  });

  c.innerHTML=html;
}

function renderDayDetail(c,day,ph,td,wLog){
  const exDone=wLog.exercises||{};
  const doneCount=day.exercises.filter(e=>exDone[e.id]).length;
  const allDone=doneCount===day.exercises.length;
  const sessionDone=wLog.done&&wLog.dayId===day.id;

  let html=`<button class="btn btn-ghost mb12" style="padding:8px 14px;font-size:12px" onclick="S.viewDay=null;render()">← Back</button>
  <div class="label-g label mb4">${ph.label}</div>
  <div style="font-size:21px;font-weight:800;letter-spacing:-.03em;margin-bottom:2px">${day.name}</div>
  <div class="t2 small mb4">${day.focus}</div>
  <div class="row gap6 mb16">
    <span class="chip chip-gray">${doneCount}/${day.exercises.length} done</span>
    ${sessionDone?'<span class="chip chip-g">✓ Logged</span>':''}
  </div>`;

  // Warmup
  html+=`<div class="label-o label mb8">🔥 Warm-Up (10–12 min)</div>
  <div class="card o mb16">
    ${day.warmup.map((w,i)=>`
      <div class="wu-row">
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
          ${done?`<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`:''}
        </div>
        <div style="flex:1">
          <div class="small bold${done?' t3':''}" style="${done?'text-decoration:line-through':''}">${i+1}. ${ex.name}</div>
          <div class="t3 xs mt4">${ex.muscles}</div>
        </div>
        <span class="chip chip-g" style="margin-right:6px;flex-shrink:0">${ex.sets}</span>
        <span class="t3" style="font-size:18px;transition:transform .2s;transform:${open?'rotate(90deg)':'none'}">›</span>
      </div>
      ${open?`<div class="ex-body">
        <div class="ex-how">${ex.how}</div>
        ${ex.cue?`<div class="ex-cue">💡 ${ex.cue}</div>`:''}
      </div>`:''}
    </div>`;
  });

  html+=`<div style="height:16px"></div>
  <button class="btn btn-full ${allDone?'btn-g':'btn-ghost'}" style="padding:15px" onclick="finishWorkout('${day.id}','${day.name}')">
    ${sessionDone?'✓ Workout Logged':'Mark Complete ✓'}
  </button>
  ${sessionDone?`<div class="t3 xs center mt8">Logged ${fmt(td)}</div>`:''}`;

  c.innerHTML=html;
}

function toggleExDone(exId,dayId,dayName){
  const td=today();
  const wLog={...S.workoutLogs[td]||{exercises:{}}};
  wLog.exercises=wLog.exercises||{};
  wLog.dayId=dayId; wLog.dayName=dayName;
  wLog.exercises[exId]=!wLog.exercises[exId];
  save('workoutLogs',{...S.workoutLogs,[td]:wLog});
  render();
}

function finishWorkout(dayId,dayName){
  const td=today();
  const ph=getTodayStatus();
  const wLog={...S.workoutLogs[td]||{exercises:{}}};
  // find day to mark all done
  const phase=ph?ph.phase:PROGRAM.phases[0];
  const day=phase.days.find(d=>d.id===dayId);
  if(day) day.exercises.forEach(e=>{wLog.exercises=wLog.exercises||{};wLog.exercises[e.id]=true;});
  wLog.dayId=dayId; wLog.dayName=dayName; wLog.done=true; wLog.phaseId=phase.id;
  save('workoutLogs',{...S.workoutLogs,[td]:wLog});
  toast('Workout logged! 💪');
  render();
}

// ── CARDIO ────────────────────────────────────────────────────
function renderCardio(c){
  const td=today();
  const cLog=S.cardioLogs[td]||{};
  const ts=getTodayStatus();
  const wk=ts?ts.weekNum:1;
  const block=getCardioBlock(wk);
  const recent=Object.entries(S.cardioLogs).filter(([,v])=>v.done).sort(([a],[b])=>b.localeCompare(a));

  let html=`<div class="label mb4">Week ${wk} · Cardio</div>
  <div style="font-size:20px;font-weight:800;letter-spacing:-.03em;margin-bottom:16px">Stamina Tracker</div>`;

  // Current block
  html+=`<div class="card mb16" style="background:${block.color}12;border-color:${block.color}35">
    <div class="row between mb8">
      <div>
        <div style="color:${block.color};font-family:var(--mono);font-size:10px;letter-spacing:.15em;text-transform:uppercase;margin-bottom:3px">${block.block} · ${block.weeks}</div>
        <div style="font-size:17px;font-weight:700">${block.type}</div>
      </div>
      <span class="chip" style="background:${block.color}18;color:${block.color};border:1px solid ${block.color}35">${block.sessionsPerWeek}×/wk</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0">
      <div style="background:var(--s3);border-radius:9px;padding:10px 12px">
        <div class="label t3 mb4">INTERVAL</div>
        <div style="color:${block.color};font-size:13px;font-weight:700">${block.work}</div>
        <div class="t2 xs mt4">${block.rest}</div>
        <div class="t3 xs mt4 mono">${block.rounds}</div>
      </div>
      <div style="background:var(--s3);border-radius:9px;padding:10px 12px">
        <div class="label t3 mb4">TOTAL</div>
        <div class="small bold">${block.totalRun}</div>
        <div class="t2 xs mt4">RPE: ${block.rpe}</div>
      </div>
    </div>
    <div style="background:${block.color}10;border-radius:9px;padding:10px 12px">
      <div style="color:${block.color};font-size:12px;font-weight:700;margin-bottom:4px">🎯 ${block.goal}</div>
      <div class="t2 xs" style="line-height:1.65">${block.tip}</div>
    </div>
  </div>`;

  // Log
  html+=`<div class="card${cLog.done?' g':''} mb16">
    <div class="small bold mb12">Log Today's Cardio</div>
    <div class="inp-group">
      <label>Duration (minutes)</label>
      <input type="number" id="cDur" value="${cLog.duration||20}" min="5" max="60"/>
    </div>
    <div class="inp-group">
      <label>Notes (optional)</label>
      <input type="text" id="cNote" value="${cLog.note||''}" placeholder="How did it feel?"/>
    </div>
    <button class="btn btn-full ${cLog.done?'btn-ghost':'btn-g'}" onclick="logCardio()">
      ${cLog.done?'✓ Logged — Update':'Log Cardio ✓'}
    </button>
  </div>`;

  // Recent
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
  if(wk<=3) return PROGRAM.cardioBlocks[0];
  if(wk<=6) return PROGRAM.cardioBlocks[1];
  if(wk<=10) return PROGRAM.cardioBlocks[2];
  if(wk<=14) return PROGRAM.cardioBlocks[3];
  if(wk<=18) return PROGRAM.cardioBlocks[4];
  if(wk<=22) return PROGRAM.cardioBlocks[5];
  return PROGRAM.cardioBlocks[6];
}

function logCardio(){
  const td=today();
  const dur=parseInt(document.getElementById('cDur').value)||20;
  const note=document.getElementById('cNote').value||'';
  const ts=getTodayStatus();
  const block=getCardioBlock(ts?ts.weekNum:1);
  save('cardioLogs',{...S.cardioLogs,[td]:{done:true,duration:dur,note,blockId:block.id}});
  toast('Cardio logged! 🏃');render();
}

// ── NUTRITION ─────────────────────────────────────────────────
function renderNutrition(c){
  const td=today();
  const mLog=S.mealLogs[td]||{};
  const ts=getTodayStatus();
  const ph=ts?ts.phase:PROGRAM.phases[0];
  const nutrition=PROGRAM.nutrition[ph.id]||PROGRAM.nutrition.p1;
  const done=nutrition.meals.filter(m=>mLog[m.id]).length;
  const pct=Math.round((done/nutrition.meals.length)*100);

  let html=`<div class="label mb4">${ph.label} · Nutrition</div>
  <div style="font-size:20px;font-weight:800;letter-spacing:-.03em;margin-bottom:16px">Today's Meals</div>`;

  // Summary
  html+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
    <div class="stat-box"><div class="stat-val g">${nutrition.calories}</div><div class="stat-sub">kcal target</div></div>
    <div class="stat-box"><div class="stat-val" style="color:var(--blue)">${nutrition.protein}</div><div class="stat-sub">protein target</div></div>
  </div>`;

  // Progress
  html+=`<div class="card g mb16">
    <div class="row between mb8"><span class="small bold">Meals Tracked</span><span class="mono xs g">${done}/${nutrition.meals.length}</span></div>
    <div class="pbar"><div class="pbar-fill" style="width:${pct}%;background:var(--g)"></div></div>
  </div>`;

  // Note
  html+=`<div class="card b mb16"><div class="small bold mb4" style="color:var(--blue)">Phase Note</div><div class="t2 small" style="line-height:1.6">${nutrition.note}</div></div>`;

  // Meals
  nutrition.meals.forEach(meal=>{
    const isDone=!!mLog[meal.id];
    html+=`<div class="meal${isDone?' done':''}">
      <div class="meal-hd">
        <div class="row gap8">
          <span style="font-size:18px">${meal.icon}</span>
          <span class="meal-time${isDone?' t3':''}" style="${isDone?'text-decoration:line-through':''}">${meal.time}</span>
        </div>
        <button onclick="toggleMeal('${meal.id}')" class="chk${isDone?' on':''}">
          ${isDone?`<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`:''}
        </button>
      </div>
      <div class="row between mb8">
        <span class="chip chip-g">${meal.protein}</span>
        <span class="t3 xs mono">${meal.kcal}</span>
      </div>
      <ul class="meal-items">${meal.items.map(i=>`<li>${i}</li>`).join('')}</ul>
    </div>`;
  });

  // Protein cheat sheet
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

  let html=`<div class="label mb4">Progress</div>
  <div style="font-size:20px;font-weight:800;letter-spacing:-.03em;margin-bottom:16px">Body Stats</div>`;

  // Stats
  html+=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
    <div class="stat-box"><div class="stat-val" style="font-size:17px">${curW}</div><div class="stat-sub">kg now</div></div>
    <div class="stat-box"><div class="stat-val g" style="font-size:17px">${lost>0?'▼'+lost:'-'}</div><div class="stat-sub">kg lost</div></div>
    <div class="stat-box"><div class="stat-val" style="color:var(--orange);font-size:17px">${toGo>0?toGo:'✓'}</div><div class="stat-sub">kg to go</div></div>
  </div>`;

  // Chart
  if(stats.length>=2) html+=weightChart(stats);

  // Log
  html+=`<div class="card g mb16">
    <div class="small bold mb12">Log Today</div>
    <div class="inp-group"><label>Weight (kg)</label><input type="number" id="sW" step="0.1" min="50" max="120" placeholder="${curW}"/></div>
    <div class="inp-group"><label>Waist (cm) — optional</label><input type="number" id="sWaist" step="0.5" min="50" max="120" placeholder="e.g. 88"/></div>
    <div class="inp-group" style="margin-bottom:0"><label>Notes</label><input type="text" id="sNote" placeholder="How do you feel?"/></div>
    <div style="height:12px"></div>
    <button class="btn btn-g btn-full" onclick="logStat()">Save Stats ✓</button>
  </div>`;

  // History
  html+=`<div class="label mb8">History</div><div class="card">`;
  if(!stats.length) html+=`<div class="t3 small">No stats yet. Log your first entry above.</div>`;
  else [...stats].reverse().slice(0,15).forEach((s,i,arr)=>{
    const prev=arr[i+1];
    const diff=prev?+(s.weight-prev.weight).toFixed(1):null;
    html+=`<div class="row between" style="padding:10px 0;${i<arr.length-1?'border-bottom:1px solid var(--border)':''}">
      <div><div class="small bold">${s.weight} kg${s.waist?' · '+s.waist+' cm':''}</div><div class="t3 xs">${fmt(s.date)}${s.note?' · '+s.note:''}</div></div>
      ${diff!==null?`<span class="mono xs" style="color:${diff<0?'var(--g)':diff>0?'var(--red)':'var(--t3)'}">${diff>0?'+':''}${diff}</span>`:'<span class="t3 xs">start</span>'}
    </div>`;
  });
  html+=`</div>`;

  // Timeline
  html+=`<div class="label mt20 mb8">Expected Timeline</div><div class="card">
    ${[
      {w:'Weeks 1–3',kg:'~79 kg',n:'Water weight + early fat loss'},
      {w:'Weeks 4–8',kg:'~77–78 kg',n:'Face gets leaner, waist smaller'},
      {w:'Weeks 8–12',kg:'~75–76 kg',n:'Abs start showing'},
      {w:'Weeks 12–17',kg:'~72–73 kg',n:'Target zone. Clear abs. V-taper.'},
    ].map((r,i,a)=>`<div class="row between" style="padding:10px 0;${i<a.length-1?'border-bottom:1px solid var(--border)':''}">
      <div><div class="xs mono g mb2">${r.w}</div><div class="t2 small">${r.n}</div></div>
      <span class="mono small bold">${r.kg}</span>
    </div>`).join('')}
  </div>`;

  // Reset
  html+=`<div class="mt20"><button class="btn btn-red btn-full" onclick="confirmReset()">Reset All Data</button><div class="t3 xs center mt8">Cannot be undone</div></div>`;

  c.innerHTML=html;
}

function weightChart(stats){
  const recent=stats.slice(-10);
  const weights=recent.map(s=>s.weight);
  const mn=Math.floor(Math.min(...weights,PROGRAM.targetWeight)-1);
  const mx=Math.ceil(Math.max(...weights)+1);
  const W=340,H=130,pl=32,pr=16,pt=12,pb=24;
  const iW=W-pl-pr,iH=H-pt-pb;
  const x=i=>pl+i*(iW/Math.max(1,recent.length-1));
  const y=v=>pt+(1-(v-mn)/(mx-mn))*iH;
  const pts=recent.map((s,i)=>`${x(i)},${y(s.weight)}`).join(' ');
  const tY=y(PROGRAM.targetWeight);
  return `<div class="card mb16">
    <div class="small bold mb8">Weight Chart</div>
    <div class="chart-scroll">
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
        ${[mn,Math.round((mn+mx)/2),mx].map(v=>`
          <line x1="${pl}" y1="${y(v)}" x2="${W-pr}" y2="${y(v)}" stroke="#2A2A2A" stroke-width="1"/>
          <text x="${pl-4}" y="${y(v)+4}" fill="#4A4A4A" font-size="9" text-anchor="end" font-family="Space Mono">${v}</text>`).join('')}
        <line x1="${pl}" y1="${tY}" x2="${W-pr}" y2="${tY}" stroke="#B8FF3C40" stroke-width="1.5" stroke-dasharray="5,3"/>
        <text x="${W-pr+2}" y="${tY+4}" fill="#B8FF3C" font-size="8" font-family="Space Mono">72</text>
        <polyline points="${pts}" fill="none" stroke="#B8FF3C" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
        ${recent.map((s,i)=>`<circle cx="${x(i)}" cy="${y(s.weight)}" r="4" fill="#B8FF3C" stroke="#0D0D0D" stroke-width="2"/>`).join('')}
        ${recent.map((s,i)=>i%Math.max(1,Math.floor(recent.length/4))===0?`<text x="${x(i)}" y="${H-4}" fill="#4A4A4A" font-size="8" text-anchor="middle" font-family="Space Mono">${fmtS(s.date)}</text>`:'').join('')}
      </svg>
    </div>
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
  save('bodyStats',stats);
  toast('Stats saved ✓');render();
}

function confirmReset(){
  if(confirm('Delete ALL progress data? Cannot be undone.')){localStorage.clear();location.reload();}
}

// ── INIT ──────────────────────────────────────────────────────
render();
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
