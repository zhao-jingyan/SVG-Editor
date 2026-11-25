import type { AttributeHandler } from "./AttributeHandler";
import type { Shape } from "@/protocol/shapes/model/Shape";

/** 只读属性处理器目录。 */
export interface AttributeCatalog {
  find(shape: Shape, attribute: string): AttributeHandler | undefined;
  getHandlers(): readonly AttributeHandler[];
}
