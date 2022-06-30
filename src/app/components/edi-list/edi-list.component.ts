import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';


export interface Record {
  title: string;
  publisher: string;
  date: number;
}

@Component({
  selector: 'app-edi-list',
  templateUrl: './edi-list.component.html',
  styleUrls: ['./edi-list.component.css']
})
export class EdiListComponent implements OnInit {

  public records: any;
  public recordsApi: string;
  public data: any;
  displayedColumns: string[] = ['title', 'publisher', 'date'];
  //dataSource = new MatTableDataSource(ELEMENT_DATA);

  //@ViewChild(MatSort) sort: MatSort;

  constructor() { 
    this.recordsApi = 'https://data.nist.gov/rmm/records'
  }

  

  ngAfterViewInit() {
    //this.records.sort = this.sort;
  }

  async ngOnInit() {
    await this.getRecords()
    this.data = this.records.ResultData
    console.log(this.data)
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
