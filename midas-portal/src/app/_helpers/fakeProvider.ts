import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';
import { userInfo } from 'os';

@Injectable()
export class FakeProvider implements HttpInterceptor {

  constructor(private http: HttpClient) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // array in local storage for registered users


    const testdata: any = {
        PageSize: 1,
        ResultCount: 8,
        ResultData: []
    }

    // wrap in delayed observable to simulate server api call
    return of(null).pipe(mergeMap(() => {
      console.log("request.url", request.url);

        // metrics
        // if (request.url.indexOf('usagemetrics/files') > -1 && request.method === 'GET') {
        //     return of(new HttpResponse({ status: 200, body: metricsRecordDetails }));
        // }

        if (request.url.indexOf('isPartOf.@id=ark:/88434/mds9911') > -1 && request.method === 'GET') {
            // console.log("Getting forensics")
            return of(new HttpResponse({ status: 200, body: testdata }));
        }

        if (request.url.indexOf('usagemetrics/files') > -1 && request.method === 'GET') 
        {
          console.log("Throw error...");
          throw new HttpErrorResponse(
            {
              error: 'internal error message goes here...',
              headers: request.headers,
              status: 500,
              statusText: 'internal error',
              url: request.url
            });
        }
      return next.handle(request);

  }))

      // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
      .pipe(materialize())
      .pipe(delay(500))
  .pipe(dematerialize());
  }
}

export let fakeProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeProvider,
  multi: true
};