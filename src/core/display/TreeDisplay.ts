import type { Document } from "@/core/document/Document";
import { GroupShape } from "@/protocol/shapes/concrete/GroupShape";
import type { Shape } from "@/protocol/shapes/model/Shape";
import type { TreeDecoratorCatalog } from "@/protocol/tree/TreeDecoratorCatalog";
import { TreeDecoratorRegistry } from "@/core/tree/TreeDecoratorRegistry";
import { ShapeSummaryVisitor } from "./ShapeSummaryVisitor";

interface TreeRow {
  readonly prefix: string;
  readonly connector: string;
  readonly label: string;
  readonly attributes: string;
  readonly tags: string;
}

export class TreeDisplay {
  private readonly summaryVisitor = new ShapeSummaryVisitor();

  public constructor(
    private readonly decorators: TreeDecoratorCatalog = new TreeDecoratorRegistry(),
  ) {}

  public render(document: Document, rootId?: string): string {
    if (rootId !== undefined) {
      const root = document.getShape(rootId);
      return this.renderSubtree(root);
    }

    const rows: TreeRow[] = [];
    this.collectRows(document.getRootShapes(), [], rows);
    const header =
      `svg (${document.getWidth()}x${document.getHeight()})` +
      this.canvasTags(document);
    return this.renderRows(header, rows);
  }

  private renderSubtree(root: Shape): string {
    const rows: TreeRow[] = [this.createRootRow(root)];
    this.collectRows(this.childrenOf(root), [], rows);
    return this.renderRows(undefined, rows);
  }

  private collectRows(
    shapes: readonly Shape[],
    ancestors: readonly boolean[],
    rows: TreeRow[],
  ): void {
    shapes.forEach((shape, index) => {
      const isLast = index === shapes.length - 1;
      const summary = shape.accept(this.summaryVisitor);
      const separator = summary.indexOf(" ");
      const prefix = ancestors
        .map((hasFollowingSibling) => (hasFollowingSibling ? "│   " : "    "))
        .join("");

      rows.push({
        prefix,
        connector: isLast ? "└── " : "├── ",
        label: separator < 0 ? summary : summary.slice(0, separator),
        attributes: separator < 0 ? "" : summary.slice(separator + 1),
        tags: this.shapeTags(shape),
      });

      this.collectRows(
        this.childrenOf(shape),
        [...ancestors, !isLast],
        rows,
      );
    });
  }

  private createRootRow(shape: Shape): TreeRow {
    const summary = shape.accept(this.summaryVisitor);
    const separator = summary.indexOf(" ");

    return {
      prefix: "",
      connector: "",
      label: separator < 0 ? summary : summary.slice(0, separator),
      attributes: separator < 0 ? "" : summary.slice(separator + 1),
      tags: this.shapeTags(shape),
    };
  }

  private renderRows(header: string | undefined, rows: readonly TreeRow[]): string {
    const labelWidth = rows.reduce(
      (width, row) => Math.max(width, row.label.length),
      0,
    );
    const lines = rows.map((row) => {
      const line = `${row.prefix}${row.connector}${row.label}`;
      const withAttributes =
        row.attributes.length === 0
          ? line
          : `${line.padEnd(row.prefix.length + row.connector.length + labelWidth + 2)}${row.attributes}`;
      return `${withAttributes}${row.tags}`;
    });

    return header === undefined
      ? lines.join("\n")
      : [header, ...lines].join("\n");
  }

  private shapeTags(shape: Shape): string {
    return this.decorators
      .getDecorators()
      .map((decorator) => decorator.decorateShape(shape))
      .join("");
  }

  private canvasTags(document: Document): string {
    return this.decorators
      .getDecorators()
      .map((decorator) => decorator.decorateCanvas(document))
      .join("");
  }

  private childrenOf(shape: Shape): readonly Shape[] {
    return shape instanceof GroupShape ? shape.getChildren() : [];
  }
}
