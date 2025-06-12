import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({ providedIn: 'root' })
export class ExportService {
  /** Export records as JSON */
  exportJSON(records: any[], filenamePrefix = 'records'): void {
    try {
      const json = JSON.stringify(records, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      this.downloadBlob(blob, `${filenamePrefix}_${this.dateString()}.json`);
    } catch (err) {
      console.error('JSON export failed:', err);
    }
  }

  /** Export records as CSV */
  exportCSV(records: any[], filenamePrefix = 'records'): void {
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
  exportPDF(records: any[], filenamePrefix = 'records'): void {
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
}
