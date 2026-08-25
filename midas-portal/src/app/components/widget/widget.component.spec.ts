import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal, Component, Type } from '@angular/core';
import { WidgetComponent } from './widget.component';
import { ConfigurationService } from 'oarng';
import { CredentialsService } from '../../services/credentials.service';
import { DashboardService } from '../../services/dashboard.service';
import { DataService } from '../../services/data.service';
import { Widget } from '../../models/dashboard';

// Mock component for testing
@Component({
  template: '<div>Mock Content</div>'
})
class MockContentComponent {}

describe('WidgetComponent', () => {
  let component: WidgetComponent;
  let fixture: ComponentFixture<WidgetComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      declarations: [WidgetComponent, MockContentComponent],
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule,
        MatIconModule,
        DragDropModule,
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
            token: signal('mock-token'),
            userId: signal('testUser')
          }
        },
        {
          provide: DashboardService,
          useValue: {}
        },
        {
          provide: DataService,
          useValue: {}
        }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(WidgetComponent);
    component = fixture.componentInstance;
    
    // Set the required data input
    const mockWidget: Widget = {
      id: 1,
      label: 'Test Widget',
      content: MockContentComponent as Type<unknown>,
      rows: 2,
      columns: 1
    };
    
    fixture.componentRef.setInput('data', mockWidget);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have showOptions signal initialized to false', () => {
    expect(component.showOptions()).toBe(false);
  });

  it('should toggle showOptions', () => {
    component.showOptions.set(true);
    expect(component.showOptions()).toBe(true);
  });

  describe('renderColumns', () => {
    // autoSpan widgets take half the grid so two always sit per row.
    it.each([
      [3, 2],
      [4, 2],
      [5, 2],
      [6, 3],
      [11, 5],
    ])('spans half of a %i-column grid when autoSpan is set', (colCount, expected) => {
      fixture.componentRef.setInput('data', { id: 5, label: 'T', content: MockContentComponent, rows: 3, columns: 3, autoSpan: true } as Widget);
      fixture.componentRef.setInput('colCount', colCount);
      fixture.detectChanges();
      expect(component.renderColumns()).toBe(expected);
    });

    it('still renders one per row when the grid is too narrow to split', () => {
      fixture.componentRef.setInput('data', { id: 5, label: 'T', content: MockContentComponent, rows: 3, columns: 3, autoSpan: true } as Widget);
      fixture.componentRef.setInput('colCount', 1);
      fixture.detectChanges();
      expect(component.renderColumns()).toBe(1);
    });

    // Spans clamp at render time only — the saved layout keeps the
    // user's preferred columns even when the window is transiently narrow.
    it('renders the preferred span when the grid has room', () => {
      fixture.componentRef.setInput('data', { id: 5, label: 'T', content: MockContentComponent, rows: 3, columns: 3 } as Widget);
      fixture.componentRef.setInput('colCount', 6);
      fixture.detectChanges();
      expect(component.renderColumns()).toBe(3);
    });

    it('clamps the span to the available columns without touching the data', () => {
      const widget = { id: 5, label: 'T', content: MockContentComponent as Type<unknown>, rows: 3, columns: 3 };
      fixture.componentRef.setInput('data', widget as Widget);
      fixture.componentRef.setInput('colCount', 2);
      fixture.detectChanges();
      expect(component.renderColumns()).toBe(2);
      expect(widget.columns).toBe(3);
    });

    it('never renders below one column', () => {
      fixture.componentRef.setInput('data', { id: 5, label: 'T', content: MockContentComponent, rows: 3, columns: 0 } as Widget);
      fixture.componentRef.setInput('colCount', 4);
      fixture.detectChanges();
      expect(component.renderColumns()).toBe(1);
    });
  });
});
