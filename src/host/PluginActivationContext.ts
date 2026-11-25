import type { AttributeHandler } from "@/protocol/attributes/AttributeHandler";
import type { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import type { PluginContext } from "@/protocol/plugins/PluginContext";
import type { ShapeContribution } from "@/protocol/shapes/contribution/ShapeContribution";
import type { TreeDecorator } from "@/protocol/tree/TreeDecorator";
import type { AttributeRegistry } from "@/core/attributes/AttributeRegistry";
import type { CommandRegistry } from "@/core/commands/CommandRegistry";
import type { ShapeRegistry } from "@/core/shapes/ShapeRegistry";
import type { TreeDecoratorRegistry } from "@/core/tree/TreeDecoratorRegistry";
import { DuplicateRegistrationError } from "./DuplicateRegistrationError";

/** 一次 activate 的暂存注册；commit 前不写入正式表。 */
export class PluginActivationContext implements PluginContext {
  private readonly stagedCommands: CommandContribution[] = [];
  private readonly stagedShapes: ShapeContribution[] = [];
  private readonly stagedAttributes: AttributeHandler[] = [];
  private readonly stagedDecorators: TreeDecorator[] = [];
  private committed = false;

  public constructor(
    private readonly commands: CommandRegistry,
    private readonly shapes: ShapeRegistry,
    private readonly attributes: AttributeRegistry,
    private readonly decorators: TreeDecoratorRegistry,
    private readonly options: Readonly<Record<string, unknown>>,
  ) {}

  public registerCommand(contribution: CommandContribution): void {
    this.assertNotCommitted();
    const name = contribution.getName();
    if (
      this.commands.find(name) !== undefined ||
      this.stagedCommands.some((item) => item.getName() === name)
    ) {
      throw new DuplicateRegistrationError("commands", name);
    }

    this.stagedCommands.push(contribution);
  }

  public registerShape(contribution: ShapeContribution): void {
    this.assertNotCommitted();
    const name = contribution.getTypeName();
    if (
      this.shapes.find(name) !== undefined ||
      this.stagedShapes.some((item) => item.getTypeName() === name)
    ) {
      throw new DuplicateRegistrationError("shapes", name);
    }

    this.stagedShapes.push(contribution);
  }

  public registerAttribute(handler: AttributeHandler): void {
    this.assertNotCommitted();
    const name = handler.getName();
    if (
      this.attributes.getHandlers().some((item) => item.getName() === name) ||
      this.stagedAttributes.some((item) => item.getName() === name)
    ) {
      throw new DuplicateRegistrationError("attributes", name);
    }

    this.stagedAttributes.push(handler);
  }

  public registerDecorator(decorator: TreeDecorator): void {
    this.assertNotCommitted();
    const name = decorator.getName();
    if (
      this.decorators
        .getDecorators()
        .some((item) => item.getName() === name) ||
      this.stagedDecorators.some((item) => item.getName() === name)
    ) {
      throw new DuplicateRegistrationError("decorators", name);
    }

    this.stagedDecorators.push(decorator);
  }

  public getOptions(): Readonly<Record<string, unknown>> {
    return this.options;
  }

  public getRegisteredCommandNames(): readonly string[] {
    return this.stagedCommands.map((item) => item.getName());
  }

  public getRegisteredShapeNames(): readonly string[] {
    return this.stagedShapes.map((item) => item.getTypeName());
  }

  public getRegisteredAttributeNames(): readonly string[] {
    return this.stagedAttributes.map((item) => item.getName());
  }

  public getRegisteredDecoratorNames(): readonly string[] {
    return this.stagedDecorators.map((item) => item.getName());
  }

  /** 清单校验通过后写入正式注册表。 */
  public commit(): void {
    this.assertNotCommitted();
    for (const contribution of this.stagedCommands) {
      this.commands.register(contribution);
    }
    for (const contribution of this.stagedShapes) {
      this.shapes.register(contribution);
    }
    for (const handler of this.stagedAttributes) {
      this.attributes.register(handler);
    }
    for (const decorator of this.stagedDecorators) {
      this.decorators.register(decorator);
    }
    this.committed = true;
  }

  /** 丢弃暂存（未 commit 时无副作用）。 */
  public discard(): void {
    this.stagedCommands.length = 0;
    this.stagedShapes.length = 0;
    this.stagedAttributes.length = 0;
    this.stagedDecorators.length = 0;
  }

  private assertNotCommitted(): void {
    if (this.committed) {
      throw new Error("plugin context already committed");
    }
  }
}
