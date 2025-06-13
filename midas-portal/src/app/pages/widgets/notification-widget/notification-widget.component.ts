

import { Component, EventEmitter, Output, signal } from '@angular/core';
@Component({
  selector: 'app-notification-widget',
  templateUrl: './notification-widget.component.html',
  styleUrl: './notification-widget.component.scss'
})

export class NotificationsWidgetComponent {


  dismissed = signal(false);

  onDismiss() {
    this.dismissed.set(true);
  }

  clearAll() {
    this.dismissed.set(true);
  }
}

