import type { DocumentCommandReceiver } from "./DocumentCommandReceiver";
import type { HistoryCommandReceiver } from "./HistoryCommandReceiver";
import type { ShapeCommandReceiver } from "./ShapeCommandReceiver";
import type { ViewCommandReceiver } from "./ViewCommandReceiver";

/** 聚合命令执行所需的全部编辑能力。 */
export interface CommandReceiver
  extends DocumentCommandReceiver,
    ShapeCommandReceiver,
    ViewCommandReceiver,
    HistoryCommandReceiver {}
