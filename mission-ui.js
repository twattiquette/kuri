function timerControlsHtml() {
  return `<span class="challenge-timer" aria-hidden="true"></span>`;
}

function formatClock(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function renderRunClock() {
  const el = document.getElementById("runClock");
  if (!el || trainingComplete || retired) return;
  el.innerHTML = `<span class="stat-label">Run time</span> <b>${formatClock(elapsedMs())}</b>`;
}

function renderTimeoutDebrief() {
  return `<div class="debrief" id="handlerDebrief" tabindex="-1"><p class="handler-label"><img class="handler-portrait" src="${HANDLER_IMG}" alt="">THE HANDLER</p>` +
    `<p class="verdict tell">Time ran out. You hesitated, the moment passed, and the room noticed. Cover exposed, one life lost.</p></div>`;
}

function setAvatar() {
  const img = document.getElementById("avatar");
  if (img) img.src = AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)];
}

function renderLivesBar() {
  const remaining = Math.max(POOL_SIZE - spent, 0);
  const bar = document.getElementById("livesBar");
  bar.setAttribute("role", "img");
  bar.setAttribute("aria-label", `Lives: ${remaining} of ${POOL_SIZE} remaining`);
  let html = `<span class="stat-label">Lives</span><b>${remaining} / ${POOL_SIZE}</b> <span class="hearts" aria-hidden="true">`;
  for (let i = 0; i < POOL_SIZE; i++) {
    html += `<span class="pool-life">${i >= POOL_SIZE - spent ? "💀" : "🐱"}</span>`;
  }
  html += `</span>`;
  bar.innerHTML = html;
}

function announce(text) {
  document.getElementById("announcer").textContent = text;
}

function splitFlavor(text) {
  const m = text.match(/^(.*?[.!?])\s+(.*)$/s);
  return m ? [m[1], m[2]] : [text, null];
}

function coverProfileCard(legend, label, sub, imgOverride, flavorOverride) {
  const headLabel = label || "YOUR COVER IDENTITY";
  const headSub = sub || "";
  const spine = COVERS[legend.spineId] || FACETS[legend.spineId];
  const nameLine = `<span class="cover-name">${spine.name}</span>`;
  const [spineFirst, spineRest] = splitFlavor(flavorOverride || spine.flavor);
  let lines = `<div class="flavor">${spineFirst}</div>`;
  if (spineRest) lines += `<div class="flavor">${spineRest}</div>`;
  legend.facetIds.forEach(f => {
    const [facetFirst, facetRest] = splitFlavor(FACETS[f].flavor);
    lines += `<div class="flavor facet-flavor"><span class="facet-name">${FACETS[f].name}</span>: ${facetFirst}</div>`;
    if (facetRest) lines += `<div class="flavor facet-flavor">${facetRest}</div>`;
  });
  let portraits = `<img src="${imgOverride || spine.img}" alt="${spine.name} portrait">`;
  if (legend.facetIds.length) {
    portraits += `<div class="facet-row">`;
    legend.facetIds.forEach(f => {
      portraits += `<img class="facet-portrait" src="${FACETS[f].img}" alt="${FACETS[f].name} trait portrait">`;
    });
    portraits += `</div>`;
  }
  const head = `<h2 class="section-label">${headLabel}</h2>` +
    (headSub ? `<p class="flavour-note">${headSub}</p>` : "");
  return `${head}<div class="card" id="coverCard" tabindex="-1"><div class="portraits">${portraits}</div><div><div>${nameLine}</div>${lines}</div></div>`;
}

function setStatus(text) {
  document.querySelectorAll(".status-line").forEach(el => { el.innerHTML = text; });
}

function paras(text, transform) {
  return text.split(/\n\n+/).map(p => `<p>${transform ? transform(p.trim()) : p.trim()}</p>`).join("");
}

function missionHeader(s) {
  return `<div class="mission-id" id="missionId" tabindex="-1">` +
    `<span><span class="stat-label">Current mission</span> <b>${s.id}</b></span>` +
    `</div>`;
}

function renderChallengeTimer() {
  const counting = challengeCountingDown();
  const frozen = !counting && challengeEnabled() && !!current && (current.chosen !== null || current.timedOut)
    && current.challengeMsLeft != null && !isFinalised() && !trainingComplete && !pendingEgg;
  document.querySelectorAll(".challenge-timer").forEach((el) => {
    if (!counting && !frozen) {
      el.textContent = "";
      el.classList.remove("challenge-urgent", "challenge-paused");
      return;
    }
    const secs = Math.max(0, Math.ceil(current.challengeMsLeft / 1000));
    el.textContent = `${secs} ⏱`;
    el.classList.toggle("challenge-urgent", counting && secs <= 10);
    el.classList.toggle("challenge-paused", frozen);
  });
}

