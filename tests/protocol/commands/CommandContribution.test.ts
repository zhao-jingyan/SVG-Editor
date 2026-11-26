import { describe, expect, it } from "vitest";
import { LambdaCommandContribution } from "../../support/LambdaCommandContribution";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";
import { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { MoveCommand } from "@/_builtin/commands/MoveCommand/MoveCommand";

describe("CommandContribution", () => {
  it("校验名称和 usage 非空", () => {
    expect(
      () =>
        new LambdaCommandContribution(
          "",
          "move <id> <dx> <dy>",
          undefined,
          () => new MoveCommand("r1", 0, 0),
        ),
    ).toThrow("command name must not be empty");

    expect(
      () =>
        new LambdaCommandContribution(
          "move",
          "  ",
          undefined,
          () => new MoveCommand("r1", 0, 0),
        ),
    ).toThrow("command usage must not be empty");
  });

  it("暴露名称、usage 与可选 help", () => {
    const help = new CommandHelp("move <id> <dx> <dy>", "move a shape");
    const contribution = new LambdaCommandContribution(
      "move",
      "move <id> <dx> <dy>",
      help,
      (parameters) => {
        parameters.expectLength(3);
        return new MoveCommand(
          parameters.text(0, "shape id"),
          parameters.number(1),
          parameters.number(2),
        );
      },
    );

    expect(contribution.getName()).toBe("move");
    expect(contribution.getUsage()).toBe("move <id> <dx> <dy>");
    expect(contribution.getHelp()).toBe(help);
  });

  it("根据参数创建 Command 子类实例", () => {
    const contribution = new LambdaCommandContribution(
      "move",
      "move <id> <dx> <dy>",
      undefined,
      (parameters) => {
        parameters.expectLength(3);
        const numbers = parameters.numbers(1, 2);
        return new MoveCommand(
          parameters.text(0, "shape id"),
          numbers[0],
          numbers[1],
        );
      },
    );

    const command = contribution.createCommand(
      new CommandParameters(["r1", "10", "-5"], "move <id> <dx> <dy>"),
    );

    expect(command).toBeInstanceOf(MoveCommand);
  });
});
