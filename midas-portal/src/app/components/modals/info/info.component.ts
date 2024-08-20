import { Component } from '@angular/core';
import { DynamicDialogRef,DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent {
  constructor(public ref: DynamicDialogRef,public config: DynamicDialogConfig) {
    this.config.dismissableMask = true;
  }

  close() {
    this.ref.close('Some data');
  }
}