import { Component, Input, OnInit, OnChanges,SimpleChanges ,ViewChild } from '@angular/core';
import {faFileImport,faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { FileListModalComponent } from '../../modals/file-list/file-list.component';
import { ConfigurationService } from 'oarng';
import { fm } from '../../../models/fm.model';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit {
  @Input() authToken: string|null;
  @ViewChild('filetable') fileTable: Table;
  faUpRightAndDownLeftFromCenter=faUpRightAndDownLeftFromCenter;
  dapAPI: string;
  nextcloudUI:string;

  ref: DynamicDialogRef;
  public DAP: fm[] = [];

  

  constructor(private configSvc: ConfigurationService, private http:HttpClient,
              public datepipe:DatePipe, public dialogService: DialogService,
              public messageService: MessageService){}
 

   ngOnInit() {
      this.dapAPI = this.configSvc.getConfig()['dapAPI']
      this.nextcloudUI = "odejkf"
  }

  ngOnChanges(changes: SimpleChanges){
    if(this.authToken)
      this.fetchRecords(this.dapAPI)
  }
    

  show() {
    this.ref = this.dialogService.open(FileListModalComponent, {
        data:this.DAP,
        width: '90%',
        contentStyle: {
          'overflow-y': 'hidden', 'overflow-x': 'hidden',
          'max-height': '80vh', 'min-height': '250px'
        },
        baseZIndex: 10000,
    });
  }


  /**
   * This function get data from the DBIO
   * @param url is the endpoint of the dbio where we want to get data from
   */
    public fetchRecords(url: string) {
      this.http.get(url, { headers: { Authorization: "Bearer "+this.authToken }})
        .pipe(map((responseData: any) => {
          return responseData
        })).subscribe(records => {
          console.log("Loading "+records.length+" DAP records for File Manager");
          this.DAP = [];
          for (let i = 0; i < records.length; i++) {
            if(records[i]['file_space']!==undefined)
              this.DAP.push(this.customSerialize(records[i]))
          }
        })
    }

    public customSerialize(item:any){
      let tmp = new fm()
      tmp.name = item.name
      tmp.location = item.file_space['location']
      tmp.usage = item.file_space['usage']
      tmp.file_count = item.file_space['file_count']
      tmp.last_modified = new Date(item.file_space.last_modified)
      return tmp
    }

}
