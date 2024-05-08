import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as jwt from 'jsonwebtoken';

@Injectable({
  providedIn: 'root'
})
export class SearchAPIService {

  constructor(private http: HttpClient)  { }
  //URL to get a list of mock contacts from MongoDB using python API
  peopleAPI = "https://nsd-test.nist.gov/nsd/api/v1/People/list/"
  divisionAPI = ""
  APIsecret = "Tc567FxCs90tOvy6cWZyPamkC7c8hjbQzO2IKwMt7eVmdSIaNuqp"

  claims = {
    'iss': 'NIST_ASD',
    'iat': Date.now(),
    'exp': Date.now() + (1000 * 60 * 60 * 24 * 7),
    "aud": "ASD_API"
  }

  initialParams = {
    "hasCPRRoles": false,
    "hasInactivePeople": false,
    "lastName": [
        ""
    ]
  }
  

  public get_NIST_Personnel(searchTerm: string){
    var token = this.getJWTToken(this.APIsecret, this.claims);
    console.log('token: ' + token);
    this.initialParams.lastName = [searchTerm];
    const httpHeaders: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    return this.http.post(this.peopleAPI, this.initialParams, {headers: httpHeaders});
  }

  private getJWTToken(secret: string, payload: any): string {
    return jwt.sign(payload, secret);
  }

}