import type { CommandReceiver } from "../../protocol/receivers/CommandReceiver";
import type { EditableAttribute } from "../../protocol/shapes/model/EditableAttribute";
import type { ShapeAttributeSnapshot } from "../../protocol/commands/memento/ShapeAttributeSnapshot";
import type { ShapePlacement } from "../../protocol/commands/memento/ShapePlacement";
import type { CommandResult } from "../../protocol/results/CommandResult";
import type { Shape } from "../../protocol/shapes/model/Shape";
import { CommandHistory } from "../history/CommandHistory";
import { FileSvgStorage } from "../io/FileSvgStorage";
import type { SvgStorage } from "../io/SvgStorage";
import { EditorDocumentCommandReceiver } from "./EditorDocumentCommandReceiver";
import { EditorShapeCommandReceiver } from "./EditorShapeCommandReceiver";
import { EditorViewCommandReceiver } from "./EditorViewCommandReceiver";

export class EditorCommandReceiver implements CommandReceiver {
  private readonly documentReceiver: EditorDocumentCommandReceiver;
  private readonly shapeReceiver: EditorShapeCommandReceiver;
  private readonly viewReceiver: EditorViewCommandReceiver;

  public constructor(
    private readonly history: CommandHistory = new CommandHistory(),
    svgStorage: SvgStorage = new FileSvgStorage(),
  ) {
    this.documentReceiver = new EditorDocumentCommandReceiver(history, svgStorage);
    this.shapeReceiver = new EditorShapeCommandReceiver(this.documentReceiver);
    this.viewReceiver = new EditorViewCommandReceiver(this.documentReceiver);
  }

  public init(width?: number, height?: number): Promise<CommandResult> {
    return this.documentReceiver.init(width, height);
  }

  public read(path: string): Promise<CommandResult> {
    return this.documentReceiver.read(path);
  }

  public save(path?: string): Promise<CommandResult> {
    return this.documentReceiver.save(path);
  }

  public canvas(width?: number, height?: number): Promise<CommandResult> {
    return this.documentReceiver.canvas(width, height);
  }

  public createShape(
    shape: Shape,
    parentId?: string,
  ): Promise<CommandResult> {
    return this.shapeReceiver.createShape(shape, parentId);
  }

  public deleteShape(shapeId: string): Promise<CommandResult> {
    return this.shapeReceiver.deleteShape(shapeId);
  }

  public moveShape(
    shapeId: string,
    dx: number,
    dy: number,
  ): Promise<CommandResult> {
    return this.shapeReceiver.moveShape(shapeId, dx, dy);
  }

  public scaleShape(
    shapeId: string,
    factor: number,
  ): Promise<CommandResult> {
    return this.shapeReceiver.scaleShape(shapeId, factor);
  }

  public setAttribute(
    shapeId: string,
    attribute: EditableAttribute,
    value: string | number,
  ): Promise<CommandResult> {
    return this.shapeReceiver.setAttribute(shapeId, attribute, value);
  }

  public groupShapes(
    containerId: string,
    memberIds: readonly string[],
  ): Promise<CommandResult> {
    return this.shapeReceiver.groupShapes(containerId, memberIds);
  }

  public ungroupShapes(containerId: string): Promise<CommandResult> {
    return this.shapeReceiver.ungroupShapes(containerId);
  }

  public addToContainer(
    containerId: string,
    shapeId: string,
  ): Promise<CommandResult> {
    return this.shapeReceiver.addToContainer(containerId, shapeId);
  }

  public reorderShape(
    shapeId: string,
    position: "front" | "back",
  ): Promise<CommandResult> {
    return this.shapeReceiver.reorderShape(shapeId, position);
  }

  public capturePlacement(shapeId: string): ShapePlacement {
    return this.shapeReceiver.capturePlacement(shapeId);
  }

  public restorePlacements(placements: readonly ShapePlacement[]): void {
    this.shapeReceiver.restorePlacements(placements);
  }

  public restoreGroup(placement: ShapePlacement): void {
    this.shapeReceiver.restoreGroup(placement);
  }

  public captureAttribute(
    shapeId: string,
    attribute: EditableAttribute,
  ): ShapeAttributeSnapshot {
    return this.shapeReceiver.captureAttribute(shapeId, attribute);
  }

  public restoreAttribute(snapshot: ShapeAttributeSnapshot): void {
    this.shapeReceiver.restoreAttribute(snapshot);
  }

  public tree(shapeId?: string): Promise<CommandResult> {
    return this.viewReceiver.tree(shapeId);
  }

  public show(shapeId: string): Promise<CommandResult> {
    return this.viewReceiver.show(shapeId);
  }

  public help(): Promise<CommandResult> {
    return this.viewReceiver.help();
  }

  public undo(): Promise<CommandResult> {
    this.documentReceiver.requireDocument();
    return this.history.undo(this);
  }

  public redo(): Promise<CommandResult> {
    this.documentReceiver.requireDocument();
    return this.history.redo(this);
  }
}
