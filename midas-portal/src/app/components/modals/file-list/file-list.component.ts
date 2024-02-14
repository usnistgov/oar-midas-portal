import { Component, OnInit, ViewChild } from '@angular/core';
import {faFileImport,faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { DatePipe } from '@angular/common';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import {DynamicDialogConfig} from 'primeng/dynamicdialog';
import { ConfigurationService } from 'oarng';



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

  /**
   * this function allow to create the link to edit a specific dap
   * @param item is the id of the dap we want to modify
   * @returns string that is the link to the dapui interface of the dap
   */
  linkto(item: string) {
    //return this.dapEDIT.concat(item.toString()).concat("?editEnabled=true");
  }



}
