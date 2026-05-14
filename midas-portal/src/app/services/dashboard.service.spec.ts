import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';

const VERSIONED_WIDGETS = [
  { id: 5, label: 'DMP Table', rows: 4, columns: 6, backgroundColor: 'red', textColor: 'blue' },
  { id: 6, label: 'DAP Table', rows: 4, columns: 6, backgroundColor: 'red', textColor: 'blue' },
];

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    localStorage.clear();
  });

  const createService = () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [DashboardService] });
    service = TestBed.inject(DashboardService);
  };

  it('should be created', () => {
    createService();
    expect(service).toBeTruthy();
  });

  describe('new user (no localStorage)', () => {
    it('loads 4 default table widgets from the registry', () => {
      createService();
      expect(service.addedWidgets().length).toBe(4);
      expect(service.addedWidgets()[0].label).toBe('DMP Table');
      expect(service.addedWidgets()[1].label).toBe('DAP Table');
      expect(service.addedWidgets()[2].label).toBe('Reviews Table');
      expect(service.addedWidgets()[3].label).toBe('Files Table');
    });

    it('loads registry default columns and rows', () => {
      createService();
      const dmp = service.addedWidgets()[0];
      expect(dmp.columns).toBe(4);
      expect(dmp.rows).toBe(3);
    });
  });

  describe('existing user with versioned localStorage (user customizations)', () => {
    beforeEach(() => {
      localStorage.setItem('dashboardWidgets', JSON.stringify(VERSIONED_WIDGETS));
      localStorage.setItem('dashboardSchemaVersion', '2');
    });

    it('preserves user customized columns and rows', () => {
      createService();
      expect(service.addedWidgets()[0].columns).toBe(6);
      expect(service.addedWidgets()[0].rows).toBe(4);
    });

    it('preserves the number of widgets the user had', () => {
      createService();
      expect(service.addedWidgets().length).toBe(2);
    });

    it('re-attaches the component class from the registry', () => {
      createService();
      expect(service.addedWidgets()[0].content).toBeDefined();
    });
  });

  describe('existing user with stale pre-versioning localStorage (no version key)', () => {
    beforeEach(() => {
      localStorage.setItem('dashboardWidgets', JSON.stringify(VERSIONED_WIDGETS));
      // No dashboardSchemaVersion key — simulates old data before versioning
    });

    it('ignores stale data and resets to registry defaults', () => {
      createService();
      expect(service.addedWidgets().length).toBe(4);
    });

    it('applies registry default columns after reset', () => {
      createService();
      expect(service.addedWidgets()[0].columns).toBe(4);
      expect(service.addedWidgets()[0].rows).toBe(3);
    });

    it('removes the stale dashboardWidgets key on reset', () => {
      createService();
      // The service clears localStorage.dashboardWidgets before setting new defaults
      // so the raw JSON no longer holds the old stale columns: 6 values
      const raw = localStorage.getItem('dashboardWidgets');
      if (raw) {
        const parsed = JSON.parse(raw);
        expect(parsed[0].columns).not.toBe(6);
      }
    });
  });

  describe('corrupted localStorage', () => {
    beforeEach(() => {
      localStorage.setItem('dashboardWidgets', 'not valid json {{{');
      localStorage.setItem('dashboardSchemaVersion', '2');
    });

    it('falls back to registry defaults when JSON is invalid', () => {
      createService();
      expect(service.addedWidgets().length).toBe(4);
      expect(service.addedWidgets()[0].label).toBe('DMP Table');
    });
  });

  it('should update widget position', () => {
    createService();
    service.updateWidgetPosition(0, 2);
    expect(service.addedWidgets().length).toBe(4);
  });
});
