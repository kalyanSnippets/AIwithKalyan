// Headless Chromium for rendering. Uses CHROME_PATH, then Playwright's browsers
// (PLAYWRIGHT_BROWSERS_PATH, default /opt/pw-browsers), then common system locations,
// then Playwright's own default lookup.
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";

const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };

export function findChrome() {
  const cands = [process.env.CHROME_PATH];
  const pw = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  if (existsSync(pw)) {
    cands.push(join(pw, "chromium"));
    for (const d of readdirSync(pw).filter((d) => d.startsWith("chromium-")).sort().reverse()) cands.push(join(pw, d, "chrome-linux", "chrome"), join(pw, d, "chrome-linux64", "chrome"));
  }
  cands.push("/usr/bin/chromium", "/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
  return cands.find((c) => c && isFile(c)) ?? null;
}

export async function launch() {
  const exe = findChrome();
  return chromium.launch(exe ? { executablePath: exe } : {});
}
