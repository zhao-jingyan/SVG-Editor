import type { ExecutionResult } from "./ExecutionResult";

export interface Executor {
  execute(input: string): Promise<ExecutionResult>;
}
