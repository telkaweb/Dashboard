// ----------------------------------------------------------------------

export type IBlogFilterValue = string;

export type IBlogFilters = {
  status: number;
};

// ----------------------------------------------------------------------
export type IBlogItem = {
  id: string;
  unique_key: string;
  title: string;
  description: string;
  subDescription: string;
  slug: string;
  data:{
    price?: string;
    short_description?: string;
  },
  cover: {
    unique_key: string;
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
    },
    status: boolean;
  }
  type: string | number;
  tags: string[];
  sku: string;
  name: string;
  code: string;
  coverUrl: string;
  cover_id: string;
  covers: string[];
  images: string[];
  images_prev: string[];
};
