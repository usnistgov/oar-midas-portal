import { Component, Input, OnInit, ViewChild } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'
import {faUsersViewfinder,faBell,faUpRightAndDownLeftFromCenter,faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {Table} from 'primeng/table';
import { map,take,tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ConfigurationService } from 'oarng';
import { SearchAPIService } from 'src/app/shared/search-api.service';
import { dmap } from '../../../models/dmap.model';
import { TDocumentDefinitions, StyleDictionary } from 'pdfmake/interfaces';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { Observable, forkJoin, Subscription } from 'rxjs';
import { dap } from 'src/app/models/dap.model';

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
  dmpEDIT: string;
  dapEDIT: string;
  dapData:any=[]
  dmpData:any=[]
  edit = false;
  processing = false;
  submitted = false;
  published = false;
  selected: string[] = [];
  unused:any;
  dap$: Observable<any[]>;
  dmp$: Observable<any[]>;
  private dapSubscription: Subscription;

  

  keywords: any;
  theme: any;
  status: string;
  selectedOrg: any;
  recordOwner: any;
  output: any = 'grid';
  paper: any;
  publishedBefore: any;
  publishedAfter: any;
  faMagnifyingGlass=faMagnifyingGlass;
  
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
      this.dmpEDIT = config['dmpEDIT'];
      this.dapEDIT = config['dapEDIT'];
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

  linkto(item:string,rectype:string){
    if(rectype == 'dap'){
        return this.dapEDIT+item
    }else if(rectype == 'dmp'){
        return this.dmpEDIT+item
    }else{
        return ''
    }
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
    //if all items are selected when computing them, adding them to the selected items.
    if (this.allSelected){
      this.selected.push(item.id)
    }
    if (rectype == 'dap'){
      if(!this.dapData.find((object: any) => object.id === item.id)){
        this.dapData.push(item)
    }
    }else if(rectype == 'dmp'){
      if(!this.dmpData.find((object: any) => object.id === item.id)){
        this.dmpData.push(item)
      }
    }
    //serializing data
    let tmp = new dmap();
    tmp.id = item.id
    tmp.rectype =rectype
    rectype == 'dap' ? tmp.modifiedDate = new Date(item.status.modifiedDate) : tmp.modifiedDate = new Date(item.status.modified*1000)
    tmp.name = item.name
    tmp.owner = item.owner
    tmp.state = item.status.state
    //tmp.orgid = 12
    //tmp.orgid = rectype === 'dmp'  ? item.data.organization[0].ORG_ID : '';
    tmp.orgid = rectype === 'dmp' && item.data.organizations && item.data.organizations.length > 0 ? item.data.organizations[0].ORG_ID : '';
    rectype == 'dap' ? tmp.title= item.data['title'] : tmp.title = ''
    return tmp
  }

  search(searchTerm: any) {
    this.dapData = [];
    this.dmpData = [];
    this.searchTerm = searchTerm;
    console.log('searchJSON: ' + JSON.stringify(searchTerm));
    const data = {
        filter: {
          $and: [
            {
                "$text": {
                    "$search": searchTerm
                }
            }
          ]
        },
        permissions: ['read', 'write']
      };
  
    const urlDAP = `${this.dapAPI}/:selected`;
    const dap$ = this.fetchAdvancedSearchResults(urlDAP,data,'dap');
    
    const urlDMP = `${this.dmpAPI}/:selected`;
    const dmp$ = this.fetchAdvancedSearchResults(urlDMP,data,'dmp');

    this.data$ = forkJoin([ dap$, dmp$]).pipe(
        map(([dapData, dmpData]) => [...dapData, ...dmpData])
      );   
    }

  onSearchClick() {
    //need to build DBIO search JSON here
    let andArray = [
    ];

    if(this.keywords !=  undefined) {
        var keywordsObj = {'data.keyword': this.keywords};
        andArray.push(keywordsObj);
    }
    if(this.theme !=  undefined) {
        var themeObj = {'data.theme': this.keywords};
        andArray.push(themeObj);
    }
    if(this.status !=  undefined) { 
        var statusObj = {'status.state': this.status};
        andArray.push(statusObj);
    }
    if(this.publishedAfter !=  undefined) {
        var publishedAfterObj = {'status.modified': {'$gte': this.publishedAfter.getTime() / 1000}};
        andArray.push(publishedAfterObj);
    }
    if(this.publishedBefore !=  undefined) {
        var publishedBeforeObj = {'status.modified': {'$lte': this.publishedBefore.getTime() / 1000}};
        andArray.push(publishedBeforeObj);
    }
    /*
    if(this.selectedOrg !=  undefined) {
        var orgObj = {'org': this.selectedOrg.ORG_ID};
        andArray.push(orgObj);
    }*/
    if(this.recordOwner !=  undefined) {
        //may need to switch from people ID to username at some point
        var ownerObj = {'owner': this.recordOwner};
        andArray.push(ownerObj);
    }
    /*
    if(this.paper != undefined) {
        var paperObj = {'data.paper': this.paper};
        andArray.push(paperObj);
    }
    */

    const data = {
        filter: {
          $and: andArray
        },
        permissions: ['read', 'write']
      };
        
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
          if (responseData) {
            console.log("Loading "+responseData.length+" records");
            return responseData.map((record:any) => this.customSerialize(record, type));
          } else {
            console.log("No records to load for "+type);
            return [];
          }
        })
      );
  }



  onExportListClick(){
    if(this.selected.length !== 0 ){
      var tmpData: any[] = [];
      console.log(this.outputType);
      if(this.outputType == 'pdf'){
        for (let item of this.selected) {
          if (item.startsWith('mdm')) {
              tmpData.push(this.dmpData.find((dmp: any) => dmp.id === item));
          } else if (item.startsWith('mds')) {
              tmpData.push(this.dapData.find((dap: any) => dap.id === item));
          }
      }

    // Prepare table data
    const tableBody = tmpData.map((record: any) => {
        return [
            record.id.startsWith('mds') ? "DAP" : "DMP",
            record.id,
            record.name,
            record.owner,
            record.status.modifiedDate.split('T')[0],
            record.status.state,
            record.id.startsWith('mdm')  && record.data.organizations && record.data.organizations.length > 0 ? record.data.organizations[0].ORG_ID : '',
            record.id.startsWith('mds') ? "no-title" : record.data.title
        ];
    });
    console.log(tableBody)

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
      console.log("DAPDATA "+JSON.stringify(this.dapData, null, 2))
      console.log("DMPDATA "+JSON.stringify(this.dmpData, null, 2))
      if(this.resourceType === 'dmp'){
        for(let item of this.selected){
            tmpData.push(this.dmpData.find((dmp: any) => dmp.id === item));
        }
        this.exportCSV(tmpData);
      }else if(this.resourceType === 'dap'){  
        for(let item of this.selected){
          tmpData.push(this.dapData.find((dap: any) => dap.id === item));
      }
      this.exportCSV(tmpData);
      }else{
        const allStartWithMds = this.selected.every(item => item.startsWith('mds'));
        const allStartWithMdm = this.selected.every(item => item.startsWith('mdm'));

        if(allStartWithMds){
          for(let item of this.selected){
            tmpData.push(this.dapData.find((dap: any) => dap.id === item));
          }
        this.exportCSV(tmpData);
        }else if(allStartWithMdm){
          for(let item of this.selected){
            tmpData.push(this.dmpData.find((dmp: any) => dmp.id === item));
          }
          this.exportCSV(tmpData);
        }else{
          alert('You can only export JSON for a single resource type. Please select only dmp or daps  and try again.');
          return;
        }
      }  
    }else if (this.outputType == 'json'){
      console.log("DAPDATA "+JSON.stringify(this.dapData, null, 2))
      console.log("DMPDATA "+JSON.stringify(this.dmpData, null, 2))
      if(this.resourceType === 'dmp'){
        for(let item of this.selected){
            tmpData.push(this.dmpData.find((dmp: any) => dmp.id === item));
        }
        this.export_json(tmpData);
      }else if(this.resourceType === 'dap'){  
        for(let item of this.selected){
          tmpData.push(this.dapData.find((dap: any) => dap.id === item));
      }
      this.export_json(tmpData);
      }else{
        const allStartWithMds = this.selected.every(item => item.startsWith('mds'));
        const allStartWithMdm = this.selected.every(item => item.startsWith('mdm'));

        if(allStartWithMds){
          for(let item of this.selected){
            tmpData.push(this.dapData.find((dap: any) => dap.id === item));
          }
        this.export_json(tmpData);
        }else if(allStartWithMdm){
          for(let item of this.selected){
            tmpData.push(this.dmpData.find((dmp: any) => dmp.id === item));
          }
          this.export_json(tmpData);
        }else{
          alert('You can only export JSON for a single resource type. Please select only dmp or daps  and try again.');
          return;
        }
      }
    }
    }else{
      alert('No records selected. Please select records and try again.')
      return;
    }
}

  export_json(tmpData: any[]){
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
    }

}

