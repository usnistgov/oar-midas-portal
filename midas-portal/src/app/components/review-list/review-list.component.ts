import { Component, OnInit, ViewChild } from '@angular/core';
import {faUsersViewfinder,faBell} from '@fortawesome/free-solid-svg-icons';
import {Table} from 'primeng/table';
import { AppConfig } from 'src/app/config/app.config';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.css']
})
export class ReviewListComponent implements OnInit {
  faBell=faBell;
  faListCheck=faUsersViewfinder;
  public records: any;
  public NPSAPI: string;
  public npsUI: string;
  public data: any;

  loading: boolean = false;

  @ViewChild('reviewtable') reviewTable: Table;

  constructor(private appConfig: AppConfig,private http: HttpClient) { 
    
  }

  ngAfterViewInit() {
       
  }

  async ngOnInit() {

    let promise = new Promise((resolve) => {
      this.appConfig.getRemoteConfig().subscribe(config => {
        this.NPSAPI = config.NPSAPI;
        this.npsUI = config.npsUI;
        resolve(this.NPSAPI);
        //GET Using fake backend
        this.fetchRecords(this.NPSAPI);
      });
    });
    /* using fetch to retrieve data
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
    
    await fetch(this.NPSAPI, requestOptions).then(r => r.json()).then(function (r) {
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

  titleClick() {
    console.log(this);
  }

  filterTable(event: any) {
    this.reviewTable.filterGlobal(event.target.value, 'contains');
  }
}