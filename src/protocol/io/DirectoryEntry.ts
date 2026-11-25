import { DirectoryEntryKind } from "./DirectoryEntryKind";

/** 目录直接子项的领域对象；名称不含路径分隔符。 */
export class DirectoryEntry {
  public constructor(
    private readonly kind: DirectoryEntryKind,
    private readonly name: string,
  ) {
    if (name.length === 0 || name === "." || name === "..") {
      throw new Error(`invalid directory entry name: ${name}`);
    }

    if (name.includes("/") || name.includes("\\")) {
      throw new Error(`directory entry name must not contain path separators: ${name}`);
    }
  }

  public getKind(): DirectoryEntryKind {
    return this.kind;
  }

  public getName(): string {
    return this.name;
  }

  public isDirectory(): boolean {
    return this.kind === DirectoryEntryKind.Directory;
  }

  public isFile(): boolean {
    return this.kind === DirectoryEntryKind.File;
  }
}
