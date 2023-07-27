import { Component, OnInit, ViewChild } from '@angular/core';
import {faUsersViewfinder,faBell,faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
import {Table} from 'primeng/table';
import { AppConfig } from 'src/app/config/app.config';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ReviewListModalComponent } from '../../modals/review-list/review-list.component';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.css']
})
export class ReviewListComponent implements OnInit {
  faUpRightAndDownLeftFromCenter=faUpRightAndDownLeftFromCenter;
  faBell=faBell;
  faListCheck=faUsersViewfinder;
  public records: any;
  public NPSAPI: string;
  public npsUI: string;
  public data: any;
  statuses:any[];
  ref: DynamicDialogRef;

  loading: boolean = false;

  @ViewChild('reviewtable') reviewTable: Table;

  constructor(private appConfig: AppConfig,private http: HttpClient,public datepipe:DatePipe,public dialogService: DialogService
    , public messageService: MessageService) { 
    
  }

  ngAfterViewInit() {
       
  }

  async ngOnInit() {

    let promise = new Promise((resolve) => {
      this.appConfig.getRemoteConfig().subscribe(config => {
        this.NPSAPI = config.NPSAPI;
        this.npsUI = config.npsUI;
        resolve(this.NPSAPI);
        //GET Using fake backend
        this.fetchRecords(this.NPSAPI);
        for (let i = 0; i<this.data.length;i++){
          this.data[i].deadline = new Date(this.data[i].deadline)
          //this.data[i].deadline = this.datepipe.transform(this.data[i].deadline,'MM/dd/yyyy')
        }
      });
    });
    /* using fetch to retrieve data
    promise.then(async ()=> {
        await this.getRecords();
    }
    ).then(() => {
      this.data = JSON.parse(this.records);
    });
    */

    this.statuses = [
      { label: 'Pending', value: 'Pending' },
      { label: 'Done', value: 'Done' },
      { label: 'In Progress', value: 'In Progress' }
  ];
  }

  linkto(item:string){
    this.NPSAPI.concat(item.toString())
  }

  async getRecords(){
    
    let records;

    const headerDict = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'rejectUnauthorized': 'false'
    }

    
    
    const requestOptions = {                                                                                                                                                                                 
      headers: new Headers(headerDict)
    };
    
    await fetch(this.NPSAPI, requestOptions).then(r => r.json()).then(function (r) {
      return records = r
    })

    this.loading = false;
    return this.records = Object(records);
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

show() {
  this.ref = this.dialogService.open(ReviewListModalComponent, {
      data:this.data,
      width: '80%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
  });
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

  titleClick() {
    console.log(this);
  }

  filterTable(event: any) {
    this.reviewTable.filterGlobal(event.target.value, 'contains');
  }
}