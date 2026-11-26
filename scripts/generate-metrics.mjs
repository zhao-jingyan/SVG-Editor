#!/usr/bin/env node
/**
 * 从 git 对象生成 docs/metrics/：按「内核 / 装配处 / 插件」三类统计文件清单与职责、
 * 行数与圈复杂度增量；VSCode 扩展单独列出，不混入 CLI 增量。
 *
 * 圈复杂度：用 TypeScript 编译器 API 解析 AST，逐个函数/方法/构造器/箭头函数计算
 * 1 + 判定点（if / for / for-in / for-of / while / do / case / catch / 三元 / && / || / ??），
 * 嵌套函数独立计算、不计入外层；文件复杂度 = 其内所有函数复杂度之和，另记最大单函数复杂度。
 *
 * 对比：METRICS_BASE（默认 final）→ METRICS_HEAD（默认：存在 p2 标签则用 p2，否则 HEAD）。
 * 不接受手填数字；输出由本脚本写入。
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "docs", "metrics");

function git(args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  });
}

function refExists(ref) {
  try {
    git(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
    return true;
  } catch {
    return false;
  }
}

const baseRef = process.env.METRICS_BASE ?? "final";
const headRef = process.env.METRICS_HEAD ?? (refExists("p2") ? "p2" : "HEAD");

const bucketKeys = ["kernel", "assembly", "plugin"];
const bucketLabel = { kernel: "内核", assembly: "装配处", plugin: "插件" };

/** 分类：src 下的 .ts；vscode-extension 单独成 "vscode"。 */
function classify(filePath) {
  if (filePath.startsWith("vscode-extension/") && filePath.endsWith(".ts")) {
    return filePath.includes("/node_modules/") ? null : "vscode";
  }
  if (!filePath.startsWith("src/") || !filePath.endsWith(".ts")) {
    return null;
  }
  if (filePath.startsWith("src/_plugin/")) {
    return "plugin";
  }
  if (
    filePath === "src/main.ts" ||
    filePath.startsWith("src/host/") ||
    filePath.startsWith("src/assembly/")
  ) {
    return "assembly";
  }
  return "kernel";
}

/** 目录职责兜底表（文件无 JSDoc 时使用；按最长前缀匹配）。 */
const directoryResponsibilities = [
  ["src/main.ts", "组合根：组装 CLI、Core、宿主与装配"],
  ["src/assembly/", "装配：安装内置贡献与方式 A 插件"],
  ["src/host/", "插件宿主、配置与模块加载"],
  ["src/cli/io/", "输入输出端口与控制台适配"],
  ["src/cli/parser/", "文本到命令对象的解析"],
  ["src/cli/session/", "REPL 会话循环"],
  ["src/core/attributes/", "属性处理器注册表"],
  ["src/core/commands/", "命令贡献注册表"],
  ["src/core/display/", "tree/show/help 展示"],
  ["src/core/document/", "文档状态与图形层级"],
  ["src/core/history/", "undo/redo 历史栈"],
  ["src/core/io/", "SVG 读写与存储"],
  ["src/core/receiver/", "命令接收者实现"],
  ["src/core/shapes/", "图形贡献注册表"],
  ["src/core/tree/", "树标签装饰器注册表"],
  ["src/core/", "命令执行与编排"],
  ["src/protocol/attributes/", "属性扩展点契约"],
  ["src/protocol/commands/", "命令基类、贡献契约与撤销快照"],
  ["src/protocol/errors/", "错误模型"],
  ["src/protocol/execution/", "执行器接口"],
  ["src/protocol/io/", "目录访问端口"],
  ["src/protocol/plugins/", "插件契约与清单"],
  ["src/protocol/receivers/", "接收者接口"],
  ["src/protocol/results/", "命令结果模型"],
  ["src/protocol/shapes/", "图形领域模型与贡献契约"],
  ["src/protocol/tree/", "树标签扩展点契约"],
  ["src/_builtin/commands/", "Phase 1 内置命令及其贡献"],
  ["src/_builtin/shapes/", "Phase 1 内置图形贡献"],
  ["src/_plugin/commands/", "命令插件包"],
  ["src/_plugin/shapes/", "图形插件包"],
  ["src/_plugin/tree/", "树标签插件包"],
  ["vscode-extension/", "VSCode 扩展"],
];

function fallbackResponsibility(filePath) {
  let best = ["", "—"];
  for (const entry of directoryResponsibilities) {
    if (filePath.startsWith(entry[0]) && entry[0].length > best[0].length) {
      best = entry;
    }
  }
  return best[1];
}

