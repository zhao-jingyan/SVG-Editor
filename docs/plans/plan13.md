# Plan13：SVG 读写与 IO 历史锁

## 摘要

- 接入 `read/save`，支持六种图形、嵌套 group、样式、文本转义和 round-trip。
- 缺 id 自动分配并输出警告；文件错误使用既有 `IoRead`/`IoWrite` 错误码。
- `read` 替换文档、清空历史并锁定；`save` 锁定历史但保留历史栈。

## 结构与接线

- 新增 `SvgStorage` 文件访问接口与 Node 适配器 `FileSvgStorage`；`EditorContext` 构造器允许注入内存实现。
- 新增 `SvgDocumentParser`、`SvgDocumentWriter`、`SvgShapeWriter`、`XmlEscaper`、`SvgShapeIdAllocator` 和 `ParsedSvgDocument`。
- 解析通过 `ShapeFactory` 创建图形；写出通过 `ShapeVisitor` 扩展点生成元素，避免新增按图形类型分派的业务流程。
- `EditorContext` 记录当前文件路径；`init` 清除路径，`read` 设置路径，`save` 成功后更新路径。

## read 行为

- 支持 `rect/circle/ellipse/line/text/g`，group 递归解析并保持同级顺序。
- 从 `width`/`height` 或 `viewBox` 得到画布尺寸；重复显式 id 直接失败。
- 缺 id 自动分配 `${tag}${n}`，跳过文件内已出现的显式 id，并输出逐行 warning。
- 解析成功后才替换文档并清空历史；解析或文件读取失败保持原文档。

## save 行为

- 支持显式路径和当前路径；没有可用路径时返回 `InvalidArgument`。
- 写出 XML 声明、SVG 根、递归 group、几何与样式属性；文本和属性值做 XML 转义。
- 元素计数包含嵌套图形但不含 `<svg>`；成功消息为 `saved to <path> (N elements)`。

## 测试与验证

- 覆盖六类图形、嵌套顺序、缺 id 警告、自动 id 避让、viewBox、重复 id、损坏 XML 和缺属性。
- 覆盖标准 XML 输出、文本转义、零子节点 group、元素计数和 parse → write → parse round-trip。
- EditorContext 覆盖 read 成功/失败、当前路径、save 成功/失败、元素计数与 IO 历史锁。
- 进程级 E2E 使用临时目录执行 read → edit → save → undo 并检查写出的文件。
- 验证命令为 `npm test`、`npm run build`、`npm run test:e2e`。
