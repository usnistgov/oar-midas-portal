import { Component, OnInit, SimpleChanges, ViewChild, Input } from '@angular/core';
import {faBook,faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
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
  @ViewChild('reviewtable') reviewTable: Table;
  @Input() authToken: string|null = null;
  @Input() userId: string|undefined|null = null;
  faUpRightAndDownLeftFromCenter=faUpRightAndDownLeftFromCenter;
  faBook=faBook;
  public records: any;
  public NPSAPI: string;
  public npsUI: string;
  public data: any;
  statuses:any[];
  ref: DynamicDialogRef;



  constructor(private configSvc: ConfigurationService, private http: HttpClient,
              public datepipe:DatePipe,public dialogService: DialogService,
              public messageService: MessageService)
  { }

  ngOnInit() {
      let config = this.configSvc.getConfig()
      this.NPSAPI = config['NPSAPI'];
      if (! this.NPSAPI.endsWith('/'))
          this.NPSAPI += '/';
      this.npsUI = config['npsUI'];
      if (! this.npsUI.endsWith('/'))
          this.npsUI += '/';

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
      if (this.authToken && this.userId)
          this.fetchRecords(this.NPSAPI+this.userId);
  }

  /**
   * this function allow to create the link to edit a specific nps record
   * @param item is the id of the dap we want to modify
   * @returns string that is the link to the npsui interface of the dap
   */
  linkto(item:string){
    return this.npsUI.concat('Dataset/DataSetDetails?id=').concat(item.toString())
  }

/**
 * This function get data from the NPS Server
 * @param url is the endpoint of the dbio where we want to get data from
 */
  private fetchRecords(url:string){
    this.http.get(url, { headers: { Authorization: "Bearer "+this.authToken }})
    .pipe(map((responseData: any)  => {
      return responseData
    })). subscribe(records => {
      if(typeof records == "string" ){
      this.data = records;
      if(typeof this.data !== 'undefined') {
          console.log("Loading "+records.length+" NPS records");
          for (let i = 0; i<this.data.length;i++){
            this.data[i].deadline = new Date(this.data[i].deadline)
          }
      }
    }
    })
  }

  /**
   * this function helps to clear the table when doing research
   * @param table  the table to clear
   */
  clear(table: Table) {
    table.clear();
}

/**
   * this functions open the modal with a bigger view of the reviews and passes all the data to the DapModalComponent
   */
show() {
  this.ref = this.dialogService.open(ReviewListModalComponent, {
      data: this.data,
      width: '80%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
  });
}


}
