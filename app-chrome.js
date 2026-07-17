function renderDevPanel() {
  const panel = document.getElementById("devBody");
  let poolHtml = `<p class="dev-version">Version ${VERSION}</p>`;
  poolHtml += `<p class="dev-version">` +
    `<label class="dev-toggle">id <input type="text" id="devMissionIdInput" size="5"></label> ` +
    `<label class="dev-toggle"><input type="checkbox" id="tierGateToggle" data-change="tier-gate" ${bypassTierGate ? "checked" : ""}> unlock all levels</label>` +
    `</p>`;

  let curHtml = "";
  if (current && current.chosen !== null) {
    if (current.scenario.mode === "whodunnit") {
      const s = current.scenario;
      const liarIdx = current.cast.imposter;
      const accused = s.suspects[current.chosen];
      const right = current.chosen === liarIdx;
      curHtml += `<h2 class="section-label">Scoring</h2>`;
      curHtml += `<table><tr><th>Item</th><th>Result</th><th>Effect</th></tr>`;
      curHtml += `<tr><td>Accuse ${accused.name}</td><td>${right ? "correct" : "wrong"}</td><td>${right ? "cover held" : `cracked (−${TIER_VALUE.crack} lives)`}</td></tr>`;
      s.beatPrompts.forEach((_, i) => {
        const picks = current.beatReads[i];
        const tell = beatTell(current.cast, i);
        const sc = readScore(picks, tell);
        const callName = picks && picks.length ? picks.map(c => s.suspects[Number(c)].name).join(", ") : "none";
        const tellName = s.suspects[Number(tell)] ? s.suspects[Number(tell)].name : "none";
        curHtml += `<tr><td>Scene ${i + 1} read: ${callName}</td><td>tell: ${tellName} ${sc ? "✓" : "✗"}</td><td>${sc ? `+${sc} score` : "0"}</td></tr>`;
      });
      curHtml += `<tr><td colspan="2">Read bonus</td><td>+${current.readEarned || 0} score</td></tr>`;
      curHtml += `<tr><td colspan="2">Lives lost this mission</td><td>${current.total}</td></tr></table>`;
      curHtml += `<p class="dev-version">Casting seed: ${current.cast.seed || "unseeded (Math.random)"}</p>`;
    } else if (current.rows && current.rows.length) {
      const s = current.scenario;
      const ratio = current.legend.facetIds.length > 0;
      curHtml += `<h2 class="section-label">Scoring</h2>`;
      curHtml += `<table><tr><th>Cover identity</th><th>Weight</th><th>Result</th><th>${ratio ? "Exposure" : "Lives lost"}</th></tr>`;
      current.rows.forEach(r => {
        const isFacetRow = r.rowId !== current.legend.spineId;
        const label = isFacetRow
          ? (r.tier === "clean" ? "drift" : r.tier === "crack" ? "no drift" : r.tier)
          : (r.tier === "clean" ? "held" : r.tier);
        curHtml += `<tr><td>${r.name}</td><td>×${r.weight}</td><td>${label}</td><td>${r.exposure}</td></tr>`;
      });
      if (ratio) {
        const max = missionMaxExposure(s, current.legend);
        const rawTotal = current.rawExposure != null ? current.rawExposure : current.rows.reduce((a, r) => a + r.exposure, 0);
        curHtml += `<tr><td colspan="3">Raw exposure (worst option = ${max.toFixed(2)})</td><td>${rawTotal.toFixed(2)}</td></tr>`;
        curHtml += `<tr><td colspan="3">Lives lost</td><td>${current.total}</td></tr></table>`;
      } else {
        curHtml += `<tr><td colspan="3">Lives lost this mission</td><td>${current.total}</td></tr></table>`;
      }
    }
  }

  panel.innerHTML = poolHtml + curHtml;
  const debugLogOutput = document.getElementById("debugLogOutput");
  if (debugLogOutput) debugLogOutput.value = buildDebugLogMarkdown();
}

