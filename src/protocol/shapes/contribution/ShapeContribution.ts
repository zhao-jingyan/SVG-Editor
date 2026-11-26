import type { Shape } from "@/protocol/shapes/model/Shape";
import type { ShapeSvgReadInput } from "./ShapeSvgReadInput";

/**
 * 图形扩展点（抽象类；Phase 2 角色名 ShapeProvider）：
 * 一种图形类型的名称、CLI 创建参数解析，以及 SVG 元素的认领与读回。
 * 内置图形与插件图形都继承它；内核只依赖这个抽象，经 ShapeRegistry 分派。
 */
export abstract class ShapeContribution {
  protected constructor(private readonly typeName: string) {
    if (typeName.trim().length === 0) {
      throw new Error("shape type name must not be empty");
    }
  }

  public getTypeName(): string {
    return this.typeName;
  }

  /** 由 `create <type> <id> args...` 创建图形；参数不合法时抛 ProtocolError。 */
  public abstract createShape(id: string, args: readonly string[]): Shape;

  /** 是否认领该 SVG 元素（tag 与可选 data-kind）；多个命中时取注册顺序靠前者。 */
  public abstract matchesSvg(tag: string, dataKind: string | undefined): boolean;

  /** 由已认领的 SVG 元素还原图形；结构不完整时抛 ProtocolError，不得返回残缺对象。 */
  public abstract readFromSvg(input: ShapeSvgReadInput): Shape;
}
