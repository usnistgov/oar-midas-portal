import { Component, OnInit, ViewChild } from '@angular/core';
import { faCheck, faFileEdit, faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { MatDialogRef } from '@angular/material/dialog';
import { DmpListModalComponent } from '../../modals/dmp-list/dmp-list.component';
import { ConfigurationService } from 'oarng';
import { dmp } from '../../../models/dmp.model';

@Component({
  selector: 'app-dmp-list',
  templateUrl: './dmp-list.component.html',
  styleUrls: ['./dmp-list.component.css']
})
export class DmpListComponent implements OnInit {
  faUpRightAndDownLeftFromCenter = faUpRightAndDownLeftFromCenter;
  faCheck = faCheck;
  faFileEdit = faFileEdit;
  public records: any;
  public recordsApi: string;
  public data: any;
  loading: boolean = true;
  dmpAPI: string;
  dmpUI: string;
  dmpEDIT: string;
  ref: DynamicDialogRef;
  public DMP: any[] = [];


  dataSource: any;

  @ViewChild('dmptable') dmpTable: Table;

  constructor(private configSvc: ConfigurationService, private http: HttpClient,
              public datepipe: DatePipe, public dialogService: DialogService,
              public messageService: MessageService)
  {  }

  async ngOnInit() {
      let cfg = this.configSvc.getConfig();
      this.dmpUI = cfg['dmpUI'];
      this.dmpAPI = cfg['dmpAPI'];
      this.dmpEDIT = cfg['dmpEDIT'];

      //GET method to get data
      this.fetchRecords(this.dmpAPI);
  }

  show() {
    this.ref = this.dialogService.open(DmpListModalComponent, {
      data: this.DMP,
      width: '80%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
    });
  }

  linkto(item: string) {
    //https://localhost/dmpui/edit/mdm1:0001
    return this.dmpEDIT.concat(item.toString())
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

    await fetch(this.dmpAPI).then(r => r.json()).then(function (r) {
      return records = r
    })

    this.loading = false;
    return this.records = Object(records);
  }

  private fetchRecords(url: string) {
    this.http.get(url)
      .pipe(map((responseData: any) => {
        return responseData
      })).subscribe(records => {
        for (let i = 0; i < records.length; i++) {
          this.DMP.push(this.customSerialize(records[i]))
        }
      })
  }

  public customSerialize(item: any) {
    let tmp = new dmp();
    tmp.id = item.id;
    tmp.name = item.name;
    tmp.orgid = 0;
    if (item.data.organizations && item.data.organizations.length > 0)
      tmp.orgid = item.data.organizations[0].ORG_ID;
    tmp.modifiedDate = item.status.modifiedDate = new Date(item.status.modifiedDate);
    tmp.owner = item.owner;
    tmp.primaryContact = item.data.primary_NIST_contact.firstName + ' ' + item.data.primary_NIST_contact.lastName;
    tmp.description = item.data.projectDescription;
    return tmp;
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
