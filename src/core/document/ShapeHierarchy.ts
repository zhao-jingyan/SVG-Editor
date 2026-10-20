import { CommandErrorCode } from "../../protocol/errors/CommandErrorCode";
import { DocumentError } from "../../protocol/errors/DocumentError";
import { GroupShape } from "../../protocol/shapes/GroupShape";
import type { Shape } from "../../protocol/shapes/Shape";
import { ShapeIndex } from "./ShapeIndex";

export class ShapeHierarchy {
  private readonly rootShapes: Shape[] = [];
  private readonly shapeIndex: ShapeIndex;

  public constructor(shapeIndex: ShapeIndex) {
    this.shapeIndex = shapeIndex;
  }

  public findShape(shapeId: string): Shape | undefined {
    return this.shapeIndex.findShape(shapeId);
  }

  public getShape(shapeId: string): Shape {
    return this.requireShape(shapeId);
  }

  public getParentId(shapeId: string): string | undefined {
    this.requireShape(shapeId);
    return this.shapeIndex.getParent(shapeId)?.getId();
  }

  public getRootShapes(): readonly Shape[] {
    return [...this.rootShapes];
  }

  public getChildren(parentId?: string): readonly Shape[] {
    if (parentId === undefined) {
      return this.getRootShapes();
    }

    return this.requireContainer(parentId).getChildren();
  }

  public addShape(shape: Shape, parentId?: string): void {
    this.shapeIndex.assertSubtreeCanBeRegistered(shape);

    const parent = parentId === undefined
      ? undefined
      : this.requireContainer(parentId);

    if (parent === undefined) {
      this.rootShapes.push(shape);
    } else {
      parent.addChild(shape);
    }

    this.shapeIndex.registerSubtree(shape, parent);
  }

  public deleteShape(shapeId: string): void {
    const shape = this.requireShape(shapeId);

    this.detachShape(shape);
    this.shapeIndex.unregisterSubtree(shape);
  }

  public groupShapes(containerId: string, memberIds: readonly string[]): void {
    if (memberIds.length < 2) {
      throw new DocumentError(
        CommandErrorCode.InvalidArgument,
        "group requires at least two members",
      );
    }

    const memberIdSet = new Set<string>();

    for (const memberId of memberIds) {
      if (memberIdSet.has(memberId)) {
        throw new DocumentError(
          CommandErrorCode.InvalidArgument,
          `duplicate member id: ${memberId}`,
        );
      }

      memberIdSet.add(memberId);
    }

    const members = memberIds.map((memberId) => this.requireShape(memberId));

    if (this.shapeIndex.findShape(containerId) !== undefined) {
      throw new DocumentError(
        CommandErrorCode.DuplicateId,
        `id already exists: ${containerId}`,
      );
    }

    for (let firstIndex = 0; firstIndex < members.length; firstIndex += 1) {
      for (
        let secondIndex = firstIndex + 1;
        secondIndex < members.length;
        secondIndex += 1
      ) {
        const first = members[firstIndex];
        const second = members[secondIndex];

        if (this.shapeIndex.isAncestor(first.getId(), second.getId())) {
          throw this.groupDescendantError(first.getId());
        }

        if (this.shapeIndex.isAncestor(second.getId(), first.getId())) {
          throw this.groupDescendantError(second.getId());
        }
      }
    }

    const orderedMembers = this.collectShapesInOrder().filter((shape) =>
      memberIdSet.has(shape.getId()),
    );
    const group = new GroupShape(containerId, orderedMembers);

    for (const member of orderedMembers) {
      this.detachShape(member);
      this.shapeIndex.unregisterSubtree(member);
    }

    this.rootShapes.push(group);
    this.shapeIndex.registerSubtree(group, undefined);
  }

