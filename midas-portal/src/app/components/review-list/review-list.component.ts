import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import {faUsersViewfinder,faBell} from '@fortawesome/free-solid-svg-icons';
import {Table} from 'primeng/table';
import { AppConfig } from 'src/app/config/app.config';
export interface NPSReview {
  title: string;
  owner: string;
  currentreviewer: string;
  currentreviewstop: string;
}

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
  public data: any;
  displayedColumns: string[] = ['title', 'owner', 'currentreviewer', 'currentreviewstop'];
  loading: boolean = true;

  @ViewChild('reviewtable') reviewTable: Table;

  constructor(private appConfig: AppConfig) { 
    
  }

  ngAfterViewInit() {
       
  }

  async ngOnInit() {

    let promise = new Promise((resolve) => {
      this.appConfig.getRemoteConfig().subscribe(config => {
        this.NPSAPI = config.NPSAPI;
        resolve(this.NPSAPI);
      });
    });
    promise.then(async ()=> {
        await this.getRecords();
    }
    ).then(() => {
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
    
    await fetch(this.NPSAPI, requestOptions).then(r => r.json()).then(function (r) {
      return records = r
    })

    this.loading = false;
    return this.records = Object(records);
  }

  titleClick() {
    console.log(this);
  }

  filterTable(event: any) {
    this.reviewTable.filterGlobal(event.target.value, 'contains');
  }
}