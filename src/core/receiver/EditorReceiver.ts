import type { CommandReceiver } from "../../protocol/receivers/CommandReceiver";
import type { EditableAttribute } from "../../protocol/shapes/model/EditableAttribute";
import type { ShapeAttributeSnapshot } from "../../protocol/commands/memento/ShapeAttributeSnapshot";
import type { ShapePlacement } from "../../protocol/commands/memento/ShapePlacement";
import type { CommandResult } from "../../protocol/results/CommandResult";
import type { Shape } from "../../protocol/shapes/model/Shape";
import { CommandHistory } from "../history/CommandHistory";
import { FileSvgStorage } from "../io/FileSvgStorage";
import type { SvgStorage } from "../io/SvgStorage";
import { DocumentCommands } from "./DocumentCommands";
import { ShapeCommands } from "./ShapeCommands";
import { ViewCommands } from "./ViewCommands";

export class EditorReceiver implements CommandReceiver {
  private readonly documents: DocumentCommands;
  private readonly shapes: ShapeCommands;
  private readonly views: ViewCommands;

  public constructor(
    private readonly history: CommandHistory = new CommandHistory(),
    svgStorage: SvgStorage = new FileSvgStorage(),
  ) {
    this.documents = new DocumentCommands(history, svgStorage);
    this.shapes = new ShapeCommands(this.documents);
    this.views = new ViewCommands(this.documents);
  }

  public init(width?: number, height?: number): Promise<CommandResult> {
    return this.documents.init(width, height);
  }

  public read(path: string): Promise<CommandResult> {
    return this.documents.read(path);
  }

  public save(path?: string): Promise<CommandResult> {
    return this.documents.save(path);
  }

  public canvas(width?: number, height?: number): Promise<CommandResult> {
    return this.documents.canvas(width, height);
  }

  public createShape(
    shape: Shape,
    parentId?: string,
  ): Promise<CommandResult> {
    return this.shapes.createShape(shape, parentId);
  }

  public deleteShape(shapeId: string): Promise<CommandResult> {
    return this.shapes.deleteShape(shapeId);
  }

  public moveShape(
    shapeId: string,
    dx: number,
    dy: number,
  ): Promise<CommandResult> {
    return this.shapes.moveShape(shapeId, dx, dy);
  }

  public scaleShape(
    shapeId: string,
    factor: number,
  ): Promise<CommandResult> {
    return this.shapes.scaleShape(shapeId, factor);
  }

  public setAttribute(
    shapeId: string,
    attribute: EditableAttribute,
    value: string | number,
  ): Promise<CommandResult> {
    return this.shapes.setAttribute(shapeId, attribute, value);
  }

  public groupShapes(
    containerId: string,
    memberIds: readonly string[],
  ): Promise<CommandResult> {
    return this.shapes.groupShapes(containerId, memberIds);
  }

  public ungroupShapes(containerId: string): Promise<CommandResult> {
    return this.shapes.ungroupShapes(containerId);
  }

  public addToContainer(
    containerId: string,
    shapeId: string,
  ): Promise<CommandResult> {
    return this.shapes.addToContainer(containerId, shapeId);
  }

  public reorderShape(
    shapeId: string,
    position: "front" | "back",
  ): Promise<CommandResult> {
    return this.shapes.reorderShape(shapeId, position);
  }

  public capturePlacement(shapeId: string): ShapePlacement {
    return this.shapes.capturePlacement(shapeId);
  }

  public restorePlacements(placements: readonly ShapePlacement[]): void {
    this.shapes.restorePlacements(placements);
  }

  public restoreGroup(placement: ShapePlacement): void {
    this.shapes.restoreGroup(placement);
  }

  public captureAttribute(
    shapeId: string,
    attribute: EditableAttribute,
  ): ShapeAttributeSnapshot {
    return this.shapes.captureAttribute(shapeId, attribute);
  }

  public restoreAttribute(snapshot: ShapeAttributeSnapshot): void {
    this.shapes.restoreAttribute(snapshot);
  }

  public tree(shapeId?: string): Promise<CommandResult> {
    return this.views.tree(shapeId);
  }

  public show(shapeId: string): Promise<CommandResult> {
    return this.views.show(shapeId);
  }

  public help(): Promise<CommandResult> {
    return this.views.help();
  }

  public undo(): Promise<CommandResult> {
    this.documents.requireDocument();
    return this.history.undo(this);
  }

  public redo(): Promise<CommandResult> {
    this.documents.requireDocument();
    return this.history.redo(this);
  }
}
