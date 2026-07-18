<script setup lang="ts">
import PInputText from 'primevue/inputtext';

withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    ariaLabel?: string;
  }>(),
  { placeholder: undefined, ariaLabel: undefined },
);

defineEmits<{ 'update:modelValue': [string] }>();
</script>

<template>
  <PInputText
    :model-value="modelValue"
    :placeholder="placeholder"
    :aria-label="ariaLabel"
    class="base-input"
    @update:model-value="(value) => $emit('update:modelValue', value ?? '')"
  />
</template>

<style scoped>
.base-input {
  width: 100%;
  border-radius: var(--radius-sm);
  background: var(--color-surface-raised);
  border-color: var(--color-border);
  color: var(--color-text);
}
</style>
