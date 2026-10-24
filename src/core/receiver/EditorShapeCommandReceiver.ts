import type { EditableAttribute } from "../../protocol/shapes/model/EditableAttribute";
import type { ShapeCommandReceiver } from "../../protocol/receivers/ShapeCommandReceiver";
import type { ShapeAttributeSnapshot } from "../../protocol/commands/memento/ShapeAttributeSnapshot";
import type { ShapePlacement } from "../../protocol/commands/memento/ShapePlacement";
import type { CommandResult } from "../../protocol/results/CommandResult";
import { CommandSuccessResult } from "../../protocol/results/outcomes/CommandSuccessResult";
import { GroupShape } from "../../protocol/shapes/concrete/GroupShape";
import type { Shape } from "../../protocol/shapes/model/Shape";
import type { EditorDocumentCommandReceiver } from "./EditorDocumentCommandReceiver";

export class EditorShapeCommandReceiver implements ShapeCommandReceiver {
  public constructor(
    private readonly documentReceiver: EditorDocumentCommandReceiver,
  ) {}

  public async createShape(
    shape: Shape,
    parentId?: string,
  ): Promise<CommandResult> {
    this.documentReceiver.requireDocument().addShape(shape, parentId);
    const suffix = parentId === undefined ? "" : ` in g#${parentId}`;
    return new CommandSuccessResult(
      `${shape.getType()}#${shape.getId()} created${suffix}`,
    );
  }

  public async deleteShape(shapeId: string): Promise<CommandResult> {
    const document = this.documentReceiver.requireDocument();
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
    const document = this.documentReceiver.requireDocument();
    const shape = document.getShape(shapeId);
    document.moveShape(shapeId, dx, dy);
    const position = shape.getPosition();

    if (position !== undefined) {
      return new CommandSuccessResult(
        `${shape.getType()}#${shape.getId()} moved to (${position.getX()},${position.getY()})`,
      );
    }

    return new CommandSuccessResult(
      `${shape.getType()}#${shape.getId()} moved by (${dx},${dy})`,
    );
  }

  public async scaleShape(
    shapeId: string,
    factor: number,
  ): Promise<CommandResult> {
    const document = this.documentReceiver.requireDocument();
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
    const document = this.documentReceiver.requireDocument();
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
    this.documentReceiver.requireDocument().groupShapes(containerId, memberIds);
    return new CommandSuccessResult(
      `g#${containerId} created with ${memberIds.length} children`,
    );
  }

  public async ungroupShapes(containerId: string): Promise<CommandResult> {
    const document = this.documentReceiver.requireDocument();
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
    const document = this.documentReceiver.requireDocument();
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
    const document = this.documentReceiver.requireDocument();
    const shape = document.getShape(shapeId);
    document.reorderShape(shapeId, position);
    return new CommandSuccessResult(
      `${shape.getType()}#${shape.getId()} moved to ${position}`,
    );
  }

  public capturePlacement(shapeId: string): ShapePlacement {
    return this.documentReceiver.requireDocument().capturePlacement(shapeId);
  }

  public restorePlacements(placements: readonly ShapePlacement[]): void {
    this.documentReceiver.requireDocument().restorePlacements(placements);
  }

  public restoreGroup(placement: ShapePlacement): void {
    this.documentReceiver.requireDocument().restoreGroup(placement);
  }

  public captureAttribute(
    shapeId: string,
    attribute: EditableAttribute,
  ): ShapeAttributeSnapshot {
    return this.documentReceiver.requireDocument().captureAttribute(shapeId, attribute);
  }

  public restoreAttribute(snapshot: ShapeAttributeSnapshot): void {
    this.documentReceiver.requireDocument().restoreAttribute(snapshot);
  }

  private formatValue(value: string | number): string {
    return typeof value === "string" ? `"${value}"` : `${value}`;
  }
}
