import { CommandErrorCode } from "../../protocol/errors/CommandErrorCode";
import { DocumentError } from "../../protocol/errors/domain/DocumentError";
import { GroupShape } from "../../protocol/shapes/GroupShape";
import type { Shape } from "../../protocol/shapes/Shape";

export class ShapeIndex {
  private readonly shapesById: Map<string, Shape> = new Map();
  private readonly parentsById: Map<string, GroupShape | undefined> = new Map();

  public findShape(shapeId: string): Shape | undefined {
    return this.shapesById.get(shapeId);
  }

  public getParent(shapeId: string): GroupShape | undefined {
    return this.parentsById.get(shapeId);
  }

  public assertSubtreeCanBeRegistered(shape: Shape): void {
    const ids = this.collectSubtreeIds(shape);

    for (const id of ids) {
      if (this.shapesById.has(id)) {
        throw new DocumentError(
          CommandErrorCode.DuplicateId,
          `id already exists: ${id}`,
        );
      }
    }
  }

  public registerSubtree(shape: Shape, parent: GroupShape | undefined): void {
    this.assertSubtreeCanBeRegistered(shape);
    this.indexSubtree(shape, parent);
  }

  public unregisterShape(shapeId: string): void {
    this.shapesById.delete(shapeId);
    this.parentsById.delete(shapeId);
  }

  public unregisterSubtree(shape: Shape): void {
    this.unregisterShape(shape.getId());

    if (shape instanceof GroupShape) {
      for (const child of shape.getChildren()) {
        this.unregisterSubtree(child);
      }
    }
  }

  public reparentShape(shape: Shape, parent: GroupShape | undefined): void {
    this.parentsById.set(shape.getId(), parent);
  }

  public isAncestor(ancestorId: string, descendantId: string): boolean {
    let parent = this.parentsById.get(descendantId);

    while (parent !== undefined) {
      if (parent.getId() === ancestorId) {
        return true;
      }

      parent = this.parentsById.get(parent.getId());
    }

    return false;
  }

  private collectSubtreeIds(shape: Shape, ids: Set<string> = new Set()): Set<string> {
    const shapeId = shape.getId();

    if (ids.has(shapeId)) {
      throw new DocumentError(
        CommandErrorCode.DuplicateId,
        `id already exists: ${shapeId}`,
      );
    }

    ids.add(shapeId);

    if (shape instanceof GroupShape) {
      for (const child of shape.getChildren()) {
        this.collectSubtreeIds(child, ids);
      }
    }

    return ids;
  }

  private indexSubtree(shape: Shape, parent: GroupShape | undefined): void {
    this.shapesById.set(shape.getId(), shape);
    this.parentsById.set(shape.getId(), parent);

    if (shape instanceof GroupShape) {
      for (const child of shape.getChildren()) {
        this.indexSubtree(child, shape);
      }
    }
  }
}
