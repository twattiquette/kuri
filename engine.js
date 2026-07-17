let spent = 0;
let retired = false;
let current = null;
let history = [];
let completedCount = 0;
let cleanStreak = 0;
let regenFired = false;
let skippedCount = 0;
let skippedStack = [];
let guardianSaves = 0;
let guardianStreakResets = 0;
let answersChanged = 0;
let usedLegends = {};
let awaitingSkipReturn = false;
let usedArchetypes = {};
let shownEggs = {};
let pendingEgg = null;
let coverAnchorReturn = null;
let coverAnchored = false;
let trainingComplete = false;
let allMissionsCleared = false;
let bypassTierGate = false;
let recentScenarios = [];
let lastCoverId = null;
let lastMode = null;
const REPEAT_WINDOW = 3;
let runStartedAt = null;
let runTimerStarted = false;

function elapsedMs() {
  if (runStartedAt == null) return 0;
  return Date.now() - runStartedAt;
}

const POOL_SIZE = 9;
const REGEN_STREAK_LENGTH = 3;
const REGEN_LIVES = 1;
const RUN_MISSION_CAP = 23;
const HINTS_ENABLED = false;
const HINTS_PER_RUN = 2;
let hintsLeft = HINTS_PER_RUN;

function facetGraded(scenario) {
  return scenario.level === "Hard";
}

const SPINE_WEIGHT_SINGLE_FACET = 0.7;
const FACET_WEIGHT_SINGLE_FACET = 0.3;
const SPINE_WEIGHT_TWO_FACET = 0.6;
const FACET_WEIGHT_TWO_FACET = 0.2;

function weightFor(scenario, rowId, legend) {
  if (scenario.mode === "full5") return 1;
  if (legend.facetIds.length === 1) return SPINE_WEIGHT_SINGLE_FACET;
  return SPINE_WEIGHT_TWO_FACET;
}

const FACET_DRIFT = { clean: 1.0, hairline: 0.3, crack: 0 };

const MEDIUM_SLIVER = 0.25;
const HARD_SLIVER = 0.375;

function missionMaxExposure(scenario, legend) {
  let max = 0;
  scenario.options.forEach((_, idx) => {
    const e = computeRows(scenario, legend, idx).reduce((a, r) => a + r.exposure, 0);
    if (e > max) max = e;
  });
  return max;
}

function ratioCost(rawExposure, maxExposure, remaining, sliver) {
  if (maxExposure <= 0 || remaining <= 0) return 0;
  const frac = (rawExposure / maxExposure) * sliver;
  return Math.min(remaining, Math.max(1, Math.round(remaining * frac)));
}

const TIER_LABEL = { clean: "cover held", hairline: "hairline tell", crack: "cover cracked" };
const WHO_TIER_LABEL = { clean: "no drift", hairline: "hairline drift", crack: "cover cracked" };
const FACET_TIER_LABEL = { clean: "cover drifted", hairline: "hairline drift", crack: "no drift" };
const FACET_TIER_SWAP = { clean: "crack", hairline: "hairline", crack: "clean" };

function tierLine(tier, name) {
  if (tier === "clean") return `That's exactly what ${name} would do; anyone watching saw the cat they expected. No tell given.`;
  if (tier === "hairline") return `${name} might do that, but it takes explaining, and a sharp watcher files it away. A small leak in the cover, and it costs you.`;
  return `${name} would never do that; anyone watching just clocked a different cat under the fur. A clear tell, and it costs you dearly.`;
}

function facetDriftLine(tier, name) {
  if (tier === "clean") return `You played ${name} louder than the cover carrying it. The trait pulled and you followed it; a watcher clocks the drift, and it costs you.`;
  if (tier === "hairline") return `${name} tugs at that one, and it shows, just a little. A watcher might miss it; the Handler doesn't.`;
  return `${name} pulled at that one, and you left it alone. The trait stayed where it belongs, under the cover. No drift.`;
}

function poolStatusLine() {
  const remaining = POOL_SIZE - spent;
  if (regenFired) {
    regenFired = false;
    const hearts = `<span class="regen-streak" title="${REGEN_STREAK_LENGTH} clean missions in a row regains a life. changing an answer via guardian breaks the streak">${"💗".repeat(REGEN_STREAK_LENGTH)}</span>`;
    return `<span class="regen-fired">🐾 Three covers held in a row. A life is restored.</span> ${hearts}`;
  }
  const parts = [];
  if (remaining <= 4) parts.push(`🐾 The Handler's tail lashes: “Nine lives, ${computeRank()}!”`);
  if (toggleOn("regen")) {
    const atFull = spent === 0;
    let hearts = "";
    for (let i = 0; i < REGEN_STREAK_LENGTH; i++) {
      hearts += !atFull && i < cleanStreak ? "💗" : `<span class="regen-heart-empty">💗</span>`;
    }
    const tip = `${REGEN_STREAK_LENGTH} clean missions in a row regains a life. changing an answer via guardian breaks the streak` +
      (atFull ? ". inactive while at full lives" : "");
    parts.push(`<span class="regen-streak${atFull ? " regen-streak-inactive" : ""}" title="${tip}">${hearts}</span>`);
  }
  return parts.join(" ");
}

function registerCleanStreak(clean) {
  if (!clean) { cleanStreak = 0; return false; }
  cleanStreak++;
  if (!toggleOn("regen")) return false;
  if (cleanStreak < REGEN_STREAK_LENGTH) return false;
  if (spent === 0) return false;
  spent = Math.max(spent - REGEN_LIVES, 0);
  cleanStreak = 0;
  regenFired = true;
  return true;
}

function unusedIndices(arr, used) {
  return arr.map((_, i) => i).filter(i => !used.includes(i));
}

function availableSpines(scenario) {
  const used = usedLegends[scenario.id] || [];
  if (scenario.mode === "whodunnit") {
    return unusedIndices(scenario.suspects, used);
  }
  if (scenario.mode === "fixed") {
    if (scenario.legendVariants) {
      return unusedIndices(scenario.legendVariants, used);
    }
    return used.length ? [] : [scenario.fixedLegend.spine];
  }
  return Object.keys(scenario.grid).filter(id => !used.includes(id));
}

function maxSpines(scenario) {
  if (scenario.mode === "whodunnit") return scenario.suspects.length;
  if (scenario.mode === "fixed") return scenario.legendVariants ? scenario.legendVariants.length : 1;
  return Object.keys(scenario.grid).length;
}

function optionSpineId(scenario, option) {
  if (scenario.mode === "whodunnit") return scenario.archetype;
  if (scenario.mode === "fixed") {
    return scenario.legendVariants ? scenario.legendVariants[option].spine : scenario.fixedLegend.spine;
  }
  return option;
}

function pickLegend(scenario, avoidSpineId) {
  if (scenario.mode === "whodunnit") {
    return { spineId: scenario.archetype, facetIds: [] };
  }
  if (scenario.mode === "fixed") {
    if (scenario.legendVariants) {
      const ids = availableSpines(scenario);
      if (!ids.length) throw new Error(`pickLegend: no legend variants left for exhausted scenario ${scenario.id}`);
      const safe = avoidSpineId != null ? ids.filter(i => optionSpineId(scenario, i) !== avoidSpineId) : ids;
      const idx = weightedPick(safe.length ? safe : ids);
      const v = scenario.legendVariants[idx];
      return { spineId: v.spine, facetIds: v.facets.slice(), grid: v.grid, epilogue: v.epilogue, variantIndex: idx };
    }
    const facetIds = facetGraded(scenario) ? scenario.fixedLegend.facets.slice() : [];
    return { spineId: scenario.fixedLegend.spine, facetIds };
  }
  const ids = availableSpines(scenario);
  if (!ids.length) throw new Error(`pickLegend: no covers left for exhausted scenario ${scenario.id}`);
  const safe = avoidSpineId != null ? ids.filter(id => id !== avoidSpineId) : ids;
  const pick = weightedPick(safe.length ? safe : ids);
  return { spineId: pick, facetIds: [] };
}

