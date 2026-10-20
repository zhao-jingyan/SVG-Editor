# Plan5：Protocol 错误体系面向对象化

## 摘要

- 在 `src/protocol/errors` 建立面向对象的运行时错误体系，同时保留可序列化的边界错误 DTO。
- `ProtocolError` 作为抽象基类，具体错误按来源分为 `CommandParseError`、`CommandExecutionError` 和 `ShapeError`。
- `CommandResult` 与 `CommandParseResult` 只保存 `CommandErrorDto`；CLI 输出契约和错误码字符串保持不变。

## 公共模型

- `CommandErrorCode` 从字符串联合类型改为枚举，字符串值保持稳定。
- `CommandErrorDto` 仅包含稳定错误码和消息，不依赖 `Error` 实例。
- `ProtocolError` 封装私有错误码，提供 `getCode()` 与 `toCommandErrorDto()`。
- 删除旧 `CommandError` 接口和 `shapes/ShapeError.ts`，统一使用新的错误目录。

## 解析与执行

- `CommandLineParser` 辅助方法在失败时抛出 `CommandParseError`，`parse()` 顶层捕获 `ProtocolError` 并返回 DTO。
- `ShapeFactory` 与形状类抛出 `ShapeError`，由 Parser 顶层统一转换，不再在 `parseCreate` 中单独捕获。
- `UndoableCommand.undo` 使用 `CommandExecutionError(CommandErrorCode.CommandNotImplemented)` 构造结果。
- `Repl` 继续只输出 `error: <message>`，未知异常继续向上抛出。

## 测试与文档

- 新增错误类层次、DTO 可序列化和错误码稳定性测试。
- Parser 测试断言错误结果是 DTO 而非异常实例。
- 更新 Shapes、CommandHierarchy 和 Repl 测试的枚举引用。
- 更新 CLI/Core 边界与图形模型事实文档。
- 验证命令为 `npm test`、`npm run build`，并保留 CLI 错误输出冒烟验证。

## 假设

- 本轮不新增 Document、IO、History 的具体错误子类。
- `CommandResult` 仍为边界联合类型，不改为类层次。
- `CommandErrorCode` 保留现名，只改变实现形式。
