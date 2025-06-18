import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from 'oarng';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface NISTPerson {
  peopleID: number;
  lastName: string;
  firstName: string;
  midName: string;
  altLastName: string | null;
  altFirstName: string | null;
  buildingCode: string;
  buildingID: number;
  buildingName: string;
  divisionName: string;
  divisionNumber: string;
  divisionOrgID: number;
  emailAddress: string;
  faxNumber: string | null;
  nistUsername: string;
  orcid: string | null;
  ouName: string;
  ouNumber: string;
  ouOrgID: number;
  phoneNumber: string | null;
  site: string;
  siteID: number;
  staffType: string;
  staffTypeID: number;
  [key: string]: any; // For additional unknown properties
}

@Injectable({ providedIn: 'root' })
export class PeopleService {
  private http = inject(HttpClient);
  private configSvc = inject(ConfigurationService);

  private peopleAPI = '';
  private orgAPI = '';
  private personAPI = '';

  constructor() {
    const config = this.configSvc.getConfig();
    this.peopleAPI = config['peopleURL'] || '';
    this.orgAPI = config['orgURL'] || '';
    this.personAPI = config['personURL'] || '';
    // Optionally log for debugging
    // console.log('peopleAPI:', this.peopleAPI);
    // console.log('orgAPI:', this.orgAPI);
    // console.log('personAPI:', this.personAPI);
  }

  /**
   * Get a list of NIST personnel matching the search term.
   * @param searchTerm Query string, e.g. "lastName=Smith"
   */
  getNISTPersonnel(searchTerm: string): Observable<NISTPerson[]> {
    const url = `${this.peopleAPI}?${searchTerm}`;
    // console.log('peopleAPI:', url);
    return this.http.get<NISTPerson[]>(url).pipe(
      catchError(err => {
        console.error('Error fetching NIST personnel:', err);
        return of([]);
      })
    );
  }

  /**
   * Get a single NIST person by search term (e.g. ID or username).
   * @param searchTerm Path or query string for the person endpoint.
   */
  getNISTPerson(searchTerm: string): Observable<NISTPerson> {
    const url = `${this.personAPI}${searchTerm}`;
    // console.log('personAPI:', url);
    return this.http.get<NISTPerson>(url).pipe(
      catchError(err => {
        console.error('Error fetching NIST person:', err);
        return of({} as NISTPerson);
      })
    );
  }

  /**
   * Get a list of NIST organizations matching the search term.
   * @param searchTerm Query string, e.g. "divisionName=ITL"
   */
  getNISTOrganizations(searchTerm: string): Observable<any[]> {
    const url = `${this.orgAPI}?${searchTerm}`;
    // console.log('orgAPI:', url);
    return this.http.get<any[]>(url).pipe(
      catchError(err => {
        console.error('Error fetching NIST organizations:', err);
        return of([]);
      })
    );
  }
}