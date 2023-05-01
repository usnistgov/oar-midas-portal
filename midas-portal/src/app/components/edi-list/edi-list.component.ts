import { Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-edi-list',
  templateUrl: './edi-list.component.html',
  styleUrls: ['./edi-list.component.css']
})
export class EdiListComponent implements OnInit {

  public records: any;
  public recordsApi: string;
  public data: string;
  //@ViewChild(MatSort) sort: MatSort;

  constructor() { 
    this.recordsApi = 'https://data.nist.gov/rmm/records'
  }

  

  ngAfterViewInit() {
    //this.records.sort = this.sort;
  }

  async ngOnInit() {
    await this.getRecords()
    this.data = "test"
    console.log(this.data)
  }

  async getRecords() {
    let records;
    await fetch(this.recordsApi).then(r => r.json()).then(function (r) {
      return records = r
    })

    return this.records = Object(records)
  }

  titleClick() {
    console.log(this);
  }

}
