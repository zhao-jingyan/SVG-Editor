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

- `Shape`、`StyledShape` 和各具体形状均位于 `src/protocol/shapes`，作为 CLI 与 Core 共享的领域模型。
- 每个具体形状拥有私有几何状态，不通过公共字段或属性袋暴露。
- `getAttribute` 是查询行为，`setAttribute` 由具体形状按自身白名单处理；未知属性抛出 `ShapeError(CommandErrorCode.UnknownAttribute)`。
- `scale` 在修改状态前校验正整数因子；非法因子抛出 `ShapeError(CommandErrorCode.InvalidScale)`，不会产生部分修改。
- `ShapeError` 位于 `src/protocol/errors`，继承 `ProtocolError`；形状只负责抛出领域错误，Parser 在顶层将其包装为 `CommandParseErrorResult`，再由 CLI 边界转换为 DTO。

## Composite 模式

- 参与者：`Shape` 是 Component，`GroupShape` 是 Composite，五种叶子形状是 Leaf。
- 解决的问题：调用方不需要区分叶子与容器，`move`、`scale` 和公共样式设置可以统一作用于任意节点。
- 协作方式：`GroupShape` 先把操作应用到全部直接子节点；子节点若仍是组，则继续递归。
- 公共样式 `fill`、`stroke`、`stroke-width` 会传播到全部子孙；几何属性和文本内容不是组自身能力，直接报错。
- 替代方案：在命令接收者中按 `instanceof GroupShape` 分支处理。该方案会把组合知识扩散到业务流程，因此不采用。

## Factory 模式

- 参与者：`ShapeFactory` 是 Concrete Factory，具体形状类是其创建的产品。
- 解决的问题：CLI 与未来 GUI 不应各自维护“类型名 → 构造器”的重复分派。
- 协作方式：Parser 提取通用命令结构和 `in` 尾缀，工厂负责图形类型、参数数量、数字、文本和样式的集中校验。
- 替代方案：Parser 内 `switch(type)` 并直接 `new` 具体类。该方案违反项目只允许两处分派位置的规则，因此不采用。

## 当前边界

- 真实 Document、全局 id 唯一性、父子归属和删除操作尚未实现。
- 空组设置公共样式是合法空操作；未来 Document 若采用组样式继承，需要重新评估该语义。
- `box` 插件、ShapeProvider 注册表和 SVG 序列化属于后续阶段。
- 图形错误不直接进入结果 DTO；所有边界错误均由 `ProtocolError.toCommandErrorDto()` 转换。
