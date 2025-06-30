import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-save-filter-dialog',
  templateUrl: './save-filter-dialog.component.html',
  styleUrl: './save-filter-dialog.component.scss'
})
export class SaveFilterDialogComponent {
  filterName: string = '';

  constructor(
    public dialogRef: MatDialogRef<SaveFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  save() {
    this.dialogRef.close(this.filterName);
  }
}
