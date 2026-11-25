import { ExitCommand } from "../../../protocol/commands/session/ExitCommand";
import { HelpCommand } from "../../../protocol/commands/view/HelpCommand";
import { RedoCommand } from "../../../protocol/commands/history/RedoCommand";
import { ShowCommand } from "../../../protocol/commands/view/ShowCommand";
import { TreeCommand } from "../../../protocol/commands/view/TreeCommand";
import { UndoCommand } from "../../../protocol/commands/history/UndoCommand";
import type { CommandParameters } from "../../../protocol/contribution/CommandParameters";

/**
 * 构造显示、历史和会话命令。
 */
export class ViewCommandParser {
  public parseTree(parameters: CommandParameters): TreeCommand {
    if (parameters.hasLength(0)) {
      return new TreeCommand();
    }

    parameters.expectLength(1);
    return new TreeCommand(parameters.text(0, "shape id"));
  }

  public parseShow(parameters: CommandParameters): ShowCommand {
    parameters.expectLength(1);
    return new ShowCommand(parameters.text(0, "shape id"));
  }

  public parseHelp(parameters: CommandParameters): HelpCommand {
    parameters.expectLength(0);
    return new HelpCommand();
  }

  public parseUndo(parameters: CommandParameters): UndoCommand {
    parameters.expectLength(0);
    return new UndoCommand();
  }

  public parseRedo(parameters: CommandParameters): RedoCommand {
    parameters.expectLength(0);
    return new RedoCommand();
  }

  public parseExit(parameters: CommandParameters): ExitCommand {
    parameters.expectLength(0);
    return new ExitCommand();
  }
}
