// ── KETAN'S 6-MONTH FITNESS DATA ─────────────────────────────

const PROGRAM = {
  name: "Ketan's 6-Month Transformation",
  start: null, // set on first open
  targetWeight: 72,
  startWeight: 80.5,

  phases: [
    {
      id: "p1", label: "Phase 1", title: "Foundation",
      weeks: "Weeks 1–8", daysPerWeek: 3,
      color: "#60C8F5", tag: "Beginner · Full Body",
      goal: "Learn movement patterns, build base strength, start fat loss.",
      schedule: ["Full Body A", "Rest", "Full Body B", "Rest", "Full Body C", "Active Recovery", "Rest"],
      days: [
        {
          id: "A", name: "Full Body A", focus: "Squat + Push + Pull",
          warmup: [
            { name: "Jumping Jacks", sets: "2×30 sec", cue: "Gets heart rate up, warms entire body" },
            { name: "Arm Circles (fwd + back)", sets: "2×15 each", cue: "Shoulder mobility before pressing" },
            { name: "Bodyweight Squats", sets: "2×10", cue: "Hip and knee warm-up" },
            { name: "Cat-Cow Stretch", sets: "1×10 reps", cue: "Spinal mobility" },
            { name: "Light Lateral Raises", sets: "1×15", cue: "Activate rotator cuff" },
          ],
          exercises: [
            { id:"A1", name:"Goblet Squat", sets:"3×8–10", muscles:"Quads, Glutes", how:"Hold dumbbell at chest. Feet shoulder-width, toes slightly out. Sit back and down until thighs are parallel. Keep chest tall, knees tracking over toes. Drive through heels to stand.", cue:"Think: sit INTO the squat, not forward onto toes." },
            { id:"A2", name:"Incline DB Press", sets:"3×8–10", muscles:"Upper Chest, Front Delts", how:"Bench at 30–45°. Dumbbells at shoulder level, palms forward. Press up and slightly in. Lower slow — 2–3 sec down.", cue:"Don't flare elbows 90° out — keep them at ~60° for shoulder safety." },
            { id:"A3", name:"Lat Pulldown", sets:"3×8–10", muscles:"Lats, Biceps", how:"Grip slightly wider than shoulders. Lean back 15°. Pull bar to upper chest by driving elbows DOWN toward hip pockets. Squeeze at bottom. Slow return.", cue:"Imagine bending the bar. Elbows lead, hands just hold." },
            { id:"A4", name:"DB Romanian Deadlift", sets:"3×10–12", muscles:"Hamstrings, Glutes", how:"Stand with DBs in front of thighs. Hinge at hips, push hips back, lower DBs along legs until you feel hamstring stretch at mid-shin. Drive hips forward to stand.", cue:"Soft knee bend only. This is a hinge, not a squat." },
            { id:"A5", name:"Lateral Raises", sets:"3×12–15", muscles:"Side Delts", how:"DBs at sides, slight elbow bend. Raise arms to shoulder height — imagine pouring water from a jug. Lower in 2 sec. Keep torso still.", cue:"Go light. 10 kg lateral raise with bad form builds nothing." },
            { id:"A6", name:"Plank", sets:"3×30–45 sec", muscles:"Core", how:"Forearms on floor, body straight from head to heel. Squeeze glutes and brace abs. Don't let hips sag or pike up. Breathe.", cue:"Push the floor away with your forearms." },
          ]
        },
        {
          id: "B", name: "Full Body B", focus: "Hinge + Pull + Press",
          warmup: [
            { name: "High Knees", sets: "2×30 sec", cue: "Cardio warm-up, hip flexor activation" },
            { name: "Hip Circles", sets: "2×10 each direction", cue: "Hip joint mobility for deadlift hinge" },
            { name: "Dead Bug", sets: "2×8/side", cue: "Core activation before heavy lifts" },
            { name: "Wall Slides", sets: "2×10", cue: "Shoulder mobility for pressing" },
            { name: "Light Barbell Row (50%)", sets: "1×10", cue: "Back activation primer" },
          ],
          exercises: [
            { id:"B1", name:"Barbell / DB Row", sets:"3×8–10", muscles:"Lats, Mid Back, Biceps", how:"Hinge forward ~45°, back flat. Pull to lower ribcage — elbows back. Squeeze shoulder blades at top. Lower controlled.", cue:"Lead with your elbow, not your hand. Row your elbow to your hip pocket." },
            { id:"B2", name:"DB Shoulder Press", sets:"3×8–10", muscles:"Shoulders, Triceps", how:"Seated or standing. DBs at ear level, palms forward. Press overhead until arms nearly straight. Don't let head jut forward. Lower to ears.", cue:"Keep core braced — don't arch lower back to get the weight up." },
            { id:"B3", name:"Leg Press", sets:"3×10–12", muscles:"Quads, Glutes", how:"Feet shoulder-width at mid-plate. Lower until knees ~90°. Never lock knees at top. Push through full foot.", cue:"Don't let knees cave inward on the way up." },
            { id:"B4", name:"Seated Cable Row", sets:"3×10–12", muscles:"Mid Back, Lats", how:"Sit upright, slight lean back. Pull handle to lower abs. Squeeze back, hold 1 sec. Return with control — feel the stretch in your lats.", cue:"Don't swing. Torso stays mostly still." },
            { id:"B5", name:"Rope Pushdown", sets:"3×10–12", muscles:"Triceps", how:"Rope at face height. Elbows pinned to sides. Push rope down and slightly apart at bottom. Squeeze. Controlled return.", cue:"Don't move your elbows. They're the pivot point." },
            { id:"B6", name:"Hanging Leg Raises", sets:"3×10–12", muscles:"Lower Abs", how:"Hang from bar. Raise knees to chest (beginner) or legs straight (advanced). Lower slowly.", cue:"Exhale on the way up. Slow the descent to remove momentum." },
          ]
        },
        {
          id: "C", name: "Full Body C", focus: "Volume + Weak Points",
          warmup: [
            { name: "Jump Rope / Skipping", sets: "2 min", cue: "Full body activation" },
            { name: "World's Greatest Stretch", sets: "3/side", cue: "Hip flexor, thoracic spine, hamstring" },
            { name: "Band Pull-Aparts", sets: "2×15", cue: "Rear delt and rotator cuff activation" },
            { name: "Goblet Squat Hold", sets: "1×30 sec", cue: "Ankle and hip mobility" },
          ],
          exercises: [
            { id:"C1", name:"Pull-ups / Assisted Pull-ups", sets:"3×max (min 5)", muscles:"Lats, Biceps", how:"Wide grip, hang fully. Pull until chin over bar. Lower fully. If can't do 5, use assisted machine or negatives — jump up, lower in 5 sec.", cue:"Width comes from lat pulldown and pull-ups. This is your most important exercise." },
            { id:"C2", name:"Flat DB Press", sets:"3×10–12", muscles:"Chest, Triceps", how:"Lie flat. DBs at chest level, elbows ~60–70°. Press straight up. At top, don't touch DBs — keep tension. Lower in 2 sec.", cue:"Think 'push the bench away from you' not 'push the weight up'." },
            { id:"C3", name:"Goblet Squat", sets:"3×12", muscles:"Quads, Glutes, Core", how:"Same as Day A but slightly higher rep. Focus on depth and control this session.", cue:"This session is about building movement pattern, not max weight." },
            { id:"C4", name:"Rear Delt Fly", sets:"3×12–15", muscles:"Rear Delts, Traps", how:"Hinge forward, DBs hanging, slight elbow bend. Raise arms out to sides — like trying to touch the ceiling behind you. Hold 1 sec. Lower controlled.", cue:"This builds the 3D shoulder look and fixes posture. Don't skip it." },
            { id:"C5", name:"DB Bicep Curl", sets:"3×10–12", muscles:"Biceps", how:"Stand, DBs at sides, palms forward. Curl up without swinging. Squeeze at top. Lower fully in 2 sec. Supinate as you curl.", cue:"Full range. Top to full extension at bottom. No half reps." },
            { id:"C6", name:"Cable Crunch / Decline Sit-up", sets:"3×12–15", muscles:"Abs", how:"Cable: Kneel, rope at head. Crunch elbows to knees rounding your spine. Hold 1 sec.", cue:"Think 'pull your ribs to your hips' not 'bring your head down'." },
          ]
        }
      ]
    },
    {
      id: "p2", label: "Phase 2", title: "Development",
      weeks: "Weeks 9–18", daysPerWeek: 4,
      color: "#C8F560", tag: "Intermediate · Upper/Lower",
      goal: "Double frequency, build V-taper shape, continue fat loss.",
      schedule: ["Upper A", "Lower A", "Rest", "Upper B", "Lower B", "Active Recovery", "Rest"],
      days: [
        {
          id: "UA", name: "Upper A", focus: "Chest + Back Strength",
          warmup: [
            { name: "Band Pull-Aparts", sets: "2×20", cue: "Rear delt and rotator cuff prep" },
            { name: "Arm Circles + Shoulder Rotations", sets: "2×15 each", cue: "Joint warm-up before pressing" },
            { name: "Light Incline DB Press (50%)", sets: "1×12", cue: "Chest activation primer" },
            { name: "Light Lat Pulldown (50%)", sets: "1×12", cue: "Back activation primer" },
            { name: "Face Pulls (cable)", sets: "2×15", cue: "Rotator cuff — do this before every upper session" },
          ],
          exercises: [
            { id:"UA1", name:"Incline DB Press", sets:"4×6–10", muscles:"Upper Chest (Priority)", how:"Bench at 30–45°. Heavy sets. Increase weight when you hit 10 reps for 2 consecutive sessions.", cue:"Upper chest is your priority for V-taper. Own this exercise." },
            { id:"UA2", name:"Lat Pulldown", sets:"4×8–10", muscles:"Lats, Biceps", how:"Wide grip. Pull to upper chest. Elbows drive to hip pockets. Slow 3-sec negative.", cue:"Wide lats create your V-taper. Every rep counts." },
            { id:"UA3", name:"Flat Barbell Bench Press", sets:"3×5–8", muscles:"Chest, Triceps", how:"Grip slightly wider than shoulder. Lower to nipple line, slight elbow tuck. Press explosively. Rest 2–3 min between sets.", cue:"5–8 rep range means HEAVY. This is your strength lift." },
            { id:"UA4", name:"Barbell Row", sets:"3×6–8", muscles:"Back, Biceps", how:"Hinge ~45°, overhand grip. Pull bar to belly button. Elbows back. Lower controlled.", cue:"Match the intensity of bench press. This is your heavy back day." },
            { id:"UA5", name:"DB Shoulder Press", sets:"3×8–10", muscles:"Delts, Triceps", how:"Seated. Heavy. Press overhead without arching lower back.", cue:"Shoulder mass = wider look = V-taper." },
            { id:"UA6", name:"Lateral Raises", sets:"4×15–20", muscles:"Side Delts", how:"Light weight, high reps. Raise to shoulder height. 3-sec negative. No swinging.", cue:"High volume lateral raises build width faster than anything else." },
          ]
        },
        {
          id: "LA", name: "Lower A", focus: "Quad Dominant + Core",
          warmup: [
            { name: "Leg Swings (front/back + side)", sets: "2×15 each", cue: "Hip flexor and adductor mobility" },
            { name: "Bodyweight Squats", sets: "2×15", cue: "Knee and ankle warm-up" },
            { name: "Glute Bridge", sets: "2×15", cue: "Glute activation before squats" },
            { name: "Light Goblet Squat", sets: "1×10", cue: "Movement pattern groove" },
          ],
          exercises: [
            { id:"LA1", name:"Barbell Back Squat", sets:"4×6–10", muscles:"Quads, Glutes, Core", how:"Bar on traps. Feet shoulder-width, toes out 15–30°. Sit back and down, knees track toes. Parallel or below. Drive through heels.", cue:"Biggest muscle builder in your program. Don't skip leg day." },
            { id:"LA2", name:"Leg Press", sets:"3×10–12", muscles:"Quads, Glutes", how:"Mid-plate foot position. Full range — lower until knees ~90°. Never lock out at top.", cue:"Use this to add quad volume after squats fatigue your back." },
            { id:"LA3", name:"Leg Extension", sets:"3×12–15", muscles:"Quads (VMO)", how:"Adjust pad above ankles. Extend fully and hold 1 sec. Lower slow. Don't use momentum.", cue:"Isolation work — focus on feeling the quad, not moving weight." },
            { id:"LA4", name:"Standing Calf Raises", sets:"4×15–20", muscles:"Calves", how:"Full range — all the way up on toes, all the way down stretching the calf. 2-sec hold at top.", cue:"Calves are stubborn. Never skip, never rush reps." },
            { id:"LA5", name:"Hanging Leg Raises", sets:"3×12–15", muscles:"Lower Abs", how:"Full hang. Raise legs to 90°. Control the descent.", cue:"Abs are built in gym, revealed through diet." },
            { id:"LA6", name:"Cable Crunch", sets:"3×12–15", muscles:"Upper Abs", how:"Rope overhead. Kneel and crunch elbows to knees — ROUND your spine. Hold 1 sec squeeze.", cue:"Don't turn this into a lat pulldown. It's all spinal flexion." },
          ]
        },
        {
          id: "UB", name: "Upper B", focus: "Shoulders + Back Width",
          warmup: [
            { name: "Face Pulls", sets: "3×15", cue: "Mandatory — protects shoulders on heavy pressing" },
            { name: "Band External Rotations", sets: "2×15", cue: "Rotator cuff prep" },
            { name: "Light Lateral Raises", sets: "2×20", cue: "Delt activation" },
            { name: "Light Pull-ups or Pulldown", sets: "1×8", cue: "Back activation" },
          ],
          exercises: [
            { id:"UB1", name:"Overhead Press (BB or DB)", sets:"4×6–8", muscles:"Front + Side Delts, Triceps", how:"Standing or seated. Bar starts at upper chest. Press overhead in a slight arc. Lock out at top. Lower to chin.", cue:"Heaviest shoulder movement. Build this strength and your shoulders will grow." },
            { id:"UB2", name:"Pull-ups", sets:"4×max", muscles:"Lats, Biceps", how:"Full hang to chin over bar. Wide grip. If >10 reps add weight. If <5 use assisted or do negatives.", cue:"The single best exercise for V-taper width. Non-negotiable." },
            { id:"UB3", name:"Arnold Press", sets:"3×10–12", muscles:"All 3 Delt Heads", how:"Start with DBs at face level, palms facing you. As you press, rotate palms forward. Reverse on way down.", cue:"Hits front, side, and rear delt in one movement. Great for 3D shoulder look." },
            { id:"UB4", name:"Straight-arm Pulldown", sets:"3×12–15", muscles:"Lats", how:"Stand at cable, straight bar, arms straight. Pull bar down to thighs in an arc — elbows LOCKED straight. Squeeze lats at bottom.", cue:"Pure lat isolation. Amazing for building the lat flare that creates V-taper." },
            { id:"UB5", name:"Lateral Raises", sets:"5×20", muscles:"Side Delts", how:"Light weight. 5 sets. 3-sec negative on every rep.", cue:"5 sets × 20 reps twice a week = the shoulder width formula." },
            { id:"UB6", name:"Rear Delt Fly", sets:"3×15", muscles:"Rear Delts", how:"Seated hinge or cable. Raise arms back and out. Hold 1 sec.", cue:"Most people ignore rear delts. Don't be most people." },
          ]
        },
        {
          id: "LB", name: "Lower B", focus: "Hamstrings + Glutes + Core",
          warmup: [
            { name: "Hip Circles", sets: "2×10 each direction", cue: "Hip joint prep for hinges" },
            { name: "Glute Bridge", sets: "2×15", cue: "Glute activation" },
            { name: "Light Leg Curl", sets: "1×10", cue: "Hamstring warm-up" },
            { name: "Dead Bug", sets: "2×8/side", cue: "Core activation" },
          ],
          exercises: [
            { id:"LB1", name:"Romanian Deadlift", sets:"4×6–10", muscles:"Hamstrings, Glutes", how:"Stand tall. Hinge at hips, push hips back, lower weight along legs. Feel hamstring stretch at bottom. Drive hips forward explosively to stand.", cue:"The hip hinge is the most important movement pattern. Master this." },
            { id:"LB2", name:"Lying Leg Curl", sets:"3×10–12", muscles:"Hamstrings", how:"Lie face down. Curl heels toward glutes. Hold 1 sec at top. Lower in 3 sec. Don't let hips rise.", cue:"Slow negative = double the muscle damage = more growth." },
            { id:"LB3", name:"Seated Leg Curl", sets:"3×12–15", muscles:"Hamstrings (lower)", how:"Adjust so pad is above ankle. Full range. Hits different part of hamstring than lying curl.", cue:"Hamstrings need both exercises. One isn't enough." },
            { id:"LB4", name:"Walking Lunges", sets:"3×12/leg", muscles:"Quads, Glutes, Balance", how:"Step forward, lower back knee toward floor. Keep torso upright. Push off front foot to step through.", cue:"These also condition your cardiovascular system — embrace the burn." },
            { id:"LB5", name:"Standing Calf Raises", sets:"3×15–20", muscles:"Calves", how:"Same as Lower A. Full range, full hold at top.", cue:"" },
            { id:"LB6", name:"Plank + Side Plank", sets:"3×45 sec + 30 sec each side", muscles:"Core, Obliques", how:"Plank: elbows under shoulders, straight line. Side plank: stack feet or stagger, raise hips.", cue:"Side plank builds obliques — important for that narrow waist look." },
          ]
        }
      ]
    },
    {
      id: "p3", label: "Phase 3", title: "Aesthetic Cut",
      weeks: "Weeks 19–26", daysPerWeek: 5,
      color: "#F5A623", tag: "Advanced · PPL Split",
      goal: "Max aesthetic development. Visible abs, lean V-taper, target 72 kg.",
      schedule: ["Push A", "Pull A", "Legs", "Push B", "Pull B", "Active Recovery", "Rest"],
      days: [
        {
          id: "P1", name: "Push A", focus: "Chest + Shoulder Strength",
          warmup: [
            { name: "Face Pulls", sets: "3×15", cue: "Mandatory shoulder protection" },
            { name: "Band Pull-Aparts", sets: "2×20", cue: "Rear delt activation" },
            { name: "Light Incline Press (50%)", sets: "1×12", cue: "Chest primer" },
            { name: "Arm Circles + Shoulder Rotations", sets: "2×15", cue: "Joint prep" },
          ],
          exercises: [
            { id:"P11", name:"Incline DB Press", sets:"4×6–10", muscles:"Upper Chest (Priority)", how:"Heavy. This is your signature chest exercise for aesthetic upper chest. Drive through the whole palm.", cue:"Upper chest = shirt fills out at the top = premium look." },
            { id:"P12", name:"Flat Bench Press", sets:"4×5–8", muscles:"Chest, Triceps", how:"Heavy compound. Lower to nipple line. Drive through heels into floor. Use leg drive for stability.", cue:"Heaviest pushing day. Aim to beat last week's weight or reps." },
            { id:"P13", name:"Cable Fly", sets:"3×12–15", muscles:"Chest (Stretch)", how:"Cables set high. Slight forward lean. Bring handles together in an arc — like hugging a tree. Feel stretch at full extension.", cue:"Cables maintain tension throughout — better chest development than DBs alone." },
            { id:"P14", name:"Seated DB Shoulder Press", sets:"3×8–10", muscles:"Delts, Triceps", how:"Seated for stability. Press overhead, don't arch. Control descent.", cue:"" },
            { id:"P15", name:"Lateral Raises", sets:"5×15–20", muscles:"Side Delts", how:"5 sets every push day. Light, controlled, high volume.", cue:"Consistency with lateral raises = shoulder width in 12 weeks." },
            { id:"P16", name:"Rope Pushdown", sets:"3×10–12", muscles:"Triceps", how:"Elbows pinned. Push rope apart at bottom. Full extension.", cue:"" },
            { id:"P17", name:"Overhead Tricep Extension", sets:"3×10–12", muscles:"Triceps (Long Head)", how:"Rope or DB overhead. Keep elbows pointing forward. Lower behind head, extend fully.", cue:"Long head makes up 2/3 of tricep size. Train it overhead." },
          ]
        },
        {
          id: "Pu1", name: "Pull A", focus: "Back + Biceps Strength",
          warmup: [
            { name: "Dead Hang", sets: "2×30 sec", cue: "Shoulder decompression + grip prep" },
            { name: "Scapular Pull-ups", sets: "2×10", cue: "Lat activation before pulling" },
            { name: "Face Pulls", sets: "2×15", cue: "Rear delt activation" },
            { name: "Light Bicep Curl", sets: "1×15", cue: "Elbow joint warm-up" },
          ],
          exercises: [
            { id:"Pu11", name:"Pull-ups", sets:"4×max", muscles:"Lats, Biceps", how:"Add weight if doing >10 reps. Full ROM. Slow negative.", cue:"V-taper king. Never skip." },
            { id:"Pu12", name:"Barbell Row", sets:"4×6–8", muscles:"Mid Back, Lats", how:"Heavy. Pull to belly button. Control descent. Builds back thickness.", cue:"Heavy rows = thick back = impressive physique." },
            { id:"Pu13", name:"Seated Cable Row", sets:"3×10–12", muscles:"Mid Back", how:"Upright torso. Pull to lower abs. Squeeze for 1 sec. Return fully.", cue:"" },
            { id:"Pu14", name:"Rear Delt Fly", sets:"3×12–15", muscles:"Rear Delts", how:"Cable or DB. Full ROM. Slow negative.", cue:"Rear delts complete the 3D shoulder. Train every pull day." },
            { id:"Pu15", name:"DB Curl", sets:"3×8–12", muscles:"Biceps", how:"Alternate arms. Supinate fully. Full extension at bottom.", cue:"" },
            { id:"Pu16", name:"Hammer Curl", sets:"3×10–12", muscles:"Brachialis, Forearms", how:"Neutral grip. Builds arm thickness and forearm.", cue:"" },
          ]
        },
        {
          id: "Le", name: "Legs", focus: "Quad + Ham + Calves + Abs",
          warmup: [
            { name: "Leg Swings", sets: "2×15 each", cue: "Hip mobility" },
            { name: "Bodyweight Squats", sets: "2×20", cue: "Knee and ankle warm-up" },
            { name: "Glute Bridge", sets: "2×15", cue: "Glute activation" },
            { name: "Light Goblet Squat", sets: "1×8", cue: "Movement groove" },
          ],
          exercises: [
            { id:"Le1", name:"Barbell Squat", sets:"4×6–10", muscles:"Quads, Glutes", how:"Heaviest lower body compound. Treat this like bench press for legs.", cue:"" },
            { id:"Le2", name:"Leg Press", sets:"3×10–12", muscles:"Quads", how:"After squats. More volume, lighter relative.", cue:"" },
            { id:"Le3", name:"Leg Extension", sets:"3×12–15", muscles:"Quads", how:"Isolation. Hold at top. Slow negative.", cue:"" },
            { id:"Le4", name:"RDL", sets:"3×8–10", muscles:"Hamstrings, Glutes", how:"Hip hinge. Feel stretch. Drive hips forward.", cue:"" },
            { id:"Le5", name:"Lying Leg Curl", sets:"3×10–12", muscles:"Hamstrings", how:"Full ROM. 3-sec negative.", cue:"" },
            { id:"Le6", name:"Standing Calf Raises", sets:"4×15–20", muscles:"Calves", how:"Full ROM. Hold at top.", cue:"" },
            { id:"Le7", name:"Hanging Leg Raises + Cable Crunch", sets:"3×12 each", muscles:"Abs", how:"Superset back to back for efficiency.", cue:"" },
          ]
        },
        {
          id: "P2", name: "Push B", focus: "Shoulder Dominant",
          warmup: [
            { name: "Face Pulls", sets: "3×20", cue: "Critical on shoulder-heavy day" },
            { name: "Band Lateral Raises", sets: "2×20", cue: "Pre-exhaust side delts" },
            { name: "Light OHP (50%)", sets: "1×10", cue: "Groove the pattern" },
          ],
          exercises: [
            { id:"P21", name:"Overhead Press", sets:"5×6–8", muscles:"Delts (Main Mover)", how:"Standing for more muscle activation. Heavy. Main mass builder for shoulders.", cue:"Shoulder press is to shoulders what squat is to legs. Own it." },
            { id:"P22", name:"Arnold Press", sets:"3×10–12", muscles:"All Delt Heads", how:"Full rotation on the way up and down. Controlled tempo.", cue:"" },
            { id:"P23", name:"Cable Lateral Raises", sets:"5×20", muscles:"Side Delts", how:"Stand side-on to cable, pull across body. Constant tension at bottom unlike DBs.", cue:"Cable lateral = constant tension = more delt work per rep." },
            { id:"P24", name:"Incline DB Press", sets:"3×10–12", muscles:"Upper Chest", how:"Moderate weight. Upper chest reinforcement.", cue:"" },
            { id:"P25", name:"Rope Pushdown", sets:"4×12–15", muscles:"Triceps", how:"High rep, pump focus this session.", cue:"" },
            { id:"P26", name:"Overhead Extension", sets:"3×10–12", muscles:"Triceps Long Head", how:"Full stretch at bottom.", cue:"" },
          ]
        },
        {
          id: "Pu2", name: "Pull B", focus: "Back Width + Lat Flare",
          warmup: [
            { name: "Dead Hang", sets: "2×30 sec", cue: "Decompress spine, lat stretch" },
            { name: "Scapular Pull-ups", sets: "2×10", cue: "Lat activation" },
            { name: "Light Straight-arm Pulldown", sets: "1×15", cue: "Lat isolation primer" },
          ],
          exercises: [
            { id:"Pu21", name:"Wide-grip Pull-ups", sets:"5×max", muscles:"Lats (Width)", how:"Widest comfortable grip. Full ROM. These build the flare that creates V-taper from behind.", cue:"5 sets of pull-ups = non-negotiable for your physique goals." },
            { id:"Pu22", name:"Straight-arm Pulldown", sets:"4×12", muscles:"Lats (Isolation)", how:"Arms stay straight throughout. Pure lat contraction. Feel the stretch at top.", cue:"Best exercise for making lats flare when you spread them." },
            { id:"Pu23", name:"Single-arm DB Row", sets:"4×10/side", muscles:"Lats, Mid Back", how:"Knee on bench. Let the DB hang at full stretch. Row to hip. Full contraction.", cue:"Lean forward to stretch the lat. Row back to contract it fully." },
            { id:"Pu24", name:"Chest-supported Row", sets:"3×10–12", muscles:"Mid Back", how:"Chest on incline bench. Removes lower back fatigue.", cue:"" },
            { id:"Pu25", name:"EZ Bar Curl", sets:"3×8–10", muscles:"Biceps", how:"EZ bar reduces wrist stress. Heavy curls.", cue:"" },
            { id:"Pu26", name:"Incline DB Curl", sets:"3×10–12", muscles:"Biceps (Long Head)", how:"Seated on incline bench. Arms hang behind body — pre-stretches bicep. Curl up.", cue:"Best exercise for bicep peak." },
          ]
        }
      ]
    }
  ],

  cardioBlocks: [
    { id:"c1", block:"Block 1", weeks:"Weeks 1–3", phase:"Phase 1", color:"#60C8F5", type:"Walk/Jog Intervals", timing:"Post-workout · 7:30–7:50 AM", totalRun:"~7 min running out of 20", rpe:"Easy", sessionsPerWeek:3, work:"Jog 1 min", rest:"Walk 2 min", rounds:"6–7 rounds", goal:"Build the habit. Let your body adapt to running.", tip:"Don't worry about pace. Just jog — even if it's barely faster than walking." },
    { id:"c2", block:"Block 2", weeks:"Weeks 4–6", phase:"Phase 1", color:"#60C8F5", type:"Extended Jog Intervals", timing:"Post-workout · 7:30–7:50 AM", totalRun:"~10 min running out of 20", rpe:"Comfortable", sessionsPerWeek:3, work:"Jog 2 min", rest:"Walk 90 sec", rounds:"6 rounds", goal:"Increase aerobic exposure. Heart and lungs adapting.", tip:"If a round feels too easy, push pace slightly — don't skip ahead." },
    { id:"c3", block:"Block 3", weeks:"Weeks 7–10", phase:"Phase 1–2", color:"#9B8FF5", type:"Run-dominant Intervals", timing:"Post-workout · 7:30–7:50 AM", totalRun:"~14 min running out of 20", rpe:"Moderate", sessionsPerWeek:3, work:"Jog 3 min", rest:"Walk 1 min", rounds:"5 rounds", goal:"Build base aerobic fitness. Breathing becomes more efficient.", tip:"You'll notice by end of week 10 that 3 min feels manageable. That's the adaptation working." },
    { id:"c4", block:"Block 4", weeks:"Weeks 11–14", phase:"Phase 2", color:"#C8F560", type:"Continuous Run", timing:"Post-workout · 7:30–7:50 AM", totalRun:"20 min non-stop", rpe:"Moderate", sessionsPerWeek:3, work:"Run 20 min non-stop", rest:"No walk breaks", rounds:"1 continuous effort", goal:"First milestone: run 20 minutes without stopping.", tip:"Start slow. Seriously — slower than you think. If you must stop, walk 1 min then resume — don't quit." },
    { id:"c5", block:"Block 5", weeks:"Weeks 15–18", phase:"Phase 2", color:"#C8F560", type:"Tempo + Distance Build", timing:"Post-workout · 7:30–7:50 AM", totalRun:"20–25 min", rpe:"Comfortably hard", sessionsPerWeek:3, work:"Run 20–25 min at steady pace", rest:"None", rounds:"Add 1 min per week", goal:"Build aerobic base. Comfortable 20+ min runs.", tip:"Try to run the second 10 min at the same speed as the first — this is even splits and builds real endurance." },
    { id:"c6", block:"Block 6", weeks:"Weeks 19–22", phase:"Phase 3", color:"#F5A623", type:"HIIT Sprints", timing:"Post-workout · 7:30–7:50 AM", totalRun:"20 min total (high intensity)", rpe:"Hard", sessionsPerWeek:2, work:"Sprint 30 sec", rest:"Walk 60 sec", rounds:"13–14 rounds", goal:"Max calorie burn for final cut. Shreds last fat layer.", tip:"Sprint means 80–90% effort. Add 1 steady-state 20 min run on a 3rd cardio day to maintain your base." },
    { id:"c7", block:"Block 7", weeks:"Weeks 23–26", phase:"Phase 3", color:"#F5A623", type:"HIIT + Longer Runs", timing:"Post-workout · 7:30–7:50 AM", totalRun:"20–30 min", rpe:"Mixed", sessionsPerWeek:3, work:"2× HIIT + 1× 25–30 min steady run", rest:"Alternating days", rounds:"Per week", goal:"Peak fitness. Strong stamina, lean physique, visible abs.", tip:"By week 26 you'll be able to run 25–30 min comfortably. Your lungs, heart, and legs will feel completely different." },
  ],

  nutrition: {
    p1: {
      calories:"1,950–2,050", protein:"110–120g",
      note:"Moderate deficit. Focus on eating consistently. Don't be perfect, be consistent.",
      meals:[
        { id:"m1", time:"5:30 AM · Pre-Workout", icon:"🌅", items:["2 boiled eggs (12g protein)","1 banana OR 1 roti + light sabzi","200ml water"], kcal:"~230–270", protein:"~14g" },
        { id:"m2", time:"8:00 AM · Post-Workout", icon:"🍳", items:["3 eggs any style (18g protein)","1 glass milk 200ml (7g protein)","Poha 150g cooked OR 2 roti + sabzi"], kcal:"~420–480", protein:"~30g" },
        { id:"m3", time:"12:30 PM · Lunch", icon:"🍱", items:["2 roti","2 ladles dal (16g protein)","1 katori sabzi","Curd 100g if available (4g protein)"], kcal:"~450–520", protein:"~22g" },
        { id:"m4", time:"4:30 PM · Snack", icon:"🫘", items:["50g roasted chana (11g protein)","1 glass buttermilk no sugar (3g protein)"], kcal:"~200–230", protein:"~14g" },
        { id:"m5", time:"8:30 PM · Dinner", icon:"🌙", items:["2 roti","50g soy chunks dry cooked (25g protein)","1 katori dal (8g protein)","1–2 eggs if protein short"], kcal:"~480–530", protein:"~35g" },
      ]
    },
    p2: {
      calories:"1,900–2,000", protein:"120–130g",
      note:"Slightly tighter deficit as training volume increases. Prioritise post-workout protein window.",
      meals:[
        { id:"m1", time:"5:30 AM · Pre-Workout", icon:"🌅", items:["2 boiled eggs","1 banana","Black coffee no sugar (optional — fat burning boost)"], kcal:"~200–240", protein:"~13g" },
        { id:"m2", time:"8:00 AM · Post-Workout", icon:"🍳", items:["3 eggs (18g)","1 glass milk 200ml (7g)","2 roti + sabzi OR upma 200g","20g sattu mixed in water (8g) — if available"], kcal:"~450–520", protein:"~34–40g" },
        { id:"m3", time:"12:30 PM · Lunch", icon:"🍱", items:["2 roti","2 ladles dal (16g)","Sabzi","Soy chunks curry 3× per week instead of sabzi (25g)"], kcal:"~440–500", protein:"~20–28g" },
        { id:"m4", time:"4:00 PM · Snack", icon:"🫘", items:["50g roasted chana (11g)","30g peanuts (8g)","OR 1 glass milk + banana"], kcal:"~230–280", protein:"~19g" },
        { id:"m5", time:"8:30 PM · Dinner", icon:"🌙", items:["2 roti","Dal 2 ladles (16g)","Sabzi","2 eggs if day's protein is below 110g"], kcal:"~420–480", protein:"~22–34g" },
      ]
    },
    p3: {
      calories:"1,800–1,950", protein:"130–140g",
      note:"Final cut phase. Tighter deficit. Carbs concentrated around workout. High protein is critical.",
      meals:[
        { id:"m1", time:"5:30 AM · Pre-Workout", icon:"🌅", items:["2 boiled eggs","Black coffee no sugar","Skip carbs if not hungry — fasted training at this stage is fine"], kcal:"~150–180", protein:"~12g" },
        { id:"m2", time:"8:00 AM · Post-Workout", icon:"🍳", items:["4 eggs (24g)","1 glass milk (7g)","2 roti + sabzi (higher carb meal — needed post-workout)","20g sattu if available (8g)"], kcal:"~480–550", protein:"~40–45g" },
        { id:"m3", time:"12:30 PM · Lunch", icon:"🍱", items:["2 roti (reduce to 1.5 if fat loss stalls)","Soy chunks curry 50g dry (25g)","Dal 1 ladle (8g)","Salad (cucumber, tomato — unlimited)"], kcal:"~420–480", protein:"~33g" },
        { id:"m4", time:"4:00 PM · Snack", icon:"🫘", items:["50g roasted chana (11g)","1 glass buttermilk (3g)","Green tea optional"], kcal:"~190–220", protein:"~14g" },
        { id:"m5", time:"8:00 PM · Dinner", icon:"🌙", items:["1.5–2 roti","Dal 2 ladles (16g)","Sabzi (low-calorie)","2–3 eggs (12–18g)","Avoid rice at dinner in Phase 3"], kcal:"~380–450", protein:"~30–36g" },
      ]
    }
  }
};
