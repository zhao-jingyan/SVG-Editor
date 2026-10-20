import type { Command } from "../protocol/Command";
import type { CommandContext } from "../protocol/CommandContext";
import type { EditableAttribute } from "../protocol/EditableAttribute";
import type { ShapeAttributeSnapshot } from "../protocol/commands/ShapeAttributeSnapshot";
import type { ShapePlacement } from "../protocol/commands/ShapePlacement";
import { CommandErrorCode } from "../protocol/errors/CommandErrorCode";
import { CommandExecutionError } from "../protocol/errors/CommandExecutionError";
import { DocumentError } from "../protocol/errors/DocumentError";
import { CommandErrorResult } from "../protocol/results/CommandErrorResult";
import type { CommandResult } from "../protocol/results/CommandResult";
import { CommandSuccessResult } from "../protocol/results/CommandSuccessResult";
import { GroupShape } from "../protocol/shapes/GroupShape";
import type { Shape } from "../protocol/shapes/Shape";
import { UndoableCommand } from "../protocol/UndoableCommand";
import { HelpText } from "./display/HelpText";
import { ShapeDetailVisitor } from "./display/ShapeDetailVisitor";
import { TreeDisplay } from "./display/TreeDisplay";
import { Document } from "./document/Document";
import { CommandHistory } from "./history/CommandHistory";

export class EditorContext implements CommandContext {
  private document?: Document;
  private readonly history: CommandHistory = new CommandHistory();
  private readonly helpText: HelpText = new HelpText();
  private readonly shapeDetailVisitor: ShapeDetailVisitor = new ShapeDetailVisitor();
  private readonly treeDisplay: TreeDisplay = new TreeDisplay();
  private historyLocked: boolean = false;

  public async execute(command: Command): Promise<CommandResult> {
    const result = await command.execute(this);

    if (result.isSuccess() && command instanceof UndoableCommand) {
      this.history.record(command);
      this.historyLocked = false;
    }

    return result;
  }

  public async init(width?: number, height?: number): Promise<CommandResult> {
    const document = new Document(width ?? 800, height ?? 600);
    this.document = document;
    this.history.clear();
    this.historyLocked = true;
    return new CommandSuccessResult(
      `canvas ${document.getWidth()}x${document.getHeight()} created`,
    );
  }

  public async read(_path: string): Promise<CommandResult> {
    return this.notImplemented("read");
  }

  public async save(_path?: string): Promise<CommandResult> {
    return this.notImplemented("save");
  }

  public async canvas(width?: number, height?: number): Promise<CommandResult> {
    const document = this.requireDocument();

    if (width === undefined && height === undefined) {
      return new CommandSuccessResult(
        `canvas ${document.getWidth()}x${document.getHeight()}`,
      );
    }

    if (width === undefined || height === undefined) {
      throw new DocumentError(
        CommandErrorCode.InvalidArgument,
        "canvas requires both width and height",
      );
    }

    document.resize(width, height);
    this.historyLocked = true;
    return new CommandSuccessResult(
      `canvas ${document.getWidth()}x${document.getHeight()} resized`,
    );
  }

  public async createShape(
    shape: Shape,
    parentId?: string,
  ): Promise<CommandResult> {
    this.requireDocument().addShape(shape, parentId);
    const suffix = parentId === undefined ? "" : ` in g#${parentId}`;
    return new CommandSuccessResult(
      `${shape.getType()}#${shape.getId()} created${suffix}`,
    );
  }

  public async deleteShape(shapeId: string): Promise<CommandResult> {
    const document = this.requireDocument();
    const shape = document.getShape(shapeId);
    document.deleteShape(shapeId);
    return new CommandSuccessResult(
      `${shape.getType()}#${shape.getId()} deleted`,
    );
  }

  public async moveShape(
    shapeId: string,
    dx: number,
    dy: number,
  ): Promise<CommandResult> {
    const document = this.requireDocument();
    const shape = document.getShape(shapeId);
    document.moveShape(shapeId, dx, dy);
    return new CommandSuccessResult(
      `${shape.getType()}#${shape.getId()} moved by (${dx},${dy})`,
    );
  }

  public async scaleShape(
    shapeId: string,
    factor: number,
  ): Promise<CommandResult> {
    const document = this.requireDocument();
    const shape = document.getShape(shapeId);
    document.scaleShape(shapeId, factor);
    return new CommandSuccessResult(
      `${shape.getType()}#${shape.getId()} scaled by ${factor}`,
    );
  }

