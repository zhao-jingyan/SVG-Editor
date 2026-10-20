import type { CommandResult } from "./CommandResult";
import type { EditableAttribute } from "./EditableAttribute";
import type { ShapeSpec } from "./ShapeSpec";

export interface CommandContext {
  init(width?: number, height?: number): Promise<CommandResult>;
  read(path: string): Promise<CommandResult>;
  save(path?: string): Promise<CommandResult>;
  canvas(width?: number, height?: number): Promise<CommandResult>;
  createShape(shape: ShapeSpec, parentId?: string): Promise<CommandResult>;
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
  tree(shapeId?: string): Promise<CommandResult>;
  show(shapeId: string): Promise<CommandResult>;
  help(): Promise<CommandResult>;
  undo(): Promise<CommandResult>;
  redo(): Promise<CommandResult>;
}
