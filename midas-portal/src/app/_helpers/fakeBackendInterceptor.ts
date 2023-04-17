import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap,catchError, map,delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';
import { userInfo } from 'os';
import dapData from '../../assets/json/dap.json';  
import dmpData from '../../assets/json/dmp.json';  

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {

  constructor(private http: HttpClient) { }


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // array in local storage for registered users
      console.log("request.url", request.url);
      if (request.url.indexOf('dap') > -1 && request.method === 'GET') {
        // console.log("Getting forensics")
        return of(new HttpResponse({ status: 200, body: dapData }));
    }else if (request.url.indexOf('dmp') > -1 && request.method === 'GET') {
        // console.log("Getting forensics")
        return of(new HttpResponse({ status: 200, body: dmpData }));
    }
      return next.handle(request)
}
}

export let fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};