let briefShown = true;
function briefBar() {
  const label = briefShown ? BUTTON_COPY.hide : BUTTON_COPY.show;
  const caret = briefShown ? "▾" : "▸";
  return `<div class="collapse-bar brief-bar"><h2 class="section-label">THE BRIEF</h2>` +
    `<button type="button" class="section-toggle" id="briefToggle" data-action="brief-toggle" aria-controls="briefBody" aria-expanded="${briefShown}">` +
    `<span class="caret" aria-hidden="true">${caret}</span>${label} brief</button></div>`;
}

function renderScoreEgg(area, egg) {
  let html = `<div class="blown score-egg"><img class="blown-img" src="${egg.img}" alt=""><p class="blown-caption">${egg.caption}</p></div>`;
  html += `<div class="status-row"><div class="status-line score-egg"></div>${timerControlsHtml()}</div>`;
  html += `<div class="controls bottom-controls" role="group" aria-label="run controls">`;
  if (skippedStack.length) html += `<button id="returnBtn" class="back-btn" data-action="return-skipped">↩ Return to skipped</button>`;
  html += `<div class="util"><button id="newMissionBottom" class="primary" data-action="next-mission">${BUTTON_COPY.nextMissionArrow}</button></div>`;
  html += `</div>`;
  area.innerHTML = html;
  setStatus(egg.status);
  renderChallengeTimer();
}

function runEndBanner(blown) {
  if (!blown && completedCount <= skippedCount + timeoutCount()) return WENT_TO_GROUND_BANNER.toUpperCase();
  return OUTCOME_LABEL[blown ? "blown" : "complete"].toUpperCase();
}

function renderRunEndScreen(area, outcome) {
  const blown = outcome === "blown";
  if (blown) {
    const avatarEl = document.getElementById("avatar");
    if (avatarEl) avatarEl.src = assetImg("coverblown.png");
  }
  const bannerText = runEndBanner(blown);
  let html = `<div class="debrief ${blown ? "outcome-blown" : (completedCount <= skippedCount + timeoutCount() ? "outcome-went-to-ground" : "outcome-complete")}">` +
    `<p class="run-end-banner${blown ? " cracked" : (completedCount <= skippedCount + timeoutCount() ? " went-to-ground" : "")}">${bannerText}</p>` +
    `<p class="handler-label"><img class="handler-portrait" src="${HANDLER_IMG}" alt="">THE HANDLER</p>` +
    `<div class="handler-prose">${handlerProseLines(outcome).map(t => `<p>${t}</p>`).join("")}</div>` +
    runReportHtml() +
    `<p>Press <b>Restart Game</b> to start a new run.</p><p class="sub-hint">Too difficult? Adjust difficulty in ⚙️ options above!</p></div>`;
  html += `<div class="status-row"><div class="status-line${blown ? " retired" : ""}"></div>${timerControlsHtml()}</div>`;
  html += `<div class="controls bottom-controls" role="group" aria-label="run controls">` +
    `<button id="restartBottom" class="danger" data-action="reset-pool">Restart Game</button>` +
    `<button id="saveReportBtn" class="secondary" data-action="save-report" data-outcome="${outcome}">Save Report</button>` +
    `<div class="util"><button id="newMissionBottom" class="primary" data-action="next-mission" disabled>${BUTTON_COPY.startGame}</button></div>` +
    `</div>`;
  area.innerHTML = html;
  setStatus(blown ? "🐾 The Handler's claws come out. \"That's the ninth life. There isn't a tenth.\"" : "");
  renderChallengeTimer();
  const topBtn = document.getElementById("saveReportBtnTop");
  if (topBtn) { topBtn.classList.remove("hidden"); topBtn.dataset.outcome = outcome; }
}

