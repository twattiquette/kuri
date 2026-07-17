function imposterRevealText(tell, profileName, realName, crackTags) {
  return `${tell}. That isn't ${profileName}; that's ${realName} wearing ${profileName}'s coat, and the stitching gave on ${listJoin(crackTags)}.`;
}

function whodunnitEpilogue(scenario, cast) {
  if (scenario.epilogue) return scenario.epilogue;
  const S = scenario.suspects;
  const archName = a => (COVERS[a] ? COVERS[a].name : FACETS[a].name);
  const profileName = archName(scenario.archetype);
  const tags = scenario.sceneTags || scenario.beatPrompts.map((_, i) => `scene ${i + 1}`);
  const crackTags = cast.tiers[cast.imposter]
    .map((t, i) => (t === "crack" ? tags[i] : null)).filter(Boolean);
  const slips = cast.herringByScene.map((si, sc) => `${S[si].name} drifted on ${tags[sc]} once`);
  const reveal = `${S[cast.imposter].name} ${imposterRevealText(scenario.imposterTell, profileName, archName(cast.imposterArchetype), crackTags)}`;
  const herrings = `${listJoin(slips)}, however one tell isn't a pattern. The consistent scene cracks revealed the imposter.`;
  return `${reveal}\n\n${herrings}`;
}

function beatTell(cast, i) {
  const e = cast.tiers.map(t => TIER_VALUE[t[i]]);
  const max = Math.max(...e);
  if (max === 0) return "neither";
  const leaders = e.reduce((acc, v, idx) => (v === max ? acc.concat(idx) : acc), []);
  return leaders.length === 1 ? String(leaders[0]) : "neither";
}

function readScore(picks, tell) {
  if (!picks || !picks.length || !picks.includes(tell)) return 0;
  return picks.length === 1 ? 5 : 2;
}

function renderWhodunnitMission(area) {
  const s = current.scenario;
  if (!current.beatReads) current.beatReads = s.beatPrompts.map(() => []);
  const answered = current.chosen !== null;
  const resolved = answered || current.timedOut;
  const guardianOn = toggleOn("guardian");

  let html = missionHeader(s);
  html += coverProfileCard(current.legend, "THE PROFILE", "the cover one suspect is falsely claiming to hold");
  html += briefBar();
  html += `<div id="briefBody" class="${briefShown ? "" : "hidden"}"><div class="situation">${paras(s.situation)}</div></div>`;
  html += `<h2 class="section-label">SCENES</h2>`;

  s.beatPrompts.forEach((prompt, i) => {
    html += `<div class="beat"><div class="prompt">${i + 1}. ${prompt}</div>`;
    const readCall = resolved ? current.beatReads[i] : null;
    s.suspects.forEach((sus, si) => {
      let chip = "";
      let pick = "";
      if (resolved) {
        const tier = current.cast.tiers[si][i];
        chip = `<span class="tier-tag tier-${tier}">${WHO_TIER_LABEL[tier]}</span>`;
        if (readCall && readCall.includes(String(si))) {
          pick = tier !== "clean"
            ? `<span class="read-pick correct">✓</span> `
            : `<span class="read-pick wrong">✗</span> `;
        }
      }
      html += `<div class="suspect-line"><span class="who">${sus.name}:</span> ${chip}${pick}${current.cast.actions[si][i]}</div>`;
    });
    if (!resolved) {
      const reads = s.suspects.map((sus, si) => [String(si), sus.name]);
      html += `<div class="read-row" role="group" aria-label="who had a tell, up to 2"><span class="read-label">Who had a tell? (up to 2)</span>`;
      reads.forEach(([val, lbl]) => {
        const picked = current.beatReads[i].includes(val);
        const sel = picked ? " selected" : "";
        html += `<button class="read-btn${sel}" data-action="read" data-beat="${i}" data-call="${val}" aria-pressed="${picked}">${lbl}</button>`;
      });
      html += `</div>`;
    } else {
      const missedNames = s.suspects
        .map((sus, si) => (current.cast.tiers[si][i] !== "clean" && !readCall.includes(String(si)) ? sus.name : null))
        .filter(Boolean);
      let line;
      if (readCall && readCall.length) {
        const items = readCall.map(c => {
          const mark = current.cast.tiers[Number(c)][i] !== "clean" ? "✓" : "✗";
          return `${s.suspects[Number(c)].name} ${mark}`;
        });
        line = `Your read: ${listJoin(items)}`;
      } else {
        line = `Your read: none`;
      }
      if (missedNames.length) line += ` you misread ${listJoin(missedNames)}`;
      html += `<div class="read-row"><span class="read-mark">${line}</span></div>`;
    }
    html += `</div>`;
  });

  html += `<h2 class="section-label">WHO DO YOU ACCUSE</h2>`;
  html += `<p class="flavour-note">accuse the suspect you've read as the imposter</p>`;
  html += `<div class="accuse-row" role="group" aria-label="accuse a suspect">`;
  s.suspects.forEach((sus, si) => {
    const isChosen = current.chosen === si;
    const showChosen = isChosen && !current.reselecting;
    const sel = showChosen ? " selected" : "";
    const disabled = (missionInteractable() || (isChosen && retired && guardianOn)) ? "" : "disabled";
    const prefix = showChosen ? "✓ " : `${si + 1}. `;
    html += `<button class="accuse-btn${sel}" data-action="accuse" data-idx="${si}" ${disabled}>${prefix}${sus.name}</button>`;
  });
  html += `</div>`;

  if (current.timedOut) html += renderTimeoutDebrief();
  else if (answered) html += renderWhodunnitDebrief();

  html += bottomBarHtml(answered, resolved, guardianOn, s.suspects.length, "accuse");

  area.innerHTML = html;
  setStatus(missionStatusLine());
  renderChallengeTimer();
}

