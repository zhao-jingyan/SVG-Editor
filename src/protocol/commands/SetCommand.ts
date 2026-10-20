import type { EditableAttribute } from "../EditableAttribute";

export interface SetCommand {
  readonly type: "set";
  readonly shapeId: string;
  readonly attribute: EditableAttribute;
  readonly value: string | number;
}
