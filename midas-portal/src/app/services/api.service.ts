import { Injectable } from "@angular/core";

@Injectable({ 
    providedIn: 'root' 
  }) 
export class ApiService {
    public records: any;
    public recordsApi: string;
    public data: any;
    displayedColumns: string[] = ['title', 'date']
  
    constructor() { 
      this.recordsApi = 'https://data.nist.gov/rmm/records'
    }
    
      public getRecords() {
        let records;
        fetch(this.recordsApi).then(r => r.json()).then(function (r) {
          return records = r
        })
    
        return this.records = Object(records)
      }
}