function renderDevPanel() {
  const panel = document.getElementById("devBody");
  let poolHtml = `<p class="dev-version">Version ${VERSION}</p>`;
  poolHtml += `<p class="dev-version">` +
    `<label class="dev-toggle">id <input type="text" id="devMissionIdInput" size="5"></label>` +
    `<br><label class="dev-toggle"><input type="checkbox" id="tierGateToggle" ${bypassTierGate ? "checked" : ""}> unlock all levels</label>` +
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
          ? (r.tier === "grey" ? "drift" : r.tier === "crack" ? "no drift" : r.tier)
          : (r.tier === "grey" ? "held" : r.tier);
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
  const tierGateToggle = document.getElementById("tierGateToggle");
  if (tierGateToggle) tierGateToggle.addEventListener("change", (e) => { bypassTierGate = e.target.checked; });
  const EGG_BUILDERS = { EPI1: buildEggPi1, EMC1: buildEggMorse1, EMC2: buildEggMorse2, EMC3: buildEggMorse3 };
  const devMissionIdInput = document.getElementById("devMissionIdInput");
  if (devMissionIdInput) devMissionIdInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const id = devMissionIdInput.value.trim();
    if (!id) return;
    const eggId = Object.keys(EGG_BUILDERS).find(k => k.toLowerCase() === id.toLowerCase());
    if (eggId) { startScenario(EGG_BUILDERS[eggId]()); return; }
    const scenario = SCENARIOS.find(s => s.id.toLowerCase() === id.toLowerCase());
    if (!scenario) { announce(`Mission ID not found: ${id}`); return; }
    delete usedLegends[scenario.id];
    startScenario(scenario);
  });

  const debugLogOutput = document.getElementById("debugLogOutput");
  if (debugLogOutput) debugLogOutput.value = buildDebugLogMarkdown();
}

function debugHistoryLine(h) {
  const tiers = h.rows && h.rows.length ? h.rows.map(r => `${r.name}=${r.tier}`).join(", ") : "";
  const flags = [h.regenApplied ? "regen" : "", h.timedOut ? "timeout" : ""].filter(Boolean).join(" ");
  return `${h.id} · ${h.cover} · "${h.choice}"` +
    (tiers ? ` · ${tiers}` : "") +
    ` · lives lost ${h.total} · pool ${h.poolAfter}/${POOL_SIZE} · score ${h.score}` +
    (flags ? ` · ${flags}` : "");
}

function buildDebugLogMarkdown() {
  const remaining = Math.max(POOL_SIZE - spent, 0);
  const lines = [];
  const unlockedLevels = Object.keys(TIER_RANK_UNLOCK).filter(t => rankAtLeast(TIER_RANK_UNLOCK[t]));
  lines.push(`kuri ${VERSION} · lives ${remaining}/${POOL_SIZE} · score ${computeScore()} · rank ${retired ? "Burn Notice" : computeRank()} · levels unlocked: ${unlockedLevels.join(", ")}`);
  lines.push(`missions ${completedCount} completed · ${skippedCount} skipped · guardian saves ${guardianSaves}`);
  const toggles = ["guardian", "regen", "endless", "challenge"]
    .map(k => `${k}:${document.getElementById(k + "Toggle").checked ? "on" : "off"}`).join(" ");
  lines.push(`preset ${currentPreset} · ${toggles}`);
  lines.push("");
  if (!history.length) {
    lines.push("no missions completed yet this run");
    return lines.join("\n");
  }
  history.slice().reverse().forEach(h => lines.push(debugHistoryLine(h)));
  return lines.join("\n");
}

function formatRecordDate(epoch) {
  const d = new Date(epoch);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function renderAchievementsSection(stats) {
  if (!ACHIEVEMENTS_ENABLED) return "";
  const unlocked = Array.isArray(stats.unlocked) ? stats.unlocked : [];
  const items = ACHIEVEMENTS.map(a => {
    const isUnlocked = unlocked.indexOf(a.id) !== -1;
    return `<li class="${isUnlocked ? "ach-unlocked" : "ach-locked"}">` +
      `<span class="ach-name">${a.name}</span>` +
      `<span class="ach-desc">${a.desc}</span>` +
      `</li>`;
  }).join("");
  return `<div class="achievements">` +
    `<div class="achievements-header">achievements ${unlocked.length} of ${ACHIEVEMENTS.length}</div>` +
    `<ul class="achievements-list">${items}</ul>` +
    `</div>`;
}

function renderRecords() {
  if (!RECORDS_ENABLED) return;
  const panel = document.getElementById("recordsPanel");
  if (!panel) return;
  const stats = loadStats();
  const agg = stats.aggregates || {};
  const note = `<p class="records-note">local personal records, stored on this device only.</p>`;
  const achievements = renderAchievementsSection(stats);
  if (!stats.runs.length) {
    panel.innerHTML = `<p class="records-empty">no runs recorded yet.</p>${achievements}${note}`;
    return;
  }
  const summary = `<div class="records-summary stats">` +
    `<span class="stat"><span class="stat-label">Best score</span> <b>${agg.bestScore || 0}</b></span>` +
    `<span class="stat"><span class="stat-label">Best rank</span> <b>${agg.bestRank || "none"}</b></span>` +
    `<span class="stat"><span class="stat-label">Total runs</span> <b>${agg.totalRuns || 0}</b></span>` +
    `<span class="stat"><span class="stat-label">Total missions</span> <b>${agg.totalMissions || 0}</b></span>` +
    `</div>`;
  const recent = stats.runs.slice(-10).reverse();
  const rows = recent.map(run => {
    const isBest = agg.bestScore != null && run.score === agg.bestScore;
    return `<tr class="${isBest ? "records-best" : ""}">` +
      `<td>${formatRecordDate(run.ended)}</td>` +
      `<td>${run.outcome}</td>` +
      `<td>${run.missions}</td>` +
      `<td>${run.score}</td>` +
      `<td>${run.rank || ""}</td>` +
      `</tr>`;
  }).join("");
  const table = `<table class="records-table"><thead><tr>` +
    `<th>date</th><th>outcome</th><th>missions</th><th>score</th><th>rank</th>` +
    `</tr></thead><tbody>${rows}</tbody></table>`;
  panel.innerHTML = summary + table + achievements + note;
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
  document.getElementById("themeToggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    applyTheme(next);
  });
}

