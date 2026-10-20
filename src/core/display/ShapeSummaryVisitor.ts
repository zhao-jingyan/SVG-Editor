import type { CircleShape } from "../../protocol/shapes/CircleShape";
import type { EllipseShape } from "../../protocol/shapes/EllipseShape";
import type { GroupShape } from "../../protocol/shapes/GroupShape";
import type { LineShape } from "../../protocol/shapes/LineShape";
import type { RectShape } from "../../protocol/shapes/RectShape";
import type { Shape } from "../../protocol/shapes/Shape";
import type { ShapeVisitor } from "../../protocol/shapes/ShapeVisitor";
import { StyledShape } from "../../protocol/shapes/StyledShape";
import type { TextShape } from "../../protocol/shapes/TextShape";

export class ShapeSummaryVisitor implements ShapeVisitor<string> {
  public visitRect(shape: RectShape): string {
    return this.render(shape, [
      `x=${shape.getAttribute("x")}`,
      `y=${shape.getAttribute("y")}`,
      `w=${shape.getAttribute("width")}`,
      `h=${shape.getAttribute("height")}`,
      ...this.styleParts(shape),
    ]);
  }

  public visitCircle(shape: CircleShape): string {
    return this.render(shape, [
      `cx=${shape.getAttribute("cx")}`,
      `cy=${shape.getAttribute("cy")}`,
      `r=${shape.getAttribute("r")}`,
      ...this.styleParts(shape),
    ]);
  }

  public visitEllipse(shape: EllipseShape): string {
    return this.render(shape, [
      `cx=${shape.getAttribute("cx")}`,
      `cy=${shape.getAttribute("cy")}`,
      `rx=${shape.getAttribute("rx")}`,
      `ry=${shape.getAttribute("ry")}`,
      ...this.styleParts(shape),
    ]);
  }

  public visitLine(shape: LineShape): string {
    return this.render(shape, [
      `(${shape.getAttribute("x1")},${shape.getAttribute("y1")}) -> (${shape.getAttribute("x2")},${shape.getAttribute("y2")})`,
      ...this.styleParts(shape),
    ]);
  }

  public visitText(shape: TextShape): string {
    const content = JSON.stringify(shape.getAttribute("text"));
    return this.render(shape, [
      `(${shape.getAttribute("x")},${shape.getAttribute("y")})`,
      content,
      ...this.styleParts(shape),
    ]);
  }

  public visitGroup(shape: GroupShape): string {
    return `${shape.getType()}#${shape.getId()}`;
  }

  private render(shape: Shape, attributes: readonly string[]): string {
    const prefix = `${shape.getType()}#${shape.getId()}`;
    return attributes.length === 0
      ? prefix
      : `${prefix} ${attributes.join(" ")}`;
  }

  private styleParts(shape: StyledShape): string[] {
    const parts: string[] = [];

    for (const attribute of ["fill", "stroke", "stroke-width"] as const) {
      const value = shape.getAttribute(attribute);

      if (value !== undefined) {
        parts.push(`${attribute}=${value}`);
      }
    }

    return parts;
  }
}
