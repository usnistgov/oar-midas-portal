import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import {MatSort, Sort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

export interface MIDASFile {
  file_name: string;
  file_path: string;
  file_size: string;

}

const RECORD_DATA: MIDASFile[] = [
  {file_name: 'Big Data File', file_path: '/fake_path/big_old_file.csv', file_size: '5TB'},
  {file_name: 'Smaller Data File', file_path: '/fake_path/subdir/normal_file.txt', file_size: '657KB'},
];
@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit {

  public records: any;
  public recordsApi: string;
  public data: any;
  displayedColumns: string[] = ['file_name', 'file_path', 'file_size'];
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
