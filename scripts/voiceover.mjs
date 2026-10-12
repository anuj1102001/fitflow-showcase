// Generates one narration clip per scene of the walkthrough (scripts/narration.json) into .walkthrough-audio/.
// Needs Python with edge-tts (pip install edge-tts) and ffmpeg (set FFMPEG_PATH). Then run scripts/walkthrough.mjs.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const FFMPEG = process.env.FFMPEG_PATH ?? "ffmpeg";
const PYTHON = process.env.PYTHON ?? "python";
const DIR = ".walkthrough-audio";
const { voice, rate, scenes } = JSON.parse(readFileSync("scripts/narration.json", "utf8"));
mkdirSync(DIR, { recursive: true });

const durations = {};
for (const s of scenes) {
  const file = `${DIR}/${s.id}.mp3`;
  // The speech service drops requests now and then; retry with a short backoff.
  for (let attempt = 1; ; attempt++) {
    try {
      execFileSync(PYTHON, ["-m", "edge_tts", "--voice", voice, `--rate=${rate}`, "--text", s.text, "--write-media", file], { stdio: "pipe" });
      break;
    } catch (e) {
      if (attempt === 6) throw e;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  // ffmpeg prints "Duration: 00:00:05.42" for the input; it exits non-zero without an output, which is fine here.
  const info = spawnSync(FFMPEG, ["-hide_banner", "-i", file], { encoding: "utf8" }).stderr;
  const [, h, m, sec] = info.match(/Duration: (\d+):(\d+):([\d.]+)/);
  durations[s.id] = +h * 3600 + +m * 60 + +sec;
  console.log(s.id, durations[s.id].toFixed(2) + "s");
}
writeFileSync(`${DIR}/durations.json`, JSON.stringify(durations, null, 2));
