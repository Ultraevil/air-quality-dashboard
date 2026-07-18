<script setup lang="ts">
import { storeToRefs } from 'pinia';

import BaseButton from '@/components/ui/BaseButton.vue';
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);
</script>

<template>
  <BaseButton
    variant="ghost"
    class="theme-toggle"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    @click="themeStore.toggle()"
  >
    <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'" aria-hidden="true" />
  </BaseButton>
</template>

<style scoped>
.theme-toggle {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
}
</style>
