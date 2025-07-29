// ----------------------------------------------------------------------

export type MembersFilterValue = string;

export type Province = {
  unique_key: string;
  name: string;
  slug: string;
};

export type City = {
  unique_key: string;
  name: string;
  slug: string;
  province: Province; 
};

export type MembersFilters = {
  name: string;
  publish: number[];
};

// ----------------------------------------------------------------------
export type MembersItem = {
  unique_key: string;
  name: string;
  description: string;
  city_id: string;
  data?:Record<string, any>;
  city?: City;
  avatar?: {
    path: string;
    name: string;
    extension: string;
    size: string;
  },
  status:number;
};
