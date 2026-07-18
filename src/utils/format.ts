const concentrationFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat('en-US');

/** e.g. `23.4 µg/m³` */
export function formatConcentration(value: number | null): string {
  if (value === null) return '—';
  return `${concentrationFormatter.format(value)} µg/m³`;
}

/** e.g. `23.4` — no unit, for compact contexts like table cells. */
export function formatConcentrationValue(value: number | null): string {
  if (value === null) return '—';
  return concentrationFormatter.format(value);
}

export function formatInteger(value: number): string {
  return integerFormatter.format(value);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatTime(isoTimestamp: string): string {
  return timeFormatter.format(new Date(isoTimestamp));
}

export function formatDateTime(isoTimestamp: string): string {
  return dateTimeFormatter.format(new Date(isoTimestamp));
}
