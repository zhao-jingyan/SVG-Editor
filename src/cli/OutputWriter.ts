export interface OutputWriter {
  writePrompt(prompt: string): Promise<void>;
  writeLine(text: string): Promise<void>;
}
