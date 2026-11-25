import { AttributeHandler } from "@/protocol/attributes/AttributeHandler";
import { ShapeAttributeSnapshot } from "@/protocol/commands/memento/ShapeAttributeSnapshot";
import { CommandErrorCode } from "@/protocol/errors/CommandErrorCode";
import { ProtocolError } from "@/protocol/errors/ProtocolError";
import type { Shape } from "@/protocol/shapes/model/Shape";
import { RectShape } from "@/protocol/shapes/concrete/RectShape";
import { TextShape } from "@/protocol/shapes/concrete/TextShape";
import { BoxShape } from "./BoxShape";

/** box 的 fill → 内部 rect；label → 内部 text。 */
export class BoxAttributeHandler extends AttributeHandler {
  public getName(): string {
    return "box-attributes";
  }

  public handles(shape: Shape, attribute: string): boolean {
    return (
      shape instanceof BoxShape &&
      (attribute === "fill" || attribute === "label")
    );
  }

  public capture(shape: Shape, attribute: string): ShapeAttributeSnapshot {
    const box = this.requireBox(shape);

    if (attribute === "fill") {
      const body = this.requireBody(box);
      return new ShapeAttributeSnapshot(
        box.getId(),
        box.getType(),
        "fill",
        new Map([[body.getId(), body.getAttribute("fill")]]),
        "fill",
      );
    }

    const label = this.requireLabel(box);
    return new ShapeAttributeSnapshot(
      box.getId(),
      box.getType(),
      "label",
      new Map([[label.getId(), label.getAttribute("text")]]),
      "text",
    );
  }

  public apply(shape: Shape, attribute: string, value: string): string {
    const box = this.requireBox(shape);

    if (attribute === "fill") {
      const body = this.requireBody(box);
      body.setAttribute("fill", value);
      return `box#${box.getId()} fill propagated to ${body.getId()}`;
    }

    if (attribute === "label") {
      const label = this.requireLabel(box);
      label.setAttribute("text", value);
      return `box#${box.getId()} label updated: "${value}"`;
    }

    throw ProtocolError.shape(
      CommandErrorCode.UnknownAttribute,
      `unknown attribute: ${attribute}`,
    );
  }

  private requireBox(shape: Shape): BoxShape {
    if (!(shape instanceof BoxShape)) {
      throw ProtocolError.shape(
        CommandErrorCode.InvalidArgument,
        `not a box: ${shape.getId()}`,
      );
    }

    return shape;
  }

  private requireBody(box: BoxShape): RectShape {
    const body = box
      .getChildren()
      .find((child) => child.getId() === BoxShape.rectIdFor(box.getId()));

    if (!(body instanceof RectShape)) {
      throw ProtocolError.shape(
        CommandErrorCode.InvalidArgument,
        `invalid box#${box.getId()}: missing body rect`,
      );
    }

    return body;
  }

  private requireLabel(box: BoxShape): TextShape {
    const label = box
      .getChildren()
      .find((child) => child.getId() === BoxShape.labelIdFor(box.getId()));

    if (!(label instanceof TextShape)) {
      throw ProtocolError.shape(
        CommandErrorCode.InvalidArgument,
        `invalid box#${box.getId()}: missing label text`,
      );
    }

    return label;
  }
}
