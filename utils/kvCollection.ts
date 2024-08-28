import { kv } from "@vercel/kv";

export class KVCollection<T> {
  private cachePrefix: string;

  constructor(cachePrefix: string) {
    this.cachePrefix = cachePrefix;
  }

  private getStorageKey() {
    return `${this.cachePrefix}:members`;
  }

  private async getAutoInc() {
    return ((await kv.get(`${this.cachePrefix}:autoInc`)) as number) ?? 0;
  }

  private async onAutoInc() {
    const autoInc = await this.getAutoInc();
    await kv.set(`${this.cachePrefix}:autoInc`, autoInc + 1);
  }

  public async add(item: T): Promise<void> {
    const autoInc = await this.getAutoInc();
    const members = await this.get();

    const valueToSet = [...members, { key: autoInc, ...item }];

    await kv.set(this.getStorageKey(), valueToSet);

    await this.onAutoInc();
  }

  public async delete(key: string): Promise<void> {
    const members = await this.get();
    await kv.set(
      this.getStorageKey(),
      // @ts-ignore
      members.filter((m) => m.key !== key),
    );
  }

  public async get(): Promise<T[]> {
    return (await kv.get(this.getStorageKey())) ?? [];
  }

  public async reset() {
    await kv.del(`${this.cachePrefix}:autoInc`);
    await kv.del(this.getStorageKey());
  }
}
