import { fireEvent, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import BaseButton from '@/components/ui/BaseButton.vue';
import { renderWithPrimeVue } from '../../test-utils';

describe('BaseButton', () => {
  it('renders its label prop as accessible text', () => {
    renderWithPrimeVue(BaseButton, { props: { label: 'Retry' } });
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('renders slotted content when given, instead of the label prop', () => {
    renderWithPrimeVue(BaseButton, { slots: { default: 'Custom content' } });
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('emits click when clicked', async () => {
    const { emitted } = renderWithPrimeVue(BaseButton, { props: { label: 'Save' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(emitted().click).toHaveLength(1);
  });

  it('does not emit click when disabled', async () => {
    const user = userEvent.setup();
    const { emitted } = renderWithPrimeVue(BaseButton, {
      props: { label: 'Save', disabled: true },
    });
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(emitted().click).toBeUndefined();
  });

  it('applies the disabled attribute to the underlying button', () => {
    renderWithPrimeVue(BaseButton, { props: { label: 'Save', disabled: true } });
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('uses ariaLabel for accessible name when there is no visible label (icon-only button)', () => {
    renderWithPrimeVue(BaseButton, { props: { icon: 'pi pi-times', ariaLabel: 'Close' } });
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it.each(['primary', 'secondary', 'ghost'] as const)(
    'renders without throwing for the "%s" variant',
    (variant) => {
      renderWithPrimeVue(BaseButton, { props: { label: 'Go', variant } });
      expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
    },
  );
});