/** 取文件内第一个 JSDoc 注释的首个非空行作为职责说明。 */
function firstJsDocLine(sourceFile) {
  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      continue;
    }
    const jsDocs = ts.getJSDocCommentsAndTags(statement).filter(ts.isJSDoc);
    for (const doc of jsDocs) {
      const text =
        typeof doc.comment === "string"
          ? doc.comment
          : (doc.comment ?? []).map((part) => part.text ?? "").join("");
      const line = text
        .split("\n")
        .map((value) => value.trim())
        .find((value) => value.length > 0);
      if (line !== undefined) {
        return line;
      }
    }
    return undefined;
  }
  return undefined;
}

function isFunctionLike(node) {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node)
  );
}

function decisionPoints(node) {
  let count = 0;
  const visit = (child) => {
    if (isFunctionLike(child)) {
      return; // 嵌套函数独立计算
    }
    if (
      ts.isIfStatement(child) ||
      ts.isForStatement(child) ||
      ts.isForInStatement(child) ||
      ts.isForOfStatement(child) ||
      ts.isWhileStatement(child) ||
      ts.isDoStatement(child) ||
      ts.isCaseClause(child) ||
      ts.isCatchClause(child) ||
      ts.isConditionalExpression(child)
    ) {
      count += 1;
    } else if (ts.isBinaryExpression(child)) {
      const kind = child.operatorToken.kind;
      if (
        kind === ts.SyntaxKind.AmpersandAmpersandToken ||
        kind === ts.SyntaxKind.BarBarToken ||
        kind === ts.SyntaxKind.QuestionQuestionToken
      ) {
        count += 1;
      }
    }
    ts.forEachChild(child, visit);
  };
  ts.forEachChild(node, visit);
  return count;
}

function analyze(filePath, content) {
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
  );
  let functions = 0;
  let total = 0;
  let max = 0;

  const visit = (node) => {
    if (isFunctionLike(node) && node.body !== undefined) {
      const value = 1 + decisionPoints(node);
      functions += 1;
      total += value;
      max = Math.max(max, value);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  const documented = firstJsDocLine(sourceFile);
  return {
    functions,
    complexity: total,
    maxComplexity: max,
    responsibility: documented ?? fallbackResponsibility(filePath),
    responsibilitySource: documented === undefined ? "目录" : "注释",
  };
}

function countLines(content) {
  if (content.length === 0) {
    return 0;
  }

  const lines = content.split(/\r?\n/);

  if (lines.at(-1) === "") {
    lines.pop();
  }

  return lines.length;
}

function measure(ref) {
  const names = git(["ls-tree", "-r", "--name-only", ref])
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => classify(line) !== null);

  const empty = () => ({ lines: 0, complexity: 0, files: [] });
  const buckets = {
    kernel: empty(),
    assembly: empty(),
    plugin: empty(),
    vscode: empty(),
  };

  for (const filePath of names) {
    const content = git(["show", `${ref}:${filePath}`]);
    const lines = countLines(content);
    const info = analyze(filePath, content);
    const bucket = buckets[classify(filePath)];
    bucket.lines += lines;
    bucket.complexity += info.complexity;
    bucket.files.push({ path: filePath, lines, ...info });
  }

  for (const bucket of Object.values(buckets)) {
    bucket.files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  }
  return buckets;
}

const base = measure(baseRef);
const head = measure(headRef);
const deltas = Object.fromEntries(
  ["kernel", "assembly", "plugin", "vscode"].map((key) => [
    key,
    {
      files: head[key].files.length - base[key].files.length,
      lines: head[key].lines - base[key].lines,
      complexity: head[key].complexity - base[key].complexity,
    },
  ]),
);

const generatedAt = new Date().toISOString();
mkdirSync(outDir, { recursive: true });
writeFileSync(
  path.join(outDir, "inventory.json"),
  `${JSON.stringify(
    {
      generatedAt,
      baseRef,
      headRef,
      classification: {
        kernel: "src/protocol, src/core, src/cli, src/_builtin",
        assembly: "src/main.ts, src/host, src/assembly",
        plugin: "src/_plugin",
        vscode: "vscode-extension/**/*.ts（单独列出）",
      },
      complexityDefinition:
        "每个函数 1 + 判定点（if/for/for-in/for-of/while/do/case/catch/?:/&&/||/??）；文件值为其内函数之和",
      base,
      head,
      delta: deltas,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

function row(label, bucket) {
  return `| ${label} | ${bucket.files.length} | ${bucket.lines} | ${bucket.complexity} |`;
}

function fileTable(bucket) {
  const lines = [
    "| 文件 | 行数 | 复杂度 | 最大函数复杂度 | 职责 | 来源 |",
    "|---|---:|---:|---:|---|---|",
  ];
  for (const file of bucket.files) {
    lines.push(
      `| \`${file.path}\` | ${file.lines} | ${file.complexity} | ${file.maxComplexity} | ${file.responsibility.replaceAll("|", "\\|")} | ${file.responsibilitySource} |`,
    );
  }
  return lines.join("\n");
}

