# Phase 2 黑盒验收（p2 验收 e2e）

## 目标

把 `docs/pj1-phase2-2/phase_cli_2.md` 第 2–6 节的验收条目落成进程级黑盒测试，只经 `dist/main.js` 的标准输入输出验证，不依赖内部实现。

## 变更

- `tests/e2e/Phase2Acceptance.test.ts`：27 项，按 §2 / §3 / §4 / §5 / §6 分组；`npm run e2e:phase2` 单独运行。
- `tests/support/buildDist.ts`：vitest `globalSetup`，所有测试前只构建一次 `dist/`；`tests/e2e/Cli.test.ts` 去掉自身的 `beforeAll` 构建，避免并行写 `dist/` 的竞态。

## 验证方式

- 全部通过（27 项）。
- 注入缺陷校验：临时让 `BoxShapeContribution.matchesSvg` 恒为假，两条 box 读回测试失败；临时让 `ModifiedStarDecorator.decorateCanvas` 恒带 `*`，四条树标签与双装配测试失败。源码已还原。

## 不在黑盒范围内

- 处理器抛错回滚、多处理器 ambiguous：无法经 CLI 触发，由 `tests/core/attributes/` 契约测试覆盖。
- VSCode 扩展两项效果：另由 `vscode-extension/` 验证。

## 发现

- 验收中 `--config <相对路径>` 按运行时 cwd 解析，测试须使用绝对路径；配置文件不存在时目前报 `error: invalid plugin config`，与 spec 中"配置不合法"的表述一致，未另设错误码。
