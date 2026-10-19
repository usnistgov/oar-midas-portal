import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { signal } from '@angular/core';
import { ConfigurationService } from 'oarng';
import { DownloadService } from './download.service';
import { CredentialsService } from './credentials.service';
import { readablePdfText } from '../../testing/pdf-content';

const CONFIG: Record<string, string> = {
  dmpAPI: 'https://api.test/dmp/mdm1',
  dapAPI: 'https://api.test/dap/mds3',
};

describe('DownloadService', () => {
  let service: DownloadService;
  let httpMock: HttpTestingController;
  let snack: { open: jest.Mock };
  let created: { data: any[]; filename: string } | null;

  beforeEach(() => {
    snack = { open: jest.fn() };
    created = null;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DownloadService,
        { provide: MatSnackBar, useValue: snack },
        { provide: ConfigurationService, useValue: { getConfig: () => CONFIG } },
        { provide: CredentialsService, useValue: { token: signal('tok') } },
      ]
    });

    service = TestBed.inject(DownloadService);
    httpMock = TestBed.inject(HttpTestingController);
    // downloadBlob touches the DOM; capture what would have been written instead.
    jest.spyOn(service as any, 'createJsonDownload')
      .mockImplementation((data: any, filename: any) => { created = { data, filename }; });
  });

  const mixedSelection = [
    { id: 'mdm1:0001', type: 'DMP' },
    { id: 'mds3:0009', type: 'DAP' },
  ];

  // A failing record type used to abandon the whole export, discarding the
  // records that had already come back successfully.
  it('still writes the records that succeeded when the other type fails', () => {
    service.downloadRecords(mixedSelection, 'json').subscribe({ error: () => undefined });

    httpMock.expectOne(r => r.url.includes('/dmp/')).flush([{ id: 'mdm1:0001', name: 'Kept' }]);
    httpMock.expectOne(r => r.url.includes('/dap/'))
      .flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(created).not.toBeNull();
    expect(created!.data.map(r => r.id)).toEqual(['mdm1:0001']);
  });

  it('reports the failure reason to the user', () => {
    service.downloadRecords(mixedSelection, 'json').subscribe({ error: () => undefined });

    httpMock.expectOne(r => r.url.includes('/dmp/')).flush([{ id: 'mdm1:0001' }]);
    httpMock.expectOne(r => r.url.includes('/dap/'))
      .flush({}, { status: 500, statusText: 'Server Error' });

    const messages = snack.open.mock.calls.map(c => c[0]).join(' | ');
    expect(messages).toContain('failed');
    expect(messages).toContain('500');
  });

  it('writes nothing when every request fails', () => {
    service.downloadRecords(mixedSelection, 'json').subscribe({ error: () => undefined });

    httpMock.expectOne(r => r.url.includes('/dmp/')).flush({}, { status: 500, statusText: 'err' });
    httpMock.expectOne(r => r.url.includes('/dap/')).flush({}, { status: 500, statusText: 'err' });

    expect(created).toBeNull();
  });

  it('does not claim success for a binary format when a request failed', () => {
    service.downloadRecords(mixedSelection, 'pdf').subscribe({ error: () => undefined });

    httpMock.expectOne(r => r.url.includes('/dmp/')).flush(new Blob(['x']));
    httpMock.expectOne(r => r.url.includes('/dap/'))
      .error(new ProgressEvent('error'), { status: 500, statusText: 'err' });

    const messages = snack.open.mock.calls.map(c => c[0]).join(' | ');
    expect(messages).not.toContain('Downloaded PDF files');
  });

  describe('downloadPDF', () => {
    const RECORD = {
      type: 'dmp', id: 'mdm1:0005', name: 'CHIPS 1.01 - 2D and WBG Reliability',
      owner: 'jlau', primaryContact: 'Lau, Jonathan', organizationUnit: 'MML',
      status: 'edit', modifiedDate: '2026-01-02'
    };

    const realBlob = (global as any).Blob;
    const realCreateObjectUrl = (URL as any).createObjectURL;
    const realRevokeObjectUrl = (URL as any).revokeObjectURL;
    let written: Buffer[];

    beforeEach(() => {
      written = [];
      // jsdom's Blob cannot be read back, so keep the bytes as they are handed over
      (global as any).Blob = class {
        constructor(parts: any[]) { written.push(Buffer.from(parts[0])); }
      };
      (URL as any).createObjectURL = jest.fn(() => 'blob:test');
      (URL as any).revokeObjectURL = jest.fn();
    });

    afterEach(() => {
      (global as any).Blob = realBlob;
      (URL as any).createObjectURL = realCreateObjectUrl;
      (URL as any).revokeObjectURL = realRevokeObjectUrl;
    });

    // downloadPDF discards every error, so a broken download looks exactly like a
    // working one from outside; the document itself has to be inspected
    it('hands the browser a pdf holding the record', () => {
      service.downloadPDF([RECORD]);

      expect(written).toHaveLength(1);
      expect(written[0].toString('latin1').startsWith('%PDF')).toBe(true);
      expect(readablePdfText(written[0])).toContain('CHIPS 1.01');
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('writes nothing when there are no records', () => {
      service.downloadPDF([]);

      expect(written).toEqual([]);
      expect(URL.createObjectURL).not.toHaveBeenCalled();
    });
  });
});
