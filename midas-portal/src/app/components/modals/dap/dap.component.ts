import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { faFileEdit, faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { ConfigurationService } from 'oarng';
import { DatePipe } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-dap-modal',
  templateUrl: './dap.component.html',
  providers: [DialogService, MessageService],


  styleUrls: [
    './dap.component.css'
  ]
})
export class DapModalComponent implements OnInit {
  @Input() openedAsDialog: boolean = false;
  faUpRightAndDownLeftFromCenter = faUpRightAndDownLeftFromCenter;
  faFileEdit = faFileEdit;
  public data: any = [];
  dapAPI: string;
  dapUI: string;
  dapEDIT: string;
  statuses: any[];
  public count: any;
  cols!: Column[];
  _selectedColumns!: Column[];
  @ViewChild('recordsTable') recordsTable: Table;

  constructor(private cfgsvc: ConfigurationService,
              public datepipe: DatePipe, public dialogService: DialogService,
              public messageService: MessageService, public config: DynamicDialogConfig)
  {  }

  /**
   * This functions injects some JS labels in the HTMl to make it 508 compliant
   */
  ngAfterViewInit() {
    let filter = document.getElementsByTagName("p-columnfilter");

    // adding 508 labels to children of column
    var Ar_filter = Array.prototype.slice.call(filter)
    for (let i of Ar_filter) {
      i.children[0].children[0].ariaLabel = "Last Modified"

    }


    // adding 508 labels to children of paginator
    let paginator = document.getElementsByTagName("p-paginator");
    var Ar_paginator = Array.prototype.slice.call(paginator)
    for (let i of Ar_paginator) {
      i.children[0].children[1].ariaLabel = "First page"
      i.children[0].children[2].ariaLabel = "Previous page"
      i.children[0].children[4].ariaLabel = "Next page"
      i.children[0].children[5].ariaLabel = "Last page"

    }

    let dialog = document.getElementsByTagName("p-dynamicdialog");

    var Ar_dialog = Array.prototype.slice.call(dialog)
    for (let i of Ar_dialog) {
      i.children[0].children[0].children[0].children[1].children[0].ariaLabel = "exit"
    }

    let multiselect = document.getElementsByTagName("p-multiselect");

    var Ar_multiselect = Array.prototype.slice.call(multiselect)
    for (let i of Ar_multiselect) {
      i.children[0].children[0].children[0].ariaLabel = "Rows Selected"
    }

  }

  /**
   * iniating the tables of the modal from data from the landing page
   */
  async ngOnInit() {
    //Retrieve the data passed on by the show function in the tables/dap.component.ts
      let config = this.cfgsvc.getConfig();
      this.dapAPI = config['dapAPI'];
      this.dapUI = config['dapUI'];
      this.dapEDIT = config['dapEDIT'];
      this.data = this.config.data;
      this.count = this.data.length;

      //set the column for the modals table
      this.cols = [
        { field: 'name', header: 'Name' },
        { field: 'owner', header: 'Owner' },
        { field: 'file_count', header: 'Files Associated' },
        { field: "title", header: 'Title' },
        { field: 'type', header: 'Type' },
        { field: 'id', header: 'ID' },
        { field: 'doi', header: 'DOI' }
      ];

      this._selectedColumns = this.cols;

      this.statuses = [
        { label: 'published', value: 'published' },
        { label: 'edit', value: 'edit' },
        { label: 'reviewed', value: 'reviewed' }
      ];
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  //helpers for the filtering
  set selectedColumns(val: any[]) {
    //restore original order
    this._selectedColumns = this.cols.filter((col) => val.includes(col));
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
   * this function helps to clear the table when doing research
   * @param table  the table to clear
   */
  clear(table: Table) {
    table.clear();
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
