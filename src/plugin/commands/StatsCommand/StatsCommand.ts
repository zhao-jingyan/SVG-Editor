import { Command } from "@/protocol/commands/Command";
import type { CommandReceiver } from "@/protocol/receivers/CommandReceiver";
import type { CommandResult } from "@/protocol/results/CommandResult";
import { CommandSuccessResult } from "@/protocol/results/outcomes/CommandSuccessResult";
import { DocumentShapeStats } from "./DocumentShapeStats";

export class StatsCommand extends Command {
  public async execute(receiver: CommandReceiver): Promise<CommandResult> {
    const stats = DocumentShapeStats.fromRootShapes(receiver.getRootShapes());
    return new CommandSuccessResult(stats.format());
  }
}
