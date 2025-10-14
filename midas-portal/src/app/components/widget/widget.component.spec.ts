import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
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
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: ConfigurationService,
          useValue: {
            getConfig: jasmine.createSpy('getConfig').and.returnValue({})
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
});
