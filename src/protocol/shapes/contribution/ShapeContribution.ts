import type { Shape } from "@/protocol/shapes/model/Shape";
import type { ShapeSvgReadInput } from "./ShapeSvgReadInput";

/**
 * 一种图形类型的贡献：类型名、CLI 创建与 SVG 读回。
 * Phase 2 扩展点角色名 ShapeProvider 对应本类型。
 */
export class ShapeContribution {
  public constructor(
    private readonly typeName: string,
    private readonly createShape: (id: string, args: readonly string[]) => Shape,
    private readonly matchesSvgElement: (
      tag: string,
      dataKind: string | undefined,
    ) => boolean,
    private readonly readShapeFromSvg: (input: ShapeSvgReadInput) => Shape,
  ) {
    if (typeName.trim().length === 0) {
      throw new Error("shape type name must not be empty");
    }
  }

  public getTypeName(): string {
    return this.typeName;
  }

  public create(id: string, args: readonly string[]): Shape {
    return this.createShape(id, args);
  }

  public matchesSvg(tag: string, dataKind: string | undefined): boolean {
    return this.matchesSvgElement(tag, dataKind);
  }

  public readFromSvg(input: ShapeSvgReadInput): Shape {
    return this.readShapeFromSvg(input);
  }
}