function isFinalised() {
  return retired && (!current || current.chosen === null);
}

function missionInteractable() {
  return !!current && !current.timedOut && (current.chosen === null || current.reselecting);
}

function missionStatusLine() {
  const guardianOn = toggleOn("guardian");
  if (retired && current && current.chosen !== null) {
    return guardianOn
      ? "🐾 That answer uses your last life. Change it to save the cover, or end the run."
      : "";
  }
  return poolStatusLine();
}

function computeRows(scenario, legend, idx) {
  const grid = legend.grid || scenario.grid;
  const rowIds = scenario.mode === "full5" ? [legend.spineId] : [legend.spineId, ...legend.facetIds];
  const hasFacets = legend.facetIds.length > 0;
  const facetWeight = legend.facetIds.length === 1 ? FACET_WEIGHT_SINGLE_FACET : FACET_WEIGHT_TWO_FACET;
  return rowIds.map(rowId => {
    const tier = grid[rowId][idx];
    const name = COVERS[rowId] ? COVERS[rowId].name : FACETS[rowId].name;
    if (rowId !== legend.spineId) {
      const drift = FACET_DRIFT[tier];
      return { rowId, name, tier, weight: facetWeight, exposure: drift * facetWeight };
    }
    const weight = weightFor(scenario, rowId, legend);
    const exposure = hasFacets ? (TIER_VALUE[tier] / 2) * weight : TIER_VALUE[tier] * weight;
    return { rowId, name, tier, weight, exposure };
  });
}

function handleRechooseGuard(idx) {
  const guardianOn = toggleOn("guardian");
  if (current.chosen === idx) {
    if (!retired && current.reselecting) {
      current.reselecting = false;
      renderMission();
      return false;
    }
    if (retired && guardianOn) {
      if (!current.reselecting && !current.guardianSavedThisMission) { guardianSaves++; current.guardianSavedThisMission = true; }
      if (!current.streakResetThisMission) { guardianStreakResets++; current.streakResetThisMission = true; }
      current.withdrawnIdx = current.chosen;
      goBack(true);
    }
    return false;
  }
  return guardianOn && current.reselecting;
}

function undoRechoose() {
  if (current.regenApplied) spent += REGEN_LIVES;
  spent -= current.total;
  history.pop();
  cleanStreak = current.streakBefore || 0;
}

function applyCleanStreak(clean) {
  current.streakBefore = cleanStreak;
  const regenJustFired = registerCleanStreak(clean);
  current.regenApplied = regenJustFired;
  return regenJustFired;
}

function commitChoice(total, clean, timedOut, entry) {
  spent += total;
  retired = spent >= POOL_SIZE;
  const regenJustFired = applyCleanStreak(clean);
  entry.poolAfter = Math.min(spent, POOL_SIZE);
  entry.regenApplied = regenJustFired;
  entry.timedOut = timedOut;
  entry.streakAfter = cleanStreak;
  entry.guardianUsed = current && current.guardianSavedThisMission;
  history.push(entry);
  history[history.length - 1].score = computeScore();
  if (retired) recordRunEnd("blown");
  return regenJustFired;
}

function beginAnswer(idx) {
  if (!current || current.timedOut) return null;
  if (Date.now() - lastWithdrawAt < 350) return null;
  const guardianOn = toggleOn("guardian");
  const rechoose = current.chosen !== null;
  if (rechoose && !handleRechooseGuard(idx)) return null;
  return { guardianOn, rechoose };
}

function applyAnswerTransition(rechoose, guardianReselect, idx) {
  if (rechoose) {
    undoRechoose();
    if (guardianReselect) { cleanStreak = 0; if (!current.streakResetThisMission) { guardianStreakResets++; current.streakResetThisMission = true; } if (!current.answerChangedThisMission) { answersChanged++; current.answerChangedThisMission = true; } }
    current.reselecting = false;
    return false;
  }
  completedCount++;
  return noteFreshAnswer(idx);
}

function answerMsTaken() {
  return current.startedAt != null ? Date.now() - current.startedAt : 0;
}

function chooseOption(idx) {
  const ctx = beginAnswer(idx);
  if (!ctx) return;
  const { guardianOn, rechoose } = ctx;
  const s = current.scenario;
  const rows = computeRows(s, current.legend, idx);
  const rawExposure = rows.reduce((a, r) => a + r.exposure, 0);
  const guardianReselect = rechoose && guardianOn && current.reselecting;
  const freshChange = applyAnswerTransition(rechoose, guardianReselect, idx);

  const remainingBefore = POOL_SIZE - spent;
  const spineRow = rows.find(r => r.rowId === current.legend.spineId);
  const isMediumFacet = current.legend.facetIds.length === 1;
  const sliver = isMediumFacet ? MEDIUM_SLIVER : HARD_SLIVER;
  let total = !current.legend.facetIds.length
    ? rawExposure
    : ratioCost(rawExposure, missionMaxExposure(s, current.legend), remainingBefore, sliver);
  if (current.legend.facetIds.length && spineRow.tier === "clean") {
    if (isMediumFacet || spent + total >= POOL_SIZE) total = 0;
  }

  current.chosen = idx;
  current.rows = rows;
  current.rawExposure = rawExposure;
  current.total = total;

  const clean = current.legend.facetIds.length ? spineRow.tier === "clean" : total === 0;
  const streakClean = guardianReselect ? false : clean;
  const msTaken = answerMsTaken();
  const regenJustFired = commitChoice(total, streakClean, false, {
    id: s.id,
    cover: (COVERS[current.legend.spineId] || FACETS[current.legend.spineId]).name,
    optIdx: idx,
    optText: s.options[idx],
    answerChanged: guardianReselect || freshChange,
    msTaken,
    rows,
    total,
  });

  const remaining = Math.max(POOL_SIZE - spent, 0);
  const lifeWord = total === 1 ? "life" : "lives";
  announce(
    `Choice recorded. ${total === 0 ? "No lives lost." : `${total} ${lifeWord} lost.`} ` +
    `${remaining} of ${POOL_SIZE} lives remaining.` +
    (regenJustFired ? " Streak held, a life is restored." : "") +
    (retired && guardianOn ? " That uses your last life. Change this answer to save the cover, or end the run." : "")
  );

  afterChoiceRender(guardianReselect);
}

function undoRecordedRun() {
  if (!runRecorded) return;
  if (statsBeforeRunEnd) saveStats(statsBeforeRunEnd);
  statsBeforeRunEnd = null;
  runRecorded = false;
}

function goBack(breakStreak) {
  if (!current || current.chosen === null) return;
  lastWithdrawAt = Date.now();
  if (retired) undoRecordedRun();
  spent -= current.total;
  if (current.regenApplied) spent += REGEN_LIVES;
  cleanStreak = breakStreak ? 0 : (current.streakBefore || 0);
  regenFired = false;
  retired = false;
  completedCount--;
  history.pop();
  current.readEarned = 0;
  current.chosen = null;
  current.rows = null;
  current.total = 0;
  current.timedOut = false;
  current.regenApplied = false;
  announce("Answer withdrawn. Choose again.");
  renderMission();
  renderDevPanel();
  renderRecords();
}

function startReselect() {
  const guardianOn = toggleOn("guardian");
  if (!current || current.chosen === null || !guardianOn) return;
  if (retired) { if (!current.guardianSavedThisMission) { guardianSaves++; current.guardianSavedThisMission = true; } undoRecordedRun(); }
  current.reselecting = true;
  announce("Choose a different answer. Your streak will reset.");
  renderMission();
  renderDevPanel();
  renderRecords();
}

