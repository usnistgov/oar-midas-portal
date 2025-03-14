import { Component, Input, OnInit, ViewChild,ChangeDetectorRef } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'
import {faUsersViewfinder,faBell,faUpRightAndDownLeftFromCenter,faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {Table} from 'primeng/table';
import { catchError,map,take,tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ConfigurationService } from 'oarng';
import { NISTPerson, SearchAPIService } from 'src/app/shared/search-api.service';
import { dmap } from '../../../models/dmap.model';
import { TDocumentDefinitions, StyleDictionary } from 'pdfmake/interfaces';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { Observable, forkJoin, Subscription,of ,firstValueFrom} from 'rxjs';
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
    ORG_NAME: string;
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
  resourceType: string = 'both';
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
  isAdvancedSearchCollapsed = true;

  

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
  
  public suggestions: People[] = [];
  public orgSuggestions: Org[] = [];
  peopleIndex: string = '';
  orgIndex: string = '';

  loading: boolean = false;

  @ViewChild('searchtable') searchTable: Table;

  constructor(private cfgsvc: ConfigurationService, public datepipe:DatePipe,
                private http: HttpClient,
              public dialogService: DialogService, public messageService: MessageService,
              public config:DynamicDialogConfig, private apiService: SearchAPIService,private cdr: ChangeDetectorRef)
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

  toggleAdvancedSearch() {
    console.log(this.isAdvancedSearchCollapsed)
    this.isAdvancedSearchCollapsed = !this.isAdvancedSearchCollapsed;
    this.cdr.detectChanges(); // Manually trigger change detection
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
    try {
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
    } catch (error) {
      console.error("Error serializing item:", error);
      return null; // Return null or an appropriate default value in case of error
    }
  }

  reset_forsearch(){
    if (this.data$ !== undefined) {
      this.data$ = this.data$.pipe(
        map(items => items.map(item => ({
          ...item,
          selected: !item.selected // This line toggles the `selected` state.
        })))
      );
    }
    this.dapData = [];
    this.dmpData = [];
  }

  search(searchTerm: any) {
    this.reset_forsearch()
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
    console.log(data)
  
    const urlDAP = `${this.dapAPI}/:selected`;
    const dap$ = this.fetchAdvancedSearchResults(urlDAP, data, 'dap').pipe(
      catchError(error => {
        console.error("Error fetching DAP search results:", error);
        return of([]); // Return an empty array in case of error
      })
    );
    
    const urlDMP = `${this.dmpAPI}/:selected`;
    const dmp$ = this.fetchAdvancedSearchResults(urlDMP, data, 'dmp').pipe(
      catchError(error => {
        console.error("Error fetching DMP search results:", error);
        return of([]); // Return an empty array in case of error
      })
    );

    this.data$ = forkJoin([dap$, dmp$]).pipe(
      map(([dapData, dmpData]) => [...dapData, ...dmpData]),
      catchError(error => {
        console.error("Error combining search results:", error);
        return of([]); // Return an empty array in case of error
      })
    );
    }

    onPublishedBeforeChange(): void {
      if (this.publishedBefore) {
        // Reset "Last modified after" when "Last modified before" is modified
        this.publishedAfter = null;
      }
    }
  
    onPublishedAfterChange(): void {
      if (this.publishedAfter) {
        // Reset "Last modified before" when "Last modified after" is modified
        this.publishedBefore = null;
      }
    }

  

  async onSearchClick() {
    this.reset_forsearch()
    //need to build DBIO search JSON here
    let andArray = [
    ];
    if(this.searchTerm) { 
        var searchTermObj = {'$text': {'$search': this.searchTerm}};
        andArray.push(searchTermObj);
    }
    if(this.keywords) {
        const keywordsArray = this.keywords.split(/[\s,]+/).filter(Boolean);

        const orArray = keywordsArray.map((keyword: string )=> ({
            "data.keywords": { "$in": [keyword] }
        }));
        const orQuery = { "$or": orArray };
        andArray.push(orQuery);
    }
    /*
    if(this.theme) {
        var themeObj = {"data.theme": { "$in": [this.theme] }};
        andArray.push(themeObj);
    }
        */
    if(this.status) { 
        var statusObj = {'status.state': this.status};
        andArray.push(statusObj);
    }
    if(this.publishedAfter) {
        var publishedAfterObj = {'status.modified': {'$gte': this.publishedAfter.getTime() / 1000}};
        andArray.push(publishedAfterObj);
    }
    if(this.publishedBefore) {
        var publishedBeforeObj = {'status.modified': {'$lte': this.publishedBefore.getTime() / 1000}};
        andArray.push(publishedBeforeObj);
    }
    
    if (this.selectedOrg) {
      var orgObj = this.selectedOrg.ORG_NAME.replace(/\s*\(.*?\)\s*/g, '').trim();;
         const orArray =  [
              { "data.organizations.groupName": orgObj },
              { "data.organizations.divisionName": orgObj  },
              { "data.organizations.ouName": orgObj  }
          ]

      const orQuery = { "$or": orArray };
      andArray.push(orQuery);
  }


  if (this.recordOwner) {

    try {
      var tmpdata: NISTPerson = await firstValueFrom(this.apiService.get_NIST_Person(this.recordOwner.PEOPLE_ID));
      const ownerObj = { owner: tmpdata.nistUsername};
      andArray.push(ownerObj);
    } catch (error) {
      console.error("Error fetching record owner:", error);
    }
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
      
      console.log("after permissions "+JSON.stringify(data))
        
    const apiMap = {
        'dmp': this.dmpAPI,
        'dap': this.dapAPI
      } as const;
      
      if (this.resourceType === 'dmp' || this.resourceType === 'dap') {
        const url = `${apiMap[this.resourceType as keyof typeof apiMap]}/:selected`;
        console.log("in if "+data)
        this.data$ = this.fetchAdvancedSearchResults(url, data, this.resourceType).pipe(
          catchError(error => {
            console.error(`Error fetching ${this.resourceType.toUpperCase()} search results:`, error);
            return of([]); // Return an empty array in case of error
          })
        );
      } else {
        const urlDAP = `${this.dapAPI}/:selected`;
        const dap$ = this.fetchAdvancedSearchResults(urlDAP, data, 'dap').pipe(
          catchError(error => {
            console.error("Error fetching DAP search results:", error);
            return of([]); // Return an empty array in case of error
          })
        );
    
        const urlDMP = `${this.dmpAPI}/:selected`;
        const dmp$ = this.fetchAdvancedSearchResults(urlDMP, data, 'dmp').pipe(
          catchError(error => {
            console.error("Error fetching DMP search results:", error);
            return of([]); // Return an empty array in case of error
          })
        );
    
        this.data$ = forkJoin([dap$, dmp$]).pipe(
          map(([dapData, dmpData]) => [...dapData, ...dmpData]),
          catchError(error => {
            console.error("Error combining search results:", error);
            return of([]); // Return an empty array in case of error
          })
        );
      }
  }

  fetchAdvancedSearchResults(url:string,searchJSON:any,type:string): Observable<any[]> {
    return this.http.post(url,searchJSON, { headers: { Authorization: "Bearer "+this.authToken }})
      .pipe(
        map((responseData: any) => {
          if (responseData) {
            console.log("Loading "+responseData.length+" records");
            console.log(responseData)
            return responseData.map((record:any) => this.customSerialize(record, type));
          } else {
            console.log("No records to load for "+type);
            return [];
          }
        })
      );
  }



  onExportListClick() {
    try {
      if (this.selected.length !== 0) {
        var tmpData: any[] = [];
        if (this.outputType == 'pdf') {
          try {
            for (let item of this.selected) {
              if (item.startsWith('mdm')) {
                tmpData.push(this.dmpData.find((dmp: any) => dmp.id === item));
              } else if (item.startsWith('mds')) {
                tmpData.push(this.dapData.find((dap: any) => dap.id === item));
              }
            }
  
            // Prepare table data
            const tableBody = tmpData.map((record: any) => {
              const type = record.id.startsWith('mds') ? "dap" : "dmp";
              return [
                type,
                { text: record.id, link: this.linkto(record.id, type), color: 'blue', decoration: 'underline' },
                record.name,
                record.owner,
                record.status.modifiedDate.split('T')[0],
                record.status.state,
                record.id.startsWith('mdm') && record.data.organizations && record.data.organizations.length > 0 ? record.data.organizations[0].ORG_ID : 'no-org-code',
                record.id.startsWith('mds') ? "no-title" : record.data.title
              ];
            });
  
            const tableHeaders = [
              { text: 'Type', style: 'tableHeader' },
              { text: 'Rec #', style: 'tableHeader' },
              { text: 'Name', style: 'tableHeader' },
              { text: 'Owner', style: 'tableHeader' },
              { text: 'Modified Date', style: 'tableHeader' },
              { text: 'Status', style: 'tableHeader' },
              { text: 'Org code', style: 'tableHeader' },
              { text: 'Title', style: 'tableHeader' }
            ];
  
            const table = {
              table: {
                headerRows: 1,
                widths: ['*', '*', '*', '*', '*', '*', '*', '*'],
                body: [
                  tableHeaders,
                  ...tableBody.map(row => row.map(cell => ({ text: cell, style: 'tableBody' }))), // Apply body style to each cell
                ]
              }
            };
  
            let docDefinition: TDocumentDefinitions = {
              content: [
                { text: 'EDI Dataset Status', style: 'title' }, // Title
                { text: 'Total records selected : ' + tableBody.length, style: 'subtitle' }, // Subtitle
                { text: '(Click the record number to go to the record)', style: 'subsubtitle' }, // Subtitle
                table // Add the table to the PDF content
              ],
              styles: {
                title: {
                  fontSize: 18,
                  bold: true,
                  margin: [0, 0, 0, 10], // Adjust margin as needed
                  alignment: 'center'
                },
                subtitle: {
                  fontSize: 12,
                  bold: false,
                  margin: [0, 0, 0, 20], // Adjust margin as needed
                  alignment: 'center'
                },
                tableHeader: {
                  fontSize: 12,
                  bold: true,
                  color: 'white',
                  fillColor: '#7B9BDA', // Background color for headers
                },
                tableBody: {
                  fontSize: 10,
                  fillColor: '#F9F1BC', // Background color for body
                },
                subsubtitle: {
                  fontSize: 6,
                  bold: false,
                  margin: [0, 0, 0, 0], // Adjust margin as needed
                },
              },
              header: function (currentPage, pageCount) {
                return {
                  columns: [
                    { text: 'Date: ' + new Date().toLocaleDateString(), alignment: 'left', fontSize: 10 },
                    { text: 'Page ' + currentPage.toString() + ' of ' + pageCount, alignment: 'right', fontSize: 10 }
                  ],
                  margin: [40, 20] // Adjust as needed
                };
              },
              footer: function (currentPage, pageCount) {
                return {
                  columns: [
                    { text: 'Link to portal', link: 'https://localhost/portal/landing', color: 'blue', decoration: 'underline', alignment: 'center', margin: [0, 0, 0, 20] } // Adjust as needed
                  ]
                };
              }
            };
  
            // Download the PDF
            const timestamp = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '');
            const filename = `records_${timestamp}.pdf`;
            pdfMake.createPdf(docDefinition).download(filename);
          } catch (error) {
            console.error("Error generating PDF:", error);
          }
  
        } else if (this.outputType == 'csv') {
          try {
            if (this.resourceType === 'dmp') {
              for (let item of this.selected) {
                tmpData.push(this.dmpData.find((dmp: any) => dmp.id === item));
              }
              this.exportCSV(tmpData);
            } else if (this.resourceType === 'dap') {
              for (let item of this.selected) {
                tmpData.push(this.dapData.find((dap: any) => dap.id === item));
              }
              this.exportCSV(tmpData);
            } else {
              const allStartWithMds = this.selected.every(item => item.startsWith('mds'));
              const allStartWithMdm = this.selected.every(item => item.startsWith('mdm'));
  
              if (allStartWithMds) {
                for (let item of this.selected) {
                  tmpData.push(this.dapData.find((dap: any) => dap.id === item));
                }
                this.exportCSV(tmpData);
              } else if (allStartWithMdm) {
                for (let item of this.selected) {
                  tmpData.push(this.dmpData.find((dmp: any) => dmp.id === item));
                }
                this.exportCSV(tmpData);
              } else {
                alert('You can only export CSV for a single resource type. Please select only dmp or daps and try again.');
                return;
              }
            }
          } catch (error) {
            console.error("Error generating CSV:", error);
          }
  
        } else if (this.outputType == 'json') {
          try {
            if (this.resourceType === 'dmp') {
              for (let item of this.selected) {
                tmpData.push(this.dmpData.find((dmp: any) => dmp.id === item));
              }
              this.export_json(tmpData);
            } else if (this.resourceType === 'dap') {
              for (let item of this.selected) {
                tmpData.push(this.dapData.find((dap: any) => dap.id === item));
              }
              this.export_json(tmpData);
            } else {
              const allStartWithMds = this.selected.every(item => item.startsWith('mds'));
              const allStartWithMdm = this.selected.every(item => item.startsWith('mdm'));
  
              if (allStartWithMds) {
                for (let item of this.selected) {
                  tmpData.push(this.dapData.find((dap: any) => dap.id === item));
                }
                this.export_json(tmpData);
              } else if (allStartWithMdm) {
                for (let item of this.selected) {
                  tmpData.push(this.dmpData.find((dmp: any) => dmp.id === item));
                }
                this.export_json(tmpData);
              } else {
                alert('You can only export JSON for a single resource type. Please select only dmp or daps and try again.');
              }
            }
          } catch (error) {
            console.error("Error generating JSON:", error);
          }
        }
      } else {
        alert('No records selected. Please select records and try again.');
      }
    } catch (error) {
      console.error("Error processing export:", error);
    }
  
    this.data$ = this.data$.pipe(
      map(items => items.map(item => ({
        ...item,
        selected: this.selected.includes(item.id)
      })))
    );
    this.selected = [];
  }

  export_json(tmpData: any[]){
    if (tmpData && tmpData.length !== 0) {
      try {
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
    } catch (error) {
      console.error("Error exporting JSON:", error);
    }
    }

}

flattenObject(obj: any, parentKey = '', delimiter = '_'): any {
  let flattened: { [key: string]: any } = {};
  try{
  for (const [key, value] of Object.entries(obj)) {
    const newKey = parentKey ? `${parentKey}${delimiter}${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, this.flattenObject(value, newKey, delimiter));
    } else {
      flattened[newKey] = value;
    }
  }

  return flattened;
} catch (error) {
  console.error("Error flattening object:", error);
  return {}; // Return an empty object in case of error
}
}

 getFlattenedKeys(obj: any, parentKey = '', delimiter = '_'): string[] {
  let keys: string[]=[];
  try{
  for (const [key, value] of Object.entries(obj)) {
    const newKey = parentKey ? `${parentKey}${delimiter}${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(this.getFlattenedKeys(value, newKey, delimiter));
    } else {
      keys.push(newKey);
    }
    
  }

  return keys;
} catch (error) {
  console.error("Error getting flattened keys:", error);
  return []; // Return an empty array in case of error
}
}

flattenJson(y: any):string{
  try {
  let out: { [key: string]: any } = {};

  function sanitizeValue(value: any): string {
    let stringValue = String(value).replace(/"/g, '""'); // Escape double quotes
    // Enclose the value in double quotes if it contains a comma, quote, or newline
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      stringValue = `"${stringValue}"`;
    }
    return stringValue;
  }

  function flatten(x: any): string {
    if (typeof x === 'object' && !Array.isArray(x) && x !== null) {
      var dict = ''
      for (const a in x) {
        const tmp = flatten(x[a])
        dict+=tmp+','
      }
      return dict.slice(0,-1)
    } else if (Array.isArray(x)) {
      console.log('Array:', x);
      // Join array elements with a semicolon and sanitize
      if(typeof x[0] === 'object'){
        if ( 'ORG_ID' in x[0]) {
          var tmp_orga=''
          for(let i=0; i< x.length;i++){
            tmp_orga+=x[i].name+' ('+x[i].ORG_ID+')'+';'
          }
          return sanitizeValue(tmp_orga.slice(0,-1));
        }else{
          return sanitizeValue(String(x[0]));
        }
      }
      return sanitizeValue(x.join(';'));
    } else {
      // Apply sanitization to non-object and non-array values
      return sanitizeValue(x);
    }
  }

  return flatten(y);
} catch (error) {
  console.error("Error flattening JSON:", error);
  return ''; // Return an empty object in case of error
}
}

exportCSV(jsonArray: any[]) {
  try{
  console.log('Exporting CSV:', jsonArray);
  // Extract column headers
  const headers = this.getFlattenedKeys(jsonArray[0]).join(',');
  console.log('Headers:', headers);
  var out:string='';
  // Map each json object to a CSV row
  const rows = jsonArray.map(obj => {
    // Map each value in the object, flatten it, and then join with commas
    const row = Object.values(obj).map(value => this.flattenJson(value)).join(',');
    // Append the row to out with a newline character
    out += row + '\n';
    return row; // Return the row if you need the array of rows as well
    
  });

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
} catch (error) {
  console.error("Error exporting CSV:", error);
}
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

  getPeople(this:any, $event: any) {
    //only begin search process if 2 or more characters are entered
    if($event.query.length >= 2) {
      let queryString = $event.query;
      let tempPeople: People[] = [];
      //console.log('beginning people search');
      //if we have an index already, search on that
      if(!this.peopleIndex) {
        //console.log('no index');
        //no index loaded; make the API call to load index into memory
        this.apiService.get_NIST_Personnel(queryString.toUpperCase()).subscribe((value:any) => {
          this.peopleIndex = value;
          if(this.peopleIndex != null) {
            this.searchPeopleIndex(queryString);
          }
        });
      }
      else {
        //index is already present, just filter on it
        this.searchPeopleIndex(queryString);
      }
    }
    else {
      //console.log('clearing index');
      //less than two characters entered, make sure the index is cleared
      this.peopleIndex = null;
      this.suggestions = [];
    }
  }

  searchPeopleIndex(this:any, queryString: string) {
    console.log('filtering people index');
    let tempPeople: People[] = [];
    for(let tempPerson in this.peopleIndex) {
      if(tempPerson.toUpperCase().includes(queryString.toUpperCase())) {
        //need to traverse the match, in case there are multiple people in the match
        for(let item in this.peopleIndex[tempPerson]) {
          tempPeople.push({PEOPLE_ID: +item,
            FULL_NAME: this.peopleIndex[tempPerson][item],
            FIRST_NAME: this.peopleIndex[tempPerson][item].split(',')[1],
            LAST_NAME: this.peopleIndex[tempPerson][item].split(',')[0],
          })
        }
        this.suggestions = tempPeople;
      }
    }
  }

  searchOrgIndex(this: any, queryString: string) {
    console.log('filtering org index');
    let tempOrgs: Org[] = [];
    for(let tempOrg in this.orgIndex) {
      if(tempOrg.toUpperCase().includes(queryString.toUpperCase())) {
        //need to traverse the match, in case there are multiple orgs in the match
        for(let item in this.orgIndex[tempOrg]) {
          tempOrgs.push({ORG_ID: +item,
            ORG_NAME: this.orgIndex[tempOrg][item]
          })
        }
        this.orgSuggestions = tempOrgs;
      }
    }
  }

  getOrgs(this: any, $event: any) {
    //only begin search process if 2 or more characters are entered
    if($event.query.length >= 2) {
      let queryString = $event.query;
      let tempOrgs: Org[] = [];
      //console.log('beginning org search');
      //if we have an index already, search on that
      if(!this.orgIndex) {
        //console.log('no index');
        //no index loaded; make the API call to load index into memory
        this.apiService.get_NIST_Organizations(queryString.toUpperCase()).subscribe((value:any) => {
          this.orgIndex = value;
          if(this.orgIndex != null) {
            this.searchOrgIndex(queryString);
          }
        });
      }
      else {
        //index is already present, just filter on it
        this.searchOrgIndex(queryString);
      }
      
    }
    else {
      console.log('clearing org index');
      //less than two characters entered, make sure the index is cleared
      this.orgIndex = null;
      this.orgSuggestions = [];
    }
  }


}
