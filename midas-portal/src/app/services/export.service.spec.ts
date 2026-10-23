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

    // an export is the record as it is held, acls included
    it('writes the acls out with everything else', () => {
      service.exportCSV([
        { id: 'a', name: 'First', acls: { read: ['atl1', 'grp0:public'], write: ['atl1'] } }
      ]);

      expect(csv).toContain('acls');
      expect(csv).toContain('grp0:public');
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

  describe('exportJSON', () => {
    let json: string;

    beforeEach(() => {
      json = '';
      jest.spyOn(service as any, 'downloadBlob').mockImplementation((blob: any) => {
        json = (blob as any)._text ?? '';
      });
      (global as any).Blob = class {
        _text: string;
        constructor(parts: string[]) { this._text = parts.join(''); }
      };
    });

    // the export is the record as held, so round-tripping it must lose nothing
    it('writes every field of the record, acls included', () => {
      const record = {
        id: 'mdm1:0005',
        name: 'CHIPS',
        owner: 'jlau',
        status: 'edit',
        acls: { read: ['atl1', 'grp0:public'], write: ['atl1'], admin: [], delete: [] },
        data: { nested: { deep: true } }
      };

      service.exportJSON([record]);

      expect(JSON.parse(json)).toEqual([record]);
    });

    it('keeps acls for every record, not just the first', () => {
      service.exportJSON([
        { id: 'a', acls: { read: ['x'] } },
        { id: 'b', acls: { read: ['y'] } }
      ]);

      expect(JSON.parse(json).map((r: any) => r.acls.read[0])).toEqual(['x', 'y']);
    });
  });
});
