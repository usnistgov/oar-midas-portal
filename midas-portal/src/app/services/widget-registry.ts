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
    // autoSpan keeps the four tables two-per-row whenever the responsive grid
    // can fit at least two columns; a fixed span only works in one width band.
    { id: 5, label: 'DMP Table', longLabel: 'My Data Management Plans', content: DmpTableComponent, rows: 3, columns: 3, autoSpan: true, backgroundColor: 'var(--mat-table-background-color)', textColor: 'var(--mdc-theme-primary)', isTable: true },
    { id: 6, label: 'DAP Table', longLabel: 'My Digital Asset Publications', content: DapTableComponent, rows: 3, columns: 3, autoSpan: true, backgroundColor: 'var(--mat-table-background-color)', textColor: 'var(--mdc-theme-primary)', isTable: true },
    { id: 7, label: 'Reviews Table', longLabel: 'Reviews', content: ReviewsTableComponent, rows: 3, columns: 3, autoSpan: true, backgroundColor: 'var(--mat-table-background-color)', textColor: 'var(--mdc-theme-primary)', isTable: true },
    { id: 8, label: 'Files Table', longLabel: 'Files', content: FilesTableComponent, rows: 3, columns: 3, autoSpan: true, backgroundColor: 'var(--mat-table-background-color)', textColor: 'var(--mdc-theme-primary)', isTable: true },
]

/** Columns a widget actually spans in a grid this wide. */
export function renderSpan(widget: Widget, colCount: number): number {
    if (!widget.autoSpan) return Math.max(1, Math.min(widget.columns ?? 1, colCount));

    // The dashboard exposes either one column or an even column count, so
    // this divides each row evenly between two auto-span table widgets.
    return Math.max(1, Math.floor(colCount / 2));
}
