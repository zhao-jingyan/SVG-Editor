import type { ShapeAttributeSnapshot } from "@/protocol/commands/memento/ShapeAttributeSnapshot";
import type { ShapePlacement } from "@/protocol/commands/memento/ShapePlacement";
import type { CommandResult } from "@/protocol/results/CommandResult";
import type { Shape } from "@/protocol/shapes/model/Shape";

export interface ShapeCommandReceiver {
  createShape(shape: Shape, parentId?: string): Promise<CommandResult>;
  deleteShape(shapeId: string): Promise<CommandResult>;
  moveShape(shapeId: string, dx: number, dy: number): Promise<CommandResult>;
  scaleShape(shapeId: string, factor: number): Promise<CommandResult>;
  setAttribute(
    shapeId: string,
    attribute: string,
    value: string | number,
  ): Promise<CommandResult>;
  groupShapes(containerId: string, memberIds: readonly string[]): Promise<CommandResult>;
  ungroupShapes(containerId: string): Promise<CommandResult>;
  addToContainer(containerId: string, shapeId: string): Promise<CommandResult>;
  reorderShape(shapeId: string, position: "front" | "back"): Promise<CommandResult>;
  capturePlacement(shapeId: string): ShapePlacement;
  restorePlacements(placements: readonly ShapePlacement[]): void;
  restoreGroup(placement: ShapePlacement): void;
  captureAttribute(shapeId: string, attribute: string): ShapeAttributeSnapshot;
  restoreAttribute(snapshot: ShapeAttributeSnapshot): void;
}
