import { describe, expect, it } from 'vitest';
import { shouldRunVatUpdate } from './jpkVatDeclarationStatusJob.js';
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

describe('shouldRunVatUpdate', () => {
  it('runs on configured interval boundaries rounded to five minutes', () => {
    expect(shouldRunVatUpdate(new Date('2026-05-18T10:00:00Z'), 15)).toBe(true);
    expect(shouldRunVatUpdate(new Date('2026-05-18T10:14:00Z'), 15)).toBe(false);
    expect(shouldRunVatUpdate(new Date('2026-05-18T10:15:00Z'), 15)).toBe(true);
    expect(shouldRunVatUpdate(new Date('2026-05-18T10:20:00Z'), 10)).toBe(true);
  });
});
