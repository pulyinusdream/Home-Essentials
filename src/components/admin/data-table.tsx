import type { ReactNode } from "react";

export function AdminDataTable({
  caption,
  headers,
  children,
}: {
  caption: string;
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
