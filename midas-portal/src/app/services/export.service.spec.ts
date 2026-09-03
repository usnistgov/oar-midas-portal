import { TestBed } from '@angular/core/testing';

import { ExportService } from './export.service';

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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
