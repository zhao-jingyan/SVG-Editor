import { CommandErrorCode } from "../../protocol/errors/CommandErrorCode";
import { DocumentError } from "../../protocol/errors/domain/DocumentError";

export class SvgShapeIdAllocator {
  private readonly reservedIds: ReadonlySet<string>;
  private readonly usedIds: Set<string> = new Set<string>();
  private readonly counters: Map<string, number> = new Map<string, number>();

  public constructor(reservedIds: ReadonlySet<string>) {
    this.reservedIds = reservedIds;
  }

  public allocate(tag: string, explicitId?: string): string {
    if (explicitId !== undefined) {
      if (this.usedIds.has(explicitId)) {
        throw new DocumentError(
          CommandErrorCode.DuplicateId,
          `id already exists: ${explicitId}`,
        );
      }

      this.usedIds.add(explicitId);
      return explicitId;
    }

    let next = this.counters.get(tag) ?? 1;
    let candidate = `${tag}${next}`;

    while (this.usedIds.has(candidate) || this.reservedIds.has(candidate)) {
      next += 1;
      candidate = `${tag}${next}`;
    }

    this.counters.set(tag, next + 1);
    this.usedIds.add(candidate);
    return candidate;
  }
}
