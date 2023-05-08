import { Component, OnInit, ViewChild } from '@angular/core';
import {faCheck,faFileEdit} from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { AppConfig } from 'src/app/config/app.config';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';



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

  constructor(private appConfig: AppConfig,private http: HttpClient) { 
  }

  async ngOnInit() {
    let promise = new Promise((resolve) => {
      this.appConfig.getRemoteConfig().subscribe(config => {
        this.dmpAPI = config.dmpAPI;
        resolve(this.dmpAPI);
        //GET method to get data
        this.fetchRecords(this.dmpAPI);
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
    this.dmpTable.filterGlobal(event.target.value, 'contains');
  }
}
