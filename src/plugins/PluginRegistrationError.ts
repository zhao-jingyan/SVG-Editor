export class PluginRegistrationError extends Error {
  public constructor(category: string, registrationName: string) {
    super(`duplicate registration: ${category}/${registrationName}`);
    this.name = "PluginRegistrationError";
  }
}
