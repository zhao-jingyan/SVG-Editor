# Plan4：Protocol Shapes 面向对象重构

## 摘要

- 将 `src/protocol/shapes` 从只读 `ShapeSpec` 联合类型改为 `Shape` 抽象类 + 具体形状类，删除全部 `*ShapeSpec`。
- 形状自行封装身份、几何状态和 `move/scale/setAttribute/getAttribute` 行为；`GroupShape` 通过 Composite 递归处理子节点。
- 新增 `ShapeFactory`，成为唯一的“类型名 → 具体形状类”分派点；Parser 不再按图形类型 `switch` 或构造领域对象。
- CLI 与 Core 边界直接传递 `Shape`。本轮不实现真实 Editor、文档状态、SVG IO 或插件系统。

## 公共模型

- `ShapeType` 使用枚举固定 `rect/circle/ellipse/line/text/g` 六种内置类型。
- `Shape` 抽象类保存私有 id，定义 `getType`、`move`、`scale`、`setAttribute`、`getAttribute`。
- `StyledShape` 统一封装 `fill`、`stroke`、`stroke-width` 和公共样式读写。
- 具体类为 `RectShape`、`CircleShape`、`EllipseShape`、`LineShape`、`TextShape`、`GroupShape`。
- `GroupShape` 维护私有子节点数组，提供 `addChild`、`removeChild`、`getChildren`；移动、缩放和公共样式设置递归执行。
- `ShapeError` 携带稳定的 `CommandErrorCode`，覆盖构造、工厂和属性操作错误。

## 工厂与接线

- `ShapeFactory.create(typeName, id, args)` 接收排除 `in` 子句后的图形参数，集中完成类型分派、参数数量、数字、文本和可选样式校验。
- `CommandLineParser` 构造器注入 `ShapeFactory`，只处理通用 `in <containerId>` 尾缀和 `ShapeError` 到解析错误的转换。
- `CreateCommand`、`CommandContext`、`DemoCommandContext` 和测试接收者统一使用 `Shape`。
- `main.ts` 显式组装 `CommandLineParser` 与 `ShapeFactory`。

## 测试与文档

- 新增形状模型测试，覆盖具体类、`instanceof Shape`、构造器不变量、多态移动/缩放、属性白名单和错误分支。
- 覆盖 `GroupShape` 的嵌套递归、子节点顺序、样式传播、重复 id 和只读子节点暴露。
- Parser、CommandHierarchy、DemoExecutor 测试改为真实形状对象断言。
- 更新 `docs/facts/cli-core-boundary.md`，新增图形模型事实文档，移除 `AGENTS.md` 中已解决的技术债。
- 验证命令为 `npm test`、`npm run build` 和 CLI 管道冒烟测试。

## 假设

- 形状 id 的全局唯一性由未来 Document 保证；`GroupShape` 只检查直接子节点重复。
- 本轮不新增宽高、半径等正数约束，只要求有限数字和缩放因子为正。
- `GroupShape` 不保存自己的样式状态；空组上的公共样式设置为合法空操作。
