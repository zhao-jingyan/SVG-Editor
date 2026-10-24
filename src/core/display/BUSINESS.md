# tree、show 与 help 显示

> Canonical owner：`src/core/display`

## 范围

- 本文档涵盖：结构树格式、单图形明细格式、help 命令列表，以及显示内容的用户可见规则。
- 本文档不涵盖：图形状态修改、历史记录、SVG 序列化或命令解析。

## 核心规则

- `tree` 无参数时以 `svg (WxH)` 为根，按文档同级顺序递归显示全部图形。
- `tree <id>` 只显示以该 id 为根的子树；根行不带连接符，后代使用树形连接线。
- tree 行统一为 `类型#id` 加关键属性；叶子内联几何和已设置样式，容器只显示 `g#id`。
- rect 显示 `x y w h`，circle 显示 `cx cy r`，ellipse 显示 `cx cy rx ry`，line 显示两个端点，text 显示坐标和 JSON 引号包裹的内容。
- 未设置的样式不出现在 tree 或 show 中；值为空的字符串样式与未设置是不同状态。
- `show <id>` 首行显示 `type#id parent=svg` 或 `parent=g#父id`；后续按图形类型显示几何、文本和样式明细。
- group 的 show 只显示直接子节点数量，不递归展开；需要层级时使用 tree。
- `help` 输出集中维护的完整命令表，不依赖当前文档。
- 显示命令只读，不修改 Document，不进入历史栈，也不改变历史锁。

## 状态与生命周期

- `ShapeSummaryVisitor` 和 `ShapeDetailVisitor` 是无持久状态的显示策略；每次渲染读取当前 Document。
- TreeDisplay 先收集行和属性，再统一计算标签宽度和连接线，保证属性列对齐。
- 显示结果是包含换行的成功消息，由 CommandResult 交给 CLI 输出。

## 特殊判断与禁止事项

- 显示层不得把展示格式写回 Shape，也不得按具体类型在 Receiver 中扩散分支。
- tree 的层级顺序必须与 Document 当前顺序一致。
- help 文案是用户可见契约，新增命令时必须同步维护。

## 历史决策

| 决策 | 原因与证据 | 来源 |
|---|---|---|
| tree/show 通过 Visitor 扩展 | 类型相关格式离开领域对象，避免新增类型分派点 | [ShapeVisitor](../../protocol/shapes/visitor/ShapeVisitor.ts)、[ShapeSummaryVisitor](ShapeSummaryVisitor.ts) |
| 属性内联到 tree | 脱离画布时仍能识别图形几何和顺序 | [TreeDisplay](TreeDisplay.ts)、[ShapeDisplay.test.ts](../../../tests/core/display/ShapeDisplay.test.ts) |
| help 文本集中维护 | 避免帮助内容散落在 Parser 或 Receiver | [HelpText](HelpText.ts) |

## 相关代码

- 显示入口：[TreeDisplay](TreeDisplay.ts)、[ShapeSummaryVisitor](ShapeSummaryVisitor.ts)、[ShapeDetailVisitor](ShapeDetailVisitor.ts)、[HelpText](HelpText.ts)。
- 命令编排：[EditorViewCommandReceiver](../receiver/EditorViewCommandReceiver.ts)。
- 业务回归：[ShapeDisplay.test.ts](../../../tests/core/display/ShapeDisplay.test.ts)、[EditorCommandReceiver.test.ts](../../../tests/core/receiver/EditorCommandReceiver.test.ts)。
