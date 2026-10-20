import { GroupShape } from "../../protocol/shapes/GroupShape";
import type { Shape } from "../../protocol/shapes/Shape";
import type { Document } from "../document/Document";
import { SvgShapeWriter } from "./SvgShapeWriter";

export class SvgDocumentWriter {
  private readonly shapeWriter = new SvgShapeWriter();

  public render(document: Document): string {
    const roots = document
      .getRootShapes()
      .map((shape) => this.indent(shape.accept(this.shapeWriter)));
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<svg xmlns="http://www.w3.org/2000/svg" width="${document.getWidth()}" height="${document.getHeight()}" viewBox="0 0 ${document.getWidth()} ${document.getHeight()}">`,
      ...roots,
      "</svg>",
      "",
    ];
    return lines.join("\n");
  }

  public countElements(document: Document): number {
    return document
      .getRootShapes()
      .reduce((count, shape) => count + this.countShape(shape), 0);
  }

  private countShape(shape: Shape): number {
    if (!(shape instanceof GroupShape)) {
      return 1;
    }

    return 1 + shape.getChildren().reduce(
      (count, child) => count + this.countShape(child),
      0,
    );
  }

  private indent(value: string): string {
    return value
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n");
  }
}
