# SVG Editor 业务状态与事实

## 1. 文档用途

本文记录当前已实现的业务状态和可验证的业务事实，面向产品行为、验收和后续需求拆分。

文档边界：

- `docs/phase_cli_1.md`：阶段需求和业务规则的来源。
- `BUSINESS.md`：当前实现到哪一步、用户可观察行为是什么。
- `docs/facts/`：实现事实、协作对象和不变量。
- `doc/README.md`：模块架构、依赖方向和设计模式。

如果需求、业务事实和实现不一致，应视为缺陷或待更新文档，不应以旧描述覆盖实际行为。

最后同步日期：2026-10-24。

## 2. 状态说明

| 状态 | 含义 |
|---|---|
| 已实现 | 当前版本可用，并由测试覆盖主要成功与失败路径 |
| 部分实现 | 核心路径可用，但明确只支持受控子集 |
| 未实现 | 当前版本不提供，调用时应得到明确错误或不存在入口 |

## 3. 模块业务状态

| 模块 | 状态 | 当前业务能力 |
|---|---|---|
| CLI 会话 | 已实现 | 提示符、逐行命令、空行跳过、错误反馈、`exit`/EOF 结束 |
| 命令解析 | 已实现 | 19 个命令名、双引号参数、元数和数字校验、统一解析错误 |
| 命令执行 | 已实现 | 具体命令对象执行，可预期失败转换为业务错误结果 |
| 文档生命周期 | 已实现 | `init`、`read`、`save`、`canvas` |
| 图形编辑 | 已实现 | rect、circle、ellipse、line、text、g 及容器结构编辑 |
| 撤销重做 | 已实现 | 九类编辑命令的 undo/redo，IO/画布操作后的历史锁 |
| 显示 | 已实现 | `tree`、`show`、`help`，不修改文档和历史 |
| SVG IO | 部分实现 | 读写受控 SVG 子集，缺 id 自动补全，不支持完整保真 |
| 插件图形 | 未实现 | `box` 等插件类型当前报 `unknown shape type` |
| GUI/渲染器 | 未实现 | 当前只有 CLI，不提供画布交互或预览窗口 |

## 4. CLI 会话状态

会话有两个业务状态：

```text
NO_DOCUMENT
  ├── init 成功 ────────────────> WITH_DOCUMENT
  ├── read 成功 ────────────────> WITH_DOCUMENT
  ├── help ─────────────────────> NO_DOCUMENT
  ├── 其他命令 ─────────────────> error: no document...
  └── exit / EOF ───────────────> ENDED

WITH_DOCUMENT
  ├── init / read 成功 ─────────> WITH_DOCUMENT（替换当前文档）
  ├── 编辑/显示/IO/canvas ──────> 按命令结果保持或更新状态
  └── exit / EOF ───────────────> ENDED
```

会话行为：

- 启动后显示可选启动提示，每条输入前显示 `svg> `。
- 空行、纯空白行和首个非空字符为 `#` 的注释行不执行命令，也不输出额外消息。
- 解析失败和命令失败输出一行 `error: <message>`，会话继续。
- `exit` 或输入流 EOF 结束会话。
- 未被业务结果建模的内部异常直接终止进程并返回非零状态，不伪装成普通命令失败。

## 5. 文档状态与历史状态

文档状态与历史状态相互独立：

- 文档状态：无文档、有文档。
- 历史状态：可撤销、锁定。

| 操作 | 文档结果 | 历史结果 |
|---|---|---|
| `init` 成功 | 创建默认或指定尺寸的新文档 | 清空历史并锁定 undo/redo |
| `read` 成功 | 替换文档并记录当前路径 | 清空历史并锁定 undo/redo |
| `canvas` 无参数 | 只显示尺寸 | 不改变 |
| `canvas <w> <h>` 成功 | 修改画布尺寸 | 保留历史并锁定 undo/redo |
| `save` 成功 | 文档不变，更新当前路径 | 保留历史并锁定 undo/redo |
| 编辑命令成功 | 修改图形结构或属性 | 记录一个 undo 单元并解除历史锁 |
| `tree` / `show` / `help` | 文档不变 | 不改变 |
| `undo` / `redo` | 恢复或重放一个编辑单元 | 在 undo/redo 栈之间移动命令 |
| 任意命令失败 | 保持操作前状态 | 保持操作前状态 |

关键规则：

- 一条编辑命令是一个 undo 单元，复合容器的操作也作为整体撤销。
- 历史锁定后，`undo`/`redo` 返回：`undo not allowed after io command`。
- `init`、`read` 会清空历史；`save`、`canvas` 和 IO 后的历史锁不会自动清空历史。
- 失败命令不得产生部分修改，也不得改变历史栈和历史锁。

## 6. 命令业务分组

