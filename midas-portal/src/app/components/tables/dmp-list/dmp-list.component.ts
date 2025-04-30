import { Component, OnInit, SimpleChanges, ViewChild, Input } from '@angular/core';
import { faUpRightAndDownLeftFromCenter,faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { DmpListModalComponent } from '../../modals/dmp-list/dmp-list.component';
import { ConfigurationService } from 'oarng';
import { dmp } from '../../../models/dmp.model';

@Component({
  selector: 'app-dmp-list',
  templateUrl: './dmp-list.component.html',
  styleUrls: ['./dmp-list.component.css']
})
export class DmpListComponent implements OnInit {
  @ViewChild('dmptable') dmpTable: Table;
  @Input() authToken: string|null = null;
  @Input() websocketMessage: string|null;
  faUpRightAndDownLeftFromCenter = faUpRightAndDownLeftFromCenter;
  faSquarePlus = faSquarePlus;
  dmpAPI: string;
  dmpUI: string;
  dmpEDIT: string;
  ref: DynamicDialogRef;
  public DMP: any[] = [];

  

  constructor(private configSvc: ConfigurationService, private http: HttpClient,
              public datepipe: DatePipe, public dialogService: DialogService,
              public messageService: MessageService)
  {  }

  ngOnInit() {
      let cfg = this.configSvc.getConfig();
      this.dmpUI = cfg['dmpUI'];
      this.dmpAPI = cfg['dmpAPI'];
      this.dmpEDIT = cfg['dmpEDIT'];
  }

  /**
   * update the state of this component as the result of changes in its parent
   */
  ngOnChanges(changes: SimpleChanges) {
      if (this.authToken && this.dmpAPI)
          this.fetchRecords(this.dmpAPI);
      if(this.websocketMessage) {
        if (this.websocketMessage.toLowerCase().includes("dmp")) {
          this.fetchRecords(this.dmpAPI);
        }
      };
  }

  /**
   * this functions open the modal with a bigger view of the dmp and passes all the data to the DapModalComponent
   */
  show() {
    this.ref = this.dialogService.open(DmpListModalComponent, {
      data: this.DMP,
      width: '80%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
    });
  }
  

  /**
   * this function allow to create the link to edit a specific dap
   * @param item is the id of the dap we want to modify
   * @returns string that is the link to the dapui interface of the dap
   */
  linkto(item: string) {
    return this.dmpEDIT.concat(item.toString())
  }


  /**
 * This function get data from the DBIO
 * @param url is the endpoint of the dbio where we want to get data from
 */
  private fetchRecords(url: string) {
    this.http.get(url, { headers: { Authorization: "Bearer "+this.authToken }})
      .pipe(map((responseData: any) => {
        return responseData
      }),
      tap(records => {
        console.log("Loading "+records.length+" DMP records");
      }),
      catchError((error: any) => {
        console.error("Error fetching records for DMP:", error);
        return of([]); // Return an empty array in case of error
      })
    )
      .subscribe(records => {
        this.DMP = [];
        for (let i = 0; i < records.length; i++) {
          const serializedItem = this.customSerialize(records[i]);
          if (serializedItem !== null)
            this.DMP.push(serializedItem)
        }
      })
  }


  /**
   * This function serialize the data received from the dbio to the model we defined.
   *  It helps dealing with the data later on in the portal
   * @param item is the data received form the dbio
   * @returns dmp
   */
  public customSerialize(item: any) {
    try {
      let tmp = new dmp();
      tmp.id = item.id;
      tmp.name = item.name;
      tmp.orgid = 0;
      if (item.data.organizations && item.data.organizations.length > 0) {
        tmp.orgid = item.data.organizations[0].ORG_ID;
      }
      tmp.modifiedDate = item.status.modifiedDate = new Date(item.status.modifiedDate);
      tmp.owner = item.owner;
      const contributors = item.data.contributors;
      for (const contributor of contributors) {
        if (contributor.primary_contact === 'Yes') {
          tmp.primaryContact = contributor.firstName + ' ' + contributor.lastName;
          break;
        }
      }
      tmp.description = item.data.projectDescription;
      return tmp;
    } catch (error) {
      console.error("Error serializing DMP item:", error);
      return null;
    }
  }

}
