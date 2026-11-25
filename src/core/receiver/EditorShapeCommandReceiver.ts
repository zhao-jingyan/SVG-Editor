import type { AttributeCatalog } from "@/protocol/attributes/AttributeCatalog";
import { EditableAttributeRules } from "@/protocol/attributes/EditableAttributeRules";
import type { ShapeCommandReceiver } from "@/protocol/receivers/ShapeCommandReceiver";
import type { ShapeAttributeSnapshot } from "@/protocol/commands/memento/ShapeAttributeSnapshot";
import type { ShapePlacement } from "@/protocol/commands/memento/ShapePlacement";
import type { CommandResult } from "@/protocol/results/CommandResult";
import { CommandSuccessResult } from "@/protocol/results/outcomes/CommandSuccessResult";
import { GroupShape } from "@/protocol/shapes/concrete/GroupShape";
import type { Shape } from "@/protocol/shapes/model/Shape";
import { AttributeRegistry } from "@/core/attributes/AttributeRegistry";
import type { EditorDocumentCommandReceiver } from "./EditorDocumentCommandReceiver";

export class EditorShapeCommandReceiver implements ShapeCommandReceiver {
  private readonly attributeRules = new EditableAttributeRules();

  public constructor(
    private readonly documentReceiver: EditorDocumentCommandReceiver,
    private readonly attributeCatalog: AttributeCatalog = new AttributeRegistry(),
  ) {}

  public async createShape(
    shape: Shape,
    parentId?: string,
  ): Promise<CommandResult> {
    this.documentReceiver.requireDocument().addShape(shape, parentId);
    const suffix = parentId === undefined ? "" : ` in g#${parentId}`;
    return new CommandSuccessResult(`${shape.describeCreated()}${suffix}`);
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
    attribute: string,
    value: string | number,
  ): Promise<CommandResult> {
    const document = this.documentReceiver.requireDocument();
    const shape = document.getShape(shapeId);
    const handler = this.attributeCatalog.find(shape, attribute);

    if (handler !== undefined) {
      const message = handler.apply(shape, attribute, `${value}`);
      return new CommandSuccessResult(message);
    }

    const editable = this.attributeRules.requireEditable(attribute);
    document.setAttribute(shapeId, editable, value);
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
    attribute: string,
  ): ShapeAttributeSnapshot {
    const document = this.documentReceiver.requireDocument();
    const shape = document.getShape(shapeId);
    // 查找属性处理程序
    const handler = this.attributeCatalog.find(shape, attribute);

    // 如果找到处理程序，则调用其捕获方法
    if (handler !== undefined) {
      return handler.capture(shape, attribute);
    }

    // 如果未找到处理程序，则使用默认的捕获方法
    const editable = this.attributeRules.requireEditable(attribute);
    return document.captureAttribute(shapeId, editable);
  }

  public restoreAttribute(snapshot: ShapeAttributeSnapshot): void {
    this.documentReceiver.requireDocument().restoreAttribute(snapshot);
  }

  private formatValue(value: string | number): string {
    return typeof value === "string" ? `"${value}"` : `${value}`;
  }
}
