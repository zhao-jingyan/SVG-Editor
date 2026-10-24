# Protocol Errors 目录分层

## 目标

- 消除 `protocol/errors` 目录下按文件平铺的结构。
- 区分错误基类、命令错误、领域错误和边界 DTO。
- 保持所有具体错误继续继承 `ProtocolError`，不改变错误码和消息契约。

## 目录结构

```text
src/protocol/errors
├── CommandErrorCode.ts
├── ProtocolError.ts
├── command
│   ├── CommandExecutionError.ts
│   └── CommandParseError.ts
├── domain
│   ├── DocumentError.ts
│   └── ShapeError.ts
└── dto
    └── CommandErrorDto.ts
```

## 职责

- 根目录：稳定错误码、抽象错误基类和统一 DTO 转换入口。
- `command`：命令解析与执行边界产生的错误。
- `domain`：Document 和 Shape 领域不变量错误。
- `dto`：跨边界可序列化错误数据。

## 验证

- 保持 `ProtocolError`、错误码、消息和 `CommandErrorDto` 的字段不变。
- 运行 `npm test` 与 `npm run build`。
