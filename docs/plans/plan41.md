# TreeDecorator 树行标签（依赖 plan39）

## 目标

- protocol：`TreeDecorator` / `TreeDecoratorCatalog`
- core：`TreeDecoratorRegistry`；`TreeDisplay` 行尾拼接标签；无标签时 Phase 1 输出不变
- 插件：`(box)` 类型标注；`modified-star` 未保存变更 `*`
- 容器行统一显示 `g#id`（SVG tag），`(box)` 由标签追加

## ADR

- dirty：与上次 init/read/save 的内容指纹比较；`undo` 回到保存点后 `*` 消失
- 祖先：指纹含整棵子树，故改叶子时祖先行也会 `*`
- 拼接顺序：按注册顺序（先 `(box)` 后 ` *`）

## 完成状态

- 已完成。
