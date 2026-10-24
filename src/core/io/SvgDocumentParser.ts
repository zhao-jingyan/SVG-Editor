import { XMLParser } from "fast-xml-parser";
import type { EditableAttribute } from "../../protocol/EditableAttribute";
import { CommandErrorCode } from "../../protocol/errors/CommandErrorCode";
import { DocumentError } from "../../protocol/errors/domain/DocumentError";
import { GroupShape } from "../../protocol/shapes/concrete/GroupShape";
import type { Shape } from "../../protocol/shapes/model/Shape";
import { ShapeFactory } from "../../protocol/shapes/factory/ShapeFactory";
import { Document } from "../document/Document";
import { ParsedSvgDocument } from "./ParsedSvgDocument";
import { SvgShapeIdAllocator } from "./SvgShapeIdAllocator";

type XmlNode = Record<string, unknown>;

export class SvgDocumentParser {
  private static readonly shapeTags = new Set([
    "rect",
    "circle",
    "ellipse",
    "line",
    "text",
    "g",
  ]);

  private static readonly styleAttributes = [
    "fill",
    "stroke",
    "stroke-width",
  ] as const satisfies readonly EditableAttribute[];

  private readonly xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    textNodeName: "#text",
    trimValues: false,
    parseAttributeValue: false,
    parseTagValue: false,
    ignoreDeclaration: true,
    isArray: (tagName: string) => SvgDocumentParser.shapeTags.has(tagName),
  });

  public constructor(
    private readonly shapeFactory: ShapeFactory = new ShapeFactory(),
  ) {}

  public parse(source: string): ParsedSvgDocument {
    let parsed: unknown;

    try {
      parsed = this.xmlParser.parse(source);
    } catch {
      throw new DocumentError(
        CommandErrorCode.InvalidArgument,
        "invalid SVG: invalid XML",
      );
    }

    if (!this.isRecord(parsed) || !this.isRecord(parsed.svg)) {
      throw new DocumentError(
        CommandErrorCode.InvalidArgument,
        "invalid SVG: missing <svg> root",
      );
    }

    const root = parsed.svg;
    const warnings: string[] = [];
    const reservedIds = new Set<string>();
    this.collectReservedIds(root, reservedIds);
    const allocator = new SvgShapeIdAllocator(reservedIds);
    const shapes = this.parseChildren(root, allocator, warnings);
    const document = new Document(
      this.readCanvasDimension(root, "width", "viewBox", 2),
      this.readCanvasDimension(root, "height", "viewBox", 3),
    );

    for (const shape of shapes) {
      document.addShape(shape);
    }

    const elementCount = shapes.reduce(
      (count, shape) => count + this.countShapes(shape),
      0,
    );
    return new ParsedSvgDocument(document, warnings, elementCount);
  }

  private parseChildren(
    parent: XmlNode,
    allocator: SvgShapeIdAllocator,
    warnings: string[],
  ): Shape[] {
    const shapes: Shape[] = [];

    for (const [tag, value] of Object.entries(parent)) {
      if (!SvgDocumentParser.shapeTags.has(tag)) {
        continue;
      }

      for (const node of this.asNodes(value)) {
        shapes.push(this.parseShape(tag, node, allocator, warnings));
      }
    }

    return shapes;
  }

  private parseShape(
    tag: string,
    node: XmlNode,
    allocator: SvgShapeIdAllocator,
    warnings: string[],
  ): Shape {
    const explicitId = this.readOptionalString(node, "id");
    const id = allocator.allocate(tag, explicitId);

    if (explicitId === undefined) {
      warnings.push(`warning: assigned id ${id} to unnamed <${tag}>`);
    }

    const shape = this.createShape(tag, id, node, allocator, warnings);
    this.applyStyles(shape, node);
    return shape;
  }

  private createShape(
    tag: string,
    id: string,
    node: XmlNode,
    allocator: SvgShapeIdAllocator,
    warnings: string[],
  ): Shape {
    switch (tag) {
      case "rect":
        return this.shapeFactory.create(tag, id, [
          this.requireNumber(node, "x", tag).toString(),
          this.requireNumber(node, "y", tag).toString(),
          this.requireNumber(node, "width", tag).toString(),
          this.requireNumber(node, "height", tag).toString(),
        ]);
      case "circle":
        return this.shapeFactory.create(tag, id, [
          this.requireNumber(node, "cx", tag).toString(),
          this.requireNumber(node, "cy", tag).toString(),
          this.requireNumber(node, "r", tag).toString(),
        ]);
      case "ellipse":
        return this.shapeFactory.create(tag, id, [
          this.requireNumber(node, "cx", tag).toString(),
          this.requireNumber(node, "cy", tag).toString(),
          this.requireNumber(node, "rx", tag).toString(),
          this.requireNumber(node, "ry", tag).toString(),
        ]);
      case "line":
        return this.shapeFactory.create(tag, id, [
          this.requireNumber(node, "x1", tag).toString(),
          this.requireNumber(node, "y1", tag).toString(),
          this.requireNumber(node, "x2", tag).toString(),
          this.requireNumber(node, "y2", tag).toString(),
        ]);
      case "text":
        return this.shapeFactory.create(tag, id, [
          this.requireNumber(node, "x", tag).toString(),
          this.requireNumber(node, "y", tag).toString(),
          this.readText(node),
        ]);
      case "g": {
        const group = this.shapeFactory.create(tag, id, []);

        if (!(group instanceof GroupShape)) {
          throw new DocumentError(
            CommandErrorCode.InvalidArgument,
            `invalid SVG: <g> did not create a group`,
          );
        }

        for (const child of this.parseChildren(node, allocator, warnings)) {
          group.addChild(child);
        }

        return group;
      }
      default:
        throw new DocumentError(
          CommandErrorCode.InvalidArgument,
          `invalid SVG: unsupported element <${tag}>`,
        );
    }
  }

  private applyStyles(shape: Shape, node: XmlNode): void {
    for (const attribute of SvgDocumentParser.styleAttributes) {
      const value = node[attribute];

      if (value === undefined) {
        continue;
      }

      if (typeof value !== "string" && typeof value !== "number") {
        throw new DocumentError(
          CommandErrorCode.InvalidArgument,
          `invalid SVG: attribute ${attribute} must be text`,
        );
      }

      shape.setAttribute(
        attribute,
        attribute === "stroke-width" ? this.toNumber(value) : `${value}`,
      );
    }
  }

  private collectReservedIds(node: XmlNode, reservedIds: Set<string>): void {
    for (const [tag, value] of Object.entries(node)) {
      if (!SvgDocumentParser.shapeTags.has(tag)) {
        continue;
      }

      for (const child of this.asNodes(value)) {
        const id = this.readOptionalString(child, "id");

        if (id !== undefined) {
          if (reservedIds.has(id)) {
            throw new DocumentError(
              CommandErrorCode.DuplicateId,
              `id already exists: ${id}`,
            );
          }

          reservedIds.add(id);
        }

        if (tag === "g") {
          this.collectReservedIds(child, reservedIds);
        }
      }
    }
  }

  private readCanvasDimension(
    root: XmlNode,
    attribute: "width" | "height",
    viewBoxAttribute: "viewBox",
    viewBoxIndex: number,
  ): number {
    const direct = root[attribute];

    if (direct !== undefined) {
      return this.toNumber(direct);
    }

    const viewBox = this.readOptionalString(root, viewBoxAttribute);

    if (viewBox === undefined) {
      throw new DocumentError(
        CommandErrorCode.InvalidArgument,
        `invalid SVG: missing ${attribute} or viewBox`,
      );
    }

    const values = viewBox.trim().split(/[\s,]+/).map(Number);

    if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) {
      throw new DocumentError(
        CommandErrorCode.InvalidArgument,
        `invalid SVG: invalid viewBox: ${viewBox}`,
      );
    }

    return values[viewBoxIndex];
  }

  private requireNumber(node: XmlNode, attribute: string, tag: string): number {
    const value = node[attribute];

    if (value === undefined) {
      throw new DocumentError(
        CommandErrorCode.InvalidArgument,
        `invalid <${tag}>: missing attribute ${attribute}`,
      );
    }

    return this.toNumber(value);
  }

  private toNumber(value: unknown): number {
    if (
      (typeof value !== "string" && typeof value !== "number") ||
      `${value}`.trim().length === 0
    ) {
      throw new DocumentError(
        CommandErrorCode.InvalidNumber,
        `invalid number: ${String(value)}`,
      );
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      throw new DocumentError(
        CommandErrorCode.InvalidNumber,
        `invalid number: ${String(value)}`,
      );
    }

    return number;
  }

  private readText(node: XmlNode): string {
    const text = node["#text"];
    return typeof text === "string" || typeof text === "number" ? `${text}` : "";
  }

  private readOptionalString(node: XmlNode, attribute: string): string | undefined {
    const value = node[attribute];

    if (value === undefined) {
      return undefined;
    }

    if (typeof value !== "string" && typeof value !== "number") {
      throw new DocumentError(
        CommandErrorCode.InvalidArgument,
        `invalid SVG: attribute ${attribute} must be text`,
      );
    }

    const text = `${value}`.trim();
    return text.length === 0 ? undefined : text;
  }

  private countShapes(shape: Shape): number {
    if (!(shape instanceof GroupShape)) {
      return 1;
    }

    return 1 + shape.getChildren().reduce(
      (count, child) => count + this.countShapes(child),
      0,
    );
  }

  private asNodes(value: unknown): XmlNode[] {
    if (Array.isArray(value)) {
      return value.filter((entry): entry is XmlNode => this.isRecord(entry));
    }

    return this.isRecord(value) ? [value] : [];
  }

  private isRecord(value: unknown): value is XmlNode {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
