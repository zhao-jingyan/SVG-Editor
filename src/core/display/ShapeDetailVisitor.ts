import type { CircleShape } from "../../protocol/shapes/concrete/CircleShape";
import type { EllipseShape } from "../../protocol/shapes/concrete/EllipseShape";
import type { GroupShape } from "../../protocol/shapes/concrete/GroupShape";
import type { LineShape } from "../../protocol/shapes/concrete/LineShape";
import type { RectShape } from "../../protocol/shapes/concrete/RectShape";
import type { ShapeVisitor } from "../../protocol/shapes/visitor/ShapeVisitor";
import { StyledShape } from "../../protocol/shapes/model/StyledShape";
import type { TextShape } from "../../protocol/shapes/concrete/TextShape";

export class ShapeDetailVisitor implements ShapeVisitor<readonly string[]> {
  public visitRect(shape: RectShape): readonly string[] {
    return [
      `x=${shape.getAttribute("x")} y=${shape.getAttribute("y")} w=${shape.getAttribute("width")} h=${shape.getAttribute("height")}`,
      ...this.styleLines(shape),
    ];
  }

  public visitCircle(shape: CircleShape): readonly string[] {
    return [
      `cx=${shape.getAttribute("cx")} cy=${shape.getAttribute("cy")} r=${shape.getAttribute("r")}`,
      ...this.styleLines(shape),
    ];
  }

  public visitEllipse(shape: EllipseShape): readonly string[] {
    return [
      `cx=${shape.getAttribute("cx")} cy=${shape.getAttribute("cy")} rx=${shape.getAttribute("rx")} ry=${shape.getAttribute("ry")}`,
      ...this.styleLines(shape),
    ];
  }

  public visitLine(shape: LineShape): readonly string[] {
    return [
      `x1=${shape.getAttribute("x1")} y1=${shape.getAttribute("y1")} x2=${shape.getAttribute("x2")} y2=${shape.getAttribute("y2")}`,
      ...this.styleLines(shape),
    ];
  }

  public visitText(shape: TextShape): readonly string[] {
    return [
      `x=${shape.getAttribute("x")} y=${shape.getAttribute("y")}`,
      `text=${JSON.stringify(shape.getAttribute("text"))}`,
      ...this.styleLines(shape),
    ];
  }

  public visitGroup(shape: GroupShape): readonly string[] {
    return [`children=${shape.getChildren().length}`];
  }

  private styleLines(shape: StyledShape): string[] {
    const lines: string[] = [];

    for (const attribute of ["fill", "stroke", "stroke-width"] as const) {
      const value = shape.getAttribute(attribute);

      if (value !== undefined) {
        lines.push(`${attribute}=${value}`);
      }
    }

    return lines;
  }
}