function renderMission() {
  const area = document.getElementById("missionArea");
  const finalised = isFinalised();
  const guardianOn = toggleOn("guardian");
  renderLivesBar();
  renderTally();
  renderChallengeTimer();
  syncChallengeLock();
  const topSaveBtn = document.getElementById("saveReportBtnTop");
  if (topSaveBtn && !finalised && !trainingComplete) topSaveBtn.classList.add("hidden");
  const skipReturnPrompt = !current && awaitingSkipReturn && skippedStack.length > 0;
  document.getElementById("newMission").textContent =
    skipReturnPrompt ? BUTTON_COPY.nextMissionArrow : (trainingComplete || !current) ? BUTTON_COPY.startGame : (current.chosen === null && !current.timedOut ? BUTTON_COPY.skipArrow : (retired && guardianOn ? BUTTON_COPY.endRunArrow : BUTTON_COPY.nextMissionArrow));
  document.getElementById("newMission").disabled = finalised || trainingComplete || skipReturnPrompt;
  document.getElementById("statusLine").classList.toggle("retired", finalised);
  document.getElementById("statusLine").classList.toggle("score-egg", !!pendingEgg);
  if (pendingEgg) {
    const nm = document.getElementById("newMission");
    nm.textContent = BUTTON_COPY.nextMissionArrow;
    nm.disabled = false;
    renderScoreEgg(area, pendingEgg);
    return;
  }
  if (finalised) {
    renderRunEndScreen(area, "blown");
    return;
  }
  if (trainingComplete) {
    renderRunEndScreen(area, "complete");
    return;
  }
  if (skipReturnPrompt) {
    let promptHtml = `<p class="sub">${SKIP_RETURN_PROMPT}</p>`;
    promptHtml += `<div class="controls bottom-controls" role="group" aria-label="run controls">`;
    promptHtml += `<button id="returnBtn" class="back-btn" data-action="return-skipped">↩ Return to skipped</button>`;
    promptHtml += `<div class="util"></div></div>`;
    area.innerHTML = promptHtml;
    setStatus(poolStatusLine());
    return;
  }
  if (!current) {
    area.innerHTML = `<p class="sub">Press "<strong class="primary">Start Game</strong>" to begin.</p>`;
    setStatus(poolStatusLine());
    return;
  }
  const s = current.scenario;
  if (s.mode === "whodunnit") { renderWhodunnitMission(area); return; }
  let html = missionHeader(s);
  html += coverProfileCard(current.legend, null, null, s.morse ? MORSE_IMG : (s.pi ? PI_IMG : null), (s.morse || s.pi) ? EGG_FLAVOR : null);
  const morseHidden = s.morse && !current.morseRevealed;
  html += briefBar();
  html += `<div id="briefBody" class="${briefShown ? "" : "hidden"}">`;
  if (s.morse) html += `<button id="morseToggle" class="decode-toggle" type="button" data-action="morse-toggle" aria-pressed="${!morseHidden}">${morseHidden ? "Decode" : "Hide plain text"}</button> <span class="morse-label">Audio:</span> <button id="morsePlay" class="decode-toggle no-underline" type="button" data-action="morse-play">${morsePlayHtml(s.situation)}</button> <button id="morseRestart" class="decode-toggle no-underline" type="button" data-action="morse-restart" aria-label="restart audio playback"><span aria-hidden="true">↺</span> <span class="morse-word">Restart</span></button>`;
  const situationText = s.level === "Easy" ? s.situation + "\n\n" + EASY_COVER_HINT : s.situation;
  html += `<div class="situation">${paras(situationText, morseHidden ? toMorse : null)}</div>`;
  html += `</div>`;
  html += `<h2 class="section-label">WHAT DO YOU DO</h2>`;
  const facetNote = current.legend.facetIds.length ? " (traits are flavour: play one and it shows)" : "";
  html += `<p class="flavour-note">act out of character and you risk a tell${facetNote}</p>`;
  html += `<div class="options" role="group" aria-label="response options">`;
  s.options.forEach((opt, i) => {
    const isChosen = current.chosen === i;
    const showChosen = isChosen && !current.reselecting;
    const disabled = (missionInteractable() || (isChosen && retired && guardianOn)) ? "" : "disabled";
    const cls = showChosen ? "opt-btn selected" : "opt-btn";
    const prefix = showChosen ? "✓ " : `${i + 1}. `;
    const clean = opt.replace(/^Send /, "");
    const payload = morseHidden ? toMorse(clean) : clean;
    const label = (s.morse || s.pi) ? `Send ${payload}` : payload;
    html += `<button ${disabled} data-action="choose" data-idx="${i}" class="${cls}">${prefix}${label}</button>`;
  });
  html += `</div>`;

  if (current.chosen === null && hintEligible()) {
    html += `<div class="hint-row">`;
    html += `<button id="hintBtn" class="secondary" type="button" data-action="hint" ${hintsLeft <= 0 ? "disabled" : ""}>hint (${hintsLeft})</button>`;
    if (current.hintMessage) html += `<p class="hint-text" role="status">${current.hintMessage}</p>`;
    html += `</div>`;
  }

  if (current.timedOut) {
    html += renderTimeoutDebrief();
  } else if (current.chosen !== null) {
    html += renderDebrief();
  }

  const answered = current.chosen !== null;
  const resolved = answered || current.timedOut;
  html += bottomBarHtml(answered, resolved, guardianOn, s.options.length, "select");

  area.innerHTML = html;
  setStatus(missionStatusLine());
  renderChallengeTimer();
}

