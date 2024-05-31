import { Component, Input, OnInit, ViewChild } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'
import {faUsersViewfinder,faBell,faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
import {Table} from 'primeng/table';
import { map } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox'
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ConfigurationService } from 'oarng';
import { searchResult } from 'src/app/models/searchResult.model';
import { SearchAPIService } from 'src/app/shared/search-api.service';
import { dmap } from '../../../models/dmap.model';
import { TDocumentDefinitions, StyleDictionary } from 'pdfmake/interfaces';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { Observable, forkJoin, concat } from 'rxjs';

(pdfMake as any).vfs=pdfFonts.pdfMake.vfs;

interface Column {
  field: string;
  header: string;
}

interface People {
    PEOPLE_ID: number;
    LAST_NAME: string;
    FIRST_NAME: string;
    FULL_NAME: string;
}

interface Selected {
    id: number;
    name: string;
    selected: boolean;
    // Other properties...
  }

interface Org {
    ORG_ID: number;
    ORG_CD: string;
    ORG_LVL_ID: number;
    ORG_NFC_LVL_CD: number;
    ORG_NAME: string;
    EFFECTIVE_DT: string;
    ORG_ACRNM: string;
    ORG_SHORT_NAME: string;
    ORG_LOC_ID: number;
    PARENT_ORG_ID: number;
    PARENT_ORG_CD: string;
}

@Component({
  selector: 'app-search-list-modal',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.css']
})
export class SearchListModalComponent implements OnInit {
  authToken: string|null;
  @Input() openedAsDialog: boolean = false;
  faUpRightAndDownLeftFromCenter=faUpRightAndDownLeftFromCenter;
  faBell=faBell;
  faListCheck=faUsersViewfinder;
  public records: any;
  public data: any;
  data$: Observable<any[]>;
  statuses:any[];
  ref: DynamicDialogRef;
  public count:any;
  public searchTerm: any;
  searchURL: any;
  _selectedColumns!: Column[];
  cols!: Column[];
  allSelected: boolean = false;
  outputType:string;
  resourceType: any;
  dapAPI: string;
  dmpAPI: string;
  dapData=[]
  dmpData=[]

  

  keywords: any;
  theme: any;
  status: string[] = [];
  selectedOrg: any;
  recordOwner: any;
  output: any = 'grid';
  paper: any;
  publishedBefore: any;
  publishedAfter: any;
  
  public DMAP: any[]=[];
  orgs = [
    {
        "ORG_ID": 13642,
        "ORG_CD": "68501",
        "ORG_LVL_ID": 3,
        "ORG_NFC_LVL_CD": 6,
        "ORG_NAME": "Thermodynamic Metrology Group",
        "EFFECTIVE_DT": "2011-10-01",
        "ORG_ACRNM": "",
        "ORG_SHORT_NAME": "Thermo Metrology Group",
        "ORG_LOC_ID": 2,
        "PARENT_ORG_ID": 13268,
        "PARENT_ORG_CD": "685"
    },
    {
        "ORG_ID": 13643,
        "ORG_CD": "68502",
        "ORG_LVL_ID": 3,
        "ORG_NFC_LVL_CD": 6,
        "ORG_NAME": "Fluid Metrology Group",
        "EFFECTIVE_DT": "2011-10-01",
        "ORG_ACRNM": "",
        "ORG_SHORT_NAME": "Fluid Met Grp",
        "ORG_LOC_ID": 2,
        "PARENT_ORG_ID": 13268,
        "PARENT_ORG_CD": "685"
    },
    {
        "ORG_ID": 13443,
        "ORG_CD": "68503",
        "ORG_LVL_ID": 3,
        "ORG_NFC_LVL_CD": 6,
        "ORG_NAME": "Optical Radiation Group",
        "EFFECTIVE_DT": "2011-10-01",
        "ORG_ACRNM": "",
        "ORG_SHORT_NAME": "Optical Rad Grp",
        "ORG_LOC_ID": 2,
        "PARENT_ORG_ID": 13268,
        "PARENT_ORG_CD": "685"
    }];