function truncPreview(text, n) {
  const max = n || 24;
  const clean = String(text == null ? "" : text).trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return (sp > max - 12 ? cut.slice(0, sp) : cut).replace(/\s+$/, "") + "…";
}

function tierGlyph(t) { return t === "clean" ? "✓" : t === "crack" ? "✗" : "~"; }

function debugHistoryLine(h) {
  const cover = h.cover.replace(/^The /, "");
  const opt = h.optIdx != null ? `opt${h.optIdx + 1}` : "";
  const text = truncPreview(h.optText, 16);
  const secs = h.msTaken != null ? ` ${Math.round(h.msTaken / 1000)}s` : "";
  let tiers = "";
  if (h.rows && h.rows.length) {
    tiers = " " + h.rows.map((r, i) => {
      const g = tierGlyph(r.tier);
      return i === 0 ? g : r.name.slice(0, 3) + ":" + g;
    }).join("");
  }
  const who = h.correct != null ? " " + (h.correct ? "✓" : "✗") + (h.readEarned ? `+${h.readEarned}rd` : "") : "";
  const flags = [
    h.regenApplied ? "♻" : "",
    h.timedOut ? "⏱" : "",
    h.answerChanged ? "↺" : "",
  ].filter(Boolean).join("");
  return `${h.id} ${cover} ${opt}"${text}"${secs}${tiers}${who} -${h.total} ${h.poolAfter}/${POOL_SIZE} ${h.score}${flags ? " " + flags : ""}`;
}

function buildDebugLogMarkdown() {
  const remaining = Math.max(POOL_SIZE - spent, 0);
  const lines = [];
  const tierShort = { Easy: "E", Medium: "M", MediumFacet: "MF", Hard: "H" };
  const unlockedLevels = Object.keys(TIER_RANK_UNLOCK).filter(t => rankAtLeast(TIER_RANK_UNLOCK[t])).map(t => tierShort[t] || t);
  lines.push(`kuri ${VERSION} ♥${remaining}/${POOL_SIZE} score:${computeScore()} ${retired ? RANK_NAMES.burned : computeRank()} [${unlockedLevels.join(",")}]`);
  lines.push(`${completedCount}done ${skippedCount}skip guardian:${guardianSaves} changed:${answersChanged} resets:${guardianStreakResets}`);
  const toggles = ["guardian", "regen", "endless", "challenge"]
    .map(k => {
      const on = toggleOn(k);
      const mark = on ? "✓" : "✗";
      if (k === "challenge") {
        const dur = on && current ? challengeDurationMs(current.scenario) : null;
        return `c:${mark}${on && dur ? Math.round(dur / 1000) + "s" : ""}`;
      }
      return `${k[0]}:${mark}`;
    }).join(" ");
  lines.push(`${currentPreset} ${toggles} timeouts:${timeoutCount()} ${formatElapsed(elapsedMs(), true)}`);
  lines.push("");
  if (!history.length) {
    lines.push("no missions yet");
    return "```\n" + lines.join("\n") + "\n```";
  }
  history.slice().reverse().forEach(h => lines.push(debugHistoryLine(h)));
  return "```\n" + lines.join("\n") + "\n```";
}

