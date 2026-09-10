import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal, WritableSignal, NO_ERRORS_SCHEMA } from '@angular/core';
import { ExpandedTableDialogComponent } from './expanded-table-dialog.component';
import { DataService } from '../../services/data.service';
import { CredentialsService } from '../../services/credentials.service';
import { Widget } from '../../models/dashboard';

class FakeContent {}

describe('ExpandedTableDialogComponent', () => {
  let myDmpsSignal: WritableSignal<any[]>;
  let myDapsSignal: WritableSignal<any[]>;

  const makeComponent = (widget: Partial<Widget>) => {
    TestBed.resetTestingModule();
    myDmpsSignal = signal<any[]>([]);
    myDapsSignal = signal<any[]>([]);

    TestBed.configureTestingModule({
      declarations: [ExpandedTableDialogComponent],
      imports: [NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { content: FakeContent, ...widget } },
        {
          provide: DataService,
          useValue: {
            myDmps: myDmpsSignal,
            myDaps: myDapsSignal,
            files: signal<any[]>([]),
            reviews: signal<any[]>([]),
            resolveApiUrl: jest.fn().mockReturnValue('http://mock-api/'),
          }
        },
        { provide: CredentialsService, useValue: { userId: signal('testUser') } },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    const fixture = TestBed.createComponent(ExpandedTableDialogComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  };

  // The dialog must key its columns/data off the stable widget id — keying
  // off the component class name broke every production build, where
  // minification renames classes.
  it('resolves columns from the widget id, independent of the class name', () => {
    const { component } = makeComponent({ id: 5, label: 'DMP Table' });
    expect(component.kind).toBe('dmp');
    expect(component.columns.length).toBeGreaterThan(0);
    expect(component.displayedColumns).toContain('name');
  });

  it('shows the scoped myDmps records for the DMP widget', () => {
    const { fixture, component } = makeComponent({ id: 5, label: 'DMP Table' });
    myDmpsSignal.set([{ id: 'dmp-1', name: 'Mine' }]);
    fixture.detectChanges();
    expect(component.dataSource.data.map((r: any) => r.id)).toEqual(['dmp-1']);
  });

  it('fills in reactively when data arrives after the dialog opens', () => {
    const { fixture, component } = makeComponent({ id: 6, label: 'DAP Table' });
    expect(component.dataSource.data.length).toBe(0);
    myDapsSignal.set([{ id: 'dap-1' }, { id: 'dap-2' }]);
    fixture.detectChanges();
    expect(component.dataSource.data.length).toBe(2);
  });

  it('renders no columns for an unknown widget id', () => {
    const { component } = makeComponent({ id: 42, label: 'Mystery' });
    expect(component.kind).toBeNull();
    expect(component.columns).toEqual([]);
  });

  it('builds the reviews link from the userId value', () => {
    const { component } = makeComponent({ id: 7, label: 'Reviews Table' });
    expect(component.linkto({ id: 'x1' })).toBe('http://mock-api/testUser/Dataset/DataSetDetails?id=x1');
  });

  it('uses the file location for Files table links', () => {
    const { component } = makeComponent({ id: 8, label: 'Files Table' });
    expect(component.linkto({ id: 'x1', location: '/files/example' })).toBe('/files/example');
  });
});
