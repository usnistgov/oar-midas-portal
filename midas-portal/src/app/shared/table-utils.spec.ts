import { recordFilterPredicate, getStatusClass } from './table-utils';

describe('recordFilterPredicate', () => {
  const record = {
    id: 'dmp-1',
    name: 'Soil Survey',
    owner: 'atl1',
    title: undefined,
    modifiedDate: new Date(2026, 0, 15),
    keywords: ['erosion', 'runoff'],
    acls: { read: ['atl1', 'grp0:public'], write: ['atl1'], admin: [], delete: [] }
  };

  it('matches on visible text fields', () => {
    expect(recordFilterPredicate(record, 'soil')).toBe(true);
    expect(recordFilterPredicate(record, 'atl1')).toBe(true);
  });

  it('matches on array members', () => {
    expect(recordFilterPredicate(record, 'runoff')).toBe(true);
  });

  it('matches a date by what the user reads, not its timezone name', () => {
    expect(recordFilterPredicate(record, '2026')).toBe(true);
    expect(recordFilterPredicate(record, 'gmt')).toBe(false);
    expect(recordFilterPredicate(record, 'standard')).toBe(false);
  });

  // These all matched *every* row under Material's default predicate.
  it('does not match on stringified objects or unset fields', () => {
    expect(recordFilterPredicate(record, 'object')).toBe(false);
    expect(recordFilterPredicate(record, 'undefined')).toBe(false);
  });

  it('does not leak acl subjects that appear nowhere else', () => {
    expect(recordFilterPredicate(record, 'grp0:public')).toBe(false);
  });

  it('returns false when nothing matches', () => {
    expect(recordFilterPredicate(record, 'zzz')).toBe(false);
  });
});

describe('getStatusClass', () => {
  it('maps a known status', () => {
    expect(getStatusClass('published')).toBeTruthy();
  });
});
