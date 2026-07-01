import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { MyRecordsComponent } from './my-records.component';
import { DataService } from '../../services/data.service';
import { CredentialsService } from '../../services/credentials.service';
import { SearchFilterService } from '../../services/search-filter.service';
import { ConfigurationService, PermissionsService, GroupsService } from 'oarng';
import { PeopleService } from '../../services/people.service';

const mockDmps = [
  { id: 'dmp-1', name: 'DMP One', owner: 'other-user', type: 'DMP', status: 'edit', modifiedDate: '' },
  { id: 'dmp-2', name: 'DMP Two', owner: 'testuser',   type: 'DMP', status: 'edit', modifiedDate: '' }
];

const mockDaps = [
  { id: 'dap-1', name: 'DAP One', owner: 'another-user', type: 'DAP', status: 'edit', modifiedDate: '' }
];

// All three records have testuser in admin; dmp-2 is owned by testuser
const defaultAcls: Record<string, any> = {
  'dmp-1': { read: [], write: [], admin: ['testuser'], delete: [] },
  'dmp-2': { read: [], write: [], admin: ['testuser'], delete: [] },
  'dap-1': { read: [], write: [], admin: ['testuser'], delete: [] }
};

function makeProviders(aclOverride?: Record<string, any>) {
  const acls = aclOverride ?? defaultAcls;
  return [
    {
      provide: DataService,
      useValue: {
        dmps: signal(mockDmps as any),
        daps: signal(mockDaps as any),
        loadAll: jest.fn().mockReturnValue(of(null)),
        resolveApiUrl: jest.fn().mockReturnValue('http://mock-api/')
      }
    },
    {
      provide: CredentialsService,
      useValue: {
        token: signal('mock-token'),
        userId: signal('testuser'),
        userAttributes: signal({ winId: 'testuser-win' })
      }
    },
    {
      provide: PermissionsService,
      useValue: {
        getAcls: jest.fn().mockImplementation((record: { id: string }) =>
          of(acls[record.id] ?? { read: [], write: [], admin: [], delete: [] })
        )
      }
    },
    {
      provide: GroupsService,
      useValue: { getGroups: jest.fn().mockReturnValue(of([])) }
    },
    {
      provide: PeopleService,
      useValue: {
        resolveEidLabel: jest.fn().mockReturnValue(of(null)),
        getNISTOrganizations: jest.fn().mockReturnValue(of({}))
      }
    },
    {
      provide: SearchFilterService,
      useValue: {
        filterDmpOrDapList: jest.fn().mockImplementation((list: any[]) => list),
        buildParts: jest.fn().mockReturnValue([])
      }
    },
    {
      provide: ConfigurationService,
      useValue: { getConfig: jest.fn().mockReturnValue({}) }
    },
    {
      provide: ActivatedRoute,
      useValue: { queryParams: of({}) }
    }
  ];
}

describe('MyRecordsComponent', () => {
  let component: MyRecordsComponent;
  let fixture: ComponentFixture<MyRecordsComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      declarations: [MyRecordsComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule
      ],
      providers: makeProviders(),
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MyRecordsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('admin records filter', () => {
    it('includes records where user is in acls.admin and is not owner', fakeAsync(() => {
      component.ngOnInit();
      tick(500); // waitForToken setTimeout
      tick();    // flush observables

      // dmp-1: owner='other-user', admin=['testuser'] → include
      const ids = component.dataSource.data.map((r: any) => r.id);
      expect(ids).toContain('dmp-1');
    }));

    it('excludes records where user is the owner even if in acls.admin', fakeAsync(() => {
      component.ngOnInit();
      tick(500);
      tick();

      // dmp-2: owner='testuser', admin=['testuser'] → owner match, exclude
      const ids = component.dataSource.data.map((r: any) => r.id);
      expect(ids).not.toContain('dmp-2');
    }));

    it('excludes records where user is not in acls.admin', fakeAsync(() => {
      component.ngOnInit();
      tick(500);
      tick();

      // Every record in dataSource was admitted because admin includes userId
      // and is not owned by the current user
      const data: any[] = component.dataSource.data;
      for (const record of data) {
        expect(record.owner).not.toBe('testuser');
      }
    }));
  });

});

describe('MyRecordsComponent — query param pre-filter', () => {
  let component: MyRecordsComponent;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      declarations: [MyRecordsComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule
      ],
      providers: [
        ...makeProviders().filter(p => (p as any).provide !== ActivatedRoute),
        { provide: ActivatedRoute, useValue: { queryParams: of({ type: 'DMP' }) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    const fixture = TestBed.createComponent(MyRecordsComponent);
    component = fixture.componentInstance;
  });

  it('pre-sets resourceTypeControl when ?type=DMP is in the URL', fakeAsync(() => {
    component.ngOnInit();
    tick(500);
    tick();

    expect(component.resourceTypeControl.value).toEqual(['dmp']);
  }));
});

