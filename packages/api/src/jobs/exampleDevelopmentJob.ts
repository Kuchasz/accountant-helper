import { durationToMs, type ScheduledJob } from './scheduler.js';

const FIVE_MINUTES_MS = durationToMs('5m');

export const exampleDevelopmentJob: ScheduledJob = {
  name: 'example-development-job',
  intervalMs: FIVE_MINUTES_MS,
  run: ({ startedAt }) => {
    console.log(`[jobs] Example development job tick: ${startedAt.toISOString()}`);
    return;
  },
};
