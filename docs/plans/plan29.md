# 按职责命名 Receiver 协作对象

## 目标

- 消除 `ShapeCommands` 这类无法表达对象职责的名称。
- 让实现类型与其接口角色的关系可直接阅读。

## 重命名

- `DocumentCommands` 重命名为 `DocumentManager`，负责当前文档、路径与 IO。
- `ShapeCommands` 重命名为 `ShapeEditor`，负责图形编辑与快照操作。
- `ViewCommands` 重命名为 `EditorView`，负责 tree、show、help 输出。
- `ShapeEditor implements ShapeCommandReceiver` 明确表示“图形编辑器实现图形命令接收能力”。

## 约束

- 不改变 Receiver 聚合、命令行为、历史状态或输出文本。
- 历史计划保留旧名称，本轮计划记录实现类改名。

## 验证

- 运行 `npm test` 与 `npm run build`。
