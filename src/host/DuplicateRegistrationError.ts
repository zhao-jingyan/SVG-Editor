/** 同类扩展名冲突；宿主格式化为 error: duplicate registration: category/name。 */
export class DuplicateRegistrationError extends Error {
  public constructor(
    public readonly category: string,
    public readonly registrationName: string,
  ) {
    super(`duplicate registration: ${category}/${registrationName}`);
    this.name = "DuplicateRegistrationError";
  }
}
