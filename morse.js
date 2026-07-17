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
