import type { DataSource } from 'typeorm';
import { getDatabase } from '../db/index.js';
import { CdnBazy } from '../db/optimaSchema.js';
import { JpkVatDeclarationStatus } from '../db/schema.js';
import { getOptimaConfigDataSource } from '../db/sqlserver.js';

const DEFAULT_VAT_UPDATE_CONCURRENCY = 5;
const MAX_VAT_UPDATE_CONCURRENCY = 10;
const SLOW_COMPANY_CHECK_MS = 2000;

export interface CompanyJpkVatStatusResult {
  companyId: number;
  companyName: string;
  databaseName: string;
  serverName?: string;
  sentMonth: string;
  hasSent: boolean;
  jpkFileId?: number;
  periodYear?: number;
  periodMonth?: number;
  jpkType?: string;
  status?: number;
  statusCode?: number;
  statusDescription?: string;
  referenceNumber?: string;
  sentAt?: Date;
  receivedAt?: Date;
  checkedAt: Date;
  lastError?: string;
}

interface JpkVatSentRow {
  JPK_JPKID: number;
  JPK_Typ: string;
  JPK_Status: number | null;
  JPK_StatusCode: number | null;
  JPK_StatusOpis: string | null;
  JPK_RefNr: string | null;
  SentAt: Date | string | null;
  ReceivedAt: Date | string | null;
  Jpk_Rok: number | null;
  Jpk_Miesiac: number | null;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthRange(date: Date): { start: Date; end: Date; sentMonth: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end, sentMonth: monthKey(date) };
}

function coerceDate(value: Date | string | null | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function normalizeServerName(serverName?: string): string | undefined {
  if (!serverName) {
    return undefined;
  }

  const trimmed = serverName.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizeVatUpdateConcurrency(value: string | number | undefined): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_VAT_UPDATE_CONCURRENCY;
  }

  return Math.min(MAX_VAT_UPDATE_CONCURRENCY, Math.floor(parsed));
}

