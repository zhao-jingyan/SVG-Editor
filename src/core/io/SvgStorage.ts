export interface SvgStorage {
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
}
