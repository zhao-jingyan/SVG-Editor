import type { HelpTextProvider } from "../../src/protocol/plugins/HelpTextProvider";

export class StaticHelpTextProvider implements HelpTextProvider {
  public constructor(private readonly text: string) {}

  public render(): string {
    return this.text;
  }
}
