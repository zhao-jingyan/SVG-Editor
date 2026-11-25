# VSCode SVG 文件标记与大纲插件

## 目标

- 在 VSCode Explorer 中为普通 `.svg` 文件显示 `[]`，不修改文件名或文件内容。
- 在 VSCode 原生 Outline 中展示 SVG 元素的嵌套层级，支持 id 标签和源码定位。
- 编辑后重新解析并更新大纲；XML 不完整时返回空大纲，不使扩展崩溃。
- 提供示例 SVG、安装启动说明、验证证据和 A.3 要求的模式与复用分析。

## 模块边界

- `vscode-extension/src/model`：SVG 元素树，不依赖 VSCode API。
- `vscode-extension/src/visitor`：树遍历及其产物，不依赖 VSCode API。
- `vscode-extension/src/parser`：容错读取 SVG 标签和源码范围，不依赖 VSCode API。
- `vscode-extension/src/provider`：适配 VSCode 的文件装饰与文档符号接口。
- `vscode-extension/src/extension.ts`：只负责注册 Provider 和释放资源。

## 设计模式

### Composite

- 参与者：`SvgNode`、`SvgDocumentNode`、`SvgElementNode`。
- 解决的问题：SVG 容器和叶子具有统一访问入口，嵌套结构由节点对象维护。
- 内核调用位置：Visitor 在 `accept` 后递归访问子节点。
- 替代方案：直接使用带 `type` 字段的普通对象树；实现更短，但会把遍历分支扩散到调用方，不符合本项目的对象建模要求。

### Visitor

- 参与者：`SvgNodeVisitor`、`SvgDocumentNode`、`SvgElementNode`、`SvgOutlineVisitor`。
- 解决的问题：把“遍历节点树并生成大纲”与节点自身的数据结构分离，后续可新增其他遍历操作。
- 内核调用位置：`SvgOutlineVisitor` 从文档节点开始，通过 `accept` 双分派递归生成中立的 `OutlineNode`。
- 替代方案：在 Provider 中直接递归；当前只有一个操作也能工作，但解析模型与 VSCode 输出容易耦合，测试也更难。

### Adapter

- 参与者：`SvgFileDecorationProvider`、`SvgDocumentSymbolProvider` 与 VSCode 的 `FileDecorationProvider`、`DocumentSymbolProvider` 接口。
- 解决的问题：将本扩展的文件策略和中立大纲模型转换为 VSCode 所需类型。
- 内核调用位置：扩展激活时向 `window.registerFileDecorationProvider` 和 `languages.registerDocumentSymbolProvider` 注册。
- 替代方案：让领域模型直接依赖 VSCode 类型；代码更短，但模型无法独立测试和复用。

文件旁的 `[]` 使用 VSCode 的装饰扩展点实现。它提供的是界面附加信息，不包装原有对象或改变其行为，因此不视为经典 GoF Decorator。

## 容错策略

- 只处理语法可完整闭合的 SVG；标签未闭合、开始结束标签不匹配或多根元素时返回空大纲。
- 跳过 XML 声明、注释、DOCTYPE 和 CDATA，不让它们出现在 Outline 中。
- 文件装饰只对扩展名为 `.svg` 且不是目录的资源生效。
- 源码定位使用开始标签范围；完整节点范围包含结束标签。

## 验证

- 单元测试覆盖嵌套、无 id、自闭合标签、实体/注释、源码范围和损坏 XML。
- 扩展宿主集成测试覆盖文件标记、不允许目录标记、原生 DocumentSymbol 结果及编辑后更新。
- 启动 Extension Development Host，人工核验 Explorer 标记与 Outline 点击定位。
- 运行扩展工程的 `npm test`、`npm run build`，并回归仓库根目录的 `npm test`、`npm run build`。
