# 对齐 Receiver 接口与实现命名

## 目标

- 用同一概念词根命名能力接口及其实现，降低接口与实现之间的映射成本。
- 通过 `Editor` 前缀稳定表达“编辑器侧具体实现”。

## 命名映射

- `CommandReceiver` → `EditorCommandReceiver`
- `DocumentCommandReceiver` → `EditorDocumentCommandReceiver`
- `ShapeCommandReceiver` → `EditorShapeCommandReceiver`
- `ViewCommandReceiver` → `EditorViewCommandReceiver`

## 约束

- 每个实现类名都完整保留对应接口名，只增加 `Editor` 限定前缀。
- 不使用含义模糊的 `Commands` 后缀，也不把能力接口改回 `Manager`、`Editor` 等职责别名。
- 不改变 Receiver 协作、命令行为或历史状态。

## 验证

- 运行 `npm test` 与 `npm run build`。
