import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {

  public records: any;
  public recordsApi: string;
  public data: any;
  displayedColumns: string[] = ['title', 'date']

  constructor(
    public apiService: ApiService
  ) { 
    this.recordsApi = 'https://data.nist.gov/rmm/records'
  }

  async ngOnInit() {
    console.log(this.apiService.getRecords())
    
    // this.data = this.records.ResultData
    // console.log(this.apiService.getRecords())
  }

  // async getRecords() {
  //   let records;
  //   await fetch(this.recordsApi).then(r => r.json()).then(function (r) {
  //     return records = r
  //   })

  //   return this.records = Object(records)
  // }
}