function formatRecordDate(epoch) {
  const d = new Date(epoch);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function renderCommendations() {
  if (!ACHIEVEMENTS_ENABLED) return;
  const panel = document.getElementById("commendationsPanel");
  if (!panel) return;
  const stats = loadStats();
  const unlocked = Array.isArray(stats.unlocked) ? stats.unlocked : [];
  const catsOpen = !(window.matchMedia && window.matchMedia("(max-width: 560px)").matches);
  let html = `<div class="achievements">` +
    `<div class="achievements-header">${RECORDS_COPY.commendationsHeading} ${unlocked.length} / ${ACHIEVEMENTS.length}` +
    ` <button type="button" class="ach-toggle-all" data-action="ach-toggle-all" aria-expanded="${catsOpen}">${catsOpen ? RECORDS_COPY.collapseAll : RECORDS_COPY.expandAll}</button></div>`;
  ACHIEVEMENT_CATS.forEach(cat => {
    const group = ACHIEVEMENTS.filter(a => a.cat === cat.id);
    if (!group.length) return;
    const catUnlocked = group.filter(a => unlocked.indexOf(a.id) !== -1).length;
    html += `<details class="ach-cat"${catsOpen ? " open" : ""}>` +
      `<summary class="ach-cat-label">${cat.label} <span class="ach-cat-count">${catUnlocked}/${group.length}</span></summary>` +
      `<ul class="achievements-list">`;
    group.forEach(a => {
      const isUnlocked = unlocked.indexOf(a.id) !== -1;
      html += `<li class="${isUnlocked ? "ach-unlocked" : "ach-locked"}">` +
        `<span class="ach-name">${a.name}</span>` +
        `<span class="ach-desc">${a.desc.replace(/\.$/, "")}</span></li>`;
    });
    html += `</ul></details>`;
  });
  html += `</div>`;
  panel.innerHTML = html;
}

function renderRecords() {
  if (!RECORDS_ENABLED) return;
  const panel = document.getElementById("recordsPanel");
  if (!panel) return;
  const stats = loadStats();
  const agg = stats.aggregates || {};
  const note = `<p class="records-note">${RECORDS_COPY.note}` +
    (stats.runs.length ? ` <button type="button" class="records-clear" data-action="records-clear">${RECORDS_COPY.clearBtn}</button>` : ``) +
    `</p>`;
  const heading = `<div class="achievements-header">${RECORDS_COPY.heading}</div>`;
  if (!stats.runs.length) {
    panel.innerHTML = `${heading}<p class="records-empty">${RECORDS_COPY.empty}</p>${note}`;
    renderCommendations();
    return;
  }
  const grp = (title, body) => `<div class="records-group"><div class="records-group-title">${title}</div><div class="records-group-stats stats">${body}</div></div>`;
  const stat = (label, value, tip) => `<span class="stat"${tip ? ` title="${tip}"` : ""}><span class="stat-label">${label}</span> <b>${value}</b></span>`;
  const overallGrp = grp(RECORDS_COPY.groups.overall,
    stat(RECORDS_COPY.stats.bestScore, agg.bestScore || 0) +
    stat(RECORDS_COPY.stats.bestRank, agg.bestRank || "none") +
    stat(RECORDS_COPY.stats.totalRuns, agg.totalRuns || 0) +
    ((agg.livesRuns || 0) ? stat(RECORDS_COPY.stats.avgLives, Math.round((agg.totalLivesLeft / agg.livesRuns) * 10) / 10) : ""));
  const timeGrp = (agg.timedRuns || 0)
    ? grp(RECORDS_COPY.groups.runTime,
        stat(RECORDS_COPY.stats.total, formatElapsed(agg.totalRunMs)) +
        stat(RECORDS_COPY.stats.average, formatElapsed(agg.totalRunMs / agg.timedRuns)) +
        stat(RECORDS_COPY.stats.fastest, formatElapsed(agg.shortestRunMs)) +
        stat(RECORDS_COPY.stats.longest, formatElapsed(agg.longestRunMs)))
    : "";
  const missionsGrp = grp(RECORDS_COPY.groups.missions,
    stat(RECORDS_COPY.stats.total, (agg.totalMissions || 0) + (agg.totalSkipped || 0) + (agg.totalFailed || 0)) +
    stat(RECORDS_COPY.stats.completed, agg.totalMissions || 0) +
    stat(RECORDS_COPY.stats.skipped, agg.totalSkipped || 0) +
    stat(RECORDS_COPY.stats.failed, agg.totalFailed || 0));
  const avgMissionText = (agg.totalTimedMissions || 0)
    ? formatElapsed(agg.totalMissionMs / agg.totalTimedMissions)
    : "–";
  const modesGrp = grp(RECORDS_COPY.groups.modes,
    stat(RECORDS_COPY.stats.guardian, `${agg.totalAnswersChanged || 0} · ${agg.totalGuardianSaves || 0}`, RECORDS_COPY.tips.guardian) +
    stat(RECORDS_COPY.stats.regen, agg.totalLivesRegained || 0, RECORDS_COPY.tips.regen) +
    stat(RECORDS_COPY.stats.streakResets, agg.totalStreakResets || 0) +
    stat(RECORDS_COPY.stats.challenge, `${agg.totalFailed || 0} · ${avgMissionText}`, RECORDS_COPY.tips.challenge));
  const coverIds = Object.keys(agg.covers || {});
  let coversBody = "";
  if (coverIds.length) {
    const c = agg.covers;
    const nameOf = id => (COVERS[id] || FACETS[id]).name.replace(/^The /, "");
    const best = coverIds.slice().sort((a, b) => (c[b].clean / c[b].missions) - (c[a].clean / c[a].missions) || c[b].missions - c[a].missions)[0];
    const worst = coverIds.slice().sort((a, b) => (c[b].crack / c[b].missions) - (c[a].crack / c[a].missions) || c[b].missions - c[a].missions)[0];
    if (c[best].clean > 0) coversBody += stat(RECORDS_COPY.stats.bestHeld, `${nameOf(best)} ${c[best].clean}/${c[best].missions}`);
    if (worst !== best && c[worst].crack > 0) coversBody += stat(RECORDS_COPY.stats.worstCracked, `${nameOf(worst)} ${c[worst].crack}/${c[worst].missions}`);
  }
  if (agg.whoTotal) {
    coversBody += stat(RECORDS_COPY.stats.imposters, `${agg.whoCorrect || 0}/${agg.whoTotal}`, RECORDS_COPY.tips.imposters);
    if (agg.whoScenesReadable) coversBody += stat(RECORDS_COPY.stats.scenes, `${agg.whoScenesCaught || 0}/${agg.whoScenesReadable}`, RECORDS_COPY.tips.scenes);
  }
  const coversGrp = coversBody ? grp(RECORDS_COPY.groups.covers, coversBody) : "";
  const summary = `<div class="records-groups">${overallGrp}${timeGrp}${missionsGrp}${coversGrp}${modesGrp}</div>`;
  const recent = stats.runs.slice(-10).reverse();
  const modeFlags = [["guardian", "g"], ["regen", "r"], ["endless", "e"], ["challenge", "c"]];
  const th = RECORDS_COPY.th;
  const rows = recent.map(run => {
    const isBest = agg.bestScore != null && run.score === agg.bestScore;
    const active = modeFlags.filter(f => run[f[0]]);
    const modeCell = active.length
      ? `<td data-label="${th.mode}" title="${active.map(f => f[0]).join(", ")}">${active.map(f => f[1]).join("")}</td>`
      : `<td data-label="${th.mode}"></td>`;
    return `<tr class="${isBest ? "records-best" : ""}">` +
      `<td data-label="${th.date}">${formatRecordDate(run.ended)}</td>` +
      `<td data-label="${th.outcome}">${OUTCOME_LABEL[run.outcome] || run.outcome}</td>` +
      `<td data-label="${th.lives}">${run.livesLeft == null ? "" : run.livesLeft}</td>` +
      `<td data-label="${th.score}">${run.score}</td>` +
      `<td data-label="${th.rank}">${run.rank || ""}</td>` +
      `<td data-label="${th.runTime}">${run.runMs ? formatElapsed(run.runMs) : ""}</td>` +
      `<td data-label="${th.missions}">${run.missions} · ${run.skipped} · ${run.timeouts}</td>` +
      modeCell +
      `</tr>`;
  }).join("");
  const table = `<div class="records-table-wrap"><table class="records-table"><thead><tr>` +
    `<th>${RECORDS_COPY.th.date}</th><th>${RECORDS_COPY.th.outcome}</th><th>${RECORDS_COPY.th.lives}</th><th>${RECORDS_COPY.th.score}</th><th>${RECORDS_COPY.th.rank}</th><th>${RECORDS_COPY.th.runTime}</th><th>${RECORDS_COPY.th.missions}</th><th>${RECORDS_COPY.th.mode}</th>` +
    `</tr></thead><tbody>${rows}</tbody></table></div>`;
  panel.innerHTML = heading + summary + table + note;
  renderCommendations();
}

const THEME_KEY = "kuri-theme";

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const btn = document.getElementById("themeToggle");
  const next = theme === "dark" ? "light" : "dark";
  btn.innerHTML = theme === "dark"
    ? `<span aria-hidden="true">☀️</span>`
    : `<span aria-hidden="true">🌙</span>`;
  btn.setAttribute("aria-label", `switch to ${next} mode`);
  btn.setAttribute("title", `switch to ${next} mode`);
}

