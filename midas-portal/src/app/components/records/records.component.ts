import { Component, OnInit, ViewChild } from '@angular/core';
import {MenuItem} from 'primeng/api';
import { faHouse, faUser, faDashboard, faCloud, faClipboardList, faSearch,faFileCirclePlus, faPlus,faFileEdit } from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { AppConfig } from '../../config/app.config'
//import { AppConfig } from 'src/app/config/app.config';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  

  styleUrls: [
    './records.component.css'
  ]
})
export class RecordsComponent implements OnInit {
  faFileEdit=faFileEdit;
  public records: any;
  public data: any;
  loading: boolean = true;
  dapAPI: string;
  dapUI: string;
  pre: string;
  after:string;

  dataSource: any;

  @ViewChild('recordsTable') recordsTable: Table;

  constructor(private appConfig: AppConfig, private http: HttpClient) { 
  }

  

  ngAfterViewInit() {
    
  }

  async ngOnInit() {
    this.pre="pre"
    let promise = new Promise((resolve) => {
      this.appConfig.getRemoteConfig().subscribe(config => {
        this.dapAPI = config.dapAPI;
        resolve(this.dapAPI);
        //GET method to get data
        this.fetchRecords(this.dapAPI);
      });
    });
    this.after="after"
    // Retrieving data using fetch functions 
    /*
    promise.then(async ()=> {
        await this.getRecords();
    }
    ).then(() => {
      console.log('DAP data retrieved');
      console.log(this.records);
      this.data = this.records;
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
    
    await fetch(this.dapAPI).then(r => r.json()).then(function (r) {
      return records = r
    })

    this.loading = false;
    return this.records = Object(records);
  }

  public fetchRecords(url:string){
    this.http.get(url)
    .pipe(map((responseData: any)  => {
      return responseData
    })). subscribe(records => {
      this.data = records
    })
  }

  dateformat(date:string){
    if(date.length==19){
      var tmp = date.substring(0,10)
      var split = tmp.split("-")
      var newdate = split[1].concat("/",split[2],"/",split[0])
      return newdate
    }else{
      return date
    }
  }

  titleClick() {
    console.log(this);
  }

  filterTable(event: any) {
    this.recordsTable.filterGlobal(event.target.value, 'contains');
  }
}
