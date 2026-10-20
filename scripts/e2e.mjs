#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const startupMessage = "svg-editor 0.1 — type 'help' for commands";

function runCli(input) {
  const result = spawnSync(process.execPath, ["dist/main.js"], {
    cwd: repositoryRoot,
    input,
    encoding: "utf8",
    timeout: 15_000,
  });

  assert.equal(
    result.status,
    0,
    `CLI 退出码异常：${result.status}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  assert.equal(result.stderr, "", `CLI 输出了 stderr：\n${result.stderr}`);

  return result.stdout.replace(/^svg> /gm, "").trim().split(/\r?\n/);
}

function assertLines(lines, expected) {
  for (const line of expected) {
    assert.ok(lines.includes(line), `缺少输出行：${line}\n实际输出：\n${lines.join("\n")}`);
  }
}

function assertLinePrefixes(lines, expectedPrefixes) {
  for (const prefix of expectedPrefixes) {
    assert.ok(
      lines.some((line) => line.startsWith(prefix)),
      `缺少以 ${prefix} 开头的输出行\n实际输出：\n${lines.join("\n")}`,
    );
  }
}

console.log("[1/3] 构建 TypeScript");
execFileSync(npmCommand, ["run", "build"], {
  cwd: repositoryRoot,
  stdio: "inherit",
});

const directory = mkdtempSync(join(tmpdir(), "svg-editor-e2e-"));

try {
  const outputPath = join(directory, "editing.svg");
  console.log("[2/3] 验证编辑、显示、撤销与保存");
  const editingLines = runCli([
    "help",
    "init 800 600",
    "create rect bg 0 0 800 600 #ffffff",
    "create g scene",
    "create circle c1 100 100 20 red in scene",
    "create ellipse e1 200 100 30 20 blue in scene",
    "create line l1 0 0 10 10 black in scene",
    "group markers c1 e1",
    "front c1",
    "back c1",
    "move c1 5 5",
    "undo",
    "redo",
    "scale c1 2",
    "undo",
    "set c1 fill #3366ff",
    "delete l1",
    "undo",
    "tree",
    "show c1",
    `save ${outputPath}`,
    "undo",
    "exit",
  ].join("\n"));

  assert.equal(editingLines[0], startupMessage);
  assertLines(editingLines, [
    "Commands:",
    "canvas 800x600 created",
    "rect#bg created",
    "g#scene created",
    "circle#c1 created in g#scene",
    "ellipse#e1 created in g#scene",
    "line#l1 created in g#scene",
    "g#markers created with 2 children",
    "circle#c1 moved to front",
    "circle#c1 moved to back",
    "circle#c1 moved to (105,105)",
    "circle#c1 moved back to (100,100)",
    "circle#c1 moved to (105,105)",
    "circle#c1 scaled by 2",
    "circle#c1 scaled back by 0.5",
    'circle#c1 updated: fill="#3366ff"',
    "line#l1 deleted",
    "line#l1 restored into g#scene",
    "svg (800x600)",
    "circle#c1  parent=g#markers",
    "  cx=105 cy=105 r=20",
    "  fill=#3366ff",
    `saved to ${outputPath} (6 elements)`,
    "error: undo not allowed after io command",
  ]);
  assertLinePrefixes(editingLines, [
    "├── rect#bg",
    "├── g#scene",
    "│   └── line#l1",
    "└── g#markers",
    "    ├── ellipse#e1",
    "    └── circle#c1",
  ]);
  assert.equal(
    editingLines.filter((line) => line.startsWith("error:")).length,
    1,
    "编辑场景只应出现保存后的历史锁错误",
  );

  const saved = readFileSync(outputPath, "utf8");
  assert.match(saved, /<rect id="bg" x="0" y="0" width="800" height="600" fill="#ffffff"\/>/);
  assert.match(saved, /<circle id="c1" cx="105" cy="105" r="20" fill="#3366ff"\/>/);
  assert.match(saved, /<line id="l1" x1="0" y1="0" x2="10" y2="10" stroke="black"\/>/);

  console.log("[3/3] 验证 read、缺 id 警告、默认 save 与 IO 历史锁");
  const inputPath = join(directory, "input.svg");
  writeFileSync(inputPath, [
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">',
    '  <rect x="0" y="0" width="400" height="300" fill="#fff"/>',
    '  <g id="scene"><circle id="c1" cx="10" cy="20" r="5"/></g>',
    '</svg>',
  ].join("\n"), "utf8");

  const ioLines = runCli([
    `read ${inputPath}`,
    "canvas",
    "tree",
    "show c1",
    "save",
    "undo",
    "exit",
  ].join("\n"));

  assertLines(ioLines, [
    "warning: assigned id rect1 to unnamed <rect>",
    `read ${inputPath} (3 elements)`,
    "canvas 400x300",
    "svg (400x300)",
    "circle#c1  parent=g#scene",
    `saved to ${inputPath} (3 elements)`,
    "error: undo not allowed after io command",
  ]);
  assert.match(readFileSync(inputPath, "utf8"), /<rect id="rect1" x="0" y="0" width="400" height="300" fill="#fff"\/>/);

  console.log("E2E 验证通过：编辑闭环、显示、SVG 读写与历史锁均符合预期。");
} finally {
  rmSync(directory, { recursive: true, force: true });
}
