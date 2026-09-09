import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, delay, throwError } from 'rxjs';

import { MyRecordsComponent } from './my-records.component';
import { DataService } from '../../services/data.service';
import { CredentialsService } from '../../services/credentials.service';
import { SearchFilterService } from '../../services/search-filter.service';
import { ConfigurationService, PermissionsService, GroupsService } from 'oarng';
import { PeopleService } from '../../services/people.service';

// All three records have testuser in admin; dmp-2 is owned by testuser.
// ACLs now arrive on the records themselves, as they do from the API.
const defaultAcls: Record<string, any> = {
  'dmp-1': { read: [], write: [], admin: ['testuser'], delete: [] },
  'dmp-2': { read: [], write: [], admin: ['testuser'], delete: [] },
  'dap-1': { read: [], write: [], admin: ['testuser'], delete: [] }
};

const mockDmps = [
  { id: 'dmp-1', name: 'DMP One', owner: 'other-user', type: 'DMP', status: 'edit', modifiedDate: '' },
  { id: 'dmp-2', name: 'DMP Two', owner: 'testuser',   type: 'DMP', status: 'edit', modifiedDate: '' }
];

const mockDaps = [
  { id: 'dap-1', name: 'DAP One', owner: 'another-user', type: 'DAP', status: 'edit', modifiedDate: '' }
];

function withAcls(records: any[], acls: Record<string, any>) {
  return records.map(r => ({ ...r, acls: acls[r.id] }));
}

function makeProviders(aclOverride?: Record<string, any>) {
  const acls = aclOverride ?? defaultAcls;
  return [
    {
      provide: DataService,
      useValue: {
        dmps: signal(withAcls(mockDmps, acls) as any),
        daps: signal(withAcls(mockDaps, acls) as any),
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

    it('includes records where user is the owner', fakeAsync(() => {
      component.ngOnInit();
      tick(500);
      tick();

      // dmp-2: owner='testuser' → include regardless of admin ACL
      const ids = component.dataSource.data.map((r: any) => r.id);
      expect(ids).toContain('dmp-2');
    }));

    it('excludes records where user is neither owner nor in acls.admin', fakeAsync(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [MyRecordsComponent],
        imports: [
          HttpClientTestingModule,
          RouterTestingModule,
          NoopAnimationsModule,
          FormsModule,
          ReactiveFormsModule,
          MatAutocompleteModule
        ],
        providers: makeProviders({
          'dmp-1': { read: [], write: [], admin: ['testuser'], delete: [] },
          'dmp-2': { read: [], write: [], admin: [], delete: [] },
          'dap-1': { read: [], write: [], admin: ['someone-else'], delete: [] }
        }),
        schemas: [NO_ERRORS_SCHEMA]
      });
      const f = TestBed.createComponent(MyRecordsComponent);
      const c = f.componentInstance;
      c.ngOnInit();
      tick(500);
      tick();

      const ids = c.dataSource.data.map((r: any) => r.id);
      expect(ids).toContain('dmp-1');      // admin
      expect(ids).toContain('dmp-2');      // owner
      expect(ids).not.toContain('dap-1');  // neither
    }));
  });

});

