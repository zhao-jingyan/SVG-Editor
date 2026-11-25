# 命令与贡献同目录（protocol/commands/XxxCommand）

## 目标

- 每个具体命令目录 `protocol/commands/builtin/XxxCommand/` 同时存放 `Command` 与对应 `*CommandContribution`。
- `front`/`back` 共用 `ReorderCommand/`；`EditableAttributeParser` 随 `SetCommand/`。
- Core 只保留 `CommandRegistry` 与 `BuiltinCommandContributions` 组装入口。

## 完成状态

- 已迁移；族目录 `doc/shape/view/history/session` 与 Core `contributions/` 已删除。
