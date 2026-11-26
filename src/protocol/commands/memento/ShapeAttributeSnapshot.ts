export class ShapeAttributeSnapshot {
  private readonly shapeId: string;
  private readonly shapeType: string;
  private readonly attribute: string;
  private readonly restoreAttribute: string;
  private readonly values: ReadonlyMap<string, string | number | undefined>;
  private readonly restoredMessageDescriber?: (
    previous: string | number | undefined,
  ) => string;

  /**
   * @param restoredMessageDescriber 可选；撤销成功后的反馈文案由捕获快照的一方
   *   （如 AttributeHandler）提供，命令本身不认识扩展属性名。
   */
  public constructor(
    shapeId: string,
    shapeType: string,
    attribute: string,
    values: ReadonlyMap<string, string | number | undefined>,
    restoreAttribute: string = attribute,
    restoredMessageDescriber?: (previous: string | number | undefined) => string,
  ) {
    this.shapeId = shapeId;
    this.shapeType = shapeType;
    this.attribute = attribute;
    this.restoreAttribute = restoreAttribute;
    this.values = new Map(values);
    this.restoredMessageDescriber = restoredMessageDescriber;
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

  /** 撤销后的自定义反馈；未提供时返回 undefined，由命令使用默认文案。 */
  public describeRestored(
    previous: string | number | undefined,
  ): string | undefined {
    return this.restoredMessageDescriber?.(previous);
  }

  public getShapeIds(): readonly string[] {
    return [...this.values.keys()];
  }

  public getValue(shapeId: string): string | number | undefined {
    return this.values.get(shapeId);
  }
}
