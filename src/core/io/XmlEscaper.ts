export class XmlEscaper {
  public escapeText(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  public escapeAttribute(value: string): string {
    return this.escapeText(value)
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}
