import { Component, input, signal, AfterViewInit, ElementRef, inject } from '@angular/core';
import { Widget } from '../../models/dashboard';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrl: './widget.component.scss',
  host: {
    '[style.grid-area]' : '"span " + (data().rows ?? 1) + "/ span " + (data().columns ?? 1)'
  },
})
export class WidgetComponent implements AfterViewInit {

  data = input.required<Widget>();
  showOptions = signal(false);
  
  private elementRef = inject(ElementRef);
  readonly isDragDisabled = signal(false);

  ngAfterViewInit() {
    setTimeout(() => {
      this.setupTextSelectionHandling();
    }, 500);
  }

  getWidgetInputs() {
    const widget = this.data();
    const componentName = widget.content.name;
    
    const tableComponents = [
      'DmpTableComponent', 
      'DapTableComponent', 
      'FilesTableComponent', 
      'ReviewsTableComponent'
    ];
    
    if (tableComponents.includes(componentName)) {
      return { widget: widget };
    }
    
    return {};
  }

  private setupTextSelectionHandling() {
    const element = this.elementRef.nativeElement;
    const widgetContent = element.querySelector('.widget-content');
    
    if (!widgetContent) {
      return;
    }

    element.addEventListener('mousedown', (event: MouseEvent) => {
      const target = event.target as Element;
      
      if (this.shouldDisableDrag(target)) {
        this.isDragDisabled.set(true);
        event.stopPropagation();
        event.stopImmediatePropagation();
      } else {
        this.isDragDisabled.set(false);
      }
    }, true);

    element.addEventListener('selectstart', (event: Event) => {
      this.isDragDisabled.set(true);
    });

    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString() || '';
      
      if (selectedText.length === 0) {
        setTimeout(() => {
          const activeElement = document.activeElement;
          if (!activeElement || !this.isInputElement(activeElement)) {
            this.isDragDisabled.set(false);
          }
        }, 100);
      }
    });

    element.addEventListener('focusin', (event: FocusEvent) => {
      const target = event.target as Element;
      if (this.isInputElement(target)) {
        this.isDragDisabled.set(true);
      }
    });

    element.addEventListener('focusout', (event: FocusEvent) => {
      const target = event.target as Element;
      if (this.isInputElement(target)) {
        setTimeout(() => {
          const selection = window.getSelection();
          const activeElement = document.activeElement;
          
          if ((!selection || selection.toString().length === 0) && 
              (!activeElement || !this.isInputElement(activeElement))) {
            this.isDragDisabled.set(false);
          }
        }, 100);
      }
    });
  }

  private shouldDisableDrag(element: Element): boolean {
    const isInContent = element.closest('.widget-content') !== null;
    if (!isInContent) return false;

    const disableDragSelectors = [
      'input', 'textarea', 'select',
      '.mat-form-field', '.mat-mdc-form-field', '.mat-input-element',
      'button', '[role="button"]'
    ];
    
    const isDirectInteractive = disableDragSelectors.some(selector => {
      try {
        return element.matches(selector);
      } catch (e) {
        return false;
      }
    });

    const isInTableWrapper = element.closest('.table-wrapper') !== null;
    const isInTableControls = element.closest('.table-controls') !== null;
    
    return isDirectInteractive || isInTableWrapper || isInTableControls;
  }

  private isInputElement(element: Element): boolean {
    const inputTags = ['input', 'textarea', 'select'];
    const inputClasses = ['.mat-form-field', '.mat-mdc-form-field', '.mat-input-element'];
    
    return inputTags.includes(element.tagName.toLowerCase()) ||
           inputClasses.some(cls => element.matches(cls) || element.closest(cls) !== null);
  }

  get dragDisabled(): boolean {
    return this.isDragDisabled();
  }
}