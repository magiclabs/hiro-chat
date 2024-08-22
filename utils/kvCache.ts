import { kv } from "@vercel/kv";

export class KVCache<T> {
  private cachePrefix: string;

  constructor(cachePrefix: string) {
    this.cachePrefix = cachePrefix;
  }

  private getStorageKey(id: string) {
    return `${this.cachePrefix}_id`;
  }

  public async setCache(key: string, item: T): Promise<void> {
    await kv.set(this.getStorageKey(key), JSON.stringify(item));
  }

  public async clearItem(key: string): Promise<void> {
    await kv.set(this.getStorageKey(key), JSON.stringify({}));
  }

  public async getItem(key: string): Promise<T | null> {
    return kv.get(this.getStorageKey(key));
  }
}
