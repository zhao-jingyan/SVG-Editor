import type { PluginContributes } from "@/protocol/plugins/PluginContributes";
import type { SvgPlugin } from "@/protocol/plugins/SvgPlugin";
import type { AttributeRegistry } from "@/core/attributes/AttributeRegistry";
import type { CommandRegistry } from "@/core/commands/CommandRegistry";
import type { ShapeRegistry } from "@/core/shapes/ShapeRegistry";
import type { TreeDecoratorRegistry } from "@/core/tree/TreeDecoratorRegistry";
import { DuplicateRegistrationError } from "./DuplicateRegistrationError";
import { PluginActivationContext } from "./PluginActivationContext";

export type PluginErrorReporter = (message: string) => void;

/**
 * 插件宿主：A/B 共用 activate → 暂存 → 清单校验 → commit。
 * 失败只影响当前插件，已成功插件保留。
 */
export class PluginHost {
  public constructor(
    private readonly commands: CommandRegistry,
    private readonly shapes: ShapeRegistry,
    private readonly attributes: AttributeRegistry,
    private readonly decorators: TreeDecoratorRegistry,
    private readonly reportError: PluginErrorReporter = (message) => {
      console.error(message);
    },
  ) {}

  public async activate(
    plugin: SvgPlugin,
    contributes: PluginContributes,
    options: Readonly<Record<string, unknown>> = {},
  ): Promise<boolean> {
    const context = new PluginActivationContext(
      this.commands,
      this.shapes,
      this.attributes,
      this.decorators,
      options,
    );

    try {
      await plugin.activate(context);

      const registeredShapes = [...context.getRegisteredShapeNames()];
      const registeredCommands = [...context.getRegisteredCommandNames()];
      const registeredAttributes = [...context.getRegisteredAttributeNames()];
      const registeredDecorators = [...context.getRegisteredDecoratorNames()];

      if (
        !contributes.matchesRegistered(
          registeredShapes,
          registeredCommands,
          registeredAttributes,
          registeredDecorators,
        )
      ) {
        context.discard();
        this.reportError(
          `error: plugin manifest mismatch: ${plugin.name} (declared: ${contributes.formatDeclared()}, registered: ${contributes.formatRegistered(
            registeredShapes,
            registeredCommands,
            registeredAttributes,
            registeredDecorators,
          )})`,
        );
        return false;
      }

      context.commit();
      return true;
    } catch (error: unknown) {
      context.discard();

      if (error instanceof DuplicateRegistrationError) {
        this.reportError(`error: ${error.message}`);
        return false;
      }

      const reason = error instanceof Error ? error.message : String(error);
      this.reportError(
        `error: plugin failed to activate: ${plugin.name} (${reason})`,
      );
      return false;
    }
  }
}
