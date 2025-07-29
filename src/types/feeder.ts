// ----------------------------------------------------------------------

export type FeederFilterValue = string;

export type FeederFilters = {
  title: string;
  publish: number[];
};

// ----------------------------------------------------------------------
export type FeederItem = {
  unique_key: string;
  title: string;
  link: string;
  start_time: string;
  fetch_count: number;
  fetch_interval: string;
  status:number;
};
