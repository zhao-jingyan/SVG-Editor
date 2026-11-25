import { GroupShape } from "@/protocol/shapes/concrete/GroupShape";
import { RectShape } from "@/protocol/shapes/concrete/RectShape";
import { TextShape } from "@/protocol/shapes/concrete/TextShape";
import type { Shape } from "@/protocol/shapes/model/Shape";
import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";

/**
 * 带标题的矩形框：插件领域对象，放在 `_plugin` 而非 protocol/concrete。
 * 仍扩展 GroupShape，以便 Document / Visitor 以容器多态消费。
 */
export class BoxShape extends GroupShape {
  public static readonly TYPE_NAME = "box";
  public static readonly DATA_KIND = "box";
  public static readonly DEFAULT_FILL = "#4a90d9";

  public static rectIdFor(boxId: string): string {
    return `${boxId}-rect`;
  }

  public static labelIdFor(boxId: string): string {
    return `${boxId}-label`;
  }

  public static create(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
  ): BoxShape {
    const rect = new RectShape(
      BoxShape.rectIdFor(id),
      x,
      y,
      width,
      height,
      BoxShape.DEFAULT_FILL,
    );
    const label = new TextShape(
      BoxShape.labelIdFor(id),
      x + 20,
      y + 35,
      title,
    );
    return new BoxShape(id, [rect, label]);
  }

  public static fromChildren(id: string, children: readonly Shape[]): BoxShape {
    const rect = children.find(
      (child) =>
        child instanceof RectShape && child.getId() === BoxShape.rectIdFor(id),
    );
    const label = children.find(
      (child) =>
        child instanceof TextShape && child.getId() === BoxShape.labelIdFor(id),
    );

    if (!(rect instanceof RectShape) || !(label instanceof TextShape)) {
      throw ProtocolError.document(
        CommandErrorCode.InvalidArgument,
        `invalid box#${id}: expected ${BoxShape.rectIdFor(id)} and ${BoxShape.labelIdFor(id)}`,
      );
    }

    // 允许额外子节点（嵌套 box 等）；必要部件仅 rect + label。
    return new BoxShape(id, children);
  }

  private constructor(id: string, children: readonly Shape[]) {
    super(id, children);
  }

  public override getType(): string {
    return BoxShape.TYPE_NAME;
  }

  public override getDataKind(): string | undefined {
    return BoxShape.DATA_KIND;
  }

  public override canUngroup(): boolean {
    return false;
  }

  public override allowsRemovingChild(childId: string): boolean {
    return (
      childId !== BoxShape.rectIdFor(this.getId()) &&
      childId !== BoxShape.labelIdFor(this.getId())
    );
  }

  public override describeCreated(): string {
    const id = this.getId();
    return (
      `box#${id} created (g#${id} + rect#${BoxShape.rectIdFor(id)}` +
      ` + text#${BoxShape.labelIdFor(id)})`
    );
  }
}
