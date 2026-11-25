import type { Shape } from "@/protocol/shapes/model/Shape";

/**
 * SVG 读回边界输入：Parser 已抽出属性与子树，不携带 XML 库类型。
 */
export class ShapeSvgReadInput {
  public constructor(
    private readonly id: string,
    private readonly attributes: ReadonlyMap<string, string>,
    private readonly children: readonly Shape[] = [],
    private readonly textContent: string = "",
  ) {
    if (id.trim().length === 0) {
      throw new Error("shape id must not be empty");
    }
  }

  public getId(): string {
    return this.id;
  }

  public getAttribute(name: string): string | undefined {
    return this.attributes.get(name);
  }

  public getDataKind(): string | undefined {
    return this.attributes.get("data-kind");
  }

  public getChildren(): readonly Shape[] {
    return this.children;
  }

  public getTextContent(): string {
    return this.textContent;
  }
}
