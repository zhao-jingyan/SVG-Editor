import { describe, expect, it } from "vitest";
import { AttributeRegistry } from "@/core/attributes/AttributeRegistry";
import { CommandRegistry } from "@/core/commands/CommandRegistry";
import { ShapeRegistry } from "@/core/shapes/ShapeRegistry";
import { TreeDecoratorRegistry } from "@/core/tree/TreeDecoratorRegistry";
import { activateDefaultPlugins } from "@/host/activateDefaultPlugins";
import { PluginHost } from "@/host/PluginHost";
import {
  registerBuiltinGroupShape,
  registerBuiltinLeafShapes,
} from "@/host/registerBuiltinContributions";

describe("activateDefaultPlugins", () => {
  it("经同一 Host 路径装入默认插件集合", async () => {
    const commands = new CommandRegistry();
    const shapes = new ShapeRegistry();
    const attributes = new AttributeRegistry();
    const decorators = new TreeDecoratorRegistry();
    registerBuiltinLeafShapes(shapes);

    const host = new PluginHost(commands, shapes, attributes, decorators);
    await activateDefaultPlugins(host);
    registerBuiltinGroupShape(shapes);

    expect(commands.find("stats")).toBeDefined();
    expect(commands.find("dir")).toBeDefined();
    expect(shapes.find("box")).toBeDefined();
    expect(shapes.find("g")).toBeDefined();
    expect(attributes.getHandlers().map((item) => item.getName())).toEqual([
      "box-attributes",
    ]);
    expect(decorators.getDecorators().map((item) => item.getName())).toEqual([
      "box-type-label",
      "modified-star",
    ]);

    // box 先于 g，data-kind=box 由 box 认领
    expect(shapes.findForSvg("g", "box")?.getTypeName()).toBe("box");
    expect(shapes.findForSvg("g", undefined)?.getTypeName()).toBe("g");
  });
});
