export interface InputReader {
  readLine(): Promise<string | null>;
}
