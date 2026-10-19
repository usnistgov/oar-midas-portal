import { TestBed } from '@angular/core/testing';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { inflateSync } from 'zlib';

import { ExportService } from './export.service';

// the CSV tests below swap the global Blob and do not put it back
const RealBlob = (global as any).Blob;

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('exportPDF', () => {
    const RECORD = {
      type: 'dmp', id: 'mdm1:0005', name: 'CHIPS 1.01 - 2D and WBG Reliability',
      owner: 'jlau', primaryContact: 'Lau, Jonathan', organizationUnit: 'MML',
      status: 'edit', modifiedDate: '2026-01-02'
    };

    const realObjectUrls = {
      create: (URL as any).createObjectURL,
      revoke: (URL as any).revokeObjectURL
    };

    beforeEach(() => {
      (global as any).Blob = RealBlob;
      // jsdom implements no object URLs, which is the only thing stopping save()
      (URL as any).createObjectURL = jest.fn(() => 'blob:test');
      (URL as any).revokeObjectURL = jest.fn();
    });

    afterEach(() => {
      (URL as any).createObjectURL = realObjectUrls.create;
      (URL as any).revokeObjectURL = realObjectUrls.revoke;
    });

    // jsPDF assigns save() and output() onto each instance, so there is nothing to
    // intercept before construction; drive the same calls the service makes instead.
    // A breaking change in jsPDF or autoTable shows up here, not when somebody
    // clicks Export.
    const buildPdf = (rows: string[][]): Buffer => {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text('Record Export', 105, 15, { align: 'center' });
      autoTable(doc, {
        head: [['Type', 'ID', 'Name', 'Owner', 'Primary Contact', 'Org Unit', 'Status', 'Modified']],
        body: rows,
        startY: 30,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [63, 81, 181], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
      return Buffer.from(doc.output('arraybuffer'));
    };

    // the page content lives in deflated streams
    const readableText = (pdf: Buffer): string => {
      const raw = pdf.toString('latin1');
      let text = '';
      for (const match of raw.matchAll(/stream\r?\n([\s\S]*?)endstream/g)) {
        try {
          text += inflateSync(Buffer.from(match[1], 'latin1')).toString('latin1');
        } catch {
          text += match[1];
        }
      }
      return text;
    };

    const ROW = [RECORD.type, RECORD.id, RECORD.name, RECORD.owner,
                 RECORD.primaryContact, RECORD.organizationUnit, RECORD.status, RECORD.modifiedDate];

    it('writes the record into the pdf, not just an empty document', () => {
      const withRow = buildPdf([ROW]);
      const withoutRows = buildPdf([]);

      expect(withRow.toString('latin1').startsWith('%PDF')).toBe(true);
      // an empty table would still produce a valid pdf, so check the row is in it
      expect(readableText(withRow)).toContain('CHIPS 1.01');
      expect(withRow.length).toBeGreaterThan(withoutRows.length);
    });

    it('exports a record without failing', () => {
      const failures: unknown[] = [];
      const logged = jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
        if (String(args[0]).includes('PDF export failed')) failures.push(args);
      });

      service.exportPDF([RECORD]);

      expect(failures).toEqual([]);
      expect(URL.createObjectURL).toHaveBeenCalled();
      logged.mockRestore();
    });

    it('writes nothing when there are no records', () => {
      service.exportPDF([]);

      expect(URL.createObjectURL).not.toHaveBeenCalled();
    });
  });

  describe('exportCSV', () => {
    let csv: string;

    beforeEach(() => {
      csv = '';
      jest.spyOn(service as any, 'downloadBlob').mockImplementation((blob: any) => {
        csv = (blob as any)._text ?? '';
      });
      // Blob text isn't readable synchronously in jsdom; capture the content instead.
      (global as any).Blob = class {
        _text: string;
        constructor(parts: string[]) { this._text = parts.join(''); }
      };
    });

    it('includes fields missing from the first record', () => {
      service.exportCSV([
        { id: 'a', name: 'First' },
        { id: 'b', name: 'Second', fundingNumber: 'F-1' }
      ]);

      const [header, , second] = csv.split('\n');
      expect(header).toContain('fundingNumber');
      expect(second).toContain('F-1');
    });

    it('never writes acl subject lists into the file', () => {
      service.exportCSV([
        { id: 'a', name: 'First', acls: { read: ['atl1', 'grp0:public'], write: ['atl1'] } }
      ]);

      expect(csv).not.toContain('acls');
      expect(csv).not.toContain('grp0:public');
    });

    it('leaves the cell empty for records lacking a field', () => {
      service.exportCSV([
        { id: 'a', name: 'First' },
        { id: 'b', name: 'Second', fundingNumber: 'F-1' }
      ]);

      const rows = csv.split('\n');
      expect(rows[1]).toBe('"a","First",""');
    });
  });
});
