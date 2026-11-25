#!/usr/bin/env node
/**
 * 双装配一致性：同一 transcript 在方式 A 与 --config 方式 B 下 stdout 逐字节相同。
 * 另：空配置禁用可选插件时，tree 不应出现 (box) / 行尾 *。
 */
import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mainJs = path.join(root, "dist", "main.js");

function stripPrompt(text) {
  return text.replace(/^svg> /gm, "");
}

function runCli(input, args = [], cwd = root) {
  const result = spawnSync(process.execPath, [mainJs, ...args], {
    cwd,
    input,
    encoding: "utf8",
    timeout: 15_000,
  });
  return {
    status: result.status,
    stdout: stripPrompt(result.stdout ?? ""),
    stderr: result.stderr ?? "",
  };
}

function assertSame(label, a, b) {
  if (a.stdout !== b.stdout) {
    console.error(`FAIL ${label}: stdout differs`);
    console.error("--- way A ---");
    console.error(a.stdout);
    console.error("--- way B ---");
    console.error(b.stdout);
    process.exitCode = 1;
    return false;
  }
  if (a.status !== 0 || b.status !== 0) {
    console.error(`FAIL ${label}: non-zero status A=${a.status} B=${b.status}`);
    process.exitCode = 1;
    return false;
  }
  if (a.stderr !== "" || b.stderr !== "") {
    console.error(`FAIL ${label}: unexpected stderr`);
    console.error(a.stderr || b.stderr);
    process.exitCode = 1;
    return false;
  }
  console.log(`OK ${label}`);
  return true;
}

console.log("build…");
execFileSync("npm", ["run", "build"], { cwd: root, stdio: "pipe" });

const transcripts = [
  "doc/transcript/phase1-baseline.txt",
  "doc/transcript/box-session.txt",
  "doc/transcript/plugins-session.txt",
];

const work = mkdtempSync(path.join(tmpdir(), "svg-dual-"));
try {
  // 固定 dir 列表目录（日志写在 work 外，避免污染）
  const dirListing = path.join(work, "listing");
  mkdirSync(dirListing);
  writeFileSync(path.join(dirListing, "a.txt"), "a\n");
  writeFileSync(path.join(dirListing, "b.txt"), "b\n");

  for (const relative of transcripts) {
    let input = readFileSync(path.join(root, relative), "utf8")
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.trim().startsWith("#"))
      .join("\n");

    if (relative.includes("box-session")) {
      const savePath = path.join(work, "box-out.svg");
      input = input.replace(/save\s+\S+/, `save ${savePath}`);
    }

    const cwd = relative.includes("plugins-session") ? dirListing : root;
    const wayA = runCli(`${input}\n`, [], cwd);
    const wayB = runCli(
      `${input}\n`,
      ["--config", path.join(root, "plugins.config.json")],
      cwd,
    );
    assertSame(relative, wayA, wayB);
  }

  // 禁用可选插件：无 (box)、无 *
  const baselineInput = readFileSync(
    path.join(root, "doc/transcript/phase1-baseline.txt"),
    "utf8",
  )
    .split("\n")
    .filter((line) => line.trim() !== "" && !line.trim().startsWith("#"))
    .join("\n");
  const empty = runCli(`${baselineInput}\n`, [
    "--config",
    path.join(root, "plugins.config.empty.json"),
  ]);
  if (empty.status !== 0) {
    console.error("FAIL empty-config: non-zero status");
    process.exitCode = 1;
  } else if (/\(box\)|\*$/m.test(empty.stdout.split("\n").find((l) => l.includes("svg (")) ?? "")) {
    // 画布行不应带 *
    console.error("FAIL empty-config: unexpected plugin tree markers on canvas");
    console.error(empty.stdout);
    process.exitCode = 1;
  } else if (empty.stdout.includes("(box)") || /(^|\n)[^\n]* \*(?=\n|$)/.test(empty.stdout)) {
    console.error("FAIL empty-config: tree still shows plugin labels");
    console.error(empty.stdout);
    process.exitCode = 1;
  } else {
    console.log("OK empty-config baseline (no plugin tree labels)");
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
}
console.log("dual-assembly verification passed");
