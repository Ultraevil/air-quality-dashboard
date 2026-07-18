<script setup lang="ts">
import AppTopBar from './AppTopBar.vue';
</script>

<template>
  <div class="app-shell">
    <AppTopBar />
    <main class="app-shell__content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-shell__content {
  flex: 1;
  padding: var(--space-2) var(--space-5) var(--space-6);
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
</style>
