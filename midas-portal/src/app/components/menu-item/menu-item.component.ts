import { Component, input, signal } from '@angular/core';
import { MenuItem } from '../custom-sidenav/custom-sidenav.component';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss'
})
export class MenuItemComponent {

  item = input.required<MenuItem>();
  collapsed = input(false)
  nestedMenuOpened = signal(false)

  activeItem: MenuItem | null = null;

  setActive(item: MenuItem) {
    this.activeItem = item;
  }
  toggleNestedMenu() {
    if (!this.item().subItems) return;
    this.nestedMenuOpened.set(!this.nestedMenuOpened());
  }

  /** returns true for any link that should use the Angular router */
  isInternalRoute(item: MenuItem): boolean {
    return item.link === '/dashboard' || item.link === '/search';
  }

}
