import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {faUsersViewfinder,faBell} from '@fortawesome/free-solid-svg-icons';
export interface NPSReview {
  title: string;
  owner: string;
  currentreviewer: string;
  currentreviewstop: string;
}

const RECORD_DATA: NPSReview[] = [
  {title: 'Word pairs in psychology that have been hand-annotated for semantic similarity by psychologists', owner: 'Stanton, Brian', currentreviewer: "Hanisch, Robert", currentreviewstop: 'Division Chief'},
  {title: 'Commerce Business System, Core Financial System (CBS/CFS)', owner: 'Sell, Sean', currentreviewer: "Tweedy, Romain", currentreviewstop: "OU IT Security Officer"},
];


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
  dataSource: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  @ViewChild(MatSort) sort!: MatSort;

  constructor() { 
    //this.recordsApi = 'https://localhost:5000/user/208821';
  }

  

  ngAfterViewInit() {
   
    
  }

  async ngOnInit() {
    // await this.getRecords()
    // this.data = this.records.ResultData
    this.data = RECORD_DATA;
    console.log(this.data)
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    
    
  }

  

  async getRecords() {
    let records;

    await fetch(this.recordsApi).then(r => r.json()).then(function (r) {
      console.log(r);
      return records = r
    })

    return this.records = Object(records)
  }

  titleClick() {
    console.log(this);
  }
}