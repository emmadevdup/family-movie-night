import { describe, it, expect } from 'vitest'
import { cycleInterest } from './interests'

describe('cycleInterest', () => {
  it('neutral → yes', () => {
    expect(cycleInterest('neutral')).toBe('yes')
  })

  it('yes → no', () => {
    expect(cycleInterest('yes')).toBe('no')
  })

  it('no → neutral', () => {
    expect(cycleInterest('no')).toBe('neutral')
  })

  it('completes a full cycle', () => {
    let state = cycleInterest('neutral')
    expect(state).toBe('yes')
    state = cycleInterest(state)
    expect(state).toBe('no')
    state = cycleInterest(state)
    expect(state).toBe('neutral')
  })
})
