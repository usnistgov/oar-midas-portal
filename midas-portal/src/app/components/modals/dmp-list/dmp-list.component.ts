import { Component, OnInit, ViewChild } from '@angular/core';
import {faCheck,faFileEdit,faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { AppConfig } from 'src/app/config/app.config';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import {DynamicDialogConfig} from 'primeng/dynamicdialog';


@Component({
  selector: 'app-dmp-list-modal',
  templateUrl: './dmp-list.component.html',
  styleUrls: ['./dmp-list.component.css']
})
export class DmpListModalComponent implements OnInit {
  faUpRightAndDownLeftFromCenter=faUpRightAndDownLeftFromCenter;
  faCheck=faCheck;
  faFileEdit=faFileEdit;
  public records: any;
  public recordsApi: string;
  public data: any;
  loading: boolean = true;
  dmpAPI: string;
  dmpUI: string;
  ref: DynamicDialogRef;
  public count:any;


  dataSource: any;

  @ViewChild('dmptable') dmpTable: Table;

  constructor(private appConfig: AppConfig,private http: HttpClient, public datepipe:DatePipe,public dialogService: DialogService
    , public messageService: MessageService, public config: DynamicDialogConfig) { 
  }

  async ngOnInit() {
    let promise = new Promise((resolve) => {
      this.data=this.config.data
      this.count=this.data.length
    });
    

  }


  clear(table: Table) {
    table.clear();
}


  titleClick() {
    console.log(this);
  }

  filterTable(event: any) {
    this.dmpTable.filterGlobal(event.target.value, 'contains');
  }
}
