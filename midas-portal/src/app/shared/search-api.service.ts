import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ConfigurationService } from 'oarng';

@Injectable({
  providedIn: 'root'
})
export class SearchAPIService {
  //URL to get a list of mock contacts from MongoDB using python API
  peopleAPI = ""
  //#peopleAPI = "/foo/nsd/api/v1/People/list";
  orgAPI = ""
  //#orgAPI = "/foo/nsd/api/v1/NISTOUDivisionGroup"
  nsdtoken = ""

  nsdTokenURL = ""

  claims = {
    'iss': 'NIST_ASD',
    'iat': Date.now(),
    'exp': Date.now() + (1000 * 60 * 60 * 24 * 7),
    "aud": "ASD_API"
  }

  initialPeopleParams = {
    "hasCPRRoles": false,
    "hasInactivePeople": false,
    "lastName": [
        ""
    ]
  }

  ngOnInit() {
    
  }

  constructor(private http: HttpClient, private configSvc: ConfigurationService)  {
    let config = this.configSvc.getConfig()
    this.peopleAPI = config['peopleAPI'];
    if (! this.peopleAPI.endsWith('/'))
        this.peopleAPI += '/';
    this.orgAPI = config['orgAPI'];
    if (! this.orgAPI.endsWith('/'))
        this.orgAPI += '/';
    this.nsdTokenURL = config['nsdTokenURL'];
    if (! this.nsdTokenURL.endsWith('/'))
        this.nsdTokenURL += '/';
    console.log('people API: ' + this.peopleAPI);
    console.log('org API: ' + this.orgAPI);
    console.log('nsd token URL: ' + this.nsdTokenURL);
    
    this.getNSDToken();
   }

  public get_NIST_Personnel(searchTerm: string){
    if(this.nsdtoken == "") {
      this.getNSDToken();
    }
    this.initialPeopleParams.lastName = [searchTerm];
    const httpHeaders: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.nsdtoken
    });
    console.log('token: ' + this.nsdtoken);
    return this.http.post<any>(this.peopleAPI, this.initialPeopleParams, {headers: httpHeaders});
  }

  public get_NIST_Divisions(){
    if(this.nsdtoken == "") {
      this.getNSDToken();
    }
    const httpHeaders: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.nsdtoken
    });
    console.log('token: ' + this.nsdtoken);
    return this.http.get<any>(this.orgAPI, {headers: httpHeaders});
    //return this.http.post<any>(this.peopleAPI, this.initialParams, {headers: httpHeaders});
  }

  private getNSDToken(){
    return this.http.get(this.nsdTokenURL, {responseType: 'text'}).subscribe(
      (data) => {
          this.nsdtoken = data;
      }
    )
  }

}