import L from 'leaflet';
import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue';

import type { AqiLevel, Pollutant, StationWithMetrics } from '@/types/station';

const BERLIN_CENTER: L.LatLngExpression = [52.52, 13.405];
const DEFAULT_ZOOM = 10;

const TILE_URLS = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
} as const;

const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function markerHtml(aqi: AqiLevel | null, selected: boolean): string {
  const color = aqi ? `var(--color-aqi-${aqi})` : 'var(--color-text-faint)';
  const size = selected ? 16 : 11;
  const ring = selected
    ? `box-shadow: 0 0 0 4px color-mix(in srgb, ${color} 30%, transparent);`
    : 'box-shadow: 0 0 0 2px var(--color-surface-raised);';
  return `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${color};${ring}"></span>`;
}

function stationIcon(aqi: AqiLevel | null, selected: boolean): L.DivIcon {
  const size = selected ? 16 : 11;
  return L.divIcon({
    className: 'station-marker',
    html: markerHtml(aqi, selected),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export interface UseLeafletStationMapOptions {
  container: Ref<HTMLElement | null>;
  stations: Ref<StationWithMetrics[]>;
  selectedStationId: Ref<string | null>;
  pollutant: Ref<Pollutant>;
  isDark: Ref<boolean>;
  onSelect: (station: StationWithMetrics) => void;
}

export function useLeafletStationMap(options: UseLeafletStationMapOptions) {
  const { container, stations, selectedStationId, pollutant, isDark, onSelect } = options;

  let map: L.Map | null = null;
  let tileLayer: L.TileLayer | null = null;
  let resizeObserver: ResizeObserver | null = null;
  const markers = new Map<string, L.Marker>();

  function popupHtml(station: StationWithMetrics): string {
    const value = pollutant.value === 'pm25' ? station.metrics.pm25 : station.metrics.pm10;
    const label = pollutant.value === 'pm25' ? 'PM2.5' : 'PM10';
    return `<strong>${station.district}</strong><br />${station.location}<br />${label}: ${value ?? '—'} µg/m³`;
  }

  function renderMarkers(): void {
    if (!map) return;
    const seen = new Set<string>();

    for (const station of stations.value) {
      seen.add(station.id);
      const isSelected = station.id === selectedStationId.value;
      const icon = stationIcon(station.metrics.aqi, isSelected);
      let marker = markers.get(station.id);

      if (!marker) {
        marker = L.marker([station.coordinates.lat, station.coordinates.lng], { icon });
        marker.addTo(map);
        markers.set(station.id, marker);
      } else {
        marker.setIcon(icon);
      }

      marker.off('click');
      marker.on('click', () => onSelect(station));

      marker.setZIndexOffset(isSelected ? 1000 : 0);
      marker.bindPopup(popupHtml(station));
    }

    for (const [id, marker] of markers) {
      if (!seen.has(id)) {
        marker.remove();
        markers.delete(id);
      }
    }
  }

  function applyTileLayer(): void {
    if (!map) return;
    if (tileLayer) tileLayer.remove();
    tileLayer = L.tileLayer(isDark.value ? TILE_URLS.dark : TILE_URLS.light, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
    });
    tileLayer.addTo(map);
  }

  onMounted(() => {
    if (!container.value) return;
    map = L.map(container.value, {
      center: BERLIN_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    applyTileLayer();
    renderMarkers();

    // The container can still be mid-layout (e.g. while data is loading and
    // the flex layout hasn't settled) when the map initializes, so Leaflet
    // caches an undersized viewport. Watch the container and re-measure
    // whenever its size actually changes so the map never stays cropped.
    resizeObserver = new ResizeObserver(() => {
      map?.invalidateSize();
    });
    resizeObserver.observe(container.value);
  });

  onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    resizeObserver = null;
    map?.remove();
    map = null;
  });

  watch(isDark, applyTileLayer);
  watch(stations, renderMarkers);
  watch(selectedStationId, renderMarkers);
  watch(pollutant, renderMarkers);
}
