import { Component, inject, input, model, computed } from '@angular/core';
import { Widget } from '../../../models/dashboard';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-widget-options',
  templateUrl: './widget-options.component.html',
  styleUrl: './widget-options.component.scss'
})
export class WidgetOptionsComponent {
  data = input.required<Widget>();
  showOptions = model<boolean>(false);

  store = inject(DashboardService);

  // Computed properties to determine if this is a stats widget
  isStatsWidget = computed(() => {
    return this.data().label.includes('Stats');
  });

  // Dynamic column options based on widget type
  columnOptions = computed(() => {
    if (this.isStatsWidget()) {
      // Stats widgets: 1-4 columns
      return [1, 2, 3];
    } else {
      // Table widgets: 2-6 columns  
      return [2, 3, 4, 5, 6];
    }
  });

  // Dynamic row options based on widget type
  rowOptions = computed(() => {
    if (this.isStatsWidget()) {
      // Stats widgets: 1-4 rows
      return [1, 2, 3];
    } else {
      // Table widgets: 3-6 rows
      return [3, 4, 5, 6];
    }
  });
}