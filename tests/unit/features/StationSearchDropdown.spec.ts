import { fireEvent, render, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';

import StationSearchDropdown from '@/features/dashboard/search/StationSearchDropdown.vue';
import { makeStationWithMetrics } from '../../fixtures/stations';

const STATIONS = [
  makeStationWithMetrics({ id: 'ST-001', district: 'Mitte', location: 'Alexanderplatz' }),
  makeStationWithMetrics({ id: 'ST-002', district: 'Tempelhof', location: 'Platz der Luftbrücke' }),
  makeStationWithMetrics({ id: 'ST-003', district: 'Pankow', location: 'Bornholmer Straße' }),
];

describe('StationSearchDropdown', () => {
  it('renders nothing for an empty query', () => {
    const { container } = render(StationSearchDropdown, {
      props: { query: '', stations: STATIONS },
    });
    expect(container.querySelector('ul')).not.toBeInTheDocument();
    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('renders nothing for a whitespace-only query', () => {
    const { container } = render(StationSearchDropdown, {
      props: { query: '   ', stations: STATIONS },
    });
    expect(container.querySelector('ul')).not.toBeInTheDocument();
  });

  it('matches by station id, case-insensitively', () => {
    render(StationSearchDropdown, { props: { query: 'st-002', stations: STATIONS } });
    expect(screen.getByText('ST-002')).toBeInTheDocument();
  });

  it('matches by district name', () => {
    render(StationSearchDropdown, { props: { query: 'tempelhof', stations: STATIONS } });
    expect(screen.getByText('ST-002')).toBeInTheDocument();
  });

  it('matches by location name', () => {
    render(StationSearchDropdown, { props: { query: 'Bornholmer', stations: STATIONS } });
    expect(screen.getByText('ST-003')).toBeInTheDocument();
  });

  it('shows the "no matches" message for a query that matches nothing', () => {
    render(StationSearchDropdown, { props: { query: 'nonexistent', stations: STATIONS } });
    expect(screen.getByText('No stations match “nonexistent”.')).toBeInTheDocument();
  });

  it('caps results at 8 matches', () => {
    const manyStations = Array.from({ length: 20 }, (_, i) =>
      makeStationWithMetrics({ id: `ST-${i}`, district: 'Mitte', location: 'Test' }),
    );
    render(StationSearchDropdown, { props: { query: 'mitte', stations: manyStations } });
    expect(screen.getAllByRole('listitem')).toHaveLength(8);
  });

  it('emits select with the chosen station when a result is clicked', async () => {
    const { emitted } = render(StationSearchDropdown, {
      props: { query: 'ST-002', stations: STATIONS },
    });

    await fireEvent.click(screen.getByText('ST-002'));

    expect(emitted().select).toHaveLength(1);
    expect(emitted().select![0]).toEqual([STATIONS[1]]);
  });
});
