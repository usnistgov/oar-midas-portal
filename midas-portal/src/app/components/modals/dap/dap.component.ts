import { Component, OnInit, ViewChild,Input } from '@angular/core';
import {MenuItem} from 'primeng/api';
import { faFileEdit,faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { AppConfig } from '../../../config/app.config'
//import { AppConfig } from 'src/app/config/app.config';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import {DynamicDialogConfig} from 'primeng/dynamicdialog';



@Component({
  selector: 'app-dap-modal',
  templateUrl: './dap.component.html',
  providers:[DialogService,MessageService],
  

  styleUrls: [
    './dap.component.css'
  ]
})
export class DapModalComponent implements OnInit {
  @Input() openedAsDialog: boolean = false;
  faUpRightAndDownLeftFromCenter=faUpRightAndDownLeftFromCenter;
  faFileEdit=faFileEdit;
  public records: any;
  public data: any;
  loading: boolean = true;
  dapAPI: string;
  dapUI: string;
  pre: string;
  after:string;
  statuses:any[];
  ref: DynamicDialogRef;
  public count: any;

  dataSource: any;

  @ViewChild('recordsTable') recordsTable: Table;

  constructor(private appConfig: AppConfig, private http: HttpClient,public datepipe:DatePipe,public dialogService: DialogService
                    , public messageService: MessageService, public config: DynamicDialogConfig) { 
  }

  

  ngAfterViewInit() {
    
  }

  async ngOnInit() {
    
    let promise = new Promise((resolve) => {
      this.appConfig.getRemoteConfig().subscribe(config => {
        this.dapAPI = config.dapAPI;
        resolve(this.dapAPI);
        this.data=this.config.data
        this.count=this.data.length
        //GET method to get data
        //this.fetchRecords(this.dapAPI);
        //for (let i = 0; i<this.data.length;i++){
          //this.data[i].status.modifiedDate = new Date(this.data[i].status.modifiedDate)
       // }
      });
    });
    
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
    this.statuses = [
      { label: 'published', value: 'published' },
      { label: 'edit', value: 'edit' },
      { label: 'reviewed', value: 'reviewed' }
  ];
  
    
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



  clear(table: Table) {
    table.clear();
}

  getStatus(status: string) {
    switch (status) {
        case 'published':
            return 'success';
        case 'edit':
            return 'warning';
        case 'reviewed':
            return 'danger';
    }
    return ""
  }

  titleClick() {
    console.log(this);
  }

  filterTable(event: any) {
    this.recordsTable.filterGlobal(event.target.value, 'contains');
  }
}
