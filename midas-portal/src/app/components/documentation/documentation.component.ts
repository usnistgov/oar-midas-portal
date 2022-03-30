import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.css']
})
export class DocumentationComponent implements OnInit {

  public records: any;
  public recordsApi: string;
  public data: any;
  displayedColumns: string[] = ['title', 'publisher', 'date']

  constructor() { 
    this.recordsApi = 'https://data.nist.gov/rmm/records'
  }

  async ngOnInit() {
    await this.getRecords()
    this.data = this.records.ResultData
    console.log(this.data)
  }

  async getRecords() {
    let records;
    await fetch(this.recordsApi).then(r => r.json()).then(function (r) {
      return records = r
    })

    return this.records = Object(records)
  }
}
