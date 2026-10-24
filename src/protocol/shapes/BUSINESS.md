# 图形模型与编辑语义

> Canonical owner：`src/protocol/shapes`

## 范围

- 本文档涵盖：六种内置图形的身份、坐标、移动、缩放、属性白名单和容器递归语义。
- 本文档不涵盖：全局 id 唯一性、图形挂载位置、SVG 文件语法、命令文本解析或 undo 栈。

## 核心规则

- 内置类型为 `rect`、`circle`、`ellipse`、`line`、`text` 和 `g`；`ShapeFactory` 只接受这六种类型名。
- 所有图形必须有非空 id。Shape 自身保证 id 非空；整个文档中的唯一性由 Document 的索引保证。
- 坐标遵循 SVG：原点在左上，x 向右，y 向下；几何属性和位移必须是有限数字。
- `move(dx, dy)` 永远表示增量移动，不改尺寸和内容；容器递归移动全部子孙。
- `scale(factor)` 只接受有限正数。缩放会同时乘以图形的位置和尺寸属性，容器递归到全部子孙。
- 公共样式为 `fill`、`stroke`、`stroke-width`；未设置的样式保持未设置，不填充默认文本值。
- 几何属性按类型白名单设置：rect 使用 `x`、`y`、`width`、`height`；circle 使用 `cx`、`cy`、`r`；ellipse 使用 `cx`、`cy`、`rx`、`ry`；line 使用 `x1`、`y1`、`x2`、`y2`；text 使用 `x`、`y` 和 `text`。
- 白名单外语义属性返回 `unknown attribute`。数字属性必须接收有限数字，样式文本与文本内容必须接收字符串。
- `GroupShape` 只接受公共样式设置；`move`、`scale` 和样式设置都会递归作用于当前全部子孙。空组上的递归操作是合法空操作。
- 撤销样式时允许清除公共样式；几何属性和文本内容不能被清除。
- 具体图形通过 `accept(visitor)` 把显示和 SVG 输出交给 Visitor，领域对象不包含 CLI 或文件格式逻辑。

## 状态与生命周期

- 图形构造器建立 id 和几何不变量；非法输入在创建时失败，不产生部分对象。
- `GroupShape` 只暴露子节点只读快照；插入通过指定同级索引完成，删除与归属迁移由 Document 协调。
- 图形没有隐藏的 transform 状态，移动和缩放直接更新领域几何属性。

## 特殊判断与禁止事项

- `scale` 小于等于 0 或非有限值时整体失败，不留下部分缩放。
- 容器没有单一坐标，`getPosition()` 返回 `undefined`。
- 禁止在命令、显示或 IO 层按图形类型重复构造图形；按类型名创建必须经过 `ShapeFactory`。
- 禁止让图形类读取文件、输出 CLI 文本或依赖 Node/DOM。

## 历史决策

| 决策 | 原因与证据 | 来源 |
|---|---|---|
| 用多态 Shape 层次替代 ShapeSpec 联合类型 | 让编辑行为进入领域对象，避免贫血模型和到处按类型分派 | commit `a7126ee`、[Shape](model/Shape.ts) |
| 容器使用 Composite 递归语义 | `move`、`scale`、公共样式对叶子和容器保持一致 | [GroupShape](concrete/GroupShape.ts)、[Shapes.test.ts](../../../tests/protocol/Shapes.test.ts) |
| 显示和 SVG 输出使用 Visitor | 类型相关格式不污染领域模型，也不新增业务流程分派 | [ShapeVisitor](visitor/ShapeVisitor.ts) |

## 相关代码

- 模型：[Shape](model/Shape.ts)、[StyledShape](model/StyledShape.ts)、[ShapeType](model/ShapeType.ts)、[EditableAttribute](model/EditableAttribute.ts)。
- 具体图形：[RectShape](concrete/RectShape.ts)、[CircleShape](concrete/CircleShape.ts)、[EllipseShape](concrete/EllipseShape.ts)、[LineShape](concrete/LineShape.ts)、[TextShape](concrete/TextShape.ts)、[GroupShape](concrete/GroupShape.ts)。
- 创建与扩展点：[ShapeFactory](factory/ShapeFactory.ts)、[ShapeVisitor](visitor/ShapeVisitor.ts)。
- 业务回归：[Shapes.test.ts](../../../tests/protocol/Shapes.test.ts)、[Document.test.ts](../../../tests/core/document/Document.test.ts)。
