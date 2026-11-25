import type { AttributeCatalog } from "@/protocol/attributes/AttributeCatalog";
import type { AttributeHandler } from "@/protocol/attributes/AttributeHandler";
import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import type { Shape } from "@/protocol/shapes/model/Shape";

/** 运行时属性处理器注册表；同名拒绝；多处理器同时命中则报错。 */
export class AttributeRegistry implements AttributeCatalog {
  private readonly handlers: AttributeHandler[] = [];
  private readonly byName = new Map<string, AttributeHandler>();

  public register(handler: AttributeHandler): void {
    const name = handler.getName();

    if (this.byName.has(name)) {
      throw new Error(`duplicate attribute handler: ${name}`);
    }

    this.byName.set(name, handler);
    this.handlers.push(handler);
  }

  public registerAll(handlers: readonly AttributeHandler[]): void {
    for (const handler of handlers) {
      this.register(handler);
    }
  }

  public find(shape: Shape, attribute: string): AttributeHandler | undefined {
    const matches = this.handlers.filter((handler) =>
      handler.handles(shape, attribute),
    );

    if (matches.length > 1) {
      throw ProtocolError.document(
        CommandErrorCode.InvalidArgument,
        `ambiguous attribute handlers for ${shape.getType()}#${shape.getId()} ${attribute}: ${matches
          .map((handler) => handler.getName())
          .join(", ")}`,
      );
    }

    return matches[0];
  }

  public getHandlers(): readonly AttributeHandler[] {
    return this.handlers;
  }
}
