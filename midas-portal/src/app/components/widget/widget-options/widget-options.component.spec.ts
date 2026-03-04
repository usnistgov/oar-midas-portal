import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal, Component, Type } from '@angular/core';
import { WidgetOptionsComponent } from './widget-options.component';
import { ConfigurationService } from 'oarng';
import { CredentialsService } from '../../../services/credentials.service';
import { DashboardService } from '../../../services/dashboard.service';
import { DataService } from '../../../services/data.service';
import { Widget } from '../../../models/dashboard';

// Mock component for testing
@Component({
  template: '<div>Mock Content</div>'
})
class MockContentComponent {}

describe('WidgetOptionsComponent', () => {
  let component: WidgetOptionsComponent;
  let fixture: ComponentFixture<WidgetOptionsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      declarations: [WidgetOptionsComponent, MockContentComponent],
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
            token: signal(null),
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
    fixture = TestBed.createComponent(WidgetOptionsComponent);
    component = fixture.componentInstance;
    
    // Set the required input with proper Widget structure
    const mockWidget: Widget = {
      id: 1,
      label: 'Test Widget',
      content: MockContentComponent as Type<unknown>,
      longLabel: 'Test Widget Long Label',
      rows: 2,
      columns: 2,
      backgroundColor: '#ffffff',
      textColor: '#000000'
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
});
