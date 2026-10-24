# CLI 业务知识

> Canonical owner：`src/cli`

## 范围

- 本文档涵盖：终端会话、逐行输入、命令文本解释、解析反馈、错误输出和会话结束条件。
- 本文档不涵盖：文档生命周期、图形编辑规则、撤销栈、SVG 文件语义或命令在 Core 中的副作用。这些行为由对应模块的业务 owner 维护。

## 核心规则

- 一行输入只有三种业务结果：空输入、已解析命令或解析错误。空行、纯空白行和首个非空字符为 `#` 的注释行不产生命令，也不产生输出。依据：[CommandLineTokenizer](parser/syntax/CommandLineTokenizer.ts) 的 `tokenize`。
- 双引号用于保留参数中的空白；`""` 表示空字符串参数。引号未闭合属于解析错误。依据：[CommandLineTokenizer](parser/syntax/CommandLineTokenizer.ts) 的 `scan` 与 [CommandArguments](parser/syntax/CommandArguments.ts)。
- 解析错误和已建模的命令失败都输出一条 `error: <message>`，随后继续读取下一条输入；CLI 当前不向用户显示错误码。依据：[CommandSession](session/CommandSession.ts) 的 `handle` 与 `writeError`。
- 命令成功后输出命令结果中的业务消息。成功的命令名分派只由 [CommandDefinitionRegistry](parser/definition/CommandDefinitionRegistry.ts) 维护，CLI 其他对象不得再增加第二套命令名分派。
- `exit` 或输入流 EOF 结束会话；结束前已经执行的命令不回滚。依据：[CommandLoop](session/CommandLoop.ts) 的 `run`。
- 未被业务结果建模的未知异常不是普通命令失败，不允许被 CLI 吞掉并继续会话；进程边界负责输出错误并非零退出。依据：[main.ts](../main.ts) 与 [CommandSession](session/CommandSession.ts) 的 `handle`。

## 状态与生命周期

- CLI 会话的生命周期只有“读取中”和“已结束”。启动提示、每条输入前的 `svg> ` 提示以及结束条件属于 CLI；依据：[CommandLoop](session/CommandLoop.ts)。
- “当前是否有文档”不是 CLI 会话状态。CLI 只负责把命令交给 Executor，不根据文档状态修改命令语义。
- 单条输入在 CLI 边界内按以下顺序完成：读取、解释、空输入跳过或执行一次已解析命令、输出结果。成功解析只执行一次，解析错误不会进入 Executor；依据：[CommandSession](session/CommandSession.ts)。
- 命令执行失败不得被 CLI 解释为成功，也不得改变 CLI 对后续输入的继续策略。
- 会话结束由 `exit` 或 EOF 决定，不以输出错误条数、命令失败次数或文件读写结果决定。

## 特殊判断与禁止事项

- `#` 只有作为首个非空字符时才开始注释；参数内部的 `#` 按普通参数处理，例如颜色值。
- CLI 负责“输入是什么命令”以及“结果如何反馈”，不得承载图形编辑规则、文档状态或历史栈规则。
- 解析器不得执行命令或修改文档；会话只消费解析结果的业务语义，不重新解析原始文本。
- 未知内部异常不能转换成可恢复的业务错误。继续运行可能掩盖程序缺陷或损坏的进程状态。
- 启动文案、提示符和 `error:` 前缀是 CLI 的用户可见契约，不应下沉到 Parser 或 Core。

## 历史决策

| 决策 | 原因与证据 | 来源 |
|---|---|---|
| 将控制循环与单次输入策略分离 | `CommandLoop` 只管理提示、读取和终止；`CommandSession` 管理空输入、错误反馈、执行和退出，避免主循环同时解释业务结果 | commit `f45724f`，[CommandLoop](session/CommandLoop.ts)、[CommandSession](session/CommandSession.ts) |
| 未知 Executor 异常终止进程 | 业务失败已经通过结果对象表达；未建模异常通常代表程序缺陷，继续循环会掩盖根因 | commit `f45724f`，[main.ts](../main.ts) |
| 将 Parser 拆成切词、参数、命令构造与集中注册 | 原始入口同时承担词法、全部参数规则和 19 个命令构造，修改任一命令都会扩大审查范围；命令名分派仍保持唯一 | commit `9b6ef88`，[CommandDefinitionRegistry](parser/definition/CommandDefinitionRegistry.ts)、[CommandLineParser](parser/CommandLineParser.ts) |

## 相关代码

- 会话控制：[CommandLoop](session/CommandLoop.ts)、[CommandSession](session/CommandSession.ts)。
- 解析入口与分派：[CommandLineParser](parser/CommandLineParser.ts)、[CommandDefinitionRegistry](parser/definition/CommandDefinitionRegistry.ts)。
- 切词与参数规则：[CommandLineTokenizer](parser/syntax/CommandLineTokenizer.ts)、[CommandArguments](parser/syntax/CommandArguments.ts)。
- 进程边界：[main.ts](../main.ts)。
- 业务回归：[CommandLineTokenizer.test.ts](../../tests/cli/parser/syntax/CommandLineTokenizer.test.ts)、[CommandSession.test.ts](../../tests/cli/session/CommandSession.test.ts)、[CommandLoop.test.ts](../../tests/cli/session/CommandLoop.test.ts)。
