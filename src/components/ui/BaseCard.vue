<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Removes the default padding, for cards that manage their own inner layout (e.g. the map). */
    noPadding?: boolean;
  }>(),
  { noPadding: false },
);
</script>

<template>
  <section class="base-card" :class="{ 'base-card--no-padding': noPadding }">
    <header v-if="$slots.header" class="base-card__header">
      <slot name="header" />
    </header>
    <div class="base-card__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.base-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.base-card__header {
  padding: var(--space-4) var(--space-5) 0;
}

.base-card__body {
  padding: var(--space-5);
}

.base-card--no-padding .base-card__body {
  padding: 0;
}
</style>
