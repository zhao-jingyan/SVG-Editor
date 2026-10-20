# Document 聚合根事实

## 职责

- `Document` 位于 `src/core/document/Document.ts`，是图形文档的实体和聚合根门面。
- Document 持有画布宽高和私有 `ShapeHierarchy`；查询与结构编辑统一委托给层级对象。
- `ShapeHierarchy` 持有根级有序图形并实现增删、容器嵌套、group/ungroup、归属迁移和同级重排。
- `ShapeIndex` 维护全局 `id -> Shape` 索引、`id -> parent GroupShape` 映射、子树注册/注销和祖先判断。
- Document 不直接维护索引或编辑规则，也不持有文件路径、历史栈、SVG DOM、命令结果或 IO 状态；这些属于后续 EditorContext 或 IO 边界。

## 存储模型

- 根级顺序事实来源是 `ShapeHierarchy` 的私有 `rootShapes` 数组。
- 嵌套顺序事实来源是 `GroupShape` 内部的私有子节点数组。
- `ShapeIndex` 的 `shapesById` 是全局查找索引，`parentsById` 是父节点索引；两者必须与树结构同步。
- 子树注册前先完成内部和全局重复 id 校验，注销时移除目标子树的全部索引；单节点注销用于 ungroup 后保留子节点索引。
- 同级索引由有序子节点列表派生，不维护第二套可变顺序数据。
- 根节点不是 `GroupShape`，因此根级没有 id，也没有可 ungroup 的容器身份。

## 行为边界

- `addShape` 先通过 `ShapeIndex` 校验整棵子树的 id，再校验父容器，最后追加到根级或父容器末尾。
- `deleteShape` 由 `ShapeHierarchy` 删除叶子或整棵容器子树，并由 `ShapeIndex` 清理全部索引。
- `moveShape`、`scaleShape`、`setAttribute` 只解析目标并委托 Shape 多态行为。
- `groupShapes` 的新容器固定在根级，成员按当前文档先序排列。
- `ungroupShapes` 只处理非根级容器，子节点插入容器原索引位置。
- `addToContainer` 只改变归属，不创建图形。
- `reorderShape` 只调整同级顺序，不改变父子关系。

## 设计模式角色

### Entity / Aggregate Root

- 参与者：`Document` 是聚合根门面，`Shape` 是聚合内实体，`ShapeHierarchy` 和 `ShapeIndex` 是内部协作对象。
- 解决的问题：在整棵树上统一维护 id、父子、顺序和失败原子性，同时避免单个类持续膨胀。
- 协作方式：Document 提供稳定入口，ShapeHierarchy 修改树结构，ShapeIndex 校验并同步索引。
- 替代方案：公开数组和 Map 让外部自行修改会破坏状态一致性；拆成 `CreateService`、`GroupService` 等无状态 CRUD 服务会把领域规则退化为事务脚本，因此均不采用。

### Facade / Delegation

- 参与者：`Document` 是 Facade，`ShapeHierarchy` 与 `ShapeIndex` 是内部子系统。
- 解决的问题：调用方继续面对稳定的 Document API，不必了解树结构与索引的两次协作。
- 协作方式：Document 保留画布职责，将查询和结构编辑委托给 ShapeHierarchy；多态编辑先解析 Shape 再调用对象行为。
- 替代方案：让调用方分别持有层级和索引对象会把不变量维护责任推给上层，因此不采用。

### Composite

- 参与者：`Shape` 是 Component，`GroupShape` 是 Composite，叶子形状是 Leaf。
- 解决的问题：根级与嵌套节点可以统一添加、删除、移动、缩放和查询。
- 协作方式：`ShapeHierarchy` 维护根级顺序，`ShapeIndex` 维护父子索引，`GroupShape` 递归承载子节点。
- 替代方案：在命令层到处使用 `instanceof GroupShape` 会扩散组合知识，因此不采用。

## 后续模式边界

- Command：具体命令封装请求，Document 只是接收者背后的领域模型；Document 不保存历史栈。
- EditorContext：未来作为应用层门面统一对 CLI/Core 暴露命令接收者接口，并委托 Document。
- Factory：`ShapeFactory` 负责从文本或 SVG 创建具体 Shape，Document 只接收已创建对象。
- Memento：后续由具体命令保存局部状态、父节点和顺序；Document 不保存整文档快照。
- Visitor：后续用于 `tree/show/save` 等按图形类型输出的外部算法；Document 只提供树查询，不实现 Visitor。
