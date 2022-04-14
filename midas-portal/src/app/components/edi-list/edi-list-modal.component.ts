import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { EdiListComponent } from './edi-list.component';

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
  