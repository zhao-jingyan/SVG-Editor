# `src/protocol` 通信契约与 Command 解析骨架

## 摘要

- 建立依赖为零、可 JSON 传输的共享协议层 `src/protocol`，覆盖阶段文档中的完整命令词表。
- CLI 新增文本解析器，将一行输入转换为强类型 `Command`；`Repl`、`Executor` 改为传递命令对象，不再传递原始字符串。
- 本轮不实现 Editor、命令分发器或 undo 栈；`DemoExecutor` 仅验证 `CLI → Parser → Command → Executor` 链路。
- 经典 Command 模式定为“可序列化 DTO + Core 命令对象”：后续 Core 将 DTO 物化为带 `execute(context)` / `undo(context)` 的对象，逆操作由命令自身保存。

## 协议契约

- `src/protocol` 不依赖 `src/cli`、`src/core`、Node 或 DOM，仅包含纯类型。
- 继续遵循“一类型一文件”，目录组织为 `protocol/commands`、`protocol/shapes`，并导出统一联合类型。
- 命令统一使用 `type` 鉴别字段，字段均为 `readonly`。
- `Command` 覆盖：`init`、`read`、`save`、`canvas`、`create`、`delete`、`move`、`scale`、`set`、`group`、`ungroup`、`addto`、`reorder`（由 `front/back` 映射）、`tree`、`show`、`help`、`undo`、`redo`、`exit`。
- `CommandResult` 分为 `success`、`error`、`exit`；错误包含稳定 `CommandErrorCode` 与英文消息。
- `ShapeSpec` 覆盖 `rect/circle/ellipse/line/text/g`；`text` 使用 `content` 字段，容器使用 `ContainerShapeSpec`。
- `EditableAttribute` 固化 `fill/stroke/stroke-width`、各图形几何属性及 `text` 白名单。

## CLI 与入口改造

- 在 `src/cli` 新增 `CommandParser`、`CommandParseResult` 和 `CommandLineParser`；文本语法不进入协议层。
- 解析结果分为 `command`、`empty`、`error`；空行和首个非空字符为 `#` 的注释行返回 `empty`。
- 手写 tokenizer 支持空白分隔和双引号参数，不支持内联注释和转义引号；未闭合引号返回语法错误。
- `init/canvas` 只接受 0 或 2 个尺寸参数；`group` 至少包含两个成员；`front/back` 映射为 `ReorderCommand`。
- `create` 校验各类型固定参数，可选 `fill/stroke` 位于几何参数之后，尾缀 `in <containerId>` 映射为 `parentId`。
- `set` 对 `fill/stroke/text` 保留字符串，对几何属性和 `stroke-width` 转为有限数字。
- `Executor.execute` 改为 `execute(command: Command): Promise<CommandResult>`；移除旧 `ExecutionResult`。
- `Repl` 注入 `CommandParser`：空行/注释跳过；解析错误输出 `error: ...` 并继续；执行错误输出结构化错误消息并继续。
- `DemoExecutor` 接收 `Command`，`exit` 返回退出，其余返回 `received command: <type>`。
- 依赖方向保持 `cli → protocol`、`core → protocol`、`main → cli + core`。

## 文档与测试

- `docs/prompts/plan2.md` 保存本轮需求与决策，本文件保存最终计划。
- Parser 测试覆盖全部命令、可选参数、`in` 子句、带空格文本、注释、空行及关键错误分支。
- REPL 测试覆盖强类型命令传递、空输入、解析错误恢复、执行错误、退出和异常处理。
- DemoExecutor 测试覆盖命令回执与退出。
- 验证命令：`npm test`、`npm run build`，以及管道输入 `init 800 600`、`help`、`exit`。

## 假设

- 本轮不实现文档状态、命令工厂、真实 Handler、undo/redo 或 SVG 文件读写。
- 后续 `EditorCommand` 使用 `execute(context)` / `undo(context)`，历史栈保存命令对象。
- 协议面向未来 GUI 与跨进程传输，但本轮不增加请求 ID、版本号或传输层封装。
- `box` 插件类型不进入本轮协议词表。
