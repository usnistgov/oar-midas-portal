import { Injectable, signal, computed, effect } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Widget } from '../models/dashboard';
import { WIDGET_REGISTRY } from './widget-registry';

export interface UserDetails {
  userId: string;
  userEmail: string;
  userName: string;
  userLastName: string;
  winId: string;
  Group: string;
}

@Injectable()
export class DashboardService {
  /** All available widgets */
  readonly widgets = signal<Widget[]>(WIDGET_REGISTRY);

  /** Widgets the user has already added to their dashboard */
  readonly addedWidgets = signal<Widget[]>([]);

  private readonly DEFAULT_WIDGET_IDS = [5, 6, 7, 8];

  /** Widgets still available to add (registry minus added) */
  readonly widgetsToAdd = computed(() => {
    const addedIDs = this.addedWidgets().map(w => w.id);
    return this.widgets().filter(w => !addedIDs.includes(w.id));
  });

  constructor(private snackBar: MatSnackBar) {
    //this._loadPersistedWidgets();
    this._loadPersistedOrDefaultWidgets();
  }

  /** Persist widget changes into localStorage */
  saveWidgets = effect(() => {
    const widgetsWithoutContent: Partial<Widget>[] = this.addedWidgets().map(w => ({ ...w }));
    widgetsWithoutContent.forEach(w => delete w.content);
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgetsWithoutContent));
  })

  /** Read previously saved widgets and restore their content preferences */
  private _loadPersistedWidgets() {
    const json = localStorage.getItem('dashboardWidgets');
    if (!json) return;

    try {
      const saved = JSON.parse(json) as Widget[];
      // Map each stored ID back to its component class
      for (const w of saved) {
        const reg = this.widgets().find(x => x.id === w.id);
        if (reg) w.content = reg.content;
      }
      this.addedWidgets.set(saved);
    } catch {
      console.warn('Failed to parse persisted dashboardWidgets');
    }
  }

  private _loadPersistedOrDefaultWidgets() {
    const json = localStorage.getItem('dashboardWidgets');
    if (json) {
      try {
        const saved = JSON.parse(json) as Widget[];
        for (const w of saved) {
          const reg = this.widgets().find(x => x.id === w.id);
          if (reg) w.content = reg.content;
        }
        this.addedWidgets.set(saved);
        return;
      } catch {
        console.warn('Failed to parse persisted dashboardWidgets');
      }
    }
    // No saved widgets: use defaults
    const defaults = this.widgets().filter(w => this.DEFAULT_WIDGET_IDS.includes(w.id));
    this.addedWidgets.set(defaults);
  }

  

  /** Add one of the registry widgets to the dashboard */
  addWidget(widget: Widget) {
    this.addedWidgets.set([...this.addedWidgets(), { ...widget }]);
  }

  /** Update properties (size/position/etc.) of an existing widget */
  updateWidget(id: number, changes: Partial<Widget>) {
    const current = this.addedWidgets();
    const idx = current.findIndex(w => w.id === id);
    if (idx === -1) return;
    const updated = [...current];
    updated[idx] = { ...updated[idx], ...changes };
    this.addedWidgets.set(updated);
  }

  /** Remove a widget by its ID */
  removeWidget(id: number) {
    this.addedWidgets.set(this.addedWidgets().filter(w => w.id !== id));
  }

  /** Swap positions to move widget one slot to the right */
  moveWidgetRight(id: number) {
    this._swapWidgets(id, +1);
  }

  /** Swap positions to move widget one slot to the left */
  moveWidgetLeft(id: number) {
    this._swapWidgets(id, -1);
  }

  /** Helper to swap widget at id by offset positions */
  private _swapWidgets(id: number, offset: 1 | -1) {
    const arr = [...this.addedWidgets()];
    const i = arr.findIndex(w => w.id === id);
    if (i < 0 || i + offset < 0 || i + offset >= arr.length) return;
    [arr[i], arr[i + offset]] = [arr[i + offset], arr[i]];
    this.addedWidgets.set(arr);
  }

  /**
   * Move a widget by id source into the slot of widget id destination.
   * If either id is not found, does nothing.
   */
  updateWidgetPosition(source: number, destination: number) {
    const sourceIndex = this.addedWidgets().findIndex(w => w.id === source);
    if (sourceIndex === -1) {
      return;
    }
    const newWidgets = [...this.addedWidgets()];
    const sourceWidget = newWidgets.splice(sourceIndex, 1)[0];

    const destinationIndex = this.addedWidgets().findIndex(w => w.id === destination);
    if (destinationIndex === -1) {
      return;
    }
    const insertAt = destinationIndex === sourceIndex ? destinationIndex + 1 : destinationIndex;
    newWidgets.splice(insertAt, 0, sourceWidget);
    this.addedWidgets.set(newWidgets);
  }

}
