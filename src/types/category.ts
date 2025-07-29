import { IErrorType } from './error';

// ----------------------------------------------------------------------

export type ICategoryFilterValue = string | string[] | number | number[];

export type ICategoryFilters = {
  rating: string;
  gender: string[];
  category: string;
  colors: string[];
  priceRange: number[];
};


export type ICategory = {
  id: string;
  unique_key: string;
  name: string;
  description: string;
  icon: {
    path: string;
    name: string;
  },
  main_category: {
    unique_key:string;
    name:string;
  },
  created_at?: string;
  created_at_fa?: string;
  status:number;
};

export type ICategoryTableFilterValue = string | string[] | number | number[];

export type ICategoryTableFilters = {
  name: string;
  publish: number[];
};


export type IProductState = {
  products: ICategory[];
  product: ICategory | null;
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
