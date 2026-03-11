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
        element: '[data-tour="dmp-table"]',
        popover: {
          title: 'Data Management Plans',
          description: 'View and manage your Data Management Plans (DMPs) in this table widget.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '[data-tour="dap-table"]',
        popover: {
          title: 'Digital Asset Publications',
          description: 'View and manage your Digital Asset Publications (DAPs) in this table widget.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '[data-tour="reviews-table"]',
        popover: {
          title: 'Reviews',
          description: 'Track and manage reviews for your records in this table widget.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '[data-tour="files-table"]',
        popover: {
          title: 'Files',
          description: 'View and manage files associated with your records in this table widget.',
          side: 'top',
          align: 'center'
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
          description: 'Use advanced filtering options with multiple criteria to refine your search results.',
          side: 'bottom',
          align: 'start'
        },
        onHighlightStarted: () => {
          // Expand the advanced search panel before highlighting
          const panel = document.querySelector('[data-tour="advanced-search"]') as HTMLElement;
          if (panel && !panel.classList.contains('mat-expanded')) {
            const header = panel.querySelector('mat-expansion-panel-header') as HTMLElement;
            header?.click();
          }
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
   * Final step - Help icon in sidebar
   */
  private getFinalStep(): DriveStep[] {
    return [
      {
        element: '[data-tour="help-icon"]',
        popover: {
          title: 'Need Help? Start the Tour Again!',
          description: 'Click this help icon anytime to restart the guided tour and explore the features again.',
          side: 'right',
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

    // Navigate to dashboard first if not already there
    if (!window.location.pathname.includes('dashboard')) {
      this.router.navigate(['/dashboard']).then(() => {
        setTimeout(() => {
          this.startDashboardTour();
        }, 300);
      });
    } else {
      this.startDashboardTour();
    }
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
        // Don't mark as completed yet - we have one more step
        this.driverInstance?.destroy();
      },
      onDestroyed: () => {
        // Tour will continue with final step
      },
      onNextClick: () => {
        const currentStep = this.driverInstance?.getActiveIndex() ?? 0;

        // If on the last search step, navigate back to dashboard for final step
        if (currentStep === steps.length - 1) {
          this.driverInstance?.destroy();
          this.navigateToDashboardAndFinish();
          return;
        }

        this.driverInstance?.moveNext();
      }
    });

    // Wait for search input to be ready
    this.waitForElement('[data-tour="search-input"]').then(() => {
      this.driverInstance?.drive();
    });
  }

  /**
   * Navigate back to dashboard and show final step (help icon)
   */
  private navigateToDashboardAndFinish(): void {
    this.router.navigate(['/dashboard']).then(() => {
      // Wait for the page to render, then show final step
      setTimeout(() => {
        this.startFinalStep();
      }, 500);
    });
  }

  /**
   * Show the final step - highlighting the help icon
   */
  private startFinalStep(): void {
    // Ensure sidebar is expanded before showing help icon
    this.ensureSidebarExpanded().then(() => {
      const steps = this.getFinalStep();

      this.driverInstance = driver({
        showProgress: true,
        animate: true,
        allowClose: false, // Force user to click "Done" to complete tour
        overlayColor: 'rgba(0, 0, 0, 0.7)',
        popoverClass: 'midas-tour-popover',
        steps,
        onDestroyStarted: () => {
          // Now mark tour as completed when they click "Done"
          this.markTourCompleted();
          this.isTourActive.set(false);
          this.driverInstance?.destroy();
        },
        onDestroyed: () => {
          this.isTourActive.set(false);
        }
      });

      // Wait for help icon to be ready (sidebar needs to be expanded)
      this.waitForElement('[data-tour="help-icon"]').then(() => {
        this.driverInstance?.drive();
      });
    });
  }

  /**
   * Ensure sidebar is expanded to show help icon
   */
  private ensureSidebarExpanded(): Promise<void> {
    return new Promise((resolve) => {
      const helpIcon = document.querySelector('[data-tour="help-icon"]');

      // If help icon is already visible, we're done
      if (helpIcon) {
        resolve();
        return;
      }

      // Otherwise, expand the sidebar
      const sidebarToggle = document.querySelector('[data-tour="sidebar-toggle"]') as HTMLElement;
      if (sidebarToggle) {
        sidebarToggle.click();
        // Wait for sidebar to expand
        setTimeout(() => resolve(), 300);
      } else {
        resolve();
      }
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
