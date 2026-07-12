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
let usedLegends = {};
let usedArchetypes = {};
let shownEggs = {};
let pendingEgg = null;
let coverAnchorReturn = null;
let coverAnchored = false;
let trainingComplete = false;
let bypassTierGate = false;
let lastScenarioId = null;
let lastCoverId = null;
let lastMode = null;
let runStartedAt = Date.now();

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

const FACET_DRIFT = { grey: 1.0, hairline: 0.3, crack: 0 };

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

const TIER_LABEL = { grey: "cover held", hairline: "hairline tell", crack: "cover cracked" };
const FACET_TIER_LABEL = { grey: "cover drifted", hairline: "hairline drift", crack: "no drift" };
const FACET_TIER_SWAP = { grey: "crack", hairline: "hairline", crack: "grey" };

function tierLine(tier, name) {
  if (tier === "grey") return `That's exactly what ${name} would do; anyone watching saw the cat they expected. No tell given.`;
  if (tier === "hairline") return `${name} might do that, but it takes explaining, and a sharp watcher files it away. A small leak in the cover, and it costs you.`;
  return `${name} would never do that; anyone watching just clocked a different cat under the fur. A clear tell, and it costs you dearly.`;
}

function facetDriftLine(tier, name) {
  if (tier === "grey") return `You played ${name} louder than the cover carrying it. The trait pulled and you followed it; a watcher clocks the drift, and it costs you.`;
  if (tier === "hairline") return `${name} tugs at that one, and it shows, just a little. A watcher might miss it; the Handler doesn't.`;
  return `${name} pulled at that one, and you left it alone. The trait stayed where it belongs, under the cover. No drift.`;
}

function poolStatusLine() {
  const remaining = POOL_SIZE - spent;
  if (retired) return "🐾 COVER BLOWN. The Handler's claws come out. \"That's the ninth life. There isn't a tenth.\"";
  if (regenFired) {
    regenFired = false;
    const hearts = `<span class="regen-streak" title="hold your cover ${REGEN_STREAK_LENGTH} missions in a row to restore a life">${"💗".repeat(REGEN_STREAK_LENGTH)}</span>`;
    return `<span class="regen-fired">🐾 Three covers held in a row. A life is restored.</span> ${hearts}`;
  }
  const parts = [];
  if (remaining <= 4) parts.push(`🐾 The Handler's tail lashes: “Nine lives, ${computeRank()}!”`);
  if (document.getElementById("regenToggle").checked && cleanStreak >= 1 && spent > 0) {
    let hearts = "";
    for (let i = 0; i < REGEN_STREAK_LENGTH; i++) {
      hearts += i < cleanStreak ? "💗" : `<span class="regen-heart-empty">💗</span>`;
    }
    parts.push(`<span class="regen-streak" title="hold your cover ${REGEN_STREAK_LENGTH} missions in a row to restore a life">${hearts}</span>`);
  }
  return parts.join(" ");
}

