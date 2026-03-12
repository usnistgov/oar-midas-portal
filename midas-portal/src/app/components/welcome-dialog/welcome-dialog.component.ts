import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

export interface WelcomeDialogResult {
  takeTour: boolean;
  dontAskAgain: boolean;
}

@Component({
  selector: 'app-welcome-dialog',
  templateUrl: './welcome-dialog.component.html',
  styleUrls: ['./welcome-dialog.component.scss']
})
export class WelcomeDialogComponent {
  dontAskAgain = false;

  constructor(private dialogRef: MatDialogRef<WelcomeDialogComponent>) {}

  onTakeTour(): void {
    this.dialogRef.close({ takeTour: true, dontAskAgain: this.dontAskAgain });
  }

  onSkip(): void {
    this.dialogRef.close({ takeTour: false, dontAskAgain: this.dontAskAgain });
  }
}
