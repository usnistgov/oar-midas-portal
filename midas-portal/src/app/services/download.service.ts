import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, tap, of, map } from 'rxjs';
import { ConfigurationService } from 'oarng';
import { CredentialsService } from './credentials.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({ providedIn: 'root' })
export class DownloadService {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private credsService = inject(CredentialsService);
  
  constructor(private configService: ConfigurationService) {}

  private resolveApiUrl(configKey: string): string {
    return this.configService.getConfig()[configKey] || '';
  }
  /** Export records as JSON */
  downloadJSON(records: any[], filenamePrefix = 'records'): void {
    try {
      const json = JSON.stringify(records, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      this.downloadBlob(blob, `${filenamePrefix}_${this.dateString()}.json`);
    } catch {}
  }

  /** Export records as CSV */
  downloadCSV(records: any[], filenamePrefix = 'records'): void {
    try {
      if (!records.length) return;

      const headers = Object.keys(this.flattenObject(records[0]));
      const rows = records.map(rec => {
        const flat = this.flattenObject(rec);
        return headers.map(h => `"${(flat[h] ?? '').toString().replace(/"/g, '""')}"`).join(',');
      });

      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      this.downloadBlob(blob, `${filenamePrefix}_${this.dateString()}.csv`);
    } catch {}
  }

  /** Export records as CSV */
  downloadmarkdown(records: any[], filenamePrefix = 'records'): void {
    try {
      if (!records.length) return;

      const headers = Object.keys(this.flattenObject(records[0]));
      const rows = records.map(rec => {
        const flat = this.flattenObject(rec);
        return headers.map(h => `"${(flat[h] ?? '').toString().replace(/"/g, '""')}"`).join(',');
      });

      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      this.downloadBlob(blob, `${filenamePrefix}_${this.dateString()}.csv`);
    } catch {}
  }

  /** Export records as PDF using jsPDF + autoTable */
  downloadPDF(records: any[], filenamePrefix = 'records'): void {
    try {
      if (!records.length) return;

      const doc = new jsPDF();
      const headers = ['Type', 'ID', 'Name', 'Owner', 'Primary Contact', 'Org Unit', 'Status', 'Modified'];
      const body = records.map(r => [
        r.type ?? '—',
        r.id ?? '—',
        r.name ?? '—',
        r.owner ?? '—',
        r.primaryContact ?? '—',
        r.organizationUnit ?? '—',
        r.status ?? '—',
        r.modifiedDate ? new Date(r.modifiedDate).toLocaleDateString() : '—'
      ]);

      doc.setFontSize(14);
      doc.text('Record Export', 105, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Total Records: ${records.length}`, 105, 22, { align: 'center' });

      autoTable(doc, {
        head: [headers],
        body,
        startY: 30,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [63, 81, 181], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      doc.save(`${filenamePrefix}_${this.dateString()}.pdf`);
    } catch {}
  }

  /** Flattens nested objects for CSV export */
  private flattenObject(obj: any, prefix = '', delim = '_'): any {
    return Object.entries(obj).reduce((acc, [key, val]) => {
      const newKey = prefix ? `${prefix}${delim}${key}` : key;
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        Object.assign(acc, this.flattenObject(val, newKey, delim));
      } else {
        acc[newKey] = Array.isArray(val) ? val.join('; ') : val;
      }
      return acc;
    }, {} as Record<string, any>);
  }

  /** Creates a temporary download for the Blob */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  /** Gets today's date in yyyy-mm-dd format */
  private dateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  // === API ENDPOINT METHODS ===

  /**
   * Download records by IDs in the specified format.
   * Handles both DMP and DAP records automatically.
   */
  downloadRecords(records: any[], format: 'json' | 'pdf' | 'markdown' | 'csv' = 'json', filename?: string): Observable<void> {
    const groupedRecords = this.groupRecordsByType(records);
    const downloadPromises: Observable<any>[] = [];

    if (groupedRecords.dmp.length > 0) {
      const dmpIds = groupedRecords.dmp.map(r => r.id);
      downloadPromises.push(this.downloadFromEndpoint('dmpAPI', dmpIds, 'DMP', format));
    }

    if (groupedRecords.dap.length > 0) {
      const dapIds = groupedRecords.dap.map(r => r.id);
      downloadPromises.push(this.downloadFromEndpoint('dapAPI', dapIds, 'DAP', format));
    }

    if (downloadPromises.length === 0) {
      this.snackBar.open('No valid records to download', 'Dismiss', { duration: 3000 });
      return of(void 0);
    }

    return new Observable(observer => {
      let completedCount = 0;
      const allJsonResults: any[] = [];

      downloadPromises.forEach(download$ => {
        download$.subscribe({
          next: (result) => {
            if (format === 'json' && Array.isArray(result)) {
              allJsonResults.push(...result);
            }
            completedCount++;

            if (completedCount === downloadPromises.length) {
              if (format === 'json') {
                this.handleJsonCompletion(records, allJsonResults, filename);
              } else {
                this.snackBar.open(`Downloaded ${format.toUpperCase()} files`, 'Dismiss', { duration: 3000 });
              }
              observer.next();
              observer.complete();
            }
          },
          error: (err) => observer.error(err)
        });
      });
    });
  }

  private handleJsonCompletion(records: any[], allResults: any[], filename?: string): void {
    const requestedIds = records.map(r => r.id);

    if (allResults.length === 0) {
      this.snackBar.open('No records found for the requested IDs', 'Dismiss', { duration: 3000 });
      return;
    }

    const returnedIds = allResults.map(r => r.id);
    const missingIds = requestedIds.filter(id => !returnedIds.includes(id));
    if (missingIds.length > 0) {
      this.snackBar.open(`${missingIds.length} record(s) not found: ${missingIds.join(', ')}`, 'Dismiss', { duration: 5000 });
    }

    this.createJsonDownload(allResults, filename || `records-${this.dateString()}.json`);
    this.snackBar.open(`Downloaded ${allResults.length} of ${requestedIds.length} records`, 'Dismiss', { duration: 3000 });
  }

  /**
   * Create and trigger JSON file download (for API responses)
   */
  private createJsonDownload(data: any[], filename: string): void {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      this.downloadBlob(blob, filename);
    } catch {
      this.snackBar.open('Failed to create JSON file', 'Dismiss', { duration: 3000 });
    }
  }

  /**
   * Extract IDs from selected records
   */
  extractIds(records: any[]): string[] {
    return records.map(record => record.id).filter(id => id);
  }

  /**
   * Group records by type (dmp/dap)
   */
  private groupRecordsByType(records: any[]): { dmp: any[], dap: any[] } {
    return records.reduce((groups, record) => {
      const type = this.getRecordType(record);
      if (type === 'dmp') {
        groups.dmp.push(record);
      } else if (type === 'dap') {
        groups.dap.push(record);
      }
      return groups;
    }, { dmp: [] as any[], dap: [] as any[] });
  }

  /**
   * Determine record type based on record properties
   */
  private getRecordType(record: any): 'dmp' | 'dap' | 'unknown' {
    // Check if record has type property
    if (record.type) {
      return record.type.toLowerCase() === 'dmp' ? 'dmp' : 'dap';
    }
    
    // Fallback: check for DAP-specific properties
    if (record.location !== undefined) {
      return 'dap';
    }
    
    // Fallback: check for DMP-specific properties  
    if (record.organizationUnit !== undefined || record.hasPublication !== undefined) {
      return 'dmp';
    }
    
    // Default to DMP if can't determine
    return 'dmp';
  }

  /**
   * Download records from a unified API endpoint.
   * Without format (or format='json'), returns JSON array.
   * With format='pdf'|'markdown'|'csv', returns a Blob and triggers file download.
   */
  private downloadFromEndpoint(apiKey: string, ids: string[], recordType: string, format?: 'json' | 'pdf' | 'markdown' | 'csv'): Observable<any> {
    const authToken = this.credsService.token();
    const headers = { Authorization: `Bearer ${authToken}` };

    const baseApi = this.resolveApiUrl(apiKey).replace(/\/$/, '');
    let url = `${baseApi}?id=${ids.join(',')}`;
    if (format && format !== 'json') {
      url += `&format=${format}`;
    }

    // Non-JSON formats: request as blob
    if (format && format !== 'json') {
      return this.http.get(url, {
        headers,
        responseType: 'blob',
        observe: 'response'
      }).pipe(
        tap((response: HttpResponse<Blob>) => {
          const blob = response.body;
          if (blob && blob.size > 0) {
            blob.arrayBuffer().then(buffer => {
              const mimeTypes: Record<string, string> = {
                pdf: 'application/pdf',
                markdown: 'text/markdown',
                csv: 'text/csv'
              };
              const finalBlob = new Blob([buffer], { type: mimeTypes[format] || 'application/octet-stream' });
              const ext = format === 'markdown' ? 'md' : format;
              this.downloadBlob(finalBlob, `${recordType.toLowerCase()}-${this.dateString()}.${ext}`);
            }).catch(() => {});
          } else {
            this.snackBar.open(`No ${recordType} records found for export`, 'Dismiss', { duration: 3000 });
          }
        }),
        map(response => response.body || new Blob()),
        catchError(() => {
          this.snackBar.open(`${recordType} ${format.toUpperCase()} download failed`, 'Dismiss', { duration: 3000 });
          return of(new Blob());
        })
      );
    }

    // JSON (default)
    return this.http.get<any[]>(url, { headers }).pipe(
      catchError(() => {
        this.snackBar.open(`${recordType} download failed`, 'Dismiss', { duration: 3000 });
        return of([]);
      })
    );
  }

  /**
   * Validate that we have valid records for download
   */
  validateSelection(selectedRecords: any[]): boolean {
    if (!selectedRecords || selectedRecords.length === 0) {
      this.snackBar.open('Please select records to download', 'Dismiss', { duration: 3000 });
      return false;
    }

    const ids = this.extractIds(selectedRecords);
    if (ids.length === 0) {
      this.snackBar.open('Selected records have no valid IDs', 'Dismiss', { duration: 3000 });
      return false;
    }

    return true;
  }
}
