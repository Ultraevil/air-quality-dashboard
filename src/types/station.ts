/** Static identity of a sensor station, as returned by `GET /stations`. */
export interface Station {
  id: string;
  district: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

/** A single hourly reading for a station, as returned by `GET /stations/:id/readings`. */
export interface Reading {
  /** ISO timestamp, on the hour. */
  t: string;
  pm25: number;
  pm10: number;
}

export type ReadingsRange = '24h' | '7d' | '30d';

/** Which pollutant a control is currently keyed to (map marker popups, etc). */
export type Pollutant = 'pm25' | 'pm10';

/** One state per station, derived from its readings (see README §Connection). */
export type ConnectionState = 'offline' | 'poor' | 'hq';

/** AQI band, derived from PM2.5 (see README §Sensor Map legend). */
export type AqiLevel = 'good' | 'moderate' | 'elevated' | 'unhealthy';

/**
 * Everything derived from a station's reading series: the fields the UI
 * actually renders. Computed once per station via `deriveStationMetrics`,
 * rather than re-derived ad hoc in components.
 */
export interface StationMetrics {
  /** Most recent PM2.5 reading, or null if the station has no readings at all. */
  pm25: number | null;
  /** Most recent PM10 reading, or null if the station has no readings at all. */
  pm10: number | null;
  aqi: AqiLevel | null;
  connection: ConnectionState;
  /** Share of expected hourly readings present over the last 30 days, 0-100. */
  stabilityPct: number;
  /** Last 24 hourly PM2.5 values, oldest first — for sparklines. */
  sparkline: number[];
}

export interface StationWithMetrics extends Station {
  metrics: StationMetrics;
}
