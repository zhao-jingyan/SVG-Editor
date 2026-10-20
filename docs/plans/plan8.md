# Plan8：Document 聚合根与完整编辑语义

## 摘要

- 在 `src/core` 新增 `Document`，作为图形文档的实体和聚合根。
- Document 只负责领域状态与不变量：画布尺寸、根级顺序、全局 id、父子归属和编辑行为。
- 本轮不接入 EditorContext、Command、History、SVG IO 或显示格式化；结构操作暂不返回 undo 信息。

## 模型与公共接口

- `Document` 构造器默认 `800×600`，提供宽高查询与 `resize(width, height)`。
- 查询能力：`findShape`、`getShape`、`getParentId`、`getRootShapes`、`getChildren(parentId?)`；根级元素的 `parentId` 为 `undefined`。
- 编辑能力：`addShape`、`deleteShape`、`moveShape`、`scaleShape`、`setAttribute`、`groupShapes`、`ungroupShapes`、`addToContainer`、`reorderShape`。
- 新增 `DocumentError` 继承 `ProtocolError`，复用现有 `CommandErrorCode`。
- `GroupShape` 增加 `insertChild(child, index)`，`addChild` 改为追加语义的委托调用。

## 行为规则

- Document 内部维护根级有序列表、全局 `id -> Shape` 索引和 `id -> parent GroupShape` 映射。
- `addShape` 校验整棵子树的 id 全局唯一、父节点存在且为 `GroupShape`，成功后追加到根或父容器末尾。
- `deleteShape` 从父子结构移除目标；目标为容器时递归清除整棵子树的索引。
- `moveShape`、`scaleShape`、`setAttribute` 解析目标后委托 Shape 多态行为。
- `groupShapes` 要求至少两个不重复成员；新容器固定追加到根级，成员按当前文档先序排列。
- `ungroupShapes` 拒绝根级容器；其余容器的子节点按原顺序插入原父级的原索引位置。
- `addToContainer` 把已有图形从原归属摘下并追加到目标容器末尾；禁止自嵌套。
- `reorderShape` 在所属同级列表中移动到最前或最后。
- 所有结构变更先校验再修改，失败不留下半更新文档。

## 设计模式

- Aggregate Root：`Document` 维护整棵树的 id、父子、顺序和原子性不变量。
- Composite：`GroupShape` 递归承载子节点，Document 统一处理根级与嵌套节点。
- Command、Facade、Factory、Memento、Visitor 的职责边界记录在 `docs/facts/document.md`；本轮不实现这些上层组件。

## 测试与假设

- 覆盖画布、添加、删除、多态编辑、group、ungroup、addto、reorder 和失败原子性。
- GroupShape 覆盖 `insertChild` 的顺序、边界索引和失败前状态。
- 根节点不是 `GroupShape`，根级容器不能被 ungroup。
- Document 不保存 undo 快照、文件路径、历史栈、SVG DOM 或 IO 状态。
- 验证命令为 `npm test` 和 `npm run build`。

## 后续 TODO

- `Document` 当前同时承担聚合根门面、层级结构修改和索引维护，后续应在不改变公共 API 的前提下拆分内部协作对象：
  - `ShapeIndex`：负责全局 id、父节点索引、子树注册/注销和祖先判断，优先抽出并补充单元测试。
  - `ShapeHierarchy`：负责根级顺序、增删、group/ungroup、addToContainer 和 reorder。
  - `Document`：只保留聚合根门面、画布尺寸和公开查询/编辑入口。
- 拆分时统一移动到 `src/core/document/`，测试同步移动到 `tests/core/document/`；先保持现有行为测试通过，再接入 EditorContext 与 CommandHistory，避免文档聚合根继续膨胀。
