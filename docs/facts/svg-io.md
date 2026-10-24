# SVG 读写事实

## 职责与依赖

- `src/core/io` 存放 SVG 文件适配、解析和序列化对象；`protocol` 不依赖 Node、文件系统或 `io`。
- `SvgStorage` 是文件访问接口，`FileSvgStorage` 使用 Node `fs/promises` 实现，测试通过内存实现注入。
- `DocumentManager` 持有可注入的 `SvgStorage`、`SvgDocumentParser`、`SvgDocumentWriter` 和当前文件路径。
- `SvgDocumentParser` 通过 `ShapeFactory` 创建具体图形；`SvgShapeWriter` 实现 `ShapeVisitor<string>`，按图形类型生成 SVG 元素。

## read

- 支持 `<svg>` 根及 `rect`、`circle`、`ellipse`、`line`、`text`、`g` 六种图形，`g` 可嵌套。
- 画布尺寸优先读取根元素 `width`/`height`，缺失时回退到 `viewBox` 的宽高。
- 显式 id 全局唯一；重复 id 返回 `DuplicateId`，消息为 `id already exists: <id>`。
- 缺 id 的元素按标签自动分配 `<tag><n>`，并输出 `warning: assigned id <id> to unnamed <<tag>>`；分配会避开文件后续出现的显式 id。
- 读取并解析成功后替换 Document、记录当前路径、清空历史并锁定 undo/redo；失败时保留原文档与历史。
- 文件读取失败返回 `IoRead`，消息为 `cannot read file: <path>`；XML 或属性错误返回 `InvalidArgument` / `InvalidNumber`，图形构造错误使用 `ErrorSource.Shape`。

## save

- `save <path>` 写出到指定路径；`save` 无参数时使用 read 或上一次 save 记录的当前路径。
- 无当前路径且未提供参数时返回 `InvalidArgument`，消息为 `save requires a file path`。
- 写出失败返回 `IoWrite`，消息为 `cannot write file: <path>`；失败不会锁定历史。
- 写出成功后锁定 undo/redo，但不清空既有历史；下一次成功编辑重新解锁。
- 文件包含 XML 声明、`xmlns`、`width`、`height` 和 `viewBox`；group 递归缩进，文本与属性值按 XML 规则转义。

## 当前边界

- 仅保证本阶段六种图形的受控子集；“保留未知元素和注释”“复杂样式继承”“transform 解析”“外部实体”等能力不在当前范围。
- 元素计数包含全部图形和嵌套 group，不包含根 `<svg>`。
- 读写使用 UTF-8 文本，路径原样交给 `SvgStorage`，由适配器遵循 Node 的当前工作目录语义。
