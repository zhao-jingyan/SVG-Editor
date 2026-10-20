# Plan6：Result 体系面向对象化

## 摘要

- 将 `CommandResult` 与 `CommandParseResult` 从联合类型改为运行时类层次加边界 DTO。
- 结果对象负责 `toCommandResultDto()` / `toCommandParseResultDto()`，`Repl` 在边界统一转换为 DTO 后消费。
- 错误结果持有 `ProtocolError`，边界转换时生成 `CommandErrorDto`。

## 公共模型

- 协议层新增抽象 `CommandResult`，具体类为 `CommandSuccessResult`、`CommandErrorResult`、`CommandExitResult`。
- CLI 层新增抽象 `CommandParseResult`，具体类为 `CommandParseSuccessResult`、`CommandParseEmptyResult`、`CommandParseErrorResult`。
- `CommandResultDto` 保持 `success/error/exit` 联合结构；`CommandParseResultDto` 保持 `command/empty/error` 联合结构。
- 删除旧的 `src/protocol/CommandResult.ts` 和 `src/cli/CommandParseResult.ts` 联合类型文件。

## 接线与行为

- `Command`、`CommandContext`、`Executor` 和全部命令返回具体 `CommandResult` 对象。
- `ExitCommand` 返回 `CommandExitResult`；`DemoCommandContext` 返回 `CommandSuccessResult`；未实现 undo 返回 `CommandErrorResult(CommandExecutionError)`。
- `CommandLineParser` 返回具体解析结果对象，`Repl` 分别转换解析结果和执行结果 DTO。
- CLI 输出、错误码、成功消息和退出行为保持不变。

## 测试与文档

- 新增协议层与 CLI 层结果类层次、DTO 结构、错误对象转换和可序列化测试。
- 更新 Parser、Repl、DemoExecutor 和 CommandHierarchy 测试为具体结果类断言。
- 更新边界事实文档与 `AGENTS.md`，移除“`CommandResult` 属于边界 DTO”的旧例外。
- 验证命令为 `npm test`、`npm run build`，并复跑 CLI 冒烟。

## 假设

- `CommandParseResultDto` 继续携带 `Command` 对象，仅作为 CLI 边界结果，不承诺持久化。
- 不新增结果种类，不改变命令语义；本计划取代 Plan5 中“`CommandResult` 仍为边界联合类型”的假设。
