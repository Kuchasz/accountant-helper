import type { DataSource } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDatabase } from '../db/index.js';
import { getOptimaConfigDataSource } from '../db/sqlserver.js';
import {
  checkAllCompaniesJpkVatDeclarationSentInCurrentMonth,
  checkCompanyJpkVatDeclarationSentInCurrentMonth,
  escapeSqlServerIdentifier,
  normalizeVatUpdateConcurrency,
  saveJpkVatDeclarationStatusResults,
} from './jpkVatDeclarationStatus.js';

vi.mock('../db/index.js', () => ({
  getDatabase: vi.fn(),
}));

vi.mock('../db/sqlserver.js', () => ({
  getOptimaConfigDataSource: vi.fn(),
}));

const mockedGetDatabase = vi.mocked(getDatabase);
const mockedGetOptimaConfigDataSource = vi.mocked(getOptimaConfigDataSource);

describe('escapeSqlServerIdentifier', () => {
  it('wraps database names in SQL Server brackets', () => {
    expect(escapeSqlServerIdentifier('OptimaCompany')).toBe('[OptimaCompany]');
  });

  it('escapes closing brackets inside database names', () => {
    expect(escapeSqlServerIdentifier('Optima]Company')).toBe('[Optima]]Company]');
  });

  it('rejects empty database names', () => {
    expect(() => escapeSqlServerIdentifier('   ')).toThrow('SQL Server identifier cannot be empty');
  });
});

describe('normalizeVatUpdateConcurrency', () => {
  it('defaults invalid values to the conservative concurrency', () => {
    expect(normalizeVatUpdateConcurrency(undefined)).toBe(5);
    expect(normalizeVatUpdateConcurrency('nope')).toBe(5);
    expect(normalizeVatUpdateConcurrency(0)).toBe(5);
  });

  it('floors and caps configured concurrency', () => {
    expect(normalizeVatUpdateConcurrency('3')).toBe(3);
    expect(normalizeVatUpdateConcurrency(3.9)).toBe(3);
    expect(normalizeVatUpdateConcurrency('20')).toBe(10);
  });
});

describe('JPK VAT declaration status checks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('queries a company through the shared datasource using a qualified database name', async () => {
    const query = vi.fn().mockResolvedValue([]);
    const result = await checkCompanyJpkVatDeclarationSentInCurrentMonth(
      {
        id: 7,
        name: 'Company A',
        databaseName: 'Optima_A',
        serverName: 'sql-01',
      },
      new Date('2026-05-18T10:00:00Z'),
      { query } as unknown as DataSource,
    );

    expect(result.hasSent).toBe(false);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).toContain('FROM [Optima_A].CDN.PlikiJPK');
  });

  it('returns a company-level error when the shared query fails', async () => {
    const query = vi.fn().mockRejectedValue(new Error('permission denied'));
    const result = await checkCompanyJpkVatDeclarationSentInCurrentMonth(
      {
        id: 8,
        name: 'Company B',
        databaseName: 'Optima_B',
        serverName: '',
      },
      new Date('2026-05-18T10:00:00Z'),
      { query } as unknown as DataSource,
    );

    expect(result.hasSent).toBe(false);
    expect(result.lastError).toBe('permission denied');
  });

  it('checks all companies through one shared datasource with bounded concurrency', async () => {
    let activeQueries = 0;
    let maxActiveQueries = 0;
    const companies = Array.from({ length: 5 }, (_, index) => ({
      id: index + 1,
      name: `Company ${index + 1}`,
      databaseName: `Optima_${index + 1}`,
      serverName: 'sql-01',
    }));
    const query = vi.fn(async () => {
      activeQueries += 1;
      maxActiveQueries = Math.max(maxActiveQueries, activeQueries);
      await new Promise((resolve) => setTimeout(resolve, 5));
      activeQueries -= 1;
      return [];
    });

    mockedGetOptimaConfigDataSource.mockResolvedValue({
      getRepository: vi.fn(() => ({
        find: vi.fn().mockResolvedValue(companies),
      })),
      query,
    } as unknown as DataSource);

    const results = await checkAllCompaniesJpkVatDeclarationSentInCurrentMonth(
      new Date('2026-05-18T10:00:00Z'),
      { concurrency: 2 },
    );

    expect(results).toHaveLength(companies.length);
    expect(query).toHaveBeenCalledTimes(companies.length);
    expect(maxActiveQueries).toBeLessThanOrEqual(2);
  });
});

describe('saveJpkVatDeclarationStatusResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists status rows with a bulk upsert', async () => {
    const upsert = vi.fn().mockResolvedValue(undefined);
    const find = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]);
    mockedGetDatabase.mockResolvedValue({
      getRepository: vi.fn(() => ({
        upsert,
        find,
      })),
    } as never);

    const checkedAt = new Date('2026-05-18T10:00:00Z');
    const saved = await saveJpkVatDeclarationStatusResults([
      {
        companyId: 1,
        companyName: 'Company A',
        databaseName: 'Optima_A',
        sentMonth: '2026-05',
        hasSent: true,
        checkedAt,
      },
      {
        companyId: 2,
        companyName: 'Company B',
        databaseName: 'Optima_B',
        sentMonth: '2026-05',
        hasSent: false,
        checkedAt,
        lastError: 'permission denied',
      },
    ]);

    expect(saved).toEqual([{ id: 1 }, { id: 2 }]);
    expect(upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ companyId: 1, hasSent: true }),
        expect.objectContaining({ companyId: 2, hasSent: false }),
      ]),
      ['companyId', 'sentMonth'],
    );
    expect(find).toHaveBeenCalledWith({
      where: [
        { companyId: 1, sentMonth: '2026-05' },
        { companyId: 2, sentMonth: '2026-05' },
      ],
    });
  });
});