function bottomBarHtml(answered, resolved, guardianOn, count, verb) {
  let html = `<div class="status-row"><div class="status-line"></div>${timerControlsHtml()}</div>`;
  html += `<div class="controls bottom-controls" role="group" aria-label="mission controls">`;
  if (!resolved && skippedStack.length) html += `<button id="returnBtn" class="back-btn" data-action="return-skipped">↩ Return to skipped</button>`;
  else if (answered && guardianOn && !current.reselecting) html += `<button id="changeAnswerBtn" class="back-btn" data-action="reselect">↺ Change answer</button>`;
  html += `<div class="util">`;
  html += `<button id="nextBtn" class="primary" data-action="next-mission"${current.reselecting ? " disabled" : ""}>${resolved ? (retired && guardianOn ? BUTTON_COPY.endRun : BUTTON_COPY.nextMission) : BUTTON_COPY.skip} →</button>`;
  html += `</div></div>`;
  const leftHint = !resolved && skippedStack.length ? `<kbd>←</kbd> return to skipped`
    : (answered && guardianOn && !current.reselecting ? `<kbd>←</kbd> change answer` : "");
  html += `<div class="kbd-hint"><span>${leftHint}</span><span><kbd>0</kbd> cover · <kbd>1</kbd>–<kbd>${count}</kbd> ${verb}</span><span>skip / next mission <kbd>→</kbd></span></div>`;
  return html;
}

function renderDebrief() {
  const s = current.scenario;
  let html = `<div class="debrief" id="handlerDebrief" tabindex="-1"><p class="handler-label"><img class="handler-portrait" src="${HANDLER_IMG}" alt="">THE HANDLER</p>`;
  current.rows.forEach(r => {
    const isFacetRow = r.rowId !== current.legend.spineId;
    const tagTier = isFacetRow ? FACET_TIER_SWAP[r.tier] : r.tier;
    const tagLabel = isFacetRow ? FACET_TIER_LABEL[r.tier] : TIER_LABEL[r.tier];
    const tag = `<span class="tier-tag tier-${tagTier}">${tagLabel}</span>`;
    const facetCls = isFacetRow ? " facet-read" : "";
    const line = isFacetRow ? facetDriftLine(r.tier, r.name) : tierLine(r.tier, r.name);
    html += `<p class="handler-read${facetCls}">${tag} ${line}</p>`;
  });
  const epilogue = current.legend.epilogue || s.epilogue;
  if (epilogue) html += `<p>${epilogue}</p>`;
  html += `</div>`;
  return html;
}

const TREND_BUCKET_ORDER = ["clean", "hairline", "crack"];

