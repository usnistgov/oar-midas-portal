import { Component, OnInit, ViewChild } from '@angular/core';
import {faCheck,faFileEdit,faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { AppConfig } from 'src/app/config/app.config';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { MatDialogRef } from '@angular/material/dialog';
import { DmpListModalComponent } from '../../modals/dmp-list/dmp-list.component';
import { ConfigurationService } from 'oarng';

@Component({
  selector: 'app-dmp-list',
  templateUrl: './dmp-list.component.html',
  styleUrls: ['./dmp-list.component.css']
})
export class DmpListComponent implements OnInit {
  faUpRightAndDownLeftFromCenter=faUpRightAndDownLeftFromCenter;
  faCheck=faCheck;
  faFileEdit=faFileEdit;
  public records: any;
  public recordsApi: string;
  public data: any;
  loading: boolean = true;
  dmpAPI: string;
  dmpUI: string;
  ref: DynamicDialogRef;


  dataSource: any;

  @ViewChild('dmptable') dmpTable: Table;

  constructor(private configSvc: ConfigurationService ,private http: HttpClient, public datepipe:DatePipe,public dialogService: DialogService
    , public messageService: MessageService) { 
  }

  async ngOnInit() {
    let promise = new Promise((resolve) => {
        this.dmpUI = this.configSvc.getConfig()['dmpAPI'];
        this.dmpAPI = this.configSvc.getConfig()['dmpAPI'];
        resolve(this.dmpAPI);
        //GET method to get data
        this.fetchRecords(this.dmpAPI);
        if(typeof this.data !== 'undefined') {
          for (let i = 0; i<this.data.length;i++){
            this.data[i].status.modifiedDate = new Date(this.data[i].status.modifiedDate)
          }
        }
    

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
  show() {
    this.ref = this.dialogService.open(DmpListModalComponent, {
        data:this.data,
        width: '80%',
        contentStyle: { overflow: 'auto' },
        baseZIndex: 10000,
    });
  }

  linkto(item:string){
    this.dmpAPI.concat(item.toString())
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
