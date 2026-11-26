import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * vitest globalSetup：全部测试文件运行前只构建一次 dist/。
 * 多个进程级测试并行时若各自构建会竞争写入 dist/，因此统一放在这里。
 */
export default function setup(): void {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  execFileSync("npm", ["run", "build"], { cwd: root, stdio: "pipe" });
}