function hintEligible() {
  if (!HINTS_ENABLED) return false;
  if (!current || current.chosen !== null || current.timedOut) return false;
  const s = current.scenario;
  if (s.mode === "whodunnit") return false;
  if (s.pi || s.morse) return false;
  return true;
}

function findCleanOptionIndex(scenario, legend) {
  for (let i = 0; i < scenario.options.length; i++) {
    const rows = computeRows(scenario, legend, i);
    const spineRow = rows.find(r => r.rowId === legend.spineId);
    if (spineRow && spineRow.tier === "clean") return i;
  }
  return -1;
}

function useHint() {
  if (hintsLeft <= 0 || !hintEligible()) return;
  const s = current.scenario;
  const idx = findCleanOptionIndex(s, current.legend);
  if (idx === -1) return;
  hintsLeft--;
  let text = `your cover reads cleanest on option ${idx + 1}: "${s.options[idx]}".`;
  if (current.legend.facetIds.length === 2) {
    const facetNames = current.legend.facetIds.map(f => FACETS[f].name);
    text += ` but ${listJoin(facetNames)} tug elsewhere, mind the drift.`;
  }
  current.hintMessage = text;
  announce(text);
  renderMission();
}

const CHALLENGE_TICK_MS = 1000;
const CHALLENGE_DEFAULT_SECS = 30;

function challengeEnabled() {
  const el = document.getElementById("challengeToggle");
  return !!(el && el.checked);
}

function toggleOn(name) {
  return document.getElementById(name + "Toggle").checked;
}

function timeoutCount() {
  return history.filter(h => h.timedOut).length;
}

let lastWithdrawAt = 0;

function noteFreshAnswer(idx) {
  if (!current || current.withdrawnIdx == null) return false;
  const changed = idx !== current.withdrawnIdx;
  if (changed && !current.answerChangedThisMission) { answersChanged++; current.answerChangedThisMission = true; }
  current.withdrawnIdx = null;
  return changed;
}

function challengeDurationMs(scenario) {
  if (!scenario || scenario.morse || scenario.pi) return null;
  const el = document.getElementById("challengeDurationSelect");
  const base = (el ? parseInt(el.value, 10) : CHALLENGE_DEFAULT_SECS) * 1000;
  return scenario.mode === "whodunnit" ? base * 3 : base;
}

function challengeCountingDown() {
  return challengeEnabled() && !!current && current.chosen === null && !current.timedOut
    && current.challengeMsLeft != null && !isFinalised() && !trainingComplete && !pendingEgg;
}

function challengeTimeout() {
  if (!current || current.chosen !== null || current.timedOut) return;
  current.timedOut = true;
  const s = current.scenario;
  commitChoice(1, false, true, {
    id: s.id,
    cover: (COVERS[current.legend.spineId] || FACETS[current.legend.spineId]).name,
    optText: "no answer",
    msTaken: challengeDurationMs(s),
    rows: [],
    total: 1,
  });
  const remaining = Math.max(POOL_SIZE - spent, 0);
  announce(
    `Time ran out. Cover exposed, 1 life lost. ${remaining} of ${POOL_SIZE} lives remaining.` +
    (retired ? " That was your last life." : "")
  );
  afterChoiceRender(false);
}

function challengeTick() {
  if (!challengeCountingDown()) return;
  current.challengeMsLeft -= CHALLENGE_TICK_MS;
  if (current.challengeMsLeft <= 0) {
    current.challengeMsLeft = 0;
    challengeTimeout();
    return;
  }
  renderChallengeTimer();
}

function gameTick() {
  challengeTick();
  renderRunClock();
}

