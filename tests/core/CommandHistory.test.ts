import { describe, expect, it } from "vitest";
import { CommandHistory } from "../../src/core/history/CommandHistory";
import { CommandErrorCode } from "../../src/protocol/errors/CommandErrorCode";
import { CommandExecutionError } from "../../src/protocol/errors/command/CommandExecutionError";
import { CommandErrorResult } from "../../src/protocol/results/CommandErrorResult";
import { CommandExitResult } from "../../src/protocol/results/CommandExitResult";
import { CommandSuccessResult } from "../../src/protocol/results/CommandSuccessResult";
import { RecordingCommandContext } from "../support/RecordingCommandContext";
import { ScriptedUndoableCommand } from "../support/ScriptedUndoableCommand";

describe("CommandHistory", () => {
  const context = new RecordingCommandContext();

  it("记录命令后可以撤销，并在新编辑后清空 redo", async () => {
    const history = new CommandHistory();
    const first = new ScriptedUndoableCommand();

    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);

    history.record(first);
    expect(history.canUndo()).toBe(true);

    const undoResult = await history.undo(context);
    expect(undoResult.isSuccess()).toBe(true);
    expect(first.getUndoCount()).toBe(1);
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(true);

    history.record(new ScriptedUndoableCommand());
    expect(history.canRedo()).toBe(false);
  });

  it("按 LIFO 顺序撤销和重做命令", async () => {
    const history = new CommandHistory();
    const first = new ScriptedUndoableCommand();
    const second = new ScriptedUndoableCommand();

    history.record(first);
    history.record(second);

    await history.undo(context);
    await history.undo(context);
    expect(first.getUndoCount()).toBe(1);
    expect(second.getUndoCount()).toBe(1);
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(true);

    await history.redo(context);
    expect(first.getExecuteCount()).toBe(1);
    expect(second.getExecuteCount()).toBe(0);

    await history.redo(context);
    expect(second.getExecuteCount()).toBe(1);
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);
  });

  it("undo 返回失败结果时保留两个栈", async () => {
    const history = new CommandHistory();
    const failure = new CommandErrorResult(
      new CommandExecutionError(CommandErrorCode.ShapeNotFound, "missing"),
    );
    const command = new ScriptedUndoableCommand(undefined, failure);

    history.record(command);
    const firstResult = await history.undo(context);
    const secondResult = await history.undo(context);

    expect(firstResult).toBe(failure);
    expect(secondResult).toBe(failure);
    expect(command.getUndoCount()).toBe(2);
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);
  });

  it("redo 返回失败结果时保留两个栈", async () => {
    const history = new CommandHistory();
    const failure = new CommandErrorResult(
      new CommandExecutionError(CommandErrorCode.ShapeNotFound, "missing"),
    );
    const command = new ScriptedUndoableCommand(failure);

    history.record(command);
    await history.undo(context);
    const firstResult = await history.redo(context);
    const secondResult = await history.redo(context);

    expect(firstResult).toBe(failure);
    expect(secondResult).toBe(failure);
    expect(command.getExecuteCount()).toBe(2);
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(true);
  });

  it("命令抛出异常时不改变历史栈", async () => {
    const history = new CommandHistory();
    const command = new ScriptedUndoableCommand(undefined, new Error("undo failed"));

    history.record(command);

    await expect(history.undo(context)).rejects.toThrow("undo failed");
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);

    const redoFailure = new ScriptedUndoableCommand(new Error("redo failed"));
    const redoHistory = new CommandHistory();
    redoHistory.record(redoFailure);
    await redoHistory.undo(context);

    await expect(redoHistory.redo(context)).rejects.toThrow("redo failed");
    expect(redoHistory.canUndo()).toBe(false);
    expect(redoHistory.canRedo()).toBe(true);
  });

  it("非成功结果不会改变历史栈", async () => {
    const history = new CommandHistory();
    const command = new ScriptedUndoableCommand(
      new CommandExitResult(),
      new CommandExitResult(),
    );

    history.record(command);
    const undoResult = await history.undo(context);

    expect(undoResult).toBeInstanceOf(CommandExitResult);
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);

    const successHistory = new CommandHistory();
    const successCommand = new ScriptedUndoableCommand(new CommandExitResult());
    successHistory.record(successCommand);
    await successHistory.undo(context);

    const redoResult = await successHistory.redo(context);
    expect(redoResult).toBeInstanceOf(CommandExitResult);
    expect(successHistory.canUndo()).toBe(false);
    expect(successHistory.canRedo()).toBe(true);
  });

  it("空历史返回 history-unavailable", async () => {
    const history = new CommandHistory();

    const undoResult = await history.undo(context);
    expect(undoResult).toBeInstanceOf(CommandErrorResult);
    expect(undoResult.toCommandResultDto()).toEqual({
      type: "error",
      error: {
        code: CommandErrorCode.HistoryUnavailable,
        message: "no command to undo",
      },
    });

    const redoResult = await history.redo(context);
    expect(redoResult).toBeInstanceOf(CommandErrorResult);
    expect(redoResult.toCommandResultDto()).toEqual({
      type: "error",
      error: {
        code: CommandErrorCode.HistoryUnavailable,
        message: "no command to redo",
      },
    });
  });

  it("清空历史后两个栈均不可用", async () => {
    const history = new CommandHistory();
    const command = new ScriptedUndoableCommand(new CommandSuccessResult("ok"));

    history.record(command);
    await history.undo(context);
    expect(history.canRedo()).toBe(true);

    history.clear();
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
  });
});
