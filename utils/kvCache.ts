import { kv } from "@vercel/kv";

export class KVCache<T> {
  private cachePrefix: string;

  constructor(cachePrefix: string) {
    this.cachePrefix = cachePrefix;
  }

  private getStorageKey(id: string) {
    return `${this.cachePrefix}:${id}`;
  }

  public async set(key: string, item: T): Promise<void> {
    await kv.set(this.getStorageKey(key), JSON.stringify(item));
  }

  public async delete(key: string): Promise<void> {
    await kv.del(this.getStorageKey(key));
  }

  public async get(key: string): Promise<T | null> {
    return kv.get(this.getStorageKey(key));
  }
}