function computeCoverTrendStats() {
  const stats = {};
  const who = { correct: 0, total: 0 };
  const whoSceneByTier = { clean: { caught: 0, readable: 0 }, crack: { caught: 0, readable: 0 } };
  const bump = (id, tier) => {
    if (!id) return;
    if (!stats[id]) stats[id] = { crack: 0, hairline: 0, clean: 0, missions: 0 };
    stats[id].missions++;
    stats[id][tier]++;
  };
  walkHistoryOutcomes((rowId, tier) => bump(rowId, tier), (tier, caught, readable) => {
    who.total++;
    if (tier === "clean") who.correct++;
    whoSceneByTier[tier].caught += caught;
    whoSceneByTier[tier].readable += readable;
  });
  const sortedIds = Object.keys(stats).sort((a, b) => {
    const crackDiff = (stats[a].crack / stats[a].missions) - (stats[b].crack / stats[b].missions);
    if (crackDiff !== 0) return crackDiff;
    const hairlineDiff = (stats[a].hairline / stats[a].missions) - (stats[b].hairline / stats[b].missions);
    if (hairlineDiff !== 0) return hairlineDiff;
    return stats[a].missions - stats[b].missions;
  });
  const groups = {};
  sortedIds.forEach(id => {
    const name = (COVERS[id] || FACETS[id]).name;
    TREND_BUCKET_ORDER.forEach(tier => {
      const count = stats[id][tier];
      if (!count) return;
      if (!groups[tier]) groups[tier] = { count: 0, items: [] };
      groups[tier].count += count;
      groups[tier].items.push(`${name}: ${TREND_BUCKET_VERB[tier]} in ${count}/${stats[id].missions}`);
    });
  });
  if (who.total) {
    const whoByTier = { clean: who.correct, crack: who.total - who.correct };
    ["clean", "crack"].forEach(tier => {
      const count = whoByTier[tier];
      if (!count) return;
      if (!groups[tier]) groups[tier] = { count: 0, items: [] };
      groups[tier].count += count;
      const sc = whoSceneByTier[tier];
      const sceneClause = sc.readable ? ` (${sc.caught}/${sc.readable} scenes)` : "";
      groups[tier].items.push(`Imposter: ${WHO_VERB[tier]} in ${count}/${who.total}${sceneClause}`);
    });
  }
  return { groups, who, stats };
}

function extraRunStats() {
  const regenFires = history.filter(h => h.regenApplied).length;
  return { regenFires, livesReclaimed: regenFires * REGEN_LIVES, timeouts: timeoutCount(), guardianSaves, guardianStreakResets, answersChanged };
}

function fullTrendsLines() {
  const { groups, who } = computeCoverTrendStats();
  const present = TREND_BUCKET_ORDER.filter(b => groups[b]);
  const lines = [];
  present.forEach(b => {
    lines.push({ kind: "summary", text: `${TREND_BUCKET_LABEL[b]}: ${groups[b].count}` });
    groups[b].items.forEach(text => lines.push({ kind: "entry", text }));
  });
  const extra = extraRunStats();
  if (extra.regenFires) {
    lines.push({ kind: "summary", text: `${DEBRIEF_COPY.regenRestored} ${extra.livesReclaimed} ${extra.livesReclaimed === 1 ? "life" : "lives"}.` });
  }
  if (extra.answersChanged || extra.guardianSaves || extra.guardianStreakResets) {
    const changeText = extra.answersChanged ? `${DEBRIEF_COPY.guardianChanged} ${extra.answersChanged} answer${extra.answersChanged === 1 ? "" : "s"}` : DEBRIEF_COPY.guardianUsed;
    lines.push({ kind: "summary", text: `${changeText}, ${DEBRIEF_COPY.streakReset} ${extra.guardianStreakResets} time${extra.guardianStreakResets === 1 ? "" : "s"}.` });
    if (extra.guardianSaves) {
      lines.push({ kind: "summary", text: `${extra.guardianSaves} ${DEBRIEF_COPY.runEndingAnswer}${extra.guardianSaves === 1 ? "" : "s"} ${DEBRIEF_COPY.withdrawn}.` });
    }
  }
  if (extra.timeouts) {
    lines.push({ kind: "summary", text: `${DEBRIEF_COPY.challengeClock} ${extra.timeouts} time${extra.timeouts === 1 ? "" : "s"} this run.` });
  }
  return lines;
}

function coverTrendsHtml() {
  return fullTrendsLines().map(l =>
    l.kind === "summary"
      ? `<p class="run-report-summary">${l.text}</p>`
      : `<div class="run-report-entry">${l.text}</div>`
  ).join("");
}

function closestAchievementProgress(stats) {
  if (!ACHIEVEMENTS_ENABLED) return null;
  let best = null;
  ACHIEVEMENTS.forEach(a => {
    if (!a.progress || stats.unlocked.indexOf(a.id) !== -1) return;
    const p = a.progress(stats);
    if (!p || !p.target) return;
    const ratio = clamp01(p.current / p.target);
    if (ratio >= 1) return;
    if (!best || ratio > best.ratio) best = { name: a.name, current: p.current, target: p.target, ratio };
  });
  return best;
}

function nextRankUp(stats) {
  const current = stats.aggregates.bestRank || RANK_NAMES.recruit;
  const idx = RANK_ORDER.indexOf(current);
  if (idx === -1 || idx >= RANK_ORDER.length - 1) return null;
  return RANK_ORDER[idx + 1];
}

function retentionNudgeHtml() {
  return "";
}

