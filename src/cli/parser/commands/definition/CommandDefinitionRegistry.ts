import type { CommandCatalog } from "../../../../protocol/plugins/CommandCatalog";
import type { CommandRegistrar } from "../../../../protocol/plugins/CommandRegistrar";
import type { CommandRegistration } from "../../../../protocol/plugins/CommandRegistration";

/**
 * 保存命令插件注册结果，并保持激活顺序。
 */
export class CommandDefinitionRegistry
  implements CommandCatalog, CommandRegistrar
{
  private readonly definitions = new Map<string, CommandRegistration>();
  private readonly registrationOrder: CommandRegistration[] = [];

  public register(registration: CommandRegistration): void {
    const commandName = registration.getName();

    if (this.definitions.has(commandName)) {
      throw new Error(`duplicate registration: commands/${commandName}`);
    }

    this.definitions.set(commandName, registration);
    this.registrationOrder.push(registration);
  }

  public find(commandName: string): CommandRegistration | undefined {
    return this.definitions.get(commandName);
  }

  public getRegistrations(): readonly CommandRegistration[] {
    return [...this.registrationOrder];
  }
}
