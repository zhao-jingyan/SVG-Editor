import type { CommandContext } from "../../src/protocol/CommandContext";
import type { EditableAttribute } from "../../src/protocol/EditableAttribute";
import { ShapeAttributeSnapshot } from "../../src/protocol/commands/memento/ShapeAttributeSnapshot";
import { ShapePlacement } from "../../src/protocol/commands/memento/ShapePlacement";
import type { CommandResult } from "../../src/protocol/results/CommandResult";
import { CommandSuccessResult } from "../../src/protocol/results/CommandSuccessResult";
import { GroupShape } from "../../src/protocol/shapes/GroupShape";
import type { Shape } from "../../src/protocol/shapes/Shape";
import { ShapeType } from "../../src/protocol/shapes/ShapeType";

export interface ContextCall {
  readonly method: string;
  readonly args: readonly unknown[];
}

export class RecordingCommandContext implements CommandContext {
  public readonly calls: ContextCall[] = [];

  public constructor(
    private readonly result: CommandResult = new CommandSuccessResult("ok"),
  ) {}

  public init(width?: number, height?: number): Promise<CommandResult> {
    return this.record("init", [width, height]);
  }

  public read(path: string): Promise<CommandResult> {
    return this.record("read", [path]);
  }

  public save(path?: string): Promise<CommandResult> {
    return this.record("save", [path]);
  }

  public canvas(width?: number, height?: number): Promise<CommandResult> {
    return this.record("canvas", [width, height]);
  }

  public createShape(shape: Shape, parentId?: string): Promise<CommandResult> {
    return this.record("createShape", [shape, parentId]);
  }

  public deleteShape(shapeId: string): Promise<CommandResult> {
    return this.record("deleteShape", [shapeId]);
  }

  public moveShape(shapeId: string, dx: number, dy: number): Promise<CommandResult> {
    return this.record("moveShape", [shapeId, dx, dy]);
  }

  public scaleShape(shapeId: string, factor: number): Promise<CommandResult> {
    return this.record("scaleShape", [shapeId, factor]);
  }

  public setAttribute(
    shapeId: string,
    attribute: EditableAttribute,
    value: string | number,
  ): Promise<CommandResult> {
    return this.record("setAttribute", [shapeId, attribute, value]);
  }

  public groupShapes(
    containerId: string,
    memberIds: readonly string[],
  ): Promise<CommandResult> {
    return this.record("groupShapes", [containerId, memberIds]);
  }

  public ungroupShapes(containerId: string): Promise<CommandResult> {
    return this.record("ungroupShapes", [containerId]);
  }

  public addToContainer(containerId: string, shapeId: string): Promise<CommandResult> {
    return this.record("addToContainer", [containerId, shapeId]);
  }

  public reorderShape(
    shapeId: string,
    position: "front" | "back",
  ): Promise<CommandResult> {
    return this.record("reorderShape", [shapeId, position]);
  }

  public capturePlacement(shapeId: string): ShapePlacement {
    return new ShapePlacement(new GroupShape(shapeId), undefined, 0);
  }

  public restorePlacements(_placements: readonly ShapePlacement[]): void {}

  public restoreGroup(_placement: ShapePlacement): void {}

  public captureAttribute(
    shapeId: string,
    attribute: EditableAttribute,
  ): ShapeAttributeSnapshot {
    return new ShapeAttributeSnapshot(
      shapeId,
      ShapeType.Group,
      attribute,
      new Map(),
    );
  }

  public restoreAttribute(_snapshot: ShapeAttributeSnapshot): void {}

  public tree(shapeId?: string): Promise<CommandResult> {
    return this.record("tree", [shapeId]);
  }

  public show(shapeId: string): Promise<CommandResult> {
    return this.record("show", [shapeId]);
  }

  public help(): Promise<CommandResult> {
    return this.record("help", []);
  }

  public undo(): Promise<CommandResult> {
    return this.record("undo", []);
  }

  public redo(): Promise<CommandResult> {
    return this.record("redo", []);
  }

  private record(method: string, args: readonly unknown[]): Promise<CommandResult> {
    this.calls.push({ method, args });
    return Promise.resolve(this.result);
  }
}
