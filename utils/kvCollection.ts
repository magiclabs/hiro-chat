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

  public async add(item: T): Promise<T & { key: number }> {
    const autoInc = await this.getAutoInc();
    const members = await this.get();

    const newItem = { key: autoInc, ...item };
    const valueToSet = [...members, newItem].filter((m) => m.key > -1);

    await kv.set(this.getStorageKey(), valueToSet);

    await this.onAutoInc();

    return newItem;
  }

  public async update(item: Partial<T> & { key: number }): Promise<void> {
    const members = await this.get();

    const valueToSet = members
      .filter((m) => m.key > -1)
      .map((m) => (m.key === item.key ? { ...m, ...item } : m));

    await kv.set(this.getStorageKey(), valueToSet);

    await this.onAutoInc();
  }

  public async delete(key: number): Promise<void> {
    const members = await this.get();
    const valueToSet = members.filter((m) => m.key !== key && m.key > -1);
    await kv.set(this.getStorageKey(), valueToSet);
  }

  public async get(): Promise<(T & { key: number })[]> {
    return (await kv.get(this.getStorageKey())) ?? [];
  }

  public async reset() {
    await kv.del(`${this.cachePrefix}:autoInc`);
    await kv.del(this.getStorageKey());
  }
}
