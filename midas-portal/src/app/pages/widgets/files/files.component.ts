import { Component } from '@angular/core';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrl: './files.component.scss'
})
export class FilesComponent {
  constructor(private dataService: DataService) {
    // Initialize or fetch files if needed
    // this.dataService.fetchFiles();
  }

  get fileCount() {
    return this.dataService.files.length;
  }

  get recentFileCount() {
  return this.dataService.files().filter(file => {
    const modifiedDate = new Date(file.modifiedDate);
    const today = new Date();
    const diffDays = Math.ceil((today.getTime() - modifiedDate.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 30; // Adjust the number of days as needed
  }).length;
}

}
