import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {faUsersViewfinder,faBell,faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
import {Table} from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ConfigurationService } from 'oarng';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-search-list-modal',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.css']
})
export class SearchListModalComponent implements OnInit {
  @Input() openedAsDialog: boolean = false;
  faUpRightAndDownLeftFromCenter=faUpRightAndDownLeftFromCenter;
  faBell=faBell;
  faListCheck=faUsersViewfinder;
  public records: any;
  public data: any;
  statuses:any[];
  ref: DynamicDialogRef;
  public count:any;
  public searchTerm: any;
  searchURL: any;
  _selectedColumns!: Column[];
  cols!: Column[];

  loading: boolean = false;

  @ViewChild('searchtable') searchTable: Table;

  constructor(private cfgsvc: ConfigurationService, public datepipe:DatePipe,
              public dialogService: DialogService, public messageService: MessageService,
              public config:DynamicDialogConfig)
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
  async ngOnInit() {

      let config = this.cfgsvc.getConfig();
      // config values here
      
      this.searchTerm = this.config.data
      //this.count=this.data.length
      this.searchURL=config['searchAPI']
      console.log('searchURL: ' + this.searchURL)

      this.search(this.searchTerm);

      this.statuses = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Done', value: 'Done' },
        { label: 'In Progress', value: 'In Progress' }
      ];

