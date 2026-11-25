import type { AttributeHandler } from "@/protocol/attributes/AttributeHandler";
import type { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { ShapeContribution } from "@/protocol/shapes/contribution/ShapeContribution";
import type { TreeDecorator } from "@/protocol/tree/TreeDecorator";

/**
 * 插件激活上下文：唯一注册入口。
 * 实现须支持暂存；提交前失败则整插件回滚。
 */
export interface PluginContext {
  registerCommand(contribution: CommandContribution): void;

  registerShape(contribution: ShapeContribution): void;

  registerAttribute(handler: AttributeHandler): void;

  registerDecorator(decorator: TreeDecorator): void;

  /** 配置项 options；方式 A 默认为空对象。 */
  getOptions(): Readonly<Record<string, unknown>>;
}
