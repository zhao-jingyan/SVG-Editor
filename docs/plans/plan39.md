# box 图形贡献（依赖 plan38）

## 目标

- `_plugin/shapes/BoxShape/`：`BoxShape`（扩展 `GroupShape`）+ `BoxShapeContribution`。
- **不**放入 `protocol/shapes/concrete/`：内置六种才在 protocol；插件具体类与贡献同目录，对齐 `_plugin/commands`。
- SVG：`data-kind="box"` 读回/写出；未加载插件时降级为普通 `g`（Group 匹配任意 `<g>`，box 先注册优先认领）。
- `main` 方式 A 注册；内核仅保留通用钩子（`getDataKind` / `canUngroup` / `allowsRemovingChild`），不出现 `box` 字面量分支。

## 验收

- `create box` 派生 `<id>-rect` / `<id>-label`；子树 id 冲突整单失败
- `ungroup` → `cannot ungroup composite shape`
- 删除必要子部件 → `cannot modify composite shape structure`
- 有插件 round-trip 仍为 `BoxShape`；无插件读回为 `GroupShape`
- `npm test` / `build` / `lint`

## ADR：残缺 box

- 已装插件但缺少必要子部件或多余子节点：拒绝整份 `read`，保留原文档。

## 完成状态

- 已完成（`set fill/label` 仍属 plan40；树行 `(box)` 属 TreeDecorator）。
