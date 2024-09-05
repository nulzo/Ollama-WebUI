export type Fetch = typeof fetch;

export interface FetchConfig {
  host: string;
  port?: number;
  endpoint?: string;
}
