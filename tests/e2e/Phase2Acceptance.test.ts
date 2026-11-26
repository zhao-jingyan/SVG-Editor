import { spawnSync } from "node:child_process";
import {
  chmodSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

/**
 * Phase 2（tag `p2`）黑盒验收：只经 `dist/main.js` 的进程边界验证，按
 * docs/pj1-phase2-2/phase_cli_2.md 第 2–6 节的验收条目逐条对应。
 *
 * 不在本文件重复单元测试已覆盖的内部细节（如 AttributeHandler 抛错回滚、
 * 处理器 ambiguous），那些无法经 CLI 触发，见 tests/core/attributes/。
 */

const repositoryRoot = process.cwd();
const transcriptDir = join(repositoryRoot, "doc", "transcript");
const fixturesDir = join(transcriptDir, "fixtures");
const expectedDir = join(transcriptDir, "expected");
const startupMessage = "svg-editor 1.0.0 — type 'help' for commands";
const stripPrompt = (text: string): string => text.replace(/^svg> /gm, "");

/** 方式 A：不带 --config，使用代码装配的默认插件。 */
const WAY_A: readonly string[] = [];
/** 方式 B：从配置文件装入全部插件。 */
const WAY_B: readonly string[] = ["--config", join(repositoryRoot, "plugins.config.json")];
/** 禁用全部新增插件：Phase 1 基线。 */
const BASELINE: readonly string[] = ["--config", join(repositoryRoot, "plugins.config.empty.json")];

const isRoot = process.getuid?.() === 0;

interface CliRun {
  /** 原始 stdout（含 svg> 提示符），用于与 expected 文件逐字节比较。 */
  readonly raw: string;
  /** 去掉提示符并去除首尾空行后的行列表，用于行级断言。 */
  readonly lines: readonly string[];
  readonly stderrLines: readonly string[];
  readonly status: number | null;
}

interface RunOptions {
  readonly args?: readonly string[];
  readonly cwd?: string;
}

function runCli(commands: readonly string[] | string, options: RunOptions = {}): CliRun {
  const input = Array.isArray(commands) ? commands.join("\n") : commands;
  const result = spawnSync(
    process.execPath,
    [join(repositoryRoot, "dist", "main.js"), ...(options.args ?? WAY_A)],
    {
      cwd: options.cwd ?? repositoryRoot,
      input: `${input}\n`,
      encoding: "utf8",
      timeout: 15_000,
    },
  );
  const raw = result.stdout ?? "";
  return {
    raw,
    lines: stripPrompt(raw).trim().split("\n"),
    stderrLines: (result.stderr ?? "").split("\n").filter((line) => line !== ""),
    status: result.status,
  };
}

/** 读取 transcript：与 verify-dual-assembly 相同，去掉注释与空行。 */
function readSession(name: string): string {
  return (
    readFileSync(join(transcriptDir, `${name}.txt`), "utf8")
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.trim().startsWith("#"))
      .join("\n")
  );
}

const workDirs: string[] = [];

/** 全新空临时目录；测试结束后清理。日志与输出都不写入该目录。 */
function makeWorkDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "svg-accept-"));
  workDirs.push(dir);
  return dir;
}

/** 与 transcript 运行目录相同的固定内容副本。 */
function makeFixtureDir(): string {
  const dir = makeWorkDir();
  cpSync(fixturesDir, dir, { recursive: true });
  return dir;
}

function expectedFile(name: string, kind: "plugins" | "baseline"): string {
  return readFileSync(join(expectedDir, `${name}.${kind}.out`), "utf8");
}