export function escapeSqlServerIdentifier(identifier: string): string {
  const trimmed = identifier.trim();
  if (!trimmed) {
    throw new Error('SQL Server identifier cannot be empty');
  }

  return `[${trimmed.split(']').join(']]')}]`;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const normalizedConcurrency = normalizeVatUpdateConcurrency(concurrency);
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.min(normalizedConcurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

async function findSentJpkVatInMonth(
  dataSource: DataSource,
  databaseName: string,
  start: Date,
  end: Date,
): Promise<JpkVatSentRow | null> {
  const escapedDatabaseName = escapeSqlServerIdentifier(databaseName);
  const rows = await dataSource.query<JpkVatSentRow[]>(
    `
      SELECT TOP 1
        JPK_JPKID,
        JPK_Typ,
        JPK_Status,
        JPK_StatusCode,
        JPK_StatusOpis,
        JPK_RefNr,
        TRY_CONVERT(datetime2, JPK_DataWyslania, 120) AS SentAt,
        TRY_CONVERT(datetime2, NULLIF(JPK_DataOdebrania, ''), 120) AS ReceivedAt,
        Jpk_Rok,
        Jpk_Miesiac
      FROM ${escapedDatabaseName}.CDN.PlikiJPK
      WHERE Jpk_KodFormularza = 'JPK_VAT'
        AND Jpk_Deklaracja = 1
        AND JPK_Typ LIKE 'JPK_V7%'
        AND JPK_Status = 3
        AND JPK_StatusCode = 200
        AND TRY_CONVERT(datetime2, JPK_DataWyslania, 120) >= @0
        AND TRY_CONVERT(datetime2, JPK_DataWyslania, 120) < @1
      ORDER BY TRY_CONVERT(datetime2, JPK_DataWyslania, 120) DESC, JPK_JPKID DESC
    `,
    [start, end],
  );

  return rows[0] ?? null;
}

export async function checkCompanyJpkVatDeclarationSentInCurrentMonth(
  company: Pick<CdnBazy, 'id' | 'name' | 'databaseName' | 'serverName'>,
  checkedAt = new Date(),
  dataSource?: DataSource,
): Promise<CompanyJpkVatStatusResult> {
  const { start, end, sentMonth } = monthRange(checkedAt);
  const baseResult = {
    companyId: company.id,
    companyName: company.name,
    databaseName: company.databaseName,
    serverName: normalizeServerName(company.serverName),
    sentMonth,
    checkedAt,
  };

  try {
    const sharedDs = dataSource ?? (await getOptimaConfigDataSource());

    if (!sharedDs) {
      return {
        ...baseResult,
        hasSent: false,
        lastError: 'Optima database connection is not configured',
      };
    }

    const sentRow = await findSentJpkVatInMonth(sharedDs, company.databaseName, start, end);

    if (!sentRow) {
      return {
        ...baseResult,
        hasSent: false,
      };
    }

    return {
      ...baseResult,
      hasSent: true,
      jpkFileId: sentRow.JPK_JPKID,
      periodYear: sentRow.Jpk_Rok ?? undefined,
      periodMonth: sentRow.Jpk_Miesiac ?? undefined,
      jpkType: sentRow.JPK_Typ,
      status: sentRow.JPK_Status ?? undefined,
      statusCode: sentRow.JPK_StatusCode ?? undefined,
      statusDescription: sentRow.JPK_StatusOpis ?? undefined,
      referenceNumber: sentRow.JPK_RefNr ?? undefined,
      sentAt: coerceDate(sentRow.SentAt),
      receivedAt: coerceDate(sentRow.ReceivedAt),
    };
  } catch (error) {
    return {
      ...baseResult,
      hasSent: false,
      lastError: error instanceof Error ? error.message : 'Unknown Optima query error',
    };
  }
}

export async function checkAllCompaniesJpkVatDeclarationSentInCurrentMonth(
  checkedAt = new Date(),
  options: { concurrency?: number } = {},
): Promise<CompanyJpkVatStatusResult[]> {
  const configDs = await getOptimaConfigDataSource();
  if (!configDs) {
    return [];
  }

  const companies = await configDs.getRepository(CdnBazy).find({
    where: { nieaktywna: 0 },
    order: { name: 'ASC' },
  });

  const concurrency = normalizeVatUpdateConcurrency(options.concurrency);
  const startedAt = Date.now();
  console.log(
    `[jobs] Checking JPK VAT declarations for ${companies.length} companies with concurrency ${concurrency}`,
  );

  const results = await mapWithConcurrency(companies, concurrency, async (company) => {
    const companyStartedAt = Date.now();
    const result = await checkCompanyJpkVatDeclarationSentInCurrentMonth(
      company,
      checkedAt,
      configDs,
    );
    const durationMs = Date.now() - companyStartedAt;

    if (durationMs >= SLOW_COMPANY_CHECK_MS) {
      console.warn(
        `[jobs] Slow JPK VAT declaration check for ${company.name} (${company.databaseName}) took ${durationMs}ms`,
      );
    }

    return result;
  });

  console.log(`[jobs] Finished MSSQL JPK VAT declaration checks in ${Date.now() - startedAt}ms`);

  return results;
}

function toJpkVatDeclarationStatusData(
  result: CompanyJpkVatStatusResult,
): Partial<JpkVatDeclarationStatus> {
  return {
    companyId: result.companyId,
    companyName: result.companyName,
    databaseName: result.databaseName,
    serverName: result.serverName ?? null,
    sentMonth: result.sentMonth,
    hasSent: result.hasSent,
    jpkFileId: result.jpkFileId ?? null,
    periodYear: result.periodYear ?? null,
    periodMonth: result.periodMonth ?? null,
    jpkType: result.jpkType ?? null,
    status: result.status ?? null,
    statusCode: result.statusCode ?? null,
    statusDescription: result.statusDescription ?? null,
    referenceNumber: result.referenceNumber ?? null,
    sentAt: result.sentAt ?? null,
    receivedAt: result.receivedAt ?? null,
    checkedAt: result.checkedAt,
    lastError: result.lastError ?? null,
  };
}

const JPK_VAT_DECLARATION_STATUS_UPSERT_COLUMNS = [
  'company_name',
  'database_name',
  'server_name',
  'has_sent',
  'jpk_file_id',
  'period_year',
  'period_month',
  'jpk_type',
  'status',
  'status_code',
  'status_description',
  'reference_number',
  'sent_at',
  'received_at',
  'checked_at',
  'last_error',
];

export async function saveJpkVatDeclarationStatusResults(
  results: CompanyJpkVatStatusResult[],
): Promise<JpkVatDeclarationStatus[]> {
  if (results.length === 0) {
    return [];
  }

  const db = await getDatabase();
  const repository = db.getRepository(JpkVatDeclarationStatus);
  const saveStartedAt = Date.now();
  const rows = results.map(toJpkVatDeclarationStatusData);

  await repository
    .createQueryBuilder()
    .insert()
    .into(JpkVatDeclarationStatus)
    .values(rows)
    .orUpdate(JPK_VAT_DECLARATION_STATUS_UPSERT_COLUMNS, ['company_id', 'sent_month'])
    .updateEntity(false)
    .execute();

  const saved = await repository.find({
    where: results.map((result) => ({
      companyId: result.companyId,
      sentMonth: result.sentMonth,
    })),
  });

  console.log(
    `[jobs] Saved ${saved.length} JPK VAT declaration statuses in ${Date.now() - saveStartedAt}ms`,
  );

  return saved;
}

export async function refreshJpkVatDeclarationStatuses(
  checkedAt = new Date(),
  options: { concurrency?: number } = {},
): Promise<JpkVatDeclarationStatus[]> {
  const startedAt = Date.now();
  const results = await checkAllCompaniesJpkVatDeclarationSentInCurrentMonth(checkedAt, options);
  const checkedDurationMs = Date.now() - startedAt;
  const saveStartedAt = Date.now();
  const saved = await saveJpkVatDeclarationStatusResults(results);

  console.log(
    `[jobs] Refreshed JPK VAT declaration statuses in ${Date.now() - startedAt}ms (checks ${checkedDurationMs}ms, save ${Date.now() - saveStartedAt}ms)`,
  );

  return saved;
}
