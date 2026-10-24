# Protocol Errors 枚举化

## 目标

- 删除四个仅转发构造器、没有差异化行为的错误子类。
- 保留错误来源分类，但改用 `ErrorSource` 枚举表达。
- 保持错误码、消息、堆栈名称和 `CommandErrorDto` 字段兼容。

## 目录结构

```text
src/protocol/errors
├── CommandErrorCode.ts
├── ErrorSource.ts
├── ProtocolError.ts
└── dto
    └── CommandErrorDto.ts
```

## 模型

```ts
enum ErrorSource {
  CommandParse = "command-parse",
  CommandExecution = "command-execution",
  Document = "document",
  Shape = "shape",
}

class ProtocolError extends Error {
  getSource(): ErrorSource;
  getCode(): CommandErrorCode;
  toCommandErrorDto(): CommandErrorDto;
}
```

- `ProtocolError` 是唯一运行时错误类。
- 四个具名静态构造入口保留调用点的来源语义，但不再建立继承层次。
- `error.name` 使用来源枚举值，堆栈中仍可区分错误来源。
- `CommandErrorDto` 继续只包含 `code` 和 `message`，不扩大外部契约。

## 验证

- 覆盖四种 `ErrorSource`、错误名、错误码和 DTO。
- 运行 `npm test` 与 `npm run build`。
