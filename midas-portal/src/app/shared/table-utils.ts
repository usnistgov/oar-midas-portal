/**
 * Material's default predicate stringifies every field with `+`, so a record
 * matches on things the user never sees: "[object Object]" from acls, the
 * timezone name inside a Date, and the literal "undefined" from unset fields.
 */
export function recordFilterPredicate(record: any, filter: string): boolean {
  return Object.values(record)
    .map(searchableText)
    .join('◬')
    .toLowerCase()
    .includes(filter);
}

function searchableText(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toLocaleDateString();
  if (Array.isArray(value)) return value.join(' ');
  if (typeof value === 'object') return '';
  return String(value);
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