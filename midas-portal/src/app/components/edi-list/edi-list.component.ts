import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

export interface Record {
  title: string;
  publisher: string;
  date: number;
}

@Component({
  selector: 'app-edi-list',
  templateUrl: './edi-list.component.html',
  styleUrls: ['./edi-list.component.css']
})
export class EdiListComponent implements OnInit {

  public records: any;
  public recordsApi: string;
  public data: any;
  displayedColumns: string[] = ['title', 'publisher', 'date']

  constructor(public dialog: MatDialog) { 
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

  openDialog(): void {
    const dialogRef = this.dialog.open(EdiListModal, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

}

@Component({
  selector: 'edi-list-modal',
  templateUrl: './edi-list-modal.component.html'
})
export class EdiListModal {

  constructor(
    public dialogRef: MatDialogRef<EdiListModal>,
  ){}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
