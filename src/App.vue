<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue';

// The whole-network load (README §5/§4 — map + KPIs need every station's
// derived metrics) is no longer kicked off here unconditionally. It's
// triggered from each view that actually needs it (`DashboardView`,
// `SensorListView`) via the idempotent `networkStore.loadNetworkOverview()`,
// so a user landing directly on one route doesn't pay for data the other
// route needed — see `stores/network.ts`.
</script>

<template>
  <AppShell>
    <RouterView />
  </AppShell>
</template>
