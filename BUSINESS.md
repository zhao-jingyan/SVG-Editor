# 业务知识索引

本文档只做索引，不承载模块规则。业务规则、状态转换和特殊判断由最接近实现目录的 `BUSINESS.md` 唯一维护。

产品行为的事实来源是 [`docs/phase_cli_1.md`](docs/phase_cli_1.md)。各模块文档记录当前实现如何落实这些规则、失败时如何保持状态，以及哪些边界不属于本模块。

## 业务域索引

| 业务域 | Canonical owner | 唯一知识文档 | 主要入口 |
|---|---|---|---|
| CLI 会话、命令文本解析与反馈 | `src/cli` | [`src/cli/BUSINESS.md`](src/cli/BUSINESS.md) | `CommandLineParser`、`CommandSession` |
| CLI 与 Core 之间的命令交换、编辑单元与撤销语义 | `src/protocol` | [`src/protocol/BUSINESS.md`](src/protocol/BUSINESS.md) | CLI Parser → Core Executor / Receiver |
| 图形模型、属性规则与 Composite 行为 | `src/protocol/shapes` | [`src/protocol/shapes/BUSINESS.md`](src/protocol/shapes/BUSINESS.md) | `Shape`、`ShapeFactory`、`GroupShape` |
| 执行端口、Receiver 契约、结果与错误边界 | `src/protocol` | [`src/protocol/BUSINESS.md`](src/protocol/BUSINESS.md) | `Executor`、`CommandReceiver`、`CommandResult`、`ProtocolError` |
| 文档状态、图形层级与精确恢复 | `src/core/document` | [`src/core/document/BUSINESS.md`](src/core/document/BUSINESS.md) | `Document`、`ShapeHierarchy`、`ShapeIndex` |
| 命令编排与文档生命周期 | `src/core/receiver` | [`src/core/receiver/BUSINESS.md`](src/core/receiver/BUSINESS.md) | `EditorCommandReceiver` 及三个能力 Receiver |
| undo / redo 历史栈与 IO 历史锁 | `src/core/history` | [`src/core/history/BUSINESS.md`](src/core/history/BUSINESS.md) | `CommandHistory` |
| tree / show / help 显示 | `src/core/display` | [`src/core/display/BUSINESS.md`](src/core/display/BUSINESS.md) | `TreeDisplay`、`ShapeSummaryVisitor`、`ShapeDetailVisitor` |
| SVG 文件读取、写出与 id 分配 | `src/core/io` | [`src/core/io/BUSINESS.md`](src/core/io/BUSINESS.md) | `SvgDocumentParser`、`SvgDocumentWriter`、`SvgStorage` |

## 按问题查找

- 命令语法、注释和空输入：看 CLI 文档；命令如何跨层交换、执行和返回结果：看 Protocol 与 Receiver 文档。
- 图形坐标、缩放、样式传播或容器操作：看 Shape 与 Document 文档。
- 撤销行为、历史锁或 IO 后能否撤销：看 Command、History 和 Receiver 文档。
- SVG 缺 id、支持元素、序列化结果：看 SVG IO 文档。
- 错误码、结果类型和跨层数据边界：看 Protocol 文档。

文档治理规则见 [`agent/docs/business-knowledge.md`](agent/docs/business-knowledge.md)。新增业务域时必须先确认唯一 owner 和可追溯源码，再补充本文索引。
