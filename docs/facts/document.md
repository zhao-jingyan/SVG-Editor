# Document 聚合根事实

## 职责

- `Document` 位于 `src/core`，是图形文档的实体和聚合根。
- Document 持有画布宽高、根级有序图形、全局 id 索引和父节点映射。
- Document 维护全局 id 唯一、单一父节点、同级顺序、容器嵌套和删除子树等不变量。
- Document 不持有文件路径、历史栈、SVG DOM、命令结果或 IO 状态；这些属于后续 EditorContext 或 IO 边界。

## 存储模型

- 根级顺序事实来源是私有 `rootShapes` 数组。
- 嵌套顺序事实来源是 `GroupShape` 内部的私有子节点数组。
- `shapesById` 是全局查找索引，`parentsById` 是父节点索引；两者必须与树结构同步。
- 同级索引由有序子节点列表派生，不维护第二套可变顺序数据。
- 根节点不是 `GroupShape`，因此根级没有 id，也没有可 ungroup 的容器身份。

## 行为边界

- `addShape` 校验整棵子树的 id 和父容器，再追加到根级或父容器末尾。
- `deleteShape` 删除叶子或整棵容器子树，并清理全部索引。
- `moveShape`、`scaleShape`、`setAttribute` 只解析目标并委托 Shape 多态行为。
- `groupShapes` 的新容器固定在根级，成员按当前文档先序排列。
- `ungroupShapes` 只处理非根级容器，子节点插入容器原索引位置。
- `addToContainer` 只改变归属，不创建图形。
- `reorderShape` 只调整同级顺序，不改变父子关系。

## 设计模式角色

### Entity / Aggregate Root

- 参与者：`Document` 是聚合根，`Shape` 是聚合内实体。
- 解决的问题：在整棵树上统一维护 id、父子、顺序和失败原子性。
- 替代方案：公开数组和 Map 让外部自行修改会破坏状态一致性，因此不采用。

### Composite

- 参与者：`Shape` 是 Component，`GroupShape` 是 Composite，叶子形状是 Leaf。
- 解决的问题：根级与嵌套节点可以统一添加、删除、移动、缩放和查询。
- 协作方式：Document 维护根级和父节点索引，`GroupShape` 递归承载子节点。
- 替代方案：在命令层到处使用 `instanceof GroupShape` 会扩散组合知识，因此不采用。

## 后续模式边界

- Command：具体命令封装请求，Document 只是接收者背后的领域模型；Document 不保存历史栈。
- Facade：未来 `EditorContext` 统一对 CLI/Core 暴露命令接收者接口，并委托 Document。
- Factory：`ShapeFactory` 负责从文本或 SVG 创建具体 Shape，Document 只接收已创建对象。
- Memento：后续由具体命令保存局部状态、父节点和顺序；Document 不保存整文档快照。
- Visitor：后续用于 `tree/show/save` 等按图形类型输出的外部算法；Document 只提供树查询，不实现 Visitor。
