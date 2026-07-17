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
    ? { bg: "#14161a", panel: "#1d2026", ink: "#d8dbe0", accent: "#c9a86a", danger: "#ea7070", win: "#5ec27a", amber: "#e0b94d", muted: "#8a8f99", border: "#2e323b" }
    : { bg: "#f6f4ef", panel: "#ffffff", ink: "#24262a", accent: "#8a621c", danger: "#9c2b2b", win: "#2f7d46", amber: "#946a12", muted: "#6b6f76", border: "#cfc8b8" };
  const blown = outcome === "blown";
  const lines = fullTrendsLines();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const marginX = 20;
  const headerY = 50, avatarX = marginX;
  const remaining = Math.max(POOL_SIZE - spent, 0);
  const rankText = retired ? RANK_NAMES.burned : computeRank();
  const failedCount = timeoutCount();
  const missionsText = `${completedCount} completed · ${skippedCount} skipped` + (failedCount ? ` · ${failedCount} failed` : "");
  const lastRun = (loadStats().runs || []).slice(-1)[0];
  const runTimeText = formatElapsed(lastRun ? lastRun.runMs : elapsedMs());
  const livesValueText = `${remaining} / ${POOL_SIZE}`;
  const livesIcons = Array.from({ length: POOL_SIZE }, (_, i) => i >= POOL_SIZE - spent ? "💀" : "🐱").join("");
  const scoreText = `${computeScore()}`;
  const titleText = "kuri · training report";
  const bannerText = runEndBanner(blown);

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
  ctx.fillStyle = blown ? pal.danger : (completedCount === 0 ? pal.amber : pal.win);
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
