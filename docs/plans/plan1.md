# CLI 与 Core 的文件命名及目录结构方案

## 总体原则

- 使用 **TypeScript + 面向对象**。
- 文件名统一使用 **PascalCase**，与主要类、接口或类型同名。
- 一类一文件；接口、联合类型也单独成文件。
- `src/cli` 只负责交互和终端适配。
- `src/core` 只负责应用入口端口及其执行实现。
- `core` 不得依赖 `cli`，未来 GUI 也直接调用 `core` 的入口。
- 注释统一使用中文，提交信息使用中文 Conventional Commit。

## 目录结构

```text
src/
  main.ts                         # CLI 组合根和启动入口

  cli/
    Repl.ts                       # REPL 控制循环
    InputReader.ts                # 输入读取接口
    OutputWriter.ts               # 输出接口
    ConsoleInputReader.ts         # stdin 终端输入适配器
    ConsoleOutputWriter.ts        # stdout/stderr 终端输出适配器

  core/
    Executor.ts                   # 应用入口接口
    ExecutionResult.ts             # 执行结果联合类型
    DemoExecutor.ts                # 第一阶段临时实现

tests/
  cli/
    Repl.test.ts
    ConsoleInputReader.test.ts
    ConsoleOutputWriter.test.ts

  core/
    DemoExecutor.test.ts

docs/
  cli-core-boundary.md             # 命名、目录、依赖方向和边界说明
```

`src/main.ts` 只负责组装对象：

```text
ConsoleInputReader
        ↓
      Repl
        ↓
    Executor
        ↓
ConsoleOutputWriter
```

`main.ts` 不实现业务逻辑，也不解析命令。

## 公