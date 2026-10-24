# CLI 控制循环职责拆分

## 目标

- 让 CLI 主循环名称和处理职责保持直观：`CommandLoop` 是控制循环，不再同时承担解析结果解释。
- 明确空输入、解析错误和命令结果各自的所有者。
- 修正未知异常被伪装成普通命令失败的问题。

## 职责边界

- `CommandLineParser` 负责语法解析，并把输入分类为 `command`、`empty` 或 `error`。它可以识别注释行、参数错误和引号错误，但不决定终端文案或循环是否继续。
- `CommandSession` 负责一次交互的用例编排：空输入跳过、已知错误反馈、命令执行、结果输出，以及继续/退出状态。
- `CommandLoop` 只负责启动提示、显示提示符、读取一行和根据 Session 状态终止循环。
- `main.ts` 作为进程边界处理未被协议结果建模的未知异常：记录错误并以非零状态结束。

## 执行链路

```text
ConsoleInputReader
  -> CommandLoop
  -> CommandSession
  -> CommandLineParser
  -> Executor
  -> Command
  -> CommandResult
  -> CommandSession
  -> ConsoleOutputWriter
```

## 错误策略

- 可预期的命令失败使用 `CommandParseResult` / `CommandResult` 返回，不计为进程故障。
- 未知异常不转换成 `CommandErrorResult`，因为它通常表示编程错误、进程状态损坏或未建模的集成故障；继续循环会掩盖根因。
- 进程边界保留错误堆栈，并设置非零退出码。

## 验证

- `CommandSession` 覆盖空输入、解析错误、成功、执行错误、退出和未知异常。
- `CommandLoop` 覆盖启动提示、逐行读取和退出后不再读取。
- 真实编辑链路覆盖 `init`、`create`、`move`、`undo`、`redo` 和 `exit`。
- 运行 `npm test` 与 `npm run build`。
