import { Widget } from "../models/dashboard"
import { DapTableComponent } from "../pages/widgets/dap-table/dap-table.component"
import { DapComponent } from "../pages/widgets/dap/dap.component"
import { DmpTableComponent } from "../pages/widgets/dmp-table/dmp-table.component"
import { DmpComponent } from "../pages/widgets/dmp/dmp.component"
import { FilesTableComponent } from "../pages/widgets/files-table/files-table.component"
import { FilesComponent } from "../pages/widgets/files/files.component"
import { ReviewsTableComponent } from "../pages/widgets/reviews-table/reviews-table.component"
import { ReviewsComponent } from "../pages/widgets/reviews/reviews.component"


const WIDGET_DEFAULT_BG_COLOR = '#102C57';

export const WIDGET_REGISTRY: Widget[] = [
    { id: 1, label: 'DMP Stats', longLabel: 'DMPs', content: DmpComponent, rows: 1, columns: 1, backgroundColor: WIDGET_DEFAULT_BG_COLOR, textColor: 'whitesmoke' },
    { id: 2, label: 'DAP Stats', longLabel: 'DAPs', content: DapComponent, rows: 1, columns: 1, backgroundColor: WIDGET_DEFAULT_BG_COLOR, textColor: 'whitesmoke' },
    { id: 3, label: 'Reviews Stats', longLabel: 'Reviews', content: ReviewsComponent, rows: 1, columns: 1, backgroundColor: WIDGET_DEFAULT_BG_COLOR, textColor: 'whitesmoke' },
    { id: 4, label: 'Files Stats', longLabel: 'Files', content: FilesComponent, rows: 1, columns: 1, backgroundColor: WIDGET_DEFAULT_BG_COLOR, textColor: 'whitesmoke' },
    { id: 5, label: 'DMP Table', longLabel: 'Data Management Plans', content: DmpTableComponent, rows: 4, columns: 4, backgroundColor: 'var(--mat-table-background-color)', textColor: 'var(--mdc-theme-primary)' },
    { id: 6, label: 'DAP Table', longLabel: 'Data Asset Publications', content: DapTableComponent, rows: 4, columns: 4, backgroundColor: 'var(--mat-table-background-color)', textColor: 'var(--mdc-theme-primary)' },
    { id: 7, label: 'Reviews Table', longLabel: 'Reviews', content: ReviewsTableComponent, rows: 4, columns: 4, backgroundColor: 'var(--mat-table-background-color)', textColor: 'var(--mdc-theme-primary)' },
    { id: 8, label: 'Files Table', longLabel: 'Files', content: FilesTableComponent, rows: 4, columns: 4, backgroundColor: 'var(--mat-table-background-color)', textColor: 'var(--mdc-theme-primary)' },
]