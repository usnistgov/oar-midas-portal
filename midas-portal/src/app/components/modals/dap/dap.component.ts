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

interface Column {
  field: string;
  header: string;
}

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
  public data: any=[];
  loading: boolean = true;
  dapAPI: string;
  dapUI: string;
  statuses:any[];
  ref: DynamicDialogRef;
  public count: any;

  cols!: Column[];

    _selectedColumns!: Column[];

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

        this.cols = [
          { field: 'name', header: 'Name' },
          { field: 'owner', header: 'Owner' },
          { field: "title", header: 'Title' },
          { field: 'type', header: 'Type' },
          { field: 'id', header: 'ID'},
          { field: 'doi', header: 'DOI'}
      ];

      this._selectedColumns = this.cols;

      });
    });

    this.statuses = [
      { label: 'published', value: 'published' },
      { label: 'edit', value: 'edit' },
      { label: 'reviewed', value: 'reviewed' }
  ];
  
  }

    @Input() get selectedColumns(): any[] {
      return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
      //restore original order
      this._selectedColumns = this.cols.filter((col) => val.includes(col));
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
