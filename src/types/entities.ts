// ----------------------------------------------------------------------

export type EntitiesFilterValue = string;

export type EntitiesFilters = {
  title: string;
  publish: number[];
};

// ----------------------------------------------------------------------
export type EntitiesItem = {
  unique_key: string;
  title: string;
  description: string;
  file: {
    path: string;
    name: string;
    extension: string;
    size: string;
  },
  link: string;
  created_at: string;
  updated_at: string;
  created_at_fa?: string;
  status:number;
};
