import type { EditableAttribute } from "@/protocol/shapes/model/EditableAttribute";

export class ShapeAttributeSnapshot {
  private readonly shapeId: string;
  private readonly shapeType: string;
  private readonly attribute: EditableAttribute;
  private readonly values: ReadonlyMap<string, string | number | undefined>;

  public constructor(
    shapeId: string,
    shapeType: string,
    attribute: EditableAttribute,
    values: ReadonlyMap<string, string | number | undefined>,
  ) {
    this.shapeId = shapeId;
    this.shapeType = shapeType;
    this.attribute = attribute;
    this.values = new Map(values);
  }

  public getShapeId(): string {
    return this.shapeId;
  }

  public getShapeType(): string {
    return this.shapeType;
  }

  public getAttribute(): EditableAttribute {
    return this.attribute;
  }

  public getShapeIds(): readonly string[] {
    return [...this.values.keys()];
  }

  public getValue(shapeId: string): string | number | undefined {
    return this.values.get(shapeId);
  }
}
