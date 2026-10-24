# EditorContext 重命名为 EditorSession

## 目标

- 让类型名反映当前职责：一次编辑器会话中的文档、路径、历史栈和历史锁。
- 去掉没有具体语义的 `Context` 命名，避免与共享状态或依赖注入容器混淆。

## 调整

- `EditorContext` 重命名为 `EditorSession`，文件名同步修改。
- `CommandExecutor`、`main.ts`、测试和当前架构事实统一使用新名称。
- 测试中的局部变量按 `session` 或 `editor` 命名，避免继续使用 `context`。

## 约束

- 不改变 `CommandReceiver` 接口、命令执行流程、历史锁或 IO 行为。
- 历史计划保留当时使用的 `EditorContext`，本轮计划记录后续改名。

## 验证

- 运行 `npm test` 与 `npm run build`。
