import { describe, expect, it, vi } from 'vitest';

import { mapWithConcurrency } from '@/utils/concurrency';

describe('mapWithConcurrency', () => {
  it('maps every item through the worker, preserving input order in the output', async () => {
    const results = await mapWithConcurrency([1, 2, 3, 4], 2, async (item) => item * 10);
    expect(results).toEqual([10, 20, 30, 40]);
  });

  it('passes the index alongside each item', async () => {
    const seen: number[] = [];
    await mapWithConcurrency(['a', 'b', 'c'], 2, async (_item, index) => {
      seen.push(index);
      return index;
    });
    expect(seen.sort()).toEqual([0, 1, 2]);
  });

  it('never runs more than `limit` workers concurrently', async () => {
    let active = 0;
    let maxActive = 0;

    await mapWithConcurrency(
      Array.from({ length: 10 }, (_, i) => i),
      3,
      async (item) => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        await new Promise((resolve) => setTimeout(resolve, 1));
        active -= 1;
        return item;
      },
    );

    expect(maxActive).toBeLessThanOrEqual(3);
  });

  it('resolves to an empty array for an empty input', async () => {
    const worker = vi.fn(async (item: number) => item);
    const results = await mapWithConcurrency([], 5, worker);
    expect(results).toEqual([]);
    expect(worker).not.toHaveBeenCalled();
  });

  it('caps concurrency at the item count when the limit is larger', async () => {
    const worker = vi.fn(async (item: number) => item);
    const results = await mapWithConcurrency([1, 2], 100, worker);
    expect(results).toEqual([1, 2]);
    expect(worker).toHaveBeenCalledTimes(2);
  });

  it('propagates a worker rejection', async () => {
    await expect(
      mapWithConcurrency([1, 2, 3], 2, async (item) => {
        if (item === 2) throw new Error('boom');
        return item;
      }),
    ).rejects.toThrow('boom');
  });
});
