# Notes

Trade-offs and assumptions made where the brief left room, plus what I'd do
next with more time.

## Data & derivation

- **AQI, stability, connection state** are all derived once, in
  `utils/deriveStationMetrics.ts`, from a station's reading series — nothing
  else in the app recomputes them, so a change to the rules only touches one
  function (and its tests in `tests/unit/`).
- **"Now"** — the snapshot's most recent expected hour, needed to detect
  offline stations — isn't an explicit API field. It's derived as the max
  reading timestamp across every station once the whole-network overview has
  loaded (`stores/network.ts`). Until that finishes, a station is
  optimistically treated as "reporting" so connection badges don't flash
  offline while data streams in; they self-correct within a second or two as
  the real snapshot time resolves.
- **Whole-network fetch for the Dashboard.** The map and KPI tiles need every
  station's derived metrics (README §5 "one marker per station", §4 KPIs are
  network-wide), which the API doesn't expose in bulk — so `network.ts` walks
  all station identities and fetches all 240 reading series once, at bounded
  concurrency (16 in flight), and caches the result for the session. This is
  a deliberate exception to the "don't fetch every page" rule in README §8,
  which I read as scoped to the Sensor List *table* specifically (it says so:
  "Do not walk every page up front to build one big client-side list"). The
  Sensor List itself never touches this store — it pages independently via
  `useStationsListPage`.
- **KPI deltas.** The mockup shows a delta pill on each KPI tile (e.g. "+6").
  The API is an explicit fixed snapshot with no history endpoint, so there's
  nothing genuine to diff against. Rather than omit the pill outright, it's
  reproduced as static values matching the mockup (`KpiTiles.vue`) purely for
  visual parity — `BaseTile` exposes a `#delta` slot to wire in real figures
  once a history endpoint exists.
- **Districts watchlist.** There's no "tracked stations" concept in the API,
  so it's local UI state (`stores/watchlist.ts`), persisted like the theme.
  It's seeded with one station per district the first time the app runs, and
  toggled via the star icon on each row.

## Search & sort

- The header search (README §3) looks up by district or sensor ID. On the
  Dashboard it opens a small results dropdown and selects a station into the
  chart on pick. On the Sensor List it filters the table.
- The mock API has no server-side search or sort parameter, and the table is
  cursor-paginated with no offset access — so search and column sort both
  apply to the **currently loaded page only**, not the whole network. A real
  backend would very likely want to push both server-side; I'd wire that up
  first with more time (probably `?q=` and `?sort=` params, falling back to
  resetting pagination on either changing).

## Map

- Marker colour always encodes AQI (derived from PM2.5), matching the fixed
  legend. The PM2.5/PM10 toggle instead switches which value the marker's
  popup surfaces — I read "Marker colours must reflect AQI" as pinning colour
  to AQI regardless of the toggle, since AQI itself is only meaningfully
  defined against PM2.5.
- Tiles are CARTO Positron/Dark Matter (swapped on theme change) rather than
  a CSS filter over standard OSM raster tiles — closer to the mockup's own
  attribution text and produces a cleaner dark map than an `invert()` filter.

## Code review pass

A follow-up self-review turned up and fixed:

- **Real bug:** the PM10/PM2.5 chart legend toggles set a `series.show` field
  that doesn't exist in ECharts' API — it was silently ignored, so the
  checkboxes never actually hid a series. Fixed via `legend.selected` (the
  correct mechanism), with a regression test in `buildParticulateChartOption.spec.ts`.
- **Accessibility bug:** `DistrictRow` nested a clickable `<span role="button">`
  (the star) inside a `<button>` (the row) — invalid HTML, and the star was
  unreachable by keyboard since the outer `<button>` swallowed focus/activation.
  Fixed by making the row a `div[role="button"]` (not "interactive content" in
  the HTML5 sense, so a real nested `<button>` is valid) and adding
  `:focus-visible` outlines to both.
- **Duplication:** `PollutantToggle` and `ChartRangeSelector` were the same
  segmented-pill control with two different value types — merged into one
  generic `components/ui/SegmentedControl.vue`. `BaseSearchInput` also
  duplicated `BaseInput`'s `PInputText` wrapping instead of composing it.
- **Weak typing:** removed an `as any` cast in the chart (a side effect of the
  `series.show` bug above); `BaseTableColumn` is now generic over the row
  type (`field: keyof TRow`), so a mistyped column field is a compile error
  instead of a silently-blank column, and `SensorTable` no longer needs to
  cast row values back to their real types.
- **Dead/speculative code:** removed `network.ts`'s unused `getMetrics()`,
  `BaseTile`'s never-passed `delta`/`deltaSuffix` props, and the
  `useDebouncedValue` composable (a same-signature pass-through over
  VueUse's `refDebounced` with no logic of its own — call `refDebounced`
  directly).
- **Theme inconsistency:** the PrimeVue preset's `primary` 50–300 shades
  referenced Aura's built-in `{orange.*}` scale instead of our own accent
  token, so they'd silently stop matching if the brand colour ever changed;
  now derived from `--color-accent` via `color-mix`. Also dropped an
  unreachable `colorScheme.dark` branch — `darkModeSelector` is off, so that
  branch was dead configuration that had to be hand-kept in sync with the
  (identical, token-driven) light branch for no reason.
- **Component boundaries:** `DashboardView` reached into `watchlistStore` to
  guess a default chart selection — replaced with a plain "first station"
  default, so the view no longer needs to know about the watchlist feature
  at all. `Pollutant` moved out of `stores/dashboardSelection.ts` into
  `types/station.ts`, next to `ReadingsRange`, where the other domain types
  live. `features/search/` (only ever used by the Dashboard) moved under
  `features/dashboard/search/`.
- **Naming:** `ConnectionIndicator` renamed to `ConnectionBadge`, to match
  `AqiBadge` — both are the same kind of thing (a `BaseBadge` with domain
  logic on top) and should read that way.