  public async setAttribute(
    shapeId: string,
    attribute: EditableAttribute,
    value: string | number,
  ): Promise<CommandResult> {
    const document = this.requireDocument();
    const shape = document.getShape(shapeId);
    document.setAttribute(shapeId, attribute, value);
    return new CommandSuccessResult(
      `${shape.getType()}#${shape.getId()} updated: ${attribute}=${this.formatValue(value)}`,
    );
  }

  public async groupShapes(
    containerId: string,
    memberIds: readonly string[],
  ): Promise<CommandResult> {
    this.requireDocument().groupShapes(containerId, memberIds);
    return new CommandSuccessResult(
      `g#${containerId} created with ${memberIds.length} children`,
    );
  }

  public async ungroupShapes(containerId: string): Promise<CommandResult> {
    const document = this.requireDocument();
    const container = document.getShape(containerId);
    const childCount = container instanceof GroupShape
      ? container.getChildren().length
      : 0;
    document.ungroupShapes(containerId);
    return new CommandSuccessResult(
      `g#${containerId} ungrouped into ${childCount} children`,
    );
  }

  public async addToContainer(
    containerId: string,
    shapeId: string,
  ): Promise<CommandResult> {
    const document = this.requireDocument();
    const shape = document.getShape(shapeId);
    document.addToContainer(containerId, shapeId);
    return new CommandSuccessResult(
      `${shape.getType()}#${shape.getId()} added to g#${containerId}`,
    );
  }

  public async reorderShape(
    shapeId: string,
    position: "front" | "back",
  ): Promise<CommandResult> {
    const document = this.requireDocument();
    const shape = document.getShape(shapeId);
    document.reorderShape(shapeId, position);
    return new CommandSuccessResult(
      `${shape.getType()}#${shape.getId()} moved to ${position}`,
    );
  }

  public capturePlacement(shapeId: string): ShapePlacement {
    return this.requireDocument().capturePlacement(shapeId);
  }

  public restorePlacements(placements: readonly ShapePlacement[]): void {
    this.requireDocument().restorePlacements(placements);
  }

  public restoreGroup(placement: ShapePlacement): void {
    this.requireDocument().restoreGroup(placement);
  }

  public captureAttribute(
    shapeId: string,
    attribute: EditableAttribute,
  ): ShapeAttributeSnapshot {
    return this.requireDocument().captureAttribute(shapeId, attribute);
  }

  public restoreAttribute(snapshot: ShapeAttributeSnapshot): void {
    this.requireDocument().restoreAttribute(snapshot);
  }

  public async tree(shapeId?: string): Promise<CommandResult> {
    return new CommandSuccessResult(
      this.treeDisplay.render(this.requireDocument(), shapeId),
    );
  }

  public async show(shapeId: string): Promise<CommandResult> {
    const document = this.requireDocument();
    const shape = document.getShape(shapeId);
    const parentId = document.getParentId(shapeId);
    const parentLabel = parentId === undefined ? "svg" : `g#${parentId}`;
    const lines = [
      `${shape.getType()}#${shape.getId()}  parent=${parentLabel}`,
      ...shape.accept(this.shapeDetailVisitor).map((line) => `  ${line}`),
    ];
    return new CommandSuccessResult(lines.join("\n"));
  }

  public async help(): Promise<CommandResult> {
    return new CommandSuccessResult(this.helpText.render());
  }

  public async undo(): Promise<CommandResult> {
    this.requireDocument();
    this.requireHistoryUnlocked();
    return this.history.undo(this);
  }

  public async redo(): Promise<CommandResult> {
    this.requireDocument();
    this.requireHistoryUnlocked();
    return this.history.redo(this);
  }

  private requireDocument(): Document {
    if (this.document === undefined) {
      throw new DocumentError(
        CommandErrorCode.NoDocument,
        "no document. use 'init' or 'read' first",
      );
    }

    return this.document;
  }

  private requireHistoryUnlocked(): void {
    if (this.historyLocked) {
      throw new CommandExecutionError(
        CommandErrorCode.HistoryUnavailable,
        "undo not allowed after io command",
      );
    }
  }

  private notImplemented(commandName: string): CommandResult {
    return new CommandErrorResult(
      new CommandExecutionError(
        CommandErrorCode.CommandNotImplemented,
        `${commandName} is not implemented yet`,
      ),
    );
  }

  private formatValue(value: string | number): string {
    return typeof value === "string" ? `"${value}"` : `${value}`;
  }
}
