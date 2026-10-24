import type { CommandResult } from "./results/CommandResult";
import type { EditableAttribute } from "./EditableAttribute";
import type { ShapeAttributeSnapshot } from "./commands/memento/ShapeAttributeSnapshot";
import type { ShapePlacement } from "./commands/memento/ShapePlacement";
import type { Shape } from "./shapes/Shape";

export interface CommandContext {
  init(width?: number, height?: number): Promise<CommandResult>;
  read(path: string): Promise<CommandResult>;
  save(path?: string): Promise<CommandResult>;
  canvas(width?: number, height?: number): Promise<CommandResult>;
  createShape(shape: Shape, parentId?: string): Promise<CommandResult>;
  deleteShape(shapeId: string): Promise<CommandResult>;
  moveShape(shapeId: string, dx: number, dy: number): Promise<CommandResult>;
  scaleShape(shapeId: string, factor: number): Promise<CommandResult>;
  setAttribute(
    shapeId: string,
    attribute: EditableAttribute,
    value: string | number,
  ): Promise<CommandResult>;
  groupShapes(containerId: string, memberIds: readonly string[]): Promise<CommandResult>;
  ungroupShapes(containerId: string): Promise<CommandResult>;
  addToContainer(containerId: string, shapeId: string): Promise<CommandResult>;
  reorderShape(shapeId: string, position: "front" | "back"): Promise<CommandResult>;
  capturePlacement(shapeId: string): ShapePlacement;
  restorePlacements(placements: readonly ShapePlacement[]): void;
  restoreGroup(placement: ShapePlacement): void;
  captureAttribute(
    shapeId: string,
    attribute: EditableAttribute,
  ): ShapeAttributeSnapshot;
  restoreAttribute(snapshot: ShapeAttributeSnapshot): void;
  tree(shapeId?: string): Promise<CommandResult>;
  show(shapeId: string): Promise<CommandResult>;
  help(): Promise<CommandResult>;
  undo(): Promise<CommandResult>;
  redo(): Promise<CommandResult>;
}
