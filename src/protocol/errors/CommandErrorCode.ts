export enum CommandErrorCode {
  InvalidCommand = "invalid-command",
  InvalidArgument = "invalid-argument",
  InvalidNumber = "invalid-number",
  UnknownShapeType = "unknown-shape-type",
  UnknownAttribute = "unknown-attribute",
  NoDocument = "no-document",
  DuplicateId = "duplicate-id",
  ShapeNotFound = "shape-not-found",
  ContainerNotFound = "container-not-found",
  NotContainer = "not-container",
  InvalidScale = "invalid-scale",
  IoRead = "io-read",
  IoWrite = "io-write",
  HistoryUnavailable = "history-unavailable",
  CommandNotImplemented = "command-not-implemented",
  /** 扩展实现（命令/处理器）抛出非协议异常时，由执行器统一转换。 */
  CommandFailed = "command-failed",
}
