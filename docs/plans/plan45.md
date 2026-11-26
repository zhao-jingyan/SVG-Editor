# Phase 2 交付文档补齐与演示脚本入库

## 目标

按 `docs/pj1-phase2-2/phase_cli_2.md` 第 7 节核对交付清单后，补齐文档缺口，并让删除→加回演示可以从仓库复现。本计划只涉及文档、图和脚本，不修改 `src/` 下的任何源码。

## 变更

| # | 缺口 | 补齐 | 提交 |
|---|---|---|---|
| 1 | 删除→加回演示脚本只在 `/tmp`，无法复现 | 入库 `scripts/demo/demo_step.py`：仓库路径相对定位，日志与提交信息写入系统临时目录；`docs/facts/plugin-removal-demo.md` 增加用法与风险说明 | `d685cad` |
| 2 | ADR 0001 缺“处理器如何访问目标图形” | 补充类型识别、子部件定位、修改范围、撤销快照与替代方案 | `3c81cee` |
| 3 | box 子部件 id 派生与结构不变量无 ADR | 新增 ADR 0005，并更新 ADR 索引 | `2da28fe` |
| 4 | 设计模式表只覆盖 Phase 1 | `doc/README.md` §3 补 Template Method、Decorator（行标签）、Strategy（属性处理器） | `e59f113` |
| 5 | 缺迭代报告与 Phase 1 → Phase 2 架构对比图 | 新增 `doc/iteration-report-phase2.md`、`doc/architecture-comparison.puml` 与 PNG | `fca4ee7` |
| 6 | Phase 2 依赖图无 PNG，且 `_plugin` 自环标注与文字重叠 | 改为注释并渲染 `doc/architecture-phase2.png` | `4d9ee17` |
| 7 | 缺少对整体结构有约束力的 ADR | 新增 ADR 0006（分层与 `_builtin`/`protocol` 拆分）、0007（命令聚拢）、0008（图形贡献替代 `ShapeFactory`）、0009（扩展点抽象类与接口划分）、0010（`DirectoryListing` 端口） | `862f048`…`8c685e8` |
| 8 | 索引、报告与事实文档未同步；`cli-core-boundary.md` 写着“内置贡献位于 Core” | 同步 ADR 索引、迭代报告 §6、`doc/README.md` §12；修正事实文档 | `d0d7fc9` |

## 验证方式

- ADR 中的代码断言逐条对照当前源码和 git 历史：`SvgDocumentParser` 无类型 `switch` 且调用 `findForSvg`、`CreateCommandContribution` 经 `ShapeCatalog.find` 查找、`ShapeFactory` 与 `CommandType` 已无引用、`getRootShapes()` 位于 `DocumentCommandReceiver`、`SvgPlugin` 仅含 `name` 与 `activate`。核对中发现并改正了四处不准确的表述（`protocol` 仍保留内置领域图形类；`host` 同样依赖 `core` 注册表；`SvgPlugin` 成员；Core 仍有 `FileSvgStorage` 的文件访问）。
- PNG 由 PlantUML 1.2024.8 渲染，渲染后目视检查无文字重叠。
- `npm run build`、`npm run lint`、`npm test`（213 项）均通过；VSCode 扩展单元测试 4 项通过。

## 未做/待用户决定

- 不创建标签 `p2`、不推送。打标签后需重新运行 `npm run metrics`，以 `p2` 为终点再提交 `docs/metrics/`。当前 `docs/metrics/` 仅有重新生成产生的时间戳改动，尚未提交。
- `scripts/demo/demo_step.py` 迁移路径后只做了 `py_compile` 语法检查，未重新执行；它会创建提交与标签，只能在演示分支上运行。
- VSCode 扩展宿主集成测试需要 Electron 窗口，本轮未重跑。
- 选做的拓展任务未实施。
