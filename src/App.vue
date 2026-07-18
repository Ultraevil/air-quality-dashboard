<script setup lang="ts">
import { onMounted } from 'vue';

import AppShell from '@/components/layout/AppShell.vue';
import { useNetworkStore } from '@/stores/network';

// Kick off the whole-network load once, as early as possible, regardless of
// which page the user lands on first — see `stores/network.ts`.
const networkStore = useNetworkStore();
onMounted(() => {
  void networkStore.loadNetworkOverview();
});
</script>

<template>
  <AppShell>
    <RouterView />
  </AppShell>
</template>
