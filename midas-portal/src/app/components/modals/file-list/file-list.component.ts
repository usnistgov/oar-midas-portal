import { Component, OnInit, ViewChild } from '@angular/core';
import {faFileImport,faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { DatePipe } from '@angular/common';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService,SortEvent } from 'primeng/api';
import {DynamicDialogConfig} from 'primeng/dynamicdialog';
import { ConfigurationService } from 'oarng';
import { ObjectUtils } from 'primeng/utils';



@Component({
  selector: 'app-file-list-modal',
  templateUrl: './file-list.component.html',
  providers:[DialogService,MessageService],
  styleUrls: ['./file-list.component.css']
  
})
export class FileListModalComponent implements OnInit {
  faUpRightAndDownLeftFromCenter=faUpRightAndDownLeftFromCenter;
  faFileImport=faFileImport;
  public nextcloudUI:string;
  public data: any = [];
  ref: DynamicDialogRef;
  public count:any;
  
  @ViewChild('filetable') fileTable: Table;

  constructor(private cfgsvc: ConfigurationService,public datepipe:DatePipe, public dialogService: DialogService,
              public messageService: MessageService, public config: DynamicDialogConfig)
  { }

  ngAfterViewInit() {
    let filter = document.getElementsByTagName("p-columnfilter");

    // regular for loop
    var Ar_filter = Array.prototype.slice.call(filter)
    for (let i of Ar_filter) {
      i.children[0].children[0].ariaLabel="Last Modified"
      
    }

    let paginator = document.getElementsByTagName("p-paginator");

    // regular for loop
    var Ar_paginator = Array.prototype.slice.call(paginator)
    for (let i of Ar_paginator) {
        i.children[0].children[1].ariaLabel="First page"
        i.children[0].children[2].ariaLabel="Previous page"
        i.children[0].children[4].ariaLabel="Next page"
        i.children[0].children[5].ariaLabel="Last page"

    }

    let dialog = document.getElementsByTagName("p-dynamicdialog");
    
    var Ar_dialog = Array.prototype.slice.call(dialog)
    for(let i of Ar_dialog){
      i.children[0].children[0].children[0].children[1].children[0].ariaLabel="exit"
    }

    let multiselect = document.getElementsByTagName("p-multiselect");
    
    var Ar_multiselect = Array.prototype.slice.call(multiselect)
    for(let i of Ar_multiselect){
      i.children[0].children[0].children[0].ariaLabel="Rows Selected"
    }
    
  }
  
  
  /**
   * iniating the tables of the modal from data from the landing page
   */
  async ngOnInit() {
    let config = this.cfgsvc.getConfig();
    
    this.data = this.config.data;
    this.count = this.data.length;
    
  }


/**
   * this function helps to clear the table when doing research
   * @param table  the table to clear
   */
  clear(table: Table) {
    table.clear();
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

  /**
   * this function allow to create the link to edit a specific dap
   * @param item is the id of the dap we want to modify
   * @returns string that is the link to the dapui interface of the dap
   */
  linkto(item: string) {
    //return this.dapEDIT.concat(item.toString()).concat("?editEnabled=true");
  }



}
