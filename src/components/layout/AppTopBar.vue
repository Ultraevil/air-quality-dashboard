<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/sensors', label: 'Sensor List' },
];
</script>

<template>
  <header class="top-bar">
    <div class="top-bar__brand">Aerolit</div>

    <nav class="top-bar__nav" aria-label="Primary">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="top-bar__nav-link"
        active-class="top-bar__nav-link--active"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <ThemeToggle />
  </header>
</template>

<style scoped>
.top-bar {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-3) var(--space-5);
}

.top-bar__brand {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.01em;
}

.top-bar__nav {
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 3px;
  margin-right: auto;
}

.top-bar__nav-link {
  padding: 7px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.top-bar__nav-link:hover {
  color: var(--color-text);
}

.top-bar__nav-link--active {
  background: var(--color-surface-raised);
  color: var(--color-text);
  box-shadow: var(--shadow-card);
}
</style>
