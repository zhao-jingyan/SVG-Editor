import type { DocumentCommandReceiver } from "./DocumentCommandReceiver";
import type { HistoryCommandReceiver } from "./HistoryCommandReceiver";
import type { ShapeCommandReceiver } from "./ShapeCommandReceiver";
import type { ViewCommandReceiver } from "./ViewCommandReceiver";

export interface CommandReceiver
  extends DocumentCommandReceiver,
    ShapeCommandReceiver,
    ViewCommandReceiver,
    HistoryCommandReceiver {}
