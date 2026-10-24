import type { DocumentCommandReceiver } from "../../protocol/receivers/DocumentCommandReceiver";
import { CommandErrorCode } from "../../protocol/errors/CommandErrorCode";
import { ProtocolError } from "../../protocol/errors/ProtocolError";
import type { CommandResult } from "../../protocol/results/CommandResult";
import { CommandSuccessResult } from "../../protocol/results/outcomes/CommandSuccessResult";
import { Document } from "../document/Document";
import type { CommandHistory } from "../history/CommandHistory";
import { FileSvgStorage } from "../io/FileSvgStorage";
import { SvgDocumentParser } from "../io/SvgDocumentParser";
import { SvgDocumentWriter } from "../io/SvgDocumentWriter";
import type { SvgStorage } from "../io/SvgStorage";

export class DocumentManager implements DocumentCommandReceiver {
  private document?: Document;
  private currentPath?: string;
  private readonly svgDocumentParser: SvgDocumentParser = new SvgDocumentParser();
  private readonly svgDocumentWriter: SvgDocumentWriter = new SvgDocumentWriter();

  public constructor(
    private readonly history: CommandHistory,
    private readonly svgStorage: SvgStorage = new FileSvgStorage(),
  ) {}

  public async init(width?: number, height?: number): Promise<CommandResult> {
    const document = new Document(width ?? 800, height ?? 600);
    this.document = document;
    this.currentPath = undefined;
    this.history.clear();
    this.history.lock();
    return new CommandSuccessResult(
      `canvas ${document.getWidth()}x${document.getHeight()} created`,
    );
  }

  public async read(path: string): Promise<CommandResult> {
    let content: string;

    try {
      content = await this.svgStorage.read(path);
    } catch {
      throw ProtocolError.commandExecution(
        CommandErrorCode.IoRead,
        `cannot read file: ${path}`,
      );
    }

    const parsed = this.svgDocumentParser.parse(content);
    this.document = parsed.getDocument();
    this.currentPath = path;
    this.history.clear();
    this.history.lock();
    return new CommandSuccessResult([
      ...parsed.getWarnings(),
      `read ${path} (${parsed.getElementCount()} elements)`,
    ].join("\n"));
  }

  public async save(path?: string): Promise<CommandResult> {
    const document = this.requireDocument();
    const targetPath = path ?? this.currentPath;

    if (targetPath === undefined) {
      throw ProtocolError.document(
        CommandErrorCode.InvalidArgument,
        "save requires a file path",
      );
    }

    const content = this.svgDocumentWriter.render(document);

    try {
      await this.svgStorage.write(targetPath, content);
    } catch {
      throw ProtocolError.commandExecution(
        CommandErrorCode.IoWrite,
        `cannot write file: ${targetPath}`,
      );
    }

    this.currentPath = targetPath;
    this.history.lock();
    return new CommandSuccessResult(
      `saved to ${targetPath} (${this.svgDocumentWriter.countElements(document)} elements)`,
    );
  }

  public async canvas(width?: number, height?: number): Promise<CommandResult> {
    const document = this.requireDocument();

    if (width === undefined && height === undefined) {
      return new CommandSuccessResult(
        `canvas ${document.getWidth()}x${document.getHeight()}`,
      );
    }

    if (width === undefined || height === undefined) {
      throw ProtocolError.document(
        CommandErrorCode.InvalidArgument,
        "canvas requires both width and height",
      );
    }

    document.resize(width, height);
    this.history.lock();
    return new CommandSuccessResult(
      `canvas ${document.getWidth()}x${document.getHeight()} resized`,
    );
  }

  public requireDocument(): Document {
    if (this.document === undefined) {
      throw ProtocolError.document(
        CommandErrorCode.NoDocument,
        "no document. use 'init' or 'read' first",
      );
    }

    return this.document;
  }
}
