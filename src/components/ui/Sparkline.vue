<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    values: number[];
    width?: number;
    height?: number;
    tone?: string;
  }>(),
  { width: 96, height: 28, tone: 'var(--color-accent)' },
);

const points = computed(() => {
  if (props.values.length < 2) return '';
  const min = Math.min(...props.values);
  const max = Math.max(...props.values);
  const range = max - min || 1;
  const stepX = props.width / (props.values.length - 1);

  return props.values
    .map((value, index) => {
      const x = index * stepX;
      const y = props.height - ((value - min) / range) * props.height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
});

const areaPoints = computed(() => {
  if (!points.value) return '';

  return [
    `0,${props.height}`,
    points.value,
    `${props.width},${props.height}`,
  ].join(' ');
});

const lastPoint = computed(() => {
  if (!points.value) return null;

  const allPoints = points.value.split(' ');
  const last = allPoints[allPoints.length - 1];

  if (!last) return null;

  const [x, y] = last.split(',').map(Number);

  return { x, y };
});

const gradientId = `spark-gradient-${Math.random().toString(36).slice(2)}`;
</script>

<template>
  <svg
      v-if="points"
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      class="sparkline"
      role="img"
      aria-hidden="true"
  >
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="tone" stop-opacity="0.28" />
        <stop offset="100%" :stop-color="tone" stop-opacity="0" />
      </linearGradient>
    </defs>

    <polygon
        :points="areaPoints"
        :fill="`url(#${gradientId})`"
    />

    <polyline
        :points="points"
        fill="none"
        :stroke="tone"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
    />

    <circle
        v-if="lastPoint"
        :cx="lastPoint.x"
        :cy="lastPoint.y"
        r="2.5"
        :fill="tone"
    />
  </svg>
</template>

<style scoped>
.sparkline {
  display: block;
  overflow: visible;
}
</style>