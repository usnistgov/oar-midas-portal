import { Component, OnInit, OnChanges, SimpleChanges, ViewChild, Input } from '@angular/core';
import {faUsersViewfinder,faBell,faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
import {Table} from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ReviewListModalComponent } from '../../modals/review-list/review-list.component';
import { ConfigurationService } from 'oarng';

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
  @Input() authToken: string|null = null;

  constructor(private configSvc: ConfigurationService, private http: HttpClient,
              public datepipe:DatePipe,public dialogService: DialogService,
              public messageService: MessageService)
  { }

  ngAfterViewInit() { }

  ngOnInit() {

      let config = this.configSvc.getConfig()
      this.NPSAPI = config['NPSAPI'];
      this.npsUI = config['npsUI'];

      this.statuses = [
          { label: 'Pending', value: 'Pending' },
          { label: 'Done', value: 'Done' },
          { label: 'In Progress', value: 'In Progress' }
      ];
  }

  /**
   * update the state of this component as the result of changes in its parent
   */
  ngOnChanges(changes: SimpleChanges) {
      if (this.authToken)
          this.fetchRecords(this.NPSAPI);
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
    this.http.get(url, { headers: { Authorization: "Bearer "+this.authToken }})
    .pipe(map((responseData: any)  => {
      return responseData
    })). subscribe(records => {
      this.data = records;
      if(typeof this.data !== 'undefined') {
          console.log("Loading "+records.length+" NPS records");
          for (let i = 0; i<this.data.length;i++){
            this.data[i].deadline = new Date(this.data[i].deadline)
            //this.data[i].deadline = this.datepipe.transform(this.data[i].deadline,'MM/dd/yyyy')
          }
      }
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