describe('waitForToken cancellation', () => {
  it('does not call loadAll after component is destroyed', fakeAsync(() => {
    TestBed.resetTestingModule();
    const tokenSignal = signal<string | null>(null);
    const providers = makeProviders();
    const loadAllMock = jest.fn().mockReturnValue(of(null));
    const dataProviderIdx = providers.findIndex(p => (p as any).provide === DataService);
    (providers[dataProviderIdx] as any).useValue = {
      ...(providers[dataProviderIdx] as any).useValue,
      loadAll: loadAllMock,
    };
    const credsProviderIdx = providers.findIndex(p => (p as any).provide === CredentialsService);
    (providers[credsProviderIdx] as any).useValue = {
      ...(providers[credsProviderIdx] as any).useValue,
      token: tokenSignal,
    };

    TestBed.configureTestingModule({
      declarations: [MyRecordsComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule, FormsModule, ReactiveFormsModule, MatAutocompleteModule],
      providers: [...providers],
      schemas: [NO_ERRORS_SCHEMA]
    });

    const fixture = TestBed.createComponent(MyRecordsComponent);
    fixture.componentInstance.ngOnInit();

    // Destroy before token arrives
    fixture.destroy();

    // Now provide the token — waitForToken would normally fire
    tokenSignal.set('late-token');
    tick(200);

    expect(loadAllMock).not.toHaveBeenCalled();
  }));
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

describe('subjectPermLevel()', () => {
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

  it('returns null when acls is missing for the record', fakeAsync(() => {
    component.ngOnInit();
    tick(500);
    tick();
    component.aclsMap.set({});
    expect(component.subjectPermLevel('dmp-1', 'alice')).toBeNull();
  }));

  it('returns null when subject has write but not read (partial ACL)', fakeAsync(() => {
    component.ngOnInit();
    tick(500);
    tick();
    component.aclsMap.set({ 'dmp-1': { read: [], write: ['alice'], admin: [], delete: [] } });
    expect(component.subjectPermLevel('dmp-1', 'alice')).toBeNull();
  }));
});

describe('recordSubjects()', () => {
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

  it('returns all unique subjects across all ACL arrays for a record', fakeAsync(() => {
    component.ngOnInit();
    tick(500);
    tick();
    component.aclsMap.set({
      'dmp-1': { read: ['alice', 'bob'], write: ['alice'], admin: ['carol'], delete: [] }
    });
    const subjects = component.recordSubjects('dmp-1');
    expect(subjects).toContain('alice');
    expect(subjects).toContain('bob');
    expect(subjects).toContain('carol');
    expect(subjects.length).toBe(3); // no duplicates
  }));

  it('returns empty array when record has no ACL entry', fakeAsync(() => {
    component.ngOnInit();
    tick(500);
    tick();
    component.aclsMap.set({});
    expect(component.recordSubjects('missing-record')).toEqual([]);
  }));
});

describe('recordSubjectsByLevel()', () => {
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

  it('groups subjects by their permission level', fakeAsync(() => {
    component.ngOnInit();
    tick(500);
    tick();
    // alice=admin (r+w+a+d), bob=update (r+w), carol=view (r only)
    component.aclsMap.set({
      'dmp-1': {
        read: ['alice', 'bob', 'carol'],
        write: ['alice', 'bob'],
        admin: ['alice'],
        delete: ['alice']
      }
    });
    const grouped = component.recordSubjectsByLevel('dmp-1');
    const adminEntry = grouped.find(g => g.level === 'admin');
    const updateEntry = grouped.find(g => g.level === 'update');
    const viewEntry = grouped.find(g => g.level === 'view');
    expect(adminEntry?.subjects).toContain('alice');
    expect(updateEntry?.subjects).toContain('bob');
    expect(viewEntry?.subjects).toContain('carol');
  }));

  it('excludes subjects with partial ACL state (null level)', fakeAsync(() => {
    component.ngOnInit();
    tick(500);
    tick();
    // dave has write but not read — should be excluded
    component.aclsMap.set({
      'dmp-1': { read: [], write: ['dave'], admin: [], delete: [] }
    });
    const grouped = component.recordSubjectsByLevel('dmp-1');
    const allSubjects = grouped.flatMap(g => g.subjects);
    expect(allSubjects).not.toContain('dave');
  }));
});

describe('loadAllAcls()', () => {
  let component: MyRecordsComponent;
  let getAcls: jest.Mock;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    getAcls = jest.fn();
    const providers = makeProviders();
    const idx = providers.findIndex(p => (p as any).provide === PermissionsService);
    (providers[idx] as any).useValue = { getAcls };

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
      providers,
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    component = TestBed.createComponent(MyRecordsComponent).componentInstance;
  });

  // The listings already carry acls, so the initial load must issue no
  // per-record requests at all.
  it('builds the acl map from the loaded records without fetching', fakeAsync(() => {
    component.ngOnInit();
    tick(500);
    tick();

    expect(getAcls).not.toHaveBeenCalled();
    expect(component.aclsMap()['dmp-1']).toEqual(defaultAcls['dmp-1']);
    expect(component.aclsMap()['dap-1']).toEqual(defaultAcls['dap-1']);
  }));

  it('skips records the API returned without acls', fakeAsync(() => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    (component as any).dataService.dmps.set([{ id: 'dmp-9', name: 'No ACLs', owner: 'x', type: 'DMP' }]);
    (component as any).dataService.daps.set([]);

    component.ngOnInit();
    tick(500);
    tick();

    expect(component.aclsMap()['dmp-9']).toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  }));
});

