# Protocol Command 目录分层

## 目标

- 消除 `protocol/commands` 根目录下 21 个文件平铺的结构。
- 按命令业务族组织具体命令，使 CLI 命令解析与 Protocol 命令对象能够按同一语义查找。
- 把命令撤销状态从命令类中分离，避免快照对象与具体命令混淆。

## 目录结构

```text
src/protocol/commands
├── Command.ts
├── CommandType.ts
├── UndoableCommand.ts
├── doc
│   ├── CanvasCommand.ts
│   ├── InitCommand.ts
│   ├── ReadCommand.ts
│   └── SaveCommand.ts
├── history
│   ├── RedoCommand.ts
│   └── UndoCommand.ts
├── memento
│   ├── ShapeAttributeSnapshot.ts
│   └── ShapePlacement.ts
├── session
│   └── ExitCommand.ts
├── shape
│   ├── AddToCommand.ts
│   ├── CreateCommand.ts
│   ├── DeleteCommand.ts
│   ├── GroupCommand.ts
│   ├── MoveCommand.ts
│   ├── ReorderCommand.ts
│   ├── ScaleCommand.ts
│   ├── SetCommand.ts
│   └── UngroupCommand.ts
└── view
    ├── HelpCommand.ts
    ├── ShowCommand.ts
    └── TreeCommand.ts
```

## 职责

- 根目录：命令抽象基类、可撤销命令基类和命令类型集合。
- `doc`：文档创建、读取、保存和画布尺寸。
- `shape`：创建、删除、变换、属性和容器结构编辑。
- `view`：树、明细和帮助显示。
- `history`：撤销和重做入口。
- `session`：退出会话。
- `memento`：命令撤销所需的局部结构、顺序和属性快照。

## 约束

- 只调整目录和导入路径，不改变 Command、CommandContext、Executor 或结果语义。
- `CommandContext` 继续通过 Protocol 命令 API 与 Core 协作，不依赖 CLI。
- 命令撤销快照不属于 CLI，也不直接修改 Document。

## 验证

- 全量测试覆盖命令类层次、解析、执行、撤销、恢复和进程级 CLI 链路。
- 运行 `npm test` 与 `npm run build`。
