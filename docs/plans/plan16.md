# Parser 职责拆分

## 目标

- 降低 `CommandLineParser` 的体积和认知负担。
- 让词法、参数校验、命令构造、命令分派彼此独立。
- 保持命令名分派集中在一个位置。
- 降低解析结果的使用复杂度，避免每个参数构造器都包装结果对象。

## 协作者

- `CommandLineTokenizer`：识别空行和注释，按空白切分，并处理双引号与未闭合引号。
- `CommandArguments`：统一元数校验、必填文本、原值、数字转换和参数切片。
- `DocumentCommandParser`：构造 `init`、`read`、`save`、`canvas`。
- `CreateCommandParser`：构造 `create`，并处理 `in <containerId>` 尾缀。
- `ShapeCommandParser`：构造除 `create` 外的图形编辑命令。
- `ViewCommandParser`：构造显示、历史和会话命令。
- `CommandDefinitionRegistry`：唯一维护“命令名 → 命令定义”的映射。
- `CommandLineParser`：只执行词法、查找、参数对象创建和解析结果包装。

## 结果模型

- 命令构造器统一返回 `Command`，成功结果只由 `CommandLineParser` 包装一次。
- `CommandParseResult` 类层次继续承担 `command`、`empty`、`error` 三种运行时状态。
- `CommandParseResultDto` 并入 `CommandParseResult.ts`，减少一个没有独立生命周期的小文件。

## 分派约束

```text
命令名分派：CommandDefinitionRegistry
图形类型分派：ShapeFactory
```

四类命令构造器内部不再按命令名分支。

## 验证

- `CommandLineTokenizer` 覆盖空输入、注释、引号空白、空字符串和未闭合引号。
- `CommandArguments` 覆盖元数、必填文本、原值与数字错误。
- `CommandLineParser` 保留全部命令、错误分支和结果 DTO 回归。
- 运行 `npm test` 与 `npm run build`。