function initTheme() {
  let theme = null;
  try { theme = localStorage.getItem(THEME_KEY); } catch (e) {}
  if (theme !== "light" && theme !== "dark") {
    theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  applyTheme(theme);
}

const collapsers = [];
function initCollapse(toggleId, targetId, noun, opts) {
  opts = opts || {};
  const toggleIds = Array.isArray(toggleId) ? toggleId : [toggleId];
  const toggles = toggleIds.map(id => document.getElementById(id));
  const target = document.getElementById(targetId);
  let shown = !opts.startHidden;
  function apply() {
    target.classList.toggle("hidden", !shown);
    toggles.forEach(toggle => {
      toggle.setAttribute("aria-expanded", shown ? "true" : "false");
      if (!opts.staticLabel) {
        const caret = shown ? "▾" : "▸";
        toggle.innerHTML = '<span class="caret" aria-hidden="true">' + caret + "</span>" +
          (shown ? "Hide " : "Show ") + noun;
      }
    });
  }
  apply();
  toggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      shown = !shown;
      apply();
    });
  });
  if (!opts.persist) collapsers.push(() => { shown = !opts.startHidden; apply(); });
}

function resetCollapsers() {
  collapsers.forEach((reset) => reset());
}

const DIFFICULTY_PRESETS = {
  default: { guardian: false, regen: false, endless: false },
  low: { guardian: true, regen: true, endless: false },
  medium: { guardian: false, regen: true, endless: false },
  high: { guardian: false, regen: false, endless: true },
};
const DIFFICULTY_ORDER = ["default", "low", "medium", "high"];

