import type { ShapeCatalog } from "@/protocol/shapes/contribution/ShapeCatalog";
import type { ShapeContribution } from "@/protocol/shapes/contribution/ShapeContribution";

/** 运行时图形贡献注册表：拒绝重复类型名；SVG 匹配按注册顺序取首个命中。 */
export class ShapeRegistry implements ShapeCatalog {
  private readonly contributions: ShapeContribution[] = [];
  private readonly byTypeName = new Map<string, ShapeContribution>();

  public register(contribution: ShapeContribution): void {
    const typeName = contribution.getTypeName();

    if (this.byTypeName.has(typeName)) {
      throw new Error(`duplicate shape type: ${typeName}`);
    }

    this.byTypeName.set(typeName, contribution);
    this.contributions.push(contribution);
  }

  public registerAll(contributions: readonly ShapeContribution[]): void {
    for (const contribution of contributions) {
      this.register(contribution);
    }
  }

  public find(typeName: string): ShapeContribution | undefined {
    return this.byTypeName.get(typeName);
  }

  public findForSvg(
    tag: string,
    dataKind: string | undefined,
  ): ShapeContribution | undefined {
    return this.contributions.find((contribution) =>
      contribution.matchesSvg(tag, dataKind),
    );
  }

  public getContributions(): readonly ShapeContribution[] {
    return this.contributions;
  }
}
