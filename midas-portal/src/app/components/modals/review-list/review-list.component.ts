import { Component, OnInit, ViewChild } from '@angular/core';
import {faUsersViewfinder,faBell,faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
import {Table} from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ConfigurationService } from 'oarng';

@Component({
  selector: 'app-review-list-modal',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.css']
})
export class ReviewListModalComponent implements OnInit {
  faUpRightAndDownLeftFromCenter=faUpRightAndDownLeftFromCenter;
  faBell=faBell;
  faListCheck=faUsersViewfinder;
  public records: any;
  public NPSAPI: string;
  public npsUI: string;
  public data: any;
  statuses:any[];
  ref: DynamicDialogRef;
  public count:any;

  loading: boolean = false;

  @ViewChild('reviewtable') reviewTable: Table;

  constructor(private cfgsvc: ConfigurationService, public datepipe:DatePipe,
              public dialogService: DialogService, public messageService: MessageService,
              public config:DynamicDialogConfig)
  { }

  /**
   * This functions injects some JS labels in the HTMl to make it 508 compliant
   */
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
      this.NPSAPI = config['NPSAPI'];
      this.npsUI = config['npsUI'];
      
      this.data=this.config.data
      console.log(this.data)
      this.count=this.data.length

      this.statuses = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Done', value: 'Done' },
        { label: 'In Progress', value: 'In Progress' }
      ];
  }

  /**
   * this function allow to create the link to edit a specific nps record
   * @param item is the id of the dap we want to modify
   * @returns string that is the link to the npsui interface of the dap
   */
  linkto(item:string){
    return this.NPSAPI.concat('/Dataset/DataSetDetails?id=').concat(item.toString())
  }



  /**
   * this function helps to clear the table when doing research
   * @param table  the table to clear
   */
  clear(table: Table) {
    table.clear();
}

}
