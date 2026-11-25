#!/usr/bin/env node
/**
 * 从 git 历史生成 docs/metrics/：内核 / 装配处 / 插件行数与圈复杂度估计。
 * 对比默认：METRICS_BASE=final，METRICS_HEAD=HEAD（打 tag p2 后可设为 p2）。
 * 不接受手填数字；输出由本脚本写入。
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseRef = process.env.METRICS_BASE ?? "final";
const headRef = process.env.METRICS_HEAD ?? "HEAD";
const outDir = path.join(root, "docs", "metrics");

/** @typedef {"kernel" | "assembly" | "plugin"} Bucket */

/**
 * @param {string} filePath
 * @returns {Bucket | null}
 */
function classify(filePath) {
  if (!filePath.startsWith("src/") || !filePath.endsWith(".ts")) {
    return null;
  }
  if (filePath.startsWith("src/_plugin/")) {
    return "plugin";
  }
  if (filePath === "src/main.ts" || filePath.startsWith("src/host/")) {
    return "assembly";
  }
  if (
    filePath.startsWith("src/protocol/") ||
    filePath.startsWith("src/core/") ||
    filePath.startsWith("src/cli/") ||
    filePath.startsWith("src/_builtin/")
  ) {
    return "kernel";
  }
  return null;
}

/**
 * @param {string} ref
 * @returns {string[]}
 */
function listSourceFiles(ref) {
  const text = execFileSync("git", ["ls-tree", "-r", "--name-only", ref], {
    cwd: root,
    encoding: "utf8",
  });
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => classify(line) !== null);
}

/**
 * @param {string} ref
 * @param {string} filePath
 * @returns {string | null}
 */
