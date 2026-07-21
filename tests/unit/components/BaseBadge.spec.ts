import { screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';

import BaseBadge from '@/components/ui/BaseBadge.vue';
import { renderWithPrimeVue } from '../../test-utils';

describe('BaseBadge', () => {
  it('renders its slot content', () => {
    renderWithPrimeVue(BaseBadge, { slots: { default: 'Moderate' } });
    expect(screen.getByText('Moderate')).toBeInTheDocument();
  });

  it('renders as a pill by default (not a dot)', () => {
    const { container } = renderWithPrimeVue(BaseBadge, { slots: { default: 'Good' } });
    expect(container.querySelector('.base-badge--dot')).not.toBeInTheDocument();
  });

  it('renders a coloured dot marker when dot is true', () => {
    const { container } = renderWithPrimeVue(BaseBadge, {
      props: { dot: true },
      slots: { default: 'HQ link' },
    });
    expect(container.querySelector('.base-badge--dot')).toBeInTheDocument();
    expect(container.querySelector('.base-badge__dot')).toBeInTheDocument();
  });

  it('hides the decorative dot from assistive tech', () => {
    const { container } = renderWithPrimeVue(BaseBadge, {
      props: { dot: true },
      slots: { default: 'HQ link' },
    });
    expect(container.querySelector('.base-badge__dot')).toHaveAttribute('aria-hidden', 'true');
  });

  it('defaults to a neutral tone when none is given', () => {
    renderWithPrimeVue(BaseBadge, { slots: { default: 'Label' } });
    expect(screen.getByText('Label')).toBeInTheDocument();
  });
});
