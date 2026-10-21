/**
 * The states a record can hold, as defined by the backend in
 * nistoar/midas/dbio/status.py.  DMPs do not reach all of them in practice, but
 * both record types draw from the same list.
 *
 * The group decides the badge colour and carries the only judgement here: amber
 * while the record waits on its owner, grey while it waits on the system, green
 * once it is out, and red when it has stopped and somebody has to look at it.
 */
export type StateGroup = 'action' | 'done' | 'waiting' | 'attention';

export interface RecordState {
  value: string;
  label: string;
  group: StateGroup;
}

export const RECORD_STATES: readonly RecordState[] = [
  { value: 'edit',       label: 'Edit',       group: 'action'    },
  { value: 'ready',      label: 'Ready',      group: 'action'    },
  { value: 'processing', label: 'Processing', group: 'waiting'   },
  { value: 'submitted',  label: 'Submitted',  group: 'waiting'   },
  { value: 'accepted',   label: 'Accepted',   group: 'waiting'   },
  { value: 'in press',   label: 'In Press',   group: 'waiting'   },
  { value: 'published',  label: 'Published',  group: 'done'      },
  { value: 'unwell',     label: 'Unwell',     group: 'attention' },
];

const GROUP_CLASS: Record<StateGroup, string> = {
  action:    'status-warning',
  done:      'status-success',
  waiting:   'status-neutral',
  attention: 'status-attention',
};

/**
 * The badge class for a state.  A state the backend adds later, or one this
 * build does not know, still gets a readable badge rather than disappearing.
 */
export function statusClassFor(status: string | null | undefined): string {
  const state = RECORD_STATES.find(s => s.value === (status ?? '').toLowerCase());
  return GROUP_CLASS[state?.group ?? 'waiting'];
}

/** Keep only values this build knows, so a stale saved filter cannot apply one it cannot show. */
export function knownStates(values: string[]): string[] {
  return values.filter(v => RECORD_STATES.some(s => s.value === v));
}
