#!/usr/bin/env python3
"""删除→记录→加回 单个插件的演示步骤。

警告：本脚本会创建提交并打 tag（delete-plugin-<name> / install-plugin-<name>），
且 delete 会删除工作区中的插件文件。只能在可丢弃的演示分支上运行，不要在 main 上直接执行。

用法（在仓库根目录执行）:
  python3 scripts/demo/demo_step.py delete <name>   删除插件包/自身测试/装配入口/配置入口，记录测试结果，提交 delete-plugin-<name>
  python3 scripts/demo/demo_step.py install <name>  从 delete 提交的父提交恢复上述文件，提交 install-plugin-<name>

日志与提交信息临时文件写入系统临时目录下的 svg-editor-demo/，不写入仓库。
"""
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = str(Path(__file__).resolve().parents[2])
DEMO_DIR = os.path.join(tempfile.gettempdir(), "svg-editor-demo")
LOG = os.path.join(DEMO_DIR, "logs")

PLUGINS = {
    "stats": {
        "paths": ["src/_plugin/commands/StatsCommand", "tests/_plugin/commands/StatsCommand"],
        "class": "StatsCommandPlugin",
        "config": "./dist/_plugin/commands/StatsCommand",
        "title": "stats 命令插件",
    },
    "dir": {
        "paths": ["src/_plugin/commands/DirCommand", "tests/_plugin/commands/DirCommand"],
        "class": "DirCommandPlugin",
        "config": "./dist/_plugin/commands/DirCommand",
        "title": "dir 命令插件",
    },
    "box": {
        "paths": ["src/_plugin/shapes/BoxShape", "tests/_plugin/shapes/BoxShape"],
        "class": "BoxShapePlugin",
        "config": "./dist/_plugin/shapes/BoxShape",
        "title": "box 图形插件",
    },
    "modified-star": {
        "paths": ["src/_plugin/tree", "tests/_plugin/tree"],
        "class": "ModifiedStarPlugin",
        "config": "./dist/_plugin/tree/ModifiedStarPlugin",
        "title": "modified-star 树标签插件",
    },
}

ASSEMBLY = "src/assembly/CodePluginInstaller.ts"
CONFIG = "plugins.config.json"


def sh(args, check=True, capture=True):
    result = subprocess.run(args, cwd=REPO, text=True, capture_output=capture)
    if check and result.returncode != 0:
        raise SystemExit(f"命令失败: {' '.join(args)}\n{result.stdout}\n{result.stderr}")
    return result


def edit_assembly(plugin):
    path = os.path.join(REPO, ASSEMBLY)
    text = open(path, encoding="utf-8").read()
    cls = plugin["class"]
    # 删除 import 行
    text, n_import = re.subn(r"^import \{ %s \} from [^\n]*\n" % cls, "", text, flags=re.M)
    # 删除该插件的 activate 语句块
    pattern = re.compile(
        r"    await this\.host\.activate\(\n      new %s\(\),\n(?:      [^\n]*\n)*?    \);\n" % cls
    )
    text, n_block = pattern.subn("", text)
    if n_import != 1 or n_block != 1:
        raise SystemExit(f"装配文件替换异常: import={n_import} block={n_block}")
    open(path, "w", encoding="utf-8").write(text)


def edit_config(plugin):
    path = os.path.join(REPO, CONFIG)
    lines = open(path, encoding="utf-8").read().split("\n")
    idx = [i for i, line in enumerate(lines) if plugin["config"] in line]
    if len(idx) != 1:
        raise SystemExit(f"配置入口数量异常: {idx}")
    i = idx[0]
    del lines[i]
    # 若删掉的是数组最后一项，去掉前一项的尾逗号
    if lines[i].lstrip().startswith("]"):
        lines[i - 1] = lines[i - 1].rstrip(",")
    open(path, "w", encoding="utf-8").write("\n".join(lines))
    json.loads(open(path, encoding="utf-8").read())  # 校验仍为合法 JSON


def run_suite(tag):
    """清理 dist → 构建 → 运行 vitest，返回 (build_ok, failures, summary)。"""
    os.makedirs(LOG, exist_ok=True)
    sh(["rm", "-rf", "dist"])
    build = sh(["npm", "run", "build"], check=False)
    build_ok = build.returncode == 0
    report = os.path.join(LOG, f"{tag}-vitest.json")
    if os.path.exists(report):
        os.remove(report)
    vitest = sh(
        ["npx", "vitest", "run", "--reporter=json", f"--outputFile={report}"], check=False
    )
    failures = []
    summary = None
    if os.path.exists(report):
        data = json.load(open(report, encoding="utf-8"))
        summary = {k: data.get(k) for k in ("numTotalTests", "numPassedTests", "numFailedTests", "numFailedTestSuites")}
        for suite in data.get("testResults", []):
            rel = os.path.relpath(suite.get("name", ""), REPO)
            if suite.get("status") == "failed" and not suite.get("assertionResults"):
                failures.append((rel, "(文件级错误)", suite.get("message", "").strip().split("\n")[0][:200]))
            for case in suite.get("assertionResults", []):
                if case.get("status") == "failed":
                    msgs = case.get("failureMessages") or [""]
                    failures.append((rel, case.get("fullName", ""), msgs[0].strip().split("\n")[0][:200]))
    else:
        failures.append(("(vitest)", "未生成报告", (vitest.stderr or vitest.stdout)[-300:]))
    return build_ok, failures, summary


