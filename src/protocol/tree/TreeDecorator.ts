import type { Shape } from "@/protocol/shapes/model/Shape";

/**
 * 树行标签扩展点：为 tree 行尾追加文案。
 * Phase 2 扩展点角色名 TreeDecorator。
 */
export abstract class TreeDecorator {
  public abstract getName(): string;

  /** 图形行尾缀；无标签时返回空串。不得修改文档。 */
  public decorateShape(_shape: Shape): string {
    return "";
  }

  /** 画布根行 `svg (W×H)` 尾缀。 */
  public decorateCanvas(_snapshot: TreeDocumentSnapshot): string {
    return "";
  }

  /** init / read / save 成功后同步基线（如 dirty 对比）。 */
  public onDocumentSynced(_snapshot: TreeDocumentSnapshot): void {}
}

/** 同步 dirty 基线 / 装饰画布时的只读文档快照端口。 */
export interface TreeDocumentSnapshot {
  getWidth(): number;
  getHeight(): number;
  getRootShapes(): readonly Shape[];
}
