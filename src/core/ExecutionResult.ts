export type ExecutionResult =
  | { type: "output"; text: string }
  | { type: "error"; text: string }
  | { type: "exit" };
