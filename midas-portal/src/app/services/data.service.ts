import { Injectable, inject,effect,signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, catchError, map, of,forkJoin,tap } from 'rxjs';
import { Dap, Dmp, File, Review } from '../models/dashboard';
import { ConfigurationService } from 'oarng'
import { CredentialsService } from './credentials.service';


export interface UserDetails {
  userId: string;
  userEmail: string;
  userName: string;
  userLastName: string;
  winId: string;
  Group: string;
}

export interface UserResponse {
  userDetails: UserDetails;
}


@Injectable({ providedIn: 'root' })
export class DataService {
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);
  private _dmps = signal<Dmp[]>([]);
  readonly dmps = this._dmps.asReadonly();
  private _daps = signal<Dap[]>([]);
  readonly daps = this._daps.asReadonly();
  private _files = signal<File[]>([]);
  readonly files = this._files.asReadonly();
  private _reviews = signal<Review[]>([]);
  readonly reviews = this._reviews.asReadonly();

  private config = JSON.parse(localStorage.getItem('appConfig') || '{}') as Record<string, any>;
  private credsService = inject(CredentialsService);

  constructor(private configService: ConfigurationService) {
    effect(() => {
      
    });
  }

  public resolveApiUrl(configKey: string): string {
    return this.configService.getConfig()[configKey] || '';
  }

  private fetchData<T>(apiUrl: string, fallbackUrl: string, mapper: (raw: any) => T): Observable<T[]> {
    const authToken = this.credsService.token(); // Access the token from CredentialsService
    //console.log('[fetchData] Token:', authToken);
    const headers = { Authorization: `Bearer ${authToken}` };

    //console.log('[fetchData] Called with:', { apiUrl, fallbackUrl, authToken });

    return this.http.get<any[]>(apiUrl, {headers}).pipe(
      catchError(err => {
        console.error(`[fetchData] API call failed for ${apiUrl}, switching to fallback:`, err);
        this.snackBar.open('Could not reach API; loading fallback.', 'Dismiss', { duration: 3000 });
        return this.http.get<any[]>(fallbackUrl);
      }),
      map(raw => {
        //console.log('[fetchData] Raw data from API/fallback:', raw);
        const mapped = raw.map(mapper);
        //console.log('[fetchData] Mapped data:', mapped);
        return mapped;
      })
    );
}

  getDaps(): Observable<Dap[]> {
    const api = this.resolveApiUrl('dapAPI');
    const fallback = this.resolveApiUrl('dapJSON');
    //console.log('[getDaps] ConfigService:', this.configService);
    //console.log('[getDaps] dapAPI from config:', this.configService.getConfig()['dapAPI']);
    //console.log('[getDaps] Calling fetchData with:', { api, fallback });
    return this.fetchData<Dap>(api, fallback, this.mapToDap).pipe(
      map(data => {
        console.log('[getDaps] fetchData returned:', data);
        return data;
      })
    );
}

  getDmps(): Observable<Dmp[]> {
    const api = this.resolveApiUrl('dmpAPI');
    const fallback = this.resolveApiUrl('dmpJSON');
    //console.log('[getDmps] ConfigService:', this.configService);
    //console.log('[getDmps] dmpAPI from config:', this.configService.getConfig()['dmpAPI']);
    //console.log('[getDmps] Calling fetchData with:', { api, fallback });
    return this.fetchData<Dmp>(api, fallback, this.mapToDmp).pipe(
      map(data => {
        console.log('[getDmps] fetchData returned:', data);
        return data;
      })
    );
}

  getInfoText(): Observable<string> {
    const url = this.resolveApiUrl('infoURL');
    return this.http.get(url, { responseType: 'text' });
  }

  
  getFiles(): Observable<File[]> {
    const api = this.resolveApiUrl('dapAPI');
    const fallback = this.resolveApiUrl('fileJSON');
    //console.log('[getFiles] ConfigService:', this.configService);
    //console.log('[getFiles] fileAPI from config:', this.configService.getConfig()['fileAPI']);
    //console.log('[getFiles] Calling fetchData with:', { api, fallback });
    return this.fetchData<File>(api, fallback, this.mapToFile).pipe(
      map(data => {
        console.log('[getFiles] fetchData returned:', data);
        return data;
      })
    );

  }

  getReviews(): Observable<Review[]> {
    const npsapi = this.resolveApiUrl('NPSAPI');
    const fallback = this.resolveApiUrl('reviewJSON');
    const userId = this.credsService.userId?.() || this.credsService.userId || ''; // adapt to your service
    const api = npsapi + userId; // Append 'reviews' to the NPSAPI URL
    //console.log('[getReviews] ConfigService:', this.configService);
    //console.log('[getReviews] NPSAPI from config:', this.configService.getConfig()['NPSAPI']);
    //console.log('[getReviews] Calling fetchData with:', { api, fallback });
    return this.fetchData<Review>(api, fallback, this.mapToReview).pipe(
      map(data => {
        console.log('[getReviews] fetchData returned:', data);
        return data;
      })
    );
  }

  setDmps(dmps: Dmp[]) {
    //console.log('[setDmps] Setting DMPs:', dmps);
    this._dmps.set(dmps);
  }

  setDaps(daps: Dap[]) {
    //console.log('[setDaps] Setting DMPs:', daps);
    this._daps.set(daps);
  }

  setFiles(files: File[]) {
    //console.log('[setFiles] Setting Files:', files);
    this._files.set(files);
  }

  setReviews(reviews: Review[]) {
    //console.log('[setReviews] Setting Reviews:', reviews);
    this._reviews.set(reviews);
  }

  /**
 * Transforms a raw DMP JSON object into the Dmp model.
 * TODO: this is for dev purposes only --- SHOULD CHANGE!
 */
  private mapToDmp(raw: any): Dmp {
  // Find the primary NIST contact
  const primary = (raw.data?.contributors as any[] || [])
    .find(c => c.primary_contact === 'Yes');

  const primaryContact = primary
    ? `${primary.firstName ?? ''} ${primary.lastName ?? ''}`.trim()
    : '';

  return {
    id: raw.id,
    name: raw.name,
    owner: raw.owner,
    primaryContact,
    organizationUnit: raw.data?.organizations?.[0]?.ouName || '',
    modifiedDate: new Date(raw.status.modifiedDate),
    type: raw.type,
    status: raw.status.state,
    hasPublication: raw.data?.dmpSearchable === 'yes',
    keywords: raw.data?.keywords || []
  };
}

  /**
   * Transforms a raw DAP JSON object into the Dap model.
 * TODO: this is for dev purposes only --- SHOULD CHANGE!
   */
  private mapToDap(raw: any): Dap {
    // find the primary NIST contact
    const contactPoint = raw.data?.contactPoint;
    const primaryContact = contactPoint?.fn ?? '';

    return {
      id: raw.id,
      name: raw.name,
      owner: raw.owner,
      primaryContact,
      type: raw.type,
      location: raw.file_space.location,
      modifiedDate: new Date(raw.status.modifiedDate)
    };
  }

  /**
   * Transforms a raw DAP JSON object into the File model.
   * TODO: this is for dev purposes only --- SHOULD CHANGE!
   */
  private mapToFile(raw: any): File {
    return {
      id: raw.id,
      name: raw.name,
      usage: raw.file_space.usage,
      fileCount: raw.file_space.file_count,
      // this should be using the file_space.last_modified field instead, but the 
      // data being retrieved doesn't match the Date field type, so using record 
      // last modified date temporarily
      //modifiedDate: raw.file_space.last_modified,
      modifiedDate: raw.status.modifiedDate,
      location: raw.file_space.location
    };
  }

  /** 
   * Transforms a raw Review JSON object into the Review model.
   * TODO: this is for dev purposes only --- SHOULD CHANGE!
   */
  private mapToReview(raw: any): Review {
    return {
      id: raw.dataSetID,
      title: raw.title,
      submitterName: raw.submitterName,
      currentReviewer: raw.currentReviewer,
      currentReviewStep: raw.currentReviewStep
    };
  }

  // Getter for the DMP creation URL:
  get dmpUI(): string {
    return this.configService.getConfig()['dmpUI']
  }

  // Getter for the DAP creation URL:
  get dapUI(): string {
    return this.configService.getConfig()['dapUI'] 
  }

  // Getter for the File creation URL:
  get nextcloudUI(): string {
    return this.configService.getConfig()['nextcloudUI'] 
  }


  loadAll(): Observable<any> {
  return forkJoin({
    dmps: this.getDmps().pipe(catchError(err => {
      console.error('Failed to load DMPs:', err);
      return of([]);
    })),
    daps: this.getDaps().pipe(catchError(err => {
      console.error('Failed to load DAPs:', err);
      return of([]);
    })),
    files: this.getFiles().pipe(catchError(err => {
      console.error('Failed to load Files:', err);
      return of([]);
    })),
  }).pipe(
    tap(({ dmps, daps, files }) => {
      this._dmps.set(dmps);
      this._daps.set(daps);
      this._files.set(files);
    })
  );
}

loadReviews(): Observable<Review[]> {
  return this.getReviews().pipe(
    tap(reviews => {
      this._reviews.set(reviews);
    }),
    catchError(err => {
      console.error('Failed to load Reviews:', err);
      return of([]);
    })
  );  
}

}
