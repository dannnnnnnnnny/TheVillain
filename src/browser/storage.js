import {normalizeFear} from '../game/progression.js';
export function createStorage(storage) {
  const key = 'villain.fear.v1';
  let memory = 0;
  try { memory = normalizeFear(storage?.getItem(key)); } catch { /* browser denies storage: keep in-memory progress */ }
  return {
    load: () => memory,
    save(value) { memory = normalizeFear(value); try { storage?.setItem(key, String(memory)); } catch { /* memory remains authoritative this session */ } return memory; },
    reset() { memory = 0; try { storage?.removeItem(key); } catch { /* no other application's data is touched */ } },
  };
}
