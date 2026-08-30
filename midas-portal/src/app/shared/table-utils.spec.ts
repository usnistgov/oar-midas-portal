import { recordFilterPredicate, getStatusClass } from './table-utils';

describe('recordFilterPredicate', () => {
  const record = {
    id: 'dmp-1',
    name: 'Soil Survey',
    owner: 'atl1',
    acls: { read: ['atl1', 'grp0:public'], write: ['atl1'], admin: [], delete: [] }
  };

  it('matches on a visible field', () => {
    expect(recordFilterPredicate(record, 'soil')).toBe(true);
    expect(recordFilterPredicate(record, 'atl1')).toBe(true);
  });

  // acls is the only object-valued field; the default predicate stringifies it
  // to "[object Object]", which makes "object" match every row.
  it('does not match on the stringified acls object', () => {
    expect(recordFilterPredicate(record, 'object')).toBe(false);
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
