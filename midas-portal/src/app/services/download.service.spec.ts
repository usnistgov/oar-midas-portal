import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { signal } from '@angular/core';
import { ConfigurationService } from 'oarng';
import { DownloadService } from './download.service';
import { CredentialsService } from './credentials.service';

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
});
