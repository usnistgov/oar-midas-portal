import { Injectable } from '@angular/core';
import { Dmp } from '../pages/search/search.component';
import { Dap } from '../pages/search/search.component'

export interface FilterCriteria {
  query: string;
  keywords: string[];
  orgUnit?: string;
  owner?: string;
  types: string[];
  statuses: string[];
  hasPublication: boolean;
  dateFilterType: 'exact' | 'before' | 'after' | 'between';
  exactDate?: Date;
  beforeDate?: Date;
  afterDate?: Date;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class SearchFilterService {
  private STORAGE_KEY_PREFIX = 'filter-';

  filterDmpOrDapList(list: (Dmp | Dap)[], c: FilterCriteria): (Dmp | Dap)[] {
  const normalize = (s: string) => (s || '').trim().toLowerCase();

  const normalizeOrgUnit = (s: string) =>
  normalize(s).replace(/\s*\(\d+\)$/, '');

  const normalizeOwner = (s: string) => {
  if (!s) return '';
  s = s.trim();
  // If format is "Last, First", switch to "First Last"
  if (s.includes(',')) {
    const [last, first] = s.split(',').map(part => part.trim());
    return `${first} ${last}`.toLowerCase();
  }
  return s.toLowerCase();
};
  const q = normalize(c.query);
  const kws = c.keywords.map(kw => normalize(kw));
  const orgUnitCriteria = normalizeOrgUnit(c.orgUnit || '');
  const ownerCriteria = normalizeOwner(c.owner || '');

  return list.filter(item => {
    const name = normalize((item as any).name);
    const primaryContact = normalize((item as any).primaryContact);
    const organizationUnit = normalize((item as any).organizationUnit);
    const owner = (item as any).owner?.toLowerCase() || '';
    const type = (item as any).type || '';
    const status = (item as any).status || '';
    const hasPublication = (item as any).hasPublication;
    const keywords = (item as any).keywords || [];
    const modifiedDate = (item as any).modifiedDate instanceof Date
      ? (item as any).modifiedDate
      : new Date((item as any).modifiedDate);

    // 1) text search
    const orgNames: string[] = (item as any).orgNames || [];
    const textMatch =
      !q ||
      name.includes(q) ||
      primaryContact.includes(q) ||
      organizationUnit.includes(q) ||
      orgNames.some(n => n.toLowerCase().includes(q));

    // 2) keywords
    const keywordMatch =
      kws.length === 0 ||
      kws.some(kw =>
        (keywords || []).some((dk: string) => dk.toLowerCase().includes(kw))
      );

    // 3) org unit — check ouName and all sub-levels (division, group)
    const orgNamesNormalized = orgNames.map(n => normalizeOrgUnit(n));
    const orgMatch = !orgUnitCriteria ||
      organizationUnit === orgUnitCriteria ||
      orgNamesNormalized.some(n => n === orgUnitCriteria);

    // 4) owner
    const ownerMatch = !ownerCriteria || 
      normalize(primaryContact).includes(ownerCriteria) || 
      normalize(owner).includes(ownerCriteria);

    // 5) type
    const typeMatch = c.types.length === 0 || c.types.includes(type);

    // 6) status
    const statusMatch =
      c.statuses.length === 0 || c.statuses.includes(status);

    // 7) publication flag (only filter if DMP)
    const paperMatch = !c.hasPublication || hasPublication === true;

    // 8) date
    let dateMatch = true;
    const modified = modifiedDate.getTime();

    switch (c.dateFilterType) {
      case 'exact':
        if (c.exactDate) {
          const start = new Date(c.exactDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setDate(start.getDate() + 1);
          dateMatch = modified >= start.getTime() && modified < end.getTime();
        }
        break;
      case 'before':
        if (c.beforeDate) {
          const before = new Date(c.beforeDate);
          before.setHours(0, 0, 0, 0);
          dateMatch = modified < before.getTime();
        }
        break;
      case 'after':
        if (c.afterDate) {
          const after = new Date(c.afterDate);
          after.setHours(23, 59, 59, 999);
          dateMatch = modified > after.getTime();
        }
        break;
      case 'between':
        if (c.rangeStart && c.rangeEnd) {
          const start = new Date(c.rangeStart);
          start.setHours(0, 0, 0, 0);
          const end = new Date(c.rangeEnd);
          end.setHours(23, 59, 59, 999);
          dateMatch = modified >= start.getTime() && modified <= end.getTime();
        }
        break;
    }

    return (
      textMatch &&
      keywordMatch &&
      orgMatch &&
      ownerMatch &&
      typeMatch &&
      statusMatch &&
      paperMatch &&
      dateMatch
    );
  });
}

  /**
   * Returns an array of pill labels for the given criteria.
   */
  buildParts(c: FilterCriteria): string[] {
    const parts: string[] = [];
    // 1) text
    if (c.query?.trim()) {
      parts.push(`Search: “${c.query.trim()}”`);
    }
    // 2) keywords
    if (c.keywords.length) {
      parts.push(`Keywords: ${c.keywords.join(', ')}`);
    }
    // 3) org-unit
    if (c.orgUnit) {
      parts.push(`Org Unit: ${c.orgUnit}`);
    }
    // 4) owner
    if (c.owner) {
      parts.push(`Owner/Contact: ${c.owner}`);
    }
    // 5) types
    if (c.types.length) {
      parts.push(`Type: ${c.types.join(', ')}`);
    }
    // 6) statuses
    if (c.statuses.length) {
      parts.push(`Status: ${c.statuses.join(', ')}`);
    }
    // 7) has publication
    if (c.hasPublication) {
      parts.push(`Has Publication`);
    }
    // date formatting helper (no commas, to avoid breaks in pills)
    const fmt = (d: Date) =>
      `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${d.getFullYear()}`;
    // 8) between
    if (c.dateFilterType === 'between' && c.rangeStart && c.rangeEnd) {
      parts.push(`Date: ${fmt(c.rangeStart)} – ${fmt(c.rangeEnd)}`);
    }
    // 9) exact
    if (c.dateFilterType === 'exact' && c.exactDate) {
      parts.push(`Date: ${fmt(c.exactDate)}`);
    }
    // 10) before
    if (c.dateFilterType === 'before' && c.beforeDate) {
      parts.push(`Before: ${fmt(c.beforeDate)}`);
    }
    // 11) after
    if (c.dateFilterType === 'after' && c.afterDate) {
      parts.push(`After: ${fmt(c.afterDate)}`);
    }
    return parts;
  }

  /**
   * Returns a single comma-joined string of all parts (for summary).
   */
  buildText(c: FilterCriteria): string {
    return this.buildParts(c).join(', ');
  }

  /** Persist a named filter in localStorage */
  saveCriteria(name: string, crit: FilterCriteria) {
    localStorage.setItem(
      this.STORAGE_KEY_PREFIX + name,
      JSON.stringify(crit)
    );
  }

  /** List all saved filter names */
  listSavedNames(): string[] {
    return Object.keys(localStorage)
      .filter(k => k.startsWith(this.STORAGE_KEY_PREFIX))
      .map(k => k.slice(this.STORAGE_KEY_PREFIX.length));
  }

  /** Load a saved criteria, or `null` if none */
  loadCriteria(name: string): FilterCriteria | null {
    const raw = localStorage.getItem(this.STORAGE_KEY_PREFIX + name);
    return raw ? (JSON.parse(raw) as FilterCriteria) : null;
  }
}


/** Fields the server search reads, mirroring what mapToDmp/mapToDap read. */
const ORG_PATHS = [
  'data.organizations.ouName',
  'data.organizations.divisionName',
  'data.organizations.groupName'
];

const MAX_TERM_LENGTH = 200;

/** Mongo rejects patterns beyond a size limit, and escaping can double a string. */
function term(value: string | null | undefined): string {
  return (value || '').trim().slice(0, MAX_TERM_LENGTH);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function contains(value: string) {
  return { $regex: escapeRegex(value), $options: 'i' };
}

/** NSD org names carry their code in parens; the client strips it from both sides. */
function orgEquals(value: string) {
  return { $regex: `^${escapeRegex(value)}(\\s*\\(\\d+\\))?$`, $options: 'i' };
}

/** status.modified is epoch seconds. Day boundaries are UTC because the table parses
 *  the timezone-less status.modifiedDate as local time. */
function dayStart(d: Date): number {
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 1000;
}

const DAY = 86400;

/**
 * Where the contact name lives differs by collection: mapToDmp joins a contributor's first and
 * last name, mapToDap reads contactPoint.fn. Searching the wrong one returns records whose
 * Primary Contact column is blank. $elemMatch keeps the tokens on the same person.
 */
function contactClause(tokens: string[], target: 'dmp' | 'dap') {
  if (target === 'dap') {
    return { $and: tokens.map(t => ({ 'data.contactPoint.fn': contains(t) })) };
  }
  return {
    'data.contributors': { $elemMatch: {
      primary_contact: 'Yes',
      $and: tokens.map(t => ({ $or: [{ firstName: contains(t) }, { lastName: contains(t) }] }))
    } }
  };
}

function nameTokens(value: string): string[] {
  return value.split(/[\s,]+/).filter(Boolean);
}

function dateClause(c: FilterCriteria): object | null {
  switch (c.dateFilterType) {
    case 'exact':
      if (!c.exactDate) return null;
      return { 'status.modified': { $gte: dayStart(c.exactDate), $lt: dayStart(c.exactDate) + DAY } };
    case 'before':
      if (!c.beforeDate) return null;
      return { 'status.modified': { $lt: dayStart(c.beforeDate) } };
    case 'after':
      if (!c.afterDate) return null;
      return { 'status.modified': { $gte: dayStart(c.afterDate) + DAY } };
    case 'between':
      if (!c.rangeStart || !c.rangeEnd) return null;
      return { 'status.modified': { $gte: dayStart(c.rangeStart), $lt: dayStart(c.rangeEnd) + DAY } };
  }
  return null;
}

/**
 * Translate the filter panel into a query the DBIO :selected endpoint accepts.
 * Returns null when nothing is set, which means "do not search".
 */
export function buildSearchFilter(c: FilterCriteria, target: 'dmp' | 'dap' = 'dmp'): object | null {
  const clauses: object[] = [];

  const query = term(c.query);
  if (query) {
    clauses.push({ $or: [
      { name: contains(query) },
      ...ORG_PATHS.map(p => ({ [p]: contains(query) })),
      // the contact name is stored split, so a two-word query has to match token by token
      contactClause(nameTokens(query), target)
    ]});
  }

  const keywords = (c.keywords || []).map(term).filter(Boolean);
  if (keywords.length) {
    clauses.push({ $or: keywords.map(k => ({ 'data.keywords': contains(k) })) });
  }

  const orgUnit = term(c.orgUnit).replace(/\s*\(\d+\)$/, '');
  if (orgUnit) {
    clauses.push({ $or: ORG_PATHS.map(p => ({ [p]: orgEquals(orgUnit) })) });
  }

  const owner = term(c.owner);
  if (owner) {
    clauses.push({ $or: [{ owner: contains(owner) }, contactClause(nameTokens(owner), target)] });
  }

  if (c.statuses?.length) {
    clauses.push({ 'status.state': { $in: c.statuses } });
  }

  if (c.hasPublication) {
    clauses.push({ 'data.dmpSearchable': 'yes' });
  }

  const dates = dateClause(c);
  if (dates) {
    clauses.push(dates);
  }

  return clauses.length ? { $and: clauses } : null;
}

/** Which collections to query. Only DMPs carry the publication flag. */
export function searchTargets(c: FilterCriteria): ('dmp' | 'dap')[] {
  const types = (c.types || []).map(t => t.toLowerCase()) as ('dmp' | 'dap')[];
  const targets: ('dmp' | 'dap')[] = types.length ? types : ['dmp', 'dap'];
  return c.hasPublication ? targets.filter(t => t === 'dmp') : targets;
}
