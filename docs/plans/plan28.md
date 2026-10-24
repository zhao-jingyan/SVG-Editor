# 收敛 Protocol 根目录结构

## 目标

- 消除 Protocol 根目录文件平铺，让接口、执行入口和图形值对象落到语义目录。
- 保持所有类型名、方法签名和依赖方向不变。

## 目录调整

- `CommandReceiver` 与四个能力接口移动到 `src/protocol/receivers`。
- `Executor` 移动到 `src/protocol/execution`。
- `EditableAttribute` 移动到 `src/protocol/shapes/model`。
- Protocol 根目录只保留 `commands`、`errors`、`execution`、`receivers`、`results`、`shapes` 六个语义目录。

## 约束

- 不改变协议类型行为或 CLI/Core 依赖方向。
- 同步更新所有导入路径、测试与架构事实。

## 验证

- 运行 `npm test` 与 `npm run build`。
