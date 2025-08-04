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