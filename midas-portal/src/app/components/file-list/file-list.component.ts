import { Component, OnInit, ViewChild } from '@angular/core';
import {faFileImport} from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { AppConfig } from 'src/app/config/app.config';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit {
  faFileImport=faFileImport;
  public records: any;
  public recordsApi: string;
  public data: any;
  public nextcloudUI: string;
  

  @ViewChild('filetable') fileTable: Table;

  constructor(private appConfig: AppConfig,private http:HttpClient) { 
    this.recordsApi = 'https://data.nist.gov/rmm/records'
  }



  async ngOnInit() {
    let promise = new Promise((resolve) => {
      this.appConfig.getRemoteConfig().subscribe(config => {
        this.nextcloudUI = config.nextcloudUI;
        resolve(this.nextcloudUI);
        //GET method to get data
        this.fetchRecords(this.nextcloudUI);
      });
    });
    
    //await this.getRecords()
    //this.data = this.records.ResultData
    //this.data = RECORD_DATA;
    console.log(this.data)
    
  }

  async getRecords() {
    let records;
    await fetch(this.recordsApi).then(r => r.json()).then(function (r) {
      return records = r
    })

    return this.records = Object(records)
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
    this.fileTable.filterGlobal(event.target.value, 'contains');
  }
}
