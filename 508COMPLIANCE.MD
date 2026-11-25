# 508 COMPLIANCE

Section 508, which aligns with WCAG 2.1 Level AA, sets the legal standard for the needed - Contrast level between text and its - Background. The baseline AA - Contrast standard is 4.5:1 for most text and 3:1 for large text (19px+ bold or 24px+ normal text).

### Table header
#### Title
-  Foreground Color : #005EA2
-  Background Color : #EFF6FB
-  Contrast Ratio: 6.2:1

#### Icon
- Foreground Color : #495057
- Background Color : #EFF6FB
- Contrast Ratio: 7.5:1


### Row header 
- Foreground Color : #495057
- Background Color : #F8F9FA
- Contrast Ratio: 7.8:1

### Rows
#### Clickable links
Resolve from `--portal-accent-text`; see Accent text below.


#### Others 
- Foreground Color : #495057
- Background Color : #FFFFFF
- Contrast Ratio: 8.2:1

### Paginator
#### text and arrows
- Foreground Color : #6C757D
- Background Color : #FFFFFF
- Contrast Ratio: 8.2:1

#### activated
- Foreground Color : #495057
- Background Color : #E3F2FD
- Contrast Ratio: 7.2:1


### Dashboard widgets
The widget sets its own background inline (`WIDGET_DEFAULT_BG_COLOR`), so both
pairs are measured against that, not against the page.

#### Sub-text
- Foreground Color : #CCCCCC
- Background Color : #102C57
- Contrast Ratio: 8.6:1

#### Highlighted count
- Foreground Color : #EF9A9A
- Background Color : #102C57
- Contrast Ratio: 6.4:1

### Notifications
#### Snackbar text
- Foreground Color : #FFFFFF
- Background Color : #1565C0
- Contrast Ratio: 5.8:1

### System status icons
The glyph differs per status (check, schedule, warning), so colour is not the only
signal. These are non-text content, needing 3:1, but are set well past it.

#### All OK
- Foreground Color : #2E7D32
- Background Color : #FFFFFF
- Contrast Ratio: 5.1:1

#### Maintenance scheduled
- Foreground Color : #A35200
- Background Color : #FFFFFF
- Contrast Ratio: 5.6:1

#### Under maintenance
- Foreground Color : #C62828
- Background Color : #FFFFFF
- Contrast Ratio: 5.6:1

### Column drag handle
Uses `--portal-muted-text`; see Muted text below.

### Sidebar
#### Header
- Foreground Color : #EFF6FB
- Background Color : #005EA2
- Contrast Ratio: 6.2:1

#### Rows
- Foreground Color : #005EA2
- Background Color : #EFF6FB
- Contrast Ratio: 6.2:1

## Themed tokens

Values that change with the theme or the mode are recorded as tokens rather than
as single colours. Light ratios are against `#fff`, dark against the Material
dark surface `#424242`.

### Accent text
`--portal-accent-text`. Table links and dialog titles. A theme's primary is
chosen to work as a surface, not as text, so each theme names a shade of its own
hue that clears 4.5:1 instead.

| theme | light | | dark | |
|---|---|---|---|---|
| default | #1565C0 | 5.75:1 | #90CAF9 | 5.74:1 |
| 1 | #3F51B5 | 6.87:1 | #C5CAE9 | 6.22:1 |
| 2 | #006064 | 7.35:1 | #4DD0E1 | 5.47:1 |
| 3 | #00695C | 6.61:1 | #80CBC4 | 5.39:1 |
| 4 | #673AB7 | 7.33:1 | #D1C4E9 | 6.12:1 |

### Muted text
`--portal-muted-text`. Column drag handle, separator bullets.

| light | | dark | |
|---|---|---|---|
| #5F6368 | 6.05:1 | #BDBDBD | 5.35:1 |

### System status
`--portal-status-ok` / `-warn` / `-err`. Maintenance banner and the sidebar
icons that mirror it. Each status also carries its own glyph, so colour is never
the only signal.

| status | light | | dark | |
|---|---|---|---|---|
| All OK | #2E7D32 | 5.13:1 | #81C784 | 4.99:1 |
| Maintenance scheduled | #A35200 | 5.58:1 | #FFB74D | 5.81:1 |
| Under maintenance | #C62828 | 5.62:1 | #EF9A9A | 4.67:1 |

## Record status badges

One badge per record row, on the search page, Share My Records, the expanded
table dialog and the dashboard widget tables. White text except on amber, where
no light text passes. The grey and the red arrived with the record-states work,
which left them to be recorded here.

| state | class | background | text | ratio |
|---|---|---|---|---|
| published | `.status-success` | #2E7D32 | #FFF | 5.13:1 |
| edit, ready | `.status-warning` | #FFB300 | #000 | 11.70:1 |
| processing, submitted, accepted, in press | `.status-neutral` | #616161 | #FFF | 6.19:1 |
| unwell | `.status-attention` | #C62828 | #FFF | 5.62:1 |

## Not re-measured

The entries above the themed tokens predate this work and were not re-verified
against the current stylesheets; several name colours that no longer appear in
`src/`. They are kept so the history is not lost, and should be re-measured or
removed when the pages they describe are next worked on.