const collapsers = [];
function initCollapse(toggleId, targetId, noun, opts) {
  opts = opts || {};
  const toggle = document.getElementById(toggleId);
  const target = document.getElementById(targetId);
  let shown = !opts.startHidden;
  function apply() {
    target.classList.toggle("hidden", !shown);
    toggle.setAttribute("aria-expanded", shown ? "true" : "false");
    if (!opts.staticLabel) {
      const caret = shown ? "▾" : "▸";
      toggle.innerHTML = '<span class="caret" aria-hidden="true">' + caret + "</span>" +
        (shown ? "Hide " : "Show ") + noun;
    }
  }
  apply();
  toggle.addEventListener("click", () => {
    shown = !shown;
    apply();
  });
  collapsers.push(() => { shown = !opts.startHidden; apply(); });
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
      input.dispatchEvent(new Event("change"));
    }
  });
  applyingPreset = false;
  setPresetLabel(name);
  refreshToggleIcons();
}

function checkPresetStillMatches() {
  if (applyingPreset || currentPreset === "custom") return;
  const preset = DIFFICULTY_PRESETS[currentPreset];
  const state = {
    guardian: document.getElementById("guardianToggle").checked,
    regen: document.getElementById("regenToggle").checked,
    endless: document.getElementById("endlessToggle").checked,
  };
  if (preset.guardian !== state.guardian || preset.regen !== state.regen || preset.endless !== state.endless) {
    setPresetLabel("custom");
  }
}

function initDifficulty() {
  document.getElementById("difficultyCycle").textContent = currentPreset;
  refreshToggleIcons();
  document.getElementById("difficultyCycle").addEventListener("click", () => {
    const idx = currentPreset === "custom" ? -1 : DIFFICULTY_ORDER.indexOf(currentPreset);
    applyDifficultyPreset(DIFFICULTY_ORDER[(idx + 1) % DIFFICULTY_ORDER.length]);
  });
  ["guardianToggle", "regenToggle", "challengeToggle", "endlessToggle", "dyslexiaToggle"].forEach((id) => {
    document.getElementById(id).addEventListener("change", () => {
      refreshToggleIcons();
      checkPresetStillMatches();
    });
  });
}

function init() {
  document.getElementById("newMission").addEventListener("click", newMission);
  document.getElementById("resetPool").addEventListener("click", resetPool);
  initCollapse("blurbToggle", "blurb", "intro");
  initCollapse("footerToggle", "footer", "footer");
  if (RECORDS_ENABLED) {
    initCollapse("recordsToggle", "recordsPanel", "records", { startHidden: true });
  } else {
    document.getElementById("recordsToggle").classList.add("hidden");
    document.getElementById("recordsPanel").classList.add("hidden");
  }
  document.getElementById("ipaPlay").addEventListener("click", () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance("curi");
    utter.lang = "en-AU";
    window.speechSynthesis.speak(utter);
  });
  initCollapse("modeSettingsToggle", "modeSettingsPanel", "", { startHidden: true, staticLabel: true });
  document.getElementById("devToggle").addEventListener("change", (e) => {
    document.getElementById("devPanel").classList.toggle("hidden", !e.target.checked);
    bypassTierGate = e.target.checked;
    renderMission();
    renderDevPanel();
  });
  document.getElementById("guardianToggle").addEventListener("change", renderMission);
  document.getElementById("dyslexiaToggle").addEventListener("change", (e) => {
    document.documentElement.dataset.dyslexia = e.target.checked ? "on" : "off";
  });
  document.getElementById("challengeToggle").addEventListener("change", renderChallengeTimer);
  setInterval(challengeTick, CHALLENGE_TICK_MS);
  initDifficulty();

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "select" || tag === "textarea") return;
    if (!current) return;
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
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      const total = items.length;
      if (current.chosen !== null) {
        const devMode = document.getElementById("devToggle").checked;
        const guardianOn = document.getElementById("guardianToggle").checked;
        if (retired && !guardianOn && !devMode) return;
        const targetIdx = (current.chosen + step + total) % total;
        goBack();
        selectFn(targetIdx);
      } else {
        selectFn(step === 1 ? 0 : total - 1);
      }
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      newMission();
    } else if (e.key === "ArrowLeft") {
      if ((current.chosen === null || pendingEgg) && skippedStack.length) {
        e.preventDefault();
        returnToSkipped();
      }
    }
  });

  loadStats();
  initTheme();
  setAvatar();
  renderMission();
  renderDevPanel();
  renderRecords();
}

init();
