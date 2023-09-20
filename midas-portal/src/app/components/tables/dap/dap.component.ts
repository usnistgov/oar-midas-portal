import { Component, OnInit, OnChanges, SimpleChanges, ViewChild, Input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { faFileEdit, faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
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
  @Input() openedAsDialog: boolean = false;
  @Input() parent: any;
  @Input() authToken: string|null;    
  faUpRightAndDownLeftFromCenter = faUpRightAndDownLeftFromCenter;
  faFileEdit = faFileEdit;
  public data: any;
  loading: boolean = true;
  dapAPI: string;
  dapUI: string;
  dapEDIT: string;
  statuses: any[];
  ref: DynamicDialogRef;
  public DAP: any[] = [];

  dataSource: any;

  @ViewChild('recordsTable') recordsTable: Table;

  constructor(private configSvc: ConfigurationService, private http: HttpClient, public datepipe: DatePipe, public dialogService: DialogService
    , public messageService: MessageService) {
  }

  ngAfterViewInit() {
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

  linkto(item: string) {
    return this.dapEDIT.concat(item.toString()).concat("?editEnabled=true");
  }

  async getRecords() {

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

    await fetch(this.dapAPI).then(r => r.json()).then(function (r) {
      return records = r
    })

    this.loading = false;
    // return this.records = Object(records);
  }

  public fetchRecords(url: string) {
    this.http.get(url, { headers: { Authorization: "Bearer "+this.authToken }})
      .pipe(map((responseData: any) => {
        return responseData
      })).subscribe(records => {
        console.log("Loading "+records.length+" DAP records");
        this.DAP = [];
        for (let i = 0; i < records.length; i++) {
          this.DAP.push(this.customSerialize(records[i]))
        }
      })
  }

  public customSerialize(item: any) {
    let tmp = new dap();
    tmp.doi = item.data['doi']
    tmp.file_count = item.data['file_count']
    tmp.id = item.id
    tmp.modifiedDate = item.status.modifiedDate = new Date(item.status.modifiedDate)
    tmp.name = item.name
    tmp.owner = item.owner
    tmp.state = item.status.state
    tmp.title = item.data['title']
    tmp.type = item.meta['resourceType']
    return tmp
  }


  clear(table: Table) {
    table.clear();
  }

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

  titleClick() {
    console.log(this);
  }

  filterTable(event: any) {
    this.recordsTable.filterGlobal(event.target.value, 'contains');
  }
}
