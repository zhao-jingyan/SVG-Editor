import type { TreeDecorator } from "./TreeDecorator";

/** 只读树标签目录。 */
export interface TreeDecoratorCatalog {
  getDecorators(): readonly TreeDecorator[];
}
