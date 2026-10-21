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

    it('matches the capitalisation the type chips actually emit', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, types: ['DMP'] }
      );
      expect(result).toHaveLength(1);
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

    it('matches a state whose name contains a space', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp({ status: 'in press' })],
        { ...BASE_CRITERIA, statuses: ['in press'] }
      );
      expect(result).toHaveLength(1);
    });

    it('matches a state however the record spells it', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp({ status: 'Published' })],
        { ...BASE_CRITERIA, statuses: ['published'] }
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

  describe('saved filters', () => {
    afterEach(() => localStorage.clear());

    it('drops a saved status this build no longer offers', () => {
      service.saveCriteria('mine', { ...BASE_CRITERIA, statuses: ['edit', 'reviewed'] });
      expect(service.loadCriteria('mine')!.statuses).toEqual(['edit']);
    });

    it('returns null when there is nothing saved under that name', () => {
      expect(service.loadCriteria('never-saved')).toBeNull();
    });

    it('lists the names it has saved', () => {
      service.saveCriteria('mine', BASE_CRITERIA);
      service.saveCriteria('other', BASE_CRITERIA);
      expect(service.listSavedNames().sort()).toEqual(['mine', 'other']);
    });

    it('lists nothing before anything is saved', () => {
      expect(service.listSavedNames()).toEqual([]);
    });
  });

  describe('filter summary', () => {
    const d = (iso: string) => new Date(iso + 'T12:00:00');

    it('says nothing when no filter is set', () => {
      expect(service.buildParts(BASE_CRITERIA)).toEqual([]);
      expect(service.buildText(BASE_CRITERIA)).toBe('');
    });

    it('names every selected status, spaces and all', () => {
      expect(service.buildParts({ ...BASE_CRITERIA, statuses: ['edit', 'in press'] }))
        .toEqual(['Status: edit, in press']);
    });

    it('summarises the non-date criteria in order', () => {
      expect(service.buildParts({
        ...BASE_CRITERIA,
        query: '  soil  ',
        keywords: ['erosion', 'runoff'],
        orgUnit: 'Material Measurement Laboratory',
        owner: 'atl1',
        types: ['dmp'],
        hasPublication: true,
      })).toEqual([
        'Search: \u201csoil\u201d',
        'Keywords: erosion, runoff',
        'Org Unit: Material Measurement Laboratory',
        'Owner/Contact: atl1',
        'Type: dmp',
        'Has Publication',
      ]);
    });

    it('joins the parts into the one-line summary', () => {
      expect(service.buildText({ ...BASE_CRITERIA, types: ['dmp'], statuses: ['edit'] }))
        .toBe('Type: dmp, Status: edit');
    });

    it('describes each kind of date filter', () => {
      expect(service.buildParts(
        { ...BASE_CRITERIA, dateFilterType: 'exact', exactDate: d('2026-03-24') }
      )).toEqual(['Date: Mar 24 2026']);

      expect(service.buildParts(
        { ...BASE_CRITERIA, dateFilterType: 'before', beforeDate: d('2026-03-24') }
      )).toEqual(['Before: Mar 24 2026']);

      expect(service.buildParts(
        { ...BASE_CRITERIA, dateFilterType: 'after', afterDate: d('2026-03-24') }
      )).toEqual(['After: Mar 24 2026']);

      expect(service.buildParts({
        ...BASE_CRITERIA, dateFilterType: 'between',
        rangeStart: d('2026-01-01'), rangeEnd: d('2026-03-24'),
      })).toEqual(['Date: Jan 1 2026 \u2013 Mar 24 2026']);
    });

    // a half-set range must not render a broken pill
    it('leaves a range out until both ends are chosen', () => {
      expect(service.buildParts(
        { ...BASE_CRITERIA, dateFilterType: 'between', rangeStart: d('2026-01-01') }
      )).toEqual([]);
    });
  });

  describe('date filter', () => {
    // The API sends "2025-02-27T19:21:23" with no offset, which JS parses as
    // local time, so the record is built the same way here.  A bare "2026-03-24"
    // would parse as UTC and land on the previous day west of Greenwich.
    const d = (iso: string) => new Date(iso + 'T12:00:00');
    const record = () => makeDmp({ modifiedDate: d('2026-03-24') });
    const matches = (c: Partial<FilterCriteria>) =>
      service.filterDmpOrDapList([record()], { ...BASE_CRITERIA, ...c } as FilterCriteria).length;

    it('matches an exact day and rejects its neighbours', () => {
      expect(matches({ dateFilterType: 'exact', exactDate: d('2026-03-24') })).toBe(1);
      expect(matches({ dateFilterType: 'exact', exactDate: d('2026-03-25') })).toBe(0);
      expect(matches({ dateFilterType: 'exact', exactDate: d('2026-03-23') })).toBe(0);
    });

    it('matches before a cut-off', () => {
      expect(matches({ dateFilterType: 'before', beforeDate: d('2026-06-01') })).toBe(1);
      expect(matches({ dateFilterType: 'before', beforeDate: d('2026-01-01') })).toBe(0);
    });

    it('matches after a cut-off', () => {
      expect(matches({ dateFilterType: 'after', afterDate: d('2026-01-01') })).toBe(1);
      expect(matches({ dateFilterType: 'after', afterDate: d('2026-06-01') })).toBe(0);
    });

    it('matches inside a range and rejects outside it', () => {
      expect(matches({
        dateFilterType: 'between', rangeStart: d('2026-01-01'), rangeEnd: d('2026-06-01'),
      })).toBe(1);
      expect(matches({
        dateFilterType: 'between', rangeStart: d('2025-01-01'), rangeEnd: d('2025-06-01'),
      })).toBe(0);
    });

    it('ignores a date mode whose date was never picked', () => {
      expect(matches({ dateFilterType: 'exact' })).toBe(1);
      expect(matches({ dateFilterType: 'before' })).toBe(1);
      expect(matches({ dateFilterType: 'after' })).toBe(1);
      expect(matches({ dateFilterType: 'between', rangeStart: d('2026-01-01') })).toBe(1);
    });
  });

  describe('owner search', () => {
    // the people picker hands back "Last, First"; records store "First Last"
    it('matches a contact entered as "Last, First"', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, owner: 'Chiang, Martin' }
      );
      expect(result).toHaveLength(1);
    });

    it('still matches a contact entered the way it is stored', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, owner: 'Martin Chiang' }
      );
      expect(result).toHaveLength(1);
    });

    it('rejects a contact that is not on the record', () => {
      const result = service.filterDmpOrDapList(
        [makeDmp()],
        { ...BASE_CRITERIA, owner: 'Nobody, Real' }
      );
      expect(result).toHaveLength(0);
    });
  });
});
