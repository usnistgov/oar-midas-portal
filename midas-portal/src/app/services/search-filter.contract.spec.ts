import { FilterCriteria, buildSearchFilter } from './search-filter.service';

/**
 * The DBIO :selected endpoint validates a filter before it reaches Mongo. These are its rules,
 * mirrored from nistoar/midas/dbio/base.py (check_query_structure / _query_is_safe) so that a
 * builder change that the endpoint would reject fails here instead of in oar-docker.
 */
const OPERATORS = [
  '$and', '$or', '$not', '$nor', '$eq', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin',
  '$exists', '$type', '$mod', '$regex', '$text', '$search', '$all', '$elemMatch', '$size'
];
const UNSAFE = ['$where', '$expr', '$function', '$accumulator'];
const GROUPS = ['$and', '$or', '$nor'];
// _query_is_safe increments for every dict value and every array element, not just groups
const MAX_DEPTH = 20;

function findUnsafe(node: any): string[] {
  if (Array.isArray(node)) return node.flatMap(findUnsafe);
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) =>
      UNSAFE.includes(k) ? [k] : findUnsafe(v));
  }
  return [];
}

function findEmptyGroups(node: any): string[] {
  if (Array.isArray(node)) return node.flatMap(findEmptyGroups);
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) =>
      GROUPS.includes(k) && Array.isArray(v) && v.length === 0 ? [k] : findEmptyGroups(v));
  }
  return [];
}

function depthOf(node: any): number {
  if (Array.isArray(node)) return 1 + Math.max(0, ...node.map(depthOf));
  if (node && typeof node === 'object') {
    const values = Object.values(node);
    return values.length ? 1 + Math.max(...values.map(depthOf)) : 1;
  }
  return 0;
}

const BASE: FilterCriteria = {
  query: '', keywords: [], types: [], statuses: [],
  hasPublication: false, dateFilterType: 'between'
};

const CRITERIA: { name: string; criteria: FilterCriteria }[] = [
  { name: 'free text', criteria: { ...BASE, query: 'carbon dioxide' } },
  { name: 'text with metacharacters', criteria: { ...BASE, query: 'a(b)[c]*d' } },
  { name: 'keywords', criteria: { ...BASE, keywords: ['chem', 'bio'] } },
  { name: 'org unit', criteria: { ...BASE, orgUnit: 'Material Measurement Laboratory (641)' } },
  { name: 'owner, two tokens', criteria: { ...BASE, owner: 'Plante, Raymond' } },
  { name: 'status', criteria: { ...BASE, statuses: ['edit', 'published'] } },
  { name: 'has publication', criteria: { ...BASE, hasPublication: true } },
  { name: 'exact date', criteria: { ...BASE, dateFilterType: 'exact', exactDate: new Date(2025, 1, 27) } },
  { name: 'before date', criteria: { ...BASE, dateFilterType: 'before', beforeDate: new Date(2025, 1, 27) } },
  { name: 'after date', criteria: { ...BASE, dateFilterType: 'after', afterDate: new Date(2025, 1, 27) } },
  {
    name: 'date range',
    criteria: { ...BASE, dateFilterType: 'between', rangeStart: new Date(2025, 0, 1), rangeEnd: new Date(2025, 11, 31) }
  },
  {
    name: 'everything at once',
    criteria: {
      ...BASE, query: 'carbon', keywords: ['chem'], orgUnit: 'Material Measurement Laboratory',
      owner: 'Plante, Raymond', types: ['dmp'], statuses: ['edit'], hasPublication: true,
      dateFilterType: 'between', rangeStart: new Date(2025, 0, 1), rangeEnd: new Date(2025, 11, 31)
    }
  }
];

describe('search filter contract with the DBIO endpoint', () => {
  it.each(CRITERIA)('$name is a shape the endpoint accepts', ({ criteria }) => {
    const filter = buildSearchFilter(criteria) as any;
    expect(filter).not.toBeNull();

    // the endpoint only allows operators as top-level keys
    expect(Object.keys(filter).every(k => OPERATORS.includes(k))).toBe(true);
    expect(findUnsafe(filter)).toEqual([]);
    expect(findEmptyGroups(filter)).toEqual([]);
    expect(depthOf(filter)).toBeLessThanOrEqual(MAX_DEPTH);
  });

  it('never emits a bare field name at the top level', () => {
    const filter = buildSearchFilter({ ...BASE, query: 'x' }) as any;
    expect(Object.keys(filter)).toEqual(['$and']);
  });
});
