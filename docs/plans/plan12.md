# Plan12：显示命令与启动提示

## 摘要

- 为六种图形实现 Visitor 分派，并新增 `tree/show/help` 的真实显示输出。
- 增加 REPL 启动提示，使交互入口与 `docs/phase_cli_1.md` 的 transcript 一致。
- `read/save` 继续保留占位错误，SVG IO 留到 Plan13。

## 图形显示

- `ShapeVisitor<T>` 定义矩形、圆、椭圆、线、文本和组的访问方法；各具体形状实现 `accept`，不在显示层按类型分支。
- `ShapeSummaryVisitor` 生成 tree 使用的内联摘要；`ShapeDetailVisitor` 生成 show 使用的几何与样式明细。
- `TreeDisplay` 负责根标题、子树选择、连接线、嵌套缩进和属性列对齐；`tree <id>` 只输出指定子树。
- `show` 首行输出 `type#id  parent=g#parent`，根级图形显示 `parent=svg`。
- `HelpText` 集中维护命令总表，`help` 不要求文档存在。

## 接线与反馈

- `EditorContext.tree/show` 先校验文档与图形 id，再返回一条可包含换行的成功消息；显示命令不进入历史栈，也不改变历史锁。
- `Repl` 构造器接受可选启动提示，`main.ts` 传入 `svg-editor 0.1 — type 'help' for commands`。
- 启动提示不影响解析、执行和退出流程；stdin 结束时仍正常退出。

## 测试与验证

- 覆盖全部叶子形状的摘要与明细、group 明细、嵌套棵树缩进、属性对齐和 `tree <id>`。
- 覆盖 `tree/show` 的 parent、属性内容、无文档与未知 id；覆盖 `help` 无文档可用。
- REPL 与进程级 E2E 覆盖启动提示、help、tree、show、成功/错误输出和 EOF 退出。
- 验证命令为 `npm test`、`npm run build`、`npm run test:e2e`。