function xfnv1a(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let RNG = Math.random;
let runSeed = null;
let activeSeed = null;
let castCounter = 0;
function setSeed(seedStr) { activeSeed = String(seedStr); RNG = mulberry32(xfnv1a(activeSeed)); }
function weightedPick(items, weightFn) {
  if (!weightFn) return items[Math.floor(RNG() * items.length)];
  const weights = items.map(weightFn);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = RNG() * total;
  for (let i = 0; i < items.length; i++) { r -= weights[i]; if (r < 0) return items[i]; }
  return items[items.length - 1];
}
function rollInt(n) { return Math.floor(RNG() * n); }
function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = rollInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function permuteGrid(grid, order) {
  const out = {};
  Object.keys(grid).forEach(rowId => { out[rowId] = order.map(i => grid[rowId][i]); });
  return out;
}
function subsetGrid(grid, keepIdx) {
  const out = {};
  Object.keys(grid).forEach(rowId => { out[rowId] = keepIdx.map(i => grid[rowId][i]); });
  return out;
}
function shuffleOptions(scenario, legend) {
  if (scenario.pi || scenario.morse) return scenario;
  let options = scenario.options;
  let grid = legend.grid || scenario.grid;
  if (options.length > 4) {
    const cleanIdx = grid[legend.spineId].indexOf("clean");
    const droppable = options.map((_, i) => i).filter(i => i !== cleanIdx);
    const dropIdx = droppable[rollInt(droppable.length)];
    const keepIdx = options.map((_, i) => i).filter(i => i !== dropIdx);
    options = keepIdx.map(i => options[i]);
    grid = subsetGrid(grid, keepIdx);
  }
  const order = shuffled(options.map((_, i) => i));
  const clone = { ...scenario, options: order.map(i => options[i]) };
  if (legend.grid) legend.grid = permuteGrid(grid, order);
  else clone.grid = permuteGrid(grid, order);
  return clone;
}
function listJoin(items) {
  if (items.length <= 1) return items.join("");
  return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}

function castFairGrid(nSus, nScenes, allowedImposters) {
  if (allowedImposters && !allowedImposters.length) throw new Error("castFairGrid: allowedImposters is empty (imposter pool exhausted)");
  const pool = allowedImposters && allowedImposters.length ? allowedImposters : Array.from({ length: nSus }, (_, i) => i);
  const imposter = pool[rollInt(pool.length)];
  const holdScene = rollInt(nScenes);
  const innocents = [];
  for (let i = 0; i < nSus; i++) if (i !== imposter) innocents.push(i);
  const order = shuffled(innocents);
  const herringByScene = [];
  for (let sc = 0; sc < nScenes; sc++) herringByScene.push(order[sc]);
  const tiers = [];
  for (let si = 0; si < nSus; si++) {
    const row = [];
    for (let sc = 0; sc < nScenes; sc++) {
      if (si === imposter) row.push(sc === holdScene ? "clean" : "crack");
      else row.push(herringByScene[sc] === si ? "hairline" : "clean");
    }
    tiers.push(row);
  }
  return { imposter, holdScene, herringByScene, tiers };
}

function assertMinOptions(scenario) {
  const n = scenario.mode === "whodunnit" ? scenario.suspects.length : scenario.options.length;
  if (n < 4) console.warn(`[fairness] ${scenario.id || scenario.name || "mission"}: only ${n} answer options (expected >=4)`);
}

function assertFairCast(cast, scenario) {
  const nScenes = scenario.beatPrompts.length;
  const warn = m => console.warn(`[fairness] ${scenario.id || scenario.name || "mission"}: ${m}`);
  for (let sc = 0; sc < nScenes; sc++) {
    const nonClean = cast.tiers.map((t, si) => (t[sc] !== "clean" ? si : -1)).filter(i => i >= 0);
    if (nonClean.length === 1 && nonClean[0] === cast.imposter) warn(`scene ${sc} singles out the imposter`);
    const herrings = cast.tiers.filter((t, si) => si !== cast.imposter && t[sc] === "hairline").length;
    if (herrings !== 1) warn(`scene ${sc} has ${herrings} herrings (expected 1)`);
  }
}

function buildCasting(scenario) {
  const nSus = scenario.suspects.length;
  if (scenario.randomiseImposter) {
    if (runSeed !== null) setSeed(`${runSeed}:${scenario.id || "m"}:${castCounter++}`);
    const allowedImposters = scenario.mode === "whodunnit" ? availableSpines(scenario) : null;
    const { imposter, holdScene, herringByScene, tiers } = castFairGrid(nSus, scenario.beatPrompts.length, allowedImposters);
    const actions = scenario.suspects.map((sus, si) =>
      tiers[si].map((tier, sc) => sus.beats[sc][tier])
    );
    const cast = { imposter, holdScene, herringByScene, tiers, actions,
      imposterArchetype: scenario.imposterArchetype, seed: activeSeed };
    const devEl = document.getElementById("devToggle");
    if (devEl && devEl.checked) assertFairCast(cast, scenario);
    return cast;
  }
  const imposter = scenario.suspects.findIndex(sus => sus.liar);
  const tiers = scenario.suspects.map(sus => sus.beats.map(b => b.tier));
  const actions = scenario.suspects.map(sus => sus.beats.map(b => b.action));
  return { imposter, tiers, actions, imposterArchetype: scenario.suspects[imposter].realArchetype };
}

function returnToSkipped() {
  if (!skippedStack.length || retired || (current && current.timedOut)) return;
  if (current && current.chosen === null) {
    const arr = usedLegends[current.scenario.id];
    if (arr) arr.pop();
    if (current.scenario.archetypeVariants) {
      const arcArr = usedArchetypes[current.scenario.id];
      if (arcArr) arcArr.pop();
    }
  }
  pendingEgg = null;
  skippedCount--;
  current = skippedStack.pop();
  current.startedAt = Date.now();
  announce(`Returned to the skipped mission. ${current.scenario.dispatch}`);
  renderMission();
  renderDevPanel();
}

function applyCastPresentation(scenario, cast) {
  const names = shuffled(WHODUNNIT_NAME_POOL.concat(CUSTOM_NAME_POOL)).slice(0, scenario.suspects.length);
  const order = shuffled(scenario.beatPrompts.map((_, i) => i));
  cast.tiers = cast.tiers.map(row => order.map(sc => row[sc]));
  cast.actions = cast.actions.map(row => order.map(sc => row[sc]));
  cast.holdScene = order.indexOf(cast.holdScene);
  cast.herringByScene = order.map(sc => cast.herringByScene[sc]);
  return { ...scenario,
    situation: scenario.situation.replace("{names}", listJoin(names)),
    suspects: scenario.suspects.map((sus, i) => ({ ...sus, name: names[i], beats: order.map(sc => sus.beats[sc]) })),
    beatPrompts: order.map(sc => scenario.beatPrompts[sc]),
    sceneTags: scenario.sceneTags ? order.map(sc => scenario.sceneTags[sc]) : scenario.sceneTags,
  };
}

function pickArchetypeVariant(scenario) {
  let ids = unusedIndices(scenario.archetypeVariants, usedArchetypes[scenario.id] || []);
  if (!ids.length) {
    usedArchetypes[scenario.id] = [];
    ids = scenario.archetypeVariants.map((_, i) => i);
  }
  const idx = ids[rollInt(ids.length)];
  const v = scenario.archetypeVariants[idx];
  return { ...scenario,
    archetype: v.archetype,
    imposterArchetype: v.imposterArchetype,
    imposterTell: v.imposterTell,
    situation: `${scenario.situationIntro} ${WHODUNNIT_TELL_PARA}`,
    suspects: scenario.suspects.map(sus => ({ ...sus, beats: sus.beats[v.archetype] })),
    archetypeVariantIndex: idx,
  };
}

function startScenario(rawScenario, avoidCoverId) {
  briefShown = true;
  if (current && current.chosen === null && !current.timedOut) {
    skippedCount++;
    skippedStack.push(current);
  }
  let scenario = rawScenario.mode === "whodunnit" && rawScenario.archetypeVariants
    ? pickArchetypeVariant(rawScenario)
    : rawScenario;
  const legend = pickLegend(scenario, avoidCoverId);
  if (scenario.mode !== "whodunnit") scenario = shuffleOptions(scenario, legend);
  current = { scenario, legend, chosen: null, rows: null, total: 0, morseRevealed: false, timedOut: false, challengeMsLeft: challengeDurationMs(scenario), startedAt: Date.now(), hintMessage: null, guardianSavedThisMission: false, answerChangedThisMission: false, streakResetThisMission: false };
  recentScenarios.push(scenario.id);
  if (recentScenarios.length > REPEAT_WINDOW) recentScenarios.shift();
  lastCoverId = current.legend.spineId;
  lastMode = scenario.mode;
  if (scenario.mode === "whodunnit") {
    current.cast = buildCasting(scenario);
    if (scenario.randomiseImposter) {
      scenario = applyCastPresentation(scenario, current.cast);
      current.scenario = scenario;
    }
  }
  if (!usedLegends[scenario.id]) usedLegends[scenario.id] = [];
  usedLegends[scenario.id].push(
    scenario.mode === "whodunnit" ? current.cast.imposter :
    scenario.legendVariants ? current.legend.variantIndex : current.legend.spineId
  );
  if (scenario.archetypeVariants) {
    if (!usedArchetypes[scenario.id]) usedArchetypes[scenario.id] = [];
    usedArchetypes[scenario.id].push(scenario.archetypeVariantIndex);
  }
  const devEl = document.getElementById("devToggle");
  if (devEl && devEl.checked) assertMinOptions(scenario);
  announce(`New mission loaded. ${scenario.dispatch}`);
  renderMission();
  renderDevPanel();
  const missionIdEl = document.getElementById("missionId");
  if (missionIdEl) {
    missionIdEl.focus({ preventScroll: true });
    if (window.matchMedia("(max-width: 560px)").matches) {
      missionIdEl.scrollIntoView({ block: "start" });
    }
  }
}

let scoreCacheSig = null, scoreCacheVal = 0;
function computeScore() {
  const readBonus = history.reduce((a, h) => a + (h.readEarned || 0), 0);
  const sig = spent + "/" + completedCount + "/" + skippedCount + "/" + readBonus;
  if (sig === scoreCacheSig) return scoreCacheVal;
  const remaining = Math.max(POOL_SIZE - spent, 0);
  const base = completedCount * 100 - skippedCount * 25;
  const multiplier = 1 + remaining / POOL_SIZE;
  scoreCacheVal = Math.max(0, Math.round(base * multiplier)) + readBonus;
  scoreCacheSig = sig;
  return scoreCacheVal;
}

const clamp01 = x => Math.max(0, Math.min(1, x));
let ratioCacheSig = null, ratioCacheVal = 0;
function computeRatio() {
  const sig = spent + "/" + completedCount + "/" + skippedCount;
  if (sig === ratioCacheSig) return ratioCacheVal;
  const avgExposure = spent / Math.max(completedCount, 1);
  const accuracy  = clamp01(1 - avgExposure / 4);
  const endurance = clamp01(completedCount / 8);
  ratioCacheVal = accuracy * (0.5 + 0.5 * endurance);
  ratioCacheSig = sig;
  return ratioCacheVal;
}

function rankFromRatio(ratio, t) {
  if (ratio >= t.masterSpy) return RANK_NAMES.masterSpy;
  if (ratio >= t.seniorOperative) return RANK_NAMES.seniorOperative;
  if (ratio >= t.operative) return RANK_NAMES.operative;
  if (ratio >= t.fieldAgent) return RANK_NAMES.fieldAgent;
  if (ratio >= t.trainee) return RANK_NAMES.trainee;
  return RANK_NAMES.recruit;
}

const RANK_THRESHOLDS = { masterSpy: 0.90, seniorOperative: 0.80, operative: 0.70, fieldAgent: 0.60, trainee: 0.50 };
const RANK_ORDER = [RANK_NAMES.recruit, RANK_NAMES.trainee, RANK_NAMES.fieldAgent, RANK_NAMES.operative, RANK_NAMES.seniorOperative, RANK_NAMES.masterSpy];
const RANK_MISSION_FLOOR = { [RANK_NAMES.trainee]: 2, [RANK_NAMES.fieldAgent]: 5, [RANK_NAMES.operative]: 9, [RANK_NAMES.seniorOperative]: 14, [RANK_NAMES.masterSpy]: 20 };
function clampRankByMissions(rank, completed) {
  let idx = RANK_ORDER.indexOf(rank);
  while (idx > 0 && completed < (RANK_MISSION_FLOOR[RANK_ORDER[idx]] || 0)) idx--;
  return RANK_ORDER[idx];
}
function computeRank() {
  if (completedCount === 0) return RANK_NAMES.recruit;
  return clampRankByMissions(rankFromRatio(computeRatio(), RANK_THRESHOLDS), completedCount);
}

const GATE_THRESHOLD_PRESETS = {
  default: RANK_THRESHOLDS,
  low:    { masterSpy: 0.80, seniorOperative: 0.70, operative: 0.60, fieldAgent: 0.50, trainee: 0.40 },
  medium: { masterSpy: 0.85, seniorOperative: 0.75, operative: 0.65, fieldAgent: 0.55, trainee: 0.45 },
  high:   RANK_THRESHOLDS,
};
function computeGateRank() {
  if (completedCount === 0) return RANK_NAMES.recruit;
  const table = GATE_THRESHOLD_PRESETS[currentPreset] || RANK_THRESHOLDS;
  return clampRankByMissions(rankFromRatio(computeRatio(), table), completedCount);
}

function rankAtLeast(minRank) {
  return RANK_ORDER.indexOf(computeGateRank()) >= RANK_ORDER.indexOf(minRank);
}

function rankFlavorLine() {
  if (completedCount === 0) return SKIP_ALL_FLAVOR;
  if (skippedCount > completedCount) return SKIP_HEAVY_FLAVOR;
  return RANK_FLAVOR[computeRank()];
}

const TIER_RANK_UNLOCK = {
  "Easy":        RANK_NAMES.recruit,
  "Medium":      RANK_NAMES.trainee,
  "MediumFacet": RANK_NAMES.fieldAgent,
  "Hard":        RANK_NAMES.operative,
};

function getMinTier(scenario) {
  if (scenario.minTier) return scenario.minTier;
  if (scenario.level === "Easy") return "Easy";
  if (facetGraded(scenario)) return "Hard";
  return "Medium";
}

function tierGateCheck(scenario) {
  const minTier = getMinTier(scenario);
  const requiredRank = TIER_RANK_UNLOCK[minTier];
  return bypassTierGate || rankAtLeast(requiredRank);
}

function recencySafePool(cands) {
  if (cands.length <= 1) return cands;
  for (let w = Math.min(recentScenarios.length, REPEAT_WINDOW); w > 0; w--) {
    const recent = new Set(recentScenarios.slice(-w));
    const filtered = cands.filter(s => !recent.has(s.id));
    if (filtered.length) return filtered;
  }
  return cands;
}

const EGG_BUILDERS = { EPI1: buildEggPi1, EMC1: buildEggMorse1, EMC2: buildEggMorse2, EMC3: buildEggMorse3 };
const MORSE_EGG_IDS = ["EMC1", "EMC2", "EMC3"];

function newMission() {
  if (typeof pauseMorseAudio === "function") pauseMorseAudio();
  if (!runTimerStarted) { runStartedAt = Date.now(); runTimerStarted = true; }
  coverAnchored = false;
  awaitingSkipReturn = false;
  if (retired) {
    if (current) { current = null; announce(poolStatusLine()); renderMission(); renderDevPanel(); }
    return;
  }
  const endlessOn = toggleOn("endless");
  if (!endlessOn && completedCount + skippedCount >= RUN_MISSION_CAP) {
    if (current && current.chosen === null && !current.timedOut) {
      skippedCount++;
      skippedStack.push(current);
    }
    trainingComplete = true;
    recordRunEnd("complete");
    current = null;
    announce("Clean exit. You've reached the mission cap for this run. Press Restart Game to start a new run.");
    renderMission();
    renderDevPanel();
    renderRecords();
    return;
  }
  if (pendingEgg) {
    const wasEgg = pendingEgg;
    pendingEgg = null;
    if (wasEgg.id === "pi") {
      recordEgg("pi");
      startScenario(buildEggPi1());
      return;
    }
    if (wasEgg.id === "morse") {
      recordEgg("morse");
      const stats = loadStats();
      const found = stats.aggregates.eggsFound || [];
      const unseen = MORSE_EGG_IDS.filter(id => found.indexOf(id) === -1);
      const pick = unseen.length ? unseen[rollInt(unseen.length)] : MORSE_EGG_IDS[rollInt(MORSE_EGG_IDS.length)];
      recordEgg(pick);
      startScenario(EGG_BUILDERS[pick]());
      return;
    }
  } else {
    const egg = SCORE_EGGS.find(e => !shownEggs[e.id] && (e.exact ? computeScore() === e.threshold : computeScore() > e.threshold));
    if (egg) {
      shownEggs[egg.id] = true;
      if (egg.id === "over9000") recordEgg("over9000");
      pendingEgg = egg;
      renderMission();
      renderDevPanel();
      return;
    }
  }
  let candidates = SCENARIOS.filter(s =>
    availableSpines(s).length > 0 && tierGateCheck(s)
  );
  if (!candidates.length && skippedStack.length && completedCount > 0) {
    awaitingSkipReturn = true;
    current = null;
    announce(SKIP_RETURN_PROMPT);
    renderMission();
    renderDevPanel();
    return;
  }
  if (!candidates.length) {
    allMissionsCleared = true;
    if (endlessOn && completedCount > 0) {
      const unlockedIds = SCENARIOS.filter(s => tierGateCheck(s)).map(s => s.id);
      unlockedIds.forEach(id => { usedLegends[id] = []; usedArchetypes[id] = []; });
      candidates = SCENARIOS.filter(s => availableSpines(s).length > 0 && tierGateCheck(s));
    }
  }
  if (!candidates.length) {
    if (current && current.chosen === null && !current.timedOut) {
      skippedCount++;
      skippedStack.push(current);
    }
    trainingComplete = true;
    allMissionsCleared = true;
    recordRunEnd("complete");
    current = null;
    announce("Clean exit. Every mission combination has been run. Press Restart Game to start a new run.");
    renderMission();
    renderDevPanel();
    renderRecords();
    return;
  }
  if (completedCount + skippedCount < 3) {
    const easy = candidates.filter(s => s.mode === "full5");
    if (easy.length) candidates = easy;
  }
  const scenarioPool = recencySafePool(candidates);
  const coverSafePool = lastCoverId
    ? scenarioPool.filter(s => availableSpines(s).some(opt => optionSpineId(s, opt) !== lastCoverId))
    : scenarioPool;
  const modeSafePool = lastMode === "whodunnit" ? coverSafePool.filter(s => s.mode !== "whodunnit") : coverSafePool;
  const pool = modeSafePool.length ? modeSafePool : (coverSafePool.length ? coverSafePool : scenarioPool);
  startScenario(weightedPick(pool, s => maxSpines(s) / availableSpines(s).length), lastCoverId);
}

const STATS_KEY = "kuri-stats";
const STATS_RUN_CAP = 50;
let runRecorded = false;
let statsBeforeRunEnd = null;

const REMOTE_SUBMIT_ENABLED = false;
function submitRunRemote(run) {
  if (!REMOTE_SUBMIT_ENABLED) return;
}

function newRunId() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

function freshStats() {
  return { v: 1, runs: [], aggregates: { totalRuns: 0, totalMissions: 0, bestScore: 0, bestRank: null }, unlocked: [] };
}

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return freshStats();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.runs)) return freshStats();
    if (!parsed.aggregates) parsed.aggregates = freshStats().aggregates;
    if (!Array.isArray(parsed.unlocked)) parsed.unlocked = [];
    parsed.runs.forEach(r => {
      if (r.challenge === undefined) r.challenge = false;
      if (r.guardian === undefined) r.guardian = false;
      if (r.regen === undefined) r.regen = false;
      if (r.endless === undefined) r.endless = false;
      if (r.livesLeft === undefined) r.livesLeft = null;
      if (r.skipped === undefined) r.skipped = 0;
      if (r.timeouts === undefined) r.timeouts = 0;
      if (r.runMs === undefined) r.runMs = 0;
      if (r.missionMs === undefined) r.missionMs = 0;
      if (r.missionsTimed === undefined) r.missionsTimed = 0;
      if (r.guardianSaves === undefined) r.guardianSaves = 0;
      if (r.streakResets === undefined) r.streakResets = 0;
      if (r.livesRegained === undefined) r.livesRegained = 0;
      if (r.answersChanged === undefined) r.answersChanged = 0;
      if (r.allCleared === undefined) r.allCleared = false;
    });
    if (parsed.aggregates.totalGuardianSaves === undefined) {
      const a = parsed.aggregates;
      a.totalGuardianSaves = 0; a.totalStreakResets = 0;
      parsed.runs.forEach(r => {
        a.totalGuardianSaves += r.guardianSaves;
        a.totalStreakResets += r.streakResets;
      });
    }
    if (!Array.isArray(parsed.aggregates.eggsFound)) parsed.aggregates.eggsFound = [];
    if (parsed.aggregates.totalSkipped === undefined) {
      const a = parsed.aggregates;
      a.totalSkipped = 0; a.totalFailed = 0; a.timedRuns = 0; a.totalRunMs = 0; a.longestRunMs = 0; a.shortestRunMs = 0;
      parsed.runs.forEach(r => {
        a.totalSkipped += r.skipped;
        a.totalFailed += r.timeouts;
        if (r.runMs > 0) {
          a.timedRuns += 1;
          a.totalRunMs += r.runMs;
          a.longestRunMs = Math.max(a.longestRunMs, r.runMs);
          a.shortestRunMs = a.shortestRunMs ? Math.min(a.shortestRunMs, r.runMs) : r.runMs;
        }
      });
    }
    return parsed;
  } catch (e) {
    return freshStats();
  }
}

