import { SvgOffsetRange } from "../model/SvgOffsetRange";

export class SvgSymbolDto {
  private readonly children: readonly SvgSymbolDto[];

  public constructor(
    private readonly label: string,
    private readonly range: SvgOffsetRange,
    private readonly selectionRange: SvgOffsetRange,
    children: readonly SvgSymbolDto[] = [],
  ) {
    this.children = Object.freeze([...children]);
  }

  public getLabel(): string {
    return this.label;
  }

  public getRange(): SvgOffsetRange {
    return this.range;
  }

  public getSelectionRange(): SvgOffsetRange {
    return this.selectionRange;
  }

  public getChildren(): readonly SvgSymbolDto[] {
    return this.children;
  }
}
