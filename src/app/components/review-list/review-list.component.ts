import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

export interface NPSReview {
  title: string;
  owner: string;
  currentreviewer: string;
  currentreviewstop: string;
}

const RECORD_DATA: NPSReview[] = [
  {title: 'Test Review 1', owner: 'Greene, Gretchen', currentreviewer: "Hanisch, Robert", currentreviewstop: 'Division Chief'},
  {title: 'Test Review 2', owner: 'Davis, Christopher', currentreviewer: "Tweedy, Romain", currentreviewstop: "OU IT Security Officer"},
];


@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.css']
})
export class ReviewListComponent implements OnInit {

  public records: any;
  public recordsApi: string;
  public data: any;
  displayedColumns: string[] = ['title', 'owner', 'currentreviewer', 'currentreviewstop'];
  dataSource: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  @ViewChild(MatSort) sort!: MatSort;

  constructor() { 
    this.recordsApi = 'https://data.nist.gov/rmm/records'
  }

  

  ngAfterViewInit() {
   
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    
  }

  async ngOnInit() {
    //await this.getRecords()
    //this.data = this.records.ResultData
    this.data = RECORD_DATA;
    console.log(this.data)
    this.dataSource = new MatTableDataSource(this.data);
    
  }

  async getRecords() {
    let records;
    await fetch(this.recordsApi).then(r => r.json()).then(function (r) {
      return records = r
    })

    return this.records = Object(records)
  }

  titleClick() {
    console.log(this);
  }
}