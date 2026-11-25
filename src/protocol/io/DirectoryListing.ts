import type { DirectoryEntry } from "./DirectoryEntry";

/**
 * 目录列举端口（Adapter Target）。
 * 实现方负责读取失败时抛错；调用方将异常转为命令错误结果。
 * 不经 CommandReceiver，与文档编辑能力解耦。
 */
export interface DirectoryListing {
  list(path: string): Promise<readonly DirectoryEntry[]>;
}
