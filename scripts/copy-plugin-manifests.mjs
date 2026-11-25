import { cpSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcPluginRoot = path.join(root, "src", "_plugin");
const distPluginRoot = path.join(root, "dist", "_plugin");

/**
 * 将 `_plugin` 下的 package.json 复制到 dist，供方式 B 读取 contributes。
 */
function copyPackageJsonFiles(srcDir, distDir) {
  mkdirSync(distDir, { recursive: true });

  for (const entry of readdirSync(srcDir)) {
    const srcPath = path.join(srcDir, entry);
    const distPath = path.join(distDir, entry);
    const stats = statSync(srcPath);

    if (stats.isDirectory()) {
      copyPackageJsonFiles(srcPath, distPath);
      continue;
    }

    if (entry === "package.json") {
      cpSync(srcPath, distPath);
    }
  }
}

copyPackageJsonFiles(srcPluginRoot, distPluginRoot);
