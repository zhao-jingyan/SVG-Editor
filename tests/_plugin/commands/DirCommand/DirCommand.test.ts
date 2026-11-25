import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { InitCommand } from "@/_builtin/commands/InitCommand/InitCommand";
import { UndoCommand } from "@/_builtin/commands/UndoCommand/UndoCommand";
import { CreateCommand } from "@/_builtin/commands/CreateCommand/CreateCommand";
import { CommandExecutor } from "@/core/CommandExecutor";
import { CommandHistory } from "@/core/history/CommandHistory";
import { EditorCommandReceiver } from "@/core/receiver/EditorCommandReceiver";
import { DirCommand } from "@/_plugin/commands/DirCommand/DirCommand";
import { NodeDirectoryListing } from "@/_plugin/commands/DirCommand/NodeDirectoryListing";
import { DirectoryEntry } from "@/protocol/io/DirectoryEntry";
import { DirectoryEntryKind } from "@/protocol/io/DirectoryEntryKind";
import type { DirectoryListing } from "@/protocol/io/DirectoryListing";
import { RectShape } from "@/protocol/shapes/concrete/RectShape";

class FakeDirectoryListing implements DirectoryListing {
  public constructor(
    private readonly entriesByPath: ReadonlyMap<string, readonly DirectoryEntry[]>,
    private readonly failures: ReadonlySet<string> = new Set(),
  ) {}

  public async list(path: string): Promise<readonly DirectoryEntry[]> {
    if (this.failures.has(path)) {
      throw new Error("boom");
    }
    return this.entriesByPath.get(path) ?? [];
  }
}

describe("DirCommand", () => {
  it("用替身覆盖排序、隐藏项、空目录与读取失败", async () => {
    const path = "/tmp/demo";
    const listing = new FakeDirectoryListing(
      new Map([
        [
          path,
          [
            new DirectoryEntry(DirectoryEntryKind.File, "package.json"),
            new DirectoryEntry(DirectoryEntryKind.Directory, "plugins"),
            new DirectoryEntry(DirectoryEntryKind.File, ".gitignore"),
            new DirectoryEntry(DirectoryEntryKind.Directory, "docs"),
          ],
        ],
        ["/tmp/empty", []],
      ]),
      new Set(["/tmp/missing"]),
    );

    const mixed = await new DirCommand(listing, path).execute(
      new EditorCommandReceiver(),
    );
    expect(mixed.toCommandResultDto()).toEqual({
      type: "success",
      message: [
        "[DIR]  docs",
        "[DIR]  plugins",
        "[FILE] .gitignore",
        "[FILE] package.json",
      ].join("\n"),
    });

    const empty = await new DirCommand(listing, "/tmp/empty").execute(
      new EditorCommandReceiver(),
    );
    expect(empty.toCommandResultDto()).toEqual({
      type: "success",
      message: "(empty directory)",
    });

    const failed = await new DirCommand(listing, "/tmp/missing").execute(
      new EditorCommandReceiver(),
    );
    expect(failed.toCommandResultDto()).toEqual({
      type: "error",
      error: {
        code: "io-read",
        message: "cannot read directory: /tmp/missing",
      },
    });
  });

  it("无文档可用，且不改变 undo 历史；真实适配器可列举临时目录", async () => {
    const history = new CommandHistory();
    const receiver = new EditorCommandReceiver(history);
    const executor = new CommandExecutor(receiver, history);

    const directory = mkdtempSync(join(tmpdir(), "svg-editor-dir-"));
    mkdirSync(join(directory, "docs"));
    writeFileSync(join(directory, "demo.svg"), "<svg/>");
    writeFileSync(join(directory, ".hidden"), "");

    const beforeDoc = await executor.execute(
      new DirCommand(new NodeDirectoryListing(), directory),
    );
    expect(beforeDoc.toCommandResultDto()).toEqual({
      type: "success",
      message: ["[DIR]  docs", "[FILE] .hidden", "[FILE] demo.svg"].join("\n"),
    });

    await executor.execute(new InitCommand(100, 100));
    await executor.execute(new CreateCommand(new RectShape("r1", 0, 0, 1, 1)));

    const afterEdit = await executor.execute(
      new DirCommand(new NodeDirectoryListing(), directory),
    );
    expect(afterEdit.toCommandResultDto().type).toBe("success");

    expect((await executor.execute(new UndoCommand())).toCommandResultDto()).toEqual({
      type: "success",
      message: "rect#r1 deleted",
    });
  });
});
