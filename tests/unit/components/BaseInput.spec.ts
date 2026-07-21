import { fireEvent, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';

import BaseInput from '@/components/ui/BaseInput.vue';
import { renderWithPrimeVue } from '../../test-utils';

describe('BaseInput', () => {
  it('renders the modelValue as the input value', () => {
    renderWithPrimeVue(BaseInput, { props: { modelValue: 'Alexanderplatz' } });
    expect(screen.getByRole('textbox')).toHaveValue('Alexanderplatz');
  });

  it('renders the placeholder when given', () => {
    renderWithPrimeVue(BaseInput, { props: { modelValue: '', placeholder: 'Search…' } });
    expect(screen.getByPlaceholderText('Search…')).toBeInTheDocument();
  });

  it('exposes an accessible name via ariaLabel', () => {
    renderWithPrimeVue(BaseInput, { props: { modelValue: '', ariaLabel: 'Sensor ID' } });
    expect(screen.getByRole('textbox', { name: 'Sensor ID' })).toBeInTheDocument();
  });

  it('emits update:modelValue with the new text when the user types', async () => {
    const { emitted } = renderWithPrimeVue(BaseInput, { props: { modelValue: '' } });
    const input = screen.getByRole('textbox');

    await fireEvent.update(input, 'Mitte');

    const updates = emitted()['update:modelValue'];
    expect(updates).toBeTruthy();
    expect(updates![updates!.length - 1]).toEqual(['Mitte']);
  });

  it('emits an empty string rather than undefined when cleared', async () => {
    const { emitted } = renderWithPrimeVue(BaseInput, { props: { modelValue: 'x' } });
    const input = screen.getByRole('textbox');

    await fireEvent.update(input, '');

    const updates = emitted()['update:modelValue'];
    expect(updates![updates!.length - 1]).toEqual(['']);
  });
});
