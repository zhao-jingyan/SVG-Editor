import { GroupShape } from "@/protocol/shapes/concrete/GroupShape";
import type { Shape } from "@/protocol/shapes/model/Shape";

/** 画布形状统计结果：叶子按首次出现类型顺序计数，容器单独累计。 */
export class DocumentShapeStats {
  private constructor(
    private readonly leafCounts: ReadonlyMap<string, number>,
    private readonly leafTotal: number,
    private readonly containerCount: number,
  ) {}

  public static fromRootShapes(roots: readonly Shape[]): DocumentShapeStats {
    const leafCounts = new Map<string, number>();
    let leafTotal = 0;
    let containerCount = 0;

    const visit = (shape: Shape): void => {
      if (shape instanceof GroupShape) {
        containerCount += 1;
        for (const child of shape.getChildren()) {
          visit(child);
        }
        return;
      }

      const typeName = shape.getType();
      leafCounts.set(typeName, (leafCounts.get(typeName) ?? 0) + 1);
      leafTotal += 1;
    };

    for (const root of roots) {
      visit(root);
    }

    return new DocumentShapeStats(leafCounts, leafTotal, containerCount);
  }

  public format(): string {
    const segments: string[] = [];

    for (const [typeName, count] of this.leafCounts) {
      segments.push(`${typeName}: ${count}`);
    }

    segments.push(`(total ${this.leafTotal}, containers ${this.containerCount})`);
    return segments.join("  ");
  }
}
