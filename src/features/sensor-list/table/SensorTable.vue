<script setup lang="ts">
import { computed } from 'vue';

import AqiBadge from '@/components/ui/AqiBadge.vue';
import BaseTable, { type BaseTableColumn } from '@/components/ui/BaseTable.vue';
import ConnectionBadge from '@/components/ui/ConnectionBadge.vue';
import type { AqiLevel, ConnectionState, StationWithMetrics } from '@/types/station';
import { formatConcentrationValue } from '@/utils/format';

const props = defineProps<{
  rows: StationWithMetrics[];
  loading: boolean;
  searchQuery: string;
}>();

/** The flat shape BaseTable actually renders — one field per column, by design. */
interface SensorTableRow {
  id: string;
  district: string;
  location: string;
  pm25: number | null;
  pm10: number | null;
  aqi: AqiLevel | null;
  connection: ConnectionState;
  stabilityPct: number;
}

// `field: keyof SensorTableRow` means a typo'd column (e.g. `pm2_5`) is now a
// compile error instead of a silently-blank column.
const columns: BaseTableColumn<SensorTableRow>[] = [
  { field: 'id', header: 'ID', sortable: true, width: '110px' },
  { field: 'district', header: 'District', sortable: true },
  { field: 'location', header: 'Neighborhood', sortable: true },
  { field: 'pm25', header: 'PM2.5', sortable: true, width: '90px' },
  { field: 'pm10', header: 'PM10', sortable: true, width: '90px' },
  { field: 'aqi', header: 'AQI', sortable: true, width: '120px' },
  { field: 'connection', header: 'Connection', width: '140px' },
];

// The mock API has no server-side search (README §Data lists no `q` param),
// so this filters the *currently loaded page* only — see NOTES.md for the
// trade-off.
const filteredRows = computed<SensorTableRow[]>(() => {
  const q = props.searchQuery.trim().toLowerCase();
  const source = q
    ? props.rows.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q),
      )
    : props.rows;

  return source.map((r) => ({
    id: r.id,
    district: r.district,
    location: r.location,
    pm25: r.metrics.pm25,
    pm10: r.metrics.pm10,
    aqi: r.metrics.aqi,
    connection: r.metrics.connection,
    stabilityPct: r.metrics.stabilityPct,
  }));
});
</script>

<template>
  <BaseTable
    :columns="columns"
    :rows="filteredRows"
    :loading="loading"
    empty-message="No stations match your search."
  >
    <template #cell-id="{ row }">
      <span class="numeric" style="font-family: var(--font-mono); font-weight: 600">{{ row.id }}</span>
    </template>
    <template #cell-pm25="{ row }">
      <span class="numeric">{{ formatConcentrationValue(row.pm25) }}</span>
    </template>
    <template #cell-pm10="{ row }">
      <span class="numeric">{{ formatConcentrationValue(row.pm10) }}</span>
    </template>
    <template #cell-aqi="{ row }">
      <AqiBadge :level="row.aqi" />
    </template>
    <template #cell-connection="{ row }">
      <ConnectionBadge :state="row.connection" :stability-pct="row.stabilityPct" />
    </template>
  </BaseTable>
</template>
