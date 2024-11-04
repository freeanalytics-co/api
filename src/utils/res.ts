export function res<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}