function saveStats(obj) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(obj)); } catch (e) {}
}

function exportRecordString() {
  return btoa(encodeURIComponent(JSON.stringify(loadStats())));
}

function parseRecordString(str) {
  try {
    const json = JSON.parse(decodeURIComponent(atob(str.trim())));
    if (!json || typeof json !== "object") return null;
    if (!Array.isArray(json.runs) || !json.aggregates || !Array.isArray(json.unlocked)) return null;
    return json;
  } catch (e) {
    return null;
  }
}

function recordEgg(id) {
  const stats = loadStats();
  if (!Array.isArray(stats.aggregates.eggsFound)) stats.aggregates.eggsFound = [];
  if (stats.aggregates.eggsFound.indexOf(id) === -1) {
    stats.aggregates.eggsFound.push(id);
    saveStats(stats);
    evaluateAchievements();
  }
}

function rankMeets(rank, minRank) {
  if (!rank) return false;
  return RANK_ORDER.indexOf(rank) >= RANK_ORDER.indexOf(minRank);
}

const ACHIEVEMENTS_ENABLED = true;
const RECORDS_ENABLED = true;
function completeRuns(stats) { return stats.runs.filter(r => r.outcome === "complete").length; }
function blownRuns(stats) { return stats.runs.filter(r => r.outcome === "blown").length; }
function maxSpineMissions(stats) {
  const c = stats.aggregates.covers || {};
  return Object.values(c).reduce((mx, v) => Math.max(mx, v.missions || 0), 0);
}
function allSpinesCovered(stats) {
  const c = stats.aggregates.covers || {};
  return Object.keys(COVERS).every(k => c[k] && c[k].missions > 0);
}
function hasEgg(stats, id) { return ((stats.aggregates.eggsFound || []).indexOf(id) !== -1); }

