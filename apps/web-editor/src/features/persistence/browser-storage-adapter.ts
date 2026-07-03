import type { StorageAdapter } from "@adl/persistence";

export class BrowserStorageAdapter implements StorageAdapter {
  get(key: string): string | null { return window.localStorage.getItem(key); }
  set(key: string, value: string): void { window.localStorage.setItem(key, value); }
  remove(key: string): void { window.localStorage.removeItem(key); }
}
