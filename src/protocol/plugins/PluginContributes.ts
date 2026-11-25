/**
 * 插件清单：来自 package.json 的 contributes，进入宿主前归一化。
 * 缺省类别视为空列表。
 */
export class PluginContributes {
  private constructor(
    private readonly shapes: readonly string[],
    private readonly commands: readonly string[],
    private readonly attributes: readonly string[],
    private readonly decorators: readonly string[],
  ) {}

  public static empty(): PluginContributes {
    return new PluginContributes([], [], [], []);
  }

  public static of(partial: {
    readonly shapes?: readonly string[];
    readonly commands?: readonly string[];
    readonly attributes?: readonly string[];
    readonly decorators?: readonly string[];
  }): PluginContributes {
    return new PluginContributes(
      Object.freeze([...(partial.shapes ?? [])]),
      Object.freeze([...(partial.commands ?? [])]),
      Object.freeze([...(partial.attributes ?? [])]),
      Object.freeze([...(partial.decorators ?? [])]),
    );
  }

  /** 解析 package.json 中的 contributes；非法结构抛错。 */
  public static fromUnknown(raw: unknown): PluginContributes {
    if (raw === undefined || raw === null) {
      return PluginContributes.empty();
    }

    if (typeof raw !== "object" || Array.isArray(raw)) {
      throw new Error("contributes must be an object");
    }

    const record = raw as Record<string, unknown>;
    return PluginContributes.of({
      shapes: this.readNameList(record.shapes, "shapes"),
      commands: this.readNameList(record.commands, "commands"),
      attributes: this.readNameList(record.attributes, "attributes"),
      decorators: this.readNameList(record.decorators, "decorators"),
    });
  }

  public getShapes(): readonly string[] {
    return this.shapes;
  }

  public getCommands(): readonly string[] {
    return this.commands;
  }

  public getAttributes(): readonly string[] {
    return this.attributes;
  }

  public getDecorators(): readonly string[] {
    return this.decorators;
  }

  public formatDeclared(): string {
    return this.formatSets(this.shapes, this.commands, this.attributes, this.decorators);
  }

  public formatRegistered(
    shapes: readonly string[],
    commands: readonly string[],
    attributes: readonly string[],
    decorators: readonly string[],
  ): string {
    return this.formatSets(shapes, commands, attributes, decorators);
  }

  public matchesRegistered(
    shapes: readonly string[],
    commands: readonly string[],
    attributes: readonly string[],
    decorators: readonly string[],
  ): boolean {
    return (
      this.sameSet(this.shapes, shapes) &&
      this.sameSet(this.commands, commands) &&
      this.sameSet(this.attributes, attributes) &&
      this.sameSet(this.decorators, decorators)
    );
  }

  private sameSet(left: readonly string[], right: readonly string[]): boolean {
    if (left.length !== right.length) {
      return false;
    }

    const sortedLeft = [...left].sort();
    const sortedRight = [...right].sort();
    return sortedLeft.every((name, index) => name === sortedRight[index]);
  }

  private formatSets(
    shapes: readonly string[],
    commands: readonly string[],
    attributes: readonly string[],
    decorators: readonly string[],
  ): string {
    const parts: string[] = [];
    this.appendCategory(parts, "shapes", shapes);
    this.appendCategory(parts, "commands", commands);
    this.appendCategory(parts, "attributes", attributes);
    this.appendCategory(parts, "decorators", decorators);
    return parts.length === 0 ? "(none)" : parts.join(", ");
  }

  private appendCategory(
    parts: string[],
    category: string,
    names: readonly string[],
  ): void {
    for (const name of [...names].sort()) {
      parts.push(`${category}/${name}`);
    }
  }

  private static readNameList(value: unknown, field: string): readonly string[] {
    if (value === undefined) {
      return [];
    }

    if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
      throw new Error(`contributes.${field} must be a string array`);
    }

    return value as string[];
  }
}
