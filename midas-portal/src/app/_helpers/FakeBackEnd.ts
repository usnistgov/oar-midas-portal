import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import fetchIntercept from 'fetch-intercept';

@Injectable()
export class FakeBackEnd {

    constructor(){}
    unregister(){
        fetchIntercept.register({
            request: function (url, config) {
                    console.log("fetch interceptor request")
                    if(url=='http://google.com'){
                        console.log('google one')
                    }else{
                    console.log('other one')
                    }
                // Modify the url or config here
                return [url, config];
            },
         
            requestError: function (error) {
                // Called when an error occured during another 'request' interceptor call
                console.log("error morray")
                return Promise.reject(error);
            },
         
            response: function (response) {
                // Modify the reponse object
                console.log("fetch interceptor response")
                return response;
            },
         
            responseError: function (error) {
                // Handle an fetch error
                console.log("no response")
                return Promise.reject(error);
            }
        });

    }
}
