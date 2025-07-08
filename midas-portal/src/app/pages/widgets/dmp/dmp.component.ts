import { Component } from '@angular/core';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-dmp',
  templateUrl: './dmp.component.html',
  styleUrl: './dmp.component.scss'
})
export class DmpComponent {

  constructor(private dataService: DataService) {
    // Initialize or fetch DMPs if needed
    // this.dataService.fetch
    // 
    // Dmps();
  }

  get dmpCount() {
    return this.dataService.dmps().length;
  }

  get recentDmpCount() {
    return this.dataService.dmps().filter(dmp => {
      const modifiedDate = new Date(dmp.modifiedDate);
      const today = new Date();
      const diffDays = Math.ceil((today.getTime() - modifiedDate.getTime()) / (1000 * 3600 * 24));
      return diffDays <= 30; // Adjust the number of days as needed
    }).length;
  }
}
