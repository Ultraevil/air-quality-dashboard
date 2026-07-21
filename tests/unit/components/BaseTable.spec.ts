import { screen, within } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';

import BaseTable, { type BaseTableColumn } from '@/components/ui/BaseTable.vue';
import { renderWithPrimeVue } from '../../test-utils';

interface Row {
  id: string;
  name: string;
  pm25: number;
}

const COLUMNS: BaseTableColumn<Row>[] = [
  { field: 'name', header: 'Station' },
  { field: 'pm25', header: 'PM2.5' },
];

const ROWS: Row[] = [
  { id: 'ST-001', name: 'Alexanderplatz', pm25: 12 },
  { id: 'ST-002', name: 'Tempelhof', pm25: 34 },
];

/**
 * `BaseTable` is generic over its row type via `<script setup generic="TRow">`,
 * which Vue Test Utils / Testing Library can't instantiate directly (they see
 * the compiled, non-generic component type). Wrapping it in a thin typed
 * host component gives us type-checked props (and typed scoped-slot access)
 * while still testing the real rendered `BaseTable`.
 */
function renderBaseTable(
  props: { columns: BaseTableColumn<Row>[]; rows: Row[]; emptyMessage?: string },
  cellPm25?: (row: Row) => ReturnType<typeof h>,
) {
  const Host = defineComponent({
    setup() {
      return () =>
        h(
          BaseTable<Row>,
          props,
          cellPm25 ? { [`cell-pm25`]: ({ row }: { row: Row }) => cellPm25(row) } : undefined,
        );
    },
  });
  return renderWithPrimeVue(Host);
}

describe('BaseTable', () => {
  it('renders a header cell for every configured column', () => {
    renderBaseTable({ columns: COLUMNS, rows: ROWS });
    expect(screen.getByRole('columnheader', { name: 'Station' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'PM2.5' })).toBeInTheDocument();
  });

  it('renders one row per data item with the field values as cell text', () => {
    renderBaseTable({ columns: COLUMNS, rows: ROWS });
    expect(screen.getByText('Alexanderplatz')).toBeInTheDocument();
    expect(screen.getByText('Tempelhof')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('34')).toBeInTheDocument();
  });

  it('renders the empty-state message when there are no rows', () => {
    renderBaseTable({ columns: COLUMNS, rows: [], emptyMessage: 'No stations match your search.' });
    expect(screen.getByText('No stations match your search.')).toBeInTheDocument();
  });

  it('falls back to a default empty message when none is given', () => {
    renderBaseTable({ columns: COLUMNS, rows: [] });
    expect(screen.getByText('No rows to show.')).toBeInTheDocument();
  });

  it('renders a custom cell slot instead of the raw field value when provided', () => {
    renderBaseTable({ columns: COLUMNS, rows: ROWS }, (row) => h('strong', `${row.pm25} µg/m³`));
    expect(screen.getByText('12 µg/m³')).toBeInTheDocument();
    expect(screen.getByText('34 µg/m³')).toBeInTheDocument();
  });

  it('exposes rows as an accessible grid structure (thead/tbody rows)', () => {
    renderBaseTable({ columns: COLUMNS, rows: ROWS });
    const table = screen.getByRole('table');
    const bodyRows = within(table).getAllByRole('row');
    // 1 header row + 2 data rows
    expect(bodyRows).toHaveLength(3);
  });
});
