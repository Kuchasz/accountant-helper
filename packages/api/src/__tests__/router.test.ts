import { describe, it, expect } from 'vitest';
import { appRouter } from '../router';

describe('tRPC Router', () => {
  it('should return hello world greeting', async () => {
    const caller = appRouter.createCaller({});
    const result = await caller.hello({ name: 'Test' });
    
    expect(result.greeting).toBe('Hello Test!');
    expect(result.timestamp).toBeDefined();
  });

  it('should return default greeting when no name provided', async () => {
    const caller = appRouter.createCaller({});
    const result = await caller.hello({});
    
    expect(result.greeting).toBe('Hello World!');
  });
});
