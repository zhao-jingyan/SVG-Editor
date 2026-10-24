# Protocol Results 目录分层

## 目标

- 消除 `protocol/results` 目录下根契约、DTO 和具体结果平铺的问题。
- 保留 `CommandResult` 作为稳定入口，突出三种运行时结果。
- 让结果 DTO 与运行时结果类保持边界分离。

## 目录结构

```text
src/protocol/results
├── CommandResult.ts
├── dto
│   └── CommandResultDto.ts
└── outcomes
    ├── CommandErrorResult.ts
    ├── CommandExitResult.ts
    └── CommandSuccessResult.ts
```

## 职责

- 根目录：`CommandResult` 抽象结果契约。
- `outcomes`：成功、业务错误和退出三种运行时结果。
- `dto`：跨边界可序列化结果数据。

## 约束

- 不改变 `isSuccess()`、`toCommandResultDto()` 的行为和 DTO 字段。
- 错误结果继续持有 `ProtocolError`，只在转换 DTO 时暴露错误码与消息。

## 验证

- 运行 `npm test` 与 `npm run build`。
