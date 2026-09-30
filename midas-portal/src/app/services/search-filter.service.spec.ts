import { TestBed } from '@angular/core/testing';
import { SearchFilterService, FilterCriteria, buildSearchFilter, searchTargets } from './search-filter.service';

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


describe('buildSearchFilter', () => {
  const crit = (o: Partial<FilterCriteria> = {}): FilterCriteria => ({ ...BASE_CRITERIA, ...o });
  const clauses = (c: FilterCriteria): any[] => ((buildSearchFilter(c) as any)?.$and ?? []);
  const clauseFor = (c: FilterCriteria, key: string): any =>
    clauses(c).find(cl => JSON.stringify(cl).includes(key));

  it('returns null when nothing is set', () => {
    expect(buildSearchFilter(crit())).toBeNull();
  });

  it('treats a whitespace-only value as unset', () => {
    expect(buildSearchFilter(crit({ query: '   ', owner: ' ', orgUnit: '  ' }))).toBeNull();
  });

  it('escapes regex metacharacters', () => {
    const c = clauseFor(crit({ query: 'a(b' }), 'name');
    expect(c.$or[0].name.$regex).toBe('a\\(b');
  });

  it('caps an over-long value', () => {
    const c = clauseFor(crit({ query: 'x'.repeat(500) }), 'name');
    expect(c.$or[0].name.$regex).toHaveLength(200);
  });

  it('searches name, every org level and the primary contact', () => {
    const keys = JSON.stringify(clauseFor(crit({ query: 'carbon' }), 'name'));
    expect(keys).toContain('data.organizations.ouName');
    expect(keys).toContain('data.organizations.divisionName');
    expect(keys).toContain('data.organizations.groupName');
    expect(keys).toContain('primary_contact');
  });

  it('matches keywords as case-insensitive substrings', () => {
    const c = clauseFor(crit({ keywords: ['Chem'] }), 'data.keywords');
    expect(c.$or[0]['data.keywords']).toEqual({ $regex: 'Chem', $options: 'i' });
  });

  it('matches org unit case-insensitively and tolerates the code suffix', () => {
    const c = clauseFor(crit({ orgUnit: 'Material Measurement Laboratory (641)' }), 'ouName');
    const re = c.$or[0]['data.organizations.ouName'];
    expect(re.$options).toBe('i');
    expect(re.$regex).toBe('^Material Measurement Laboratory(\\s*\\(\\d+\\))?$');
  });

  it('keeps owner tokens on the same contributor', () => {
    const c = clauseFor(crit({ owner: 'Plante, Raymond' }), 'primary_contact');
    const elem = c.$or[1]['data.contributors'].$elemMatch;
    expect(elem.primary_contact).toBe('Yes');
    expect(elem.$and).toHaveLength(2);
    expect(JSON.stringify(elem.$and)).toContain('Plante');
    expect(JSON.stringify(elem.$and)).toContain('Raymond');
  });

  it('filters status with $in', () => {
    expect(clauseFor(crit({ statuses: ['edit'] }), 'status.state'))
      .toEqual({ 'status.state': { $in: ['edit'] } });
  });

  it('adds the publication flag only when ticked', () => {
    expect(clauseFor(crit({ hasPublication: true }), 'dmpSearchable'))
      .toEqual({ 'data.dmpSearchable': 'yes' });
    expect(buildSearchFilter(crit({ hasPublication: false }))).toBeNull();
  });

  describe('dates', () => {
    // built from local date parts, so the expectation does not depend on the runner timezone
    const day = new Date(2025, 1, 27);
    const start = Date.UTC(2025, 1, 27) / 1000;
    const modified = (c: FilterCriteria) => clauseFor(c, 'status.modified')['status.modified'];

    it('uses epoch seconds on status.modified, not the ISO field', () => {
      expect(JSON.stringify(buildSearchFilter(crit({ dateFilterType: 'exact', exactDate: day }))))
        .not.toContain('modifiedDate');
      expect(modified(crit({ dateFilterType: 'exact', exactDate: day })).$gte)
        .toBe(start);
    });

    it('exact covers one whole day', () => {
      expect(modified(crit({ dateFilterType: 'exact', exactDate: day })))
        .toEqual({ $gte: start, $lt: start + 86400 });
    });

    it('before excludes the chosen day', () => {
      expect(modified(crit({ dateFilterType: 'before', beforeDate: day }))).toEqual({ $lt: start });
    });

    it('after starts the next day', () => {
      expect(modified(crit({ dateFilterType: 'after', afterDate: day })))
        .toEqual({ $gte: start + 86400 });
    });

    it('between covers both endpoints', () => {
      const end = new Date(2025, 2, 1);
      expect(modified(crit({ dateFilterType: 'between', rangeStart: day, rangeEnd: end })))
        .toEqual({ $gte: start, $lt: Date.UTC(2025, 2, 1) / 1000 + 86400 });
    });

    it('ignores an incomplete range', () => {
      expect(buildSearchFilter(crit({ dateFilterType: 'between', rangeStart: day }))).toBeNull();
    });
  });
});

describe('searchTargets', () => {
  const crit = (o: Partial<FilterCriteria> = {}): FilterCriteria => ({ ...BASE_CRITERIA, ...o });

  it('queries both collections when no type is chosen', () => {
    expect(searchTargets(crit())).toEqual(['dmp', 'dap']);
  });

  it('queries only the chosen types', () => {
    expect(searchTargets(crit({ types: ['dap'] }))).toEqual(['dap']);
  });

  it('drops DAPs when the publication filter is on', () => {
    expect(searchTargets(crit({ hasPublication: true }))).toEqual(['dmp']);
  });
});
