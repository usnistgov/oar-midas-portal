import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-load-filter-dialog',
  templateUrl: './load-filter-dialog.component.html',
  styleUrls: ['./load-filter-dialog.component.scss']
})
export class LoadFilterDialogComponent {
  /** Holds the single selected filter name */
  selected: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<LoadFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { filterNames: string[] }
  ) {}

  /** Close and return the selected filter */
  load() {
    if (this.selected) {
      this.dialogRef.close(this.selected);
    }
  }

  /** Remove one saved filter from localStorage and update the list */
  delete(name: string) {
    localStorage.removeItem(`filter-${name}`);
    this.data.filterNames = this.data.filterNames.filter(n => n !== name);

    // if the just‐deleted one was selected, clear selection
    if (this.selected === name) {
      this.selected = null;
    }
  }
}
