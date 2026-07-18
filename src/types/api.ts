import type { Station } from './station';

/** Opaque cursors for `GET /stations`. Present only when that direction exists. */
export interface PageInfo {
  after?: string;
  before?: string;
}

export interface StationsPage {
  items: Station[];
  pageInfo: PageInfo;
}

export interface StationsCount {
  total: number;
}
