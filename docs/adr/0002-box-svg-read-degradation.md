# ADR 0002：box SVG 读回与降级

## 状态

已采纳

## 背景

`box` 序列化为 `<g data-kind="box">` 加固定派生子节点。未安装 box 插件时，文件仍应可读；已安装时必须还原为 `BoxShape`，并处理残缺结构。

## 决策

1. **写出**：`Shape.getDataKind()` 钩子；`BoxShape` 返回 `"box"`，普通图形返回 `undefined`。Writer 有值才写 `data-kind`。
2. **读回认领**：`ShapeRegistry.findForSvg(tag, dataKind)` 按注册顺序首个 `matchesSvg` 命中。`BoxShapeContribution` 匹配 `g` + `data-kind=box`；`GroupShapeContribution` 匹配任意 `g`。
3. **装配顺序**：先叶子内置 → 再插件（含 box）→ 最后注册普通 `g`，保证有插件时 box 优先。
4. **无插件降级**：只有 Group 注册时，带 `data-kind=box` 的 `<g>` 由 Group 认领，降级为普通 `GroupShape`，子节点照常挂载。
5. **有插件但结构残缺**：`BoxShape.fromChildren` 要求存在派生 id 的 rect 与 text；缺失则抛错，**整份 read 失败并保留原文档**。允许额外子节点（嵌套等），不因“多余子节点”拒绝。
6. **重复 id**：仍由文档全局唯一性拒绝整份读入，不靠降级吞掉。

## 后果

- 内核无 `box` 字面量分支，只保留通用钩子。
- 装配必须保证 box 先于 g；方式 A/B 均遵守该顺序。
- 残缺 box 宁可读失败，也不构造不完整的复合对象。

## 代码锚点

- 钩子：`src/protocol/shapes/model/Shape.ts`（`getDataKind` / `canUngroup` / `allowsRemovingChild`）
- 认领：`src/core/shapes/ShapeRegistry.ts`、`src/core/io/SvgDocumentParser.ts`
- 插件：`src/_plugin/shapes/BoxShape/BoxShape.ts`、`BoxShapeContribution.ts`
- 装配顺序：`src/main.ts`、`src/host/registerBuiltinContributions.ts`
