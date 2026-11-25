# ADR 0003：modified-star dirty 语义与标签拼接

## 状态

已采纳

## 背景

`tree` 需要行尾标签：`(box)` 类型标注与未保存变更 `*`。须明确 dirty 判定、祖先是否带星、多标签顺序，且无标签时 Phase 1 输出不变。

## 决策

1. **扩展点**：`TreeDecorator`；`TreeDisplay` 按注册顺序拼接行尾，渲染器不写死标签名。
2. **dirty 判定**：与上次成功 `init` / `read` / `save` 的内容指纹比较（内容语义），**不是**“是否发生过编辑命令”。因此 `undo` 回到保存点后 `*` 消失。
3. **祖先传播**：指纹包含整棵子树；改叶子会使祖先行指纹变化，祖先行也标 `*`。画布根行同样比较指纹。
4. **拼接顺序**：注册顺序即拼接顺序。默认装配先 `box-type-label` 再 `modified-star`，得到 `g#n1 (box) *`。
5. **容器行文本**：Visitor 统一输出 `g#id`（SVG 标签）；`(box)` 只由装饰器追加，避免内核知道 box。
6. **缺省行为**：未注册任何装饰器时，`TreeDisplay` 输出与 Phase 1 逐字节一致。

## 后果

- 装饰器状态封装在实例字段（基线 Map），无模块级可变状态。
- 标签插件可独立增删；顺序由装配/配置数组决定。
- 内容指纹成本随树增大，当前规模可接受。

## 代码锚点

- 契约：`src/protocol/tree/TreeDecorator.ts`
- 渲染：`src/core/display/TreeDisplay.ts`
- 同步：`src/core/receiver/EditorDocumentCommandReceiver.ts`（`syncTreeDecorators`）
- 实现：`src/_plugin/tree/BoxTypeLabelDecorator.ts`、`ModifiedStarDecorator.ts`
