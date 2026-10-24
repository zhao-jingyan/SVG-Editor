# EditorSession 重命名为 EditorReceiver

## 目标

- 用模式角色而不是模糊的会话概念命名聚合实现。
- 让 `EditorReceiver` 与 `CommandReceiver` 的聚合关系直接可见。
- 将聚合实现放到 `src/core/receiver`，与文档、图形、显示能力对象保持同一结构。

## 调整

- `EditorSession` 重命名为 `EditorReceiver`，文件移动到 `src/core/receiver/EditorReceiver.ts`。
- `main.ts`、测试和当前架构事实统一使用新名称。
- 测试移动到 `tests/core/receiver/EditorReceiver.test.ts`，局部变量使用 `receiver`。
- 文档事实文件移动为 `docs/facts/editor-receiver.md`。

## 约束

- 不改变任何 Receiver 能力、命令行为、历史状态或输出文本。
- 历史计划保留当时的 `EditorSession` 名称，本轮计划记录改名与目录调整。

## 验证

- 运行 `npm test` 与 `npm run build`。
