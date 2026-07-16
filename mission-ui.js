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

const MORSE_CODE = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..",
  J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....",
  6: "-....", 7: "--...", 8: "---..", 9: "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
  ":": "---...", ";": "-.-.-.", "(": "-.--.", ")": "-.--.-", "\"": ".-..-.",
};

function toMorse(text) {
  return text.toUpperCase().split(" ").map(word =>
    word.split("").map(ch => MORSE_CODE[ch] || ch).join(" ")
  ).join(" / ");
}

const MORSE_UNIT_MS = 60;
function morseTimeline(text) {
  const segments = [];
  const words = text.toUpperCase().trim().split(/\s+/).filter(Boolean);
  words.forEach((word, wi) => {
    const letters = word.split("").filter(ch => MORSE_CODE[ch]);
    letters.forEach((ch, li) => {
      const code = MORSE_CODE[ch];
      code.split("").forEach((sym, si) => {
        segments.push({ on: true, ms: sym === "." ? MORSE_UNIT_MS : MORSE_UNIT_MS * 3 });
        if (si < code.length - 1) segments.push({ on: false, ms: MORSE_UNIT_MS });
      });
      if (li < letters.length - 1) segments.push({ on: false, ms: MORSE_UNIT_MS * 3 });
    });
    if (wi < words.length - 1) segments.push({ on: false, ms: MORSE_UNIT_MS * 7 });
  });
  return segments;
}

function morseTimelineFrom(segments, offsetMs) {
  let acc = 0;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (acc + seg.ms > offsetMs) {
      return [{ on: seg.on, ms: acc + seg.ms - offsetMs }, ...segments.slice(i + 1)];
    }
    acc += seg.ms;
  }
  return [];
}

let morseAudioCtx = null;
let morsePlayback = null;

function morseIsPlaying(text) {
  return !!(morsePlayback && morsePlayback.text === text && morsePlayback.playing);
}

function morsePlayHtml(text) {
  let symbol = "▶", word = BUTTON_COPY.play;
  if (morseIsPlaying(text)) { symbol = "⏸"; word = BUTTON_COPY.pause; }
  else if (morsePlayback && morsePlayback.text === text && morsePlayback.offsetMs > 0) word = BUTTON_COPY.resume;
  return `<span aria-hidden="true">${symbol}</span> <span class="morse-word">${word}</span>`;
}

function ensureMorseCtx() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!morseAudioCtx) morseAudioCtx = new AudioCtx();
  if (morseAudioCtx.state === "suspended") morseAudioCtx.resume();
  return morseAudioCtx;
}

function stopMorseOsc() {
  if (morsePlayback && morsePlayback.osc) {
    try { morsePlayback.osc.onended = null; morsePlayback.osc.stop(); } catch (e) {}
  }
}

function pauseMorseAudio() {
  const p = morsePlayback;
  if (!p || !p.playing) return;
  p.offsetMs += (morseAudioCtx.currentTime - p.refTime) * 1000;
  p.playing = false;
  stopMorseOsc();
}

function startMorsePlayback(text) {
  const p = morsePlayback;
  const remaining = morseTimelineFrom(morseTimeline(text), p.offsetMs);
  const ctx = morseAudioCtx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 650;
  gain.gain.value = 0;
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  let t = ctx.currentTime + 0.05;
  p.osc = osc;
  p.refTime = t;
  p.playing = true;
  (remaining.length ? remaining : morseTimeline(text)).forEach(seg => {
    gain.gain.setTargetAtTime(seg.on ? 0.25 : 0, t, 0.005);
    t += seg.ms / 1000;
  });
  gain.gain.setTargetAtTime(0, t, 0.005);
  osc.stop(t + 0.05);
  osc.onended = () => {
    if (morsePlayback === p && p.playing) {
      p.playing = false;
      p.offsetMs = 0;
      const btn = document.getElementById("morsePlay");
      if (btn) btn.innerHTML = morsePlayHtml(text);
    }
  };
}

