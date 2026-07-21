import { screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';

import AqiBadge from '@/components/ui/AqiBadge.vue';
import { AQI_LABELS } from '@/utils/aqi';
import { renderWithPrimeVue } from '../../test-utils';

describe('AqiBadge', () => {
  it.each(['good', 'moderate', 'elevated', 'unhealthy'] as const)(
    'renders the human-readable label for AQI level "%s"',
    (level) => {
      renderWithPrimeVue(AqiBadge, { props: { level } });
      expect(screen.getByText(AQI_LABELS[level])).toBeInTheDocument();
    },
  );

  it('renders an em dash when there is no AQI level (no reading yet)', () => {
    renderWithPrimeVue(AqiBadge, { props: { level: null } });
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
