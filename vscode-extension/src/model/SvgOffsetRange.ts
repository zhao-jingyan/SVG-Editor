export class SvgOffsetRange {
  public constructor(
    private readonly start: number,
    private readonly end: number,
  ) {
    if (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 0 ||
      end < start
    ) {
      throw new RangeError("SVG 源码范围不合法");
    }
  }

  public getStart(): number {
    return this.start;
  }

  public getEnd(): number {
    return this.end;
  }
}
