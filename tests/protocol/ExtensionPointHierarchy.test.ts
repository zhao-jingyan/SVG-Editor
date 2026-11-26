import { describe, expect, it } from "vitest";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import { CommandParameters } from "@/protocol/commands/contribution/CommandParameters";
import { ShapeContribution } from "@/protocol/shapes/contribution/ShapeContribution";
import { Command } from "@/protocol/commands/Command";
import { AttributeHandler } from "@/protocol/attributes/AttributeHandler";
import { TreeDecorator } from "@/protocol/tree/TreeDecorator";
import { MoveCommandContribution } from "@/_builtin/commands/MoveCommand/MoveCommandContribution";
import { RectShapeContribution } from "@/_builtin/shapes/RectShape/RectShapeContribution";
import { DirCommandContribution } from "@/_plugin/commands/DirCommand/DirCommandContribution";
import { StatsCommandContribution } from "@/_plugin/commands/StatsCommand/StatsCommandContribution";
import { BoxAttributeHandler } from "@/_plugin/shapes/BoxShape/BoxAttributeHandler";
import { BoxShapeContribution } from "@/_plugin/shapes/BoxShape/BoxShapeContribution";
import { BoxTypeLabelDecorator } from "@/_plugin/shapes/BoxShape/BoxTypeLabelDecorator";
import { ModifiedStarDecorator } from "@/_plugin/tree/ModifiedStarDecorator";
import { LambdaCommandContribution } from "../support/LambdaCommandContribution";

describe("四个扩展点的类层次", () => {
  it("内置与插件实现都继承内核侧抽象类", () => {
    expect(MoveCommandContribution.create()).toBeInstanceOf(CommandContribution);
    expect(StatsCommandContribution.create()).toBeInstanceOf(CommandContribution);
    expect(DirCommandContribution.create()).toBeInstanceOf(CommandContribution);
    expect(RectShapeContribution.create()).toBeInstanceOf(ShapeContribution);
    expect(BoxShapeContribution.create()).toBeInstanceOf(ShapeContribution);
    expect(new BoxAttributeHandler()).toBeInstanceOf(AttributeHandler);
    expect(new BoxTypeLabelDecorator()).toBeInstanceOf(TreeDecorator);
    expect(new ModifiedStarDecorator()).toBeInstanceOf(TreeDecorator);
  });

  it("违约：命令工厂返回非 Command 时由基类拒绝", () => {
    const bad = new LambdaCommandContribution(
      "bad",
      "bad",
      undefined,
      () => ({}) as unknown as Command,
    );

    expect(() => bad.createCommand(new CommandParameters([], "bad"))).toThrow(
      'command factory for "bad" must return a Command instance',
    );
  });

  it("违约：空的图形类型名在构造期被拒绝", () => {
    class EmptyNameShape extends ShapeContribution {
      public constructor() {
        super(" ");
      }
      public createShape(): never {
        throw new Error("unused");
      }
      public matchesSvg(): boolean {
        return false;
      }
      public readFromSvg(): never {
        throw new Error("unused");
      }
    }

    expect(() => new EmptyNameShape()).toThrow("shape type name must not be empty");
  });
});
