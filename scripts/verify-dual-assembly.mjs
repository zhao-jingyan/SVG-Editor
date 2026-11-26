#!/usr/bin/env node
/**
 * 双装配与兼容性校验（对应 phase_cli_2.md §6）。
 *
 * 输入：doc/transcript/*.txt（只含命令与注释）；运行目录由 doc/transcript/fixtures 复制到
 * 全新临时目录；预期输出在 doc/transcript/expected/ 单独保存；日志写在运行目录之外。
 *
 * 校验项：
 * 1. 全部会话：方式 A（无 --config）与方式 B（--config plugins.config.json）stdout 逐字节相同，
 *    且与 expected/<名>.plugins.out 相同。
 * 2. Phase 1 会话：禁用全部新增插件（plugins.config.empty.json）后，stdout 与
 *    expected/<名>.baseline.out（由 final 标签构建录制）逐字节相同。
 *
 * 用法：
 *   node scripts/verify-dual-assembly.mjs                       校验
 *   node scripts/verify-dual-assembly.mjs --record-baseline <final 构建的 main.js>
 *   node scripts/verify-dual-assembly.mjs --record-plugins      以方式 A 录制 plugins 预期（须人工复核后提交）
 */
import { execFileSync, spawnSync } from "node:child_process";
import {
  cpSync,
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
const transcriptDir = path.join(root, "doc", "transcript");
const expectedDir = path.join(transcriptDir, "expected");
const fixturesDir = path.join(transcriptDir, "fixtures");
const configFull = path.join(root, "plugins.config.json");
const configEmpty = path.join(root, "plugins.config.empty.json");

/** Phase 1 会话：禁用新增插件后须与 final 一致。 */
const phase1Sessions = ["phase1-section6", "phase1-flowchart"];
/** 需要插件才能运行的会话。 */
const pluginSessions = ["box-flowchart", "plugins-session"];
const allSessions = [...phase1Sessions, ...pluginSessions];

function readCommands(name) {
  return (
    readFileSync(path.join(transcriptDir, `${name}.txt`), "utf8")
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.trim().startsWith("#"))
      .join("\n") + "\n"
  );
}

/** 每次运行使用内容相同的全新临时工作目录；输出只在内存里，不写入该目录。 */
function runCli(entry, name, args) {
  const cwd = mkdtempSync(path.join(tmpdir(), "svg-session-"));
  try {
    cpSync(fixturesDir, cwd, { recursive: true });
    const result = spawnSync(process.execPath, [entry, ...args], {
      cwd,
      input: readCommands(name),
      encoding: "utf8",
      timeout: 15_000,
    });
    return {
      status: result.status,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
    };
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

const failureLogDir = mkdtempSync(path.join(tmpdir(), "svg-verify-logs-"));
let failed = false;

function fail(message, detail) {
  failed = true;
  console.error(`FAIL ${message}`);
  if (detail !== undefined) {
    const file = path.join(failureLogDir, `${Date.now()}-${Math.random()}.log`);
    writeFileSync(file, detail);
    console.error(`  详情日志：${file}`);
  }
}

function expectedPath(name, kind) {
  return path.join(expectedDir, `${name}.${kind}.out`);
}

function checkRun(label, run) {
  if (run.status !== 0 || run.stderr !== "") {
    fail(`${label}: status=${run.status} stderr=${JSON.stringify(run.stderr)}`);
    return false;
  }
  return true;
}

function checkEqual(label, actual, expected) {
  if (actual === expected) {
    console.log(`OK ${label}`);
    return;
  }
  fail(label, `--- expected ---\n${expected}\n--- actual ---\n${actual}\n`);
}

function record(kind, producer) {
  mkdirSync(expectedDir, { recursive: true });
  for (const name of kind === "baseline" ? phase1Sessions : allSessions) {
    const run = producer(name);
    if (run.status !== 0 || run.stderr !== "") {
      throw new Error(`录制失败 ${name}: ${run.status} ${run.stderr}`);
    }
    writeFileSync(expectedPath(name, kind), run.stdout);
    console.log(`recorded ${name}.${kind}.out`);
  }
}

const argv = process.argv.slice(2);

if (argv[0] === "--record-baseline") {
  const finalMain = path.resolve(argv[1] ?? "");
  record("baseline", (name) => runCli(finalMain, name, []));
  process.exit(0);
}

console.log("build…");
execFileSync("npm", ["run", "build"], { cwd: root, stdio: "pipe" });

if (argv[0] === "--record-plugins") {
  record("plugins", (name) => runCli(mainJs, name, []));
  process.exit(0);
}

for (const name of allSessions) {
  const wayA = runCli(mainJs, name, []);
  const wayB = runCli(mainJs, name, ["--config", configFull]);

  if (!checkRun(`${name} A`, wayA) || !checkRun(`${name} B`, wayB)) {
    continue;
  }

  checkEqual(`${name}: 方式 A 与方式 B 逐字节一致`, wayA.stdout, wayB.stdout);
  checkEqual(
    `${name}: 与 expected/${name}.plugins.out 一致`,
    wayA.stdout,
    readFileSync(expectedPath(name, "plugins"), "utf8"),
  );
}

for (const name of phase1Sessions) {
  const run = runCli(mainJs, name, ["--config", configEmpty]);

  if (!checkRun(`${name} 空配置`, run)) {
    continue;
  }

  checkEqual(
    `${name}: 禁用全部插件后与 final 输出（expected/${name}.baseline.out）逐字节一致`,
    run.stdout,
    readFileSync(expectedPath(name, "baseline"), "utf8"),
  );
}

if (failed) {
  process.exit(1);
}

rmSync(failureLogDir, { recursive: true, force: true });

console.log("dual-assembly verification passed");