const ACHIEVEMENTS = [
  { id: "field_clearance", ...ACHIEVEMENT_COPY.field_clearance,
    check: stats => rankMeets(stats.aggregates.bestRank, RANK_NAMES.fieldAgent) },
  { id: "active_duty", ...ACHIEVEMENT_COPY.active_duty,
    check: stats => rankMeets(stats.aggregates.bestRank, RANK_NAMES.operative) },
  { id: "handlers_trust", ...ACHIEVEMENT_COPY.handlers_trust,
    check: stats => rankMeets(stats.aggregates.bestRank, RANK_NAMES.seniorOperative) },
  { id: "ghost_protocol", ...ACHIEVEMENT_COPY.ghost_protocol,
    check: stats => rankMeets(stats.aggregates.bestRank, RANK_NAMES.masterSpy) },

  { id: "cover_established", ...ACHIEVEMENT_COPY.cover_established,
    check: stats => stats.runs.some(r => r.outcome === "complete") },
  { id: "second_tour", ...ACHIEVEMENT_COPY.second_tour,
    check: stats => completeRuns(stats) >= 3,
    progress: stats => ({ current: completeRuns(stats), target: 3 }) },
  { id: "deep_cover", ...ACHIEVEMENT_COPY.deep_cover,
    check: stats => completeRuns(stats) >= 5,
    progress: stats => ({ current: completeRuns(stats), target: 5 }) },
  { id: "seasoned", ...ACHIEVEMENT_COPY.seasoned,
    check: stats => completeRuns(stats) >= 15,
    progress: stats => ({ current: completeRuns(stats), target: 15 }) },
  { id: "lifer", ...ACHIEVEMENT_COPY.lifer,
    check: stats => completeRuns(stats) >= 30,
    progress: stats => ({ current: completeRuns(stats), target: 30 }) },

  { id: "field_work", ...ACHIEVEMENT_COPY.field_work,
    check: stats => (stats.aggregates.totalMissions || 0) >= 10,
    progress: stats => ({ current: stats.aggregates.totalMissions || 0, target: 10 }) },
  { id: "dossier_complete", ...ACHIEVEMENT_COPY.dossier_complete,
    check: stats => (stats.aggregates.totalMissions || 0) >= 50,
    progress: stats => ({ current: stats.aggregates.totalMissions || 0, target: 50 }) },
  { id: "century", ...ACHIEVEMENT_COPY.century,
    check: stats => (stats.aggregates.totalMissions || 0) >= 100,
    progress: stats => ({ current: stats.aggregates.totalMissions || 0, target: 100 }) },
  { id: "quartermaster", ...ACHIEVEMENT_COPY.quartermaster,
    check: stats => (stats.aggregates.totalMissions || 0) >= 250,
    progress: stats => ({ current: stats.aggregates.totalMissions || 0, target: 250 }) },

  { id: "tradecraft", ...ACHIEVEMENT_COPY.tradecraft,
    check: stats => (stats.aggregates.bestScore || 0) >= 1500,
    progress: stats => ({ current: stats.aggregates.bestScore || 0, target: 1500 }) },
  { id: "legend_status", ...ACHIEVEMENT_COPY.legend_status,
    check: stats => (stats.aggregates.bestScore || 0) >= 2500,
    progress: stats => ({ current: stats.aggregates.bestScore || 0, target: 2500 }) },
  { id: "high_value_asset", ...ACHIEVEMENT_COPY.high_value_asset,
    check: stats => (stats.aggregates.bestScore || 0) >= 3000,
    progress: stats => ({ current: stats.aggregates.bestScore || 0, target: 3000 }) },
  { id: "shadow_network", ...ACHIEVEMENT_COPY.shadow_network,
    check: stats => (stats.aggregates.bestScore || 0) >= 3500,
    progress: stats => ({ current: stats.aggregates.bestScore || 0, target: 3500 }) },
  { id: "black_budget", ...ACHIEVEMENT_COPY.black_budget,
    check: stats => (stats.aggregates.bestScore || 0) >= 4500,
    progress: stats => ({ current: stats.aggregates.bestScore || 0, target: 4500 }) },

  { id: "zero_exposure", ...ACHIEVEMENT_COPY.zero_exposure,
    check: stats => stats.runs.some(r => r.outcome === "complete" && r.cracks === 0) },
  { id: "safe_house", ...ACHIEVEMENT_COPY.safe_house,
    check: stats => stats.runs.some(r => r.outcome === "complete" && r.livesUsed <= 3) },
  { id: "by_the_book", ...ACHIEVEMENT_COPY.by_the_book,
    check: stats => stats.runs.some(r => r.outcome === "complete" && r.skipped === 0) },
  { id: "iron_legend", ...ACHIEVEMENT_COPY.iron_legend,
    check: stats => stats.runs.some(r => r.outcome === "complete" && r.streakResets === 0) },
  { id: "no_backup", ...ACHIEVEMENT_COPY.no_backup,
    check: stats => stats.runs.some(r => r.outcome === "complete" && r.guardianSaves === 0) },
  { id: "unwavering", ...ACHIEVEMENT_COPY.unwavering,
    check: stats => stats.runs.some(r => r.outcome === "complete" && r.answersChanged === 0) },

  { id: "counterintelligence", ...ACHIEVEMENT_COPY.counterintelligence,
    check: stats => (stats.aggregates.whoCorrect || 0) >= 1 },
  { id: "double_agent", ...ACHIEVEMENT_COPY.double_agent,
    check: stats => (stats.aggregates.whoCorrect || 0) >= 5,
    progress: stats => ({ current: stats.aggregates.whoCorrect || 0, target: 5 }) },
  { id: "profiler", ...ACHIEVEMENT_COPY.profiler,
    check: stats => (stats.aggregates.whoCorrect || 0) >= 15,
    progress: stats => ({ current: stats.aggregates.whoCorrect || 0, target: 15 }) },
  { id: "cold_read", ...ACHIEVEMENT_COPY.cold_read,
    check: stats => (stats.aggregates.whoScenesCaught || 0) >= 10,
    progress: stats => ({ current: stats.aggregates.whoScenesCaught || 0, target: 10 }) },

  { id: "full_spectrum", ...ACHIEVEMENT_COPY.full_spectrum,
    check: stats => allSpinesCovered(stats) },
  { id: "specialist", ...ACHIEVEMENT_COPY.specialist,
    check: stats => maxSpineMissions(stats) >= 10,
    progress: stats => ({ current: maxSpineMissions(stats), target: 10 }) },
  { id: "deep_specialist", ...ACHIEVEMENT_COPY.deep_specialist,
    check: stats => maxSpineMissions(stats) >= 25,
    progress: stats => ({ current: maxSpineMissions(stats), target: 25 }) },

  { id: "irrational_asset", ...ACHIEVEMENT_COPY.irrational_asset,
    check: stats => hasEgg(stats, "pi") },
  { id: "signal_intercept", ...ACHIEVEMENT_COPY.signal_intercept,
    check: stats => hasEgg(stats, "morse") },
  { id: "off_the_grid", ...ACHIEVEMENT_COPY.off_the_grid,
    check: stats => hasEgg(stats, "over9000") },
  { id: "signal_directorate", ...ACHIEVEMENT_COPY.signal_directorate,
    check: stats => hasEgg(stats, "EMC1") && hasEgg(stats, "EMC2") && hasEgg(stats, "EMC3"),
    progress: stats => {
      const found = (stats.aggregates.eggsFound || []);
      return { current: ["EMC1","EMC2","EMC3"].filter(id => found.indexOf(id) !== -1).length, target: 3 };
    } },

  { id: "burn_notice", ...ACHIEVEMENT_COPY.burn_notice,
    check: stats => stats.runs.some(r => r.outcome === "blown") },
  { id: "compromised", ...ACHIEVEMENT_COPY.compromised,
    check: stats => blownRuns(stats) >= 5,
    progress: stats => ({ current: blownRuns(stats), target: 5 }) },
  { id: "disavowed", ...ACHIEVEMENT_COPY.disavowed,
    check: stats => blownRuns(stats) >= 10,
    progress: stats => ({ current: blownRuns(stats), target: 10 }) },
  { id: "guardian_angel", ...ACHIEVEMENT_COPY.guardian_angel,
    check: stats => (stats.aggregates.totalGuardianSaves || 0) >= 10,
    progress: stats => ({ current: stats.aggregates.totalGuardianSaves || 0, target: 10 }) },
  { id: "nine_lives", ...ACHIEVEMENT_COPY.nine_lives,
    check: stats => (stats.aggregates.totalLivesRegained || 0) >= 9,
    progress: stats => ({ current: stats.aggregates.totalLivesRegained || 0, target: 9 }) },
  { id: "untouchable", ...ACHIEVEMENT_COPY.untouchable,
    check: stats => stats.runs.some(r => (r.livesRegained || 0) >= 9),
    progress: stats => ({ current: Math.max(0, ...stats.runs.map(r => r.livesRegained || 0)), target: 9 }) },
  { id: "adaptable", ...ACHIEVEMENT_COPY.adaptable,
    check: stats => (stats.aggregates.totalAnswersChanged || 0) >= 10,
    progress: stats => ({ current: stats.aggregates.totalAnswersChanged || 0, target: 10 }) },
  { id: "weathered", ...ACHIEVEMENT_COPY.weathered,
    check: stats => (stats.aggregates.totalFailed || 0) >= 5,
    progress: stats => ({ current: stats.aggregates.totalFailed || 0, target: 5 }) },
  { id: "went_to_ground", ...ACHIEVEMENT_COPY.went_to_ground,
    check: stats => stats.runs.some(r => r.outcome === "skipped") },
  { id: "gone_dark", ...ACHIEVEMENT_COPY.gone_dark,
    check: stats => stats.runs.some(r => (r.skipped || 0) >= 10),
    progress: stats => ({ current: Math.max(0, ...stats.runs.map(r => r.skipped || 0)), target: 10 }) },
  { id: "awol", ...ACHIEVEMENT_COPY.awol,
    check: stats => (stats.aggregates.totalSkipped || 0) >= 50,
    progress: stats => ({ current: stats.aggregates.totalSkipped || 0, target: 50 }) },

  { id: "infinity", ...ACHIEVEMENT_COPY.infinity,
    check: stats => stats.runs.some(r => r.outcome === "complete" && r.endless && r.allCleared) },

  { id: "rapid_deployment", ...ACHIEVEMENT_COPY.rapid_deployment,
    check: stats => stats.runs.some(r => r.outcome === "complete" && r.challenge) },
  { id: "blitz", ...ACHIEVEMENT_COPY.blitz,
    check: stats => (stats.aggregates.totalTimedMissions || 0) >= 10,
    progress: stats => ({ current: stats.aggregates.totalTimedMissions || 0, target: 10 }) },
  { id: "under_pressure", ...ACHIEVEMENT_COPY.under_pressure,
    check: stats => stats.runs.some(r => r.outcome === "complete" && r.challenge && r.runMs > 0 && r.runMs < 600000) },
  { id: "lightning", ...ACHIEVEMENT_COPY.lightning,
    check: stats => stats.runs.some(r => r.outcome === "complete" && r.challenge && r.missionsTimed >= 5 && (r.missionMs / r.missionsTimed) < 15000) },

  { id: "clean_sweep", ...ACHIEVEMENT_COPY.clean_sweep,
    check: stats => stats.runs.some(r => r.outcome === "complete" && r.cracks === 0 && r.skipped === 0 && r.streakResets === 0) },
  { id: "shadow_recruit", ...ACHIEVEMENT_COPY.shadow_recruit,
    check: stats => stats.runs.some(r => r.outcome === "complete" && r.rank === RANK_NAMES.masterSpy && r.cracks === 0) },
];

