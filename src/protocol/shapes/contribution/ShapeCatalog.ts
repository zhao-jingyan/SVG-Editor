import type { ShapeContribution } from "./ShapeContribution";

/** 只读图形贡献目录。 */
export interface ShapeCatalog {
  find(typeName: string): ShapeContribution | undefined;
  findForSvg(
    tag: string,
    dataKind: string | undefined,
  ): ShapeContribution | undefined;
  getContributions(): readonly ShapeContribution[];
}
