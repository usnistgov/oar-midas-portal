import { signal } from '@angular/core';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent Methods', () => {
  let component: any;

  beforeEach(() => {
    component = {
      isSidebarVisible: signal(false),
      isLoading: signal(false),
      selectedName: undefined,
      selectedOwner: undefined,
      selectedContact: undefined,
      onDateFilterChange: jasmine.createSpy('onDateFilterChange'),
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

  it('should clear filters', () => {
    component.selectedName = 'test';
    component.clearFilters();
    expect(component.selectedName).toBeUndefined();
    expect(component.isLoading()).toBe(true);
  });
});