function formatElapsed(ms, padMinutes) {
  const s = Math.max(0, Math.round((ms || 0) / 1000));
  const m = Math.floor(s / 60);
  return m > 0 || padMinutes ? `${m}m ${s % 60}s` : `${s}s`;
}

function runReportHtml() {
  return `<div class="run-report">${coverTrendsHtml()}</div>${retentionNudgeHtml()}`;
}

function worstCoverFlavor(blown) {
  const cleanFallback = blown ? DEBRIEF_COPY.cleanFallbackBlown : DEBRIEF_COPY.cleanFallbackComplete;
  const { stats, who } = computeCoverTrendStats();
  const TIER_RANK = { clean: 0, hairline: 1, crack: 2 };
  const worstTierOf = id => stats[id].crack > 0 ? "crack" : stats[id].hairline > 0 ? "hairline" : "clean";

  const candidates = Object.keys(stats).map(id => {
    const tier = worstTierOf(id);
    return {
      name: (COVERS[id] || FACETS[id]).name,
      tier,
      count: stats[id][tier],
      missions: stats[id].missions,
      verb: tier === "crack" ? "cracking" : "going hairline",
    };
  });
  const whoWrong = who.total - who.correct;
  if (whoWrong > 0) {
    candidates.push({ name: "Imposter reads", tier: "crack", count: whoWrong, missions: who.total, verb: "misreading" });
  }
  if (!candidates.length) return cleanFallback;

  let worstTier = "clean";
  candidates.forEach(c => { if (TIER_RANK[c.tier] > TIER_RANK[worstTier]) worstTier = c.tier; });
  if (worstTier === "clean") return cleanFallback;

  const atWorstTier = candidates.filter(c => c.tier === worstTier);
  const worstCount = Math.max(...atWorstTier.map(c => c.count));
  const tied = atWorstTier.filter(c => c.count === worstCount);

  const outingPhrase = (count, missions) => {
    if (missions === 1) return "the one time you played it";
    if (count === missions) return "every time you played it";
    if (count === 1) return "once";
    return "more than once";
  };
  if (tied.length === 1) {
    const c = tied[0];
    return `${c.name} cost you most: ${c.verb} ${outingPhrase(c.count, c.missions)}.`;
  }
  if (tied.length <= 3) {
    const names = tied.map(c => c.name);
    const list = names.length === 2 ? names.join(" and ") : `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
    return `${list} all cost you equally, no single worst.`;
  }
  return `${tied.length} culprits cost you equally, no single worst.`;
}

function handlerProseLines(outcome) {
  if (outcome === "blown") {
    return [
      `${completedCount} mission${completedCount === 1 ? "" : "s"} in before your cover was burnt.`,
      worstCoverFlavor(true),
    ];
  }
  if (completedCount <= skippedCount + timeoutCount()) return [rankFlavorLine()];
  const remaining = Math.max(POOL_SIZE - spent, 0);
  const lines = [
    "Clean exit on this run.",
    `You closed it out with ${remaining} of ${POOL_SIZE} lives in hand.`,
    rankFlavorLine(),
    worstCoverFlavor(false),
  ];
  return lines;
}

function formatTimestamp(ts) {
  const d = new Date(ts);
  const pad2 = n => String(n).padStart(2, "0");
  const offsetMin = -d.getTimezoneOffset();
  const offSign = offsetMin >= 0 ? "+" : "-";
  const offH = Math.floor(Math.abs(offsetMin) / 60);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())} UTC${offSign}${offH}`;
}

function afterChoiceRender(skipFocus) {
  renderMission();
  renderDevPanel();
  renderRecords();
  if (skipFocus) return;
  const debriefEl = document.getElementById("handlerDebrief");
  if (debriefEl) debriefEl.focus({ preventScroll: true });
}

function renderTally() {
  const el = document.getElementById("tally");
  if (el) {
    const failedPart = challengeEnabled() ? ` · <b>${timeoutCount()}</b> failed` : "";
    el.innerHTML = `<span class="stat-label">Missions</span> <b>${completedCount}</b> completed · <b>${skippedCount}</b> skipped${failedPart}`;
  }
  renderRunClock();
  const score = computeScore();
  const sc = document.getElementById("score");
  if (sc) sc.innerHTML = `<span class="stat-label">Score</span> <b>${score}</b>`;
  const rk = document.getElementById("rank");
  if (rk) rk.innerHTML = `<span class="stat-label">Rank</span> <b>${retired ? RANK_NAMES.burned : computeRank()}</b>`;
}

