# CLI 子目录拆分

## 目标

- 消除 `src/cli` 根目录下按类平铺的结构。
- 让交互编排、文本解析和终端适配三个变化方向拥有独立目录。
- 让测试目录与 CLI 子模块保持一一对应。

## 目录结构

```text
src/cli
├── io
│   ├── ConsoleInputReader.ts
│   ├── ConsoleOutputWriter.ts
│   ├── InputReader.ts
│   └── OutputWriter.ts
├── parser
│   ├── CommandLineParser.ts
│   ├── CommandParser.ts
│   └── results
└── session
    ├── CommandLoop.ts
    ├── CommandSession.ts
    └── CommandSessionStatus.ts
```

## 职责

- `io`：只处理输入输出端口和标准流适配，不解析命令，也不决定会话生命周期。
- `parser`：只把文本转换为命令或解析结果，不依赖终端适配器和会话对象。
- `session`：组合 Parser、Executor 与输出端口，处理单次输入并控制交互循环。

## 依赖约束

```text
session -> parser
session -> io
parser -> protocol
session -> protocol
io -/-> parser
io -/-> session
parser -/-> io
parser -/-> session
```

## 测试

- `tests/cli/parser` 对应 parser 单元测试。
- `tests/cli/session` 对应会话策略、控制循环和真实编辑链路测试。
- 验证命令保持为 `npm test` 与 `npm run build`。
