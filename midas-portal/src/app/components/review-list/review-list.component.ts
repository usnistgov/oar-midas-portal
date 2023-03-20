import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import {faUsersViewfinder,faBell} from '@fortawesome/free-solid-svg-icons';
import {Table} from 'primeng/table';
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
  public recordsApi: string;
  public data: any;
  displayedColumns: string[] = ['title', 'owner', 'currentreviewer', 'currentreviewstop'];
  loading: boolean = true;

  @ViewChild('reviewtable') reviewTable: Table;

  constructor() { 
    this.recordsApi = 'https://localhost:5000/user/208821';
  }

  ngAfterViewInit() {
       
  }

  async ngOnInit() {
    await this.getRecords()
    this.data = JSON.parse(this.records);
    console.log("review data loaded")
    console.log(this.data);
    
  }

  async getRecords() {
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
    

    await fetch(this.recordsApi, requestOptions).then(r => r.json()).then(function (r) {
      return records = r
    })

    this.loading = false;
    return this.records = Object(records)
  }

  titleClick() {
    console.log(this);
  }

  filterTable(event: any) {
    this.reviewTable.filterGlobal(event.target.value, 'contains');
  }
}