# ADR 0001：AttributeHandler 契约与 set 路由

## 状态

已采纳

## 背景

Phase 1 的 `set` 只允许叶子图形白名单属性。`box` 需要把 `fill` 写到内部 rect、把 `label` 写到内部 text，且 `label` 不能进入内核白名单。框架需要可扩展的属性语义，又不能让解析器了解每种图形。

## 决策

1. 扩展点为抽象类 `AttributeHandler`（`protocol/attributes`），运行时由 `AttributeRegistry` 持有。
2. `EditorShapeCommandReceiver.setAttribute` 先 `attributeCatalog.find(shape, attribute)`；命中则走处理器，否则走 `EditableAttributeRules` Phase 1 白名单。
3. 认领规则：`handles(shape, attribute)` 只读判断；**多个处理器同时命中 → 抛 ambiguous 错误**，禁止未定义覆盖。
4. CLI 解析阶段放行任意属性名；未知属性在执行期失败，保证扩展属性不必改 Parser。
5. 一次 `set` 一个 undo 单元：执行前 `capture` 快照；`apply` 抛错则回滚快照且不入历史。
6. 快照仍用 `ShapeAttributeSnapshot`：`attribute` 保留命令侧名字（如 `label`），`restoreAttribute` 指向实际叶子属性（如 `text`）。

## 后果

- 内核 set 路径稳定；新增属性语义只需注册处理器。
- 处理器必须互斥认领，冲突在开发期/测试期暴露。
- 解析不再是属性合法性的唯一关口，错误信息更多出现在执行期。

## 代码锚点

- 契约：`src/protocol/attributes/AttributeHandler.ts`
- 调用：`src/core/receiver/EditorShapeCommandReceiver.ts`（`setAttribute` / 撤销恢复）
- 实现：`src/_plugin/shapes/BoxShape/BoxAttributeHandler.ts`
