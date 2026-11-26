# ADR 0005：box 子部件 id 派生与结构不变量

## 状态

已采纳

## 背景

`box` 是 `GroupShape` 的子类，内部固定包含一个 rect（填充体）和一个 text（标题）。这两个子部件需要：

- 能被 `set fill` / `set label` 精确定位，且不依赖用户输入的 id；
- 在 SVG 中可被读回，并与普通 `g` 容器区分；
- 不能被普通的 `delete`、`move`、`ungroup` 等结构命令破坏，否则 `fill` / `label` 无处可写。

同时，用户可以在 box 内部继续添加普通子图形，或在 box 中嵌套其他 box，这些操作不能被误拒绝。

## 决策

1. **id 派生**：子部件 id 由 box 自身 id 派生，固定为 `<id>-rect` 与 `<id>-label`（`BoxShape.rectIdFor` / `labelIdFor`）。派生规则只存在于 `BoxShape` 一处，处理器与读回共用这两个方法。
2. **创建期冲突**：`create box#<id>` 会一次性生成 `<id>`、`<id>-rect`、`<id>-label` 三个 id。任一已存在时，整条命令失败，文档不变。冲突检查复用文档全局唯一 id 检查（`ShapeIndex` / `ShapeHierarchy`），不为 box 单独开后门。
3. **必要子部件保护**：`BoxShape.allowsRemovingChild(childId)` 对 `<id>-rect` 与 `<id>-label` 返回 `false`。`ShapeHierarchy` 在删除或移出子节点前调用该钩子，返回 `false` 时以 `cannot modify composite shape structure` 拒绝。`group` 收编多个成员时会在任何结构修改前先验证全部成员均可移出，避免先移走普通成员后才发现必要子部件受保护。
4. **不可拆分**：`BoxShape.canUngroup()` 返回 `false`，`ungroup box#<id>` 直接拒绝，保证 box 身份不会被拆掉。
5. **读回校验**：`BoxShape.fromChildren` 要求同时存在 `<id>-rect`（且为 `RectShape`）与 `<id>-label`（且为 `TextShape`）。缺失则整份 `read` 失败，保留原文档（见 ADR 0002）。
6. **允许额外子节点**：box 内用户新增的普通子图形或嵌套 box 不影响不变量，不因“多余子节点”拒绝。
7. **非必要子部件可删**：box 内新增的普通子图形仍可被 `delete` / `move`，只有两个派生子部件受保护。

## 后果

- 处理器（ADR 0001）与读回（ADR 0002）只依赖派生规则，不需要猜测子部件 id。
- 派生 id 带来一个约束：用户不能在创建前占用 `<id>-rect` 或 `<id>-label`，否则 `create` 失败。这是有意的，换取定位的确定性。
- 不变量由 `Shape` 钩子表达，内核不出现 `box` 字面量分支（与 ADR 0002 一致）。

## 替代方案

- **用随机或计数器生成子 id**：定位需要额外映射表，且读回后 id 不稳定，不采用。
- **允许删除子部件，由处理器在 `apply` 中重建**：会把结构修改混入属性处理器，撤销快照也难以表达，不采用。
- **把 `rect`/`text` 作为 box 的字段而非子节点**：会破坏 Composite（`GroupShape` 统一遍历与 `tree` 显示），不采用。

## 代码锚点

- id 派生与钩子：`src/_plugin/shapes/BoxShape/BoxShape.ts`
- 结构保护执行点：`src/core/document/ShapeHierarchy.ts`（`allowsRemovingChild` 调用处）
- 全局 id 唯一检查：`src/core/document/ShapeIndex.ts`
- 读回校验：`BoxShape.fromChildren`，见 ADR 0002
- 测试：`tests/_plugin/shapes/BoxShape/`、`tests/e2e/Phase2Acceptance.test.ts` 的 §4 用例（id 冲突、必要子部件保护、缺子部件与重复 id 的读入拒绝）
