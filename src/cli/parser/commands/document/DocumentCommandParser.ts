import { CanvasCommand } from "../../../../protocol/commands/CanvasCommand";
import { InitCommand } from "../../../../protocol/commands/InitCommand";
import { ReadCommand } from "../../../../protocol/commands/ReadCommand";
import { SaveCommand } from "../../../../protocol/commands/SaveCommand";
import type { CommandArguments } from "../../syntax/CommandArguments";

/**
 * 构造文档生命周期命令。
 */
export class DocumentCommandParser {
  public parseInit(args: CommandArguments): InitCommand {
    if (args.hasLength(1)) {
      return new InitCommand();
    }

    args.expectLength(3);
    const dimensions = args.numbers(1, 2);
    return new InitCommand(dimensions[0], dimensions[1]);
  }

  public parseRead(args: CommandArguments): ReadCommand {
    args.expectLength(2);
    return new ReadCommand(args.text(1, "file path"));
  }

  public parseSave(args: CommandArguments): SaveCommand {
    if (args.hasLength(1)) {
      return new SaveCommand();
    }

    args.expectLength(2);
    return new SaveCommand(args.text(1, "file path"));
  }

  public parseCanvas(args: CommandArguments): CanvasCommand {
    if (args.hasLength(1)) {
      return new CanvasCommand();
    }

    args.expectLength(3);
    const dimensions = args.numbers(1, 2);
    return new CanvasCommand(dimensions[0], dimensions[1]);
  }
}
