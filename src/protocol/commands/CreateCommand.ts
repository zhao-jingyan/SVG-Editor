import type { ShapeSpec } from "../ShapeSpec";

export interface CreateCommand {
  readonly type: "create";
  readonly shape: ShapeSpec;
  readonly parentId?: string;
}
