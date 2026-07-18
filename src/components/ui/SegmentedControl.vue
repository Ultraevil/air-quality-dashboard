<script setup lang="ts" generic="TValue extends string">
export interface SegmentedControlOption<TValue> {
  value: TValue;
  label: string;
}

defineProps<{
  modelValue: TValue;
  options: SegmentedControlOption<TValue>[];
  ariaLabel: string;
}>();
defineEmits<{ 'update:modelValue': [TValue] }>();
</script>

<template>
  <div class="segmented-control" role="radiogroup" :aria-label="ariaLabel">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="modelValue === option.value"
      class="segmented-control__option"
      :class="{ 'segmented-control__option--active': modelValue === option.value }"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.segmented-control {
  display: inline-flex;
  background: var(--color-surface-sunken);
  border-radius: 999px;
  padding: 3px;
  gap: 2px;
}

.segmented-control__option {
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 999px;
  cursor: pointer;
}

.segmented-control__option:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

.segmented-control__option--active {
  background: var(--color-surface-raised);
  color: var(--color-text);
  box-shadow: var(--shadow-card);
}
</style>
