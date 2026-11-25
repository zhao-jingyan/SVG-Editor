# AttributeHandler 与 set 路由（依赖 plan39）

## 目标

- protocol 属性处理器契约；`set` 先查处理器，未命中走 Phase 1 白名单。
- box 的 `fill` / `label`；一次 set 一个 undo 单元；部分失败整单回滚。

## 完成状态

- 未开始（依赖 plan39）。
