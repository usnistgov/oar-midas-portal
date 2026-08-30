/**
 * Material's default predicate concatenates every field, which turns the acls
 * object into "[object Object]" and makes "object" match every row.
 */
export function recordFilterPredicate(record: any, filter: string): boolean {
  return Object.keys(record)
    .filter(k => k !== 'acls')
    .reduce((acc, k) => acc + record[k] + '◬', '')
    .toLowerCase()
    .includes(filter);
}

export function getStatusClass(status: string): string {
  switch (status) {
    case 'published':
      return 'status-success';
    case 'edit':
      return 'status-warning';
    case 'reviewed':
      return 'status-info';
    default:
      return '';
  }
}