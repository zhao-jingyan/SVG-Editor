export class HelpText {
  public render(): string {
    return [
      "Commands:",
      "  init [width height]                 create a new canvas (default 800x600)",
      "  read <file.svg>                     read an SVG file",
      "  save [file.svg]                     save the current document",
      "  canvas [width height]               show or resize the canvas",
      "  create <type> <id> [params...]      create a shape",
      "  delete <id>                         delete a shape and its subtree",
      "  move <id> <dx> <dy>                 move a shape",
      "  scale <id> <factor>                 scale a shape",
      "  set <id> <attribute> <value>        set a shape attribute",
      "  group <newGid> <id1> <id2>...       group existing shapes",
      "  ungroup <gid>                       ungroup a container",
      "  addto <gid> <id>                    move a shape into a container",
      "  front <id> | back <id>              change z-order",
      "  tree [id]                           show the shape tree",
      "  show <id>                           show shape attributes",
      "  undo | redo                         undo or redo an edit",
      "  help                                show this help",
      "  exit                                leave the editor",
    ].join("\n");
  }
}
