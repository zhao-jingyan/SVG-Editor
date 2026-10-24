# 拆分 CommandReceiver 能力与编辑会话实现

## 目标

- 把 `CommandReceiver` 从方法平铺接口改为文档、图形、显示、历史四个能力接口的聚合。
- 让编辑会话实现只作为 Receiver 聚合点，不再承载文档状态、IO、图形编辑和显示细节。

## 能力接口

- `DocumentCommandReceiver`：init、read、save、canvas。
- `ShapeCommandReceiver`：图形编辑和位置/属性快照。
- `ViewCommandReceiver`：tree、show、help。
- `HistoryCommandReceiver`：undo、redo。
- `CommandReceiver` 继承以上四个接口，继续作为具体命令的聚合接收者。

## 实现拆分

- `DocumentCommands` 持有当前 Document、文件路径、SvgStorage、解析器、写入器和历史锁触发。
- `ShapeCommands` 负责图形创建、编辑、组合、排序和快照协作。
- `ViewCommands` 负责 tree、show、help。
- `EditorSession` 只持有三个命令协作对象和共享 CommandHistory，并把 CommandReceiver 方法委托给对应对象。

## 约束

- 不改变命令接口、图形操作、输出文本、历史锁或错误边界。
- 当前仍由一个聚合 Receiver 接收全部命令；命令级窄接口留到需要时再评估。

## 验证

- 运行 `npm test` 与 `npm run build`。
