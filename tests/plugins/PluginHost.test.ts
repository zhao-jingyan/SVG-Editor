import { describe, expect, it } from "vitest";
import type { CommandCatalog } from "../../src/protocol/plugins/CommandCatalog";
import { CommandHelp } from "../../src/protocol/plugins/CommandHelp";
import type { CommandRegistrar } from "../../src/protocol/plugins/CommandRegistrar";
import { CommandRegistration } from "../../src/protocol/plugins/CommandRegistration";
import type { PluginContext } from "../../src/protocol/plugins/PluginContext";
import type { SvgPlugin } from "../../src/protocol/plugins/SvgPlugin";
import { HelpCommand } from "../../src/protocol/commands/view/HelpCommand";
import { PluginActivationError } from "../../src/plugins/PluginActivationError";
import { PluginHost } from "../../src/plugins/PluginHost";
import { PluginRegistrationError } from "../../src/plugins/PluginRegistrationError";

class InMemoryCommandRegistry implements CommandCatalog, CommandRegistrar {
  private readonly registrations: CommandRegistration[] = [];

  public register(registration: CommandRegistration): void {
    if (this.find(registration.getName()) !== undefined) {
      throw new PluginRegistrationError("commands", registration.getName());
    }

    this.registrations.push(registration);
  }

  public find(commandName: string): CommandRegistration | undefined {
    return this.registrations.find(
      (registration) => registration.getName() === commandName,
    );
  }

  public getRegistrations(): readonly CommandRegistration[] {
    return [...this.registrations];
  }
}

function createRegistration(
  name: string,
  helpDescription: string | undefined = `${name} 说明`,
): CommandRegistration {
  return new CommandRegistration(
    name,
    name,
    helpDescription === undefined
      ? undefined
      : new CommandHelp(name, helpDescription),
    () => new HelpCommand(),
  );
}

describe("PluginHost", () => {
  it("同步激活后按注册顺序提交命令", async () => {
    const registry = new InMemoryCommandRegistry();
    const host = new PluginHost({ commands: registry });
    const plugin: SvgPlugin = {
      name: "test-plugin",
      activate(context: PluginContext): void {
        context.commands.register(createRegistration("first"));
        context.commands.register(createRegistration("second"));
      },
    };

    await host.activate(plugin);

    expect(
      registry.getRegistrations().map((registration) => registration.getName()),
    ).toEqual(["first", "second"]);
  });

  it("支持异步 activate", async () => {
    const registry = new InMemoryCommandRegistry();
    const host = new PluginHost({ commands: registry });
    const plugin: SvgPlugin = {
      name: "async-plugin",
      async activate(context: PluginContext): Promise<void> {
        await Promise.resolve();
        context.commands.register(createRegistration("async"));
      },
    };

    await host.activate(plugin);

    expect(registry.find("async")?.parse([])).toBeInstanceOf(HelpCommand);
  });

  it("插件抛错时丢弃此前暂存的全部命令", async () => {
    const registry = new InMemoryCommandRegistry();
    const host = new PluginHost({ commands: registry });
    const plugin: SvgPlugin = {
      name: "failing-plugin",
      activate(context: PluginContext): void {
        context.commands.register(createRegistration("partial"));
        throw new Error("激活失败");
      },
    };

    await expect(host.activate(plugin)).rejects.toBeInstanceOf(
      PluginActivationError,
    );
    expect(registry.getRegistrations()).toEqual([]);
  });

  it("拒绝与 live registry 重名并保持原注册不变", async () => {
    const registry = new InMemoryCommandRegistry();
    registry.register(createRegistration("existing"));
    const host = new PluginHost({ commands: registry });
    const plugin: SvgPlugin = {
      name: "duplicate-plugin",
      activate(context: PluginContext): void {
        context.commands.register(createRegistration("existing"));
      },
    };

    const activation = host.activate(plugin);

    await expect(activation).rejects.toMatchObject({
      name: "PluginActivationError",
      message:
        "plugin failed to activate: duplicate-plugin (duplicate registration: commands/existing)",
    });
    expect(
      registry.getRegistrations().map((registration) => registration.getName()),
    ).toEqual(["existing"]);
  });

  it("拒绝同一插件内重复命令且不提交部分结果", async () => {
    const registry = new InMemoryCommandRegistry();
    const host = new PluginHost({ commands: registry });
    const plugin: SvgPlugin = {
      name: "duplicate-in-plugin",
      activate(context: PluginContext): void {
        context.commands.register(createRegistration("same"));
        context.commands.register(createRegistration("same"));
      },
    };

    await expect(host.activate(plugin)).rejects.toBeInstanceOf(
      PluginActivationError,
    );
    expect(registry.getRegistrations()).toEqual([]);
  });

  it("激活完成后上下文失效", async () => {
    const registry = new InMemoryCommandRegistry();
    const host = new PluginHost({ commands: registry });
    let retainedContext: PluginContext | undefined;
    const plugin: SvgPlugin = {
      name: "retaining-plugin",
      activate(context: PluginContext): void {
        retainedContext = context;
      },
    };

    await host.activate(plugin);

    expect(retainedContext).toBeDefined();
    expect(() =>
      retainedContext?.commands.register(createRegistration("late")),
    ).toThrow("plugin context is no longer active");
  });

  it("activateAll 在后续插件失败时保留先前成功插件", async () => {
    const registry = new InMemoryCommandRegistry();
    const host = new PluginHost({ commands: registry });
    const successful: SvgPlugin = {
      name: "successful",
      activate(context: PluginContext): void {
        context.commands.register(createRegistration("kept"));
      },
    };
    const failing: SvgPlugin = {
      name: "failing",
      activate(context: PluginContext): void {
        context.commands.register(createRegistration("discarded"));
        throw new Error("失败");
      },
    };

    await expect(
      host.activateAll([successful, failing]),
    ).rejects.toBeInstanceOf(PluginActivationError);
    expect(
      registry.getRegistrations().map((registration) => registration.getName()),
    ).toEqual(["kept"]);
  });

  it("拒绝空插件名", async () => {
    const registry = new InMemoryCommandRegistry();
    const host = new PluginHost({ commands: registry });

    await expect(
      host.activate({
        name: " ",
        activate(): void {},
      }),
    ).rejects.toThrow("plugin name must not be empty");
  });
});
