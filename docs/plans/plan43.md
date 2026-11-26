# 交付审计整改（Phase 2）

依据 `docs/pj1-phase2-2/phase_cli_2.md` 对仓库逐项审计后的整改计划。

## 整改项与状态

| # | 问题 | 整改 | 状态 |
|---|---|---|---|
| 1 | 内核 `SetCommand` 特判 `label` | 快照携带撤销文案（`ShapeAttributeSnapshot.describeRestored`），box 处理器提供文案 | 已完成 |
| 2 | 插件抛异常会让执行器崩溃 | `CommandExecutor` 转 `command-failed` 错误结果 | 已完成 |
| 3 | modified-star 对根层增删/画布尺寸不敏感 | 画布指纹含尺寸与根 id 序列 | 已完成 |
| 4 | 加载器只看入口目录的 `package.json` | 向上查找最近包根 | 已完成 |
| 5 | 宿主硬编码插件；box 依赖其他插件 | 方式 A 清单移入 `src/assembly`；树标签并入 box 包；lint 强制包隔离 | 已完成 |
| 6 | 扩展点以 lambda 数据袋实现 | `CommandContribution`/`ShapeContribution` 改为抽象类（模板方法），实现类继承 | 已完成 |
| 7 | 测试缺口 | 处理器回滚/ambiguous、加载器四条失败路径、重复回滚、modified-star 独立性、`dir` 码点序/失败不影响文档/`directoryPath` | 已完成 |
| 8 | `dir` 排序依赖区域设置；符号链接规则未说明 | 改为码点序；README 写明不跟随链接 | 已完成 |
| 9 | 双装配证明不完整、e2e 基线被改 | 完整 transcript（§6、§6.1 A/B、新增命令）+ `expected/` 独立预期；空配置对照 `final` 录制输出；e2e 恢复 Phase 1 基线断言；修复 `scripts/e2e.mjs` | 已完成 |
| 10 | 指标脚本复杂度为正则估算、无职责列 | TypeScript AST 逐函数圈复杂度；职责清单；VSCode 单列；终点优先 `p2` | 已完成 |
| 11 | 文档与实际脱节 | 更新 README（扩展点表含违约位置、assembly 层、依赖图）、ADR 0001/0003/0004、facts | 已完成 |

## 未做/待用户决定

- 不创建标签 `p2`、不推送。
- §6 方式 B 的 git-diff 判据需要“仅新增插件包 + 仅改 `plugins.config.json`”的演示提交，见 `docs/facts/dual-assembly-proof.md`。
