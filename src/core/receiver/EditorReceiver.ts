import type { CommandReceiver } from "../../protocol/receivers/CommandReceiver";
import type { EditableAttribute } from "../../protocol/shapes/model/EditableAttribute";
import type { ShapeAttributeSnapshot } from "../../protocol/commands/memento/ShapeAttributeSnapshot";
import type { ShapePlacement } from "../../protocol/commands/memento/ShapePlacement";
import type { CommandResult } from "../../protocol/results/CommandResult";
import type { Shape } from "../../protocol/shapes/model/Shape";
import { CommandHistory } from "../history/CommandHistory";
import { FileSvgStorage } from "../io/FileSvgStorage";
import type { SvgStorage } from "../io/SvgStorage";
import { DocumentManager } from "./DocumentManager";
import { EditorView } from "./EditorView";
import { ShapeEditor } from "./ShapeEditor";

export class EditorReceiver implements CommandReceiver {
  private readonly documentManager: DocumentManager;
  private readonly shapeEditor: ShapeEditor;
  private readonly editorView: EditorView;

  public constructor(
    private readonly history: CommandHistory = new CommandHistory(),
    svgStorage: SvgStorage = new FileSvgStorage(),
  ) {
    this.documentManager = new DocumentManager(history, svgStorage);
    this.shapeEditor = new ShapeEditor(this.documentManager);
    this.editorView = new EditorView(this.documentManager);
  }

  public init(width?: number, height?: number): Promise<CommandResult> {
    return this.documentManager.init(width, height);
  }

  public read(path: string): Promise<CommandResult> {
    return this.documentManager.read(path);
  }

  public save(path?: string): Promise<CommandResult> {
    return this.documentManager.save(path);
  }

  public canvas(width?: number, height?: number): Promise<CommandResult> {
    return this.documentManager.canvas(width, height);
  }

  public createShape(
    shape: Shape,
    parentId?: string,
  ): Promise<CommandResult> {
    return this.shapeEditor.createShape(shape, parentId);
  }

  public deleteShape(shapeId: string): Promise<CommandResult> {
    return this.shapeEditor.deleteShape(shapeId);
  }

  public moveShape(
    shapeId: string,
    dx: number,
    dy: number,
  ): Promise<CommandResult> {
    return this.shapeEditor.moveShape(shapeId, dx, dy);
  }

  public scaleShape(
    shapeId: string,
    factor: number,
  ): Promise<CommandResult> {
    return this.shapeEditor.scaleShape(shapeId, factor);
  }

  public setAttribute(
    shapeId: string,
    attribute: EditableAttribute,
    value: string | number,
  ): Promise<CommandResult> {
    return this.shapeEditor.setAttribute(shapeId, attribute, value);
  }

  public groupShapes(
    containerId: string,
    memberIds: readonly string[],
  ): Promise<CommandResult> {
    return this.shapeEditor.groupShapes(containerId, memberIds);
  }

  public ungroupShapes(containerId: string): Promise<CommandResult> {
    return this.shapeEditor.ungroupShapes(containerId);
  }

  public addToContainer(
    containerId: string,
    shapeId: string,
  ): Promise<CommandResult> {
    return this.shapeEditor.addToContainer(containerId, shapeId);
  }

  public reorderShape(
    shapeId: string,
    position: "front" | "back",
  ): Promise<CommandResult> {
    return this.shapeEditor.reorderShape(shapeId, position);
  }

  public capturePlacement(shapeId: string): ShapePlacement {
    return this.shapeEditor.capturePlacement(shapeId);
  }

  public restorePlacements(placements: readonly ShapePlacement[]): void {
    this.shapeEditor.restorePlacements(placements);
  }

  public restoreGroup(placement: ShapePlacement): void {
    this.shapeEditor.restoreGroup(placement);
  }

  public captureAttribute(
    shapeId: string,
    attribute: EditableAttribute,
  ): ShapeAttributeSnapshot {
    return this.shapeEditor.captureAttribute(shapeId, attribute);
  }

  public restoreAttribute(snapshot: ShapeAttributeSnapshot): void {
    this.shapeEditor.restoreAttribute(snapshot);
  }

  public tree(shapeId?: string): Promise<CommandResult> {
    return this.editorView.tree(shapeId);
  }

  public show(shapeId: string): Promise<CommandResult> {
    return this.editorView.show(shapeId);
  }

  public help(): Promise<CommandResult> {
    return this.editorView.help();
  }

  public undo(): Promise<CommandResult> {
    this.documentManager.requireDocument();
    return this.history.undo(this);
  }

  public redo(): Promise<CommandResult> {
    this.documentManager.requireDocument();
    return this.history.redo(this);
  }
}
