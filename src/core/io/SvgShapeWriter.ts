import type { CircleShape } from "../../protocol/shapes/CircleShape";
import type { EllipseShape } from "../../protocol/shapes/EllipseShape";
import type { GroupShape } from "../../protocol/shapes/GroupShape";
import type { LineShape } from "../../protocol/shapes/LineShape";
import type { RectShape } from "../../protocol/shapes/RectShape";
import { StyledShape } from "../../protocol/shapes/StyledShape";
import type { ShapeVisitor } from "../../protocol/shapes/ShapeVisitor";
import type { TextShape } from "../../protocol/shapes/TextShape";
import { XmlEscaper } from "./XmlEscaper";

type Attribute = readonly [string, string | number];

export class SvgShapeWriter implements ShapeVisitor<string> {
  private readonly escaper = new XmlEscaper();

  public visitRect(shape: RectShape): string {
    return this.writeStyledElement("rect", shape, [
      ["x", shape.getAttribute("x") ?? 0],
      ["y", shape.getAttribute("y") ?? 0],
      ["width", shape.getAttribute("width") ?? 0],
      ["height", shape.getAttribute("height") ?? 0],
    ]);
  }

  public visitCircle(shape: CircleShape): string {
    return this.writeStyledElement("circle", shape, [
      ["cx", shape.getAttribute("cx") ?? 0],
      ["cy", shape.getAttribute("cy") ?? 0],
      ["r", shape.getAttribute("r") ?? 0],
    ]);
  }

  public visitEllipse(shape: EllipseShape): string {
    return this.writeStyledElement("ellipse", shape, [
      ["cx", shape.getAttribute("cx") ?? 0],
      ["cy", shape.getAttribute("cy") ?? 0],
      ["rx", shape.getAttribute("rx") ?? 0],
      ["ry", shape.getAttribute("ry") ?? 0],
    ]);
  }

  public visitLine(shape: LineShape): string {
    return this.writeStyledElement("line", shape, [
      ["x1", shape.getAttribute("x1") ?? 0],
      ["y1", shape.getAttribute("y1") ?? 0],
      ["x2", shape.getAttribute("x2") ?? 0],
      ["y2", shape.getAttribute("y2") ?? 0],
    ]);
  }

  public visitText(shape: TextShape): string {
    const attributes = this.collectAttributes(shape, [
      ["x", shape.getAttribute("x") ?? 0],
      ["y", shape.getAttribute("y") ?? 0],
    ]);
    const content = this.escaper.escapeText(
      `${shape.getAttribute("text") ?? ""}`,
    );
    return `<text ${attributes}>${content}</text>`;
  }

  public visitGroup(shape: GroupShape): string {
    const attributes = this.writeAttributes([["id", shape.getId()]]);
    const children = shape.getChildren();

    if (children.length === 0) {
      return `<g ${attributes}/>`;
    }

    const renderedChildren = children.map((child) => this.indent(child.accept(this))).join("\n");
    return `<g ${attributes}>\n${renderedChildren}\n</g>`;
  }

  private writeStyledElement(
    tag: string,
    shape: StyledShape,
    geometry: readonly Attribute[],
  ): string {
    const attributes = this.collectAttributes(shape, geometry);
    return `<${tag} ${attributes}/>`;
  }

  private collectAttributes(
    shape: StyledShape,
    geometry: readonly Attribute[],
  ): string {
    const attributes: Attribute[] = [["id", shape.getId()], ...geometry];

    for (const name of ["fill", "stroke", "stroke-width"] as const) {
      const value = shape.getAttribute(name);

      if (value !== undefined) {
        attributes.push([name, value]);
      }
    }

    return this.writeAttributes(attributes);
  }

  private writeAttributes(attributes: readonly Attribute[]): string {
    return attributes
      .map(([name, value]) => `${name}="${this.escaper.escapeAttribute(`${value}`)}"`)
      .join(" ");
  }

  private indent(value: string): string {
    return value
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n");
  }
}
