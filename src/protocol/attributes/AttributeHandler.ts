import type { ShapeAttributeSnapshot } from "@/protocol/commands/memento/ShapeAttributeSnapshot";
import type { Shape } from "@/protocol/shapes/model/Shape";

/**
 * 属性扩展点：定义「对某类图形设置某属性」的领域语义。
 * Phase 2 扩展点角色名 AttributeHandler。
 */
export abstract class AttributeHandler {
  public abstract getName(): string;

  /** 是否负责该图形与属性；不得修改文档状态。 */
  public abstract handles(shape: Shape, attribute: string): boolean;

  /** 执行前捕获撤销快照；不得修改文档状态。 */
  public abstract capture(
    shape: Shape,
    attribute: string,
  ): ShapeAttributeSnapshot;

  /**
   * 执行修改；返回成功反馈文案。
   * 抛错时由调用方负责回滚已捕获的快照。
   */
  public abstract apply(
    shape: Shape,
    attribute: string,
    value: string,
  ): string;
}
