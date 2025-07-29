import { IErrorType } from './error';

// ----------------------------------------------------------------------

export type ACtivityFilterValue = string | string[] | number | number[];

export type ACtivityFilters = {
  rating: string;
  gender: string[];
  category: string;
  colors: string[];
  priceRange: number[];
};


export type ACtivity = {
  unique_key: string;
  platform: string;
  device: string;
  ip: string;
  user_agent: string;
  data: {
    browser: {
      name: string;
      version: string;
    };
    platform: {
      name: string;
      version: string;
    };
    device: {
      name: string;
      model: string;
    };
  },
  user?:{
    name: string;
  },
  activities: {
    route: {
        url: string;
        name: string | null;
        method: string;
        data: Record<string, any>;
    };
    header: Record<string, string[]>;
  };
  created_at?: string;
  created_at_fa?: string;
  status:number;
};

export type ACtivityTableFilterValue = string | string[] | number | number[];

export type ACtivityTableFilters = {
  name: string;
  publish: number[];
};


export type ACtivityState = {
  products: ACtivity[];
  product: ACtivity | null;
  productsStatus: {
    loading: boolean;
    empty: boolean;
    error: IErrorType;
  };
  productStatus: {
    loading: boolean;
    error: IErrorType;
  };
};
