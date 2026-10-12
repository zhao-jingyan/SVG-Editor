(来自一个讨论对话)

可以。第一次迭代只做 CLI 外壳和 Executor 边界，完全绕开 SVG、领域模型、Command、undo/redo。
目标是先证明这条链路成立：
输入设备 → CLI → Executor 接口 → 结果 → CLI 输出
建议第一版包含四个角色：
src/cli/
  Repl.ts              // 控制循环，不理解业务
  InputReader.ts       // 获取输入
  OutputWriter.ts      // 输出提示符和结果
  Executor.ts          // Executor 接口
接口可以先定成：
export interface Executor {
  execute(input: string): Promise<ExecutionResult>;
}

export type ExecutionResult =
  | {
      type: "output";
      text: string;
    }
  | {
      type: "error";
      text: string;
    }
  | {
      type: "exit";
    };
Repl 只做这些事情：
1. 显示 svg> ；
2. 读取一行原始文本；
3. 原样交给 Executor.execute(input)；
4. 根据结果输出 text；
5. 收到 exit 时结束循环；
6. Executor 抛异常时输出统一错误信息，避免 CLI 崩溃。
第一版不要在 CLI 中做这些事：
- 不解析 create rect ...；
- 不识别 SVG；
- 不创建图形；
- 不实现 Command；
- 不维护文档状态；
- 不处理 undo/redo；
- 不直接读写文件。
可以先写一个临时的 DemoExecutor：
class DemoExecutor implements Executor {
  async execute(input: string): Promise<ExecutionResult> {
    if (input === "exit") {
      return { type: "exit" };
    }

    if (input.trim() === "") {
      return { type: "output", text: "" };
    }

    return {
      type: "output",
      text: `received: ${input}`,
    };
  }
}
这个 Executor 不是最终业务实现，只是为了验证 CLI 边界。以后可以替换成：
DemoExecutor
    ↓ 替换为
ApplicationExecutor
    ↓
EditorEngine
这里的 Executor 更准确地说是一个应用入口端口。当前 CLI 是它的输入适配器；未来 GUI 也可以调用同一个应用入口。真正的业务编排以后再放进 ApplicationExecutor，现在不要提前设计。
第一轮测试只需要验证 CLI 行为：
- 普通输入会传给 Executor；
- Executor 返回成功结果时，CLI 正确输出；
- Executor 返回错误结果时，CLI 正确输出；
- Executor 返回 exit 时循环结束；
- 空输入不会导致崩溃；
- Executor 抛异常时，CLI 能显示错误并继续或退出；
- 测试中使用假的 InputReader、OutputWriter、Executor，不依赖真实终端。
推荐的第一次提交顺序：
1. 建立 InputReader / OutputWriter / Executor 接口
2. 实现 Repl 主循环
3. 实现终端输入输出适配器
4. 接入 DemoExecutor
5. 添加 CLI 行为测试
6. 写一页边界说明
这一轮的完成标准是：可以启动 CLI，输入任意文本，看到 Executor 返回的结果，并能正常退出；测试不需要启动真实终端。
这一步足够小，但能验证最重要的架构假设：CLI 是否真的只负责交互，业务执行是否可以被替换，未来 GUI 是否能够绕过 CLI 复用同一个入口。

我要对文件命名做规定。同时要对目录结构做规定。src/cli负责装UI的东西，src/core负责装executor。给一个方案

（GPT-6.1-sol high plan mode）