import { CanvasCommand } from "../../../protocol/commands/doc/CanvasCommand";
import { InitCommand } from "../../../protocol/commands/doc/InitCommand";
import { ReadCommand } from "../../../protocol/commands/doc/ReadCommand";
import { SaveCommand } from "../../../protocol/commands/doc/SaveCommand";
import type { CommandParameters } from "../../../protocol/contribution/CommandParameters";

/**
 * 构造文档生命周期命令。
 */
export class DocumentCommandParser {
  public parseInit(parameters: CommandParameters): InitCommand {
    if (parameters.hasLength(0)) {
      return new InitCommand();
    }

    parameters.expectLength(2);
    const dimensions = parameters.numbers(0, 2);
    return new InitCommand(dimensions[0], dimensions[1]);
  }

  public parseRead(parameters: CommandParameters): ReadCommand {
    parameters.expectLength(1);
    return new ReadCommand(parameters.text(0, "file path"));
  }

  public parseSave(parameters: CommandParameters): SaveCommand {
    if (parameters.hasLength(0)) {
      return new SaveCommand();
    }

    parameters.expectLength(1);
    return new SaveCommand(parameters.text(0, "file path"));
  }

  public parseCanvas(parameters: CommandParameters): CanvasCommand {
    if (parameters.hasLength(0)) {
      return new CanvasCommand();
    }

    parameters.expectLength(2);
    const dimensions = parameters.numbers(0, 2);
    return new CanvasCommand(dimensions[0], dimensions[1]);
  }
}
