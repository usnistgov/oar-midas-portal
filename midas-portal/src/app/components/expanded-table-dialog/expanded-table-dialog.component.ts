import { Component, ViewChild, AfterViewInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataService } from '../../services/data.service';
import { Widget } from '../../models/dashboard';
import { getStatusClass } from '../../shared/table-utils';
import { CredentialsService } from '../../services/credentials.service';

interface ColumnDef {
  key: string;
  label: string;
}

// All columns for expanded view — includes compact + extra
const COLUMNS: Record<string, ColumnDef[]> = {
  DmpTableComponent: [
    { key: 'name',             label: 'Name' },
    { key: 'title',            label: 'Title' },
    { key: 'type',             label: 'Type' },
    { key: 'owner',            label: 'Owner' },
    { key: 'status',           label: 'Status' },
    { key: 'primaryContact',   label: 'Primary Contact' },
    { key: 'organizationUnit', label: 'Organization' },
    { key: 'keywords',         label: 'Keywords' },
    { key: 'dataCategories',   label: 'Data Categories' },
    { key: 'fundingType',      label: 'Funding Type' },
    { key: 'fundingNumber',    label: 'Funding Number' },
    { key: 'hasPublication',   label: 'Has Publication' },
    { key: 'startDate',        label: 'Start Date' },
    { key: 'createdDate',      label: 'Created' },
    { key: 'modifiedDate',     label: 'Last Modified' },
  ],
  DapTableComponent: [
    { key: 'name',             label: 'Name' },
    { key: 'title',            label: 'Title' },
    { key: 'type',             label: 'Type' },
    { key: 'owner',            label: 'Owner' },
    { key: 'status',           label: 'Status' },
    { key: 'primaryContact',   label: 'Primary Contact' },
    { key: 'authors',          label: 'Authors' },
    { key: 'organizationUnit', label: 'Organization' },
    { key: 'keywords',         label: 'Keywords' },
    { key: 'theme',            label: 'Domain Collection' },
    { key: 'dataCategories',   label: 'Data Categories' },
    { key: 'location',         label: 'Location' },
    { key: 'createdDate',      label: 'Created' },
    { key: 'modifiedDate',     label: 'Last Modified' },
  ],
  FilesTableComponent: [
    { key: 'name',         label: 'Name' },
    { key: 'usage',        label: 'Usage' },
    { key: 'fileCount',    label: 'File Count' },
    { key: 'location',     label: 'Location' },
    { key: 'modifiedDate', label: 'Last Modified' },
  ],
  ReviewsTableComponent: [
    { key: 'title',             label: 'Title' },
    { key: 'submitterName',     label: 'Submitted By' },
    { key: 'currentReviewer',   label: 'Current Reviewer' },
    { key: 'currentReviewStep', label: 'Review Step' },
  ],
};

@Component({
  selector: 'app-expanded-table-dialog',
  templateUrl: './expanded-table-dialog.component.html',
  styleUrls: ['./expanded-table-dialog.component.scss']
})
export class ExpandedTableDialogComponent implements AfterViewInit {

  widget: Widget = inject(MAT_DIALOG_DATA);
  private dataService = inject(DataService);
  private credsService = inject(CredentialsService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly componentName: string;
  columns: ColumnDef[] = [];
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>([]);

  constructor() {
    this.componentName = this.widget.content.name;
    this.columns = COLUMNS[this.componentName] ?? [];
    this.displayedColumns = this.columns.map(c => c.key);

    const dataFn: Record<string, () => any[]> = {
      DmpTableComponent:     () => this.dataService.dmps(),
      DapTableComponent:     () => this.dataService.daps(),
      FilesTableComponent:   () => this.dataService.files(),
      ReviewsTableComponent: () => this.dataService.reviews(),
    };
    this.dataSource.data = (dataFn[this.componentName] ?? (() => []))();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  linkto(row: any): string {
    const id = row.id;
    if (this.componentName === 'DmpTableComponent') {
      return this.dataService.resolveApiUrl('dmpEDIT') + id;
    }
    if (this.componentName === 'ReviewsTableComponent') {
      const userId = this.credsService.userId?.() || this.credsService.userId || '';
      return this.dataService.resolveApiUrl('NPSAPI') + userId + 'Dataset/DataSetDetails?id=' + id;
    }
    return this.dataService.resolveApiUrl('dapEDIT') + id + '?editEnabled=true';
  }

  get hasLinks(): boolean {
    return true;
  }

  get createUrl(): string | null {
    switch (this.componentName) {
      case 'DmpTableComponent': return this.dataService.dmpUI;
      case 'DapTableComponent': return this.dataService.dapUI;
      default: return null;
    }
  }

  get createLabel(): string {
    switch (this.componentName) {
      case 'DmpTableComponent': return 'Create DMP';
      case 'DapTableComponent': return 'Create DAP';
      default: return 'Create';
    }
  }

  openCreate() {
    if (this.createUrl) window.open(this.createUrl, '_blank');
  }

  getStatusClass(status: string): string {
    return getStatusClass(status);
  }

  applyFilter(event: Event) {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  clearFilter(input: HTMLInputElement) {
    input.value = '';
    this.dataSource.filter = '';
    input.focus();
  }
}