  tempOwners = [
    {
        "PEOPLE_ID": 1,
        "LAST_NAME": "Davis",
        "FIRST_NAME": "Christopher",
        "FULL_NAME": "Davis, Christopher"
    },
    {
        "PEOPLE_ID": 2,
        "LAST_NAME": "Greene",
        "FIRST_NAME": "Gretchen",
        "FULL_NAME": "Greene, Gretchen"
    },
    {
        "PEOPLE_ID": 3,
        "LAST_NAME": "Plante",
        "FIRST_NAME": "Raymond",
        "FULL_NAME": "Plante, Raymond"
    },
    {
        "PEOPLE_ID": 4,
        "LAST_NAME": "Smith",
        "FIRST_NAME": "Roberta",
        "FULL_NAME": "Smith, Robert"
    },
    {
        "PEOPLE_ID": 5,
        "LAST_NAME": "Blonder",
        "FIRST_NAME": "Niksa",
        "FULL_NAME": "Blonder, Niksa"
    },
    {
        "PEOPLE_ID": 6,
        "LAST_NAME": "Walker",
        "FIRST_NAME": "Steven",
        "FULL_NAME": "Walker, Steven"
    },
    {
        "PEOPLE_ID": 7,
        "LAST_NAME": "Gao",
        "FIRST_NAME": "Jing",
        "FULL_NAME": "Gao, Jing"
    },
    {
        "PEOPLE_ID": 8,
        "LAST_NAME": "Lin",
        "FIRST_NAME": "Chuan",
        "FULL_NAME": "Lin, Chuan"
    },
    {
        "PEOPLE_ID": 9,
        "LAST_NAME": "Martins",
        "FIRST_NAME": "Melvin",
        "FULL_NAME": "Martins, Melvin"
    },
    {
        "PEOPLE_ID": 10,
        "LAST_NAME": "Loembe",
        "FIRST_NAME": "Alex",
        "FULL_NAME": "Loembe, Alex"
    }

  ]
  
  suggestions: People[] = []
  orgSuggestions: Org[] = []

  loading: boolean = false;

  @ViewChild('searchtable') searchTable: Table;

  constructor(private cfgsvc: ConfigurationService, public datepipe:DatePipe,
                private http: HttpClient,
              public dialogService: DialogService, public messageService: MessageService,
              public config:DynamicDialogConfig, private apiService: SearchAPIService,)
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
      this.dapAPI = config['dapAPI'];
      this.dmpAPI = config['dmpAPI'];
      // config values here
      
      this.authToken = this.config.data.authToken
      this.searchTerm = this.config.data.value
      //this.count=this.data.length

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

  onOutputTypeChange(event: any) {
    // Access the selected value from the event
    this.outputType = event.target.value;
    // Perform any other actions based on the selected value
  }

