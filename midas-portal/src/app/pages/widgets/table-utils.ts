/**
 * Calculates the maximum number of visible table rows in a widget
 * for any number of grid rows, using measured values and interpolation.
 */
export function getMaxVisibleRows(widgetRows: number): number {
  const tableRowHeight = 40; // px

  // Measured available heights for specific row counts
  const availableHeights: Record<number, number> = {
    3: 223,
    4: 353.76,
    5: 489.756
  };

  // If measured, use directly
  if (availableHeights[widgetRows]) {
    return Math.floor(availableHeights[widgetRows] / tableRowHeight);
  }

  // Otherwise, estimate using linear interpolation between measured points
  // Slope between 3 and 5 rows:
  const slope = (availableHeights[5] - availableHeights[3]) / (5 - 3); // ≈ 133.378 per row
  // Intercept for 3 rows: availableHeights[3] - slope * 3
  const intercept = availableHeights[3] - slope * 3;

  // Estimate available height
  const estimatedHeight = slope * widgetRows + intercept;

  return Math.floor(estimatedHeight / tableRowHeight);
}