  public ungroupShapes(containerId: string): void {
    const container = this.requireShape(containerId);

    if (!(container instanceof GroupShape)) {
      throw new DocumentError(
        CommandErrorCode.NotContainer,
        `not a container: ${containerId}`,
      );
    }

    const parent = this.shapeIndex.getParent(containerId);

    if (parent === undefined) {
      throw new DocumentError(
        CommandErrorCode.InvalidArgument,
        `cannot ungroup top-level container: ${containerId}`,
      );
    }

    const index = this.requireChildIndex(parent, containerId);
    const children = container.getChildren();

    parent.removeChild(containerId);

    for (let childIndex = 0; childIndex < children.length; childIndex += 1) {
      const child = children[childIndex];
      parent.insertChild(child, index + childIndex);
      this.shapeIndex.reparentShape(child, parent);
    }

    this.shapeIndex.unregisterShape(containerId);
  }

  public addToContainer(containerId: string, shapeId: string): void {
    const container = this.requireContainer(containerId);
    const shape = this.requireShape(shapeId);

    if (
      shape.getId() === containerId ||
      this.shapeIndex.isAncestor(shapeId, containerId)
    ) {
      throw new DocumentError(
        CommandErrorCode.InvalidArgument,
        `cannot add a container into its own descendant: ${shapeId}`,
      );
    }

    this.detachShape(shape);
    container.addChild(shape);
    this.shapeIndex.reparentShape(shape, container);
  }

  public reorderShape(shapeId: string, position: "front" | "back"): void {
    const shape = this.requireShape(shapeId);
    const parent = this.shapeIndex.getParent(shapeId);

    if (parent === undefined) {
      const index = this.rootShapes.indexOf(shape);

      if (
        (position === "front" && index === 0) ||
        (position === "back" && index === this.rootShapes.length - 1)
      ) {
        return;
      }

      this.rootShapes.splice(index, 1);

      if (position === "front") {
        this.rootShapes.unshift(shape);
      } else {
        this.rootShapes.push(shape);
      }

      return;
    }

    const children = parent.getChildren();
    const index = this.requireChildIndex(parent, shapeId);

    if (
      (position === "front" && index === 0) ||
      (position === "back" && index === children.length - 1)
    ) {
      return;
    }

    parent.removeChild(shapeId);
    parent.insertChild(
      shape,
      position === "front" ? 0 : parent.getChildren().length,
    );
  }

  private requireShape(shapeId: string): Shape {
    const shape = this.findShape(shapeId);

    if (shape === undefined) {
      throw new DocumentError(
        CommandErrorCode.ShapeNotFound,
        `no such shape: ${shapeId}`,
      );
    }

    return shape;
  }

  private requireContainer(containerId: string): GroupShape {
    const shape = this.findShape(containerId);

    if (shape === undefined) {
      throw new DocumentError(
        CommandErrorCode.ContainerNotFound,
        `no such container: ${containerId}`,
      );
    }

    if (!(shape instanceof GroupShape)) {
      throw new DocumentError(
        CommandErrorCode.NotContainer,
        `not a container: ${containerId}`,
      );
    }

    return shape;
  }

  private requireChildIndex(parent: GroupShape, shapeId: string): number {
    const index = parent
      .getChildren()
      .findIndex((child) => child.getId() === shapeId);

    if (index < 0) {
      throw new DocumentError(
        CommandErrorCode.ShapeNotFound,
        `no such shape: ${shapeId}`,
      );
    }

    return index;
  }

  private collectShapesInOrder(): Shape[] {
    const shapes: Shape[] = [];

    for (const shape of this.rootShapes) {
      this.appendShapesInOrder(shape, shapes);
    }

    return shapes;
  }

  private appendShapesInOrder(shape: Shape, shapes: Shape[]): void {
    shapes.push(shape);

    if (shape instanceof GroupShape) {
      for (const child of shape.getChildren()) {
        this.appendShapesInOrder(child, shapes);
      }
    }
  }

  private detachShape(shape: Shape): void {
    const shapeId = shape.getId();
    const parent = this.shapeIndex.getParent(shapeId);

    if (parent === undefined) {
      const index = this.rootShapes.indexOf(shape);
      this.rootShapes.splice(index, 1);
    } else {
      parent.removeChild(shapeId);
    }
  }

  private groupDescendantError(containerId: string): DocumentError {
    return new DocumentError(
      CommandErrorCode.InvalidArgument,
      `cannot group a container into its own descendant: ${containerId}`,
    );
  }
}