function toggleMorseAudio(text) {
  if (!ensureMorseCtx()) return;
  if (morsePlayback && morsePlayback.playing) {
    pauseMorseAudio();
    return;
  }
  if (!morsePlayback || morsePlayback.text !== text) {
    morsePlayback = { text, offsetMs: 0, playing: false };
  }
  if (!morseTimelineFrom(morseTimeline(text), morsePlayback.offsetMs).length) morsePlayback.offsetMs = 0;
  startMorsePlayback(text);
}

function restartMorseAudio(text) {
  if (!ensureMorseCtx()) return;
  stopMorseOsc();
  morsePlayback = { text, offsetMs: 0, playing: false };
  startMorsePlayback(text);
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

function renderRunEndScreen(area, outcome) {
  const blown = outcome === "blown";
  if (blown) {
    const avatarEl = document.getElementById("avatar");
    if (avatarEl) avatarEl.src = assetImg("coverblown.png");
  }
  const bannerText = OUTCOME_LABEL[blown ? "blown" : "complete"].toUpperCase();
  let html = `<div class="debrief${blown ? " outcome-blown" : ""}">` +
    `<p class="run-end-banner${blown ? " cracked" : ""}">${bannerText}</p>` +
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
  const guardianOn = document.getElementById("guardianToggle").checked;
  renderLivesBar();
  renderTally();
  renderChallengeTimer();
  syncChallengeLock();
  const topSaveBtn = document.getElementById("saveReportBtnTop");
  if (topSaveBtn && !finalised && !trainingComplete) topSaveBtn.classList.add("hidden");
  document.getElementById("newMission").textContent =
    (trainingComplete || !current) ? BUTTON_COPY.startGame : (current.chosen === null && !current.timedOut ? BUTTON_COPY.skipArrow : (retired && guardianOn ? BUTTON_COPY.endRunArrow : BUTTON_COPY.nextMissionArrow));
  document.getElementById("newMission").disabled = finalised || trainingComplete;
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
  if (!current) {
    area.innerHTML = `<p class="sub">Press "<span class="primary">Start Game</span>" to begin.</p>`;
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
  html += `<div class="status-row"><div class="status-line"></div>${timerControlsHtml()}</div>`;
  html += `<div class="controls bottom-controls" role="group" aria-label="mission controls">`;
  if (!resolved && skippedStack.length) html += `<button id="returnBtn" class="back-btn" data-action="return-skipped">↩ Return to skipped</button>`;
  else if (answered && guardianOn && !current.reselecting) html += `<button id="changeAnswerBtn" class="back-btn" data-action="reselect">↺ Change answer</button>`;
  html += `<div class="util">`;
  html += `<button id="nextBtn" class="primary" data-action="next-mission"${current.reselecting ? " disabled" : ""}>${resolved ? (retired && guardianOn ? BUTTON_COPY.endRun : BUTTON_COPY.nextMission) : BUTTON_COPY.skip} →</button>`;
  html += `</div></div>`;
  const leftHint = !resolved && skippedStack.length ? `<kbd>←</kbd> return to skipped`
    : (answered && guardianOn && !current.reselecting ? `<kbd>←</kbd> change answer` : "");
  html += `<div class="kbd-hint"><span>${leftHint}</span><span><kbd>0</kbd> cover · <kbd>1</kbd>–<kbd>${s.options.length}</kbd> select</span><span>skip / next mission <kbd>→</kbd></span></div>`;

  area.innerHTML = html;
  setStatus(missionStatusLine());
  renderChallengeTimer();
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
  history.forEach(h => {
    if (h.timedOut) return;
    if (h.rows && h.rows.length) {
      const spine = h.rows[0];
      bump(spine.rowId, spine.tier);
    } else {
      who.total++;
      const tier = h.total === 0 ? "clean" : "crack";
      if (tier === "clean") who.correct++;
      whoSceneByTier[tier].caught += h.sceneCaught || 0;
      whoSceneByTier[tier].readable += h.sceneReadable || 0;
    }
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
  const timeouts = history.filter(h => h.timedOut).length;
  return { regenFires, livesReclaimed: regenFires * REGEN_LIVES, timeouts, guardianSaves, guardianStreakResets };
}

function fullTrendsLines() {
  const { groups, who } = computeCoverTrendStats();
  const bucketOrder = ["clean", "hairline", "crack"];
  const present = bucketOrder.filter(b => groups[b]);
  const lines = [];
  present.forEach(b => {
    lines.push({ kind: "summary", text: `${TREND_BUCKET_LABEL[b]}: ${groups[b].count}` });
    groups[b].items.forEach(text => lines.push({ kind: "entry", text }));
  });
  const extra = extraRunStats();
  if (extra.regenFires) {
    lines.push({ kind: "summary", text: `${DEBRIEF_COPY.regenRestored} ${extra.livesReclaimed} ${extra.livesReclaimed === 1 ? "life" : "lives"}.` });
  }
  if (extra.guardianSaves || extra.guardianStreakResets) {
    const saveText = extra.guardianSaves ? `${DEBRIEF_COPY.guardianSaved} ${extra.guardianSaves} ${DEBRIEF_COPY.runEndingAnswer}${extra.guardianSaves === 1 ? "" : "s"}` : DEBRIEF_COPY.guardianUsed;
    lines.push({ kind: "summary", text: `${saveText}, ${DEBRIEF_COPY.streakReset} ${extra.guardianStreakResets} time${extra.guardianStreakResets === 1 ? "" : "s"}.` });
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

function loadImagePromise(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function canvasToBlob(canvas) {
  return new Promise(resolve => canvas.toBlob(resolve, "image/png"));
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const wrapped = [];
  let line = "";
  words.forEach(word => {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      wrapped.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) wrapped.push(line);
  return wrapped;
}

function drawStatLine(ctx, label, value, x, y, pal) {
  ctx.font = "bold 10px sans-serif";
  ctx.fillStyle = pal.muted;
  ctx.fillText(label, x, y);
  const labelW = ctx.measureText(label).width;
  ctx.font = "13px sans-serif";
  ctx.fillStyle = pal.ink;
  ctx.fillText(value, x + labelW + 6, y - 1);
  return x + labelW + 6 + ctx.measureText(value).width;
}

function drawReportCanvas(outcome, img) {
  const isDark = document.documentElement.getAttribute("data-theme") !== "light";
  const pal = isDark
    ? { bg: "#14161a", panel: "#1d2026", ink: "#d8dbe0", accent: "#c9a86a", danger: "#ea7070", win: "#5ec27a", muted: "#8a8f99", border: "#2e323b" }
    : { bg: "#f6f4ef", panel: "#ffffff", ink: "#24262a", accent: "#8a621c", danger: "#9c2b2b", win: "#2f7d46", muted: "#6b6f76", border: "#cfc8b8" };
  const blown = outcome === "blown";
  const lines = fullTrendsLines();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const marginX = 20;
  const headerY = 50, avatarX = marginX;
  const remaining = Math.max(POOL_SIZE - spent, 0);
  const rankText = retired ? RANK_NAMES.burned : computeRank();
  const failedCount = history.filter(h => h.timedOut).length;
  const missionsText = `${completedCount} completed · ${skippedCount} skipped` + (failedCount ? ` · ${failedCount} failed` : "");
  const runTimeText = formatElapsed(elapsedMs());
  const livesValueText = `${remaining} / ${POOL_SIZE}`;
  const livesIcons = Array.from({ length: POOL_SIZE }, (_, i) => i >= POOL_SIZE - spent ? "💀" : "🐱").join("");
  const scoreText = `${computeScore()}`;
  const titleText = "kuri · training report";
  const bannerText = OUTCOME_LABEL[blown ? "blown" : "complete"].toUpperCase();

  function statWidth(label, value) {
    ctx.font = "bold 10px sans-serif";
    const labelW = ctx.measureText(label).width;
    ctx.font = "13px sans-serif";
    return labelW + 6 + ctx.measureText(value).width;
  }

  const livesFullText = `${livesValueText}  ${livesIcons}`;
  const livesRowW = statWidth("LIVES", livesFullText);
  const missionsRowW = statWidth("MISSIONS", missionsText);
  const runTimeRowW = statWidth("RUN TIME", runTimeText);
  const scoreW = statWidth("SCORE", scoreText);
  ctx.font = "bold 10px sans-serif";
  const rankLabelW = ctx.measureText("RANK").width;
  ctx.font = "13px sans-serif";
  const rankValueW = ctx.measureText(rankText).width;
  const scoreRankRowW = scoreW + 20 + rankLabelW + 6 + rankValueW;

  ctx.font = "bold 18px sans-serif";
  const titleW = ctx.measureText(titleText).width;
  const bannerW = ctx.measureText(bannerText).width;

  let breakdownW = 0;
  lines.forEach(l => {
    ctx.font = l.kind === "summary" ? "bold 14px sans-serif" : "13px sans-serif";
    const indent = l.kind === "summary" ? 0 : 16;
    breakdownW = Math.max(breakdownW, indent + ctx.measureText(l.text).width);
  });

  const footerText = `kuri ${VERSION} · report date ${formatTimestamp(Date.now())}`;
  ctx.font = "11px sans-serif";
  const footerW = ctx.measureText(footerText).width;

  const statsRowCount = 4;
  const statsRowH = 20;
  const statsBlockH = statsRowCount * statsRowH;
  const avatarSize = statsBlockH;
  const statsX = avatarX + avatarSize + 14;

  const contentRight = Math.max(
    statsX + livesRowW,
    statsX + missionsRowW,
    statsX + runTimeRowW,
    statsX + scoreRankRowW,
    marginX + titleW,
    marginX + bannerW,
    marginX + breakdownW,
    marginX + footerW
  );
  const W = Math.min(560, Math.max(380, contentRight + marginX));

  ctx.font = "13px sans-serif";
  const proseLineH = 18;
  const proseLines = [];
  handlerProseLines(outcome).forEach(t => {
    wrapText(ctx, t, W - marginX * 2).forEach(l => proseLines.push(l));
  });

  const lineHeights = lines.map(l => l.kind === "summary" ? 24 : 20);
  const breakdownH = lineHeights.reduce((a, b) => a + b, 0);

  const bannerY = headerY + avatarSize + 34;
  const proseY = bannerY + 34;
  const breakdownY = proseY + proseLines.length * proseLineH + 14;
  const H = Math.max(500, breakdownY + breakdownH + 50);

  canvas.width = W;
  canvas.height = H;

  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(6, 6, W - 12, H - 12);

  ctx.textBaseline = "top";
  ctx.fillStyle = pal.ink;
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(titleText, marginX, 22);

  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(avatarX - 2, headerY - 2, avatarSize + 4, avatarSize + 4);
  if (img) ctx.drawImage(img, avatarX, headerY, avatarSize, avatarSize);

  ctx.textAlign = "left";
  let sy = headerY + 2;
  drawStatLine(ctx, "LIVES", livesFullText, statsX, sy, pal);
  sy += statsRowH;
  drawStatLine(ctx, "MISSIONS", missionsText, statsX, sy, pal);
  sy += statsRowH;
  drawStatLine(ctx, "RUN TIME", runTimeText, statsX, sy, pal);
  sy += statsRowH;
  const afterScore = drawStatLine(ctx, "SCORE", scoreText, statsX, sy, pal);
  drawStatLine(ctx, "RANK", rankText, afterScore + 20, sy, pal);

  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = blown ? pal.danger : pal.win;
  ctx.fillText(bannerText, marginX, bannerY);

  ctx.font = "13px sans-serif";
  ctx.fillStyle = pal.muted;
  let py = proseY;
  proseLines.forEach(l => {
    ctx.fillText(l, marginX, py);
    py += proseLineH;
  });

  ctx.fillStyle = pal.ink;
  let y = breakdownY;
  lines.forEach((l, i) => {
    if (l.kind === "summary") {
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = pal.ink;
    } else {
      ctx.font = "13px sans-serif";
      ctx.fillStyle = pal.muted;
    }
    ctx.fillText(l.text, l.kind === "summary" ? marginX : marginX + 16, y);
    y += lineHeights[i];
  });

  if (shownEggs.over9000) {
    ctx.save();
    ctx.translate(W - 90, 55);
    ctx.rotate(Math.PI / 5);
    ctx.fillStyle = pal.win;
    ctx.fillRect(-80, -12, 160, 24);
    ctx.fillStyle = pal.bg;
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("OVER 9000", 0, -5);
    ctx.textAlign = "left";
    ctx.restore();
  }

  ctx.font = "11px sans-serif";
  ctx.fillStyle = pal.muted;
  ctx.fillText(footerText, marginX, H - 30);

  return canvas;
}

async function saveReport(outcome) {
  const blown = outcome === "blown";
  const imgSrc = blown ? assetImg("coverblown.png") : document.getElementById("avatar").src;
  let img = null;
  try { img = await loadImagePromise(imgSrc); } catch (e) { img = null; }

  let blob = await canvasToBlob(drawReportCanvas(outcome, img));
  if (!blob && img) {
    blob = await canvasToBlob(drawReportCanvas(outcome, null));
  }
  if (!blob) return;

  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  const fname = `kuri-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-${computeScore()}.png`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fname;
  a.click();
  URL.revokeObjectURL(url);
  setStatus(`<span class="report-saved">Report saved: ${fname}</span>`);
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
  if (!RECORDS_ENABLED) return "";
  const stats = loadStats();
  const lines = [];
  const nextRank = nextRankUp(stats);
  if (nextRank) lines.push(`${RECORDS_COPY.nudgeNextRank}${nextRank}`);
  const closest = closestAchievementProgress(stats);
  if (closest) lines.push(`${RECORDS_COPY.nudgeAchievement}${closest.name} (${closest.current}/${closest.target})`);
  if (!lines.length) return "";
  return `<div class="retention-nudge">${lines.map(l => `<p>${l}</p>`).join("")}</div>`;
}

function formatElapsed(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
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
  const remaining = Math.max(POOL_SIZE - spent, 0);
  const lines = [
    "Clean exit on this run.",
    `You closed it out with ${remaining} of ${POOL_SIZE} lives in hand.`,
    rankFlavorLine(),
  ];
  if (completedCount > 0) lines.push(worstCoverFlavor(false));
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

function handleRechooseGuard(idx) {
  const guardianOn = document.getElementById("guardianToggle").checked;
  if (current.chosen === idx) {
    if (!retired && current.reselecting) {
      current.reselecting = false;
      renderMission();
      return false;
    }
    if (retired && guardianOn) {
      guardianSaves++;
      guardianStreakResets++;
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
    const failedPart = challengeEnabled() ? ` · <b>${history.filter(h => h.timedOut).length}</b> failed` : "";
    el.innerHTML = `<span class="stat-label">Missions</span> <b>${completedCount}</b> completed · <b>${skippedCount}</b> skipped${failedPart}`;
  }
  renderRunClock();
  const score = computeScore();
  const sc = document.getElementById("score");
  if (sc) sc.innerHTML = `<span class="stat-label">Score</span> <b>${score}</b>`;
  const rk = document.getElementById("rank");
  if (rk) rk.innerHTML = `<span class="stat-label">Rank</span> <b>${retired ? RANK_NAMES.burned : computeRank()}</b>`;
}

