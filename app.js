// ── STATE & STORAGE ───────────────────────────────────────────
const DB = {
  get(k, def=null){ try{ const v=localStorage.getItem(k); return v!==null?JSON.parse(v):def; }catch(e){ return def; } },
  set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} },
};

const State = {
  page: 'home',
  phase: DB.get('phase','p1'),
  programStart: DB.get('programStart', null),
  workoutLogs: DB.get('workoutLogs', {}),     // { "2024-01-15": { phaseId, dayId, exercises:{id:true}, done:false } }
  cardioLogs: DB.get('cardioLogs', {}),        // { "2024-01-15": { blockId, duration, done:true } }
  mealLogs: DB.get('mealLogs', {}),            // { "2024-01-15": { m1:true, m2:true } }
  bodyStats: DB.get('bodyStats', []),          // [{ date, weight, waist }]
  selectedWorkoutDay: null,
  expandedEx: null,
  modal: null,
};

function save(key, val){ State[key]=val; DB.set(key,val); }

// ── HELPERS ───────────────────────────────────────────────────
function today(){ return new Date().toISOString().split('T')[0]; }
function fmt(d){ return new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'}); }
function fmtShort(d){ return new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short'}); }
function currentPhase(){ return PROGRAM.phases.find(p=>p.id===State.phase)||PROGRAM.phases[0]; }
function showToast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.style.opacity='1'; setTimeout(()=>t.style.opacity='0',2000); }

function navigate(page){
  State.page=page;
  State.selectedWorkoutDay=null;
  State.expandedEx=null;
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const nb=document.getElementById('nav-'+page);
  if(nb) nb.classList.add('active');
  render();
}

function weekNumber(){
  if(!State.programStart) return 1;
  const diff=Math.floor((new Date()-new Date(State.programStart))/(7*24*3600*1000));
  return Math.max(1, diff+1);
}

// ── RENDER ENGINE ─────────────────────────────────────────────
function render(){
  const c=document.getElementById('content');
  const hr=document.getElementById('header-right');
  c.innerHTML='';
  hr.innerHTML='';
  c.classList.add('fade-in');
  setTimeout(()=>c.classList.remove('fade-in'),300);

  if(State.page==='home')      renderHome(c,hr);
  else if(State.page==='workout')   renderWorkout(c,hr);
  else if(State.page==='cardio')    renderCardio(c,hr);
  else if(State.page==='nutrition') renderNutrition(c,hr);
  else if(State.page==='stats')     renderStats(c,hr);

  if(State.modal) renderModal();
}

// ── HOME ──────────────────────────────────────────────────────
function renderHome(c){
  const ph=currentPhase();
  const td=today();
  const wLog=State.workoutLogs[td]||{};
  const cLog=State.cardioLogs[td]||{};
  const mLog=State.mealLogs[td]||{};
  const wk=weekNumber();
  const lastStat=State.bodyStats.length?State.bodyStats[State.bodyStats.length-1]:null;
  const currentW=lastStat?lastStat.weight:PROGRAM.startWeight;
  const lost=+(PROGRAM.startWeight-currentW).toFixed(1);
  const toGo=+(currentW-PROGRAM.targetWeight).toFixed(1);
  const pct=Math.round((lost/(PROGRAM.startWeight-PROGRAM.targetWeight))*100);

  // Meals counted
  const nutrition=PROGRAM.nutrition[State.phase]||PROGRAM.nutrition.p1;
  const mealsTotal=nutrition.meals.length;
  const mealsDone=nutrition.meals.filter(m=>mLog[m.id]).length;

  // Streak
  let streak=0;
  const d=new Date();
  for(let i=0;i<60;i++){
    const dd=new Date(d); dd.setDate(d.getDate()-i);
    const ds=dd.toISOString().split('T')[0];
    if(State.workoutLogs[ds]&&State.workoutLogs[ds].done) streak++;
    else if(i>0) break;
  }

  if(!State.programStart){
    c.innerHTML=`
    <div class="card accent mb16">
      <div class="sec-eyebrow">Welcome</div>
      <div class="sec-title">Start Your Transformation</div>
      <p class="t2 small" style="line-height:1.7;margin-bottom:14px">Set your program start date to track progress across all 26 weeks.</p>
      <div class="input-group">
        <label>Program Start Date</label>
        <input type="date" id="startDate" value="${td}" max="${td}"/>
      </div>
      <button class="btn btn-primary" style="width:100%" onclick="setStart()">Begin Program →</button>
    </div>`;
    return;
  }

  c.innerHTML=`
  <!-- Phase + Week -->
  <div class="card mb12" style="background:${ph.color}12;border-color:${ph.color}35">
    <div class="row between mb8">
      <div>
        <div style="color:${ph.color};font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;margin-bottom:4px">Week ${wk} of 26</div>
        <div style="font-family:var(--display);font-size:18px;font-weight:700">${ph.label}: ${ph.title}</div>
      </div>
      <span class="chip" style="background:${ph.color}20;color:${ph.color};border:1px solid ${ph.color}35">${ph.tag}</span>
    </div>
    <div style="background:#1a1a1a;border-radius:99px;height:5px;overflow:hidden;margin-bottom:6px">
      <div style="width:${Math.min(100,Math.max(0,pct))}%;background:${ph.color};height:100%;border-radius:99px;transition:width 1s ease"></div>
    </div>
    <div class="row between">
      <span class="t3 small mono">${PROGRAM.startWeight} kg start</span>
      <span class="small" style="color:${ph.color}" class="mono">${PROGRAM.targetWeight} kg target</span>
    </div>
  </div>

  <!-- Today summary -->
  <div class="sec-eyebrow mt16">Today · ${fmt(td)}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
    ${statMini('Workout', wLog.done?'Done':'Pending', wLog.done?'green':'', ph.color)}
    ${statMini('Cardio', cLog.done?'Done':'Pending', cLog.done?'green':'')}
    ${statMini('Meals', mealsDone+'/'+mealsTotal, mealsDone===mealsTotal?'green':'')}
  </div>

  <!-- Weight + streak -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
    <div class="card" style="text-align:center">
      <div style="font-family:var(--mono);font-size:22px;font-weight:700;color:var(--accent)">${currentW} <span style="font-size:13px">kg</span></div>
      <div class="t3 small">Current Weight</div>
      <div class="small mt8" style="color:${lost>0?'var(--accent)':'var(--t2)'}">${lost>0?'▼ '+lost+' kg lost':'-'}</div>
    </div>
    <div class="card" style="text-align:center">
      <div style="font-family:var(--mono);font-size:22px;font-weight:700;color:var(--warn)">${streak}</div>
      <div class="t3 small">Day Streak 🔥</div>
      <div class="small mt8 t3">${toGo > 0 ? toGo+' kg to go':'Target reached! 🎉'}</div>
    </div>
  </div>

  <!-- Quick actions -->
  <div class="sec-eyebrow">Quick Actions</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
    <button class="btn btn-primary" onclick="navigate('workout')" style="padding:14px">💪 Log Workout</button>
    <button class="btn btn-ghost" onclick="navigate('cardio')" style="padding:14px">🏃 Log Cardio</button>
    <button class="btn btn-ghost" onclick="navigate('nutrition')" style="padding:14px">🍱 Track Meals</button>
    <button class="btn btn-ghost" onclick="navigate('stats')" style="padding:14px">📊 Log Weight</button>
  </div>

  <!-- Phase switch -->
  <div class="sec-eyebrow mt16">Change Phase</div>
  <div style="display:flex;gap:8px">
    ${PROGRAM.phases.map(p=>`
      <button onclick="switchPhase('${p.id}')" style="flex:1;background:${State.phase===p.id?p.color+'20':'var(--card)'};color:${State.phase===p.id?p.color:'var(--t2)'};border:1px solid ${State.phase===p.id?p.color+'50':'var(--border)'};border-radius:9px;padding:9px 6px;font-size:11px;font-weight:600;cursor:pointer">
        ${p.label}<br><span style="font-size:10px;opacity:.7">${p.title}</span>
      </button>`).join('')}
  </div>
  `;
}

function statMini(label,val,type,accentColor){
  const col=type==='green'?'var(--accent)':accentColor||'var(--t2)';
  return `<div class="card" style="text-align:center;padding:12px 8px">
    <div style="font-family:var(--mono);font-size:13px;font-weight:700;color:${col}">${val}</div>
    <div class="t3" style="font-size:10px;margin-top:3px">${label}</div>
  </div>`;
}

function setStart(){
  const v=document.getElementById('startDate').value;
  if(!v) return;
  save('programStart',v);
  showToast('Program started! Let\'s go 💪');
  render();
}

function switchPhase(id){
  save('phase',id);
  showToast('Switched to '+PROGRAM.phases.find(p=>p.id===id).title);
  render();
}

// ── WORKOUT ───────────────────────────────────────────────────
function renderWorkout(c){
  const ph=currentPhase();
  const td=today();

  if(!State.selectedWorkoutDay){
    // Day selector
    const wLog=State.workoutLogs[td]||{};
    c.innerHTML=`
    <div class="sec-eyebrow">${ph.label} · ${ph.weeks}</div>
    <div class="sec-title">Select Today's Session</div>
    ${ph.days.map(day=>{
      const doneToday=wLog.dayId===day.id&&wLog.done;
      return `<button onclick="selectWorkoutDay('${day.id}')" class="card mb8" style="width:100%;text-align:left;cursor:pointer;border-color:${doneToday?'var(--accent-b)':'var(--border)'}">
        <div class="row between">
          <div>
            <div style="color:${ph.color};font-family:var(--mono);font-size:10px;letter-spacing:.15em;text-transform:uppercase;margin-bottom:4px">${day.id}</div>
            <div style="font-family:var(--display);font-size:16px;font-weight:700;margin-bottom:2px">${day.name}</div>
            <div class="t3 small">${day.focus}</div>
          </div>
          <div style="text-align:right">
            ${doneToday?'<span class="chip green">✓ Done</span>':'<span class="t3 small">'+day.exercises.length+' exercises</span>'}
            <div style="color:${ph.color};font-size:20px;margin-top:6px">→</div>
          </div>
        </div>
      </button>`;
    }).join('')}

    <div class="sec-eyebrow mt20">Recent Sessions</div>
    ${recentWorkouts()}
    `;
  } else {
    // Day detail
    const day=ph.days.find(d=>d.id===State.selectedWorkoutDay);
    if(!day){ State.selectedWorkoutDay=null; render(); return; }
    const wLog=State.workoutLogs[td]||{};
    const exDone=wLog.exercises||{};
    const allDone=day.exercises.every(e=>exDone[e.id]);

    c.innerHTML=`
    <button class="btn btn-ghost mb12 small" onclick="backToDays()" style="padding:7px 14px">← Back</button>
    <div style="color:${ph.color};font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;margin-bottom:5px">${ph.label} · ${day.id}</div>
    <div style="font-family:var(--display);font-size:20px;font-weight:700;margin-bottom:4px">${day.name}</div>
    <div class="t2 small mb16">${day.focus}</div>

    <!-- Warmup -->
    <div style="color:var(--warn);font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;margin-bottom:10px">🔥 Warm-Up (10–12 min)</div>
    <div class="card warn mb16">
      ${day.warmup.map((w,i)=>`
        <div class="row between" style="padding:9px 0;${i<day.warmup.length-1?'border-bottom:1px solid var(--border)':''}">
          <div>
            <div class="small" style="font-weight:500;color:var(--t1)">${w.name}</div>
            <div class="t3 small">${w.cue}</div>
          </div>
          <span class="chip warn">${w.sets}</span>
        </div>`).join('')}
    </div>

    <!-- Exercises -->
    <div style="color:${ph.color};font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;margin-bottom:10px">💪 Main Workout</div>
    ${day.exercises.map((ex,i)=>{
      const done=!!exDone[ex.id];
      const open=State.expandedEx===ex.id;
      return `<div class="ex-card" style="${done?'border-color:var(--accent-b)':''}">
        <div class="ex-header" onclick="toggleEx('${ex.id}')">
          <div onclick="event.stopPropagation();toggleExDone('${ex.id}','${day.id}')" class="check-box${done?' done':''}">
            ${done?`<svg viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12"/></svg>`:''}
          </div>
          <div style="flex:1">
            <div class="small bold ${done?'t3':''}" style="${done?'text-decoration:line-through':''}">${i+1}. ${ex.name}</div>
            <div class="t3 small">${ex.muscles}</div>
          </div>
          <span class="chip green" style="margin-right:6px">${ex.sets}</span>
          <span style="color:${open?ph.color:'var(--t3)'};font-size:18px;transition:transform .2s;display:block;transform:${open?'rotate(90deg)':'none'}">›</span>
        </div>
        ${open?`<div class="ex-body">
          <div class="ex-how">${ex.how}</div>
          ${ex.cue?`<div class="ex-cue">💡 ${ex.cue}</div>`:''}
        </div>`:''}
      </div>`;
    }).join('')}

    <div style="height:16px"></div>
    <button class="btn ${allDone?'btn-primary':'btn-ghost'}" style="width:100%;padding:14px" onclick="finishWorkout('${day.id}')">
      ${wLog.done&&wLog.dayId===day.id?'✓ Workout Logged':'Mark Workout Complete ✓'}
    </button>
    ${wLog.done&&wLog.dayId===day.id?`<p class="t3 small" style="text-align:center;margin-top:8px">Logged ${fmt(td)}</p>`:''}
    `;
  }
}

function recentWorkouts(){
  const entries=Object.entries(State.workoutLogs)
    .filter(([,v])=>v.done)
    .sort(([a],[b])=>b.localeCompare(a))
    .slice(0,5);
  if(!entries.length) return `<p class="t3 small">No sessions logged yet. Start today!</p>`;
  return entries.map(([date,log])=>`
    <div class="row between" style="padding:9px 0;border-bottom:1px solid var(--border)">
      <div>
        <div class="small" style="font-weight:500">${log.dayName||log.dayId}</div>
        <div class="t3 small">${fmt(date)}</div>
      </div>
      <span class="chip green">✓ Done</span>
    </div>`).join('');
}

function selectWorkoutDay(id){ State.selectedWorkoutDay=id; State.expandedEx=null; render(); }
function backToDays(){ State.selectedWorkoutDay=null; render(); }
function toggleEx(id){ State.expandedEx=State.expandedEx===id?null:id; render(); }

function toggleExDone(exId, dayId){
  const td=today();
  const wLog=State.workoutLogs[td]||{exercises:{},dayId};
  wLog.exercises=wLog.exercises||{};
  wLog.dayId=dayId;
  wLog.exercises[exId]=!wLog.exercises[exId];
  const logs={...State.workoutLogs,[td]:wLog};
  save('workoutLogs',logs);
  render();
}

function finishWorkout(dayId){
  const td=today();
  const ph=currentPhase();
  const day=ph.days.find(d=>d.id===dayId);
  const wLog=State.workoutLogs[td]||{exercises:{}};
  wLog.dayId=dayId;
  wLog.dayName=day?day.name:dayId;
  wLog.phaseId=State.phase;
  wLog.done=true;
  // Mark all exercises done
  if(day) day.exercises.forEach(e=>{ wLog.exercises=wLog.exercises||{}; wLog.exercises[e.id]=true; });
  const logs={...State.workoutLogs,[td]:wLog};
  save('workoutLogs',logs);
  showToast('Workout logged! 💪');
  render();
}

// ── CARDIO ────────────────────────────────────────────────────
function renderCardio(c){
  const td=today();
  const cLog=State.cardioLogs[td]||{};
  const wk=weekNumber();
  // Find current block
  const block=getCardioBlock(wk);

  c.innerHTML=`
  <div class="sec-eyebrow">Stamina Program · Week ${wk}</div>
  <div class="sec-title">Cardio Tracker</div>

  <!-- Current block -->
  <div class="card mb16" style="background:${block.color}12;border-color:${block.color}35">
    <div class="row between mb8">
      <div>
        <div style="color:${block.color};font-family:var(--mono);font-size:10px;letter-spacing:.15em;text-transform:uppercase;margin-bottom:4px">${block.block} · ${block.weeks}</div>
        <div style="font-family:var(--display);font-size:17px;font-weight:700">${block.type}</div>
      </div>
      <span class="chip" style="background:${block.color}20;color:${block.color};border:1px solid ${block.color}35">${block.sessionsPerWeek}×/wk</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0">
      <div style="background:#111;border-radius:8px;padding:10px 12px">
        <div class="t3 small mono" style="margin-bottom:3px">INTERVAL</div>
        <div style="color:${block.color};font-size:13px;font-weight:600">${block.work}</div>
        <div class="t2 small">${block.rest}</div>
        <div class="t3 small mono">${block.rounds}</div>
      </div>
      <div style="background:#111;border-radius:8px;padding:10px 12px">
        <div class="t3 small mono" style="margin-bottom:3px">TOTAL RUN</div>
        <div style="color:var(--t1);font-size:13px;font-weight:600">${block.totalRun}</div>
        <div class="t2 small">RPE: ${block.rpe}</div>
      </div>
    </div>
    <div style="background:${block.color}10;border-radius:8px;padding:10px 12px">
      <div style="color:${block.color};font-size:12px;font-weight:600;margin-bottom:4px">🎯 ${block.goal}</div>
      <div class="t2 small" style="line-height:1.6">${block.tip}</div>
    </div>
  </div>

  <!-- Log today -->
  <div class="card mb16" style="${cLog.done?'border-color:var(--accent-b)':''}">
    <div class="small bold mb8">Log Today's Cardio</div>
    <div class="input-group">
      <label>Duration (minutes)</label>
      <input type="number" id="cardioDur" value="${cLog.duration||20}" min="5" max="60" placeholder="20"/>
    </div>
    <div class="input-group">
      <label>Notes (optional)</label>
      <input type="text" id="cardioNote" value="${cLog.note||''}" placeholder="How did it feel?"/>
    </div>
    <button class="btn ${cLog.done?'btn-ghost':'btn-primary'}" style="width:100%" onclick="logCardio()">
      ${cLog.done?'✓ Logged — Update':'Log Cardio Session ✓'}
    </button>
  </div>

  <!-- Recent sessions -->
  <div class="sec-eyebrow">Recent Sessions</div>
  ${recentCardio()}

  <!-- All blocks -->
  <div class="sec-eyebrow mt20">Full Progression Plan</div>
  ${PROGRAM.cardioBlocks.map(b=>`
    <div class="card mb8" style="border-color:${b.color}${wk>=parseInt(b.weeks.split('–')[0].replace('Weeks ',''))?'40':'20'};opacity:${wk>=parseInt(b.weeks.split('–')[0].replace('Weeks ',''))?1:.5}">
      <div class="row between">
        <div>
          <div style="color:${b.color};font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:3px">${b.block} · ${b.weeks}</div>
          <div class="small bold">${b.type}</div>
          <div class="t3 small">${b.work} / ${b.rest}</div>
        </div>
        <span class="chip" style="background:${b.color}15;color:${b.color};border:1px solid ${b.color}30">${b.sessionsPerWeek}×/wk</span>
      </div>
    </div>`).join('')}
  `;
}

function getCardioBlock(week){
  // Map week to block
  if(week<=3) return PROGRAM.cardioBlocks[0];
  if(week<=6) return PROGRAM.cardioBlocks[1];
  if(week<=10) return PROGRAM.cardioBlocks[2];
  if(week<=14) return PROGRAM.cardioBlocks[3];
  if(week<=18) return PROGRAM.cardioBlocks[4];
  if(week<=22) return PROGRAM.cardioBlocks[5];
  return PROGRAM.cardioBlocks[6];
}

function recentCardio(){
  const entries=Object.entries(State.cardioLogs)
    .filter(([,v])=>v.done)
    .sort(([a],[b])=>b.localeCompare(a))
    .slice(0,5);
  if(!entries.length) return `<p class="t3 small">No cardio logged yet. Start today!</p>`;
  return entries.map(([date,log])=>`
    <div class="row between" style="padding:9px 0;border-bottom:1px solid var(--border)">
      <div>
        <div class="small" style="font-weight:500">${log.duration} min ${log.note?'· '+log.note:''}</div>
        <div class="t3 small">${fmt(date)}</div>
      </div>
      <span class="chip green">✓ Done</span>
    </div>`).join('');
}

function logCardio(){
  const td=today();
  const dur=parseInt(document.getElementById('cardioDur').value)||20;
  const note=document.getElementById('cardioNote').value||'';
  const wk=weekNumber();
  const block=getCardioBlock(wk);
  const logs={...State.cardioLogs,[td]:{done:true,duration:dur,note,blockId:block.id}};
  save('cardioLogs',logs);
  showToast('Cardio logged! 🏃');
  render();
}

// ── NUTRITION ─────────────────────────────────────────────────
function renderNutrition(c){
  const td=today();
  const mLog=State.mealLogs[td]||{};
  const nutrition=PROGRAM.nutrition[State.phase]||PROGRAM.nutrition.p1;
  const ph=currentPhase();

  const mealsDone=nutrition.meals.filter(m=>mLog[m.id]).length;
  const pct=Math.round((mealsDone/nutrition.meals.length)*100);

  c.innerHTML=`
  <div class="sec-eyebrow">${ph.label} Nutrition</div>
  <div class="sec-title">Today's Meal Plan</div>

  <!-- Summary -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
    <div class="card" style="text-align:center">
      <div style="font-family:var(--mono);font-size:20px;font-weight:700;color:var(--accent)">${nutrition.calories}</div>
      <div class="t3 small">kcal target</div>
    </div>
    <div class="card" style="text-align:center">
      <div style="font-family:var(--mono);font-size:20px;font-weight:700;color:var(--info)">${nutrition.protein}</div>
      <div class="t3 small">protein target</div>
    </div>
  </div>

  <!-- Progress -->
  <div class="card mb16" style="${mealsDone===nutrition.meals.length?'border-color:var(--accent-b)':''}">
    <div class="row between mb8">
      <span class="small bold">Meals Tracked</span>
      <span class="mono small" style="color:var(--accent)">${mealsDone}/${nutrition.meals.length}</span>
    </div>
    <div style="background:#1a1a1a;border-radius:99px;height:5px;overflow:hidden">
      <div style="width:${pct}%;background:var(--accent);height:100%;border-radius:99px;transition:width .5s ease"></div>
    </div>
  </div>

  <!-- Note -->
  <div class="card info mb16">
    <div class="small bold" style="color:var(--info);margin-bottom:4px">Phase Note</div>
    <div class="t2 small" style="line-height:1.6">${nutrition.note}</div>
  </div>

  <!-- Meals -->
  ${nutrition.meals.map(meal=>{
    const done=!!mLog[meal.id];
    return `<div class="meal-card" style="${done?'border-color:var(--accent-b);opacity:.8':''}">
      <div class="meal-header">
        <div>
          <span style="font-size:18px;margin-right:8px">${meal.icon}</span>
          <span class="meal-time ${done?'t2':''}" style="${done?'text-decoration:line-through':''}">${meal.time}</span>
        </div>
        <div style="text-align:right">
          <button onclick="toggleMeal('${meal.id}')" class="check-box${done?' done':''}" style="margin-left:auto">
            ${done?`<svg viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12"/></svg>`:''}
          </button>
        </div>
      </div>
      <div class="row between mb8">
        <span class="chip green">${meal.protein}</span>
        <span class="t3 small mono">${meal.kcal}</span>
      </div>
      <ul class="meal-items">
        ${meal.items.map(i=>`<li>${i}</li>`).join('')}
      </ul>
    </div>`;
  }).join('')}

  <!-- Budget protein cheat sheet -->
  <div class="sec-eyebrow mt20">Budget Protein Cheat Sheet</div>
  <div class="card">
    ${[
      {f:'1 Egg',p:'6g',c:'₹7–8'},
      {f:'50g Soy Chunks (dry)',p:'25g',c:'₹10–12'},
      {f:'50g Roasted Chana',p:'11g',c:'₹6–8'},
      {f:'200ml Milk',p:'7g',c:'₹12–14'},
      {f:'20g Sattu',p:'8g',c:'₹5–7'},
      {f:'30g Peanuts',p:'8g',c:'₹5–6'},
      {f:'1 katori Dal',p:'8–10g',c:'₹8–10'},
    ].map((s,i,arr)=>`
      <div class="row between" style="padding:9px 0;${i<arr.length-1?'border-bottom:1px solid var(--border)':''}">
        <div>
          <div class="small" style="font-weight:500">${s.f}</div>
          <div class="t3 small">${s.c}</div>
        </div>
        <span class="chip green">${s.p}</span>
      </div>`).join('')}
  </div>
  `;
}

function toggleMeal(mealId){
  const td=today();
  const mLog={...State.mealLogs[td]||{}};
  mLog[mealId]=!mLog[mealId];
  const logs={...State.mealLogs,[td]:mLog};
  save('mealLogs',logs);
  if(mLog[mealId]) showToast('Meal logged ✓');
  render();
}

// ── STATS ─────────────────────────────────────────────────────
function renderStats(c){
  const stats=State.bodyStats;
  const lastStat=stats.length?stats[stats.length-1]:null;
  const currentW=lastStat?lastStat.weight:PROGRAM.startWeight;
  const lost=+(PROGRAM.startWeight-currentW).toFixed(1);
  const toGo=+(currentW-PROGRAM.targetWeight).toFixed(1);

  c.innerHTML=`
  <div class="sec-eyebrow">Progress Tracking</div>
  <div class="sec-title">Body Stats</div>

  <!-- Key stats -->
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
    <div class="card" style="text-align:center">
      <div style="font-family:var(--mono);font-size:18px;font-weight:700;color:var(--t1)">${currentW}</div>
      <div class="t3 small">Current kg</div>
    </div>
    <div class="card" style="text-align:center">
      <div style="font-family:var(--mono);font-size:18px;font-weight:700;color:var(--accent)">${lost>0?'▼'+lost:'-'}</div>
      <div class="t3 small">kg lost</div>
    </div>
    <div class="card" style="text-align:center">
      <div style="font-family:var(--mono);font-size:18px;font-weight:700;color:var(--warn)">${toGo>0?toGo:0}</div>
      <div class="t3 small">kg to go</div>
    </div>
  </div>

  <!-- Weight chart -->
  ${stats.length>=2?weightChart(stats):''}

  <!-- Log new stat -->
  <div class="card mb16" style="border-color:var(--accent-b)">
    <div class="small bold mb12">Log Today's Stats</div>
    <div class="input-group">
      <label>Weight (kg)</label>
      <input type="number" id="statWeight" step="0.1" min="50" max="120" placeholder="${currentW}" value="${lastStat?lastStat.weight:''}"/>
    </div>
    <div class="input-group">
      <label>Waist (cm) — optional</label>
      <input type="number" id="statWaist" step="0.5" min="50" max="120" placeholder="${lastStat&&lastStat.waist?lastStat.waist:'e.g. 88'}"/>
    </div>
    <div class="input-group">
      <label>Notes (optional)</label>
      <input type="text" id="statNote" placeholder="How are you feeling?"/>
    </div>
    <button class="btn btn-primary" style="width:100%" onclick="logStat()">Save Stats ✓</button>
  </div>

  <!-- History -->
  <div class="sec-eyebrow">History</div>
  <div class="card">
    ${stats.length===0?`<p class="t3 small">No stats logged yet. Log your first entry above.</p>`:
      [...stats].reverse().slice(0,15).map((s,i)=>`
        <div class="row between" style="padding:9px 0;${i<Math.min(stats.length,15)-1?'border-bottom:1px solid var(--border)':''}">
          <div>
            <div class="small" style="font-weight:500">${s.weight} kg${s.waist?' · '+s.waist+' cm waist':''}</div>
            <div class="t3 small">${fmt(s.date)}${s.note?' · '+s.note:''}</div>
          </div>
          <div style="text-align:right">
            ${getStatDelta(s,stats)}
          </div>
        </div>`).join('')}
  </div>

  <!-- Summary week by week expected -->
  <div class="sec-eyebrow mt20">Expected Timeline</div>
  <div class="card">
    ${[
      {weeks:'Weeks 1–3',weight:'~79 kg',note:'Water weight + early fat loss'},
      {weeks:'Weeks 4–8',weight:'~77–78 kg',note:'Face gets leaner, waist smaller'},
      {weeks:'Weeks 8–12',weight:'~75–76 kg',note:'Abs start showing'},
      {weeks:'Weeks 12–17',weight:'~72–73 kg',note:'Target zone. Clear abs. V-taper visible'},
    ].map((r,i,arr)=>`
      <div class="row between" style="padding:10px 0;${i<arr.length-1?'border-bottom:1px solid var(--border)':''}">
        <div>
          <div class="small mono" style="color:var(--accent);margin-bottom:2px">${r.weeks}</div>
          <div class="t2 small">${r.note}</div>
        </div>
        <span style="font-family:var(--mono);font-size:14px;font-weight:700;color:var(--t1)">${r.weight}</span>
      </div>`).join('')}
  </div>

  <!-- Danger zone: reset -->
  <div class="mt20">
    <button class="btn btn-danger small" style="width:100%;padding:11px" onclick="confirmReset()">Reset All Data</button>
    <p class="t3 small" style="text-align:center;margin-top:6px">This cannot be undone</p>
  </div>
  `;
}

function getStatDelta(stat, allStats){
  const idx=allStats.findIndex(s=>s.date===stat.date&&s.weight===stat.weight);
  if(idx<=0) return `<span class="t3 small">—</span>`;
  const prev=allStats[idx-1];
  const diff=+(stat.weight-prev.weight).toFixed(1);
  const color=diff<0?'var(--accent)':diff>0?'var(--red)':'var(--t3)';
  return `<span style="color:${color};font-family:var(--mono);font-size:12px;font-weight:600">${diff>0?'+':''}${diff} kg</span>`;
}

function weightChart(stats){
  if(stats.length<2) return '';
  const recent=stats.slice(-10);
  const weights=recent.map(s=>s.weight);
  const min=Math.floor(Math.min(...weights,PROGRAM.targetWeight)-0.5);
  const max=Math.ceil(Math.max(...weights)+0.5);
  const W=320,H=120,pad=30;
  const iW=W-pad*2,iH=H-pad;
  const x=(i)=>pad+i*(iW/(recent.length-1));
  const y=(w)=>pad+(1-(w-min)/(max-min))*iH;
  const pts=recent.map((s,i)=>`${x(i)},${y(s.weight)}`).join(' ');
  const targetY=y(PROGRAM.targetWeight);
  return `
  <div class="card mb16">
    <div class="small bold mb8">Weight History</div>
    <div class="chart-wrap">
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
        <!-- Grid -->
        ${[min,Math.round((min+max)/2),max].map(v=>`
          <line x1="${pad}" y1="${y(v)}" x2="${W-pad}" y2="${y(v)}" stroke="#242424" stroke-width="1"/>
          <text x="${pad-4}" y="${y(v)+4}" fill="#444" font-size="9" text-anchor="end">${v}</text>
        `).join('')}
        <!-- Target line -->
        <line x1="${pad}" y1="${targetY}" x2="${W-pad}" y2="${targetY}" stroke="#C8F56055" stroke-width="1" stroke-dasharray="4,3"/>
        <text x="${W-pad+2}" y="${targetY+4}" fill="#C8F560" font-size="8">72</text>
        <!-- Line -->
        <polyline points="${pts}" fill="none" stroke="#C8F560" stroke-width="2" stroke-linejoin="round"/>
        <!-- Dots -->
        ${recent.map((s,i)=>`
          <circle cx="${x(i)}" cy="${y(s.weight)}" r="3" fill="#C8F560"/>
        `).join('')}
        <!-- X labels -->
        ${recent.map((s,i)=>i%Math.ceil(recent.length/4)===0?`
          <text x="${x(i)}" y="${H-2}" fill="#444" font-size="8" text-anchor="middle">${fmtShort(s.date)}</text>
        `:'').join('')}
      </svg>
    </div>
  </div>`;
}

function logStat(){
  const w=parseFloat(document.getElementById('statWeight').value);
  const waist=parseFloat(document.getElementById('statWaist').value)||null;
  const note=document.getElementById('statNote').value||'';
  if(!w||w<40||w>200){ showToast('Enter a valid weight'); return; }
  const td=today();
  const stats=[...State.bodyStats];
  // Update today's if exists, else push
  const existing=stats.findIndex(s=>s.date===td);
  const entry={date:td,weight:w,waist,note};
  if(existing>=0) stats[existing]=entry;
  else stats.push(entry);
  stats.sort((a,b)=>a.date.localeCompare(b.date));
  save('bodyStats',stats);
  showToast('Stats saved ✓');
  render();
}

function confirmReset(){
  if(confirm('Delete ALL your progress data? This cannot be undone.')){
    localStorage.clear();
    location.reload();
  }
}

// ── INIT ──────────────────────────────────────────────────────
render();

// Service worker registration
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}
