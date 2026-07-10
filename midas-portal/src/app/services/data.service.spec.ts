import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { DataService, UserResponse } from './data.service';
import { ConfigurationService } from '../../../../lib/dist/oarng';
import { CredentialsService } from './credentials.service';
import { DashboardService } from './dashboard.service'; // Adjust path
import { Dap, Dmp, File, Review } from '../models/dashboard';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;
  let configServiceSpy: jest.Mocked<ConfigurationService>;
  let credentialsServiceSpy: jest.Mocked<CredentialsService>;

  const mockConfig = {
    dapAPI: 'https://localhost/midas/dap/mds3',
    dmpAPI: 'https://localhost/midas/dmp/mdm1',
    fileAPI: 'http://test.com/api/files',
    NPSAPI: 'http://test.com/api/reviews',
    dapJSON: 'http://test.com/fallback/daps.json',
    dmpJSON: 'http://test.com/fallback/dmps.json',
    fileJSON: 'http://test.com/fallback/files.json',
    reviewJSON: 'http://test.com/fallback/reviews.json',
    infoURL: 'http://test.com/info'
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: ConfigurationService,
          useValue: {
            getConfig: jest.fn().mockReturnValue(mockConfig)
          }
        },
        {
          provide: CredentialsService,
          useValue: {
            token: signal(null),
            userId: signal('testUser')
          }
        },
        {
          provide: DashboardService,
          useValue: {}
        }
      ]
    }).compileComponents();

    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify({
      dmpUI: { value: 'http://test.com/dmp' },
      dapUI: { value: 'http://test.com/dap' },
      nextcloudUI: { value: 'http://test.com/files' }
    }));

    configServiceSpy = TestBed.inject(ConfigurationService) as jest.Mocked<ConfigurationService>;
    credentialsServiceSpy = TestBed.inject(CredentialsService) as jest.Mocked<CredentialsService>;
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(DataService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize signals with empty arrays', () => {
      expect(service.dmps()).toEqual([]);
      expect(service.daps()).toEqual([]);
      expect(service.files()).toEqual([]);
    });

    it('should initialize myDmps and myDaps signals with empty arrays', () => {
      expect(service.myDmps()).toEqual([]);
      expect(service.myDaps()).toEqual([]);
    });
  });

  describe('API URL Resolution', () => {
    it('should resolve API URLs from config', () => {
      const url = service.resolveApiUrl('dapAPI');
      expect(url).toBe('https://localhost/midas/dap/mds3');
    });

    it('should return empty string for missing config keys', () => {
      configServiceSpy.getConfig.mockReturnValue({});
      const url = service.resolveApiUrl('nonexistent');
      expect(url).toBe('');
    });
  });

  describe('Data Fetching', () => {
    const mockDmpRaw = {
      id: '1',
      name: 'Test DMP',
      owner: 'test-owner',
      data: {
        contributors: [{ 
          primary_contact: 'Yes', 
          firstName: 'John',        // Add firstName
          lastName: 'Doe'           // Add lastName
          // Remove emailAddress as it's not used by the mapper
        }],
        organizations: [{ ouName: 'Test Org' }],
        dmpSearchable: 'yes',
        keywords: ['test', 'keyword']
      },
      status: { modifiedDate: '2023-01-01T00:00:00Z', state: 'active' },
      type: 'research'
    };

    it('should fetch DMPs successfully', () => {
      service.getDmps().subscribe(dmps => {
        expect(dmps).toHaveLength(1);
        expect(dmps[0].name).toBe('Test DMP');
        expect(dmps[0].primaryContact).toBe('John Doe'); // Update expected value
      });

      const req = httpMock.expectOne('https://localhost/midas/dmp/mdm1');
      expect(req.request.method).toBe('GET');
      req.flush([mockDmpRaw]);
    });

    it('should fallback to JSON when API fails', () => {
      service.getDmps().subscribe(dmps => {
        expect(dmps).toHaveLength(1);
      });

      const apiReq = httpMock.expectOne('https://localhost/midas/dmp/mdm1');
      apiReq.error(new ErrorEvent('Network error'));

      const fallbackReq = httpMock.expectOne('http://test.com/fallback/dmps.json');
      fallbackReq.flush([mockDmpRaw]);
    });

    it('should fetch DAPs successfully', () => {
      const mockDapRaw = {
        id: '1',
        name: 'Test DAP',
        owner: 'test-owner',
        data: { contributors: [{ primary_contact: 'Yes', emailAddress: 'dap@example.com' }] },
        status: { modifiedDate: '2023-01-01T00:00:00Z' },
        file_space: { location: '/test/location' }
      };

      service.getDaps().subscribe(daps => {
        expect(daps).toHaveLength(1);
        expect(daps[0].name).toBe('Test DAP');
      });

      const req = httpMock.expectOne('https://localhost/midas/dap/mds3');
      req.flush([mockDapRaw]);
    });

    it('should fetch files successfully', () => {
      const mockFileRaw = {
        id: '1',
        name: 'Test File',
        file_space: {
          usage: '1024',
          file_count: 5,
          location: '/test/path'
        },
        status: { modifiedDate: '2023-01-01T00:00:00Z' }
      };

      service.getFiles().subscribe(files => {
        expect(files).toHaveLength(1);
        expect(files[0].usage).toBe('1024');
      });

      const req = httpMock.expectOne('https://localhost/midas/dap/mds3');
      req.flush([mockFileRaw]);
    });

    it('should fetch reviews successfully', () => {
      const mockReviewRaw = {
        dataSetID: '1',
        title: 'Test Review',
        submitterName: 'John Doe',
        currentReviewer: 'Jane Smith',
        currentReviewStep: 'Initial Review'
      };

      service.getReviews().subscribe(reviews => {
        expect(reviews).toHaveLength(1);
        expect(reviews[0].title).toBe('Test Review');
      });

      const req = httpMock.expectOne('http://test.com/api/reviewstestUser');
      req.flush([mockReviewRaw]);
    });

    it('should fetch info text', () => {
      const mockText = 'This is info text';

      service.getInfoText().subscribe(text => {
        expect(text).toBe(mockText);
      });

      const req = httpMock.expectOne('http://test.com/info');
      expect(req.request.responseType).toBe('text');
      req.flush(mockText);
    });
  });

  describe('Signal Updates', () => {
    it('should update DMPs signal', () => {
      const mockDmps: Dmp[] = [
        {
          id: '1',
          name: 'Test DMP',
          owner: 'owner',
          primaryContact: 'test@example.com',
          organizationUnit: 'Test Org',
          modifiedDate: new Date(),
          type: 'research',
          status: 'active',
          hasPublication: true,
          keywords: ['test']
        }
      ];

      service.setDmps(mockDmps);
      expect(service.dmps()).toEqual(mockDmps);
    });

    it('should update DAPs signal', () => {
      const mockDaps: Dap[] = [
        {
          id: '1',
          name: 'Test DAP',
          owner: 'owner',
          primaryContact: 'test@example.com',
          modifiedDate: new Date(),
          location: "location",
        }
      ];

      service.setDaps(mockDaps);
      expect(service.daps()).toEqual(mockDaps);
    });

    it('should update Files signal', () => {
      const mockFiles: File[] = [
        {
          id: '1',
          name: 'Test File',
          usage: '1024',
          fileCount: 5,
          modifiedDate: new Date(),
          location: '/test/path'
        }
      ];

      service.setFiles(mockFiles);
      expect(service.files()).toEqual(mockFiles);
    });
  });

  describe('UI URL Getters', () => {
    describe('with config present', () => {
      it('should return DMP UI URL from config', () => {
        expect(service.dmpUI).toBe('https://mdstest.nist.gov/dmpui/new');
      });

      it('should return DAP UI URL from config', () => {
        expect(service.dapUI).toBe('https://mdstest.nist.gov/dapui/new');
      });

      it('should return Nextcloud UI URL from config', () => {
        expect(service.nextcloudUI).toBe('https://mdstest.nist.gov/fileui/new');
      });
    });

    describe('with empty config', () => {
      let emptyConfigService: DataService;

      beforeEach(async () => {
        (Storage.prototype.getItem as jest.Mock).mockReturnValue('{}');
        
        TestBed.resetTestingModule();
        
        await TestBed.configureTestingModule({
          imports: [
            HttpClientTestingModule,
            MatSnackBarModule,
            NoopAnimationsModule
          ],
          providers: [
            {
              provide: ConfigurationService,
              useValue: {
                getConfig: jest.fn().mockReturnValue({})
              }
            },
            {
              provide: CredentialsService,
              useValue: {
                token: signal(null),
                userId: signal('testUser')
              }
            },
            {
              provide: DashboardService,
              useValue: {}
            },
            {
              provide: MatDialogRef,
              useValue: {
                close: jest.fn(),
                afterClosed: () => of(true)
              }
            },
            {
              provide: MAT_DIALOG_DATA,
              useValue: {}
            }
          ]
        }).compileComponents();

        emptyConfigService = TestBed.inject(DataService);
      });

      it('should return default URLs when config is missing', () => {
        expect(emptyConfigService.dmpUI).toBe('https://mdstest.nist.gov/dmpui/new');
        expect(emptyConfigService.dapUI).toBe('https://mdstest.nist.gov/dapui/new');
        expect(emptyConfigService.nextcloudUI).toBe('https://mdstest.nist.gov/fileui/new');
      });
    });
  });

  describe('User Service', () => {
    it('should return mock user data', () => {
      service.getUser().subscribe((response: UserResponse) => {
        expect(response.userDetails.userId).toBe('one1');
        expect(response.userDetails.userEmail).toBe('omarilias.elmimouni@nist.gov');
        expect(response.userDetails.userName).toBe('Omar Ilias');
      });
    });
  });

  // No-token fallback tests — run under the outer beforeEach (token: signal(null))
  describe('getMyDmps() / getMyDaps() — no-token fallback path', () => {
    const rawDmp = (id: string, modifiedDate = '2024-01-01T00:00:00Z') => ({
      id,
      name: `DMP ${id}`,
      owner: 'testUser',
      data: {
        contributors: [{ primary_contact: 'Yes', firstName: 'John', lastName: 'Doe' }],
        organizations: [{ ouName: 'Test Org' }],
        dmpSearchable: 'yes',
        keywords: []
      },
      status: { modifiedDate, state: 'active' },
      type: 'research'
    });

    const rawDap = (id: string, modifiedDate = '2024-01-01T00:00:00Z') => ({
      id,
      name: `DAP ${id}`,
      owner: 'testUser',
      data: { contributors: [{ primary_contact: 'Yes', emailAddress: 'test@example.com' }] },
      status: { modifiedDate },
      file_space: { location: '/test' }
    });

    it('getMyDmps() fetches fallback JSON when token is null', () => {
      service.getMyDmps().subscribe(dmps => {
        expect(dmps).toHaveSize(1);
        expect(dmps[0].name).toBe('DMP 1');
      });

      httpMock.expectNone((r) => r.url.includes('?perm=write'));
      httpMock.expectNone((r) => r.url.includes('?owner='));
      httpMock.expectOne('http://test.com/fallback/dmps.json').flush([rawDmp('1')]);
    });

    it('getMyDaps() fetches fallback JSON when token is null', () => {
      service.getMyDaps().subscribe(daps => {
        expect(daps).toHaveSize(1);
      });
      httpMock.expectNone((r) => r.url.includes('?perm=write'));
      httpMock.expectNone((r) => r.url.includes('?owner='));
      httpMock.expectOne('http://test.com/fallback/daps.json').flush([rawDap('1')]);
    });
  });

  describe('getMyDmps() / getMyDaps() — authenticated two-call path', () => {
    let authService: DataService;
    let authHttpMock: HttpTestingController;

    const rawDmp = (id: string, modifiedDate = '2024-01-01T00:00:00Z') => ({
      id,
      name: `DMP ${id}`,
      owner: 'testUser',
      data: {
        contributors: [{ primary_contact: 'Yes', firstName: 'John', lastName: 'Doe' }],
        organizations: [{ ouName: 'Test Org' }],
        dmpSearchable: 'yes',
        keywords: []
      },
      status: { modifiedDate, state: 'active' },
      type: 'research'
    });

    const rawDap = (id: string, modifiedDate = '2024-01-01T00:00:00Z') => ({
      id,
      name: `DAP ${id}`,
      owner: 'testUser',
      data: { contributors: [{ primary_contact: 'Yes', emailAddress: 'test@example.com' }] },
      status: { modifiedDate },
      file_space: { location: '/test' }
    });

    beforeEach(async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [HttpClientTestingModule, MatSnackBarModule, MatDialogModule, NoopAnimationsModule],
        providers: [
          {
            provide: ConfigurationService,
            useValue: { getConfig: jasmine.createSpy('getConfig').and.returnValue(mockConfig) }
          },
          {
            provide: CredentialsService,
            useValue: {
              token: signal('mock-jwt-token'),
              userId: signal('testUser'),
              userAttributes: signal({ winId: 'DOMAIN\\testUser' })
            }
          },
          { provide: DashboardService, useValue: {} }
        ]
      }).compileComponents();
      authHttpMock = TestBed.inject(HttpTestingController);
      authService = TestBed.inject(DataService);
    });

    afterEach(() => authHttpMock.verify());

    it('getMyDmps() sends ?perm=write and ?owner=userId,winId requests', () => {
      authService.getMyDmps().subscribe();

      const writeReq = authHttpMock.expectOne(r => r.url.includes('?perm=write'));
      const ownerReq = authHttpMock.expectOne(r => r.url.includes('?owner='));

      expect(writeReq.request.url).toContain('https://localhost/midas/dmp/mdm1?perm=write');
      expect(ownerReq.request.url).toContain('?owner=testUser,DOMAIN\\testUser');
      expect(writeReq.request.headers.get('Authorization')).toBe('Bearer mock-jwt-token');

      writeReq.flush([]);
      ownerReq.flush([]);
    });

    it('getMyDmps() deduplicates records that appear in both responses', () => {
      authService.getMyDmps().subscribe(dmps => {
        expect(dmps.map(d => d.id)).toEqual(['dmp1', 'dmp2', 'dmp3']);
      });

      authHttpMock.expectOne(r => r.url.includes('?perm=write')).flush([rawDmp('dmp1'), rawDmp('dmp2')]);
      authHttpMock.expectOne(r => r.url.includes('?owner=')).flush([rawDmp('dmp2'), rawDmp('dmp3')]);
    });

    it('getMyDmps() returns records sorted by modifiedDate descending', () => {
      authService.getMyDmps().subscribe(dmps => {
        expect(dmps[0].id).toBe('dmp-new');
        expect(dmps[1].id).toBe('dmp-mid');
        expect(dmps[2].id).toBe('dmp-old');
      });

      authHttpMock.expectOne(r => r.url.includes('?perm=write')).flush([
        rawDmp('dmp-old', '2023-01-01T00:00:00Z'),
        rawDmp('dmp-new', '2025-06-15T00:00:00Z')
      ]);
      authHttpMock.expectOne(r => r.url.includes('?owner=')).flush([
        rawDmp('dmp-mid', '2024-06-01T00:00:00Z')
      ]);
    });

    it('getMyDmps() includes records owned but not in write ACL (publication edge case)', () => {
      authService.getMyDmps().subscribe(dmps => {
        expect(dmps.some(d => d.id === 'dmp-under-review')).toBe(true);
      });

      authHttpMock.expectOne(r => r.url.includes('?perm=write')).flush([]);
      authHttpMock.expectOne(r => r.url.includes('?owner=')).flush([rawDmp('dmp-under-review')]);
    });

    it('getMyDmps() still returns perm=write results when owner call fails', () => {
      authService.getMyDmps().subscribe(dmps => {
        expect(dmps.map(d => d.id)).toEqual(['dmp1']);
      });

      authHttpMock.expectOne(r => r.url.includes('?perm=write')).flush([rawDmp('dmp1')]);
      authHttpMock.expectOne(r => r.url.includes('?owner=')).error(new ErrorEvent('network'));
    });

    it('getMyDmps() still returns owner results when perm=write call fails', () => {
      authService.getMyDmps().subscribe(dmps => {
        expect(dmps.map(d => d.id)).toEqual(['dmp-owned']);
      });

      authHttpMock.expectOne(r => r.url.includes('?perm=write')).error(new ErrorEvent('network'));
      authHttpMock.expectOne(r => r.url.includes('?owner=')).flush([rawDmp('dmp-owned')]);
    });

    it('getMyDmps() returns empty array when both calls fail', () => {
      authService.getMyDmps().subscribe(dmps => {
        expect(dmps).toEqual([]);
      });

      authHttpMock.expectOne(r => r.url.includes('?perm=write')).error(new ErrorEvent('network'));
      authHttpMock.expectOne(r => r.url.includes('?owner=')).error(new ErrorEvent('network'));
    });

    it('getMyDaps() sends ?perm=write and ?owner= requests for DAPs', () => {
      authService.getMyDaps().subscribe(daps => {
        expect(daps.map(d => d.id)).toEqual(['dap1', 'dap2']);
      });

      authHttpMock.expectOne(r => r.url.includes('https://localhost/midas/dap/mds3?perm=write')).flush([rawDap('dap1')]);
      authHttpMock.expectOne(r => r.url.includes('?owner=')).flush([rawDap('dap2')]);
    });

    it('getMyDaps() deduplicates and sorts by modifiedDate descending', () => {
      authService.getMyDaps().subscribe(daps => {
        expect(daps[0].id).toBe('dap-new');
        expect(daps[1].id).toBe('dap-old');
      });

      authHttpMock.expectOne(r => r.url.includes('?perm=write')).flush([rawDap('dap-old', '2023-01-01T00:00:00Z')]);
      authHttpMock.expectOne(r => r.url.includes('?owner=')).flush([rawDap('dap-new', '2025-01-01T00:00:00Z')]);
    });

    it('populates myDmps() and myDaps() after loadAll() completes', () => {
      authService.loadAll().subscribe(() => {
        expect(authService.myDmps().length).toBe(1);
        expect(authService.myDaps().length).toBe(1);
      });

      // getDmps() → dmpAPI
      authHttpMock.expectOne(r => r.url === 'https://localhost/midas/dmp/mdm1').flush([rawDmp('dmp-full')]);
      // getDaps() and getFiles() both use dapAPI — match both with .match()
      const dapBaseReqs = authHttpMock.match(r => r.url === 'https://localhost/midas/dap/mds3');
      dapBaseReqs[0].flush([rawDap('dap-full')]);
      dapBaseReqs[1].flush([]);
      // getMyDmps() → two calls
      authHttpMock.expectOne(r => r.url.includes('dmp') && r.url.includes('?perm=write')).flush([rawDmp('dmp-mine')]);
      authHttpMock.expectOne(r => r.url.includes('dmp') && r.url.includes('?owner=')).flush([]);
      // getMyDaps() → two calls
      authHttpMock.expectOne(r => r.url.includes('dap') && r.url.includes('?perm=write')).flush([rawDap('dap-mine')]);
      authHttpMock.expectOne(r => r.url.includes('dap') && r.url.includes('?owner=')).flush([]);
    });

    it('loadAll() updates dmps() and daps() signals', () => {
      authService.loadAll().subscribe(() => {
        expect(authService.dmps().length).toBe(1);
        expect(authService.daps().length).toBe(1);
      });

      authHttpMock.expectOne(r => r.url === 'https://localhost/midas/dmp/mdm1').flush([rawDmp('1')]);
      const dapBaseReqs = authHttpMock.match(r => r.url === 'https://localhost/midas/dap/mds3');
      dapBaseReqs[0].flush([rawDap('1')]);
      dapBaseReqs[1].flush([]);
      authHttpMock.expectOne(r => r.url.includes('dmp') && r.url.includes('?perm=write')).flush([]);
      authHttpMock.expectOne(r => r.url.includes('dmp') && r.url.includes('?owner=')).flush([]);
      authHttpMock.expectOne(r => r.url.includes('dap') && r.url.includes('?perm=write')).flush([]);
      authHttpMock.expectOne(r => r.url.includes('dap') && r.url.includes('?owner=')).flush([]);
    });
  });
});
