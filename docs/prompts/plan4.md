# 第四轮 Prompt 与关键决策

## 用户需求

`protocol` 的 shapes 应使用更面向对象、Java 风格、教科书式的写法。请检查需求文档后给出并实施重构计划。

## 审查结论

- `docs/phase_cli_1.md` 明确要求 TypeScript 面向对象、类层次、多态、字段封装，禁止贫血模型和到处按 `type` 分派。
- 文档只允许两个按名字分派的位置：命令分发和图形工厂。
- 原 `ShapeSpec` 是可辨识联合类型，`CommandLineParser` 又在 Parser 内按图形类型 `switch` 并构造对象字面量，不符合要求。
- 容器必须具有 Composite 语义，`move`、`scale`、`set` 应递归委托给子节点。

## 讨论结论

1. `Shape` 类层次作为 `protocol/shapes` 中的共享领域模型，CLI 与 Core 直接消费，不保留 `ShapeSpec`。
2. 本轮实现完整领域行为：形状自行处理 `move`、`scale`、`setAttribute` 和属性读取。
3. `GroupShape` 对公共样式执行递归传播；几何属性和 `text` 不属于容器的可设置属性。
4. `ShapeFactory` 是唯一的图形类型分派点，Parser 只负责 tokenize、通用 `in` 尾缀和错误转换。
5. 本轮不实现 Document、真实 Editor、SVG IO、插件注册表或逆操作。

## 最终计划

见 `docs/plans/plan4.md`。
