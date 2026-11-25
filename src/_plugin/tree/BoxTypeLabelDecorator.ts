import { TreeDecorator } from "@/protocol/tree/TreeDecorator";
import type { Shape } from "@/protocol/shapes/model/Shape";

/** 在 data-kind=box 的容器行追加 ` (box)`。 */
export class BoxTypeLabelDecorator extends TreeDecorator {
  public getName(): string {
    return "box-type-label";
  }

  public override decorateShape(shape: Shape): string {
    return shape.getDataKind() === "box" ? " (box)" : "";
  }
}