let currentPreset = "default";
let applyingPreset = false;

function refreshToggleIcons() {
  ["guardian", "regen", "challenge", "endless", "dyslexia"].forEach((key) => {
    const input = document.getElementById(key + "Toggle");
    input.closest(".icon-toggle").classList.toggle("on", input.checked);
  });
}

function syncChallengeLock() {
  const input = document.getElementById("challengeToggle");
  if (!input) return;
  input.disabled = runTimerStarted;
  input.closest(".icon-toggle").classList.toggle("locked", runTimerStarted);
  const sel = document.getElementById("challengeDurationSelect");
  if (sel) {
    sel.disabled = runTimerStarted || !input.checked;
    sel.classList.toggle("cm-off", !input.checked);
    sel.classList.toggle("locked", runTimerStarted);
  }
}

function setPresetLabel(name) {
  currentPreset = name;
  document.getElementById("difficultyCycle").textContent = name;
}

function applyDifficultyPreset(name) {
  applyingPreset = true;
  const preset = DIFFICULTY_PRESETS[name];
  ["guardian", "regen", "endless"].forEach((key) => {
    const input = document.getElementById(key + "Toggle");
    if (input.checked !== preset[key]) {
      input.checked = preset[key];
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
  const cm = document.getElementById("challengeToggle");
  if (cm.checked && !cm.disabled) {
    cm.checked = false;
    cm.dispatchEvent(new Event("change", { bubbles: true }));
  }
  applyingPreset = false;
  setPresetLabel(name);
  refreshToggleIcons();
}

function checkPresetStillMatches() {
  if (applyingPreset || currentPreset === "custom") return;
  const preset = DIFFICULTY_PRESETS[currentPreset];
  const state = {
    guardian: toggleOn("guardian"),
    regen: toggleOn("regen"),
    endless: toggleOn("endless"),
  };
  if (preset.guardian !== state.guardian || preset.regen !== state.regen || preset.endless !== state.endless) {
    setPresetLabel("custom");
  }
}

function initDifficulty() {
  document.getElementById("difficultyCycle").textContent = currentPreset;
  refreshToggleIcons();
}

function onDelegatedClick(e) {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  switch (el.dataset.action) {
    case "choose": chooseOption(parseInt(el.dataset.idx, 10)); break;
    case "accuse": accuse(parseInt(el.dataset.idx, 10)); break;
    case "read": readBeat(parseInt(el.dataset.beat, 10), el.dataset.call); break;
    case "hint": useHint(); break;
    case "brief-toggle": briefShown = !briefShown; renderMission(); break;
    case "morse-toggle": current.morseRevealed = !current.morseRevealed; renderMission(); break;
    case "morse-play":
      toggleMorseAudio(current.scenario.situation);
      el.innerHTML = morsePlayHtml(current.scenario.situation);
      break;
    case "morse-restart": {
      restartMorseAudio(current.scenario.situation);
      const mp = document.getElementById("morsePlay");
      if (mp) mp.innerHTML = morsePlayHtml(current.scenario.situation);
      break;
    }
    case "next-mission": newMission(); break;
    case "reset-pool": resetPool(); break;
    case "records-clear": {
      if (el.dataset.armed) {
        try { localStorage.removeItem(STATS_KEY); } catch (err) {}
        renderRecords();
      } else {
        el.dataset.armed = "1";
        el.textContent = "click again to clear runs and badges";
      }
      break;
    }
    case "ach-toggle-all": {
      const dets = Array.from(document.querySelectorAll("#commendationsPanel details.ach-cat"));
      const anyOpen = dets.some(d => d.open);
      dets.forEach(d => { d.open = !anyOpen; });
      el.textContent = anyOpen ? RECORDS_COPY.expandAll : RECORDS_COPY.collapseAll;
      el.setAttribute("aria-expanded", String(!anyOpen));
      break;
    }
    case "return-skipped": returnToSkipped(); break;
    case "reselect": startReselect(); break;
    case "save-report": saveReport(el.dataset.outcome); break;
    case "theme-toggle": {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      try { localStorage.setItem(THEME_KEY, next); } catch (err) {}
      applyTheme(next);
      break;
    }
    case "difficulty-cycle": {
      const idx = currentPreset === "custom" ? -1 : DIFFICULTY_ORDER.indexOf(currentPreset);
      applyDifficultyPreset(DIFFICULTY_ORDER[(idx + 1) % DIFFICULTY_ORDER.length]);
      break;
    }
    case "ipa-play": {
      if (!window.speechSynthesis) break;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance("curi");
      utter.lang = "en-AU";
      window.speechSynthesis.speak(utter);
      break;
    }
  }
}

function onDelegatedChange(e) {
  const el = e.target;
  switch (el.dataset.change) {
    case "guardian":
      renderMission();
      refreshToggleIcons();
      checkPresetStillMatches();
      break;
    case "regen":
      renderMission();
      refreshToggleIcons();
      checkPresetStillMatches();
      break;
    case "endless":
      refreshToggleIcons();
      checkPresetStillMatches();
      break;
    case "challenge":
      renderChallengeTimer();
      renderTally();
      syncChallengeLock();
      refreshToggleIcons();
      checkPresetStillMatches();
      break;
    case "dyslexia":
      document.documentElement.dataset.dyslexia = el.checked ? "on" : "off";
      refreshToggleIcons();
      checkPresetStillMatches();
      break;
    case "dev":
      document.getElementById("devPanel").classList.toggle("hidden", !el.checked);
      renderMission();
      renderDevPanel();
      break;
    case "tier-gate":
      bypassTierGate = el.checked;
      break;
  }
}

function onMissionIdKeydown(e) {
  if (e.target.id !== "devMissionIdInput" || e.key !== "Enter") return;
  const id = e.target.value.trim();
  if (!id) return;
  const eggId = Object.keys(EGG_BUILDERS).find(k => k.toLowerCase() === id.toLowerCase());
  if (eggId) { startScenario(EGG_BUILDERS[eggId]()); return; }
  const scenario = SCENARIOS.find(s => s.id.toLowerCase() === id.toLowerCase());
  if (!scenario) { announce(`Mission ID not found: ${id}`); return; }
  delete usedLegends[scenario.id];
  startScenario(scenario);
}

function onGameKeydown(e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "select" || tag === "textarea") return;
  if (!current) {
    if (e.key === "ArrowLeft" && awaitingSkipReturn && skippedStack.length) { e.preventDefault(); returnToSkipped(); }
    return;
  }
  const n = parseInt(e.key, 10);
  const missionArea = document.getElementById("missionArea");
  const digitShortcutsAllowed = document.activeElement === document.body || (missionArea && missionArea.contains(document.activeElement));
  if (e.key === "0") {
    const card = document.getElementById("coverCard");
    if (card && digitShortcutsAllowed) {
      e.preventDefault();
      if (coverAnchored) {
        const back = coverAnchorReturn && document.contains(coverAnchorReturn) ? coverAnchorReturn : document.querySelector(".opt-btn:not([disabled])");
        if (back) back.scrollIntoView({ block: "nearest" });
        coverAnchored = false;
      } else {
        coverAnchorReturn = document.activeElement && document.activeElement !== document.body ? document.activeElement : null;
        card.scrollIntoView({ block: "start" });
        coverAnchored = true;
      }
    }
    return;
  }
  const isWhodunnit = current.scenario.mode === "whodunnit";
  const items = isWhodunnit ? current.scenario.suspects : current.scenario.options;
  const selectFn = isWhodunnit ? accuse : chooseOption;
  if (!Number.isNaN(n) && n >= 1 && n <= items.length && digitShortcutsAllowed) {
    e.preventDefault();
    selectFn(n - 1);
    return;
  }
  if (e.key === "ArrowRight") {
    e.preventDefault();
    newMission();
  } else if (e.key === "ArrowLeft") {
    if (((current.chosen === null && !current.timedOut) || pendingEgg) && skippedStack.length) {
      e.preventDefault();
      returnToSkipped();
    } else if (current.chosen !== null && !pendingEgg) {
      const guardianOn = toggleOn("guardian");
      if (guardianOn && !current.reselecting) {
        e.preventDefault();
        startReselect();
      }
    }
  }
}

function initEventDelegation() {
  document.addEventListener("click", onDelegatedClick);
  document.addEventListener("change", onDelegatedChange);
  document.addEventListener("keydown", onGameKeydown);
  document.addEventListener("keydown", onMissionIdKeydown);
}

function init() {
  initCollapse("blurbToggle", "blurb", "intro");
  initCollapse("footerToggle", "footer", "footer");
  if (RECORDS_ENABLED) {
    initCollapse("recordsToggleStats", "recordsPanel", RECORDS_COPY.heading, { startHidden: true });
  } else {
    document.getElementById("recordsToggleStats").classList.add("hidden");
    document.getElementById("recordsPanel").classList.add("hidden");
  }
  if (ACHIEVEMENTS_ENABLED) {
    initCollapse("commendationsToggle", "commendationsPanel", RECORDS_COPY.commendationsHeading, { startHidden: true });
  } else {
    document.getElementById("commendationsToggle").classList.add("hidden");
    document.getElementById("commendationsPanel").classList.add("hidden");
  }
  initCollapse("modeSettingsToggle", "modeSettingsPanel", "", { startHidden: true, staticLabel: true, persist: true });
  setInterval(gameTick, CHALLENGE_TICK_MS);
  initDifficulty();
  initEventDelegation();

  loadStats();
  initTheme();
  setAvatar();
  renderMission();
  renderDevPanel();
  renderRecords();
}

init();
