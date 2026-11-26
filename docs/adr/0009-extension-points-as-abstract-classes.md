# ADR 0009：扩展点用抽象类，能力协议与只读目录用接口

## 状态

已采纳

## 背景

Phase 2 有四类扩展点：命令、图形、属性、树标签。每一类的贡献对象都有共同的身份信息（名称、类型名）、共同的校验（非空、不得残缺）和共同的流程（如命令的参数校验后再构造）。

如果把扩展点定义为纯接口，这些共同部分只能靠每个实现重复书写，或者靠外部工具函数补齐，容易漏掉校验，也无法通过模板方法统一失败语义。反过来，如果把所有类型都做成抽象类，`PluginContext` 与各只读目录也会被迫继承，丧失“只表达能力”的边界。

## 决策

1. **有身份、有共同状态或共同流程的扩展点用抽象类**：
   - `CommandContribution`：名称与用法不得为空，`createCommand` 为模板方法，统一校验返回值，子类只实现 `buildCommand`；
   - `ShapeContribution`：类型名不得为空，子类实现创建与 SVG 读回；
   - `AttributeHandler`：`getName`、`handles`、`capture`、`apply` 形成“只读认领 → 快照 → 修改”的固定协议；
   - `TreeDecorator`：`decorateShape` / `decorateCanvas` 带默认实现，`onDocumentSynced` 为可选钩子。
2. **只表达能力或只读视图的类型用接口**：
   - `SvgPlugin`：插件入口，只约定 `name` 与 `activate(context)`；
   - `PluginContext`：注册能力的唯一入口，实现方可以暂存、提交或回滚；
   - `CommandCatalog`、`ShapeCatalog`、`AttributeCatalog`、`TreeDecoratorCatalog`：只读目录，只暴露查找和枚举。
3. **内核只依赖抽象或接口**：Core 与 Parser 不出现具体贡献类名，所有分派经注册表（ADR 0007、0008）。
4. **领域对象不使用“带 `type` 字段的数据接口”**：扩展点的种类差异通过子类表达，而不是通过字段判断。

## 后果

- 扩展点的共同约束集中在一个类中，新增实现只需关心自身行为。
- 构造器 `protected`，子类无法绕过校验，`instanceof` 可用于测试中断言多态关系（见 AGENTS 对新增类层次的测试要求）。
- 接口保留了“只关心能力”的使用方式，例如 `host` 只依赖 `PluginContext`，不需要知道贡献的具体类。
- 代价：继承层次比纯接口多一层，需要留意 `protected` 构造器与模板方法的签名稳定性。

## 替代方案

- **全部用接口，共同逻辑放在工具函数中**：校验与模板流程分散，无法保证每个实现都经过同一校验，不采用。
- **全部用具体基类（包括 `PluginContext`）**：插件必须继承内核类型，接口与实现耦合，不采用。
- **用 `type` 字段 + 联合类型区分扩展点**：违反 AGENTS 的禁止规则，且把分派重新带回内核，不采用。

## 代码锚点

- 抽象类：`src/protocol/commands/contribution/CommandContribution.ts`、`src/protocol/shapes/contribution/ShapeContribution.ts`、`src/protocol/attributes/AttributeHandler.ts`、`src/protocol/tree/TreeDecorator.ts`
- 接口：`src/protocol/plugins/SvgPlugin.ts`、`src/protocol/plugins/PluginContext.ts`、`src/protocol/commands/contribution/CommandCatalog.ts`、`src/protocol/shapes/contribution/ShapeCatalog.ts`、`src/protocol/attributes/AttributeCatalog.ts`、`src/protocol/tree/TreeDecoratorCatalog.ts`
- 提交：`33bee5e`（CommandContribution / ShapeContribution 改为抽象类）
