import { exampleDevelopmentJob } from './exampleDevelopmentJob.js';
import { jpkVatDeclarationStatusJob } from './jpkVatDeclarationStatusJob.js';
import { JobScheduler } from './scheduler.js';

const scheduledJobs = [exampleDevelopmentJob, jpkVatDeclarationStatusJob];

export function startJobScheduler(): JobScheduler {
  const scheduler = new JobScheduler();
  scheduler.start(scheduledJobs);
  return scheduler;
}

export type { ScheduledJob } from './scheduler.js';
