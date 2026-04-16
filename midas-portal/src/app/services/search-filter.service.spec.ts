import { TestBed } from '@angular/core/testing';
import { SearchFilterService, FilterCriteria } from './search-filter.service';

const BASE_CRITERIA: FilterCriteria = {
  query: '',
  keywords: [],
  types: [],
  statuses: [],
  hasPublication: false,
  dateFilterType: 'between',
};

const makeDmp = (overrides: any = {}) => ({
  id: 'mdm1:0001',
  name: 'Test DMP',
  owner: 'TestId',
  primaryContact: 'Martin Chiang',
  organizationUnit: 'Material Measurement Laboratory',
  orgNames: [
    'Material Measurement Laboratory',
    'Biosystems and Biomaterials Division',
    'Biomaterials Group',
  ],
  type: 'dmp',
  status: 'edit',
  hasPublication: false,
  keywords: ['testd'],
  modifiedDate: new Date('2026-03-24'),
  ...overrides,
});

describe('SearchFilterService', () => {
  let service: SearchFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('text search', () => {
    it('finds record by name', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, query: 'Test DMP' }
      );
      expect(result).toHaveLength(1);
    });

    it('finds record by primary contact', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, query: 'Martin' }
      );
      expect(result).toHaveLength(1);
    });

    it('finds record by ouName (top-level org)', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, query: 'Material Measurement' }
      );
      expect(result).toHaveLength(1);
    });

    it('finds record by divisionName', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, query: 'Biosystems and Biomaterials Division' }
      );
      expect(result).toHaveLength(1);
    });

    it('finds record by groupName', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, query: 'Biomaterials Group' }
      );
      expect(result).toHaveLength(1);
    });

    it('finds record by partial groupName', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, query: 'Biomaterials' }
      );
      expect(result).toHaveLength(1);
    });

    it('does not find record when query matches nothing', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, query: 'no match xyz' }
      );
      expect(result).toHaveLength(0);
    });

    it('returns all records when query is empty', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp(), makeDmp({ id: 'mdm1:0002', name: 'Other DMP' })],
        { ...BASE_CRITERIA, query: '' }
      );
      expect(result).toHaveLength(2);
    });

    it('handles record with no orgNames gracefully', () => {
      const dmp = makeDmp({ orgNames: undefined });
      const result = service.filterDmpOrDapList(
        [dmp],
        { ...BASE_CRITERIA, query: 'Biomaterials' }
      );
      expect(result).toHaveLength(0);
    });

    it('searches across multiple organizations in orgNames', () => {
      const dmp = makeDmp({
        orgNames: [
          'Material Measurement Laboratory',
          'Biosystems and Biomaterials Division',
          'Biomaterials Group',
          'Information Technology Laboratory',
          'Software and Systems Division',
          'Applied Software Group',
        ],
      });
      const result = service.filterDmpOrDapList(
        [dmp],
        { ...BASE_CRITERIA, query: 'Applied Software' }
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('org unit filter (exact match)', () => {
    it('matches when orgUnit equals organizationUnit exactly', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, orgUnit: 'Material Measurement Laboratory' }
      );
      expect(result).toHaveLength(1);
    });

    it('matches by divisionName via orgUnit filter', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, orgUnit: 'Biosystems and Biomaterials Division' }
      );
      expect(result).toHaveLength(1);
    });

    it('matches by groupName via orgUnit filter', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, orgUnit: 'Biomaterials Group' }
      );
      expect(result).toHaveLength(1);
    });

    it('strips org number suffix from orgUnit filter value', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, orgUnit: 'Biosystems and Biomaterials Division (644)' }
      );
      expect(result).toHaveLength(1);
    });

    it('does not match a record whose orgNames do not include the filter value', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, orgUnit: 'Some Other Division' }
      );
      expect(result).toHaveLength(0);
    });
  });

  describe('keyword filter', () => {
    it('finds record matching a keyword', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, keywords: ['testd'] }
      );
      expect(result).toHaveLength(1);
    });

    it('excludes record not matching a keyword', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, keywords: ['nope'] }
      );
      expect(result).toHaveLength(0);
    });
  });

  describe('type filter', () => {
    it('finds dmp when type filter includes dmp', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, types: ['dmp'] }
      );
      expect(result).toHaveLength(1);
    });

    it('excludes dmp when type filter is dap only', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, types: ['dap'] }
      );
      expect(result).toHaveLength(0);
    });
  });

  describe('status filter', () => {
    it('finds record matching status', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, statuses: ['edit'] }
      );
      expect(result).toHaveLength(1);
    });

    it('excludes record not matching status', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, statuses: ['published'] }
      );
      expect(result).toHaveLength(0);
    });
  });
});
