import { Component, OnInit, ViewChild } from '@angular/core';
import {faCheck,faFileEdit} from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { AppConfig } from 'src/app/config/app.config';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-dmp-list',
  templateUrl: './dmp-list.component.html',
  styleUrls: ['./dmp-list.component.css']
})
export class DmpListComponent implements OnInit {
  faCheck=faCheck;
  faFileEdit=faFileEdit;
  public records: any;
  public recordsApi: string;
  public data: any;
  loading: boolean = true;
  dmpAPI: string;
  dmpUI: string;


  dataSource: any;

  @ViewChild('dmptable') dmpTable: Table;

  constructor(private appConfig: AppConfig,private http: HttpClient, public datepipe:DatePipe) { 
  }

  async ngOnInit() {
    let promise = new Promise((resolve) => {
      this.appConfig.getRemoteConfig().subscribe(config => {
        this.dmpAPI = config.dmpAPI;
        resolve(this.dmpAPI);
        //GET method to get data
        this.fetchRecords(this.dmpAPI);
        for (let i = 0; i<this.data.length;i++){
          this.data[i].status.modifiedDate = new Date(this.data[i].status.modifiedDate)
        }
      });
    });

    // Retrieving data using fetch functions 
    /*
    promise.then(async ()=> {
        await this.getRecords();
    }
    ).then(() => {
      this.data = JSON.parse(this.records);
    });
    */
  }

  async getRecords(){
    
    let records;

    const headerDict = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'rejectUnauthorized': 'false'
    }
    
    const requestOptions = {                                                                                                                                                                                 
      headers: new Headers(headerDict)
    };
    
    await fetch(this.dmpAPI).then(r => r.json()).then(function (r) {
      return records = r
    })

    this.loading = false;
    return this.records = Object(records);
  }

  private fetchRecords(url:string){
    this.http.get(url)
    .pipe(map((responseData: any)  => {
      return responseData
    })). subscribe(records => {
      this.data = records
    })
  }
  clear(table: Table) {
    table.clear();
}


  titleClick() {
    console.log(this);
  }

  filterTable(event: any) {
    this.dmpTable.filterGlobal(event.target.value, 'contains');
  }
}
