import { CommandErrorCode } from "../../protocol/errors/CommandErrorCode";
import { ProtocolError } from "../../protocol/errors/ProtocolError";
import { ShapePlacement } from "../../protocol/commands/memento/ShapePlacement";
import { GroupShape } from "../../protocol/shapes/concrete/GroupShape";
import type { Shape } from "../../protocol/shapes/model/Shape";
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

  public getIndexInParent(shapeId: string): number {
    const shape = this.requireShape(shapeId);
    const parent = this.shapeIndex.getParent(shapeId);

    if (parent === undefined) {
      return this.rootShapes.indexOf(shape);
    }

    return this.requireChildIndex(parent, shapeId);
  }

  public capturePlacement(shapeId: string): ShapePlacement {
    return new ShapePlacement(
      this.getShape(shapeId),
      this.getParentId(shapeId),
      this.getIndexInParent(shapeId),
    );
  }

  public restorePlacements(placements: readonly ShapePlacement[]): void {
    const orderedPlacements = [...placements].sort((first, second) => {
      const firstParent = first.getParentId() ?? "";
      const secondParent = second.getParentId() ?? "";

      if (firstParent !== secondParent) {
        return firstParent < secondParent ? -1 : 1;
      }

      return first.getIndex() - second.getIndex();
    });

    this.validateRestorePlacements(orderedPlacements);

    for (const placement of orderedPlacements) {
      this.restorePlacement(placement);
    }
  }

  public restoreGroup(placement: ShapePlacement): void {
    const shape = placement.getShape();

    if (!(shape instanceof GroupShape)) {
      throw ProtocolError.document(
        CommandErrorCode.NotContainer,
        `not a container: ${shape.getId()}`,
      );
    }

    const parentId = placement.getParentId();

    if (parentId === undefined) {
      throw ProtocolError.document(
        CommandErrorCode.InvalidArgument,
        `cannot restore top-level container: ${shape.getId()}`,
      );
    }

    const parent = this.requireContainer(parentId);

    if (this.findShape(shape.getId()) !== undefined) {
      throw ProtocolError.document(
        CommandErrorCode.DuplicateId,
        `id already exists: ${shape.getId()}`,
      );
    }

    const children = shape.getChildren();

    for (const child of children) {
      if (this.shapeIndex.getParent(child.getId()) !== parent) {
        throw ProtocolError.document(
          CommandErrorCode.InvalidArgument,
          `group children no longer share the original parent: ${shape.getId()}`,
        );
      }

      if (this.shapeIndex.isAncestor(child.getId(), parentId)) {
        throw ProtocolError.document(
          CommandErrorCode.InvalidArgument,
          `cannot restore a container into its own descendant: ${shape.getId()}`,
        );
      }
    }

    const remainingLength = parent.getChildren().length - children.length;
    this.requireInsertionIndex(remainingLength, placement.getIndex());

    for (const child of children) {
      parent.removeChild(child.getId());
      this.shapeIndex.unregisterSubtree(child);
    }

    parent.insertChild(shape, placement.getIndex());
    this.shapeIndex.registerSubtree(shape, parent);
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
      throw ProtocolError.document(
        CommandErrorCode.InvalidArgument,
        "group requires at least two members",
      );
    }

    const memberIdSet = new Set<string>();

    for (const memberId of memberIds) {
      if (memberIdSet.has(memberId)) {
        throw ProtocolError.document(
          CommandErrorCode.InvalidArgument,
          `duplicate member id: ${memberId}`,
        );
      }

      memberIdSet.add(memberId);
    }

    const members = memberIds.map((memberId) => this.requireShape(memberId));

    if (this.shapeIndex.findShape(containerId) !== undefined) {
      throw ProtocolError.document(
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
      throw ProtocolError.document(
        CommandErrorCode.NotContainer,
        `not a container: ${containerId}`,
      );
    }

    const parent = this.shapeIndex.getParent(containerId);

    if (parent === undefined) {
      throw ProtocolError.document(
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
      throw ProtocolError.document(
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

  private restorePlacement(placement: ShapePlacement): void {
    const shape = placement.getShape();
    const parentId = placement.getParentId();
    const targetParent = parentId === undefined
      ? undefined
      : this.requireContainer(parentId);
    const registered = this.findShape(shape.getId()) !== undefined;

    if (registered) {
      const currentParent = this.shapeIndex.getParent(shape.getId());
      const targetLength = targetParent?.getChildren().length ?? this.rootShapes.length;
      const availableLength = currentParent === targetParent
        ? targetLength - 1
        : targetLength;

      if (
        targetParent !== undefined &&
        (
          targetParent.getId() === shape.getId() ||
          this.shapeIndex.isAncestor(shape.getId(), targetParent.getId())
        )
      ) {
        throw ProtocolError.document(
          CommandErrorCode.InvalidArgument,
          `cannot move a container into its own descendant: ${shape.getId()}`,
        );
      }

      this.requireInsertionIndex(availableLength, placement.getIndex());
      this.detachShape(shape);
      this.insertShapeAt(shape, targetParent, placement.getIndex());
      this.shapeIndex.reparentShape(shape, targetParent);
      return;
    }

    this.shapeIndex.assertSubtreeCanBeRegistered(shape);

    if (
      targetParent !== undefined &&
      this.containsShape(shape, targetParent.getId())
    ) {
      throw ProtocolError.document(
        CommandErrorCode.InvalidArgument,
        `cannot move a container into its own descendant: ${shape.getId()}`,
      );
    }

    this.requireInsertionIndex(
      targetParent?.getChildren().length ?? this.rootShapes.length,
      placement.getIndex(),
    );
    this.insertShapeAt(shape, targetParent, placement.getIndex());
    this.shapeIndex.registerSubtree(shape, targetParent);
  }

  private validateRestorePlacements(
    placements: readonly ShapePlacement[],
  ): void {
    const placedShapeIds = new Set<string>();
    const targets = new Map<string, {
      readonly parent: GroupShape | undefined;
      readonly placements: ShapePlacement[];
    }>();

    for (const placement of placements) {
      const shape = placement.getShape();
      const shapeId = shape.getId();

      if (placedShapeIds.has(shapeId)) {
        throw ProtocolError.document(
          CommandErrorCode.InvalidArgument,
          `duplicate placement: ${shapeId}`,
        );
      }

      placedShapeIds.add(shapeId);
      const parentId = placement.getParentId();
      const targetParent = parentId === undefined
        ? undefined
        : this.requireContainer(parentId);
      const targetKey = parentId ?? "";
      const target = targets.get(targetKey);

      if (target === undefined) {
        targets.set(targetKey, {
          parent: targetParent,
          placements: [placement],
        });
      } else {
        target.placements.push(placement);
      }

      if (this.findShape(shapeId) !== undefined) {
        if (
          targetParent !== undefined &&
          this.shapeIndex.isAncestor(shapeId, targetParent.getId())
        ) {
          throw ProtocolError.document(
            CommandErrorCode.InvalidArgument,
            `cannot move a container into its own descendant: ${shapeId}`,
          );
        }

        continue;
      }

      this.shapeIndex.assertSubtreeCanBeRegistered(shape);

      if (
        targetParent !== undefined &&
        this.containsShape(shape, targetParent.getId())
      ) {
        throw ProtocolError.document(
          CommandErrorCode.InvalidArgument,
          `cannot move a container into its own descendant: ${shapeId}`,
        );
      }
    }

    for (const target of targets.values()) {
      const currentIds = target.parent === undefined
        ? this.rootShapes.map((shape) => shape.getId())
        : target.parent.getChildren().map((shape) => shape.getId());
      const movingIds = new Set(
        target.placements.map((placement) => placement.getShape().getId()),
      );
      const restoredIds = currentIds.filter((shapeId) => !movingIds.has(shapeId));

      for (const placement of target.placements) {
        this.requireInsertionIndex(restoredIds.length, placement.getIndex());
        restoredIds.splice(placement.getIndex(), 0, placement.getShape().getId());
      }
    }
  }

  private insertShapeAt(
    shape: Shape,
    parent: GroupShape | undefined,
    index: number,
  ): void {
    if (parent === undefined) {
      this.rootShapes.splice(index, 0, shape);
      return;
    }

    parent.insertChild(shape, index);
  }

  private requireInsertionIndex(length: number, index: number): void {
    if (!Number.isInteger(index) || index < 0 || index > length) {
      throw ProtocolError.document(
        CommandErrorCode.InvalidArgument,
        `invalid child index: ${index}`,
      );
    }
  }

  private containsShape(shape: Shape, shapeId: string): boolean {
    if (shape.getId() === shapeId) {
      return true;
    }

    if (!(shape instanceof GroupShape)) {
      return false;
    }

    return shape
      .getChildren()
      .some((child) => this.containsShape(child, shapeId));
  }

  private requireShape(shapeId: string): Shape {
    const shape = this.findShape(shapeId);

    if (shape === undefined) {
      throw ProtocolError.document(
        CommandErrorCode.ShapeNotFound,
        `no such shape: ${shapeId}`,
      );
    }

    return shape;
  }

  private requireContainer(containerId: string): GroupShape {
    const shape = this.findShape(containerId);

    if (shape === undefined) {
      throw ProtocolError.document(
        CommandErrorCode.ContainerNotFound,
        `no such container: ${containerId}`,
      );
    }

    if (!(shape instanceof GroupShape)) {
      throw ProtocolError.document(
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
      throw ProtocolError.document(
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

  private groupDescendantError(containerId: string): ProtocolError {
    return ProtocolError.document(
      CommandErrorCode.InvalidArgument,
      `cannot group a container into its own descendant: ${containerId}`,
    );
  }
}
