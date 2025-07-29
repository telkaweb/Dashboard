
// ----------------------------------------------------------------------

export type IAccessFilterValue = string | string[] | number | number[];

export type IAccessFilters = {
  rating: string;
  gender: string[];
  category: string;
  colors: string[];
  priceRange: number[];
};

export type IAccess = {
  id: string;
  unique_key: string;
  name: string;
  description: string;
  permision_ids:{
    name?: string;
    name_fa?: string;
  }[];
  status:number;
};

export type IPersmission = {
  id: number;
  name: string;
  name_fa: string;
};

export type IAccessTableFilterValue = string | string[] | number | number[];

export type IAccessTableFilters = {
  name: string;
  publish: number[];
};
