import { IErrorType } from './error';

// ----------------------------------------------------------------------

export type IBrandFilterValue = string | string[] | number | number[];

export type IBrandFilters = {
  rating: string;
  gender: string[];
  category: string;
  colors: string[];
  priceRange: number[];
};


export type IBrand = {
  id: string;
  unique_key: string;
  name: string;
  description: string;
  logo: {
    path: string;
    name: string;
  },
  created_at?: string;
  created_at_fa?: string;
  status:number;
};

export type IBrandTableFilterValue = string | string[] | number | number[];

export type IBrandTableFilters = {
  name: string;
  publish: number[];
};


export type IProductState = {
  products: IBrand[];
  product: IBrand | null;
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
