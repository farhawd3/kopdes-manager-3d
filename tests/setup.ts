import { vi } from 'vitest';

// Node 22+ mendefinisikan getter global `localStorage` yang bernilai undefined bila
// dijalankan tanpa `--localstorage-file`. Getter itu menutupi penyimpanan milik jsdom,
// sehingga `localStorage` menjadi undefined di dalam tes dan mematahkan tes yang
// memakainya (mis. pemulihan tampilan tersimpan). Pasang penyimpanan dalam memori
// supaya tes berperilaku seperti peramban tanpa bergantung pada flag Node.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(String(key), String(value));
  }
}

for (const name of ['localStorage', 'sessionStorage'] as const) {
  if (typeof globalThis[name] === 'undefined') {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value: new MemoryStorage(),
    });
  }
}

vi.mock('next/font/google', () => ({
  Pixelify_Sans: () => ({
    className: 'font-pixel',
    variable: '--font-pixel',
  }),
}));