      //set the column for the modals table
      this.cols = [
        { field: 'name', header: 'Name' },
        { field: 'owner', header: 'Owner' },
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

  linkto(item:string){
    // URL specification here
  }

  getStatus(status: string) {
    switch (status) {
        case 'Done':
            return 'success';
        case 'In Progress':
            return 'warning';
        case 'Pending':
            return 'danger';
    }
    return ""
  }

  clear(table: Table) {
    table.clear();
}

  titleClick() {
    console.log(this);
  }

  filterTable(event: any) {
    this.searchTable.filterGlobal(event.target.value, 'contains');
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  //helpers for the filtering
  set selectedColumns(val: any[]) {
    //restore original order
    this._selectedColumns = this.cols.filter((col) => val.includes(col));
  }

  setTitle(searchTerm: any) {
    this.searchTerm = searchTerm;
  }

  search(searchTerm: any) {

    //need to add a call to the search API here.
    //this.loading = true;
    this.data = [
      {
          "id": "mds3:0081",
          "name": "ZoIrY",
          "acls":
          {
              "read":
              [
                  "cnd7"
              ],
              "write":
              [
                  "cnd7"
              ],
              "admin":
              [
                  "cnd7"
              ],
              "delete":
              [
                  "cnd7"
              ]
          },
          "owner": "cnd7",
          "deactivated": null,
          "status":
          {
              "created": 1700154605.5411382,
              "state": "edit",
              "action": "update",
              "since": 1700154605.5412595,
              "modified": 1700154646.185461,
              "message": "",
              "createdDate": "2023-11-16T17:10:05",
              "modifiedDate": "2023-11-16T17:10:46",
              "sinceDate": "2023-11-16T17:10:05"
          },
          "data":
          {
              "@id": "ark:/88434/mds3-0081",
              "title": "Title of Record",
              "_schema": "https://data.nist.gov/od/dm/nerdm-schema/v0.7#",
              "@type":
              [
                  "nrdp:PublicDataResource",
                  "dcat:Resource"
              ],
              "doi": "doi:10.18434/mds3-0081",
              "author_count": 0,
              "file_count": 0,
              "nonfile_count": 0,
              "reference_count": 0
          },
          "meta":
          {
              "resourceType": "data",
              "creatorisContact": true,
              "willUpload": false,
              "assocPageType": "stand-alone"
          },
          "curators":
          [],
          "type": "dap"
      },
      {
          "id": "mds3:0068",
          "name": "H652E",
          "acls":
          {
              "read":
              [
                  "cnd7"
              ],
              "write":
              [
                  "cnd7"
              ],
              "admin":
              [
                  "cnd7"
              ],
              "delete":
              [
                  "cnd7"
              ]
          },
          "owner": "cnd7",
          "deactivated": null,
          "status":
          {
              "created": 1695319633.0411932,
              "state": "edit",
              "action": "update",
              "since": 1695319633.041336,
              "modified": 1695319658.6617084,
              "message": "",
              "createdDate": "2023-09-21T18:07:13",
              "modifiedDate": "2023-09-21T18:07:38",
              "sinceDate": "2023-09-21T18:07:13"
          },
          "data":
          {
              "@id": "ark:/88434/mds3-0068",
              "title": "This is my test record",
              "_schema": "https://data.nist.gov/od/dm/nerdm-schema/v0.7#",
              "@type":
              [
                  "nrdp:PublicDataResource",
                  "dcat:Resource"
              ],
              "doi": "doi:10.18434/mds3-0068",
              "contactPoint":
              {
                  "fn": "Christopher Davis",
                  "hasEmail": "mailto:christopher.davis@nist.gov",
                  "@type": "vcard:Contact"
              },
              "author_count": 0,
              "file_count": 0,
              "nonfile_count": 0,
              "reference_count": 0
          },
          "meta":
          {
              "resourceType": "data",
              "creatorisContact": true,
              "willUpload": false,
              "assocPageType": "stand-alone"
          },
          "curators":
          [],
          "type": "dap"
      },
      {
          "id": "mds3:0082",
          "name": "79hwX",
          "acls":
          {
              "read":
              [
                  "cnd7"
              ],
              "write":
              [
                  "cnd7"
              ],
              "admin":
              [
                  "cnd7"
              ],
              "delete":
              [
                  "cnd7"
              ]
          },
          "owner": "cnd7",
          "deactivated": null,
          "status":
          {
              "created": 1700161987.5689886,
              "state": "edit",
              "action": "create",
              "since": 1700161987.5691032,
              "modified": 1700161987.5742366,
              "message": "",
              "createdDate": "2023-11-16T19:13:07",
              "modifiedDate": "2023-11-16T19:13:07",
              "sinceDate": "2023-11-16T19:13:07"
          },
          "data":
          {
              "@id": "ark:/88434/mds3-0082",
              "title": "",
              "_schema": "https://data.nist.gov/od/dm/nerdm-schema/v0.7#",
              "@type":
              [
                  "nrdp:PublicDataResource",
                  "dcat:Resource"
              ],
              "doi": "doi:10.18434/mds3-0082",
              "author_count": 0,
              "file_count": 0,
              "nonfile_count": 0,
              "reference_count": 0
          },
          "meta":
          {
              "resourceType": "data",
              "creatorisContact": true,
              "willUpload": false,
              "assocPageType": "stand-alone"
          },
          "curators":
          [],
          "type": "dap"
      },
      {
          "id": "mds3:0115",
          "name": "Something",
          "acls":
          {
              "read":
              [
                  "cnd7"
              ],
              "write":
              [
                  "cnd7"
              ],
              "admin":
              [
                  "cnd7"
              ],
              "delete":
              [
                  "cnd7"
              ]
          },
          "owner": "cnd7",
          "deactivated": null,
          "status":
          {
              "created": 1704378224.7134526,
              "state": "edit",
              "action": "create",
              "since": 1704378224.7135918,
              "modified": 1704378224.7216735,
              "message": "",
              "createdDate": "2024-01-04T14:23:44",
              "modifiedDate": "2024-01-04T14:23:44",
              "sinceDate": "2024-01-04T14:23:44"
          },
          "data":
          {
              "@id": "ark:/88434/mds3-0115",
              "title": "",
              "_schema": "https://data.nist.gov/od/dm/nerdm-schema/v0.7#",
              "@type":
              [
                  "nrdp:PublicDataResource",
                  "dcat:Resource"
              ],
              "doi": "doi:10.18434/mds3-0115",
              "author_count": 0,
              "file_count": 0,
              "nonfile_count": 0,
              "reference_count": 0
          },
          "meta":
          {
              "resourceType": "data",
              "creatorisContact": true,
              "willUpload": false,
              "assocPageType": "loosely-related"
          },
          "curators":
          [],
          "type": "dap"
      }
  ]
  }
}
