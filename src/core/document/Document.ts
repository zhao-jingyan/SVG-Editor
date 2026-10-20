import type { EditableAttribute } from "../../protocol/EditableAttribute";
import { CommandErrorCode } from "../../protocol/errors/CommandErrorCode";
import { DocumentError } from "../../protocol/errors/DocumentError";
import type { Shape } from "../../protocol/shapes/Shape";
import { ShapeHierarchy } from "./ShapeHierarchy";
import { ShapeIndex } from "./ShapeIndex";

export class Document {
  private width: number;
  private height: number;
  private readonly shapeHierarchy: ShapeHierarchy = new ShapeHierarchy(
    new ShapeIndex(),
  );

  public constructor(width = 800, height = 600) {
    this.width = this.requireCanvasDimension(width, "width");
    this.height = this.requireCanvasDimension(height, "height");
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public resize(width: number, height: number): void {
    const nextWidth = this.requireCanvasDimension(width, "width");
    const nextHeight = this.requireCanvasDimension(height, "height");
    this.width = nextWidth;
    this.height = nextHeight;
  }

  public findShape(shapeId: string): Shape | undefined {
    return this.shapeHierarchy.findShape(shapeId);
  }

  public getShape(shapeId: string): Shape {
    return this.shapeHierarchy.getShape(shapeId);
  }

  public getParentId(shapeId: string): string | undefined {
    return this.shapeHierarchy.getParentId(shapeId);
  }

  public getRootShapes(): readonly Shape[] {
    return this.shapeHierarchy.getRootShapes();
  }

  public getChildren(parentId?: string): readonly Shape[] {
    return this.shapeHierarchy.getChildren(parentId);
  }

  public addShape(shape: Shape, parentId?: string): void {
    this.shapeHierarchy.addShape(shape, parentId);
  }

  public deleteShape(shapeId: string): void {
    this.shapeHierarchy.deleteShape(shapeId);
  }

  public moveShape(shapeId: string, dx: number, dy: number): void {
    this.getShape(shapeId).move(dx, dy);
  }

  public scaleShape(shapeId: string, factor: number): void {
    this.getShape(shapeId).scale(factor);
  }

  public setAttribute(
    shapeId: string,
    attribute: EditableAttribute,
    value: string | number,
  ): void {
    this.getShape(shapeId).setAttribute(attribute, value);
  }

  public groupShapes(containerId: string, memberIds: readonly string[]): void {
    this.shapeHierarchy.groupShapes(containerId, memberIds);
  }

  public ungroupShapes(containerId: string): void {
    this.shapeHierarchy.ungroupShapes(containerId);
  }

  public addToContainer(containerId: string, shapeId: string): void {
    this.shapeHierarchy.addToContainer(containerId, shapeId);
  }

  public reorderShape(shapeId: string, position: "front" | "back"): void {
    this.shapeHierarchy.reorderShape(shapeId, position);
  }

  private requireCanvasDimension(value: number, label: string): number {
    if (!Number.isFinite(value) || value <= 0) {
      throw new DocumentError(
        CommandErrorCode.InvalidNumber,
        `canvas ${label} must be a positive finite number`,
      );
    }

    return value;
  }
}
