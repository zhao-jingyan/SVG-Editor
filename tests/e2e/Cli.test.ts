import { execFileSync, spawnSync } from "node:child_process";
import { beforeAll, describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const startupMessage = "svg-editor 0.1 — type 'help' for commands";

interface CliRun {
  readonly status: number | null;
  readonly stdout: string;
  readonly stderr: string;
}

function runCli(input: string): CliRun {
  const result = spawnSync(process.execPath, ["dist/main.js"], {
    cwd: repositoryRoot,
    input,
    encoding: "utf8",
    timeout: 10_000,
  });

  return {
    status: result.status,
    stdout: result.stdout.replace(/svg> /g, "").trim(),
    stderr: result.stderr,
  };
}

describe("CLI 进程级端到端", () => {
  beforeAll(() => {
    execFileSync("npm", ["run", "build"], {
      cwd: repositoryRoot,
      stdio: "pipe",
    });
  });

  it("完成初始化、创建、编辑、撤销和重做", () => {
    const run = runCli(
      [
        "init 800 600",
        "create rect r1 0 0 10 10",
        "move r1 5 5",
        "undo",
        "redo",
        "exit",
      ].join("\n"),
    );

    expect(run.status).toBe(0);
    expect(run.stderr).toBe("");
    expect(run.stdout.split("\n")).toEqual([
      startupMessage,
      "canvas 800x600 created",
      "rect#r1 created",
      "rect#r1 moved by (5,5)",
      "rect#r1 moved back by (-5,-5)",
      "rect#r1 moved by (5,5)",
    ]);
  });

  it("命令失败后保持进程可继续处理后续命令", () => {
    const run = runCli(
      [
        "create rect early 0 0 1 1",
        "init",
        "create rect r1 0 0 10 10",
        "create rect r1 0 0 2 2",
        "move missing 1 1",
        "unknown-command",
        "create circle c1 5 5 2",
        "exit",
      ].join("\n"),
    );

    expect(run.status).toBe(0);
    expect(run.stdout.split("\n")).toEqual([
      startupMessage,
      "error: no document. use 'init' or 'read' first",
      "canvas 800x600 created",
      "rect#r1 created",
      "error: id already exists: r1",
      "error: no such shape: missing",
      "error: unknown command: unknown-command",
      "circle#c1 created",
    ]);
  });

  it("init 和 canvas 后锁定 undo，下一次编辑重新解锁", () => {
    const run = runCli(
      [
        "init 800 600",
        "undo",
        "canvas 1000 800",
        "undo",
        "create rect r1 0 0 10 10",
        "undo",
        "exit",
      ].join("\n"),
    );

    expect(run.status).toBe(0);
    expect(run.stdout.split("\n")).toEqual([
      startupMessage,
      "canvas 800x600 created",
      "error: undo not allowed after io command",
      "canvas 1000x800 resized",
      "error: undo not allowed after io command",
      "rect#r1 created",
      "rect#r1 deleted",
    ]);
  });

  it("stdin 结束时正常退出", () => {
    const run = runCli("init 320 240\n");

    expect(run.status).toBe(0);
    expect(run.stdout).toBe(`${startupMessage}\ncanvas 320x240 created`);
  });

  it("输出 help、tree 和 show", () => {
    const run = runCli(
      [
        "help",
        "init 800 600",
        "create circle c1 100 100 20 red",
        "create rect box 200 80 60 60",
        "group markers c1 box",
        "tree",
        "tree markers",
        "show c1",
        "exit",
      ].join("\n"),
    );
    const lines = run.stdout.split("\n");

    expect(run.status).toBe(0);
    expect(lines[0]).toBe(startupMessage);
    expect(lines[1]).toBe("Commands:");
    expect(lines).toContain("svg (800x600)");
    expect(lines).toContain("└── g#markers");
    expect(lines).toContain("circle#c1  parent=g#markers");
    expect(lines).toContain("  cx=100 cy=100 r=20");
  });
});
