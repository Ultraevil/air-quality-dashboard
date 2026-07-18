import type { StationsCount, StationsPage } from '@/types/api';
import type { Reading, ReadingsRange } from '@/types/station';
import { apiGet } from './http';

export interface FetchStationsPageParams {
  limit?: number;
  after?: string;
  before?: string;
}

/** `GET /stations` — cursor-paginated in both directions (README §Data). */
function fetchStationsPage(params: FetchStationsPageParams = {}): Promise<StationsPage> {
  return apiGet<StationsPage>('/stations', {
    limit: params.limit,
    after: params.after,
    before: params.before,
  });
}

/** `GET /stations/count` — network-wide total, for the KPI row. */
function fetchStationsCount(): Promise<StationsCount> {
  return apiGet<StationsCount>('/stations/count');
}

/** `GET /stations/:id/readings` — a station's reading series (README §Data). */
function fetchStationReadings(stationId: string, range?: ReadingsRange): Promise<Reading[]> {
  return apiGet<Reading[]>(`/stations/${stationId}/readings`, { range });
}

export const stationsApi = {
  fetchStationsPage,
  fetchStationsCount,
  fetchStationReadings,
};
