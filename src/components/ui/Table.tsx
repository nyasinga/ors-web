import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { EmptyState } from "./EmptyState";

type Column<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: string;
  className?: string;
};

export function Table<T>({ columns, rows, rowKey, empty = "No records", className }: Props<T>) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-lg border border-slate-200", className)}>
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-soft text-xs uppercase tracking-wide text-mute">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={cn("whitespace-nowrap px-3 py-3 font-semibold", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-4">
                <EmptyState compact title="Empty" description={empty === "No records" ? "Nothing found. Please check again." : empty} />
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)} className="border-t border-slate-100 hover:bg-slate-50/80">
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-3 py-3 text-ink", col.className)}>
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
