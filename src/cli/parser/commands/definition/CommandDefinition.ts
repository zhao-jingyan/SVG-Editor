import type { Command } from "../../../../protocol/Command";
import type { CommandArguments } from "../../syntax/CommandArguments";

export interface CommandDefinition {
  readonly usage: string;
  readonly parse: (args: CommandArguments) => Command;
}
