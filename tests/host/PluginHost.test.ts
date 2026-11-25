import { describe, expect, it } from "vitest";
import { AttributeRegistry } from "@/core/attributes/AttributeRegistry";
import { CommandRegistry } from "@/core/commands/CommandRegistry";
import { ShapeRegistry } from "@/core/shapes/ShapeRegistry";
import { TreeDecoratorRegistry } from "@/core/tree/TreeDecoratorRegistry";
import { PluginHost } from "@/host/PluginHost";
import { PluginContributes } from "@/protocol/plugins/PluginContributes";
import type { PluginContext } from "@/protocol/plugins/PluginContext";
import type { SvgPlugin } from "@/protocol/plugins/SvgPlugin";
import { CommandContribution } from "@/protocol/commands/contribution/CommandContribution";
import { CommandHelp } from "@/protocol/commands/contribution/CommandHelp";
import { TreeDecorator } from "@/protocol/tree/TreeDecorator";
import { StatsCommand } from "@/_plugin/commands/StatsCommand/StatsCommand";

class NamedDecorator extends TreeDecorator {
  public constructor(private readonly decoratorName: string) {
    super();
  }

  public getName(): string {
    return this.decoratorName;
  }
}

function createHost(errors: string[]): PluginHost {
  return new PluginHost(
    new CommandRegistry(),
    new ShapeRegistry(),
    new AttributeRegistry(),
    new TreeDecoratorRegistry(),
    (message) => {
      errors.push(message);
    },
  );
}

function commandContribution(name: string): CommandContribution {
  return new CommandContribution(
    name,
    name,
    new CommandHelp(name, name),
    () => new StatsCommand(),
  );
}

describe("PluginHost", () => {
  it("校验通过后提交注册", async () => {
    const errors: string[] = [];
    const commands = new CommandRegistry();
    const host = new PluginHost(
      commands,
      new ShapeRegistry(),
      new AttributeRegistry(),
      new TreeDecoratorRegistry(),
      (message) => errors.push(message),
    );

    const plugin: SvgPlugin = {
      name: "demo",
      activate(context: PluginContext): void {
        context.registerCommand(commandContribution("stats"));
      },
    };

    const ok = await host.activate(
      plugin,
      PluginContributes.of({ commands: ["stats"] }),
    );

    expect(ok).toBe(true);
    expect(errors).toEqual([]);
    expect(commands.find("stats")).toBeDefined();
  });

  it("清单不一致时回滚且继续可装后续插件", async () => {
    const errors: string[] = [];
    const commands = new CommandRegistry();
    const host = new PluginHost(
      commands,
      new ShapeRegistry(),
      new AttributeRegistry(),
      new TreeDecoratorRegistry(),
      (message) => errors.push(message),
    );

    const bad: SvgPlugin = {
      name: "bad",
      activate(context: PluginContext): void {
        context.registerCommand(commandContribution("stats"));
      },
    };
    const good: SvgPlugin = {
      name: "good",
      activate(context: PluginContext): void {
        context.registerCommand(commandContribution("dir"));
      },
    };

    await host.activate(bad, PluginContributes.of({ commands: ["other"] }));
    await host.activate(good, PluginContributes.of({ commands: ["dir"] }));

    expect(errors[0]).toMatch(/^error: plugin manifest mismatch: bad/);
    expect(commands.find("stats")).toBeUndefined();
    expect(commands.find("dir")).toBeDefined();
  });

  it("重复注册拒绝并回滚", async () => {
    const errors: string[] = [];
    const decorators = new TreeDecoratorRegistry();
    decorators.register(new NamedDecorator("modified-star"));
    const host = new PluginHost(
      new CommandRegistry(),
      new ShapeRegistry(),
      new AttributeRegistry(),
      decorators,
      (message) => errors.push(message),
    );

    const plugin: SvgPlugin = {
      name: "dup",
      activate(context: PluginContext): void {
        context.registerDecorator(new NamedDecorator("modified-star"));
      },
    };

    const ok = await host.activate(
      plugin,
      PluginContributes.of({ decorators: ["modified-star"] }),
    );

    expect(ok).toBe(false);
    expect(errors).toEqual([
      "error: duplicate registration: decorators/modified-star",
    ]);
    expect(decorators.getDecorators()).toHaveLength(1);
  });

  it("activate 抛错时输出失败信息并回滚", async () => {
    const errors: string[] = [];
    const host = createHost(errors);
    const plugin: SvgPlugin = {
      name: "boom",
      activate(): void {
        throw new Error("boom-reason");
      },
    };

    const ok = await host.activate(plugin, PluginContributes.empty());

    expect(ok).toBe(false);
    expect(errors).toEqual([
      "error: plugin failed to activate: boom (boom-reason)",
    ]);
  });
});
