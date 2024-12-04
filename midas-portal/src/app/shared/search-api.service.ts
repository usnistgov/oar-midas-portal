import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

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
    var url = 'http://localhost:9092/oar1/people?with_firstName=' + searchTerm + '&with_lastName=' + searchTerm;
    return this.http.get(url);
  }

  public get_NIST_Organizations(searchTerm: string) {
    var url = 'http://localhost:9092/oar1/orgs?with_orG_Name=' + searchTerm;
    return this.http.get(url);
  }

}