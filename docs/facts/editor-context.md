# EditorContext 与真实执行链路事实

## 职责

- `EditorContext` 位于 `src/core/EditorContext.ts`，实现 `CommandContext`，是 CLI 命令与 Core 领域对象之间的应用层接收者。
- Context 私有持有可选 `Document`、当前文件路径、`CommandHistory`、历史锁、显示协作对象和可注入的 `SvgStorage`；文档不存在时只允许 `init`、`exit`、`help` 和 IO 命令。
- `CommandExecutor` 位于 `src/core/CommandExecutor.ts`，实现 `Executor`，委托 `EditorContext.execute` 并把 `ProtocolError` 转成 `CommandErrorResult`。
- `main.ts` 只负责组装 `ConsoleInputReader`、`Repl`、`CommandLineParser`、`EditorContext` 和 `CommandExecutor`。

## 生命周期与历史

- `init` 创建新 Document，默认尺寸为 `800x600`；成功替换文档后清空历史并锁定 undo/redo。
- `read` 读取并解析 SVG，成功后替换文档、记录当前路径、清空历史并锁定 undo/redo；解析失败不会替换现有文档。
- `save` 使用显式路径或当前路径写出 SVG；成功写出后锁定 undo/redo，但保留既有历史，下一次成功编辑会重新解锁。
- `canvas` 无参数查询尺寸；带参数时先校验并 resize，然后锁定历史，不主动清空历史。
- `EditorContext.execute` 在命令成功后记录 `UndoableCommand` 并解除历史锁；失败或异常不记录。
- undo/redo 委托 `CommandHistory`；历史锁定时返回 `HistoryUnavailable`，消息为 `undo not allowed after io command`。
- 未初始化文档时执行编辑、显示、撤销、重做或画布命令，返回 `NoDocument`，消息为 `no document. use 'init' or 'read' first`。
- `tree` 和 `show` 先要求文档存在；`help` 不依赖文档，可随时查看命令总表。

## 显示命令

- `tree` 由 `TreeDisplay` 渲染，使用 `ShapeSummaryVisitor` 取得各图形摘要，再统一计算属性对齐和树形连接线；无参数显示根级 `svg (WxH)`，带 id 时只显示该节点子树。
- `show` 使用 `ShapeDetailVisitor` 输出几何与样式明细；首行为 `type#id  parent=g#parent`，根级图形显示 `parent=svg`。
- 显示结果是一条可包含换行的成功消息，不进入历史栈，也不改变历史锁。
- `HelpText` 集中维护 `help` 文本，避免命令说明散落在 Context 或 CLI。

## SVG IO

- Context 通过 `SvgStorage` 读取和写出文本，生产适配器为 `FileSvgStorage`；测试可注入内存实现，不需要真实文件系统。
- `read` 成功消息为 `read <path> (<n> elements)`；缺 id 警告逐行放在成功消息之前，格式为 `warning: assigned id <id> to unnamed <<tag>>`。
- `save` 成功消息为 `saved to <path> (<n> elements)`；无显式路径且没有当前文件时返回 `InvalidArgument`，消息为 `save requires a file path`。
- 文件读取失败返回 `IoRead`，消息为 `cannot read file: <path>`；写出失败返回 `IoWrite`，消息为 `cannot write file: <path>`。
- 元素计数包含全部图形（含嵌套 group），不包含 `<svg>` 根元素。

## 撤销协作

- 具体命令在 execute 前保存局部状态：`ShapePlacement` 保存图形、父节点和索引，`ShapeAttributeSnapshot` 保存属性名和子树叶子旧值。
- Context 将捕获与恢复操作委托给 Document；命令不持有整份文档快照，也不直接修改树结构。
- `CommandExecutor` 只转换 `ProtocolError`；未知异常继续上抛，由 Repl 输出通用错误。

## 当前边界

- SVG 子集读写、自动补 id 和 IO 历史锁已接入；插件类型、复杂 SVG 特性和画布外裁剪留到后续阶段。
- 成功反馈由 Context 和具体逆操作生成，例如 `rect#r1 moved by (5,5)`、`rect#r1 moved back by (-5,-5)` 和 `type#id restored into g#parent`。

## 设计模式角色

- Command：具体命令封装参数和逆操作；Context 是接收者，Executor 只负责执行入口。
- Facade：EditorContext 对 CLI 隐藏 Document、History、Shape 多态和错误转换的协作细节。
- Caretaker：CommandHistory 保存命令对象引用；历史锁和文档生命周期由 EditorContext 管理。
- Memento：命令使用局部位置和属性快照保存撤销状态，不保存整文档快照。
- Visitor：显示协作对象通过 `Shape.accept` 按具体图形类型生成摘要和明细，Context 不维护图形类型分支。
