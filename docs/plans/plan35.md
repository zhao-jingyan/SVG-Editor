# 命令与贡献同目录（protocol/commands/XxxCommand）

## 目标

- 每个具体命令目录 `builtin/commands/XxxCommand/` 同时存放 `Command` 与对应 `*CommandContribution`。
- `front`/`back` 共用 `ReorderCommand/`；`EditableAttributeParser` 随 `SetCommand/`。
- Core 只保留 `CommandRegistry`；具体命令已迁至 `src/builtin`；统一注册改由 `main` / 测试夹具负责。

## 完成状态

- 已迁移；族目录 `doc/shape/view/history/session` 与 Core `contributions/` 已删除；builtin 包独立于 protocol，不再提供组装入口。
