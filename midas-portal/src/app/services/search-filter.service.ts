import { Injectable } from '@angular/core';
import { Dmp } from '../pages/search/search.component';

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
  /**
   * Returns a new array containing only those DMPs matching the given criteria.
   */
  filterDmpList(list: Dmp[], c: FilterCriteria): Dmp[] {
    const q = c.query.trim().toLowerCase();
    const kws = c.keywords.map(kw => kw.trim().toLowerCase());

    return list.filter(dmp => {
      // 1) text search
      const textMatch =
        dmp.name.toLowerCase().includes(q) ||
        dmp.primaryContact.toLowerCase().includes(q) ||
        (dmp.organizationUnit ?? '').toLowerCase().includes(q);

      // 2) keywords
      const keywordMatch =
        kws.length === 0 ||
        kws.some(kw =>
          (dmp.keywords || []).some(dk => dk.toLowerCase().includes(kw))
        );

      // 3) org unit
      const orgMatch = !c.orgUnit || dmp.organizationUnit === c.orgUnit;

      // 4) owner
      const ownerMatch = !c.owner || dmp.primaryContact === c.owner;

      // 5) type
      const typeMatch = c.types.length === 0 || c.types.includes(dmp.type || '');

      // 6) status
      const statusMatch =
        c.statuses.length === 0 || c.statuses.includes(dmp.status || '');

      // 7) publication flag
      const paperMatch = !c.hasPublication || dmp.hasPublication === true;

      // 8) date
      let dateMatch = true;
      const modified = dmp.modifiedDate.getTime();

      switch (c.dateFilterType) {
        case 'exact':
          if (c.exactDate) {
            // This is to ensure that any record modified, at any time, on the chosen date
            // will count as a match, without accidentally including the next day.
            const start = new Date(c.exactDate);
            // set to midnight of that day
            start.setHours(0, 0, 0, 0);
            // define the end as exactly 24 hours later
            const end = new Date(start);
            end.setDate(start.getDate() + 1);
            // true if modifiedDate ≥ startOfDay AND < startOfNextDay
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
      parts.push(`Owner: ${c.owner}`);
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
