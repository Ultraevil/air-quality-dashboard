import { render } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';

import Sparkline from '@/components/ui/Sparkline.vue';

describe('Sparkline', () => {
  it('renders nothing (no svg) with fewer than two values', () => {
    const { container: none } = render(Sparkline, { props: { values: [] } });
    expect(none.querySelector('svg')).not.toBeInTheDocument();

    const { container: one } = render(Sparkline, { props: { values: [42] } });
    expect(one.querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders an svg with a polyline when given two or more values', () => {
    const { container } = render(Sparkline, { props: { values: [10, 20] } });
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('polyline')).toBeInTheDocument();
  });

  it('plots the correct number of points for the given series', () => {
    const { container } = render(Sparkline, { props: { values: [1, 5, 3, 8, 2] } });
    const polyline = container.querySelector('polyline')!;
    const points = polyline.getAttribute('points')!.trim().split(' ');
    expect(points).toHaveLength(5);
  });

  it('spans the full requested width and height in its viewBox', () => {
    const { container } = render(Sparkline, { props: { values: [1, 2, 3], width: 120, height: 40 } });
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('120');
    expect(svg.getAttribute('height')).toBe('40');
    expect(svg.getAttribute('viewBox')).toBe('0 0 120 40');
  });

  it('places the minimum value at the bottom and the maximum at the top of the plot', () => {
    const { container } = render(Sparkline, { props: { values: [0, 10], height: 28 } });
    const polyline = container.querySelector('polyline')!;
    const points = polyline.getAttribute('points')!.trim().split(' ');
    const [, minY] = points[0]!.split(',').map(Number); // value 0 -> bottom
    const [, maxY] = points[1]!.split(',').map(Number); // value 10 -> top

    expect(minY).toBe(28);
    expect(maxY).toBe(0);
  });

  it('does not divide by zero when every value is identical (flat line)', () => {
    const { container } = render(Sparkline, { props: { values: [5, 5, 5], height: 28 } });
    const polyline = container.querySelector('polyline')!;
    const points = polyline.getAttribute('points')!.trim().split(' ');

    for (const point of points) {
      const [, y] = point.split(',').map(Number);
      expect(Number.isFinite(y)).toBe(true);
    }
  });

  it('marks the accessible last-value dot at the final point', () => {
    const { container } = render(Sparkline, { props: { values: [1, 2, 9], width: 96 } });
    const circle = container.querySelector('circle')!;
    const polyline = container.querySelector('polyline')!;
    const lastPoint = polyline.getAttribute('points')!.trim().split(' ').at(-1);

    const [x, y] = lastPoint!.split(',').map(Number);
    expect(Number(circle.getAttribute('cx'))).toBeCloseTo(x!);
    expect(Number(circle.getAttribute('cy'))).toBeCloseTo(y!);
  });

  it('is decorative and hidden from assistive tech (accompanying text conveys the value)', () => {
    const { container } = render(Sparkline, { props: { values: [1, 2, 3] } });
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
