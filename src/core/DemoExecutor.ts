import type { ExecutionResult } from "./ExecutionResult";
import type { Executor } from "./Executor";

export class DemoExecutor implements Executor {
  public async execute(input: string): Promise<ExecutionResult> {
    if (input === "exit") {
      return { type: "exit" };
    }

    if (input.trim() === "") {
      return { type: "output", text: "" };
    }

    return { type: "output", text: `received: ${input}` };
  }
}
