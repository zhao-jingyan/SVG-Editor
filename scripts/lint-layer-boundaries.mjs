import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = path.join(repositoryRoot, "src");

/** @type {readonly { name: string; root: string; allow: readonly string[] }[]} */
const layers = [
  {
    name: "builtin",
    root: path.join(srcRoot, "builtin"),
    allow: [
      path.join(srcRoot, "builtin"),
      path.join(srcRoot, "protocol"),
    ],
  },
];

const importPattern =
  /(?:import|export)(?:\s+type)?(?:\s+[\s\S]*?\s+from\s*|\s*)['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

/**
 * @param {string} directory
 * @returns {Promise<string[]>}
 */
async function listTypeScriptFiles(directory) {
  /** @type {string[]} */
  const files = [];

  async function walk(current) {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        return;
      }
      throw error;
    }

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".ts")) {
        files.push(fullPath);
      }
    }
  }

  await walk(directory);
  return files;
}

/**
 * @param {string} fromFile
 * @param {string} specifier
 * @returns {{ kind: "external"; specifier: string } | { kind: "local"; target: string }}
 */
function resolveSpecifier(fromFile, specifier) {
  if (specifier.startsWith("@/")) {
    return {
      kind: "local",
      target: path.join(srcRoot, specifier.slice(2)),
    };
  }

  if (specifier.startsWith(".")) {
    return {
      kind: "local",
      target: path.resolve(path.dirname(fromFile), specifier),
    };
  }

  return { kind: "external", specifier };
}

/**
 * @param {string} candidate
 * @param {readonly string[]} allowedRoots
 */
function isAllowedLocal(candidate, allowedRoots) {
  const normalized = path.normalize(candidate);
  return allowedRoots.some(
    (root) => normalized === root || normalized.startsWith(root + path.sep),
  );
}

/**
 * @param {string} filePath
 * @param {string} source
 * @returns {string[]}
 */
function collectSpecifiers(filePath, source) {
  /** @type {string[]} */
  const specifiers = [];
  importPattern.lastIndex = 0;

  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1] ?? match[2];
    if (specifier !== undefined) {
      specifiers.push(specifier);
    }
  }

  // 忽略字符串字面量误伤：仅接受像模块路径的值
  return specifiers.filter((specifier) => {
    if (specifier.includes("\n")) {
      return false;
    }
    return (
      specifier.startsWith(".") ||
      specifier.startsWith("@/") ||
      /^[a-zA-Z@]/.test(specifier)
    );
  });
}

async function main() {
  /** @type {string[]} */
  const violations = [];

  for (const layer of layers) {
    const files = await listTypeScriptFiles(layer.root);

    for (const filePath of files) {
      const source = await readFile(filePath, "utf8");
      const relativeFile = path.relative(repositoryRoot, filePath);

      for (const specifier of collectSpecifiers(filePath, source)) {
        const resolved = resolveSpecifier(filePath, specifier);

        if (resolved.kind === "external") {
          violations.push(
            `${relativeFile}: 禁止外部依赖 "${specifier}"（${layer.name} 仅可依赖 protocol 与自身）`,
          );
          continue;
        }

        if (!isAllowedLocal(resolved.target, layer.allow)) {
          violations.push(
            `${relativeFile}: 禁止导入 "${specifier}"（${layer.name} 仅可依赖 protocol 与自身）`,
          );
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error("layer boundary lint failed:\n");
    for (const violation of violations) {
      console.error(`  - ${violation}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("layer boundary lint passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
