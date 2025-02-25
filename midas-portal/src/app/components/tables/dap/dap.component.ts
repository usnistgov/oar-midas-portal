import { Component, OnInit, OnChanges, SimpleChanges, ViewChild, Input } from '@angular/core';
import {faUpRightAndDownLeftFromCenter,faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import { map, catchError,tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { DapModalComponent } from '../../modals/dap/dap.component';
import { ConfigurationService } from 'oarng';
import { dap } from '../../../models/dap.model';


@Component({
  selector: 'app-dap',
  templateUrl: './dap.component.html',
  providers: [DialogService, MessageService],


  styleUrls: [
    './dap.component.css'
  ]
})
export class DapComponent implements OnInit, OnChanges {
  @Input() authToken: string|null;    
  @ViewChild('recordsTable') recordsTable: Table;
  faUpRightAndDownLeftFromCenter = faUpRightAndDownLeftFromCenter;
  faSquarePlus = faSquarePlus;
  dapAPI: string;
  dapUI: string;
  dapEDIT: string;
  statuses: any[];
  ref: DynamicDialogRef;
  public DAP: any[] = [];
  

  constructor(private configSvc: ConfigurationService, private http: HttpClient, public datepipe: DatePipe, public dialogService: DialogService
    , public messageService: MessageService) {
  }


  ngOnInit() {
      this.dapUI = this.configSvc.getConfig()['dapUI'];
      this.dapAPI = this.configSvc.getConfig()['dapAPI'];
      this.dapEDIT = this.configSvc.getConfig()['dapEDIT'];
      this.statuses = [
        { label: 'published', value: 'published' },
        { label: 'edit', value: 'edit' },
        { label: 'reviewed', value: 'reviewed' }
      ];
  }

  /**
   * update the state of this component as the result of changes in its parent
   */
  ngOnChanges(changes: SimpleChanges) {
      if (this.authToken)
          this.fetchRecords(this.dapAPI);
  }


  /**
   * this functions open the modal with a bigger view of the dap and passes all the data to the DapModalComponent
   */
  show() {
    this.ref = this.dialogService.open(DapModalComponent, {
      data: this.DAP,
      width: '90%',
      contentStyle: {
        'overflow-y': 'hidden', 'overflow-x': 'hidden',
        'max-height': '80vh', 'min-height': '250px'
      },
      baseZIndex: 10000,
    });
  }
  

  /**
   * this function allow to create the link to edit a specific dap
   * @param item is the id of the dap we want to modify
   * @returns string that is the link to the dapui interface of the dap
   */
  linkto(item: string) {
    return this.dapEDIT.concat(item.toString()).concat("?editEnabled=true");
  }

/**
 * This function get data from the DBIO
 * @param url is the endpoint of the dbio where we want to get data from
 */
public fetchRecords(url: string) {
  this.http.get(url, { headers: { Authorization: "Bearer " + this.authToken }})
    .pipe(
      map((responseData: any) => {
        return responseData;
      }),
      tap(records => {
        console.log("Loading " + records.length + " DAP records");
      }),
      catchError((error: any) => {
        console.error("Error fetching records for DAP:", error);
        return of([]); // Return an empty array in case of error
      })
    )
    .subscribe(records => {
      this.DAP = [];
      for (let i = 0; i < records.length; i++) {
        console.log(records[i])
        const serializedItem = this.customSerialize(records[i]);
        if (serializedItem !== null)
          this.DAP.push(serializedItem);
      }
    });
}

  /**
   * This function serialize the data received from the dbio to the model we defined.
   *  It helps dealing with the data later on in the portal
   * @param item is the data received form the dbio
   * @returns dap
   */
  public customSerialize(item: any) {
    try {
      let tmp = new dap();
      tmp.doi = item.data['doi'];
      tmp.file_count = item.data['file_count'];
      tmp.id = item.id;
      tmp.modifiedDate = item.status.modifiedDate = new Date(item.status.modifiedDate);
      tmp.name = item.name;
      tmp.owner = item.owner;
      tmp.state = item.status.state;
      tmp.title = item.data['title'];
      tmp.type = item.meta['resourceType'];
      return tmp;
    } catch (error) {
      console.error("Error serializing DAP item:", error);
      return null;
    }
  }


  /**
   * little helper for the html to print right tag for status
   * @param status 
   * @returns string that correspond to bootstrap key words for button classes
   */
  getStatus(status: string) {
    switch (status) {
      case 'published':
        return 'success';
      case 'edit':
        return 'warning';
      case 'reviewed':
        return 'danger';
    }
    return ""
  }

}
