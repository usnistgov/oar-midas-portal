import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {faFileImport,faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { MatDialogRef } from '@angular/material/dialog';
import { FileListModalComponent } from '../../modals/file-list/file-list.component';
import { ConfigurationService } from 'oarng';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit {
  faUpRightAndDownLeftFromCenter=faUpRightAndDownLeftFromCenter;
  faFileImport=faFileImport;
  public records: any;
  public recordsApi: string;
  public data: any;
  public nextcloudUI: string;
  public display:boolean;
  ref: DynamicDialogRef;

  @ViewChild('filetable') fileTable: Table;

  constructor(private cfgsvc: ConfigurationService, private http:HttpClient,
              public datepipe:DatePipe, public dialogService: DialogService,
              public messageService: MessageService)
  { 
    this.recordsApi = 'https://data.nist.gov/rmm/records'
  }

  async ngOnInit() {
      this.display=true;

      let config = this.cfgsvc.getConfig();
      this.nextcloudUI = config['nextcloudUI'];

      //GET method to get data
      this.fetchRecords(this.nextcloudUI);
      console.log("file space data: "+JSON.stringify(this.data));
      if (this.data==null) 
          this.display=false;
      else {
          for (let i = 0; i<this.data.length;i++){
              this.data[i].last_modified = new Date(this.data[i].last_modified);
          }
      }
        
      //await this.getRecords()
      //this.data = this.records.ResultData
      //this.data = RECORD_DATA;
    
  }

  show() {
    this.ref = this.dialogService.open(FileListModalComponent, {
        data:this.data,
        width: '80%',
        contentStyle: { overflow: 'auto' },
        baseZIndex: 10000,
    });
  }

  async getRecords() {
    let records;
    await fetch(this.recordsApi).then(r => r.json()).then(function (r) {
      return records = r
    })

    return this.records = Object(records)
  }

  private fetchRecords(url:string){
    this.http.get(url)
    .pipe(map((responseData: any)  => {
      return responseData
    })). subscribe(records => {
      this.data = records
    })
  }


  clear(table: Table) {
    table.clear();
  }


  titleClick() {
    console.log(this);
  }

  filterTable(event: any) {
    this.fileTable.filterGlobal(event.target.value, 'contains');
  }
}
