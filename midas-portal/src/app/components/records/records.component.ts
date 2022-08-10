import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import {MatSort, Sort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

export interface MIDASRecord {
  title: string;
  owner: string;
  lastmodified: string;
}



const RECORD_DATA: MIDASRecord[] = [
  {title: 'Data for a paper submitted to BERB titled \"On Grid Compressive Sensing for Spherical Field Measurements in Acoustics\" to be submitted to The Journal of the Acoustical Society of America.', owner: 'Yuffa, Alex', lastmodified:'2021-07-06'},
  {title: 'IEC 61850 Profile for Distributed Energy Resources Supporting IEEE 1547', owner: 'Nguyen, Cuong', lastmodified:'2021-11-14'},
  {title: 'Data for a paper submitted to BERB titled \"On Grid Compressive Sensing for Spherical Field Measurements in Acoustics\" to be submitted JASA.', owner: 'Yuffa, Alex', lastmodified:'2020-03-06'},
  {title: 'NIST Chemical Kinetics Database', owner: 'Muzny, Chris', lastmodified:'2018-01-20'},
  {title: 'NIST Polycyclic Aromatic Hydrocarbon Structure Index - SRD 204', owner: 'Allison, Thomas C.', lastmodified:'2022-02-03'},
  {title: 'NIST Chemistry WebBook - SRD 69', owner: 'Linstrom, Peter', lastmodified:'2022-04-17'},
  {title: 'NIST Interatomic Potentials Repository', owner: 'Hale, Lucas', lastmodified:'2021-07-06'},
  {title: 'NIST Public Data Listing', owner: 'Avila, Regina L.', lastmodified:'2020-10-14'},
  {title: 'Word pairs in psychology that have been hand-annotated for semantic similarity by psychologists', owner: 'Stanton, Brian', lastmodified:'2019-07-22'},
  {title: 'NIST CAD Models and STEP Files with PMI', owner: 'Lipman, Robert R.', lastmodified:'2021-09-17'},
  {title: 'NIST Atomic Spectra Database - SRD 78', owner: 'Kramida, Alexander', lastmodified:'2021-04-06'},
  {title: 'Enhanced durability of CNT based hierarchical composites subjected to accelerated aging environments.', owner: 'Forster, Aaron M.', lastmodified:'2022-07-04'},
  {title: 'REFLEAK: NIST Leak/Recharge Simulation Program for Refrigerant Blends - SRD 73', owner: 'Domanski, Piotr A.', lastmodified:'2019-03-14'},
  {title: 'Oracle Weblogic Application Server', owner: 'Sell, Sean', lastmodified:'2022-05-21'},
  {title: 'Commerce Business System, Core Financial System (CBS/CFS)', owner: 'Sell, Sean', lastmodified:'2021-07-1'},
  {title: 'Travel Manager (TM)', owner: 'Eichelberger, Gregory W.', lastmodified:'2018-07-27'},
  {title: 'Grants Management Information System (GMIS)', owner: 'Sell, Sean', lastmodified:'2021-07-06'}
];

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.css']
})
export class RecordsComponent implements OnInit {
  
  public records: any;
  public recordsApi: string;
  public data: any;

  displayedColumns: string[] = ['title', 'owner', 'lastmodified'];
  dataSource: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  @ViewChild(MatSort) sort!: MatSort;

  constructor() { 
    this.recordsApi = 'https://data.nist.gov/rmm/records'
  }

  

  ngAfterViewInit() {
   
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    
  }

  async ngOnInit() {
    //await this.getRecords()
    //this.data = this.records.ResultData
    this.data = RECORD_DATA;
    console.log(this.data)
    this.dataSource = new MatTableDataSource(this.data);
    
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
