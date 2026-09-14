import { TestBed } from '@angular/core/testing';
import { DashboardService, DASHBOARD_SCHEMA_VERSION } from './dashboard.service';

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
      expect(dmp.columns).toBe(3);
      expect(dmp.rows).toBe(3);
    });
  });

  describe('existing user with current-version localStorage (user customizations)', () => {
    beforeEach(() => {
      localStorage.setItem('dashboardWidgets', JSON.stringify(VERSIONED_WIDGETS));
      localStorage.setItem('dashboardSchemaVersion', String(DASHBOARD_SCHEMA_VERSION));
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
      expect(service.addedWidgets()[0].columns).toBe(3);
      expect(service.addedWidgets()[0].rows).toBe(3);
    });

    it('removes the stale dashboardWidgets key on reset', () => {
      createService();
      const raw = localStorage.getItem('dashboardWidgets');
      if (raw) {
        const parsed = JSON.parse(raw);
        expect(parsed[0].columns).not.toBe(6);
      }
    });
  });

  describe('existing user with an older schema version', () => {
    beforeEach(() => {
      localStorage.setItem('dashboardWidgets', JSON.stringify(VERSIONED_WIDGETS));
      localStorage.setItem('dashboardSchemaVersion', String(DASHBOARD_SCHEMA_VERSION - 1));
    });

    it('discards the stale layout and resets to registry defaults', () => {
      createService();
      expect(service.addedWidgets().length).toBe(4);
      expect(service.addedWidgets()[0].columns).toBe(3);
    });
  });

  describe('corrupted localStorage', () => {
    beforeEach(() => {
      localStorage.setItem('dashboardWidgets', 'not valid json {{{');
      localStorage.setItem('dashboardSchemaVersion', String(DASHBOARD_SCHEMA_VERSION));
    });

    it('falls back to registry defaults when JSON is invalid', () => {
      createService();
      expect(service.addedWidgets().length).toBe(4);
      expect(service.addedWidgets()[0].label).toBe('DMP Table');
    });
  });

  it('DMP Table widget longLabel is "My Data Management Plans"', () => {
    const dmp = service.addedWidgets().find(w => w.label === 'DMP Table');
    expect(dmp?.longLabel).toBe('My Data Management Plans');
  });

  it('DAP Table widget longLabel is "My Digital Asset Publications"', () => {
    const dap = service.addedWidgets().find(w => w.label === 'DAP Table');
    expect(dap?.longLabel).toBe('My Digital Asset Publications');
  });

  it('should update widget position', () => {
    createService();
    service.updateWidgetPosition(0, 2);
    expect(service.addedWidgets().length).toBe(4);
  });
});