function evaluateAchievements() {
  if (!ACHIEVEMENTS_ENABLED) return;
  const stats = loadStats();
  const newlyUnlocked = [];
  ACHIEVEMENTS.forEach(a => {
    if (stats.unlocked.indexOf(a.id) === -1 && a.check(stats)) {
      stats.unlocked.push(a.id);
      newlyUnlocked.push(a);
    }
  });
  if (newlyUnlocked.length) {
    saveStats(stats);
    if (RECORDS_ENABLED) announce("Achievement unlocked: " + newlyUnlocked.map(a => a.name).join(", "));
  }
  return newlyUnlocked;
}

function betterRank(a, b) {
  if (!a) return b;
  if (!b) return a;
  return RANK_ORDER.indexOf(b) > RANK_ORDER.indexOf(a) ? b : a;
}

function walkHistoryOutcomes(onSpine, onWho) {
  history.forEach(h => {
    if (h.timedOut) return;
    if (h.rows && h.rows.length) {
      const spine = h.rows[0];
      onSpine(spine.rowId, spine.tier);
    } else {
      onWho(h.total === 0 ? "clean" : "crack", h.sceneCaught || 0, h.sceneReadable || 0);
    }
  });
}

function recordRunEnd(outcome) {
  if (runRecorded) return;
  runRecorded = true;
  if (outcome === "complete" && completedCount <= skippedCount + timeoutCount()) outcome = "skipped";
  const stats = loadStats();
  statsBeforeRunEnd = JSON.parse(JSON.stringify(stats));
  const timedAnswers = challengeEnabled() ? history.filter(h => !h.timedOut && h.msTaken != null) : [];
  const run = {
    id: newRunId(),
    ended: Date.now(),
    outcome,
    missions: completedCount,
    skipped: skippedCount,
    score: computeScore(),
    rank: computeRank(),
    livesUsed: Math.min(spent, POOL_SIZE),
    preset: currentPreset,
    cleanMissions: history.filter(h => h.total === 0).length,
    cracks: history.filter(h => h.total >= 2).length,
    challenge: challengeEnabled(),
    guardian: toggleOn("guardian"),
    regen: toggleOn("regen"),
    endless: toggleOn("endless"),
    livesLeft: Math.max(POOL_SIZE - spent, 0),
    missionMs: timedAnswers.reduce((t, h) => t + h.msTaken, 0),
    missionsTimed: timedAnswers.length,
    timeouts: timeoutCount(),
    runMs: elapsedMs(),
    guardianSaves,
    streakResets: guardianStreakResets,
    answersChanged,
    livesRegained: history.filter(h => h.regenApplied).length * REGEN_LIVES,
    allCleared: allMissionsCleared,
  };
  stats.runs.push(run);
  if (stats.runs.length > STATS_RUN_CAP) stats.runs = stats.runs.slice(stats.runs.length - STATS_RUN_CAP);
  stats.aggregates.totalRuns = (stats.aggregates.totalRuns || 0) + 1;
  stats.aggregates.totalMissions = (stats.aggregates.totalMissions || 0) + run.missions;
  stats.aggregates.totalSkipped = (stats.aggregates.totalSkipped || 0) + run.skipped;
  stats.aggregates.totalFailed = (stats.aggregates.totalFailed || 0) + run.timeouts;
  stats.aggregates.totalGuardianSaves = (stats.aggregates.totalGuardianSaves || 0) + run.guardianSaves;
  stats.aggregates.totalStreakResets = (stats.aggregates.totalStreakResets || 0) + run.streakResets;
  stats.aggregates.totalLivesRegained = (stats.aggregates.totalLivesRegained || 0) + run.livesRegained;
  stats.aggregates.totalAnswersChanged = (stats.aggregates.totalAnswersChanged || 0) + run.answersChanged;
  stats.aggregates.totalLivesLeft = (stats.aggregates.totalLivesLeft || 0) + run.livesLeft;
  stats.aggregates.livesRuns = (stats.aggregates.livesRuns || 0) + 1;
  const covers = stats.aggregates.covers || {};
  walkHistoryOutcomes((rowId, tier) => {
    if (!covers[rowId]) covers[rowId] = { clean: 0, hairline: 0, crack: 0, missions: 0 };
    covers[rowId].missions++;
    covers[rowId][tier]++;
  }, (tier, caught, readable) => {
    stats.aggregates.whoTotal = (stats.aggregates.whoTotal || 0) + 1;
    if (tier === "clean") stats.aggregates.whoCorrect = (stats.aggregates.whoCorrect || 0) + 1;
    stats.aggregates.whoScenesCaught = (stats.aggregates.whoScenesCaught || 0) + caught;
    stats.aggregates.whoScenesReadable = (stats.aggregates.whoScenesReadable || 0) + readable;
  });
  stats.aggregates.covers = covers;
  if (run.missionsTimed > 0) {
    stats.aggregates.totalMissionMs = (stats.aggregates.totalMissionMs || 0) + run.missionMs;
    stats.aggregates.totalTimedMissions = (stats.aggregates.totalTimedMissions || 0) + run.missionsTimed;
  }
  if (run.runMs > 0) {
    stats.aggregates.timedRuns = (stats.aggregates.timedRuns || 0) + 1;
    stats.aggregates.totalRunMs = (stats.aggregates.totalRunMs || 0) + run.runMs;
    stats.aggregates.longestRunMs = Math.max(stats.aggregates.longestRunMs || 0, run.runMs);
    stats.aggregates.shortestRunMs = stats.aggregates.shortestRunMs ? Math.min(stats.aggregates.shortestRunMs, run.runMs) : run.runMs;
  }
  stats.aggregates.bestScore = Math.max(stats.aggregates.bestScore || 0, run.score);
  stats.aggregates.bestRank = betterRank(stats.aggregates.bestRank, run.rank);
  saveStats(stats);
  submitRunRemote(run);
  evaluateAchievements();
}

function resetPool() {
  spent = 0;
  retired = false;
  current = null;
  history = [];
  completedCount = 0;
  cleanStreak = 0;
  regenFired = false;
  skippedCount = 0;
  skippedStack = [];
  awaitingSkipReturn = false;
  guardianSaves = 0;
  guardianStreakResets = 0;
  answersChanged = 0;
  hintsLeft = HINTS_PER_RUN;
  usedLegends = {};
  usedArchetypes = {};
  shownEggs = {};
  pendingEgg = null;
  trainingComplete = false;
  allMissionsCleared = false;
  runRecorded = false;
  runStartedAt = null;
  runTimerStarted = false;
  recentScenarios = [];
  lastCoverId = null;
  lastMode = null;
  briefShown = true;
  setAvatar();
  resetCollapsers();
  renderMission();
  renderDevPanel();
}