function readBeat(i, call) {
  if (!current || current.chosen !== null || current.timedOut || retired) return;
  const picks = current.beatReads[i];
  const at = picks.indexOf(call);
  if (at >= 0) picks.splice(at, 1);
  else if (picks.length < 2) picks.push(call);
  renderMission();
}

function accuse(idx) {
  if (!current || current.timedOut) return;
  const guardianOn = toggleOn("guardian");
  const rechoose = current.chosen !== null;
  if (rechoose && !handleRechooseGuard(idx)) return;
  const s = current.scenario;
  const liarIdx = current.cast.imposter;
  const correct = idx === liarIdx;
  const total = correct ? 0 : TIER_VALUE.crack;

  let earned = 0;
  let sceneReadable = 0;
  let sceneCaught = 0;
  s.beatPrompts.forEach((_, i) => {
    const tell = beatTell(current.cast, i);
    earned += readScore(current.beatReads[i], tell);
    if (tell !== "neither") {
      sceneReadable++;
      if (current.beatReads[i].includes(tell)) sceneCaught++;
    }
  });

  const guardianReselect = rechoose && guardianOn && current.reselecting;
  if (rechoose) {
    undoRechoose();
    if (guardianReselect) { cleanStreak = 0; guardianStreakResets++; answersChanged++; }
    current.reselecting = false;
  } else {
    completedCount++;
  }

  current.chosen = idx;
  current.total = total;
  current.rows = [];
  current.readEarned = earned;

  const streakClean = guardianReselect ? false : correct;
  const msTaken = current.startedAt != null ? Date.now() - current.startedAt : 0;
  const regenJustFired = commitChoice(total, streakClean, false, {
    id: s.id,
    cover: COVERS[current.legend.spineId].name,
    optIdx: idx,
    optText: s.suspects[idx].name,
    correct,
    answerChanged: guardianReselect,
    msTaken,
    rows: [],
    total,
    readEarned: earned,
    sceneReadable,
    sceneCaught,
  });

  const remaining = Math.max(POOL_SIZE - spent, 0);
  announce(
    `${correct ? "Correct accusation, no tell." : "Wrong accusation: a tell, cover cracked."} ` +
    (earned ? `${earned} read bonus. ` : "") +
    `${remaining} of ${POOL_SIZE} lives remaining.` +
    (regenJustFired ? " Streak held, a life is restored." : "") +
    (retired && guardianOn ? " That spends your last life. Change this answer to save the cover, or end the run." : "")
  );

  afterChoiceRender(guardianReselect);
}

function renderWhodunnitDebrief() {
  const s = current.scenario;
  const liarIdx = current.cast.imposter;
  const liar = s.suspects[liarIdx];
  const accused = s.suspects[current.chosen];
  const correct = current.chosen === liarIdx;
  let html = `<div class="debrief" id="handlerDebrief" tabindex="-1"><p class="handler-label"><img class="handler-portrait" src="${HANDLER_IMG}" alt="">THE HANDLER</p>`;
  html += `<p class="verdict ${correct ? "clean" : "tell"}">${
    correct
      ? `Correct. You accused ${accused.name}, the imposter.`
      : `Wrong. You accused ${accused.name}, but the imposter was ${liar.name}. That misread is a tell on you.`
  }</p>`;
  const archName = COVERS[current.legend.spineId].name;
  const impArch = current.cast.imposterArchetype;
  const liarReal = COVERS[impArch] ? COVERS[impArch].name : FACETS[impArch].name;
  html += `<p>${liar.name} was only faking ${archName}: the slips read like ${liarReal}. The others were just being themselves.</p>`;
  html += `<h2 class="section-label">Suspect reads</h2>`;
  if (s.imposterTell) {
    const tags = s.sceneTags || s.beatPrompts.map((_, i) => `scene ${i + 1}`);
    const readMark = (si, sc) => (((current.beatReads && current.beatReads[sc]) || []).includes(String(si)) ? "✓" : "✗");
    const crackScenes = current.cast.tiers[liarIdx].map((t, i) => (t === "crack" ? i : -1)).filter(i => i >= 0);
    const crackLabels = crackScenes.map(sc => `<span class="tier-tag tier-crack">${WHO_TIER_LABEL.crack}</span><span class="read-result">${readMark(liarIdx, sc)}</span>`).join(" ");
    const crackTags = crackScenes.map(i => tags[i]);
    html += `<p class="tell-line"><span class="who">${liar.name}:</span> ${crackLabels} ${imposterRevealText(s.imposterTell, archName, liarReal, crackTags)}</p>`;
    s.beatPrompts.forEach((_, sc) => {
      s.suspects.forEach((sus, si) => {
        if (si !== liarIdx && current.cast.tiers[si][sc] === "hairline") {
          html += `<p class="tell-line"><span class="who">${sus.name}:</span> <span class="tier-tag tier-hairline">${WHO_TIER_LABEL.hairline}</span><span class="read-result">${readMark(si, sc)}</span> drifted on ${tags[sc]}.</p>`;
        }
      });
    });
    html += `<p class="reveal-para">One tell isn't a pattern. The consistent scene cracks revealed the imposter.</p>`;
  } else {
    const epilogue = whodunnitEpilogue(s, current.cast);
    if (epilogue) epilogue.split("\n\n").forEach(para => { html += `<p class="reveal-para">${para}</p>`; });
  }
  if (current.readEarned) html += `<p class="read-bonus">Read bonus: +${current.readEarned} for catching tells scene by scene.</p>`;
  html += `</div>`;
  return html;
}

