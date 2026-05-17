import type { DataSource } from 'typeorm';
import { getDatabase } from '../db/index.js';
import { CdnBazy } from '../db/optimaSchema.js';
import { JpkVatDeclarationStatus } from '../db/schema.js';
import { getOptimaCompanyDataSource, getOptimaConfigDataSource } from '../db/sqlserver.js';

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

async function findSentJpkVatInMonth(
  dataSource: DataSource,
  start: Date,
  end: Date,
): Promise<JpkVatSentRow | null> {
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
      FROM CDN.PlikiJPK
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
    const companyDs = await getOptimaCompanyDataSource({
      database: company.databaseName,
    });

    if (!companyDs) {
      return {
        ...baseResult,
        hasSent: false,
        lastError: 'Optima company database connection is not configured',
      };
    }

    const sentRow = await findSentJpkVatInMonth(companyDs, start, end);

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
): Promise<CompanyJpkVatStatusResult[]> {
  const configDs = await getOptimaConfigDataSource();
  if (!configDs) {
    return [];
  }

  const companies = await configDs.getRepository(CdnBazy).find({
    where: { nieaktywna: 0 },
    order: { name: 'ASC' },
  });

  const results: CompanyJpkVatStatusResult[] = [];
  for (const company of companies) {
    results.push(await checkCompanyJpkVatDeclarationSentInCurrentMonth(company, checkedAt));
  }

  return results;
}

export async function saveJpkVatDeclarationStatusResults(
  results: CompanyJpkVatStatusResult[],
): Promise<JpkVatDeclarationStatus[]> {
  const db = await getDatabase();
  const repository = db.getRepository(JpkVatDeclarationStatus);
  const saved: JpkVatDeclarationStatus[] = [];

  for (const result of results) {
    const existing = await repository.findOne({
      where: {
        companyId: result.companyId,
        sentMonth: result.sentMonth,
      },
    });

    const data: Partial<JpkVatDeclarationStatus> = {
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

    if (existing) {
      repository.merge(existing, data);
      saved.push(await repository.save(existing));
    } else {
      saved.push(await repository.save(repository.create(data)));
    }
  }

  return saved;
}

export async function refreshJpkVatDeclarationStatuses(
  checkedAt = new Date(),
): Promise<JpkVatDeclarationStatus[]> {
  const results = await checkAllCompaniesJpkVatDeclarationSentInCurrentMonth(checkedAt);
  return saveJpkVatDeclarationStatusResults(results);
}
