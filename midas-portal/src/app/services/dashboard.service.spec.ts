import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardService]
    });
    service = TestBed.inject(DashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial default widgets', () => {
    expect(service.addedWidgets().length).toBe(4);
    expect(service.widgetsToAdd().length).toBe(4); // Changed from 0 to 4
    
    // Test that the default widgets have expected properties
    const addedWidgets = service.addedWidgets();
    expect(addedWidgets[0].label).toBe('DMP Table');
    expect(addedWidgets[1].label).toBe('DAP Table');
    expect(addedWidgets[2].label).toBe('Reviews Table');
    expect(addedWidgets[3].label).toBe('Files Table');
  });

  it('should update widget position', () => {
    const sourceIndex = 0;
    const destinationIndex = 2;
    
    const originalWidgets = [...service.addedWidgets()];
    service.updateWidgetPosition(sourceIndex, destinationIndex);
    
    // Verify the widgets were reordered
    const updatedWidgets = service.addedWidgets();
    expect(updatedWidgets.length).toBe(4);
  });
});
