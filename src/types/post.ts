// ----------------------------------------------------------------------

export type IPostFilterValue = number;

export type IPostFilters = {
  status: number;
};

// ----------------------------------------------------------------------
export type IPostItem = {
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
    path: string;
    name: string;
  },
  user: {
    name: string;
  }
  category:{
    unique_key:string;
    name: string;
  },
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
  type: string | number;
  tags: {
    title:string; 
  }[];
  sku: string;
  name: string;
  code: string;
  coverUrl: string;
  cover_id: string;
  covers: string[];
  images: string[];
  images_prev: string[];
};
