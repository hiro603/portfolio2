import { spawn, execFile } from "node:child_process";
import { watch } from "node:fs";
import path from "node:path";

const SRC = "assets/scss/style.scss";
const OUT = "assets/css/style.css";
const WATCH_DIR = "assets/scss";
const sassBin = path.resolve("node_modules/.bin/sass");

const notify = (title, message) => {
  const esc = (s) => s.replace(/["\\]/g, "\\$&");
  execFile("osascript", [
    "-e",
    `display notification "${esc(message)}" with title "${esc(title)}"`,
  ]);
};

let running = false;
let queued = false;
let timer = null;

const compile = () => {
  if (running) {
    queued = true;
    return;
  }
  running = true;
  const sass = spawn(sassBin, [SRC, OUT]);
  let stderr = "";
  sass.stderr.on("data", (d) => (stderr += d));
  sass.on("exit", (code) => {
    running = false;
    if (code === 0) {
      process.stdout.write(`Compiled ${OUT}\n`);
      notify("Sass ✅", "Compiled style.css");
    } else {
      const msg =
        stderr.split("\n").find((l) => /^Error:/.test(l))?.replace(/^Error:\s*/, "") ||
        "Compile failed";
      process.stderr.write(stderr);
      notify("Sass ❌", msg);
    }
    if (queued) {
      queued = false;
      compile();
    }
  });
};

const schedule = () => {
  clearTimeout(timer);
  timer = setTimeout(compile, 200);
};

watch(WATCH_DIR, { recursive: true }, (_event, filename) => {
  if (filename && filename.endsWith(".scss")) schedule();
});

compile();
process.stdout.write(`Sass watching ${WATCH_DIR} ...\n`);
