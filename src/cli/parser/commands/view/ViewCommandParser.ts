import { ExitCommand } from "../../../../protocol/commands/ExitCommand";
import { HelpCommand } from "../../../../protocol/commands/HelpCommand";
import { RedoCommand } from "../../../../protocol/commands/RedoCommand";
import { ShowCommand } from "../../../../protocol/commands/ShowCommand";
import { TreeCommand } from "../../../../protocol/commands/TreeCommand";
import { UndoCommand } from "../../../../protocol/commands/UndoCommand";
import type { CommandArguments } from "../../syntax/CommandArguments";

/**
 * 构造显示、历史和会话命令。
 */
export class ViewCommandParser {
  public parseTree(args: CommandArguments): TreeCommand {
    if (args.hasLength(1)) {
      return new TreeCommand();
    }

    args.expectLength(2);
    return new TreeCommand(args.text(1, "shape id"));
  }

  public parseShow(args: CommandArguments): ShowCommand {
    args.expectLength(2);
    return new ShowCommand(args.text(1, "shape id"));
  }

  public parseHelp(args: CommandArguments): HelpCommand {
    args.expectLength(1);
    return new HelpCommand();
  }

  public parseUndo(args: CommandArguments): UndoCommand {
    args.expectLength(1);
    return new UndoCommand();
  }

  public parseRedo(args: CommandArguments): RedoCommand {
    args.expectLength(1);
    return new RedoCommand();
  }

  public parseExit(args: CommandArguments): ExitCommand {
    args.expectLength(1);
    return new ExitCommand();
  }
}
