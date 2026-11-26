# Architecture Decision Records

Phase 2 正式 ADR。条目对应 `phase_cli_2.md` 第 7 节要求（≥ 3 条）。

| 编号 | 主题 |
|---|---|
| [0001](./0001-attribute-handler-contract.md) | AttributeHandler 契约与 set 路由 |
| [0002](./0002-box-svg-read-degradation.md) | box SVG 读回与降级 |
| [0003](./0003-tree-dirty-semantics.md) | modified-star dirty 语义与标签拼接 |
| [0004](./0004-plugin-manifest-validation.md) | 配置清单校验时机与回滚 |
| [0005](./0005-box-child-ids-and-invariants.md) | box 子部件 id 派生与结构不变量 |
| [0006](./0006-layering-and-builtin-split.md) | 分层边界与 `_builtin` / `protocol` 拆分 |
| [0007](./0007-command-aggregation.md) | 命令按目录聚拢与名字分派集中 |
| [0008](./0008-shape-contribution-replaces-factory.md) | 图形创建与读回由 ShapeContribution / ShapeRegistry 承担 |
| [0009](./0009-extension-points-as-abstract-classes.md) | 扩展点用抽象类，能力协议与只读目录用接口 |
| [0010](./0010-directory-listing-port.md) | 文件系统访问经 DirectoryListing 端口 |
