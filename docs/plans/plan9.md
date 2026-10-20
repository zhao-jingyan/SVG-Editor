# Plan9：拆分 Document 的索引与层级职责

## 摘要

- 保持 `Document` 的构造器、公开方法、错误码、错误消息和执行顺序不变，仅在内部引入 `ShapeIndex` 与 `ShapeHierarchy`。
- `ShapeIndex` 负责全局对象索引、父节点、子树注册/注销和祖先判断；`ShapeHierarchy` 负责根级顺序、结构编辑和查询。
- `Document` 保留画布尺寸，以及公开查询/编辑入口，并将层级操作委托给 `ShapeHierarchy`。
- 不接入 Command、History、IO 或 Visitor，也不拆成无状态的 CRUD 服务。

## 结构与接口

- `src/core/document/ShapeIndex.ts` 提供 `findShape`、`getParent`、`assertSubtreeCanBeRegistered`、`registerSubtree`、`unregisterShape`、`unregisterSubtree`、`reparentShape` 和 `isAncestor`。
- `ShapeIndex` 在写入前同时检查子树内部重复 id 与全局重复 id，失败时不留下部分索引。
- `src/core/document/ShapeHierarchy.ts` 通过构造器注入 `ShapeIndex`，维护私有根级数组，提供原有查询和结构编辑能力。
- `src/core/document/Document.ts` 组合 `ShapeHierarchy` 与 `ShapeIndex`，只保留画布状态、公开 API 和委托。
- 旧的 `src/core/Document.ts` 不再保留兼容 re-export；仓库内引用统一切换到新路径。

## 行为与兼容

- `ShapeHierarchy` 保留原有校验顺序；`addShape` 先校验重复 id，再解析父容器。
- `groupShapes` 依次校验成员数量、成员重复、成员存在、容器 id 和祖先冲突，全部通过后才修改结构。
- `ungroupShapes` 只注销容器自身，保留并重新绑定子节点索引。
- `addToContainer` 摘下原归属后追加到目标末尾；`reorderShape` 只调整同级顺序。
- `moveShape`、`scaleShape`、`setAttribute` 通过 Document 查询目标后继续委托 Shape 多态行为。

## 测试与文档

- 新增 `tests/core/document/ShapeIndex.test.ts`，覆盖嵌套注册、重复 id、失败无部分写入、子树注销、单节点注销、父节点重绑定和祖先判断。
- 将 Document 测试移动到 `tests/core/document/Document.test.ts`，既有断言保持不变。
- 更新 `docs/facts/document.md`、`docs/facts/cli-core-boundary.md` 和 `docs/facts/domain-shapes.md` 的路径与职责划分。
- 验证命令为 `npm test` 和 `npm run build`。

## 假设

- “公共 API 不变”指 Document 类名、构造器签名、方法签名、返回值和行为不变，模块路径按本计划迁移。
- `ShapeIndex` 与 `ShapeHierarchy` 是 Core 内部协作对象，不新增 barrel 文件。
- 现有错误类型、错误码、错误消息及其触发顺序均属于兼容性要求。