| 分组 | 命令 | 是否修改文档 | 是否进入历史 |
|---|---|---|---|
| 文档 | `init`、`read`、`save`、`canvas` | 按命令决定 | 否；修改性操作成功后锁定历史 |
| 创建 | `create` | 是 | 是 |
| 图形编辑 | `delete`、`move`、`scale`、`set` | 是 | 是 |
| 结构编辑 | `group`、`ungroup`、`addto`、`front`、`back` | 是 | 是 |
| 显示 | `tree`、`show`、`help` | 否 | 否 |
| 历史 | `undo`、`redo` | 条件性恢复文档 | 调整历史栈 |
| 会话 | `exit` | 否 | 否 |

## 7. 图形与文档不变量

- 坐标系与 SVG 一致：原点左上，x 向右，y 向下，数值允许浮点。
- 每个图形必须有全局唯一且大小写敏感的 `id`。
- `g` 是容器，可嵌套；`move`、`scale`、`set`、`delete` 对容器与叶子统一生效。
- `group` 创建新容器并收编已有图形；`addto` 移动已有图形归属；`create ... in <containerId>` 在创建时直接指定父容器。
- `ungroup` 把直接子节点提升到原父级，并占据原容器位置。
- `front`/`back` 只改变同级顺序，不改变父子关系。
- 失败操作保持文档结构、索引、顺序和属性不变。

## 8. SVG 读写业务保证

已支持：

- `<svg>` 根和 `rect`、`circle`、`ellipse`、`line`、`text`、`g` 六种图形。
- 根画布尺寸读取 `width`/`height`，缺失时回退到 `viewBox`。
- 缺 id 元素按标签自动分配 `<tag><n>`，并在成功消息前输出 warning。
- `read` 成功消息包含读取路径和元素数量；`save` 成功消息包含保存路径和元素数量。
- 文件读写失败分别返回 `cannot read file: <path>` 和 `cannot write file: <path>`。

当前不保证：

- 保留未知元素、注释和原始格式。
- 完整解析复杂 `transform`、样式继承、`defs` 或外部引用。
- SVG 全规范兼容或无损 round-trip。

## 9. 当前业务边界

- 只提供 CLI 入口，不包含 GUI、实时预览或鼠标编辑。
- 内核只识别六种图形类型；`box` 和 ShapeProvider 插件体系尚未实现。
- 当前历史锁以“IO/画布后禁止撤销，直到下一次编辑”为业务规则，不提供手动解锁命令。
- `read` 是文档替换操作，不提供合并导入。
- 未知内部异常是系统故障，不是可继续执行的一般业务错误。

## 10. 业务事实登记

| 编号 | 业务事实 | 验证入口 |
|---|---|---|
| BIZ-CLI-001 | 空行和注释行是无副作用输入 | `tests/cli/parser/tokenization/CommandLineTokenizer.test.ts` |
| BIZ-CLI-002 | 解析错误输出后会话继续 | `tests/cli/session/CommandSession.test.ts` |
| BIZ-CLI-003 | `exit` 后不再读取后续输入 | `tests/cli/session/CommandLoop.test.ts` |
| BIZ-CLI-004 | 未知内部异常终止进程 | `src/main.ts` |
| BIZ-DOC-001 | 无文档时编辑、显示和撤销返回 no-document 错误 | `tests/core/EditorContext.test.ts` |
| BIZ-DOC-002 | `read` 失败不替换原文档 | `tests/core/EditorContext.test.ts` |
| BIZ-HIST-001 | `init`/`read` 清空历史并锁定 undo/redo | `tests/core/EditorContext.test.ts` |
| BIZ-HIST-002 | `save`/`canvas` 保留历史但锁定 undo/redo | `tests/core/EditorContext.test.ts` |
| BIZ-HIST-003 | 失败命令不进入历史栈 | `tests/core/EditorContext.test.ts` |
| BIZ-IO-001 | SVG 缺 id 自动补全并警告 | `tests/core/io/SvgDocumentParser.test.ts` |
| BIZ-IO-002 | 受控图形可完成读写 round-trip | `tests/core/io/SvgDocumentWriter.test.ts` |
| BIZ-SHAPE-001 | 容器与叶子统一支持编辑操作 | `tests/protocol/Shapes.test.ts` |
| BIZ-SHAPE-002 | 文档恢复保持结构与顺序不变量 | `tests/core/document/DocumentRestore.test.ts` |

## 11. 维护规则

- 修改用户可观察行为时，同步更新本文对应状态、迁移规则或业务事实。
- 新增命令时，至少更新命令分组、业务事实和失败语义。
- 修改 IO、历史锁或错误恢复策略时，必须检查“失败不改变状态”的业务不变量。
- 业务规则与 `docs/phase_cli_1.md` 冲突时，以需求为准并补充实现差异说明。
- 文档事实必须能落到测试、源码入口或明确的未实现边界。
