type DurationUnit = 'ms' | 's' | 'm' | 'h';
type DurationPart = `${number}${DurationUnit}`;

export type DurationString =
  | DurationPart
  | `${DurationPart}${DurationPart}`
  | `${DurationPart}${DurationPart}${DurationPart}`
  | `${DurationPart}${DurationPart}${DurationPart}${DurationPart}`;

const durationUnits: Record<DurationUnit, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
};

export function durationToMs(duration: DurationString): number {
  const matches = duration.matchAll(/(\d+(?:\.\d+)?)(ms|s|m|h)/g);
  let parsed = '';
  let totalMs = 0;

  for (const match of matches) {
    const [, rawAmount, unit] = match;
    parsed += match[0];
    totalMs += Number(rawAmount) * durationUnits[unit as DurationUnit];
  }

  if (parsed !== duration || totalMs <= 0) {
    throw new Error(`Invalid duration string: ${duration}`);
  }

  return totalMs;
}

export interface JobContext {
  startedAt: Date;
}

export interface ScheduledJob {
  name: string;
  intervalMs: number;
  run: (context: JobContext) => Promise<void> | void;
}

export class JobScheduler {
  private readonly timers = new Map<string, NodeJS.Timeout>();
  private readonly runningJobs = new Set<string>();

  start(jobs: ScheduledJob[]): void {
    for (const job of jobs) {
      if (this.timers.has(job.name)) {
        console.warn(`[jobs] Job "${job.name}" is already scheduled`);
        continue;
      }

      const timer = setInterval(() => {
        void this.runJob(job);
      }, job.intervalMs);

      timer.unref();
      this.timers.set(job.name, timer);

      console.log(`[jobs] Scheduled "${job.name}" every ${job.intervalMs}ms`);
    }
  }

  stop(): void {
    for (const [jobName, timer] of this.timers.entries()) {
      clearInterval(timer);
      console.log(`[jobs] Stopped "${jobName}"`);
    }

    this.timers.clear();
    this.runningJobs.clear();
  }

  private async runJob(job: ScheduledJob): Promise<void> {
    if (this.runningJobs.has(job.name)) {
      console.warn(`[jobs] Skipping "${job.name}" because the previous run is still active`);
      return;
    }

    const startedAt = new Date();
    this.runningJobs.add(job.name);
    console.log(`[jobs] Starting "${job.name}" at ${startedAt.toISOString()}`);

    try {
      await job.run({ startedAt });
      const durationMs = Date.now() - startedAt.getTime();
      console.log(`[jobs] Finished "${job.name}" in ${durationMs}ms`);
    } catch (error) {
      console.error(`[jobs] Failed "${job.name}":`, error);
    } finally {
      this.runningJobs.delete(job.name);
    }
  }
}
