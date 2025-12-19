import "./Table.scss";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export default function Table<T>({ columns, data, keyExtractor, onRowClick, loading, emptyMessage = "데이터가 없습니다" }: TableProps<T>) {
  if (loading) {
    return (
      <div className="table-loading">
        <div className="table-loading__spinner" />
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={keyExtractor(item)} onClick={() => onRowClick?.(item)} className={onRowClick ? "table__row--clickable" : ""}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(item) : (item as Record<string, unknown>)[col.key]?.toString()}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
