/** 配置文件中单条插件项（边界结构，进入宿主前校验）。 */
export class PluginConfigEntry {
  public constructor(
    private readonly moduleId: string,
    private readonly enabled: boolean,
    private readonly options: Readonly<Record<string, unknown>>,
  ) {}

  public static fromUnknown(raw: unknown): PluginConfigEntry {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      throw new Error("plugin entry must be an object");
    }

    const record = raw as Record<string, unknown>;
    if (typeof record.module !== "string" || record.module.trim() === "") {
      throw new Error("plugin entry.module must be a non-empty string");
    }

    if (record.enabled !== undefined && typeof record.enabled !== "boolean") {
      throw new Error("plugin entry.enabled must be a boolean");
    }

    if (
      record.options !== undefined &&
      (typeof record.options !== "object" ||
        record.options === null ||
        Array.isArray(record.options))
    ) {
      throw new Error("plugin entry.options must be an object");
    }

    const options =
      record.options === undefined
        ? {}
        : Object.freeze({ ...(record.options as Record<string, unknown>) });

    return new PluginConfigEntry(
      record.module,
      record.enabled !== false,
      options,
    );
  }

  public getModuleId(): string {
    return this.moduleId;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getOptions(): Readonly<Record<string, unknown>> {
    return this.options;
  }
}
