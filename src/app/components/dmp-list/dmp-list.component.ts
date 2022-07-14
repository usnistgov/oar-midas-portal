import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import {MatSort, Sort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

export interface DMP {
  title: string;
  owner: string;
  lastmodified: string;
}

const RECORD_DATA: DMP[] = [
  {title: 'Test Record 1', owner: 'Davis, Christopher', lastmodified: '2021-07-06'},
  {title: 'Test Record 2', owner: 'Plante, Raymond', lastmodified: '2022-03-24'},
];

@Component({
  selector: 'app-dmp-list',
  templateUrl: './dmp-list.component.html',
  styleUrls: ['./dmp-list.component.css']
})
export class DmpListComponent implements OnInit {

  public records: any;
  public recordsApi: string;
  public data: any;

  displayedColumns: string[] = ['title', 'owner', 'lastmodified'];
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