describe('onPermissionsChanged()', () => {
  let component: MyRecordsComponent;
  let fixture: ComponentFixture<MyRecordsComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    const aclsForAsync = defaultAcls;
    const providers = makeProviders();
    const permsProviderIdx = providers.findIndex(p => (p as any).provide === PermissionsService);
    (providers[permsProviderIdx] as any).useValue = {
      getAcls: jest.fn().mockImplementation((record: { id: string }) =>
        of(aclsForAsync[record.id] ?? { read: [], write: [], admin: [], delete: [] }).pipe(delay(1))
      )
    };

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
      providers,
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MyRecordsComponent);
    component = fixture.componentInstance;
  });

  it('refetches all loaded records using the API for each record type', fakeAsync(() => {
    component.ngOnInit();
    tick(500);
    tick();

    const dataService = TestBed.inject(DataService);
    (dataService.resolveApiUrl as jest.Mock).mockImplementation((key: string) =>
      key === 'dmpAPI' ? 'http://mock-dmp/' : 'http://mock-dap/'
    );
    const getAcls = (component as any).permsSvc.getAcls as jest.Mock;
    getAcls.mockClear();
    component.selectedRecords.set([{ id: 'dmp-1', apiBase: 'http://mock-api/' }]);

    component.onPermissionsChanged();
    tick(10);

    expect(getAcls).toHaveBeenCalledTimes(3);
    expect(getAcls).toHaveBeenCalledWith({ id: 'dmp-1', apiBase: 'http://mock-dmp/' });
    expect(getAcls).toHaveBeenCalledWith({ id: 'dmp-2', apiBase: 'http://mock-dmp/' });
    expect(getAcls).toHaveBeenCalledWith({ id: 'dap-1', apiBase: 'http://mock-dap/' });
    expect(dataService.loadAll).toHaveBeenCalledTimes(1);
  }));

  it.each(['another record', 'no records'])(
    'refreshes the edited record if the user selects %s before the save completes',
    fakeAsync((nextSelection: string) => {
      component.ngOnInit();
      tick(500);
      tick();

      const updatedAcls = { ...defaultAcls['dmp-1'], read: ['newuser'] };
      const getAcls = (component as any).permsSvc.getAcls as jest.Mock;
      getAcls.mockImplementation((record: { id: string }) =>
        of(record.id === 'dmp-1' ? updatedAcls : defaultAcls[record.id]).pipe(delay(1))
      );
      component.selectedRecords.set([{ id: 'dmp-1', apiBase: 'http://mock-api/' }]);

      // The drawer emits its change event only after the pending save completes.
      of(void 0).pipe(delay(5)).subscribe(() => component.onPermissionsChanged());
      component.selectedRecords.set(nextSelection === 'another record'
        ? [{ id: 'dmp-2', apiBase: 'http://mock-api/' }]
        : []);
      tick(10);

      expect(component.aclsMap()['dmp-1']).toEqual(updatedAcls);
      expect(component.getSubjectsForLevel('dmp-1', 'view')).toContain('newuser');
    })
  );

  it('warns and keeps rendering when a refetch fails', fakeAsync(() => {
    component.ngOnInit();
    tick(500);
    tick();

    const getAcls = (component as any).permsSvc.getAcls as jest.Mock;
    getAcls.mockReturnValue(throwError(() => new Error('403')));
    const snack = jest.spyOn((component as any).snackBar, 'open');
    component.selectedRecords.set([{ id: 'dmp-1', apiBase: 'http://mock-api/' }]);

    expect(() => { component.onPermissionsChanged(); tick(10); }).not.toThrow();
    expect(snack).toHaveBeenCalled();
    // the previously loaded acls are still shown
    expect(component.aclsMap()['dmp-1']).toEqual(defaultAcls['dmp-1']);
  }));

  it('applies the refetched acls to the table', fakeAsync(() => {
    component.ngOnInit();
    tick(500);
    tick();

    const getAcls = (component as any).permsSvc.getAcls as jest.Mock;
    getAcls.mockReturnValue(
      of({ read: ['newuser'], write: [], admin: ['testuser'], delete: [] }).pipe(delay(1))
    );
    component.selectedRecords.set([{ id: 'dmp-1', apiBase: 'http://mock-api/' }]);

    component.onPermissionsChanged();
    tick(10);

    expect(component.aclsMap()['dmp-1'].read).toEqual(['newuser']);
  }));
});
