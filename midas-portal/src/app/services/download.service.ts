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
    } catch (err) {
      console.error('JSON export failed:', err);
    }
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
    } catch (err) {
      console.error('CSV export failed:', err);
    }
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
    } catch (err) {
      console.error('CSV export failed:', err);
    }
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
      // TODO: addthe filters used to the header of the pdf document.

      autoTable(doc, {
        head: [headers],
        body,
        startY: 30,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [63, 81, 181], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      doc.save(`${filenamePrefix}_${this.dateString()}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
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
   * Download records by IDs as JSON using the appropriate :ids endpoints
   */
  downloadRecordsAsJson(records: any[], filename?: string): Observable<any[]> {
    const groupedRecords = this.groupRecordsByType(records);
    const downloadPromises: Observable<any[]>[] = [];
    
    console.log('📥 Downloading records as JSON:', {
      dmpCount: groupedRecords.dmp.length,
      dapCount: groupedRecords.dap.length,
      totalCount: records.length
    });

    // Download DMP records if any
    if (groupedRecords.dmp.length > 0) {
      const dmpIds = groupedRecords.dmp.map(r => r.id);
      downloadPromises.push(this.downloadFromEndpoint('dmpAPI', dmpIds, 'DMP'));
    }

    // Download DAP records if any
    if (groupedRecords.dap.length > 0) {
      const dapIds = groupedRecords.dap.map(r => r.id);
      downloadPromises.push(this.downloadFromEndpoint('dapAPI', dapIds, 'DAP'));
    }

    if (downloadPromises.length === 0) {
      this.snackBar.open('No valid records to download', 'Dismiss', { duration: 3000 });
      return of([]);
    }

    // Execute all downloads and combine results
    return new Observable(observer => {
      const allResults: any[] = [];
      let completedCount = 0;
      
      downloadPromises.forEach(download$ => {
        download$.subscribe({
          next: (results) => {
            allResults.push(...results);
            completedCount++;
            
            if (completedCount === downloadPromises.length) {
              // All downloads complete - create combined file
              if (allResults.length > 0) {
                this.createJsonDownload(allResults, filename || `records-${this.dateString()}.json`);
                console.log(`✅ Downloaded ${allResults.length} total records`);
                this.snackBar.open(`Downloaded ${allResults.length} records`, 'Dismiss', { duration: 3000 });
              }
              observer.next(allResults);
              observer.complete();
            }
          },
          error: (err) => {
            console.error('❌ Download failed:', err);
            observer.error(err);
          }
        });
      });
    });
  }

  /**
   * Download records by IDs as PDF/Markdown using the appropriate :export endpoints
   */
  downloadRecordsAsExport(records: any[], format: 'pdf' | 'markdown' | 'csv', filename?: string): Observable<Blob> {
    const groupedRecords = this.groupRecordsByType(records);
    const downloadPromises: Observable<Blob>[] = [];
    
    console.log(`📥 Downloading records as ${format.toUpperCase()}:`, {
      dmpCount: groupedRecords.dmp.length,
      dapCount: groupedRecords.dap.length,
      totalCount: records.length
    });

    // Download DMP records if any
    if (groupedRecords.dmp.length > 0) {
      const dmpIds = groupedRecords.dmp.map(r => r.id);
      downloadPromises.push(this.downloadExportFromEndpoint('dmpAPI', dmpIds, format, 'DMP'));
    }

    // Download DAP records if any
    if (groupedRecords.dap.length > 0) {
      const dapIds = groupedRecords.dap.map(r => r.id);
      downloadPromises.push(this.downloadExportFromEndpoint('dapAPI', dapIds, format, 'DAP'));
    }

    if (downloadPromises.length === 0) {
      this.snackBar.open('No valid records to download', 'Dismiss', { duration: 3000 });
      return of(new Blob());
    }

    // Execute all downloads - downloads are handled within downloadExportFromEndpoint
    return new Observable(observer => {
      let completedCount = 0;
      
      downloadPromises.forEach((download$) => {
        download$.subscribe({
          next: (blob) => {
            completedCount++;
            
            if (completedCount === downloadPromises.length) {
              console.log(`✅ Downloaded ${format} files for all record types`);
              this.snackBar.open(`Downloaded ${format.toUpperCase()} files`, 'Dismiss', { duration: 3000 });
              observer.next(new Blob()); // Return empty blob since downloads are handled internally
              observer.complete();
            }
          },
          error: (err) => {
            console.error(`❌ ${format} download failed:`, err);
            observer.error(err);
          }
        });
      });
    });
  }

  /**
   * Create and trigger JSON file download (for API responses)
   */
  private createJsonDownload(data: any[], filename: string): void {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      this.downloadBlob(blob, filename);
    } catch (error) {
      console.error('❌ Failed to create JSON download:', error);
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
    console.warn('⚠️ Could not determine record type, defaulting to DMP:', record);
    return 'dmp';
  }

  /**
   * Download JSON data from a specific API endpoint
   */
  private downloadFromEndpoint(apiKey: string, ids: string[], recordType: string): Observable<any[]> {
    const authToken = this.credsService.token();
    const headers = { Authorization: `Bearer ${authToken}` };
    
    const baseApi = this.resolveApiUrl(apiKey).replace(/\/$/, '');
    const url = `${baseApi}/:ids?ids=${ids.join(',')}`;
    
    console.log(`📥 Downloading ${recordType} records from:`, url);
    console.log(`📋 ${recordType} IDs:`, ids);
    
    return this.http.get<any[]>(url, { headers }).pipe(
      tap(records => {
        console.log(`✅ Downloaded ${records.length} ${recordType} records`);
      }),
      catchError(err => {
        console.error(`❌ ${recordType} download failed:`, err);
        this.snackBar.open(`${recordType} download failed`, 'Dismiss', { duration: 3000 });
        return of([]);
      })
    );
  }

  /**
   * Download export data from a specific API endpoint
   */
  private downloadExportFromEndpoint(apiKey: string, ids: string[], format: 'pdf' | 'markdown' | 'csv', recordType: string): Observable<Blob> {
    const authToken = this.credsService.token();
    const headers = { Authorization: `Bearer ${authToken}` };
    
    const baseApi = this.resolveApiUrl(apiKey).replace(/\/$/, '');
    const url = `${baseApi}/:export?ids=${ids.join(',')}&format=${format}`;
    
    console.log(`📥 Downloading ${recordType} records as ${format.toUpperCase()} from:`, url);
    console.log(`📋 ${recordType} IDs:`, ids);
    
    return this.http.get(url, { 
      headers, 
      responseType: 'blob',
      observe: 'response' // Get full response to see headers
    }).pipe(
      tap((response: HttpResponse<Blob>) => {
        console.log(`🔍 Response headers for ${recordType} ${format}:`, response.headers);
        console.log(`🔍 Response status for ${recordType} ${format}:`, response.status);
        console.log(`🔍 Response body type for ${recordType} ${format}:`, typeof response.body);
        console.log(`🔍 Response body for ${recordType} ${format}:`, response.body);
        
        const blob = response.body;
        if (blob && blob.size > 0) {
          console.log(`📦 Blob details for ${recordType} ${format}:`, {
            size: blob.size,
            type: blob.type
          });
          
          // Let's examine the blob content
          blob.arrayBuffer().then(buffer => {
            const bytes = new Uint8Array(buffer);
            console.log(`📄 First 100 bytes of ${recordType} ${format}:`, Array.from(bytes.slice(0, 100)));
            console.log(`📄 Last 20 bytes of ${recordType} ${format}:`, Array.from(bytes.slice(-20)));
            
            // Check if it looks like PDF (starts with %PDF)
            const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
            console.log(`🔍 Looks like PDF for ${recordType}:`, isPdf);
            
            // Try to create the file download
            try {
              // Create a new blob with explicit type
              const finalBlob = format === 'pdf' 
                ? new Blob([buffer], { type: 'application/pdf' })
                : new Blob([buffer], { type: 'text/markdown' });
              
              console.log(`📦 Final blob for ${recordType} ${format}:`, {
                size: finalBlob.size,
                type: finalBlob.type
              });
              
              // Force download
              const url = window.URL.createObjectURL(finalBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${recordType.toLowerCase()}-${this.dateString()}.${format === 'markdown' ? 'md' : format}`;
              link.style.display = 'none';
              
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              window.URL.revokeObjectURL(url);
              
              console.log(`✅ Downloaded ${format} file for ${recordType} (${finalBlob.size} bytes)`);
            } catch (downloadError) {
              console.error(`❌ Error creating download for ${recordType} ${format}:`, downloadError);
            }
          }).catch(bufferError => {
            console.error(`❌ Error reading buffer for ${recordType} ${format}:`, bufferError);
          });
        } else {
          console.warn(`⚠️ Empty or null blob for ${recordType} ${format}`);
        }
      }),
      map(response => response.body || new Blob()),
      catchError(err => {
        console.error(`❌ ${recordType} ${format} download failed:`, err);
        console.error(`❌ Error details:`, {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error
        });
        this.snackBar.open(`${recordType} ${format.toUpperCase()} download failed`, 'Dismiss', { duration: 3000 });
        return of(new Blob());
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
