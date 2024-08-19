import { promises as fs } from "fs";

export class FileCache<T> {
  private cache: Record<string, T> = {};
  private cacheFilePath: string;

  constructor(cacheFilePath: string) {
    this.cacheFilePath = cacheFilePath;
    this.loadCache();
  }

  private async loadCache(): Promise<void> {
    try {
      const data = await fs.readFile(this.cacheFilePath, "utf-8");
      this.cache = JSON.parse(data);
    } catch (error) {
      if (error instanceof Error) {
        const err = error as NodeJS.ErrnoException;
        if (err.code === "ENOENT") {
          // File does not exist, initialize with empty cache
          console.info(
            `Cache file ${this.cacheFilePath} does not exist, creating a new one.`
          );
          this.cache = {}; // Initialize with empty cache
          await this.saveCache(); // Create the file with empty cache
        } else {
          // Other errors, e.g., file read errors
          console.error("Error reading cache file:", error.message);
        }
      }
    }
  }

  private async saveCache(): Promise<void> {
    try {
      await fs.writeFile(
        this.cacheFilePath,
        JSON.stringify(this.cache, null, 2)
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error writing cache file:", error?.message);
      } else {
        console.error(error);
      }
    }
  }

  public async getCache(): Promise<Record<string, T>> {
    return this.cache;
  }

  public async setCache(newCache: Record<string, T>): Promise<void> {
    this.cache = newCache;
    await this.saveCache();
  }

  public async addItem(key: string, item: T): Promise<void> {
    this.cache[key] = item;
    await this.saveCache();
  }

  public async removeItem(key: string): Promise<void> {
    delete this.cache[key];
    await this.saveCache();
  }

  public async clearCache(): Promise<void> {
    this.cache = {};
    await this.saveCache();
  }

  public async getItem(key: string): Promise<T | undefined> {
    return this.cache[key];
  }
}
