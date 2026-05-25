import { getDatabase } from '../db/index.js';
import { Setting } from '../db/schema.js';
import {
  normalizeVatUpdateConcurrency,
  refreshJpkVatDeclarationStatuses,
} from '../services/jpkVatDeclarationStatus.js';
import { type ScheduledJob, durationToMs } from './scheduler.js';

const FIVE_MINUTES_MS = durationToMs('5m');
const DEFAULT_VAT_UPDATE_INTERVAL_MINUTES = 15;
const MIN_VAT_UPDATE_INTERVAL_MINUTES = 5;

function normalizeIntervalMinutes(value: string | undefined): number {
  const parsed = value ? Number.parseInt(value, 10) : DEFAULT_VAT_UPDATE_INTERVAL_MINUTES;
  if (Number.isNaN(parsed) || parsed < MIN_VAT_UPDATE_INTERVAL_MINUTES) {
    return DEFAULT_VAT_UPDATE_INTERVAL_MINUTES;
  }

  return Math.max(
    MIN_VAT_UPDATE_INTERVAL_MINUTES,
    Math.round(parsed / MIN_VAT_UPDATE_INTERVAL_MINUTES) * MIN_VAT_UPDATE_INTERVAL_MINUTES,
  );
}

export function shouldRunVatUpdate(startedAt: Date, intervalMinutes: number): boolean {
  const totalMinutes = startedAt.getHours() * 60 + startedAt.getMinutes();
  const roundedToFiveMinutes =
    Math.floor(totalMinutes / MIN_VAT_UPDATE_INTERVAL_MINUTES) * MIN_VAT_UPDATE_INTERVAL_MINUTES;

  return roundedToFiveMinutes % intervalMinutes === 0;
}

async function getVatUpdateSettings(): Promise<{
  enabled: boolean;
  intervalMinutes: number;
  concurrency: number;
}> {
  const db = await getDatabase();
  const repository = db.getRepository(Setting);
  const [enabledSetting, intervalSetting, concurrencySetting] = await Promise.all([
    repository.findOne({ where: { key: 'vat_updates_enabled' } }),
    repository.findOne({ where: { key: 'vat_update_interval_minutes' } }),
    repository.findOne({ where: { key: 'vat_update_concurrency' } }),
  ]);

  return {
    enabled: enabledSetting?.value !== 'false',
    intervalMinutes: normalizeIntervalMinutes(intervalSetting?.value),
    concurrency: normalizeVatUpdateConcurrency(concurrencySetting?.value),
  };
}

export const jpkVatDeclarationStatusJob: ScheduledJob = {
  name: 'jpk-vat-declaration-status',
  intervalMs: FIVE_MINUTES_MS,
  run: async ({ startedAt }) => {
    const settings = await getVatUpdateSettings();
    if (!settings.enabled) {
      console.log('[jobs] Skipping JPK VAT declaration check because VAT updates are disabled');
      return;
    }

    if (!shouldRunVatUpdate(startedAt, settings.intervalMinutes)) {
      console.log(
        `[jobs] Skipping JPK VAT declaration check; ${settings.intervalMinutes}m interval is not due`,
      );
      return;
    }

    const statuses = await refreshJpkVatDeclarationStatuses(startedAt, {
      concurrency: settings.concurrency,
    });
    const missingCount = statuses.filter(
      (status) => status.isVatDeclarationRequired && !status.hasSent,
    ).length;

    console.log(
      `[jobs] Checked JPK VAT declarations for ${statuses.length} companies; ${missingCount} without a successful send this month`,
    );
  },
};
