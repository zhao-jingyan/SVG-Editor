# EditorContext 与真实执行链路事实

## 职责

- `EditorContext` 位于 `src/core/EditorContext.ts`，实现 `CommandContext`，是 CLI 命令与 Core 领域对象之间的应用层接收者。
- Context 私有持有可选 `Document`、`CommandHistory` 和历史锁；文档不存在时只允许 `init`、`exit` 和占位命令。
- `CommandExecutor` 位于 `src/core/CommandExecutor.ts`，实现 `Executor`，委托 `EditorContext.execute` 并把 `ProtocolError` 转成 `CommandErrorResult`。
- `main.ts` 只负责组装 `ConsoleInputReader`、`Repl`、`CommandLineParser`、`EditorContext` 和 `CommandExecutor`。

## 生命周期与历史

- `init` 创建新 Document，默认尺寸为 `800x600`；成功替换文档后清空历史并锁定 undo/redo。
- `canvas` 无参数查询尺寸；带参数时先校验并 resize，然后锁定历史，不主动清空历史。
- `EditorContext.execute` 在命令成功后记录 `UndoableCommand` 并解除历史锁；失败或异常不记录。
- undo/redo 委托 `CommandHistory`；历史锁定时返回 `HistoryUnavailable`，消息为 `undo not allowed after io command`。
- 未初始化文档时执行编辑、显示、撤销、重做或画布命令，返回 `NoDocument`，消息为 `no document. use 'init' or 'read' first`。

## 撤销协作

- 具体命令在 execute 前保存局部状态：`ShapePlacement` 保存图形、父节点和索引，`ShapeAttributeSnapshot` 保存属性名和子树叶子旧值。
- Context 将捕获与恢复操作委托给 Document；命令不持有整份文档快照，也不直接修改树结构。
- `CommandExecutor` 只转换 `ProtocolError`；未知异常继续上抛，由 Repl 输出通用错误。

## 当前边界

- `read`、`save`、`tree`、`show`、`help` 仍返回 `CommandNotImplemented`，消息为 `<command> is not implemented yet`。
- SVG IO、显示格式化、自动补 id、插件类型和 IO 历史锁的完整语义留到后续计划。
- 成功反馈由 Context 和具体逆操作生成，例如 `rect#r1 moved by (5,5)`、`rect#r1 moved back by (-5,-5)` 和 `type#id restored into g#parent`。

## 设计模式角色

- Command：具体命令封装参数和逆操作；Context 是接收者，Executor 只负责执行入口。
- Facade：EditorContext 对 CLI 隐藏 Document、History、Shape 多态和错误转换的协作细节。
- Caretaker：CommandHistory 保存命令对象引用；历史锁和文档生命周期由 EditorContext 管理。
- Memento：命令使用局部位置和属性快照保存撤销状态，不保存整文档快照。
