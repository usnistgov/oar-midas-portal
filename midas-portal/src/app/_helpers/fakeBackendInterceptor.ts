import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
//import dapData from '../../assets/json/dap.json';  
import dapData from 'src/assets/json/dap.json'
import dmpData from '../../assets/json/dmp.json';
import midasData from '../../assets/json/midas.json';
import reviewData from '../../assets/json/reviews.json';

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {

  constructor(private http: HttpClient) { }


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    console.log("request.url", request.url);

    if (request.url.indexOf('dap') > -1 && request.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: dapData }));
    }

    else if (request.url.indexOf('dmp') > -1 && request.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: dmpData }));
    }

    else if (request.url.indexOf('nps') > -1 && request.method === 'GET') {
      // change environment.json => to make fakebackendprovider work with NPS "NPSAPI": "https://mdsdev.nist.gov/nps/user/208821",
      return of(new HttpResponse({ status: 200, body: reviewData }));
    }

    if (request.url.indexOf('cloud') > -1 && request.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: midasData }));
      //return of(new HttpResponse({ status: 200}));
    }
    else if (request.url.indexOf('auth') > -1 && request.method === 'GET') {
      console.log("Fake back end so no authentication")
      var tempData = {
        "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJjaHJpc3RvcGhlci5kYXZpc0BuaXN0LmdvdnwxMjM0IiwiZXhwIjoxNjkxMDA1MDk4LCJjdXN0b21pemF0aW9uIjoiYXV0aG9yaXphdGlvbiJ9.NVFPprw74Z-ozQ372yrHiuJkXEqdWOAfi5lTc76y0dU",
        "userDetails": {
          "userId": "cnd7",
          "userName": "Christopher",
          "userLastName": "Davis",
          "userEmail": "christopher.davis@nist.gov",
          "userGroup": "Domain Users",
          "userDiv": "Applications Systems Division",
          "userDivNum": "183",
          "userOU": "Office of Information Systems Management"
        },
        "errorMessage": ""
      }
      return of(new HttpResponse({ status: 200, body: JSON.stringify(tempData) }));
    }
    return next.handle(request)
  }
  /*else if (request.url.indexOf('auth') > -1 && request.method === 'GET') {
    console.log("Fake back end so no authentication")
    return of(new HttpResponse({ status: 200, body: "" }));
  }*/
}

export let fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};
