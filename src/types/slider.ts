import { IErrorType } from './error';

// ----------------------------------------------------------------------

export type ISliderFilterValue = string | string[] | number | number[];

export type ISliderFilters = {
  rating: string;
  gender: string[];
  category: string;
  colors: string[];
  priceRange: number[];
};

export type IFeature = {
  title?: string;
  desc?: string;
};

export type ISlider = {
  id: string;
  unique_key: string;
  title: string;
  description: string;
  data?: Record<string, any>;
  file: {
    path: string;
    name: string;
  },
  created_at?: string;
  created_at_fa?: string;
  status:number;
};

export type ISliderTableFilterValue = string | string[] | number | number[];

export type ISliderTableFilters = {
  title?: string;
  publish: number[];
};


export type IProductState = {
  products: ISlider[];
  product: ISlider | null;
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
