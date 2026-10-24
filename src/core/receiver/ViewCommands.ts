import type { ViewCommandReceiver } from "../../protocol/receivers/ViewCommandReceiver";
import type { CommandResult } from "../../protocol/results/CommandResult";
import { CommandSuccessResult } from "../../protocol/results/outcomes/CommandSuccessResult";
import { HelpText } from "../display/HelpText";
import { ShapeDetailVisitor } from "../display/ShapeDetailVisitor";
import { TreeDisplay } from "../display/TreeDisplay";
import type { DocumentCommands } from "./DocumentCommands";

export class ViewCommands implements ViewCommandReceiver {
  private readonly helpText: HelpText = new HelpText();
  private readonly shapeDetailVisitor: ShapeDetailVisitor = new ShapeDetailVisitor();
  private readonly treeDisplay: TreeDisplay = new TreeDisplay();

  public constructor(private readonly documents: DocumentCommands) {}

  public async tree(shapeId?: string): Promise<CommandResult> {
    return new CommandSuccessResult(
      this.treeDisplay.render(this.documents.requireDocument(), shapeId),
    );
  }

  public async show(shapeId: string): Promise<CommandResult> {
    const document = this.documents.requireDocument();
    const shape = document.getShape(shapeId);
    const parentId = document.getParentId(shapeId);
    const parentLabel = parentId === undefined ? "svg" : `g#${parentId}`;
    const lines = [
      `${shape.getType()}#${shape.getId()}  parent=${parentLabel}`,
      ...shape.accept(this.shapeDetailVisitor).map((line) => `  ${line}`),
    ];
    return new CommandSuccessResult(lines.join("\n"));
  }

  public async help(): Promise<CommandResult> {
    return new CommandSuccessResult(this.helpText.render());
  }
}
