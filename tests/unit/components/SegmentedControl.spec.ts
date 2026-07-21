import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import SegmentedControl from '@/components/ui/SegmentedControl.vue';

const OPTIONS = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
];

describe('SegmentedControl', () => {
  it('renders one radio button per option with its label', () => {
    render(SegmentedControl, {
      props: { modelValue: '24h', options: OPTIONS, ariaLabel: 'Chart range' },
    });
    expect(screen.getByRole('radio', { name: '24h' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '7d' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '30d' })).toBeInTheDocument();
  });

  it('exposes a radiogroup with the given accessible name', () => {
    render(SegmentedControl, {
      props: { modelValue: '24h', options: OPTIONS, ariaLabel: 'Chart range' },
    });
    expect(screen.getByRole('radiogroup', { name: 'Chart range' })).toBeInTheDocument();
  });

  it('marks only the selected option as checked', () => {
    render(SegmentedControl, {
      props: { modelValue: '7d', options: OPTIONS, ariaLabel: 'Chart range' },
    });
    expect(screen.getByRole('radio', { name: '7d' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: '24h' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: '30d' })).toHaveAttribute('aria-checked', 'false');
  });

  it('uses a roving tabindex — only the selected option is tabbable', () => {
    render(SegmentedControl, {
      props: { modelValue: '7d', options: OPTIONS, ariaLabel: 'Chart range' },
    });
    expect(screen.getByRole('radio', { name: '7d' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: '24h' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('radio', { name: '30d' })).toHaveAttribute('tabindex', '-1');
  });

  it('emits update:modelValue with the clicked option', async () => {
    const user = userEvent.setup();
    const { emitted } = render(SegmentedControl, {
      props: { modelValue: '24h', options: OPTIONS, ariaLabel: 'Chart range' },
    });

    await user.click(screen.getByRole('radio', { name: '7d' }));

    expect(emitted()['update:modelValue']).toEqual([['7d']]);
  });

  it('ArrowRight selects and focuses the next option, wrapping around from the last', async () => {
    const user = userEvent.setup();
    const { emitted, rerender } = render(SegmentedControl, {
      props: { modelValue: '30d', options: OPTIONS, ariaLabel: 'Chart range' },
    });

    screen.getByRole('radio', { name: '30d' }).focus();
    await user.keyboard('{ArrowRight}');

    expect(emitted()['update:modelValue']).toEqual([['24h']]);

    await rerender({ modelValue: '24h', options: OPTIONS, ariaLabel: 'Chart range' });
    expect(screen.getByRole('radio', { name: '24h' })).toHaveFocus();
  });

  it('ArrowLeft selects the previous option, wrapping around from the first', async () => {
    const user = userEvent.setup();
    const { emitted } = render(SegmentedControl, {
      props: { modelValue: '24h', options: OPTIONS, ariaLabel: 'Chart range' },
    });

    screen.getByRole('radio', { name: '24h' }).focus();
    await user.keyboard('{ArrowLeft}');

    expect(emitted()['update:modelValue']).toEqual([['30d']]);
  });

  it('Home selects the first option and End selects the last', async () => {
    const user = userEvent.setup();
    const { emitted } = render(SegmentedControl, {
      props: { modelValue: '7d', options: OPTIONS, ariaLabel: 'Chart range' },
    });

    screen.getByRole('radio', { name: '7d' }).focus();
    await user.keyboard('{Home}');
    await user.keyboard('{End}');

    expect(emitted()['update:modelValue']).toEqual([['24h'], ['30d']]);
  });
});
