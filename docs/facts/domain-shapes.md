# 图形领域模型事实

## 类层次

```text
Shape（抽象类：id、类型和统一行为）
├── StyledShape（抽象类：fill、stroke、stroke-width）
│   ├── RectShape
│   ├── CircleShape
│   ├── EllipseShape
│   ├── LineShape
│   └── TextShape
└── GroupShape（组合容器）
```

- `Shape`、`StyledShape`、`ShapeType` 和 `ShapePosition` 位于 `src/protocol/shapes/model`；六种具体图形位于 `src/protocol/shapes/concrete`，共同作为 CLI 与 Core 共享的领域模型。
- 每个具体形状拥有私有几何状态，不通过公共字段或属性袋暴露。
- `getAttribute` 是查询行为，`setAttribute` 由具体形状按自身白名单处理；未知属性创建 `ErrorSource.Shape` 来源的 `ProtocolError(CommandErrorCode.UnknownAttribute)`。
- `unsetAttribute` 用于撤销时恢复“属性原本不存在”的状态：叶子形状可清除 `fill`、`stroke`、`stroke-width`，容器递归清除公共样式，几何属性和文本内容拒绝清除。
- `accept` 是每个图形的 Visitor 分派入口；新增按类型输出的算法只需实现 `ShapeVisitor<T>`，不修改形状类。
- `scale` 在修改状态前校验正整数因子；非法因子创建 `ErrorSource.Shape` 来源的 `ProtocolError(CommandErrorCode.InvalidScale)`，不会产生部分修改。
- 形状只负责创建 `ErrorSource.Shape` 来源的协议错误，Parser 在顶层统一包装为 `CommandParseErrorResult`，再由 CLI 边界转换为 DTO。
- Core 中 Document 的领域错误使用 `ErrorSource.Document` 来源，不再定义独立错误类。

## Composite 模式

- 参与者：`Shape` 是 Component，`GroupShape` 是 Composite，五种叶子形状是 Leaf。
- 解决的问题：调用方不需要区分叶子与容器，`move`、`scale` 和公共样式设置可以统一作用于任意节点。
- 协作方式：`GroupShape` 先把操作应用到全部直接子节点；子节点若仍是组，则继续递归。
- `GroupShape.insertChild` 支持在指定同级索引插入子节点，`addChild` 是其追加语义的委托。
- 公共样式 `fill`、`stroke`、`stroke-width` 会传播到全部子孙；`unsetAttribute` 同样递归清除公共样式。几何属性和文本内容不是组自身能力，直接报错。
- 替代方案：在命令接收者中按 `instanceof GroupShape` 分支处理。该方案会把组合知识扩散到业务流程，因此不采用。

## Factory 模式

- 参与者：`ShapeFactory` 是 Concrete Factory，具体形状类是其创建的产品。
- 解决的问题：CLI 与未来 GUI 不应各自维护“类型名 → 构造器”的重复分派。
- 协作方式：Parser 提取通用命令结构和 `in` 尾缀，工厂负责图形类型、参数数量、数字、文本和样式的集中校验。
- 替代方案：Parser 内 `switch(type)` 并直接 `new` 具体类。该方案违反项目只允许两处分派位置的规则，因此不采用。

## Visitor 模式

- 参与者：`Shape` 是 Element，`ShapeVisitor<T>` 是 Visitor，`RectShape` 等具体类实现 `accept` 并调用对应 `visit*`，Core 的 `ShapeSummaryVisitor`、`ShapeDetailVisitor` 与 `SvgShapeWriter` 是 Concrete Visitor。
- 解决的问题：tree/show/save 需要按具体图形类型输出不同几何属性，但显示与文件格式不应进入领域对象，也不应在 EditorReceiver 中扩散 `instanceof` 分支。
- 协作方式：显示和序列化算法把 Visitor 传给 `Shape.accept`，图形只负责选择自身访问方法；树结构和文档查询仍由 Document 提供。
- 替代方案：在显示层按 `ShapeType` 或 `instanceof` 分支会新增第三个集中分派点，因此不采用。

## 当前边界

- `Document` 位于 `src/core/document`，通过 `ShapeHierarchy` 和 `ShapeIndex` 实现全局 id 唯一性、父子归属、顺序、容器操作、删除子树和精确位置恢复；已通过 `ShapeCommands` 接入命令执行；SVG 读写实现受控子集，尚未覆盖复杂转换与无损保留。
- 属性撤销使用 `ShapeAttributeSnapshot` 捕获叶子旧值，不依赖整文档快照；容器公共样式恢复由各叶子分别执行。
- 空组设置公共样式是合法空操作；未来 Document 若采用组样式继承，需要重新评估该语义。
- `box` 插件与 ShapeProvider 注册表属于后续阶段；SVG 解析复用 `ShapeFactory`，写出复用 `SvgShapeWriter` Visitor，文件逻辑不进入 Shape 领域对象。
- 图形错误不直接进入结果 DTO；所有边界错误均由 `ProtocolError.toCommandErrorDto()` 转换。
