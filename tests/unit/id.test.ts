import { describe, it, expect, beforeEach } from 'vitest'
import { generateId, resetCounters } from '@/lib/id'

describe('ID Generator', () => {
  beforeEach(() => resetCounters())

  it('should generate IDs with correct prefix', () => {
    expect(generateId('LD')).toMatch(/^LD-2026-0001$/)
  })

  it('should increment counters per prefix', () => {
    expect(generateId('INV')).toBe('INV-2026-0001')
    expect(generateId('INV')).toBe('INV-2026-0002')
    expect(generateId('LD')).toBe('LD-2026-0001')
  })

  it('should reset counters', () => {
    generateId('CL')
    resetCounters()
    expect(generateId('CL')).toBe('CL-2026-0001')
  })

  it('should support all document ID prefixes', () => {
    const prefixes = ['LD', 'CL', 'PR', 'AG', 'INV', 'RC', 'EX', 'TR', 'RV', 'TK', 'MT', 'DC', 'RT', 'AU']
    prefixes.forEach((p) => {
      expect(generateId(p)).toMatch(new RegExp(`^${p}-2026-`))
    })
  })
})
