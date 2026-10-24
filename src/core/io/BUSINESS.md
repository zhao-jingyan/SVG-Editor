# SVG 文件读写

> Canonical owner：`src/core/io`

## 范围

- 本文档涵盖：SVG 受控子集的读取、缺失 id 分配、画布尺寸推导、写出格式、元素计数和文件错误。
- 本文档不涵盖：SVG 之外的通信格式、历史锁策略、命令输入语法或图形编辑规则。

## 核心规则

- read 支持 `<svg>` 根和 `rect`、`circle`、`ellipse`、`line`、`text`、`g` 六种图形，`g` 可递归嵌套。
- 画布宽高优先读取根元素 `width` / `height`；缺失时读取 `viewBox` 的第 3、4 个值。两者都不足时读取失败。
- 受支持图形的必需几何属性必须存在且为有限数字；XML 无效、根节点不是 svg 或缺少必需属性都返回业务错误。
- 显式 id 在整个文档中必须唯一。解析前先收集显式 id，重复时返回 `id already exists`。
- 缺失 id 按 `标签名 + 序号` 分配，例如 `rect1`；分配会避开文件中后出现的显式 id，并为每个自动分配输出 warning。
- 当前只读取 `fill`、`stroke`、`stroke-width` 公共样式；不在受控子集内的元素和属性不会被当前写出流程保留。
- save 输出 XML 声明、带 `xmlns` 的 svg 根、`width`、`height` 和 `viewBox`；group 递归缩进。
- text 内容与属性值必须按 XML 规则转义，保证生成内容可再次解析。
- 元素计数包含全部叶子和容器，不包含根 `<svg>`；group 也计为一个元素。
- 受支持子集的写出结果必须可再次读取，并保持树顺序和已设置属性。

## 状态与生命周期

- `SvgDocumentParser` 只有在整份文本和全部图形解析成功后才返回新 Document；失败不产生半成品文档。
- `read` 成功替换当前文档由 Receiver 决定；IO 层只返回解析结果和警告。
- `save` 只生成文本并调用 `SvgStorage`；当前路径和历史锁由 Receiver 管理。
- `FileSvgStorage` 使用 UTF-8 读写文件；测试可注入内存 Storage，不依赖真实文件系统。

## 特殊判断与禁止事项

- 未知元素不能假装已被无损保留；当前只承诺受控子集。
- 自动 id 必须避开后续显式 id，不能因为分配顺序产生冲突。
- 只有成功写出才允许 Receiver 记录新路径或锁定历史。
- 文件不存在/不可读映射为 `cannot read file`，不可写映射为 `cannot write file`。

## 历史决策

| 决策 | 原因与证据 | 来源 |
|---|---|---|
| 使用 SvgStorage 端口 | 隔离 Node 文件系统并支持内存测试 | [SvgStorage](SvgStorage.ts)、[FileSvgStorage](FileSvgStorage.ts) |
| 读取复用 ShapeFactory、写出使用 Visitor | 保持类型创建和类型输出各自只有一个扩展点 | [SvgDocumentParser](SvgDocumentParser.ts)、[SvgShapeWriter](SvgShapeWriter.ts) |
| 预扫描显式 id 后再分配缺失 id | 防止自动补全占用文件中稍后出现的显式 id | [SvgShapeIdAllocator](SvgShapeIdAllocator.ts) |

## 相关代码

- 文件端口与适配器：[SvgStorage](SvgStorage.ts)、[FileSvgStorage](FileSvgStorage.ts)。
- 解析与结果：[SvgDocumentParser](SvgDocumentParser.ts)、[ParsedSvgDocument](ParsedSvgDocument.ts)、[SvgShapeIdAllocator](SvgShapeIdAllocator.ts)。
- 写出：[SvgDocumentWriter](SvgDocumentWriter.ts)、[SvgShapeWriter](SvgShapeWriter.ts)、[XmlEscaper](XmlEscaper.ts)。
- 文档命令编排：[EditorDocumentCommandReceiver](../receiver/EditorDocumentCommandReceiver.ts)。
- 业务回归：[SvgDocumentParser.test.ts](../../../tests/core/io/SvgDocumentParser.test.ts)、[SvgDocumentWriter.test.ts](../../../tests/core/io/SvgDocumentWriter.test.ts)、[EditorCommandReceiver.test.ts](../../../tests/core/receiver/EditorCommandReceiver.test.ts)。
