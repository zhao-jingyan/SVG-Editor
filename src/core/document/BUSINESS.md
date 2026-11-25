# Document、层级与精确恢复

> Canonical owner：`src/core/document`

## 范围

- 本文档涵盖：画布尺寸、图形身份、父子归属、同级顺序、分组与解组、归属迁移、层级重排，以及撤销所需的精确恢复。
- 本文档不涵盖：命令文本解析、图形自身几何计算、历史栈、文件读写或结果 DTO。

## 核心规则

- Document 默认画布为 `800x600`；宽高必须是有限正数，非法的 resize 整体失败并保留旧尺寸。
- Document 根级不是 `GroupShape`。根级可按顺序保存图形，根节点本身没有 id，也不能被 ungroup。
- 全文档 id 大小写敏感且唯一。新增整棵子树前先检查所有内部和全局 id，任一冲突都不得产生部分添加。
- 图形可挂在根级或一个 `GroupShape` 下；父级不存在返回 `no such container`，父级不是容器返回 `not a container`。
- `delete` 删除叶子或整个容器子树，并在成功后注销全部相关 id 与父子索引。
- `group` 至少需要两个成员，成员 id 不能重复；新容器位于根级，成员按当前文档先序排列并从原父级摘下。
- `group` 可跨父级收编，但不能同时包含某容器与其子孙。
- `ungroup` 只允许非根级 `GroupShape`；子图形按原顺序插入容器的原同级位置，容器身份被移除。
- `addto` 只迁移已有图形，追加为容器最后一个子节点；不能把容器移入自身或自己的后代。
- `front` / `back` 只改变同级顺序：front 移到索引 0，back 移到同级末尾，不改变父子关系。
- `move`、`scale`、`set` 先按 id 定位图形，再委托 Shape 多态行为；Document 不按具体图形类型分支。

## 状态与生命周期

- 根级顺序由 `ShapeHierarchy` 私有数组维护；嵌套顺序由 `GroupShape` 私有子节点数组维护。
- `ShapeIndex` 维护全局 id、父容器映射和祖先判断，所有树结构变更必须同步更新索引。
- `ShapePlacement` 保存图形、原父级和原索引；一组 placement 先按父级分组、再按索引升序恢复，避免顺序错位。
- `ShapeAttributeSnapshot` 只捕获目标子树的叶子旧值；恢复时逐个叶子写回，原本不存在的公共样式执行 unset。
- 恢复前校验父级、索引、重复 id 和祖先冲突；校验失败时不修改现有结构。

## 特殊判断与禁止事项

- 容器没有单一位置；位置反馈只适用于叶子图形。
- 删除或移动失败必须是原子的，不能只更新树结构而遗漏索引。
- Document 不持有文件路径、撤销栈、SVG DOM、命令结果或 IO 锁。
- 禁止让调用方直接修改根数组、子节点数组或 id 索引。

## 历史决策

| 决策 | 原因与证据 | 来源 |
|---|---|---|
| Document 作为聚合根门面 | 统一维护尺寸、树结构与索引不变量，外部不直接操作内部 Map/数组 | [Document](Document.ts) |
| 拆分 ShapeHierarchy 与 ShapeIndex | 分别承担结构编辑和身份/父子索引，避免聚合根膨胀 | commits `7d8f089`、`f0a6163` |
| 使用 Placement 和 AttributeSnapshot 精确恢复 | 支持结构顺序和无属性状态的 undo，不复制整份文档 | [DocumentRestore.test.ts](../../../tests/core/document/DocumentRestore.test.ts) |

## 相关代码

- 聚合根：[Document](Document.ts)。
- 内部协作：[ShapeHierarchy](ShapeHierarchy.ts)、[ShapeIndex](ShapeIndex.ts)。
- 撤销快照：[ShapePlacement](../../protocol/commands/memento/ShapePlacement.ts)、[ShapeAttributeSnapshot](../../protocol/commands/memento/ShapeAttributeSnapshot.ts)。
- 业务回归：[Document.test.ts](../../../tests/core/document/Document.test.ts)、[DocumentRestore.test.ts](../../../tests/core/document/DocumentRestore.test.ts)、[ShapeIndex.test.ts](../../../tests/core/document/ShapeIndex.test.ts)。
