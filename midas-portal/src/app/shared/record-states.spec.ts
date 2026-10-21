import { RECORD_STATES, statusClassFor, knownStates } from './record-states';

// nistoar/midas/dbio/status.py. If the backend adds a state, this list and
// RECORD_STATES should be updated together.
const BACKEND_STATES = [
  'edit', 'processing', 'ready', 'submitted', 'accepted', 'in press', 'published', 'unwell'
];

describe('record states', () => {
  it('covers every state the backend defines', () => {
    expect([...RECORD_STATES].map(s => s.value).sort()).toEqual([...BACKEND_STATES].sort());
  });

  // the previous mapping returned '' for anything but edit and published, and the
  // badge paints white text on no background, so those states rendered white on white
  it('gives every state a badge that can be seen', () => {
    for (const state of BACKEND_STATES) {
      expect(statusClassFor(state)).not.toBe('');
    }
  });

  it('groups the states by who the record is waiting on', () => {
    const groupOf = (value: string) => RECORD_STATES.find(s => s.value === value)?.group;

    expect(['edit', 'ready'].map(groupOf)).toEqual(['action', 'action']);
    expect(['processing', 'submitted', 'accepted', 'in press'].map(groupOf))
      .toEqual(['waiting', 'waiting', 'waiting', 'waiting']);
    expect(groupOf('published')).toBe('done');
    expect(groupOf('unwell')).toBe('attention');
  });

  it('puts a state it has never heard of in the waiting group rather than hiding it', () => {
    expect(statusClassFor('some-state-added-later')).toBe('status-neutral');
    expect(statusClassFor(undefined)).toBe('status-neutral');
    expect(statusClassFor('')).toBe('status-neutral');
  });

  it('does not care how the record spells the state', () => {
    expect(statusClassFor('PUBLISHED')).toBe(statusClassFor('published'));
    expect(statusClassFor('In Press')).toBe(statusClassFor('in press'));
  });

  describe('knownStates', () => {
    it('keeps the values this build can show', () => {
      expect(knownStates(['edit', 'in press'])).toEqual(['edit', 'in press']);
    });

    // a filter saved while "reviewed" was offered would otherwise restore a value
    // that matches no record and has no chip to switch it off
    it('drops a value the build no longer offers', () => {
      expect(knownStates(['edit', 'reviewed'])).toEqual(['edit']);
    });

    it('leaves an empty selection alone', () => {
      expect(knownStates([])).toEqual([]);
    });
  });
});
