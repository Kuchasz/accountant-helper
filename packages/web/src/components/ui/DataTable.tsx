import { ArrowDown, ArrowUp, ArrowsDownUp } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { useState } from 'react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number | null;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
}

const SKELETON_KEYS = ['sk1', 'sk2', 'sk3', 'sk4', 'sk5', 'sk6', 'sk7', 'sk8'];

export function DataTable<T,>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const col = columns.find((c) => c.key === sortKey);
        if (!col?.sortValue) return 0;
        const av = col.sortValue(a);
        const bv = col.sortValue(b);
        if (av === null && bv === null) return 0;
        if (av === null) return 1;
        if (bv === null) return -1;
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap ${col.headerClassName ?? ''}`}
              >
                {col.sortable ? (
                  <button
                    type="button"
                    onClick={() => handleSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer bg-transparent border-0 p-0 font-semibold uppercase tracking-wider text-xs"
                  >
                    {col.header}
                    {sortKey === col.key ? (
                      sortDir === 'asc' ? (
                        <ArrowUp size={12} weight="bold" />
                      ) : (
                        <ArrowDown size={12} weight="bold" />
                      )
                    ) : (
                      <ArrowsDownUp size={12} className="opacity-40" />
                    )}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            SKELETON_KEYS.map((k) => (
              <tr key={k} className="border-b border-gray-100 dark:border-gray-800">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 ${col.className ?? ''}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
