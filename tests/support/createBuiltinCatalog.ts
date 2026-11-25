import { BuiltinCommandContributions } from "../../src/core/commands/BuiltinCommandContributions";
import { CommandRegistry } from "../../src/core/commands/CommandRegistry";
import { ShapeFactory } from "../../src/protocol/shapes/factory/ShapeFactory";

export function createBuiltinCatalog(
  shapeFactory: ShapeFactory = new ShapeFactory(),
): CommandRegistry {
  const registry = new CommandRegistry();
  registry.registerAll(new BuiltinCommandContributions(shapeFactory).create());
  return registry;
}
