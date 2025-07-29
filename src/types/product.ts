import { IErrorType } from './error';
import { IAddressItem } from './address';

// ----------------------------------------------------------------------

export type IProductFilterValue = string | string[] | number | number[];

export type IProductFilters = {
  rating: string;
  gender: string[];
  category: string;
  colors: string[];
  priceRange: number[];
};

// ----------------------------------------------------------------------

export type IProductReviewNewForm = {
  rating: number | string | null;
  review: string;
  name: string;
  email: string;
};

export type IProductReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  helpful: number;
  avatarUrl: string;
  isPurchased: boolean;
  attachments?: string[];
  postedAt: Date | string | number;
};

interface MainDetail {
  unique_key: string;
  key: string;
  value: string;
}

interface HeadDetail {
  unique_key: string;
  key: string;
  main_details: MainDetail[];
}

interface FileDetail {
  unique_key: string;
  name: string;
  path: string;
  extension: string;
  size: string;
  fileId?: string; // File ID received from the backend after uploading
}

interface TabData {
  unique_key: string;
  title: string;
  description?: string;
  type: number; // 1 for text, 2 for image
  level?: number; 
  head_details?: HeadDetail[];
  files?: FileDetail[];
}

export type IProduct = {
  id: string;
  unique_key: string;
  title: string;
  data:{
    price?: string;
  },
  cover: {
    path: string;
    name: string;
  },
  user: {
    name: string;
  }
  category:any,
  category_id: number,
  views_count?: number;
  created_at: string;
  updated_at: string;
  created_at_fa?: string;
  status:number;
  seo:{
    slug:string;
    schema:string;
    ai: string;
    meta:{
      title:string;
      keywords:string;
      description:string;
    },
    og:{
      title:string;
      description:string;
    }
  }
  brand: {
    unique_key: string;
    name: string;
  };
  tabs: TabData[];
  sku: string;
  name: string;
  code: string;
  price: number;
  taxes: number;
  tags: string[];
  gender: string;
  sizes: string[];
  publish: string;
  coverID: string;
  covers: string[];
  images: string[];
  files: {
    unique_key: string;
    name: string;
    path: string;
  }[];
  images_prev: string[];
  colors: string[];
  quantity: number;
  available: number;
  totalSold: number;
  description: string;
  totalRatings: number;
  totalReviews: number;
  inventoryType: string;
  subDescription: string;
  priceSale: number | null;
  reviews: IProductReview[];
  createdAt: Date | string | number;
  ratings: {
    name: string;
    starCount: number;
    reviewCount: number;
  }[];
  saleLabel: {
    enabled: boolean;
    content: string;
  };
  newLabel: {
    enabled: boolean;
    content: string;
  };
};

export type IProductTableFilterValue = string | string[] | number | number[];

export type IProductTableFilters = {
  title: string;
  stock: string[];
  publish: number[];
};

export type ICheckoutCartItem = {
  id: string;
  name: string;
  coverUrl: string;
  available: number;
  price: number;
  colors: string[];
  size: string;
  quantity: number;
  subTotal: number;
};

export type ICheckoutDeliveryOption = {
  value: number;
  label: string;
  description: string;
};

export type ICheckoutPaymentOption = {
  value: string;
  label: string;
  description: string;
};

export type ICheckoutCardOption = {
  value: string;
  label: string;
};

export type IProductCheckoutState = {
  activeStep: number;
  cart: ICheckoutCartItem[];
  subTotal: number;
  total: number;
  discount: number;
  shipping: number;
  billing: IAddressItem | null;
  totalItems: number;
};

export type IProductState = {
  products: IProduct[];
  product: IProduct | null;
  checkout: IProductCheckoutState;
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