flattenObject(obj: any, parentKey = '', separator = '_'): Record<string, any> {
  let flatObject: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
      const newKey = parentKey ? `${parentKey}${separator}${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(flatObject, this.flattenObject(value, newKey, separator));
      } else {
          flatObject[newKey] = value;
      }
  }
  return flatObject;
}

exportCSV(jsonArray: any[]) {
  console.log('Exporting CSV:', jsonArray);
  // Extract column headers
  const headers = Object.keys(jsonArray[0]).join(',');
  console.log('Headers:', headers);

  // Map each json object to a CSV row
  const rows = jsonArray.map(obj =>
    Object.values(obj).map(value => {
      // Convert the value to a string and escape double quotes
      let stringValue = String(value).replace(/"/g, '""');
      // Enclose the value in double quotes if it contains a comma, quote, or newline
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        stringValue = `"${stringValue}"`;
      }
      return stringValue;
    }).join(',')
  );

  // Combine headers and rows, and separate them by newline
  const csvData = [headers, ...rows].join('\n');
  const timestamp = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '');
  const filename = `records_${timestamp}.csv`;

  // Create a Blob with the CSV data
  var blob = new Blob([csvData], { type: "text/csv" });
  var url = URL.createObjectURL(blob);

  // Create an anchor element and trigger the download
  var a = document.createElement('a');
  a.download = filename;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
}




  onExportRecordsClick(){
    // Get the selected records
    const selectedRecords = this.data.filter((item: Selected)  => item.selected);
    console.log('Selected Records:', selectedRecords);

    // Perform your search logic here
  }


  toggleItemSelection(id: string) {
    console.log('Toggling item selection:', id);
    if (this.selected.includes(id)){
      this.selected = this.selected.filter(item => item !== id);
    }else{
      this.selected.push(id);
    }
    console.log('All Selected data:', this.selected);
  }
   

  toggleSelectAll() {
    this.allSelected = !this.allSelected;
  
  // Assuming this.data$ is your Observable of data
  // This will show on the UX that all items are selected
  this.data$ = this.data$.pipe(
    map(items => items.map(item => ({
      ...item,
      selected: this.allSelected
    })))
  );

  }

  getPeople($event: any) {
    this.apiService.get_NIST_Personnel($event.query.toUpperCase()).subscribe((value) => {
        console.log(value);
    }
    );
    
  }

  getOrgs($event: any) {
    this.orgSuggestions = this.orgs.filter(val => val.ORG_NAME.toUpperCase().includes($event.query.toUpperCase()))
  }


}
