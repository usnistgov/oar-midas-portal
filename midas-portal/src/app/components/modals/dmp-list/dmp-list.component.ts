import { Component, OnInit, ViewChild } from '@angular/core';
import { faCheck, faFileEdit, faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ConfigurationService } from 'oarng';

@Component({
  selector: 'app-dmp-list-modal',
  templateUrl: './dmp-list.component.html',
  styleUrls: ['./dmp-list.component.css']
})
export class DmpListModalComponent implements OnInit {
  faUpRightAndDownLeftFromCenter = faUpRightAndDownLeftFromCenter;
  faCheck = faCheck;
  faFileEdit = faFileEdit;
  public data: any;
  dmpAPI: string;
  dmpUI: string;
  dmpEDIT: string;
  ref: DynamicDialogRef;
  public count: any;


  @ViewChild('dmptable') dmpTable: Table;

  constructor(private cfgsvc: ConfigurationService, public datepipe: DatePipe, 
              public dialogService: DialogService, public messageService: MessageService,
              public config: DynamicDialogConfig)
  { }

  /**
   * This functions does two things :
   * 1- print a pop up to confirm to the user that he's connected
   * 2- inject some JS labels in the HTMl to make it 508 compliant
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
    //Retrieve the data passed on by the show function in the tables/dmp.component.ts
      let config = this.cfgsvc.getConfig();
      this.dmpAPI = config['dmpAPI']
      this.dmpUI = config['dmpUI'];
      this.dmpEDIT = config['dmpEDIT'];

      this.data = this.config.data;
      this.count = this.data.length;
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
   * this function helps to clear the table when doing research
   * @param table  the table to clear
   */
  clear(table: Table) {
    table.clear();
  }

/**
 * helper for the filtering of the table in the modal
 * @param event is column selected
 */
  filterTable(event: any) {
    this.dmpTable.filterGlobal(event.target.value, 'contains');
  }
}
