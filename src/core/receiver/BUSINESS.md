# 命令编排与文档生命周期

> Canonical owner：`src/core/receiver`

## 范围

- 本文档涵盖：当前文档与文件路径、文档类命令、图形和显示能力的编排、命令反馈，以及各操作对历史状态的触发时机。
- 本文档不涵盖：命令文本解析、图形几何、历史栈内部算法或 SVG 文本格式。

## 核心规则

- `EditorCommandReceiver` 实现聚合 `CommandReceiver`，把文档、图形、显示操作委托给三个能力 Receiver，把 undo/redo 委托给共享 History。
- 当前文档由 `EditorDocumentCommandReceiver` 私有持有；未初始化时，除 `init`、`read`、`help` 和 `exit` 外，编辑、显示、保存、画布和撤销命令都返回 `no document. use 'init' or 'read' first`。
- `init` 创建默认或指定尺寸的新 Document，清除当前文件路径、清空历史并锁定 undo/redo。
- `read` 成功后才替换当前文档并记录路径；文件读取或 SVG 解析失败时保留旧文档、旧路径和历史状态。
- `save` 使用显式路径；未提供时使用最近一次 read/save 记录的路径。两者都没有时返回 `save requires a file path`。
- `save` 写出成功后才更新当前路径并锁定历史；写出失败不改变路径或历史锁。
- `canvas` 无参数只查询尺寸，不改变状态；同时提供宽高时 resize，并在成功后锁定历史。只提供一边属于参数错误。
- 图形命令必须取得当前 Document；图形能力 Receiver 只负责调用 Document 和生成用户可见摘要，不保存第二份文档状态。
- `tree`、`show` 需要当前文档；`help` 不依赖文档，可在 init/read 之前使用。
- `init`、`read` 清空历史并加锁；`save` 和修改尺寸的 `canvas` 只加锁；下一次成功编辑由 History 自动解锁。

## 状态与生命周期

- 文档生命周期状态只有“尚无当前文档”和“存在当前文档”；是否可撤销由 History 的历史锁独立表达。
- 文档替换只在 init/read 中发生；普通编辑直接修改当前 Document。
- 当前文件路径属于文档 Receiver，不属于 Document、命令对象或 CLI。
- 失败命令不替换文档，也不应解除历史锁；错误通过 `ProtocolError` 上抛并被 Executor 转换为错误结果。

## 特殊判断与禁止事项

- 不允许 CLI Session 直接持有 Document、History 或文件路径。
- 不允许图形能力 Receiver 自行创建 Document 或读取文件。
- `help` 是唯一不要求文档存在的能力命令。
- 文件读取、SVG 解析和写出错误必须保持原有状态；只有成功 IO 才能改变路径与历史锁。
- 成功反馈属于用户可见契约，例如 `rect#r1 created`、`g#g1 moved by (dx,dy)`；具体格式由能力 Receiver 生成。

## 历史决策

| 决策 | 原因与证据 | 来源 |
|---|---|---|
| 聚合门面 + 三个能力 Receiver | 避免单个 Receiver 同时管理文档、图形、显示和文件细节 | commits `b06d06b`、`faf50f7`、`43d93f5` |
| 当前文档归文档 Receiver 所有 | Executor、图形和显示能力共享同一生命周期，但 CLI 不接触内部状态 | [EditorDocumentCommandReceiver](EditorDocumentCommandReceiver.ts) |
| 执行与历史记录分离 | Executor 统一决定成功命令是否入栈，Receiver 只执行操作 | [CommandExecutor](../CommandExecutor.ts) |

## 相关代码

- 聚合门面：[EditorCommandReceiver](EditorCommandReceiver.ts)。
- 能力实现：[EditorDocumentCommandReceiver](EditorDocumentCommandReceiver.ts)、[EditorShapeCommandReceiver](EditorShapeCommandReceiver.ts)、[EditorViewCommandReceiver](EditorViewCommandReceiver.ts)。
- 执行与历史：[CommandExecutor](../CommandExecutor.ts)、[CommandHistory](../history/CommandHistory.ts)。
- 业务回归：[EditorCommandReceiver.test.ts](../../../tests/core/receiver/EditorCommandReceiver.test.ts)、[CommandLoopReceiver.test.ts](../../../tests/cli/session/CommandLoopReceiver.test.ts)。
