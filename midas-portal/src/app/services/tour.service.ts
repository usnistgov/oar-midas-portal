import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { driver, DriveStep } from 'driver.js';

const TOUR_STORAGE_KEY = 'midas_tour_completed';
const WELCOME_DIALOG_KEY = 'midas_welcome_dismissed';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private driverInstance: ReturnType<typeof driver> | null = null;
  readonly isTourActive = signal(false);
  private currentStepIndex = 0;

  constructor(private router: Router) {}

  /**
   * Check if welcome dialog should be shown
   */
  shouldShowWelcome(): boolean {
    return localStorage.getItem(WELCOME_DIALOG_KEY) !== 'true';
  }

  /**
   * Mark welcome dialog as dismissed (don't ask again)
   */
  dismissWelcome(): void {
    localStorage.setItem(WELCOME_DIALOG_KEY, 'true');
  }

  /**
   * Check if this is the user's first visit (tour not completed)
   */
  shouldShowTour(): boolean {
    return localStorage.getItem(TOUR_STORAGE_KEY) !== 'true';
  }

  /**
   * Mark tour as completed so it won't auto-start again
   */
  markTourCompleted(): void {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  }

  /**
   * Reset tour state to allow re-watching
   */
  resetTour(): void {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    localStorage.removeItem(WELCOME_DIALOG_KEY);
  }

  /**
   * Dashboard tour steps
   */
  private getDashboardSteps(): DriveStep[] {
    return [
      {
        element: '[data-tour="sidebar-toggle"]',
        popover: {
          title: 'Expand Sidebar',
          description: 'Click here to expand the sidebar and see full menu labels and navigation options.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '[data-tour="add-widget"]',
        popover: {
          title: 'Add Widgets',
          description: 'Customize your dashboard by adding widgets. Choose from stats cards, tables, and more.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '[data-tour="widget-settings"]',
        popover: {
          title: 'Widget Settings',
          description: 'Click the settings icon to resize, move, or remove widgets from your dashboard.',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '[data-tour="search-export-menu"]',
        popover: {
          title: 'Search & Export',
          description: 'Access the Search & Export page for advanced filtering and data export options. Click Next to continue the tour there.',
          side: 'right',
          align: 'start'
        }
      }
    ];
  }

  /**
   * Search page tour steps
   */
  private getSearchSteps(): DriveStep[] {
    return [
      {
        element: '[data-tour="search-input"]',
        popover: {
          title: 'Quick Search',
          description: 'Type here to quickly filter records across all columns.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '[data-tour="advanced-search"]',
        popover: {
          title: 'Advanced Search',
          description: 'Expand this section to access advanced filtering options with multiple criteria.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '[data-tour="export-table"]',
        popover: {
          title: 'Export Table',
          description: 'Export the entire table data to CSV, Excel, or PDF format.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '[data-tour="download-selection"]',
        popover: {
          title: 'Download Selection',
          description: 'Download selected records in various formats. Select rows first using the checkboxes.',
          side: 'bottom',
          align: 'start'
        }
      }
    ];
  }

  /**
   * Start the guided tour from Dashboard
   */
  startTour(): void {
    this.isTourActive.set(true);
    this.currentStepIndex = 0;
    this.startDashboardTour();
  }

  /**
   * Start dashboard portion of the tour
   */
  private startDashboardTour(): void {
    const steps = this.getDashboardSteps();

    this.driverInstance = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(0, 0, 0, 0.7)',
      popoverClass: 'midas-tour-popover',
      steps,
      onDestroyStarted: () => {
        // If tour was closed early, mark as completed
        this.markTourCompleted();
        this.isTourActive.set(false);
        this.driverInstance?.destroy();
      },
      onDestroyed: () => {
        this.isTourActive.set(false);
      },
      onNextClick: () => {
        const currentStep = this.driverInstance?.getActiveIndex() ?? 0;

        // If on the last dashboard step (Search & Export menu), navigate to search page
        if (currentStep === steps.length - 1) {
          this.driverInstance?.destroy();
          this.navigateToSearchAndContinue();
          return;
        }

        this.driverInstance?.moveNext();
      }
    });

    // Wait for first element, then start
    this.waitForElement('[data-tour="sidebar-toggle"]').then(() => {
      this.driverInstance?.drive();
    });
  }

  /**
   * Navigate to search page and continue tour
   */
  private navigateToSearchAndContinue(): void {
    this.router.navigate(['/search']).then(() => {
      // Wait for the page to render, then start search tour
      setTimeout(() => {
        this.startSearchTour();
      }, 500);
    });
  }

  /**
   * Start search page portion of the tour
   */
  private startSearchTour(): void {
    const steps = this.getSearchSteps();

    this.driverInstance = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(0, 0, 0, 0.7)',
      popoverClass: 'midas-tour-popover',
      steps,
      onDestroyStarted: () => {
        this.markTourCompleted();
        this.isTourActive.set(false);
        this.driverInstance?.destroy();
      },
      onDestroyed: () => {
        this.isTourActive.set(false);
      }
    });

    // Wait for search input to be ready
    this.waitForElement('[data-tour="search-input"]').then(() => {
      this.driverInstance?.drive();
    });
  }

  /**
   * Utility to wait for an element to appear in the DOM
   */
  private waitForElement(selector: string, timeout = 5000): Promise<Element | null> {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((_, obs) => {
        const el = document.querySelector(selector);
        if (el) {
          obs.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Timeout fallback
      setTimeout(() => {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }, timeout);
    });
  }

  /**
   * Stop the tour if it's running
   */
  stopTour(): void {
    if (this.driverInstance) {
      this.driverInstance.destroy();
      this.driverInstance = null;
    }
    this.isTourActive.set(false);
  }
}
