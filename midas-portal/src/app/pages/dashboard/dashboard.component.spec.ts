import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ConfigurationService } from 'oarng';
import { DashboardComponent } from './dashboard.component';
import { DataService } from '../../services/data.service';
import { DashboardService } from '../../services/dashboard.service';
import { CredentialsService } from '../../services/credentials.service';
import { WebSocketService } from '../../services/websocket.service';
import { TourService } from '../../services/tour.service';

import { wrapGrid } from 'animate-css-grid';

jest.mock('animate-css-grid', () => ({
  wrapGrid: jest.fn(() => ({ unwrapGrid: jest.fn(), forceGridAnimation: jest.fn() }))
}));

describe('DashboardComponent Methods', () => {
  let component: any;

  beforeEach(() => {
    component = {
      isSidebarVisible: signal(false),
      isLoading: signal(false),
      selectedName: undefined,
      selectedOwner: undefined,
      selectedContact: undefined,
      onDateFilterChange: jest.fn(),
      toggleSidebar: DashboardComponent.prototype.toggleSidebar,
      clearFilters: DashboardComponent.prototype.clearFilters
    };
    
    // Bind methods to the mock component
    component.toggleSidebar = component.toggleSidebar.bind(component);
    component.clearFilters = component.clearFilters.bind(component);
  });

  it('should toggle sidebar visibility', () => {
    expect(component.isSidebarVisible()).toBe(false);
    component.toggleSidebar();
    expect(component.isSidebarVisible()).toBe(true);
  });

  it('should clear filters without faking a loading state', () => {
    component.selectedName = 'test';
    component.clearFilters();
    expect(component.selectedName).toBeUndefined();
    expect(component.isLoading()).toBe(false);
  });
});

describe('DashboardComponent grid lifecycle', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let disconnect: jest.Mock;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    jest.clearAllMocks();

    disconnect = jest.fn();
    (globalThis as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect = disconnect;
    };

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        {
          provide: DataService,
          useValue: {
            dmps: signal([]), daps: signal([]), files: signal([]), reviews: signal([]),
            myDmps: signal([]), myDaps: signal([]),
            loadAll: jest.fn().mockReturnValue(of(null)),
            loadReviews: jest.fn().mockReturnValue(of([])),
            resolveApiUrl: jest.fn().mockReturnValue(''),
            credsService: { token: signal('tok') }
          }
        },
        { provide: DashboardService, useValue: { addedWidgets: signal([]), widgetsToAdd: signal([]) } },
        { provide: CredentialsService, useValue: { token: signal('tok'), userId: signal('u') } },
        { provide: ConfigurationService, useValue: { getConfig: () => ({}) } },
        { provide: WebSocketService, useValue: { connect: jest.fn(), messages$: () => of() } },
        { provide: TourService, useValue: { shouldShowWelcome: () => false, startTour: jest.fn() } },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: MatSnackBar, useValue: { open: jest.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      // The real template needs the full Material module set; these tests are
      // about the grid lifecycle, so stand in the one element it reaches for.
      .overrideComponent(DashboardComponent, {
        set: { template: '<div #widgetsContainer></div>' }
      })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
  });

  // wrapGrid dereferences a required view child. Running it from the loadAll
  // response handler only worked because the network was slower than the view.
  it('wraps the grid in ngAfterViewInit, not in the data callback', () => {
    fixture.detectChanges();

    expect(wrapGrid).toHaveBeenCalledTimes(1);
    expect((wrapGrid as jest.Mock).mock.calls[0][0])
      .toBe(fixture.componentInstance.dashboard().nativeElement);
  });

  it('tears the grid and the resize listener down on destroy', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    fixture.detectChanges();

    const { unwrapGrid } = (wrapGrid as jest.Mock).mock.results[0].value;

    fixture.destroy();

    expect(unwrapGrid).toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeSpy.mockRestore();
  });
});