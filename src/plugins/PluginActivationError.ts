export class PluginActivationError extends Error {
  private readonly pluginName: string;
  private readonly reason: string;

  public constructor(pluginName: string, cause: unknown) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    super(`plugin failed to activate: ${pluginName} (${reason})`, { cause });
    this.name = "PluginActivationError";
    this.pluginName = pluginName;
    this.reason = reason;
  }

  public getPluginName(): string {
    return this.pluginName;
  }

  public getReason(): string {
    return this.reason;
  }
}
