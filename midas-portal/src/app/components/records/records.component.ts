import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import {MatSort, Sort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MenuItem} from 'primeng/api';
import { faHouse, faUser, faDashboard, faCloud, faClipboardList, faSearch,faFileCirclePlus, faPlus,faFileEdit } from '@fortawesome/free-solid-svg-icons';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import { Table } from 'primeng/table';
import { AppConfig } from 'src/app/config/app.config';


export interface MIDASRecord {
  name: string;
  owner: string;
  lastmodified: string;
}


@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  

  styleUrls: [
    './records.component.css'
  ]
})
export class RecordsComponent implements OnInit {
  items: MenuItem[];
  faPlus = faPlus;
  faHouse = faHouse;
  faUser = faUser;
  faDashboard =faDashboard;
  faCloud =faCloud;
  faClipboardList= faClipboardList;
  faSearch=faSearch;
  faFileCirclePlus=faFileCirclePlus;
  faFileEdit=faFileEdit;
  public records: any;
  public recordsApi: string;
  public data: any;
  loading: boolean = true;
  dapAPI: string;
  dapUI: string;

  displayedColumns: string[] = ['name', 'owner', 'modifiedDate'];
  dataSource: any;

  @ViewChild('recordsTable') recordsTable: Table;

  constructor(private appConfig: AppConfig) { 
    //this.recordsApi = 'https://data.nist.gov/rmm/records'
  }

  

  ngAfterViewInit() {
    
  }

  async ngOnInit() {
    let promise = new Promise((resolve) => {
      this.appConfig.getRemoteConfig().subscribe(config => {
        this.dapAPI = config.dapAPI;
        this.dapUI = config.dapUI;
        resolve(this.dapAPI);
      });
    });
    promise.then(async ()=> {
        await this.getRecords();
    }
    ).then(() => {
      console.log('DAP data retrieved');
      console.log('data: ' + this.records);
      this.data = JSON.parse(this.records);
    });
    
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

  titleClick() {
    console.log(this);
  }

  filterTable(event: any) {
    this.recordsTable.filterGlobal(event.target.value, 'contains');
  }
}
