import type { TreeDecoratorCatalog } from "@/protocol/tree/TreeDecoratorCatalog";
import type { TreeDecorator } from "@/protocol/tree/TreeDecorator";

/** 运行时树标签注册表；拒绝重复名称。 */
export class TreeDecoratorRegistry implements TreeDecoratorCatalog {
  private readonly decorators: TreeDecorator[] = [];
  private readonly byName = new Map<string, TreeDecorator>();

  public register(decorator: TreeDecorator): void {
    const name = decorator.getName();

    if (this.byName.has(name)) {
      throw new Error(`duplicate tree decorator: ${name}`);
    }

    this.byName.set(name, decorator);
    this.decorators.push(decorator);
  }

  public registerAll(decorators: readonly TreeDecorator[]): void {
    for (const decorator of decorators) {
      this.register(decorator);
    }
  }

  public getDecorators(): readonly TreeDecorator[] {
    return this.decorators;
  }
}
