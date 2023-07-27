import { Component, OnInit, ViewChild } from '@angular/core';
import {faUsersViewfinder,faBell,faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
import {Table} from 'primeng/table';
import { AppConfig } from 'src/app/config/app.config';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-review-list-modal',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.css']
})
export class ReviewListModalComponent implements OnInit {
  faUpRightAndDownLeftFromCenter=faUpRightAndDownLeftFromCenter;
  faBell=faBell;
  faListCheck=faUsersViewfinder;
  public records: any;
  public NPSAPI: string;
  public npsUI: string;
  public data: any;
  statuses:any[];
  ref: DynamicDialogRef;
  public count:any;

  loading: boolean = false;

  @ViewChild('reviewtable') reviewTable: Table;

  constructor(private appConfig: AppConfig,private http: HttpClient,public datepipe:DatePipe,public dialogService: DialogService
    , public messageService: MessageService,public config:DynamicDialogConfig) { 
    
  }

  ngAfterViewInit() {
       
  }

  async ngOnInit() {

    let promise = new Promise((resolve) => {
      this.appConfig.getRemoteConfig().subscribe(config => {
        this.NPSAPI = config.NPSAPI;
        this.npsUI = config.npsUI;
        this.data=this.config.data
        this.count=this.data.length
      })
    });


    
 

    this.statuses = [
      { label: 'Pending', value: 'Pending' },
      { label: 'Done', value: 'Done' },
      { label: 'In Progress', value: 'In Progress' }
  ];
  }

  linkto(item:string){
    this.NPSAPI.concat(item.toString())
  }

  getStatus(status: string) {
    switch (status) {
        case 'Done':
            return 'success';
        case 'In Progress':
            return 'warning';
        case 'Pending':
            return 'danger';
    }
    return ""
  }

  clear(table: Table) {
    table.clear();
}

  titleClick() {
    console.log(this);
  }

  filterTable(event: any) {
    this.reviewTable.filterGlobal(event.target.value, 'contains');
  }
}