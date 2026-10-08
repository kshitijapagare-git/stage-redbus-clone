export const WOMEN_TOGGLE_STORAGE_KEY = 'womenToggle'

export function loadWomenToggle(): boolean {
  try {
    return localStorage.getItem(WOMEN_TOGGLE_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function persistWomenToggle(value: boolean): void {
  try {
    localStorage.setItem(WOMEN_TOGGLE_STORAGE_KEY, value ? '1' : '0')
  } catch {
    // Ignore storage errors (quota exceeded, storage disabled, etc.)
  }
}
