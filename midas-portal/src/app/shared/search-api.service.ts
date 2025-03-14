import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from 'oarng';
import { Observable } from 'rxjs';

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
  [key: string]: any; // Optional: Add this if there are additional unknown properties
}

@Injectable({
  providedIn: 'root'
})
export class SearchAPIService {

  constructor(private configSvc: ConfigurationService, private http: HttpClient)  { 
    let config = this.configSvc.getConfig()
    this.peopleAPI = config['peopleURL'];
    this.orgAPI = config['orgURL'];
    this.personAPI = config['personURL'];
    console.log('peopleAPI: ' + this.peopleAPI);
    console.log('orgAPI: ' + this.orgAPI);
    console.log('personAPI: ' + this.personAPI);
  }

  

  ngOnInit() {
  }
  //URL to get a list of mock contacts from MongoDB using python API
  peopleAPI = ""
  orgAPI = ""
  personAPI = ""

  
  initialParams = {
    "hasCPRRoles": false,
    "hasInactivePeople": false,
    "lastName": [
        ""
    ]
  }
  
  public get_NIST_Personnel(searchTerm: string){
    var url = this.peopleAPI + '?' + searchTerm;
    console.log('peopleAPI: ' + url);
    return this.http.get(url);
  }

  public get_NIST_Person(searchTerm: string){
    var url = this.personAPI + searchTerm;
    console.log('personAPI: ' + url);
    return this.http.get<NISTPerson>(url);
  }

  public get_NIST_Organizations(searchTerm: string) {
    var url = this.orgAPI + '?' + searchTerm;
    //console.log('orgAPI: ' + url);
    return this.http.get(url);
  }

}