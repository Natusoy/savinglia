import { defineConfig } from "vite";
import { execFileSync } from "node:child_process";
import pkg from "./package.json" with { type: "json" };

let commit = process.env.SAVINGLIA_GIT_COMMIT || process.env.VERCEL_GIT_COMMIT_SHA || "";
if (!commit) {
  try {
    commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    if (execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim()) commit += "-dirty";
  } catch { /* Source upload may not include .git. */ }
}
export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(pkg.version), __GIT_COMMIT__: JSON.stringify(commit) },
});
