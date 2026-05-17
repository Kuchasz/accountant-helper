import { describe, expect, it } from 'vitest';
import { durationToMs } from './scheduler.js';

describe('durationToMs', () => {
  it('converts duration strings to milliseconds', () => {
    expect(durationToMs('500ms')).toBe(500);
    expect(durationToMs('5m')).toBe(5 * 60 * 1000);
    expect(durationToMs('1h30m')).toBe(90 * 60 * 1000);
  });

  it('rejects invalid duration strings', () => {
    expect(() => durationToMs('1x' as never)).toThrow('Invalid duration string');
  });
});