  onresourceTypeChange(event: any) {
    // Access the selected value from the event
    this.resourceType = event.target.value;
    // Perform any other actions based on the selected value
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

  /**
   * This function serialize the data received from the dbio to the model we defined.
   *  It helps dealing with the data later on in the portal
   * @param item is the data received form the dbio
   * @returns dap
   */
  public customSerialize(item: any,rectype:string) {
    console.log(item)
    let tmp = new dmap();
    tmp.id = item.id
    tmp.rectype =rectype
    rectype == 'dap' ? tmp.modifiedDate = new Date(item.status.modifiedDate) : tmp.modifiedDate = new Date(item.status.modified*1000)
    tmp.name = item.name
    tmp.owner = item.owner
    tmp.state = item.status.state
    tmp.orgid = 12
    //tmp.orgid = rectype === 'dmp'  ? item.data.organization[0].ORG_ID : '';
    //tmp.orgid = rectype === 'dmp' && item.data.organization && item.data.organization.length > 0 ? item.data.organization[0].ORG_ID : '';
    rectype == 'dap' ? tmp.title= item.data['title'] : tmp.title = ''
    return tmp
  }

  onSearchClick() {
    //need to build DBIO search JSON here
    let andArray = [
    ];

    if(this.keywords !=  undefined) {
        var keywordsObj = {'name': this.keywords};
        andArray.push(keywordsObj);
    }
    if(this.theme !=  undefined) {
        var themeObj = {'data.theme': this.keywords};
        andArray.push(themeObj);
    }/*
    if(this.status !=  undefined) { 
        var statusObj = {'status.state': this.status};
        andArray.push(statusObj);
    }*/
    if(this.selectedOrg !=  undefined) {
        var orgObj = {'org': this.selectedOrg.ORG_ID};
        andArray.push(orgObj);
    }
    if(this.recordOwner !=  undefined) {
        //may need to switch from people ID to username at some point
        var ownerObj = {'owner': this.recordOwner};
        andArray.push(ownerObj);
    }
    if(this.paper != undefined) {
        var paperObj = {'data.paper': this.paper};
        andArray.push(paperObj);
    }
    var searchJSON = {
        "$and": andArray
    };
    this.data = [];
    console.log('searchJSON: ' + JSON.stringify(searchJSON));
    const data = {
        filter: {
          $and: [
            {'name': { $regex: "test", $options: "i" }}
          ]
        },
        permissions: ['read', 'write']
      };
        
    console.log(data)
    const apiMap = {
        'dmp': this.dmpAPI,
        'dap': this.dapAPI
      } as const;
      
      if (this.resourceType === 'dmp' || this.resourceType === 'dap') {
        const url = `${apiMap[this.resourceType as keyof typeof apiMap]}/:selected`;
        this.data$ = this.fetchAdvancedSearchResults(url,data, this.resourceType);
      } else {
        const urlDAP = `${this.dapAPI}/:selected`;
        const dap$ = this.fetchAdvancedSearchResults(urlDAP,data,'dap');
        
        const urlDMP = `${this.dmpAPI}/:selected`;
        const dmp$ = this.fetchAdvancedSearchResults(urlDMP,data,'dmp');

        this.data$ = forkJoin([dap$, dmp$]).pipe(
            map(([dapData, dmpData]) => [...dapData, ...dmpData])
        );
      }
  }

  fetchAdvancedSearchResults(url:string,searchJSON:any,type:string): Observable<any[]> {
    return this.http.post(url,searchJSON, { headers: { Authorization: "Bearer "+this.authToken }})
      .pipe(
        map((responseData: any) => {
          console.log(responseData);
          if (responseData) {
            console.log("Loading "+responseData.length+" records");
            return responseData.map((record:any) => this.customSerialize(record, type));
          } else {
            console.log("No records to load");
            return [];
          }
        })
      );
  }

  onExportListClick(){
    console.log(this.outputType);
    if(this.outputType == 'pdf'){
    // Get the selected records
    const selectedRecords = this.data.filter((item: Selected)  => item.selected);
    console.log('Selected Records:', selectedRecords);

    // Prepare table data
    const tableBody = selectedRecords.map((record: dmap) => {
        return [
            record.rectype,
            record.id,
            record.name,
            record.owner,
            record.modifiedDate.toString(), // Convert Date to string
            record.state,
            record.orgid.toString(), // Convert number to string
            record.title
        ];
    });

    // Add table headers
    const tableHeaders = ['Record Type', 'ID', 'Name', 'Owner', 'Modified Date', 'State', 'Org ID', 'Title'];
    const tableHeaders1 = ['Record Typ1e', 'ID1', 'Name1', 'Owner1', 'Modified Date1', 'State1', 'Org ID1', 'Title1'];

    // Create the table
    const table = {
        table: {
            headerRows: 1,
            widths: ['10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%'],
            body: [
                tableHeaders,
                ...tableBody,
            ]
        }
    };

    let docDefinition: TDocumentDefinitions = {
        content: [
            { text: 'Selected Records', style: 'header' },
            table // Add the table to the PDF content
        ],
        styles: {
            header: {
                fontSize: 16,
                bold: true,
                margin: [0, 0, 0, 5], // bottom margin
                fillColor: 'blue',
                color: 'white', // Text color for the header
            },
            body: {
                fillColor: 'yellow',
            },
        }
    };

    // Download the PDF
    //I don't want my timestamp to be separated by _ 
    const timestamp = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '');
    const filename = `records_${timestamp}.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);

    // Perform your search logic here
}else if (this.outputType == 'csv'){
    const selectedRecords = this.data.filter((item: Selected)  => item.selected);
    const tableBody = selectedRecords.map((record: dmap) => {
        return [
            record.rectype,
            record.id,
            record.name,
            record.owner,
            record.modifiedDate.toString(), // Convert Date to string
            record.state,
            record.orgid.toString(), // Convert number to string
            record.title
        ];
    });

    var options = { 
        fieldSeparator: ',',
        quoteStrings: '',
        decimalseparator: '.',
        showLabels: true, 
        showTitle: false,
        useBom: true,
        noDownload: false,
        headers: ["Record type", "ID","name","owner","modified date","state","org id","title"]
      };

      const timestamp = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '');
    const filename = `records_${timestamp}`;
    new ngxCsv(tableBody, filename,options);
}else if (this.outputType == 'json'){
    var tmpData:any;
    const selectedRecords = this.data.filter((item: Selected)  => item.selected);
    console.log(selectedRecords)
    console.log("===============")
    console.log(this.resourceType)
    if(this.resourceType == 'dap'){
        tmpData = this.dapData.filter((dapRecord: any) =>
            selectedRecords.some((record: Selected) => dapRecord.id === record.id)
          );
    }else if(this.resourceType == 'dmp'){
        tmpData = this.dmpData.filter((dmpRecord: any) => 
            selectedRecords.some((record: Selected) => dmpRecord.id === record.id)
          );
    }

    if (tmpData && tmpData.length !== 0) {
        const timestamp = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '');
        const filename = `records_${timestamp}.json`;
        console.log(tmpData);
        var json = JSON.stringify(tmpData, null, 2);
        console.log(json);
        var blob = new Blob([json], {type: "application/json"});
        var url  = URL.createObjectURL(blob);

        var a = document.createElement('a');
        a.download = filename;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        console.log(tmpData)
        if(selectedRecords.length == 0 ){
            alert('No records selected. Please select records and try again.')
        }else if(this.outputType === 'json' && !this.resourceType) {
          alert('You can only export JSON for a single resource type. Please select a resource type and try again.');
          return;
        }
    
    }
    }
    else{
        alert('Please select an output type in the Advance Search section and try again.');
    }
}


  onExportRecordsClick(){
    // Get the selected records
    const selectedRecords = this.data.filter((item: Selected)  => item.selected);
    console.log('Selected Records:', selectedRecords);

    // Perform your search logic here
  }

  toggleSelectAll() {
    this.allSelected = !this.allSelected;
    this.data.forEach((item: Selected) => item.selected = this.allSelected);
  }

  getPeople($event: any) {
    //this.suggestions = this.tempOwners.filter(val => val.FULL_NAME.toUpperCase().includes($event.query.toUpperCase()))
    this.apiService.get_NIST_Personnel($event.query.toUpperCase()).subscribe((value) => {
        console.log(value);
    }
    );
    
  }

  getOrgs($event: any) {
    this.orgSuggestions = this.orgs.filter(val => val.ORG_NAME.toUpperCase().includes($event.query.toUpperCase()))
  }

  search(searchTerm: any) {
    this.searchTerm = searchTerm;
    console.log('searchJSON: ' + JSON.stringify(searchTerm));
    const data = {
        filter: {
          $and: [
            {'name': { $regex: searchTerm, $options: "i" }}
          ]
        },
        permissions: ['read', 'write']
      };
  
    const urlDAP = `${this.dapAPI}/:selected`;
    const dap$ = this.fetchAdvancedSearchResults(urlDAP,data,'dap');
    
    const urlDMP = `${this.dmpAPI}/:selected`;
    const dmp$ = this.fetchAdvancedSearchResults(urlDMP,data,'dmp');

    this.data$ = forkJoin([dap$, dmp$]).pipe(
        map(([dapData, dmpData]) => [...dapData, ...dmpData])
      );
    
    }

}
