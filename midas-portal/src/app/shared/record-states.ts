// The states a record can hold, as defined by the backend in
// nistoar/midas/dbio/status.py. DMPs do not reach all of them in practice.
type StateGroup = 'action' | 'done' | 'waiting' | 'attention';

export interface RecordState {
  value: string;
  label: string;
  group: StateGroup;
}

// Workflow order, which is also the order the filter chips appear in.
export const RECORD_STATES: readonly RecordState[] = [
  { value: 'edit', label: 'Edit', group: 'action' },
  { value: 'ready', label: 'Ready', group: 'action' },
  { value: 'processing', label: 'Processing', group: 'waiting' },
  { value: 'submitted', label: 'Submitted', group: 'waiting' },
  { value: 'accepted', label: 'Accepted', group: 'waiting' },
  { value: 'in press', label: 'In Press', group: 'waiting' },
  { value: 'published', label: 'Published', group: 'done' },
  { value: 'unwell', label: 'Unwell', group: 'attention' },
];

// Amber while the record waits on its owner, grey while it waits on the system,
// green once it is out, red when somebody has to intervene.
const GROUP_CLASS: Record<StateGroup, string> = {
  action: 'status-warning',
  done: 'status-success',
  waiting: 'status-neutral',
  attention: 'status-attention',
};

const lookup = (status: string | null | undefined) =>
  RECORD_STATES.find(s => s.value === (status ?? '').trim().toLowerCase());

export function statusClassFor(status: string | null | undefined): string {
  return GROUP_CLASS[lookup(status)?.group ?? 'waiting'];
}

// Falls back to the raw value so a state added to the backend still reads as itself.
export function labelFor(status: string | null | undefined): string {
  return lookup(status)?.label ?? (status ?? '');
}

// Drops values this build has no chip for, so a stale saved filter cannot apply one.
export function knownStates(values: string[]): string[] {
  return values.map(v => lookup(v)?.value).filter((v): v is string => !!v);
}
