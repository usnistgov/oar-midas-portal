import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchAPIService {

  constructor(private http: HttpClient)  { }
  //URL to get a list of mock contacts from MongoDB using python API
  peopleAPI = "https://nsd-test.nist.gov/nsd/api/v1/People/list"
  divisionAPI = ""

  initialParams = {
    "hasCPRRoles": false,
    "hasInactivePeople": false,
    "lastName": [
        ""
    ]
  }
  

  public get_NIST_Personnel(searchTerm: string){
    this.initialParams.lastName = [searchTerm];
    return this.http.post(this.peopleAPI, this.initialParams);
  }

}