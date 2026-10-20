import type { CommandContext } from "../protocol/CommandContext";
import type { CommandResult } from "../protocol/CommandResult";
import type { EditableAttribute } from "../protocol/EditableAttribute";
import type { Shape } from "../protocol/shapes/Shape";

export class DemoCommandContext implements CommandContext {
  public async init(_width?: number, _height?: number): Promise<CommandResult> {
    return this.success("init");
  }

  public async read(_path: string): Promise<CommandResult> {
    return this.success("read");
  }

  public async save(_path?: string): Promise<CommandResult> {
    return this.success("save");
  }

  public async canvas(_width?: number, _height?: number): Promise<CommandResult> {
    return this.success("canvas");
  }

  public async createShape(_shape: Shape, _parentId?: string): Promise<CommandResult> {
    return this.success("create");
  }

  public async deleteShape(_shapeId: string): Promise<CommandResult> {
    return this.success("delete");
  }

  public async moveShape(
    _shapeId: string,
    _dx: number,
    _dy: number,
  ): Promise<CommandResult> {
    return this.success("move");
  }

  public async scaleShape(_shapeId: string, _factor: number): Promise<CommandResult> {
    return this.success("scale");
  }

  public async setAttribute(
    _shapeId: string,
    _attribute: EditableAttribute,
    _value: string | number,
  ): Promise<CommandResult> {
    return this.success("set");
  }

  public async groupShapes(
    _containerId: string,
    _memberIds: readonly string[],
  ): Promise<CommandResult> {
    return this.success("group");
  }

  public async ungroupShapes(_containerId: string): Promise<CommandResult> {
    return this.success("ungroup");
  }

  public async addToContainer(
    _containerId: string,
    _shapeId: string,
  ): Promise<CommandResult> {
    return this.success("addto");
  }

  public async reorderShape(
    _shapeId: string,
    _position: "front" | "back",
  ): Promise<CommandResult> {
    return this.success("reorder");
  }

  public async tree(_shapeId?: string): Promise<CommandResult> {
    return this.success("tree");
  }

  public async show(_shapeId: string): Promise<CommandResult> {
    return this.success("show");
  }

  public async help(): Promise<CommandResult> {
    return this.success("help");
  }

  public async undo(): Promise<CommandResult> {
    return this.success("undo");
  }

  public async redo(): Promise<CommandResult> {
    return this.success("redo");
  }

  private success(command: string): CommandResult {
    return { type: "success", message: `received command: ${command}` };
  }
}
