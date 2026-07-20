<script setup lang="ts" generic="TValue extends string">
import { nextTick, ref } from 'vue';

export interface SegmentedControlOption<TValue> {
  value: TValue;
  label: string;
}

const props = defineProps<{
  modelValue: TValue;
  options: SegmentedControlOption<TValue>[];
  ariaLabel: string;
}>();
const emit = defineEmits<{ 'update:modelValue': [TValue] }>();

const optionRefs = ref<(HTMLButtonElement | null)[]>([]);

function setOptionRef(el: Element | null, index: number): void {
  optionRefs.value[index] = el as HTMLButtonElement | null;
}

function currentIndex(): number {
  const index = props.options.findIndex((option) => option.value === props.modelValue);
  return index === -1 ? 0 : index;
}

function selectIndex(index: number): void {
  const option = props.options[index];
  if (option) emit('update:modelValue', option.value);
}

async function focusIndex(index: number): Promise<void> {
  await nextTick();
  optionRefs.value[index]?.focus();
}

function moveSelection(offset: number): void {
  const count = props.options.length;
  if (count === 0) return;
  const next = (currentIndex() + offset + count) % count;
  selectIndex(next);
  void focusIndex(next);
}

function handleKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      moveSelection(1);
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      moveSelection(-1);
      break;
    case 'Home':
      event.preventDefault();
      selectIndex(0);
      void focusIndex(0);
      break;
    case 'End':
      event.preventDefault();
      selectIndex(props.options.length - 1);
      void focusIndex(props.options.length - 1);
      break;
  }
}
</script>

<template>
  <div class="segmented-control" role="radiogroup" :aria-label="ariaLabel" @keydown="handleKeydown">
    <button
      v-for="(option, index) in options"
      :key="option.value"
      :ref="(el) => setOptionRef(el as Element | null, index)"
      type="button"
      role="radio"
      :aria-checked="modelValue === option.value"
      :tabindex="modelValue === option.value ? 0 : -1"
      class="segmented-control__option"
      :class="{ 'segmented-control__option--active': modelValue === option.value }"
      @click="selectIndex(index)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.segmented-control {
  display: inline-flex;
  background: var(--color-surface-sunken);
  border-radius: 12px;
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
  border-radius: 12px;
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