afterEach(() => {
  for (const dir of workDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("验收 §2 命令插件 stats / dir", () => {
  it("help 在方式 A 与 B 下列出 stats 与 dir；空配置下两者都不出现", () => {
    for (const args of [WAY_A, WAY_B]) {
      const run = runCli(["help", "exit"], { args });
      expect(run.lines).toEqual(expect.arrayContaining([
        expect.stringMatching(/^ {2}stats\s+count shapes on the canvas$/),
        expect.stringMatching(/^ {2}dir\s+list files in the working directory$/),
      ]));
    }

    const empty = runCli(["help", "exit"], { args: BASELINE });
    expect(empty.lines.some((line) => /^ {2}(stats|dir)\s/.test(line))).toBe(false);
  });

  it("stats 统计规则：按首次出现排序，box 内部叶子计入，容器单独计数", () => {
    const run = runCli([
      "init",
      "create rect r1 0 0 1 1",
      "create circle c1 1 1 1",
      'create g g1',
      'create text t1 0 0 "hi" in g1',
      'create box b1 0 0 4 4 "x"',
      "stats",
    ]);

    expect(run.lines).toContain("rect: 2  circle: 1  text: 2  (total 5, containers 2)");
  });

  it("空文档输出 (total 0, containers 0)；stats 不进入 undo 栈", () => {
    const empty = runCli(["init", "stats"]);
    expect(empty.lines.at(-1)).toBe("(total 0, containers 0)");

    const run = runCli(["init", "create rect r1 0 0 1 1", "stats", "undo", "stats"]);
    expect(run.lines.slice(-3)).toEqual([
      "rect: 1  (total 1, containers 0)",
      "rect#r1 deleted",
      "(total 0, containers 0)",
    ]);
  });

  it("dir 无需文档即可使用；目录在前、文件在后、码点序；隐藏项列出；符号链接按 [FILE]", () => {
    const dir = makeFixtureDir();
    // 符号链接指向目录也按 [FILE] 显示，不跟随目标
    symlinkSync("Sub", join(dir, "linkdir"));
    symlinkSync("Alpha.txt", join(dir, "linkfile"));

    const run = runCli(["dir", "exit"], { cwd: dir });

    expect(run.lines).toEqual([
      startupMessage,
      "[DIR]  Sub",
      "[FILE] .hidden",
      "[FILE] Alpha.txt",
      "[FILE] beta.txt",
      "[FILE] linkdir",
      "[FILE] linkfile",
      "[FILE] other.svg",
    ]);
  });

  it("dir 不接收参数、空目录输出 (empty directory)", () => {
    const empty = makeWorkDir();
    expect(runCli(["dir"], { cwd: empty }).lines.at(-1)).toBe("(empty directory)");

    const withArgument = runCli(["dir extra", "exit"], { cwd: empty });
    expect(withArgument.lines.at(-1)).toMatch(/^error: /);
  });

  it("已有文档时执行 dir，文档与 undo 历史不变", () => {
    const run = runCli([
      "init",
      "create rect r1 0 0 1 1",
      "dir",
      "undo",
    ], { cwd: makeFixtureDir() });

    expect(run.lines.at(-1)).toBe("rect#r1 deleted");
    expect(run.lines.some((line) => line.startsWith("error:"))).toBe(false);
  });

  it.skipIf(isRoot)("dir 读取失败：输出 error 后仍可执行其他命令", () => {
    const dir = makeWorkDir();
    // 可进入、不可读：chdir 成功，readdir 返回 EACCES
    chmodSync(dir, 0o311);
    try {
      const run = runCli(["dir", "stats", "init", "stats"], { cwd: dir });

      expect(run.lines).toEqual([
        startupMessage,
        `error: cannot read directory: ${realpathSync(dir)}`,
        "error: no document. use 'init' or 'read' first",
        "canvas 800x600 created",
        "(total 0, containers 0)",
      ]);
    } finally {
      chmodSync(dir, 0o755);
    }
  });

  it("未加载 stats/dir 时执行输出 error: unknown command（空配置）", () => {
    const run = runCli(["stats", "dir", "exit"], { args: BASELINE });

    expect(run.lines).toEqual([
      startupMessage,
      "error: unknown command: stats",
      "error: unknown command: dir",
    ]);
  });
});

describe("验收 §3 属性扩展点（set 经处理器与 undo 单元）", () => {
  it("box 的 fill 与 label 各自是一个 undo 单元：undo/redo 逐条恢复", () => {
    const fillOf = (lines: readonly string[]): string | undefined =>
      lines.find((line) => line.includes("rect#n1-rect"))?.match(/fill=(#\w+)/)?.[1];
    const labelOf = (lines: readonly string[]): string | undefined =>
      lines.find((line) => line.includes("text#n1-label"))?.match(/"([^"]*)"/)?.[1];

    const run = runCli([
      "init",
      'create box n1 10 10 40 20 "开始"',
      "set n1 fill #f5a623",
      "set n1 label \"处理数据 v2\"",
      "tree",
      "undo",
      "tree",
      "undo",
      "tree",
      "redo",
      "tree",
      "redo",
      "tree",
    ]);

    // 五次 tree 依次对应：两次 set 之后、undo(label)、undo(fill)、redo(fill)、redo(label)
    const trees = splitTrees(run.lines);
    expect(trees.map(fillOf)).toEqual(["#f5a623", "#f5a623", "#4a90d9", "#f5a623", "#f5a623"]);
    expect(trees.map(labelOf)).toEqual([
      "处理数据 v2",
      "开始",
      "开始",
      "开始",
      "处理数据 v2",
    ]);
  });

  it("普通矩形：白名单属性 fill 仍可修改；未定义属性 label 报 unknown attribute", () => {
    const run = runCli([
      "init",
      "create rect r1 0 0 1 1",
      "set r1 fill red",
      "set r1 label x",
    ]);

    expect(run.lines).toContain('rect#r1 updated: fill="red"');
    expect(run.lines.at(-1)).toBe("error: unknown attribute: label");
  });
});

/** 把 tree 输出按 "svg (" 根行切分为多次输出。 */
function splitTrees(lines: readonly string[]): string[][] {
  const trees: string[][] = [];
  for (const line of lines) {
    if (line.startsWith("svg (")) {
      trees.push([line]);
    } else if (trees.length > 0 && (line.startsWith("├") || line.startsWith("└") || line.startsWith("│") || line.startsWith(" "))) {
      trees.at(-1)?.push(line);
    }
  }
  return trees;
}

describe("验收 §4 图形插件 box", () => {
  it("支持 in 子句、整体 move、嵌套；ungroup 被拒绝", () => {
    const run = runCli([
      "init",
      "create g outer",
      'create box n1 0 0 40 20 "a" in outer',
      "move n1 5 5",
      "tree",
      "ungroup n1",
    ]);

    expect(run.lines).toContain("box#n1 moved by (5,5)");
    expect(run.lines.some((line) => /rect#n1-rect\s+x=5 y=5/.test(line))).toBe(true);
    expect(run.lines.at(-1)).toBe("error: cannot ungroup composite shape: n1");
  });

  it("子部件 id 与文档已有 id 冲突：整条命令失败，不留下容器", () => {
    const run = runCli([
      "init",
      "create rect n3-rect 0 0 1 1",
      'create box n3 0 0 4 4 "x"',
      "show n3",
      "tree",
    ]);

    expect(run.lines).toContain("error: id already exists: n3-rect");
    expect(run.lines).toContain("error: no such shape: n3");
    expect(run.lines.some((line) => line.includes("g#n3"))).toBe(false);
  });

  it("必要子部件不能被删除、移入其他容器；只能整体操作", () => {
    const run = runCli([
      "init",
      'create box n1 0 0 40 20 "a"',
      "create g g1",
      "delete n1-rect",
      "addto g1 n1-rect",
      "delete n1-label",
      "show n1",
    ]);

    expect(run.lines).toContain("error: cannot modify composite shape structure: n1-rect");
    expect(run.lines).toContain("error: cannot modify composite shape structure: n1-label");
    expect(run.lines.some((line) => line.startsWith("box#n1  parent=svg"))).toBe(true);
    expect(run.lines).toContain("  children=2");
  });

  it("保存为 data-kind=box；装有插件时读回为 box，未装时降级为普通 g", () => {
    const dir = makeWorkDir();
    const file = join(dir, "box.svg");

    runCli(["init", 'create box n1 10 10 40 20 "a"', `save ${file}`]);
    expect(readFileSync(file, "utf8")).toContain('<g id="n1" data-kind="box">');

    const withPlugin = runCli([`read ${file}`, "tree"]);
    expect(withPlugin.lines.some((line) => /g#n1 \(box\)$/.test(line))).toBe(true);

    const degraded = runCli([`read ${file}`, "tree"], { args: BASELINE });
    expect(degraded.lines.some((line) => /g#n1$/.test(line))).toBe(true);
    expect(degraded.lines.some((line) => line.includes("(box)"))).toBe(false);
  });

  it("读入缺子部件的 box：整体拒绝，原文档保持不变", () => {
    const dir = makeWorkDir();
    const file = join(dir, "bad-box.svg");
    writeFileSync(file, [
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">',
      '  <g id="b1" data-kind="box"><rect id="b1-rect" x="0" y="0" width="1" height="1"/></g>',
      '  <rect id="z" x="0" y="0" width="1" height="1"/>',
      "</svg>",
    ].join("\n"));

    const run = runCli(["init", "create rect keep 0 0 1 1", `read ${file}`, "tree"]);

    expect(run.lines).toContain("error: invalid box#b1: expected b1-rect and b1-label");
    expect(run.lines.some((line) => line.includes("rect#keep"))).toBe(true);
    expect(run.lines.some((line) => line.includes("g#b1") || line.includes("rect#z"))).toBe(false);
  });

  it("读入重复 id：整体拒绝，原文档保持不变", () => {
    const dir = makeWorkDir();
    const file = join(dir, "dup.svg");
    writeFileSync(file, [
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">',
      '  <rect id="a" x="0" y="0" width="1" height="1"/>',
      '  <rect id="a" x="0" y="0" width="1" height="1"/>',
      "</svg>",
    ].join("\n"));

    const run = runCli(["init", "create rect keep 0 0 1 1", `read ${file}`, "tree"]);

    expect(run.lines).toContain("error: id already exists: a");
    expect(run.lines.some((line) => line.includes("rect#keep"))).toBe(true);
  });
});

describe("验收 §5 树标签（modified-star 与 (box) 并存）", () => {
  it("modified-star：init 后无 *；新建即标记；undo 回到基线后 * 消失", () => {
    const run = runCli(["init", "tree", "create rect r1 0 0 1 1", "tree", "undo", "tree"]);

    expect(run.lines.filter((line) => line.startsWith("svg ("))).toEqual([
      "svg (800x600)",
      "svg (800x600) *",
      "svg (800x600)",
    ]);
  });

  it("保存后再编辑，undo 回到保存点时 * 消失", () => {
    const dir = makeWorkDir();
    const run = runCli([
      "init",
      "create rect r1 0 0 1 1",
      `save ${join(dir, "s.svg")}`,
      "create rect r2 0 0 1 1",
      "tree",
      "undo",
      "tree",
    ]);

    expect(run.lines.filter((line) => line.startsWith("svg ("))).toEqual([
      "svg (800x600) *",
      "svg (800x600)",
    ]);
  });

  it("(box) 与 * 同行并存，box 标注在前", () => {
    const run = runCli(["init", 'create box n1 0 0 4 4 "x"', "tree"]);

    expect(run.lines.some((line) => /g#n1 \(box\) \*$/.test(line))).toBe(true);
  });
});

describe("验收 §6 双装配与 Phase 1 基线", () => {
  const pluginSessions = ["phase1-section6", "phase1-flowchart", "box-flowchart", "plugins-session"];

  it.each(pluginSessions)("%s：方式 A 与方式 B 逐字节一致，且等于预期输出", (name) => {
    const commands = readSession(name);
    const wayA = runCli(commands, { args: WAY_A, cwd: makeFixtureDir() });
    const wayB = runCli(commands, { args: WAY_B, cwd: makeFixtureDir() });

    expect(wayA.status).toBe(0);
    expect(wayB.status).toBe(0);
    expect(wayA.stderrLines).toEqual([]);
    expect(wayB.raw).toBe(wayA.raw);
    expect(wayA.raw).toBe(expectedFile(name, "plugins"));
  });

  it.each(["phase1-section6", "phase1-flowchart"])(
    "%s：禁用全部插件后逐字节等于 final 标签录制的 Phase 1 输出",
    (name) => {
      const run = runCli(readSession(name), { args: BASELINE, cwd: makeFixtureDir() });

      expect(run.status).toBe(0);
      expect(run.stderrLines).toEqual([]);
      expect(run.raw).toBe(expectedFile(name, "baseline"));
    },
  );

  it("加载器四条失败路径与重复注册：输出到 stderr，主程序继续，其他插件仍可用", () => {
    const dir = makeWorkDir();
    const nodefault = join(dir, "nodefault");
    const throws = join(dir, "throws");
    const mismatch = join(dir, "mismatch");
    for (const folder of [nodefault, throws, mismatch]) {
      mkdirSync(folder, { recursive: true });
    }
    writeFileSync(join(nodefault, "index.js"), "module.exports = { notDefault: true };\n");
    writeFileSync(
      join(throws, "index.js"),
      'module.exports.default = { name: "throws", activate() { throw new Error("boom"); } };\n',
    );
    writeFileSync(
      join(mismatch, "package.json"),
      JSON.stringify({ name: "mismatch", main: "./index.js", contributes: { commands: ["ghost"] } }),
    );
    writeFileSync(
      join(mismatch, "index.js"),
      'module.exports.default = { name: "mismatch", activate() {} };\n',
    );
    const configPath = join(dir, "plugins.json");
    const statsModule = join(repositoryRoot, "dist", "_plugin", "commands", "StatsCommand");
    writeFileSync(configPath, JSON.stringify({
      plugins: [
        { module: "./nope/missing" },
        { module: "./nodefault" },
        { module: "./throws" },
        { module: "./mismatch" },
        { module: statsModule },
        { module: statsModule },
        { module: join(repositoryRoot, "dist", "_plugin", "commands", "DirCommand"), enabled: false },
      ],
    }));

    const run = runCli(["init", "stats", "dir", "exit"], { args: ["--config", configPath] });

    expect(run.status).toBe(0);
    expect(run.stderrLines).toEqual([
      "error: plugin not found: ./nope/missing",
      "error: plugin has no default export: ./nodefault",
      "error: plugin failed to activate: throws (boom)",
      "error: plugin manifest mismatch: mismatch (declared: commands/ghost, registered: (none))",
      "error: duplicate registration: commands/stats",
    ]);
    expect(run.lines).toContain("(total 0, containers 0)");
    expect(run.lines).toContain("error: unknown command: dir");
  });

  it("配置结构非法：输出 invalid plugin config，并以内置能力启动", () => {
    const dir = makeWorkDir();
    const configPath = join(dir, "bad.json");
    writeFileSync(configPath, '{"plugins": "x"}');

    const run = runCli(["init", "stats", "exit"], { args: ["--config", configPath] });

    expect(run.status).toBe(0);
    expect(run.stderrLines).toEqual(["error: invalid plugin config"]);
    expect(run.lines).toEqual([
      startupMessage,
      "canvas 800x600 created",
      "error: unknown command: stats",
    ]);
  });
});
