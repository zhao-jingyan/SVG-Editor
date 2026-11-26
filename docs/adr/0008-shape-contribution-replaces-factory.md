# ADR 0008：图形创建与读回由 ShapeContribution / ShapeRegistry 承担

## 状态

已采纳

## 背景

Phase 1 的图形创建由 `ShapeFactory` 的类型 `switch` 完成，SVG 读回由 `SvgDocumentParser` 按 tag 的 `switch` 完成。图形种类是封闭集合，新增图形需要同时修改工厂与解析器。

`box` 插件需要以 `<g data-kind="box">` 的形式被认领和读回，而 `g` 本身已经是普通容器。仅靠 tag 的 `switch` 无法表达“同样是 `g`，带 `data-kind=box` 的归插件，其它归 Group”。因此分派规则必须能查询“tag 加 data-kind”的组合。

## 决策

1. **贡献对象承担一种图形的全部入口**：`ShapeContribution`（抽象类）提供三件事：
   - `getTypeName()`：类型名，构造器校验非空；
   - `createShape(id, args)`：由 `create <type> <id> args...` 创建图形；
   - `matchesSvg(tag, dataKind)` 与 `readFromSvg(input)`：认领 SVG 元素并还原图形，结构不完整时抛错，不返回残缺对象。
2. **运行时注册表集中分派**：`ShapeRegistry`（Core）拒绝重复类型名。`find(typeName)` 按类型名查找，`findForSvg(tag, dataKind)` 按注册顺序取第一个认领者。
3. **Parser 与 Create 不含类型分支**：`SvgDocumentParser` 只调用 `findForSvg`；`CreateCommandContribution` 通过 `ShapeCatalog` 查找类型。两处都不出现图形类型名的 `switch`。
4. **注册顺序是契约**：内置叶子图形先注册（`installLeafShapes`），插件随后注册（方式 A 或 B），最后注册普通 `g`（`installGroupShape`）。这样 `box` 才能先于 `g` 认领（见 ADR 0002）。

## 后果

- 新增图形：实现一个 `ShapeContribution`，注册到 `ShapeRegistry`，核心代码不改。`box` 即按此方式作为插件加入。
- 读回的认领规则从“按 tag”变为“按 tag 与可选 data-kind”，表达能力更强，但认领结果依赖注册顺序，需要在装配处显式保证。
- 类型名成为跨层标识，`ShapeCatalog` 作为只读契约只暴露查找，不暴露注册。

## 替代方案

- **保留 `ShapeFactory` 的类型 `switch`（Phase 1 形态）**：图形种类闭合，插件无法注册，并且无法表达 `g + data-kind` 的认领，已删除。
- **Parser 内 `switch(tag)`**：同上，且把分派固定在 Parser 中。
- **只按 tag 建立映射表（`Map<tag, contribution>`）**：无法区分普通 `g` 与 `box`，不采用。
- **按类型名建立映射、读回时反向推导类型**：需要为每种图形保存反向规则，实际等价于 `matchesSvg`，但分散在两处，不采用。

## 代码锚点

- 贡献契约：`src/protocol/shapes/contribution/ShapeContribution.ts`、`ShapeCatalog.ts`、`ShapeSvgReadInput.ts`
- 运行时注册表：`src/core/shapes/ShapeRegistry.ts`
- 读回入口：`src/core/io/SvgDocumentParser.ts`
- 内置装配与顺序：`src/assembly/BuiltinContributionInstaller.ts`（`installLeafShapes` / `installGroupShape`）
- 插件图形：`src/_plugin/shapes/BoxShape/BoxShapeContribution.ts`
- 事实文档：`docs/facts/domain-shapes.md`；协议业务说明：`src/protocol/shapes/BUSINESS.md`（提交 `316194c`）
