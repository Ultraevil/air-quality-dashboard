<script setup lang="ts">
import PButton from 'primevue/button';

withDefaults(
  defineProps<{
    label?: string;
    icon?: string;
    iconPos?: 'left' | 'right';
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'small' | 'normal';
    disabled?: boolean;
    ariaLabel?: string;
  }>(),
  {
    label: undefined,
    icon: undefined,
    iconPos: 'left',
    variant: 'secondary',
    size: 'normal',
    disabled: false,
    ariaLabel: undefined,
  },
);

defineEmits<{ click: [MouseEvent] }>();

const SEVERITY_BY_VARIANT = {
  primary: undefined,
  secondary: 'secondary',
  ghost: 'secondary',
} as const;
</script>

<template>
  <PButton
    :label="label"
    :icon="icon"
    :icon-pos="iconPos"
    :severity="SEVERITY_BY_VARIANT[variant]"
    :text="variant === 'ghost'"
    :size="size === 'small' ? 'small' : undefined"
    :disabled="disabled"
    :aria-label="ariaLabel"
    class="base-button"
    :class="`base-button--${variant}`"
    @click="$emit('click', $event)"
  >
    <template v-if="$slots.default" #default>
      <slot />
    </template>
  </PButton>
</template>

<style scoped>
.base-button {
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.base-button--ghost {
  color: var(--color-text-muted);
}
</style>
