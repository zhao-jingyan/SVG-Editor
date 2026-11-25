# 按贡献名拆分内置命令工厂

## 目标

- 每条内置命令贡献独立为 `*CommandContribution` 类（按贡献名，非按 Command 类名）。
- `BuiltinCommandContributions` 只按 Phase 1 help 顺序组装。
- `front`/`back`、`undo`/`redo` 仍是独立贡献文件；合并 help 留在 front/undo。

## 非目标

- 不把贡献挂到 `Command` 执行类上。
- 不改解析语义、help 文本或 Registry API。

## 布局

```text
src/core/commands/contributions/
  InitCommandContribution.ts
  ...
  FrontCommandContribution.ts
  BackCommandContribution.ts
  ...
BuiltinCommandContributions.ts  # 仅组装
EditableAttributeParser.ts      # 仍仅服务 set
```

## 验证

- `npm test`、`npm run build`
- Help 黄金文本与命令构造测试不变

## 完成状态

- 20 个贡献工厂已按贡献名拆分；`BuiltinCommandContributions` 仅组装。
