import { Component } from '@angular/core';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-dap',
  templateUrl: './dap.component.html',
  styleUrl: './dap.component.scss'
})
export class DapComponent {
  // If daps() is a signal:
  

  constructor(private dataService: DataService) {}

  get dapCount() {
    return this.dataService.daps().length;
  }

  get recentDapCount() {
    return this.dataService.daps().filter(dap => {
      const modifiedDate = new Date(dap.modifiedDate);
      const today = new Date();
      const diffDays = Math.ceil((today.getTime() - modifiedDate.getTime()) / (1000 * 3600 * 24));
      return diffDays <= 7; // Adjust the number of days as needed
    }).length;
  }
}