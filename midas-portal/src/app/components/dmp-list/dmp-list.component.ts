import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import {MatSort, Sort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

import {faListCheck, faCheck,faFileEdit} from '@fortawesome/free-solid-svg-icons';
import { Table } from 'primeng/table';

export interface DMP {
  title: string;
  owner: string;
  lastmodified: string;
}

const RECORD_DATA: DMP[] = [
  {title: 'Characterization and Measurement of Complex Networks', owner: 'Isabel Beichl', lastmodified:'2021-07-03'},
  {title: 'SEM imaging using the JEOL JXA-8500F ', owner: 'Steven A. Buntin', lastmodified:'2022-02-14'},
  {title: 'EPMA WDS using JEOL JXA-8500F ', owner: 'Steven A. Buntin', lastmodified:'2019-05-11'},
  {title: 'EPMA EDS using JEOL JXA-8500F ', owner: 'Steven A. Buntin', lastmodified:'2017-04-20'},
  {title: 'IUPAC Solubility Data Series (Online) ', owner: 'Donald R. Burgess', lastmodified:'2021-11-21'},
  {title: 'Mathematical Analysis and Modeling', owner: 'Timothy J. Burns', lastmodified:'2021-09-17'},
  {title: 'First Principles Phase Stability Repository  ', owner: 'Benjamin P. Burton', lastmodified:'2020-08-26'},
  {title: 'Applied Mathematical Analysis', owner: 'Alfred S. Carasso', lastmodified:'2019-07-03'},
  {title: 'Biomaterials for Oral Health ', owner: 'Martin Y. M. Chiang', lastmodified:'2022-06-30'},
  {title: 'Optical Filter Calibration services ', owner: 'Steven J. Choquette', lastmodified:'2022-05-28'},
  {title: 'Flow Cytometry standards ', owner: 'Steven J. Choquette', lastmodified:'2021-10-14'},
  {title: 'Engineering Biology ', owner: 'Steven J. Choquette', lastmodified:'2020-06-20'},
  {title: 'optical filter srms ', owner: 'Steven J. Choquette', lastmodified:'2021-07-28'},
  {title: 'Cancer Biomarkers ', owner: 'Steven J. Choquette', lastmodified:'2022-01-07'},
  {title: 'XRD SRM certification ', owner: 'James Cline', lastmodified:'2021-07-06'},
  {title: 'Xray Powder Diffraction data from the NIST DBD', owner: 'Marcus Mendenhall', lastmodified:'2020-11-16'},
  {title: 'Xray diffraction data from the NIST Parallel Beam Diffractometer (PBD) platform', owner: 'Marcus Mendenhall', lastmodified:'2019-05-11'},
  {title: 'High Performance Computing and Visualization', owner: 'Judith E. Terrill', lastmodified:'2021-04-27'},
  {title: 'PMC Records', owner: 'Katherine E. Sharpless', lastmodified:'2021-04-06'},
  {title: 'Metrics for Providing Public Access to Results of Federally Funded Research', owner: 'Katherine E. Sharpless', lastmodified:'2019-11-23'},
  {title: 'Organizational Information about DMPs', owner: 'Katherine E. Sharpless', lastmodified:'2022-04-03'},
  {title: 'NIST X-ray Photoelectron Spectroscopy Database XPS - SRD 20 ', owner: 'Cedric J. Powell', lastmodified:'2021-07-06'},
  {title: 'NIST Electron Elastic-Scattering Cross-Section Database - SRD 64 ', owner: 'Cedric J. Powell', lastmodified:'2020-10-22'},
];

@Component({
  selector: 'app-dmp-list',
  templateUrl: './dmp-list.component.html',
  styleUrls: ['./dmp-list.component.css']
})
export class DmpListComponent implements OnInit {

  faCheck=faCheck;
  faListCheck=faListCheck;
  faFileEdit=faFileEdit;
  public records: any;
  public recordsApi: string;
  public data: any;

  displayedColumns: string[] = ['title', 'owner', 'lastmodified'];
  dataSource: any;

  @ViewChild('dmptable') dmpTable: Table;

  constructor() { 
    this.recordsApi = 'https://data.nist.gov/rmm/records'
  }

  

  ngAfterViewInit() {

  }

  async ngOnInit() {
    //await this.getRecords()
    //this.data = this.records.ResultData
    this.data = RECORD_DATA;
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

  filterTable(event: any) {
    this.dmpTable.filterGlobal(event.target.value, 'contains');
  }
}
