import { Component, input, signal } from '@angular/core';
import { Widget } from '../../models/dashboard';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrl: './widget.component.scss',
  host: {
    '[style.grid-area]' : '"span " + (data().rows ?? 1) + "/ span " + (data().columns ?? 1)'
  },
  
})
export class WidgetComponent {

  data = input.required<Widget>();

  showOptions = signal(false);
}
