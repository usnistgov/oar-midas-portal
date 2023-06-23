import { Component, OnInit, ViewChild } from '@angular/core';
import {faFileImport,faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { AppConfig } from 'src/app/config/app.config';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import {DynamicDialogConfig} from 'primeng/dynamicdialog';



@Component({
  selector: 'app-file-list-modal',
  templateUrl: './file-list.component.html',
  providers:[DialogService,MessageService],
  styleUrls: ['./file-list.component.css']
  
})
export class FileListModalComponent implements OnInit {
  faUpRightAndDownLeftFromCenter=faUpRightAndDownLeftFromCenter;
  faFileImport=faFileImport;
  public records: any;
  public recordsApi: string;
  public data: any;
  public nextcloudUI: string;
  public display:boolean;
  ref: DynamicDialogRef;
  
  

  @ViewChild('filetable') fileTable: Table;

  constructor(private appConfig: AppConfig,private http:HttpClient,public datepipe:DatePipe,public dialogService: DialogService
    , public messageService: MessageService, public config: DynamicDialogConfig) { 
  }



  
  

  async ngOnInit() {
    this.display=true;
    let promise = new Promise((resolve) => {
      this.data=this.config.data;
    });
    
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
