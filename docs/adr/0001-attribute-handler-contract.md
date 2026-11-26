# ADR 0001：AttributeHandler 契约与 set 路由

## 状态

已采纳

## 背景

Phase 1 的 `set` 只允许叶子图形白名单属性。`box` 需要把 `fill` 写到内部 rect、把 `label` 写到内部 text，且 `label` 不能进入内核白名单。框架需要可扩展的属性语义，又不能让解析器了解每种图形。

## 决策

1. 扩展点为抽象类 `AttributeHandler`（`protocol/attributes`），运行时由 `AttributeRegistry` 持有。
2. `EditorShapeCommandReceiver.setAttribute` 先 `attributeCatalog.find(shape, attribute)`；命中则走处理器，否则走 `EditableAttributeRules` Phase 1 白名单。
3. 认领规则：`handles(shape, attribute)` 只读判断；**多个处理器同时命中 → 抛 ambiguous 错误**，禁止未定义覆盖。
4. CLI 解析阶段放行任意属性名；未知属性在执行期失败，保证扩展属性不必改 Parser。
5. 一次 `set` 一个 undo 单元：执行前 `capture` 快照；`apply` 抛错则回滚快照且不入历史。
6. 快照仍用 `ShapeAttributeSnapshot`：`attribute` 保留命令侧名字（如 `label`），`restoreAttribute` 指向实际叶子属性（如 `text`）。
7. 撤销提示文案由快照携带（可选的 `restoredMessageDescriber`，`describeRestored(previous)`），内核 `SetCommand` 不得出现任何具体属性名（如 `label`）的分支；box 的 `label restored: "…"` 由 `BoxAttributeHandler` 提供。
8. 插件抛出的非协议异常由 `CommandExecutor` 统一转成 `command-failed` 错误结果，进程不崩溃，且失败命令不入历史。

## 处理器如何访问目标图形

处理器只通过公开接口与图形交互，不访问内核私有状态：

1. **类型识别**：`handles` / `capture` / `apply` 收到的是 `Shape` 抽象类型。处理器先用 `instanceof` 判断是否为自己负责的具体类（如 `BoxShape`），不符合则 `handles` 返回 `false`，`apply` 抛 `InvalidArgument`。`instanceof` 只出现在插件处理器内，内核不做类型分派。
2. **子部件定位**：子部件通过 `getChildren()` 遍历，并用类提供的派生规则匹配 id（如 `BoxShape.rectIdFor(id)`、`BoxShape.labelIdFor(id)`）。找不到或类型不符时抛错，不做静默降级。
3. **修改范围**：只修改认领的叶子属性（`fill` → rect 的 `fill`；`label` → text 的 `text`），不改变父子结构。结构相关操作由 `Shape` 的钩子（如 `allowsRemovingChild`）和 ADR 0005 约束。
4. **撤销快照**：`capture` 只记录被修改叶子的旧值（`ShapeAttributeSnapshot` 的 id → 旧值映射），`apply` 失败时由调用方按快照回滚。

该做法让处理器只依赖 `Shape` 的读写接口和 `BoxShape` 的公开派生规则，内核无需知道 `fill`/`label` 的业务含义。替代方案是让内核按图形类型写 `if (box) …` 分支，会把插件语义拉回内核，不采用。

## 后果

- 内核 set 路径稳定；新增属性语义只需注册处理器。
- 处理器必须互斥认领，冲突在开发期/测试期暴露。
- 解析不再是属性合法性的唯一关口，错误信息更多出现在执行期。

## 代码锚点

- 契约：`src/protocol/attributes/AttributeHandler.ts`
- 调用：`src/core/receiver/EditorShapeCommandReceiver.ts`（`setAttribute` / 撤销恢复）
- 快照：`src/protocol/commands/memento/ShapeAttributeSnapshot.ts`
- 失败回滚：`src/_builtin/commands/SetCommand/SetCommand.ts`（`execute`）
- 异常兜底：`src/core/CommandExecutor.ts`
- 实现：`src/_plugin/shapes/BoxShape/BoxAttributeHandler.ts`
- 契约测试：`tests/core/attributes/AttributeHandlerContract.test.ts`（回滚、ambiguous）
