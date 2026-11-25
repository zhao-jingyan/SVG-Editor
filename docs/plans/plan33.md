# 拆分命令族 Parser 到各贡献对象

## 目标

- 每条内置命令的参数解释落在对应 `CommandContribution` 工厂内，不再经四个命令族 Parser 间接分派。
- 删除 `DocumentCommandParser`、`CreateCommandParser`、`ShapeCommandParser`、`ViewCommandParser`。
- 共享的属性校验（`set` 用的 editable / numeric 属性表）抽成小型协作对象，避免复制，也不再挂在“命令族 Parser”上。
- 不改变 `CommandContribution` / `CommandCatalog` / `CommandLineParser` / Help / 执行语义与用户可见输出。

## 背景

上一轮（plan32）已把命令身份、usage、help 和工厂收敛到贡献对象，但工厂仍委托族 Parser：

```ts
(parameters) => shapeParser.parseMove(parameters)
```

这使“一条命令的知识”仍散在贡献表与族 Parser 两处。本轮把参数逻辑收进贡献工厂，让 contribution 成为命令扩展的唯一落点。

## 非目标

- 不引入插件生命周期、配置加载器或贡献暂存回滚。
- 不改 `Command` / `UndoableCommand` 执行与 undo。
- 不改 `CommandParameters` 公共 API。
- 不拆 `ShapeFactory`；`create` 仍通过工厂创建图形。

## 目标形态

```ts
new CommandContribution(
  "move",
  "move <id> <dx> <dy>",
  new CommandHelp("move <id> <dx> <dy>", "move a shape"),
  (parameters) => {
    parameters.expectLength(3);
    const shapeId = parameters.text(0, "shape id");
    const numbers = parameters.numbers(1, 2);
    return new MoveCommand(shapeId, numbers[0], numbers[1]);
  },
)
```

复杂命令允许抽私有函数或小型对象，但入口仍在该贡献的工厂闭包内：

- `create`：保留 `in` 尾缀解析 + `ShapeFactory.create`。
- `set`：属性名合法性和数值属性判定抽到例如 `EditableAttributeParser`（或同级 helper），只服务 `set`，不是命令族。

## 文件调整

### 保留并改写

- `src/builtin/BuiltinCommandContributions.ts`：20 个工厂内联参数逻辑。
- 可选新增：`src/core/commands/EditableAttributeParser.ts`（仅 `set` 共享校验）。

### 删除

- `src/core/commands/parsers/DocumentCommandParser.ts`
- `src/core/commands/parsers/CreateCommandParser.ts`
- `src/core/commands/parsers/ShapeCommandParser.ts`
- `src/core/commands/parsers/ViewCommandParser.ts`
- 空目录 `src/core/commands/parsers/`

### 文档

- 更新 `docs/facts/cli-core-boundary.md`、`src/cli/BUSINESS.md`、`doc/README.md` 中“命令族 Parser”表述。
- 明确：按名字分派只剩 `CommandCatalog` 与 `ShapeFactory` 两处；不再存在第三处分派点。

## 实现步骤（建议两次小提交）

1. **内联简单命令 + 删除 Document/View Parser**  
   先迁移无共享状态的命令：`init/read/save/canvas`、`tree/show/help/undo/redo/exit`，以及简单图形命令 `delete/move/scale/group/ungroup/addto/front/back`。  
   删除 `DocumentCommandParser`、`ViewCommandParser`；`ShapeCommandParser` 暂留 `set`（及若尚未迁移的部分）。

2. **内联 create/set，删除剩余族 Parser，更新文档**  
   `create` 逻辑移入贡献工厂（可本地私有函数）。  
   `set` 的属性表抽到 helper 后删除 `ShapeCommandParser`、`CreateCommandParser`。  
   同步文档与回归。

若希望一次提交也可，但优先两次以便审查。

## 测试计划

- 现有 `CommandLineParser` 全量命令构造测试保持通过。
- `HelpText` 黄金文本逐字节不变。
- E2E：init/create/edit/undo/redo、tree/show/help、read/save 输出不变。
- 若抽出 `EditableAttributeParser`，补未知属性与数值属性错误用例（可复用现有 parser 断言）。
- 最终：`npm test`、`npm run build`。

## 验收清单

- `BuiltinCommandContributions` 中每个贡献工厂直接解释参数并返回具体 `Command`。
- `src/core/commands/parsers/` 已删除。
- 无新的按命令名/`type` 分派点。
- 用户可见错误文案与 help 不变。
- 文档已去掉“命令族 Parser 负责参数语义”的过时描述。

## 假设与默认

- `BuiltinCommandContributions` 可以变长；可读性优先于强行保持短文件。若单文件过长，可按语义拆成 `documentContributions.ts` 等组装函数，但仍是“每命令一工厂”，不是族 Parser。
- `ShapeFactory` 仍由 `BuiltinCommandContributions` 构造器注入，仅 `create` 使用。

## 完成状态

- 两次小提交已落地：简单命令内联后，再内联 create/set 并删除全部族 Parser。
- `EditableAttributeParser` 仅服务 `set`。
- `npm test` 与 `npm run build` 通过。
