import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { DataService, UserResponse } from './data.service';
import { ConfigurationService } from '../../../../lib/dist/oarng';
import { CredentialsService } from './credentials.service';
import { Dap, Dmp, File, Review } from '../models/dashboard';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;
  let configServiceSpy: jasmine.SpyObj<ConfigurationService>;
  let credentialsServiceSpy: jasmine.SpyObj<CredentialsService>;

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
    const configSpy = jasmine.createSpyObj('ConfigurationService', ['getConfig']);
    const credsSpy = jasmine.createSpyObj('CredentialsService', [], {
      token: signal(null)
    });

    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({
      dmpUI: { value: 'http://test.com/dmp' },
      dapUI: { value: 'http://test.com/dap' },
      nextcloudUI: { value: 'http://test.com/files' }
    }));

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        NoopAnimationsModule
      ],
      providers: [
        // Don't provide DataService - let Angular handle it with providedIn: 'root'
        { provide: ConfigurationService, useValue: configSpy },
        { provide: CredentialsService, useValue: credsSpy }
      ]
    }).compileComponents();

    configServiceSpy = TestBed.inject(ConfigurationService) as jasmine.SpyObj<ConfigurationService>;
    credentialsServiceSpy = TestBed.inject(CredentialsService) as jasmine.SpyObj<CredentialsService>;
    httpMock = TestBed.inject(HttpTestingController);

    configServiceSpy.getConfig.and.returnValue(mockConfig);

    // Direct injection without runInInjectionContext
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
  });

  describe('API URL Resolution', () => {
    it('should resolve API URLs from config', () => {
      const url = service.resolveApiUrl('dapAPI');
      expect(url).toBe('http://test.com/api/daps');
    });

    it('should return empty string for missing config keys', () => {
      configServiceSpy.getConfig.and.returnValue({});
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
        contributors: [{ primary_contact: 'Yes', emailAddress: 'test@example.com' }],
        organizations: [{ ouName: 'Test Org' }],
        dmpSearchable: 'yes',
        keywords: ['test', 'keyword']
      },
      status: { modifiedDate: '2023-01-01T00:00:00Z', state: 'active' },
      type: 'research'
    };

    it('should fetch DMPs successfully', () => {
      service.getDmps().subscribe(dmps => {
        expect(dmps).toHaveSize(1);
        expect(dmps[0].name).toBe('Test DMP');
        expect(dmps[0].primaryContact).toBe('test@example.com');
      });

      const req = httpMock.expectOne('http://test.com/api/dmps');
      expect(req.request.method).toBe('GET');
      req.flush([mockDmpRaw]);
    });

    it('should fallback to JSON when API fails', () => {
      service.getDmps().subscribe(dmps => {
        expect(dmps).toHaveSize(1);
      });

      const apiReq = httpMock.expectOne('http://test.com/api/dmps');
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
        status: { modifiedDate: '2023-01-01T00:00:00Z' }
      };

      service.getDaps().subscribe(daps => {
        expect(daps).toHaveSize(1);
        expect(daps[0].name).toBe('Test DAP');
      });

      const req = httpMock.expectOne('http://test.com/api/daps');
      req.flush([mockDapRaw]);
    });

    it('should fetch files successfully', () => {
      const mockFileRaw = {
        id: '1',
        name: 'Test File',
        file_space: {
          usage: '1024', // String as you noted
          file_count: 5,
          location: '/test/path'
        },
        status: { modifiedDate: '2023-01-01T00:00:00Z' }
      };

      service.getFiles().subscribe(files => {
        expect(files).toHaveSize(1);
        expect(files[0].usage).toBe('1024');
      });

      const req = httpMock.expectOne('http://test.com/api/daps'); // Note: uses dapAPI
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
        expect(reviews).toHaveSize(1);
        expect(reviews[0].title).toBe('Test Review');
      });

      const req = httpMock.expectOne('http://test.com/api/reviews');
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
          usage: '1024', // String as you noted
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
        expect(service.dmpUI).toBe('http://test.com/dmp');
      });

      it('should return DAP UI URL from config', () => {
        expect(service.dapUI).toBe('http://test.com/dap');
      });

      it('should return Nextcloud UI URL from config', () => {
        expect(service.nextcloudUI).toBe('http://test.com/files');
      });
    });

    describe('with empty config', () => {
      let emptyConfigService: DataService;

      beforeEach(async () => {
        // Reset localStorage before creating new TestBed
        (localStorage.getItem as jasmine.Spy).and.returnValue('{}');
        
        // Reset TestBed to get a fresh service instance
        TestBed.resetTestingModule();
        
        const configSpy = jasmine.createSpyObj('ConfigurationService', ['getConfig']);
        const credsSpy = jasmine.createSpyObj('CredentialsService', [], {
          token: signal(null)
        });

        await TestBed.configureTestingModule({
          imports: [
            HttpClientTestingModule,
            MatSnackBarModule,
            NoopAnimationsModule
          ],
          providers: [
            { provide: ConfigurationService, useValue: configSpy },
            { provide: CredentialsService, useValue: credsSpy }
          ]
        }).compileComponents();

        configSpy.getConfig.and.returnValue(mockConfig);
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
});
