# ShapeContribution 与内置图形注册

## 目标

- 引入 `ShapeContribution` / `ShapeCatalog` / `ShapeRegistry`，删除 `ShapeFactory` 类型 switch。
- 六种内置图形贡献迁至 `src/_builtin/shapes/`；具体 Shape 类仍留在 `protocol/shapes/concrete/`。
- `Shape.getType()` 返回 `string`；`ShapeType` 仅作内置常量。
- Phase 2 扩展点角色名 `ShapeProvider` 对应代码类型 `ShapeContribution`。

## 验收

- `npm test`、`npm run build`、`npm run lint`
- Phase 1 help 与 E2E 行为不变

## 完成状态

- 已完成。
