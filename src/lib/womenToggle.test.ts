import { afterEach, describe, expect, it, vi } from 'vitest'
import { WOMEN_TOGGLE_STORAGE_KEY, loadWomenToggle, persistWomenToggle } from './womenToggle'

describe('womenToggle', () => {
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('defaults to false when nothing is stored', () => {
    expect(loadWomenToggle()).toBe(false)
  })

  it('returns true only when the stored value is exactly "1"', () => {
    localStorage.setItem(WOMEN_TOGGLE_STORAGE_KEY, '1')
    expect(loadWomenToggle()).toBe(true)

    localStorage.setItem(WOMEN_TOGGLE_STORAGE_KEY, '0')
    expect(loadWomenToggle()).toBe(false)

    localStorage.setItem(WOMEN_TOGGLE_STORAGE_KEY, 'yes')
    expect(loadWomenToggle()).toBe(false)
  })

  it('persists true as "1" and false as "0"', () => {
    persistWomenToggle(true)
    expect(localStorage.getItem(WOMEN_TOGGLE_STORAGE_KEY)).toBe('1')

    persistWomenToggle(false)
    expect(localStorage.getItem(WOMEN_TOGGLE_STORAGE_KEY)).toBe('0')
  })

  it('defaults to false when localStorage.getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('boom')
    })

    expect(loadWomenToggle()).toBe(false)
  })

  it('does not throw when localStorage.setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('boom')
    })

    expect(() => persistWomenToggle(true)).not.toThrow()
  })
})
