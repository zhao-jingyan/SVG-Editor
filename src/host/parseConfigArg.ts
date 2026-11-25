/**
 * 从 argv 解析 `--config <path>`；缺省返回 undefined（方式 A）。
 */
export function parseConfigArg(argv: readonly string[]): string | undefined {
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--config") {
      const path = argv[index + 1];
      if (path === undefined || path.startsWith("-")) {
        throw new Error("missing value for --config");
      }
      return path;
    }

    if (token.startsWith("--config=")) {
      const path = token.slice("--config=".length);
      if (path.trim() === "") {
        throw new Error("missing value for --config");
      }
      return path;
    }
  }

  return undefined;
}
