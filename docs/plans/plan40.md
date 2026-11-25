# AttributeHandler 与 set 路由（依赖 plan39）

## 目标

- protocol：`AttributeHandler` / `AttributeCatalog` / `EditableAttributeRules`
- core：`AttributeRegistry`；`set` 先查处理器，未命中走 Phase 1 白名单
- `_plugin`：`BoxAttributeHandler`（`fill` → rect，`label` → text）
- 一次 set 一个 undo 单元；apply 抛错则回滚快照且不入历史

## ADR

- 处理器通过 `handles(shape, attr)` 认领；多命中拒绝（ambiguous）。
- 快照用 `ShapeAttributeSnapshot`：`attribute` 为命令名，`restoreAttribute` 为叶子属性。
- `label` 不进内核白名单；解析阶段放行任意属性名，执行期再分流。

## 完成状态

- 已完成。
