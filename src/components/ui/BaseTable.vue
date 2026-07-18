<script setup lang="ts" generic="TRow extends Record<string, unknown>">
import PColumn from 'primevue/column';
import PDataTable from 'primevue/datatable';

export interface BaseTableColumn<TRow> {
  /** Constrained to TRow's own keys — a typo here is now a type error, not a silent blank column. */
  field: keyof TRow & string;
  header: string;
  sortable?: boolean;
  /** e.g. '120px' — omit for a flexible column. */
  width?: string;
}

withDefaults(
  defineProps<{
    columns: BaseTableColumn<TRow>[];
    rows: TRow[];
    loading?: boolean;
    rowKey?: string;
    emptyMessage?: string;
  }>(),
  { loading: false, rowKey: 'id', emptyMessage: 'No rows to show.' },
);
</script>

<template>
  <div class="base-table__scroll">
    <PDataTable :value="rows" :loading="loading" :data-key="rowKey" class="base-table">
      <template #empty>
        <p class="base-table__empty">{{ emptyMessage }}</p>
      </template>
      <PColumn
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :header="column.header"
        :sortable="column.sortable"
        :style="column.width ? { width: column.width } : undefined"
      >
        <template #body="slotProps">
          <slot :name="`cell-${column.field}`" :row="slotProps.data as TRow">
            {{ (slotProps.data as TRow)[column.field] }}
          </slot>
        </template>
      </PColumn>
    </PDataTable>
  </div>
</template>

<style scoped>
.base-table__scroll {
  overflow-x: auto;
}
.base-table :deep(.p-datatable-thead > tr > th) {
  background: transparent;
  color: var(--color-text-faint);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-color: var(--color-border);
  padding-block: var(--space-3);
}

.base-table :deep(.p-datatable-tbody > tr) {
  background: transparent;
  color: var(--color-text);
}

.base-table :deep(.p-datatable-tbody > tr > td) {
  border-color: var(--color-border);
  padding-block: var(--space-3);
}

.base-table__empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-5);
}
</style>
