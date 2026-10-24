# Protocol Shapes 目录分层

## 目标

- 消除 `protocol/shapes` 根目录下模型、具体图形、工厂和 Visitor 平铺的问题。
- 将稳定的图形契约、具体实现和变化算法分开。
- 保持 Shape 类层次、多态行为和 Visitor 分派点不变。

## 目录结构

```text
src/protocol/shapes
├── concrete
│   ├── CircleShape.ts
│   ├── EllipseShape.ts
│   ├── GroupShape.ts
│   ├── LineShape.ts
│   ├── RectShape.ts
│   └── TextShape.ts
├── factory
│   └── ShapeFactory.ts
├── model
│   ├── Shape.ts
│   ├── ShapePosition.ts
│   ├── ShapeType.ts
│   └── StyledShape.ts
└── visitor
    └── ShapeVisitor.ts
```

## 职责

- `model`：抽象图形契约、样式基类和图形值类型。
- `concrete`：六种具体 Shape，包括组合容器。
- `factory`：类型名到具体 Shape 的唯一创建分派。
- `visitor`：按具体图形类型输出算法的扩展契约。

## 约束

- `GroupShape` 继续实现 Composite 语义，叶子与容器的编辑行为不变。
- `ShapeFactory` 仍是唯一的图形类型名分派点。
- `ShapeVisitor` 仍由具体 Shape 的 `accept` 分派，不在 Core 扩散类型分支。

## 验证

- 运行 `npm test` 与 `npm run build`。