function readAt(ref, filePath) {
  try {
    return execFileSync("git", ["show", `${ref}:${filePath}`], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch {
    return null;
  }
}

/**
 * @param {string} content
 * @returns {number}
 */
function countLines(content) {
  if (content.length === 0) {
    return 0;
  }
  return content.split(/\r?\n/).length;
}

/**
 * 轻量圈复杂度估计：1 + 分支关键字与短路/三元。
 * @param {string} content
 * @returns {number}
 */
function estimateComplexity(content) {
  let score = 1;
  score += (content.match(/\bif\s*\(/g) ?? []).length;
  score += (content.match(/\bfor\s*\(/g) ?? []).length;
  score += (content.match(/\bwhile\s*\(/g) ?? []).length;
  score += (content.match(/\bswitch\s*\(/g) ?? []).length;
  score += (content.match(/\bcase\s+/g) ?? []).length;
  score += (content.match(/\bcatch\s*\(/g) ?? []).length;
  score += (content.match(/&&/g) ?? []).length;
  score += (content.match(/\|\|/g) ?? []).length;
  score += (content.match(/\?[^?.\n]/g) ?? []).length;
  return score;
}

/**
 * @param {string} ref
 */
function measure(ref) {
  /** @type {Record<Bucket, { lines: number, complexity: number, files: { path: string, lines: number, complexity: number }[] }>} */
  const buckets = {
    kernel: { lines: 0, complexity: 0, files: [] },
    assembly: { lines: 0, complexity: 0, files: [] },
    plugin: { lines: 0, complexity: 0, files: [] },
  };

  for (const filePath of listSourceFiles(ref)) {
    const bucket = classify(filePath);
    if (bucket === null) {
      continue;
    }
    const content = readAt(ref, filePath);
    if (content === null) {
      continue;
    }
    const lines = countLines(content);
    const complexity = estimateComplexity(content);
    buckets[bucket].lines += lines;
    buckets[bucket].complexity += complexity;
    buckets[bucket].files.push({ path: filePath, lines, complexity });
  }

  for (const bucket of Object.values(buckets)) {
    bucket.files.sort((a, b) => a.path.localeCompare(b.path));
  }

  return buckets;
}

/**
 * @param {ReturnType<typeof measure>} base
 * @param {ReturnType<typeof measure>} head
 */
function delta(base, head) {
  /** @type {Record<Bucket, { lines: number, complexity: number }>} */
  const result = {
    kernel: {
      lines: head.kernel.lines - base.kernel.lines,
      complexity: head.kernel.complexity - base.kernel.complexity,
    },
    assembly: {
      lines: head.assembly.lines - base.assembly.lines,
      complexity: head.assembly.complexity - base.assembly.complexity,
    },
    plugin: {
      lines: head.plugin.lines - base.plugin.lines,
      complexity: head.plugin.complexity - base.plugin.complexity,
    },
  };
  return result;
}

const base = measure(baseRef);
const head = measure(headRef);
const d = delta(base, head);

const generatedAt = new Date().toISOString();
const inventory = {
  generatedAt,
  baseRef,
  headRef,
  classification: {
    kernel: "src/protocol, src/core, src/cli, src/_builtin",
    assembly: "src/main.ts, src/host",
    plugin: "src/_plugin",
  },
  note: "VSCode 扩展不计入本 CLI metrics；依赖包与 dist 排除。圈复杂度为脚本估计值，非工具厂商标准实现。",
  base,
  head,
  delta: d,
};

mkdirSync(outDir, { recursive: true });
writeFileSync(
  path.join(outDir, "inventory.json"),
  `${JSON.stringify(inventory, null, 2)}\n`,
  "utf8",
);

const bucketLabel = {
  kernel: "内核",
  assembly: "装配处",
  plugin: "插件",
};

function tableRows(buckets) {
  return /** @type {Bucket[]} */ (["kernel", "assembly", "plugin"])
    .map((key) => {
      const b = buckets[key];
      return `| ${bucketLabel[key]} | ${b.files.length} | ${b.lines} | ${b.complexity} |`;
    })
    .join("\n");
}

const summary = `# CLI Metrics（自动生成）

> 由 \`npm run metrics\`（\`scripts/generate-metrics.mjs\`）从 git 生成。  
> 基线：\`${baseRef}\` → 对比：\`${headRef}\`  
> 生成时间：${generatedAt}

## 分类规则

| 类别 | 路径 |
|---|---|
| 内核 | \`src/protocol\`、\`src/core\`、\`src/cli\`、\`src/_builtin\` |
| 装配处 | \`src/main.ts\`、\`src/host\` |
| 插件 | \`src/_plugin\` |

VSCode 扩展单独列出，不混入本表。\`node_modules\` / \`dist\` 排除。

## ${baseRef} 快照

| 类别 | 文件数 | 行数 | 复杂度估计 |
|---|---:|---:|---:|
${tableRows(base)}

## ${headRef} 快照

| 类别 | 文件数 | 行数 | 复杂度估计 |
|---|---:|---:|---:|
${tableRows(head)}

## 增量（${headRef} − ${baseRef}）

| 类别 | 行数 Δ | 复杂度 Δ |
|---|---:|---:|
| 内核 | ${d.kernel.lines} | ${d.kernel.complexity} |
| 装配处 | ${d.assembly.lines} | ${d.assembly.complexity} |
| 插件 | ${d.plugin.lines} | ${d.plugin.complexity} |

## 文件职责清单（${headRef}）

### 内核

${head.kernel.files.map((f) => `- \`${f.path}\` — ${f.lines} 行 / 复杂度 ${f.complexity}`).join("\n")}

### 装配处

${head.assembly.files.map((f) => `- \`${f.path}\` — ${f.lines} 行 / 复杂度 ${f.complexity}`).join("\n")}

### 插件

${head.plugin.files.map((f) => `- \`${f.path}\` — ${f.lines} 行 / 复杂度 ${f.complexity}`).join("\n")}

## 机器可读

见同目录 [\`inventory.json\`](./inventory.json)。
`;

writeFileSync(path.join(outDir, "summary.md"), summary, "utf8");

console.log(`metrics written to docs/metrics/ (${baseRef} -> ${headRef})`);
console.log(
  `delta lines kernel=${d.kernel.lines} assembly=${d.assembly.lines} plugin=${d.plugin.lines}`,
);
