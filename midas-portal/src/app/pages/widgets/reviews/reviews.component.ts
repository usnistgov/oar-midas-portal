import { Component } from '@angular/core';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss'
})
export class ReviewsComponent {
  constructor(private dataService: DataService) {
    // Initialize or fetch reviews if needed
    // this.dataService.fetchReviews();
  }

  get reviewCount() {
    return this.dataService.reviews().length;
  }

  get pendingReviewCount() {
    return this.dataService.reviews().filter(review => review.currentReviewStep === 'pending').length;
  }


}
