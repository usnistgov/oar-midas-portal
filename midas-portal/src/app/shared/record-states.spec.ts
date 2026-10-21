import { readFileSync } from 'fs';
import { join } from 'path';
import { RECORD_STATES, statusClassFor, labelFor, knownStates } from './record-states';

// nistoar/midas/dbio/status.py. If the backend adds a state, this list and
// RECORD_STATES should be updated together.
const BACKEND_STATES = [
  'edit', 'processing', 'ready', 'submitted', 'accepted', 'in press', 'published', 'unwell'
];

describe('record states', () => {
  it('covers every state the backend defines', () => {
    expect([...RECORD_STATES].map(s => s.value).sort()).toEqual([...BACKEND_STATES].sort());
  });

  // The original bug was a state mapping to a class with no rule behind it, and
  // .status-chip paints white text on no background — so the badge vanished.
  // Reading the real stylesheet is the only way to catch a typo'd or deleted rule.
  it('backs every class it can return with a background in the stylesheet', () => {
    const sheet = readFileSync(join(__dirname, '../../styles.scss'), 'utf8');
    const classes = new Set([
      ...BACKEND_STATES.map(statusClassFor),
      statusClassFor('a-state-added-later'),
    ]);

    expect(classes.size).toBeGreaterThan(1);
    for (const cls of classes) {
      expect(sheet).toMatch(new RegExp(`\\.${cls}\\s*\\{[^}]*background-color:\\s*#`));
    }
  });

  it('colours by who the record is waiting on, not one colour per state', () => {
    expect(statusClassFor('ready')).toBe(statusClassFor('edit'));
    expect(statusClassFor('in press')).toBe(statusClassFor('processing'));
    expect(statusClassFor('published')).not.toBe(statusClassFor('edit'));
    // unwell needs somebody to act; processing does not
    expect(statusClassFor('unwell')).not.toBe(statusClassFor('processing'));
  });

  it('puts a state it has never heard of in the waiting group rather than hiding it', () => {
    expect(statusClassFor('some-state-added-later')).toBe(statusClassFor('processing'));
    expect(statusClassFor(undefined)).toBe(statusClassFor('processing'));
  });

  it('does not care how the record spells the state', () => {
    expect(statusClassFor('PUBLISHED')).toBe(statusClassFor('published'));
    expect(statusClassFor('In Press')).toBe(statusClassFor('in press'));
  });

  describe('labelFor', () => {
    it('gives the badge its display name', () => {
      expect(labelFor('in press')).toBe('In Press');
      expect(labelFor('unwell')).toBe('Unwell');
    });

    // the filter chips and the badges must not drift apart
    it('agrees with the value offered as a filter', () => {
      for (const state of RECORD_STATES) {
        expect(labelFor(state.value)).toBe(state.label);
      }
    });

    it('falls back to the raw value so a new backend state still reads as itself', () => {
      expect(labelFor('a-state-added-later')).toBe('a-state-added-later');
    });

    it('is empty for a record carrying no state', () => {
      expect(labelFor(undefined)).toBe('');
      expect(labelFor('')).toBe('');
    });
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

    // a saved value has to come back in the exact form the chips compare against
    it('canonicalises casing and stray whitespace', () => {
      expect(knownStates(['EDIT', ' In Press '])).toEqual(['edit', 'in press']);
    });

    it('leaves an empty selection alone', () => {
      expect(knownStates([])).toEqual([]);
    });
  });
});
