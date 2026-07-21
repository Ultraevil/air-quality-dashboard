import { screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';

import ConnectionBadge from '@/components/ui/ConnectionBadge.vue';
import { renderWithPrimeVue } from '../../test-utils';

describe('ConnectionBadge', () => {
  it('renders the offline label with no stability percentage, even if one is passed', () => {
    renderWithPrimeVue(ConnectionBadge, { props: { state: 'offline', stabilityPct: 40 } });
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('renders the HQ link label with its stability percentage', () => {
    renderWithPrimeVue(ConnectionBadge, { props: { state: 'hq', stabilityPct: 97.6 } });
    expect(screen.getByText('HQ link 98%')).toBeInTheDocument();
  });

  it('renders the poor link label with its stability percentage', () => {
    renderWithPrimeVue(ConnectionBadge, { props: { state: 'poor', stabilityPct: 42 } });
    expect(screen.getByText('Poor link 42%')).toBeInTheDocument();
  });

  it('omits the percentage entirely when stabilityPct is not provided', () => {
    renderWithPrimeVue(ConnectionBadge, { props: { state: 'hq' } });
    expect(screen.getByText('HQ link')).toBeInTheDocument();
  });

  it('renders as a dot-style badge, not a filled pill', () => {
    const { container } = renderWithPrimeVue(ConnectionBadge, { props: { state: 'hq', stabilityPct: 100 } });
    expect(container.querySelector('.base-badge--dot')).toBeInTheDocument();
  });
});