const snapshotRows = (snapshot) =>
  [
    ...bucketKeys.map((key) => row(bucketLabel[key], snapshot[key])),
    row("**CLI 合计**", {
      files: bucketKeys.flatMap((key) => snapshot[key].files),
      lines: bucketKeys.reduce((sum, key) => sum + snapshot[key].lines, 0),
      complexity: bucketKeys.reduce((sum, key) => sum + snapshot[key].complexity, 0),
    }),
  ].join("\n");

const cliDelta = bucketKeys.reduce(
  (sum, key) => ({
    files: sum.files + deltas[key].files,
    lines: sum.lines + deltas[key].lines,
    complexity: sum.complexity + deltas[key].complexity,
  }),
  { files: 0, lines: 0, complexity: 0 },
);

const summary = `# CLI Metrics（自动生成）

> 由 \`npm run metrics\`（\`scripts/generate-metrics.mjs\`）从 git 对象生成，不接受手填。
>
> 基线：\`${baseRef}\` → 对比：\`${headRef}\`${headRef === "HEAD" ? "（标签 \`p2\` 尚未创建，打标签后重新运行即以 \`p2\` 为终点）" : ""}
>
> 生成时间：${generatedAt}

## 分类与口径

| 类别 | 路径 |
|---|---|
| 内核 | \`src/protocol\`、\`src/core\`、\`src/cli\`、\`src/_builtin\` |
| 装配处 | \`src/main.ts\`、\`src/host\`、\`src/assembly\` |
| 插件 | \`src/_plugin\` |
| VSCode 扩展 | \`vscode-extension/\`（单独列出，不计入 CLI 增量） |

- 圈复杂度由 TypeScript 编译器 API 解析 AST 得到：每个函数（含方法、构造器、箭头函数）为 1 + 判定点（\`if\`、\`for\`、\`for-in\`、\`for-of\`、\`while\`、\`do\`、\`case\`、\`catch\`、\`?:\`、\`&&\`、\`||\`、\`??\`）；嵌套函数单独计算；文件值为其内函数之和。
- 职责列取文件首个 JSDoc 注释的首行；没有注释时回退到目录职责表（来源列标明）。
- 行数含空行与注释；\`node_modules\` / \`dist\` 排除。

## ${baseRef} 快照

| 类别 | 文件数 | 行数 | 复杂度 |
|---|---:|---:|---:|
${snapshotRows(base)}

## ${headRef} 快照

| 类别 | 文件数 | 行数 | 复杂度 |
|---|---:|---:|---:|
${snapshotRows(head)}

## 增量（${headRef} − ${baseRef}）

| 类别 | 文件数 Δ | 行数 Δ | 复杂度 Δ |
|---|---:|---:|---:|
${bucketKeys.map((key) => `| ${bucketLabel[key]} | ${deltas[key].files} | ${deltas[key].lines} | ${deltas[key].complexity} |`).join("\n")}
| **CLI 合计** | ${cliDelta.files} | ${cliDelta.lines} | ${cliDelta.complexity} |
| VSCode 扩展（单独） | ${deltas.vscode.files} | ${deltas.vscode.lines} | ${deltas.vscode.complexity} |

## 文件清单与职责（${headRef}）

### 内核

${fileTable(head.kernel)}

### 装配处

${fileTable(head.assembly)}

### 插件

${fileTable(head.plugin)}

### VSCode 扩展（单独列出）

${head.vscode.files.length === 0 ? "（无 TypeScript 源文件）" : fileTable(head.vscode)}

## 机器可读

见同目录 [\`inventory.json\`](./inventory.json)。
`;

writeFileSync(path.join(outDir, "summary.md"), summary, "utf8");

console.log(`metrics written to docs/metrics/ (${baseRef} -> ${headRef})`);
console.log(
  `delta lines kernel=${deltas.kernel.lines} assembly=${deltas.assembly.lines} plugin=${deltas.plugin.lines} vscode=${deltas.vscode.lines}`,
);
