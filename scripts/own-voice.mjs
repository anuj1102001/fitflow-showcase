// Uses your own recordings for the walkthrough narration instead of the synthetic voice.
// Record one file per scene into voice/ named by scene id (voice/intro.m4a, voice/theme.m4a, ...; any format ffmpeg reads),
// reading the lines in scripts/narration.json. Then: node scripts/own-voice.mjs && node scripts/walkthrough.mjs
// Each clip is trimmed of leading/trailing silence, cleaned up (rumble filter, gentle compression) and loudness-normalised.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

const FFMPEG = process.env.FFMPEG_PATH ?? "ffmpeg";
const IN = "voice";
const OUT = ".walkthrough-audio";
const { scenes } = JSON.parse(readFileSync("scripts/narration.json", "utf8"));
mkdirSync(OUT, { recursive: true });

const files = existsSync(IN) ? readdirSync(IN) : [];
const missing = scenes.filter((s) => !files.some((f) => f.replace(/\.[^.]+$/, "") === s.id));
if (missing.length) {
  console.error(`Missing recordings in ${IN}/: ${missing.map((s) => s.id).join(", ")}`);
  process.exit(1);
}

const trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.1";
const filters = `highpass=f=80,${trim},areverse,${trim},areverse,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,loudnorm=I=-16:TP=-1.5:LRA=11`;
const durations = {};
for (const s of scenes) {
  const src = `${IN}/${files.find((f) => f.replace(/\.[^.]+$/, "") === s.id)}`;
  const dst = `${OUT}/${s.id}.mp3`;
  execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-i", src, "-af", filters, "-ac", "1", "-ar", "44100", "-b:a", "128k", dst]);
  const info = spawnSync(FFMPEG, ["-hide_banner", "-i", dst], { encoding: "utf8" }).stderr;
  const [, h, m, sec] = info.match(/Duration: (\d+):(\d+):([\d.]+)/);
  durations[s.id] = +h * 3600 + +m * 60 + +sec;
  console.log(s.id.padEnd(11), durations[s.id].toFixed(2) + "s");
}
writeFileSync(`${OUT}/durations.json`, JSON.stringify(durations, null, 2));
