export class ShapeAttributeSnapshot {
  private readonly shapeId: string;
  private readonly shapeType: string;
  private readonly attribute: string;
  private readonly restoreAttribute: string;
  private readonly values: ReadonlyMap<string, string | number | undefined>;

  public constructor(
    shapeId: string,
    shapeType: string,
    attribute: string,
    values: ReadonlyMap<string, string | number | undefined>,
    restoreAttribute: string = attribute,
  ) {
    this.shapeId = shapeId;
    this.shapeType = shapeType;
    this.attribute = attribute;
    this.restoreAttribute = restoreAttribute;
    this.values = new Map(values);
  }

  public getShapeId(): string {
    return this.shapeId;
  }

  public getShapeType(): string {
    return this.shapeType;
  }

  /** 命令侧属性名（用于反馈文案，如 label）。 */
  public getAttribute(): string {
    return this.attribute;
  }

  /** 写回叶子图形时使用的属性名（如 text）。 */
  public getRestoreAttribute(): string {
    return this.restoreAttribute;
  }

  public getShapeIds(): readonly string[] {
    return [...this.values.keys()];
  }

  public getValue(shapeId: string): string | number | undefined {
    return this.values.get(shapeId);
  }
}
