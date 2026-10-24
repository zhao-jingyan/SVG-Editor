# Parser 子目录分层

## 目标

- `src/cli/parser` 根目录只保留入口和接口。
- 按解析阶段和命令族组织实现文件，避免“拆分后仍然平铺”。
- 测试目录镜像源码子目录。

## 目录结构

```text
src/cli/parser
├── CommandLineParser.ts
├── CommandParser.ts
├── arguments
│   └── CommandArguments.ts
├── commands
│   ├── document
│   │   └── DocumentCommandParser.ts
│   ├── shape
│   │   ├── CreateCommandParser.ts
│   │   └── ShapeCommandParser.ts
│   └── view
│       └── ViewCommandParser.ts
├── definition
│   ├── CommandDefinition.ts
│   └── CommandDefinitionRegistry.ts
├── results
│   ├── CommandParseEmptyResult.ts
│   ├── CommandParseErrorResult.ts
│   ├── CommandParseResult.ts
│   └── CommandParseSuccessResult.ts
└── tokenization
    └── CommandLineTokenizer.ts
```

## 职责

- `tokenization`：文本到 token。
- `arguments`：token 元数、类型和切片校验。
- `commands`：按文档、图形、显示三个命令族构造 Command。
- `definition`：命令名与对应构造器的集中注册。
- `results`：解析结果类层次和边界 DTO。
- 根目录：只暴露解析能力和解析入口。

## 验证

- 单元测试按 `tests/cli/parser/arguments`、`tests/cli/parser/tokenization` 镜像。
- 解析入口测试和结果测试保留在 `tests/cli/parser` 根目录。
- 运行 `npm test` 与 `npm run build`。
