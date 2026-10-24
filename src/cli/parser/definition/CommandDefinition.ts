import type { Command } from "../../../protocol/Command";
import type { CommandArguments } from "../arguments/CommandArguments";

export interface CommandDefinition {
  readonly usage: string;
  readonly parse: (args: CommandArguments) => Command;
}
