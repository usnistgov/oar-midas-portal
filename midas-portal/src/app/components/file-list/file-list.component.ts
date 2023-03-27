import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import {MatSort, Sort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {faFileImport} from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { AppConfig } from 'src/app/config/app.config';
export interface MIDASFile {
  file_name: string;
  file_path: string;
  file_size: string;
  last_modified: string;
}

const RECORD_DATA: MIDASFile[] = [
  {file_name: 'Big Data File', file_path: '/file_dir/some_path/big_old_file.csv', file_size: '5TB', last_modified: 'Nov 30, 2022 at 4:11:11 PM'},
  {file_name: 'Small Data File', file_path: '/file-dir/some_path/sub_dir1/sub_dir2/small_file.txt', file_size: '657KB', last_modified: 'Nov 25, 2022 at 9:20:30 AM'},
];
@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit {
  faFileImport=faFileImport;
  public records: any;
  public recordsApi: string;
  public data: any;
  public nextcloudUI: string;
  displayedColumns: string[] = ['file_name', 'file_path', 'file_size', 'last_modified'];

  @ViewChild('filetable') fileTable: Table;

  constructor(private appConfig: AppConfig) { 
    this.recordsApi = 'https://data.nist.gov/rmm/records'
  }

  

  ngAfterViewInit() {
    
  }

  async ngOnInit() {

    this.appConfig.getRemoteConfig().subscribe(config => {
      this.nextcloudUI = config.nextcloudUI;
    });
    
    //await this.getRecords()
    //this.data = this.records.ResultData
    this.data = RECORD_DATA;
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

  filterTable(event: any) {
    this.fileTable.filterGlobal(event.target.value, 'contains');
  }
}
