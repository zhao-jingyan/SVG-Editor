# CLI 与 Core 边界事实

## 目录职责

- `src/cli` 只存放用户界面适配代码：REPL 控制循环、输入读取和输出写入。
- `src/core` 只存放应用入口端口 `Executor`、执行结果类型及其实现。
- `src/main.ts` 是组合根和启动入口，只负责组装 CLI 适配器与 `Executor`，不实现业务逻辑。
- `tests/cli` 存放 CLI 行为测试，`tests/core` 存放 Executor 实现测试。

## 文件命名

- TypeScript 文件默认使用 `PascalCase`，并与主要类、接口或类型同名，例如 `Repl.ts`、`Executor.ts`。
- 每个主要类、接口和联合类型单独成文件。
- 测试文件使用 `<Name>.test.ts` 命名，例如 `Repl.test.ts`。
- 注释使用中文；提交信息使用中文 Conventional Commit。

## Executor 端口

`src/core/Executor.ts` 定义 CLI 与应用层之间的稳定边界：

```typescript
export interface Executor {
  execute(input: string): Promise<ExecutionResult>;
}

export type ExecutionResult =
  | { type: "output"; text: string }
  | { type: "error"; text: string }
  | { type: "exit" };
```

CLI 将输入原样传给 `Executor.execute`，不解析命令、不识别 SVG、不维护文档状态，也不处理 Command、undo/redo 或文件读写。

## 依赖方向

```text
src/main.ts -> src/cli
src/main.ts -> src/core
src/cli -> src/core/Executor.ts
src/core -/-> src/cli
tests -> src/cli 或 src/core
```

- `Repl` 只依赖 `Executor` 接口，不依赖 `DemoExecutor` 等具体实现。
- `src/core` 不得依赖 `src/cli`，因此未来 GUI 可以绕过 CLI 复用同一个应用入口。
- 依赖真实终端的代码只能位于 CLI 适配器；测试使用假的 `InputReader`、`OutputWriter` 和 `Executor`，不启动真实终端。

## 第一阶段行为事实

- REPL 每轮显示 `svg> `，读取一行原始文本并交给 Executor。
- `output` 和 `error` 结果输出其 `text`；`exit` 结束循环。
- Executor 抛异常时，CLI 输出统一错误信息并继续循环，避免终端进程因单次执行失败而崩溃。
- `DemoExecutor` 仅用于验证边界：输入 `exit` 返回 `exit`，空白输入返回空输出，其他输入返回 `received: <原始输入>`。

## 允许的第一阶段文件

```text
src/
  main.ts
  cli/
    Repl.ts
    InputReader.ts
    OutputWriter.ts
    ConsoleInputReader.ts
    ConsoleOutputWriter.ts
  core/
    Executor.ts
    ExecutionResult.ts
    DemoExecutor.ts

tests/
  cli/
  core/
```

后续实现 SVG、领域模型、Command、文档状态和 undo/redo 时，应继续保持 CLI 只依赖应用入口端口；新增业务代码进入 `src/core` 的后续子模块，不回流到 `src/cli`。