function registerCleanStreak(clean) {
  if (!clean) { cleanStreak = 0; return false; }
  cleanStreak++;
  if (!document.getElementById("regenToggle").checked) return false;
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
    const ids = unusedIndices(scenario.suspects, used);
    return ids.length ? ids : scenario.suspects.map((_, i) => i);
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

function missionStatusLine() {
  const guardianOn = document.getElementById("guardianToggle").checked;
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

function chooseOption(idx) {
  const guardianOn = document.getElementById("guardianToggle").checked;
  const rechoose = current.chosen !== null;
  if (rechoose && !handleRechooseGuard(idx)) return;
  const timedOut = !rechoose && !!current.timedOut;
  current.timedOut = false;
  const s = current.scenario;
  const rows = computeRows(s, current.legend, idx);
  const rawExposure = rows.reduce((a, r) => a + r.exposure, 0);

  if (rechoose) {
    undoRechoose();
  } else {
    completedCount++;
  }

  const remainingBefore = POOL_SIZE - spent;
  const spineRow = rows.find(r => r.rowId === current.legend.spineId);
  const isMediumFacet = current.legend.facetIds.length === 1;
  const sliver = isMediumFacet ? MEDIUM_SLIVER : HARD_SLIVER;
  let total = !current.legend.facetIds.length
    ? rawExposure
    : ratioCost(rawExposure, missionMaxExposure(s, current.legend), remainingBefore, sliver);
  if (current.legend.facetIds.length && spineRow.tier === "grey") {
    if (isMediumFacet || spent + total >= POOL_SIZE) total = 0;
  }

  current.chosen = idx;
  current.rows = rows;
  current.rawExposure = rawExposure;
  current.total = total;

  spent += total;
  retired = spent >= POOL_SIZE;
  const clean = current.legend.facetIds.length ? spineRow.tier === "grey" : total === 0;
  const regenJustFired = applyCleanStreak(clean);

  history.push({
    id: s.id,
    cover: (COVERS[current.legend.spineId] || FACETS[current.legend.spineId]).name,
    choice: s.options[idx] + (rechoose ? " (dev re-selection)" : "") + (timedOut ? " (timed out)" : ""),
    rows,
    total,
    poolAfter: Math.min(spent, POOL_SIZE),
    regenApplied: regenJustFired,
    timedOut,
  });
  history[history.length - 1].score = computeScore();
  if (retired) recordRunEnd("blown");

  const remaining = Math.max(POOL_SIZE - spent, 0);
  const lifeWord = total === 1 ? "life" : "lives";
  announce(
    `Choice recorded. ${total === 0 ? "No lives lost." : `${total} ${lifeWord} lost.`} ` +
    `${remaining} of ${POOL_SIZE} lives remaining.` +
    (regenJustFired ? " Streak held, a life is restored." : "") +
    (retired && guardianOn ? " That uses your last life. Change this answer to save the cover, or end the run." : "")
  );

  afterChoiceRender();
}

function goBack() {
  if (!current || current.chosen === null) return;
  if (retired && runRecorded) {
    const stats = loadStats();
    const undone = stats.runs.pop();
    if (undone) {
      stats.aggregates.totalRuns = Math.max(0, (stats.aggregates.totalRuns || 0) - 1);
      stats.aggregates.totalMissions = Math.max(0, (stats.aggregates.totalMissions || 0) - (undone.missions || 0));
      saveStats(stats);
    }
    runRecorded = false;
  }
  spent -= current.total;
  if (current.regenApplied) spent += REGEN_LIVES;
  cleanStreak = current.streakBefore || 0;
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

function hintEligible() {
  if (!HINTS_ENABLED) return false;
  if (!current || current.chosen !== null) return false;
  const s = current.scenario;
  if (s.mode === "whodunnit") return false;
  if (s.pi || s.morse) return false;
  return true;
}

function findGreyOptionIndex(scenario, legend) {
  for (let i = 0; i < scenario.options.length; i++) {
    const rows = computeRows(scenario, legend, i);
    const spineRow = rows.find(r => r.rowId === legend.spineId);
    if (spineRow && spineRow.tier === "grey") return i;
  }
  return -1;
}

function useHint() {
  if (hintsLeft <= 0 || !hintEligible()) return;
  const s = current.scenario;
  const idx = findGreyOptionIndex(s, current.legend);
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

function challengeEnabled() {
  const el = document.getElementById("challengeToggle");
  return !!(el && el.checked);
}

function challengeDurationMs() {
  return 60000;
}

function challengeTimeout() {
  if (!current || current.chosen !== null || current.timedOut) return;
  current.timedOut = true;
  renderChallengeTimer();
}

function challengeTick() {
  if (!challengeEnabled() || !current || current.chosen !== null || current.challengeMsLeft == null || current.timedOut) return;
  current.challengeMsLeft -= CHALLENGE_TICK_MS;
  if (current.challengeMsLeft <= 0) {
    current.challengeMsLeft = 0;
    challengeTimeout();
    return;
  }
  renderChallengeTimer();
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
    const greyIdx = grid[legend.spineId].indexOf("grey");
    const droppable = options.map((_, i) => i).filter(i => i !== greyIdx);
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
      if (si === imposter) row.push(sc === holdScene ? "grey" : "crack");
      else row.push(herringByScene[sc] === si ? "hairline" : "grey");
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
    const nonGrey = cast.tiers.map((t, si) => (t[sc] !== "grey" ? si : -1)).filter(i => i >= 0);
    if (nonGrey.length === 1 && nonGrey[0] === cast.imposter) warn(`scene ${sc} singles out the imposter`);
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
  if (!skippedStack.length || retired) return;
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
  if (current && current.chosen === null) {
    skippedCount++;
    skippedStack.push(current);
  }
  let scenario = rawScenario.mode === "whodunnit" && rawScenario.archetypeVariants
    ? pickArchetypeVariant(rawScenario)
    : rawScenario;
  const legend = pickLegend(scenario, avoidCoverId);
  if (scenario.mode !== "whodunnit") scenario = shuffleOptions(scenario, legend);
  current = { scenario, legend, chosen: null, rows: null, total: 0, morseRevealed: false, timedOut: false, challengeMsLeft: challengeDurationMs(), hintMessage: null };
  lastScenarioId = scenario.id;
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

function computeScore() {
  const remaining = Math.max(POOL_SIZE - spent, 0);
  const base = completedCount * 100 - skippedCount * 25;
  const multiplier = 1 + remaining / POOL_SIZE;
  const readBonus = history.reduce((a, h) => a + (h.readEarned || 0), 0);
  return Math.max(0, Math.round(base * multiplier)) + readBonus;
}

const clamp01 = x => Math.max(0, Math.min(1, x));
function computeRatio() {
  const avgExposure = spent / Math.max(completedCount, 1);
  const accuracy  = clamp01(1 - avgExposure / 4);
  const endurance = clamp01(completedCount / 8);
  const skipDrag  = clamp01(1 - skippedCount / 8);
  return accuracy * (0.5 + 0.5 * endurance) * skipDrag;
}

function rankFromRatio(ratio, t) {
  if (ratio >= t.masterSpy) return "Master Spy";
  if (ratio >= t.seniorOperative) return "Senior Operative";
  if (ratio >= t.operative) return "Operative";
  if (ratio >= t.fieldAgent) return "Field Agent";
  if (ratio >= t.trainee) return "Trainee";
  return "Recruit";
}

const RANK_THRESHOLDS = { masterSpy: 0.90, seniorOperative: 0.80, operative: 0.70, fieldAgent: 0.60, trainee: 0.50 };
function computeRank() {
  if (completedCount === 0) return "Recruit";
  return rankFromRatio(computeRatio(), RANK_THRESHOLDS);
}

const GATE_THRESHOLD_PRESETS = {
  default: RANK_THRESHOLDS,
  low:    { masterSpy: 0.80, seniorOperative: 0.70, operative: 0.60, fieldAgent: 0.50, trainee: 0.40 },
  medium: { masterSpy: 0.85, seniorOperative: 0.75, operative: 0.65, fieldAgent: 0.55, trainee: 0.45 },
  high:   RANK_THRESHOLDS,
};
function computeGateRank() {
  if (completedCount === 0) return "Recruit";
  const table = GATE_THRESHOLD_PRESETS[currentPreset] || RANK_THRESHOLDS;
  return rankFromRatio(computeRatio(), table);
}

const RANK_ORDER = ["Recruit", "Trainee", "Field Agent", "Operative", "Senior Operative", "Master Spy"];
function rankAtLeast(minRank) {
  return RANK_ORDER.indexOf(computeGateRank()) >= RANK_ORDER.indexOf(minRank);
}

const RANK_FLAVOR = {
  "Master Spy": "Lives to spare, no wasted motion. Command's taking notice.",
  "Senior Operative": "Strong finish. Cover barely creaked.",
  "Operative": "You spent your share of lives, but you're qualified.",
  "Field Agent": "Close to the wire. Lives ran thin, but you made it out.",
  "Trainee": "You crossed the line running on fumes.",
  "Recruit": "You crossed the line, barely. More training ahead.",
};

const SKIP_ALL_FLAVOR = "You skipped every mission. Can't read a cover you never wear; nothing to grade here.";
const SKIP_HEAVY_FLAVOR = "You skipped more than you played. Hard to judge a cover you barely wore.";
function rankFlavorLine() {
  if (completedCount === 0) return SKIP_ALL_FLAVOR;
  if (skippedCount > completedCount) return SKIP_HEAVY_FLAVOR;
  return RANK_FLAVOR[computeRank()];
}

const TIER_RANK_UNLOCK = {
  "Easy":        "Recruit",
  "Medium":      "Trainee",
  "MediumFacet": "Field Agent",
  "Hard":        "Operative",
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

function newMission() {
  coverAnchored = false;
  if (retired) {
    if (current) { current = null; announce(poolStatusLine()); renderMission(); renderDevPanel(); }
    return;
  }
  const endlessOn = document.getElementById("endlessToggle").checked;
  if (!endlessOn && completedCount + skippedCount >= RUN_MISSION_CAP) {
    trainingComplete = true;
    recordRunEnd("complete");
    current = null;
    announce("Training complete. You've reached the mission cap for this run. Press Restart Game to start a new run.");
    renderMission();
    renderDevPanel();
    renderRecords();
    return;
  }
  if (pendingEgg) {
    const wasEgg = pendingEgg;
    pendingEgg = null;
    if (wasEgg.id === "pi") {
      startScenario(buildEggPi1());
      return;
    }
    if (wasEgg.id === "morse") {
      const morseBuilders = [buildEggMorse1, buildEggMorse2, buildEggMorse3];
      startScenario(morseBuilders[rollInt(3)]());
      return;
    }
  } else {
    const egg = SCORE_EGGS.find(e => !shownEggs[e.id] && (e.exact ? computeScore() === e.threshold : computeScore() > e.threshold));
    if (egg) {
      shownEggs[egg.id] = true;
      pendingEgg = egg;
      renderMission();
      renderDevPanel();
      return;
    }
  }
  let candidates = SCENARIOS.filter(s =>
    availableSpines(s).length > 0 && tierGateCheck(s)
  );
  if (!candidates.length) {
    const unlockedIds = SCENARIOS.filter(s => tierGateCheck(s)).map(s => s.id);
    const cycledUnlocked = unlockedIds.some(id => usedLegends[id] && usedLegends[id].length);
    if (cycledUnlocked) {
      unlockedIds.forEach(id => { usedLegends[id] = []; usedArchetypes[id] = []; });
      candidates = SCENARIOS.filter(s => availableSpines(s).length > 0 && tierGateCheck(s));
    }
  }
  if (!candidates.length) {
    trainingComplete = true;
    recordRunEnd("complete");
    announce("Training complete. Every mission combination has been run. Press Restart Game to start a new run.");
    renderMission();
    renderDevPanel();
    renderRecords();
    return;
  }
  if (completedCount + skippedCount < 3) {
    const easy = candidates.filter(s => s.mode === "full5");
    if (easy.length) candidates = easy;
  }
  const scenarioPool = candidates.length > 1 ? candidates.filter(s => s.id !== lastScenarioId) : candidates;
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
    return parsed;
  } catch (e) {
    return freshStats();
  }
}

function saveStats(obj) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(obj)); } catch (e) {}
}

function rankMeets(rank, minRank) {
  if (!rank) return false;
  return RANK_ORDER.indexOf(rank) >= RANK_ORDER.indexOf(minRank);
}

const ACHIEVEMENTS_ENABLED = false;
const RECORDS_ENABLED = false;
const ACHIEVEMENTS = [
  { id: "first_complete", name: "First Run", desc: "complete a training run without getting caught.",
    check: stats => stats.runs.some(r => r.outcome === "complete") },
  { id: "rank_field_agent", name: "Field Agent", desc: "reach Field Agent rank in a single run.",
    check: stats => rankMeets(stats.aggregates.bestRank, "Field Agent") },
  { id: "rank_operative", name: "Operative", desc: "reach Operative rank in a single run.",
    check: stats => rankMeets(stats.aggregates.bestRank, "Operative") },
  { id: "rank_senior", name: "Senior Operative", desc: "reach Senior Operative rank in a single run.",
    check: stats => rankMeets(stats.aggregates.bestRank, "Senior Operative") },
  { id: "rank_master", name: "Master Spy", desc: "reach Master Spy rank in a single run.",
    check: stats => rankMeets(stats.aggregates.bestRank, "Master Spy") },
  { id: "clean_sheet", name: "Clean Sheet", desc: "complete a run with zero cracks.",
    check: stats => stats.runs.some(r => r.outcome === "complete" && r.cracks === 0) },
  { id: "survivor", name: "Survivor", desc: "complete a run using three lives or fewer.",
    check: stats => stats.runs.some(r => r.outcome === "complete" && r.livesUsed <= 3) },
  { id: "veteran", name: "Veteran", desc: "finish ten training runs.",
    check: stats => (stats.aggregates.totalRuns || 0) >= 10,
    progress: stats => ({ current: stats.aggregates.totalRuns || 0, target: 10 }) },
  { id: "centurion", name: "Centurion", desc: "clear one hundred missions across all runs.",
    check: stats => (stats.aggregates.totalMissions || 0) >= 100,
    progress: stats => ({ current: stats.aggregates.totalMissions || 0, target: 100 }) },
  { id: "high_roller", name: "High Roller", desc: "hit a score of forty or higher.",
    check: stats => (stats.aggregates.bestScore || 0) >= 40,
    progress: stats => ({ current: stats.aggregates.bestScore || 0, target: 40 }) },
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
    announce("Achievement unlocked: " + newlyUnlocked.map(a => a.name).join(", "));
  }
  return newlyUnlocked;
}

function betterRank(a, b) {
  if (!a) return b;
  if (!b) return a;
  return RANK_ORDER.indexOf(b) > RANK_ORDER.indexOf(a) ? b : a;
}

function recordRunEnd(outcome) {
  if (runRecorded) return;
  runRecorded = true;
  const stats = loadStats();
  const run = {
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
  };
  stats.runs.push(run);
  if (stats.runs.length > STATS_RUN_CAP) stats.runs = stats.runs.slice(stats.runs.length - STATS_RUN_CAP);
  stats.aggregates.totalRuns = (stats.aggregates.totalRuns || 0) + 1;
  stats.aggregates.totalMissions = (stats.aggregates.totalMissions || 0) + run.missions;
  stats.aggregates.bestScore = Math.max(stats.aggregates.bestScore || 0, run.score);
  stats.aggregates.bestRank = betterRank(stats.aggregates.bestRank, run.rank);
  saveStats(stats);
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
  guardianSaves = 0;
  hintsLeft = HINTS_PER_RUN;
  usedLegends = {};
  usedArchetypes = {};
  shownEggs = {};
  pendingEgg = null;
  trainingComplete = false;
  runRecorded = false;
  runStartedAt = Date.now();
  lastScenarioId = null;
  lastCoverId = null;
  lastMode = null;
  briefShown = true;
  setAvatar();
  resetCollapsers();
  renderMission();
  renderDevPanel();
}

