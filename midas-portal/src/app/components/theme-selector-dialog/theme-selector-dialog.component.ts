import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// the format of the data we pass
export interface ThemeSelectorData {
  family: 'theme-light' | 'theme-1' | 'theme-2' | 'theme-3' | 'theme-4';
  variant: 'light' | 'dark';
}

@Component({
  selector: 'app-theme-selector-dialog',
  templateUrl: './theme-selector-dialog.component.html',
  styleUrls: ['./theme-selector-dialog.component.scss'],
})
export class ThemeSelectorDialogComponent {
  families = [
    { value: 'theme-light', label: 'Default (Blue)' },
    { value: 'theme-1', label: 'Indigo' },
    { value: 'theme-2', label: 'Cyan' },
    { value: 'theme-3', label: 'Teal' },
    { value: 'theme-4', label: 'Purple' },
  ];

  private origFamily: string;
  private origVariant: string;

  constructor(
    private dialogRef: MatDialogRef<ThemeSelectorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ThemeSelectorData
  ) {
    // remember what was on <html> when dialog opened, to restore if closing without saving
    this.origFamily = data.family;
    this.origVariant = data.variant;
  }

  /**
   * Apply whatever is currently in `this.data`
   * to <html> to see it live.
   */
  preview() {
    const html = document.documentElement;
    // clear all the old family+variant classes
    html.classList.remove(
      this.origFamily, this.origVariant,
      ...this.families.map(f => f.value),
      'light', 'dark'
    );
    // add the new ones
    html.classList.add(this.data.family, this.data.variant);
  }

  /** when user hits “Apply” — close with data, keep preview in place */
  apply() {
    this.dialogRef.close(this.data);
  }

  /** when user hits “Cancel” — restore original and close without data */
  cancel() {
    const html = document.documentElement;
    // clear what we previewed
    html.classList.remove(this.data.family, this.data.variant);
    // put back the originals
    html.classList.add(this.origFamily, this.origVariant);
    this.dialogRef.close();
  }
}
