import { GroupShape } from "@/protocol/shapes/concrete/GroupShape";
import type { Shape } from "@/protocol/shapes/model/Shape";
import {
  TreeDecorator,
  type TreeDocumentSnapshot,
} from "@/protocol/tree/TreeDecorator";

/**
 * 相对上次 init/read/save 的内容指纹比较；不一致则行尾追加 ` *`。
 * 指纹含子树，故改叶子时祖先也会带 *；画布行另含根层子节点的 id 序列，
 * 因此根层删除、front/back 重排也会让画布行带 *。
 */
export class ModifiedStarDecorator extends TreeDecorator {
  private baselineCanvas = "";
  private readonly baselineShapes = new Map<string, string>();

  public getName(): string {
    return "modified-star";
  }

  public override onDocumentSynced(snapshot: TreeDocumentSnapshot): void {
    this.baselineCanvas = this.canvasFingerprint(snapshot);
    this.baselineShapes.clear();
    this.captureShapes(snapshot.getRootShapes());
  }

  public override decorateCanvas(snapshot: TreeDocumentSnapshot): string {
    if (this.baselineShapes.size === 0 && this.baselineCanvas === "") {
      return "";
    }

    if (this.canvasFingerprint(snapshot) !== this.baselineCanvas) {
      return " *";
    }

    for (const shape of snapshot.getRootShapes()) {
      if (this.isSubtreeDirty(shape)) {
        return " *";
      }
    }

    return "";
  }

  public override decorateShape(shape: Shape): string {
    if (this.baselineShapes.size === 0 && this.baselineCanvas === "") {
      return "";
    }

    return this.isSubtreeDirty(shape) ? " *" : "";
  }

  private captureShapes(shapes: readonly Shape[]): void {
    for (const shape of shapes) {
      this.baselineShapes.set(shape.getId(), this.fingerprint(shape));
      if (shape instanceof GroupShape) {
        this.captureShapes(shape.getChildren());
      }
    }
  }

  private isSubtreeDirty(shape: Shape): boolean {
    const baseline = this.baselineShapes.get(shape.getId());

    if (baseline === undefined) {
      return true;
    }

    return this.fingerprint(shape) !== baseline;
  }

  /** 画布尺寸 + 根层子节点的 id 序列（覆盖根层的增删与 front/back 顺序变化）。 */
  private canvasFingerprint(snapshot: TreeDocumentSnapshot): string {
    const rootOrder = snapshot
      .getRootShapes()
      .map((shape) => shape.getId())
      .join(",");
    return `${snapshot.getWidth()}x${snapshot.getHeight()}|${rootOrder}`;
  }

  private fingerprint(shape: Shape): string {
    if (shape instanceof GroupShape) {
      const children = shape
        .getChildren()
        .map((child) => this.fingerprint(child))
        .join(",");
      return `g:${shape.getId()}:${shape.getDataKind() ?? ""}:[${children}]`;
    }

    const names = [
      "x",
      "y",
      "width",
      "height",
      "cx",
      "cy",
      "r",
      "rx",
      "ry",
      "x1",
      "y1",
      "x2",
      "y2",
      "text",
      "fill",
      "stroke",
      "stroke-width",
    ] as const;
    const attrs = names
      .map((name) => {
        const value = shape.getAttribute(name);
        return value === undefined ? "" : `${name}=${value}`;
      })
      .filter((part) => part.length > 0)
      .join(";");

    return `${shape.getType()}:${shape.getId()}:{${attrs}}`;
  }
}
