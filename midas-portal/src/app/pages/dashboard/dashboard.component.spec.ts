import { signal } from '@angular/core';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent Methods', () => {
  let component: any;
  let dashboardElement: { offsetWidth: number };

  beforeEach(() => {
    dashboardElement = { offsetWidth: 0 };
    component = {
      isSidebarVisible: signal(false),
      isLoading: signal(false),
      selectedName: undefined,
      selectedOwner: undefined,
      selectedContact: undefined,
      onDateFilterChange: jest.fn(),
      dashboard: () => ({ nativeElement: dashboardElement }),
      toggleSidebar: DashboardComponent.prototype.toggleSidebar,
      clearFilters: DashboardComponent.prototype.clearFilters,
      getGridColumnCount: DashboardComponent.prototype.getGridColumnCount
    };
    
    // Bind methods to the mock component
    component.toggleSidebar = component.toggleSidebar.bind(component);
    component.clearFilters = component.clearFilters.bind(component);
    component.getGridColumnCount = component.getGridColumnCount.bind(component);
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

  it.each([
    [415, 1],
    [416, 2],
    [632, 2],
    [847, 2],
    [848, 4],
    [1064, 4],
  ])('uses a one-column or even grid at %ipx', (width, expected) => {
    dashboardElement.offsetWidth = width;
    expect(component.getGridColumnCount()).toBe(expected);
  });
});
