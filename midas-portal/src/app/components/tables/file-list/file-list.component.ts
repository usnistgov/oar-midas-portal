import { Component, Input, OnInit, OnChanges,SimpleChanges ,ViewChild } from '@angular/core';
import {faFileImport,faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService,SortEvent } from 'primeng/api';
import { FileListModalComponent } from '../../modals/file-list/file-list.component';
import { ConfigurationService } from 'oarng';
import { fm } from '../../../models/fm.model';
import { ObjectUtils } from 'primeng/utils';


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

  formatBytes(bytes: number, numAfterDecimal: number = 0) : string {
    if (bytes == null || bytes == undefined) return '';
    if (0 == bytes) return "0 Bytes";
    if (1 == bytes) return "1 Byte";
    let base = 1000,
        e = ["Bytes", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
        d = numAfterDecimal || 1,
        f = Math.floor(Math.log(bytes) / Math.log(base));

    let v = bytes / Math.pow(base, f);
    if (f == 0) // less than 1 kiloByte
        d = 0;
    else if (numAfterDecimal == null && v < 10.0)
        d = 2;
    return v.toFixed(d) + " " + e[f];
}

convertToBytes(size: string, unit: string): number {
  const unitMap: { [key: string]: number } = {
      "Bytes": 1,
      "kB": 1e3,
      "MB": 1e6,
      "GB": 1e9,
      "TB": 1e12,
      "PB": 1e15,
      "EB": 1e18,
      "ZB": 1e21,
      "YB": 1e24
  };

  return parseFloat(size) * unitMap[unit];
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
            if(records[i]['file_space']!==undefined){
              if(this.is_complete(records[i])){
                this.DAP.push(this.customSerialize(records[i]))
            }
          }
          }
        })
    }

    is_complete(obj: any): boolean {
      const requiredKeys = ['location', 'usage', 'file_count'];
      console.log(obj)
      for (const key of requiredKeys) {
        if (obj.file_space[key] === undefined) {
          return false;
        }
      }
      return true;
    }

    customSort(event: SortEvent) {
      if(event.data){
        event.data.sort((data1,data2 ) => {
          let value1 = ObjectUtils.resolveFieldData(data1, event.field);
          let value2 = ObjectUtils.resolveFieldData(data2, event.field);
          let result = null;
          if(event.field=== "usage"){
          if (value1 == null && value2 != null) result = -1;
          else if (value1 != null && value2 == null) result = 1;
          else if (value1 == null && value2 == null) result = 0;
          else {
            // Extract numeric and unit parts from the values
            const regex = /(\d*\.?\d+)\s*([A-Za-z]+)/;
            const match1 = value1.match(regex);
            const match2 = value2.match(regex);
    
            // Convert sizes to bytes
            const bytes1 = this.convertToBytes(match1[1], match1[2]);
            const bytes2 = this.convertToBytes(match2[1], match2[2]);
    
            // Compare bytes
            result = bytes1 - bytes2;
          }
          if(event.order && result){
          return event.order * result;
          }else{
            return 0
          }
        }else if (event.field=== "file_count"){
          // Check if values are numeric
        if (typeof value1 === 'number' && typeof value2 === 'number') {
            // Compare numbers
            result = value1 - value2
            if(event.order && result){
              return event.order * result;
              }else{
                return 0
              }
        } else {
            // Fallback to default comparison if values are not numeric
            return value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
        }
        }else if(event.field=== "name"){
              // Check if values are strings
            if (typeof value1 === 'string' && typeof value2 === 'string') {
              // Compare strings using localeCompare method
              result = value1.localeCompare(value2);
              if(event.order && result){
                return event.order * result;
                }else{
                  return 0
                }
          } else {
              // Fallback to default comparison if values are not strings
            return 0; // or any other handling you prefer
          }
        }else{
          return 0
        }
        });
      }
      }
  


    public customSerialize(item:any){
      let tmp = new fm()
      tmp.name = item.name
      tmp.location = item.file_space['location']
      tmp.usage = this.formatBytes(parseInt(item.file_space['usage']))
      tmp.file_count = item.file_space['file_count']
      tmp.last_modified = new Date(item.file_space.last_modified)
      return tmp
    }

}