def other_checks(tag):
    results = {}
    for name, args in [
        ("lint", ["npm", "run", "lint"]),
        ("verify:dual-assembly", ["npm", "run", "verify:dual-assembly"]),
        ("e2e", ["npm", "run", "e2e"]),
    ]:
        r = sh(args, check=False)
        results[name] = "通过" if r.returncode == 0 else f"失败(退出码 {r.returncode})"
    return results


def write_message(path, subject, body):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(subject + "\n\n" + body + "\n")


def delete(name):
    plugin = PLUGINS[name]
    for p in plugin["paths"]:
        sh(["git", "rm", "-r", "-q", p])
    edit_assembly(plugin)
    edit_config(plugin)
    sh(["git", "add", ASSEMBLY, CONFIG])

    build_ok, failures, summary = run_suite(f"delete-{name}")
    checks = other_checks(f"delete-{name}") if build_ok else {}

    lines = [
        f"演示：删除 {plugin['title']}（删除→加回的第一步）。",
        "",
        "删除内容：",
        *[f"- 目录 {p}" for p in plugin["paths"]],
        f"- 装配入口 {ASSEMBLY} 中 {plugin['class']} 的 import 与 activate",
        f"- 配置入口 {CONFIG} 中的 {plugin['config']}",
        "",
        f"构建：{'通过' if build_ok else '失败'}",
    ]
    if summary:
        lines.append(
            f"npm test：共 {summary['numTotalTests']} 项，通过 {summary['numPassedTests']}，"
            f"失败 {summary['numFailedTests']}，失败文件 {summary['numFailedTestSuites']}"
        )
    for key, value in checks.items():
        lines.append(f"{key}：{value}")
    lines += ["", "失败的测试（文件 :: 用例 ← 首条错误）："]
    lines += [f"- {f} :: {c} ← {m}" for f, c, m in failures] or ["- （无）"]
    body = "\n".join(lines)

    msg = os.path.join(DEMO_DIR, "msg-delete.txt")
    write_message(msg, f"refactor(plugin): 演示删除 {name} 插件", body)
    sh(["git", "commit", "-q", "-F", msg])
    sh(["git", "tag", f"delete-plugin-{name}"])
    with open(os.path.join(LOG, f"delete-{name}-summary.txt"), "w", encoding="utf-8") as f:
        f.write(body + "\n")
    print(body)


def install(name):
    plugin = PLUGINS[name]
    parent = sh(["git", "rev-parse", f"delete-plugin-{name}^"]).stdout.strip()
    sh(["git", "checkout", parent, "--", *plugin["paths"], ASSEMBLY, CONFIG])

    build_ok, failures, summary = run_suite(f"install-{name}")
    checks = other_checks(f"install-{name}") if build_ok else {}
    lines = [
        f"演示：加回 {plugin['title']}（删除→加回的第二步），内容与 delete-plugin-{name}^ 完全一致。",
        "",
        "恢复内容：",
        *[f"- 目录 {p}" for p in plugin["paths"]],
        f"- 装配入口 {ASSEMBLY}",
        f"- 配置入口 {CONFIG}",
        "",
        f"构建：{'通过' if build_ok else '失败'}",
    ]
    if summary:
        lines.append(
            f"npm test：共 {summary['numTotalTests']} 项，通过 {summary['numPassedTests']}，"
            f"失败 {summary['numFailedTests']}"
        )
    for key, value in checks.items():
        lines.append(f"{key}：{value}")
    lines += ["", "失败的测试：" + ("（无）" if not failures else "")]
    lines += [f"- {f} :: {c} ← {m}" for f, c, m in failures]
    body = "\n".join(lines)

    msg = os.path.join(DEMO_DIR, "msg-install.txt")
    write_message(msg, f"refactor(plugin): 演示加回 {name} 插件", body)
    sh(["git", "commit", "-q", "-F", msg])
    sh(["git", "tag", f"install-plugin-{name}"])
    print(body)


if __name__ == "__main__":
    action, name = sys.argv[1], sys.argv[2]
    {"delete": delete, "install": install}[action](name)
