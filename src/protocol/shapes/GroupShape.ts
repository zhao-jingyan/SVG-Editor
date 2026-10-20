import type { EditableAttribute } from "../EditableAttribute";
import { Shape } from "./Shape";
import { ShapeError } from "./ShapeError";
import { ShapeType } from "./ShapeType";

export class GroupShape extends Shape {
  private readonly children: Shape[];

  public constructor(id: string, children: readonly Shape[] = []) {
    super(id);
    this.children = [];

    for (const child of children) {
      this.addChild(child);
    }
  }

  public override getType(): ShapeType {
    return ShapeType.Group;
  }

  public addChild(child: Shape): void {
    if (child === this) {
      throw new ShapeError("invalid-argument", "cannot add a container to itself");
    }

    if (
      child.getId() === this.getId() ||
      this.children.some((existing) => existing.getId() === child.getId())
    ) {
      throw new ShapeError("duplicate-id", `id already exists: ${child.getId()}`);
    }

    this.children.push(child);
  }

  public removeChild(shapeId: string): Shape | undefined {
    const index = this.children.findIndex((child) => child.getId() === shapeId);

    if (index < 0) {
      return undefined;
    }

    return this.children.splice(index, 1)[0];
  }

  public getChildren(): readonly Shape[] {
    return [...this.children];
  }

  public override move(dx: number, dy: number): void {
    const nextDx = this.requireFiniteNumber(dx, "dx");
    const nextDy = this.requireFiniteNumber(dy, "dy");

    for (const child of this.children) {
      child.move(nextDx, nextDy);
    }
  }

  public override scale(factor: number): void {
    const nextFactor = this.requirePositiveScaleFactor(factor);

    for (const child of this.children) {
      child.scale(nextFactor);
    }
  }

  public override setAttribute(
    attribute: EditableAttribute,
    value: string | number,
  ): void {
    if (attribute !== "fill" && attribute !== "stroke" && attribute !== "stroke-width") {
      throw new ShapeError("unknown-attribute", `unknown attribute: ${attribute}`);
    }

    if (attribute === "stroke-width") {
      this.requireNumericAttribute(value, attribute);
    } else {
      this.requireStringAttribute(value, attribute);
    }

    for (const child of this.children) {
      child.setAttribute(attribute, value);
    }
  }

  public override getAttribute(
    _attribute: EditableAttribute,
  ): string | number | undefined {
    return undefined;
  }
}
