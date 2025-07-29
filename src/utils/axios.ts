import axios from 'axios';
// config
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

export const API_ENDPOINTS = {
  auth: {
    me: '/api/v3/profile/me',
    login: '/api/v3/auth/login',
    register: '/api/v3/auth/register',
  },
  public: {
    info: '/api/v3/dashboard/info',
  },
  access: {
    permission: '/api/v3/admin/access/permission/list',
    role: '/api/v3/admin/access/role/list',
    add: '/api/v3/admin/access/role/new'
  },
  category:{
    new: '/api/v4/admin/category/new',
    update: (id: string) => `/api/v4/admin/category/${id}/update`,
    delete: (id: string) => `/api/v3/admin/category/${id}/delete`,
    status: (id: string) => `/api/v3/admin/category/${id}/status`,
    list: '/api/v4/admin/category/list',
    all: '/api/v4/admin/category/all'
  },
  brand:{
    new: '/api/v4/admin/brand/new',
    update: (id: string) => `/api/v4/admin/brand/${id}/update`,
    delete: (id: string) => `/api/v4/admin/brand/${id}/delete`,
    status: (id: string) => `/api/v4/admin/brand/${id}/status`,
    list: '/api/v4/admin/brand/list',
    all: '/api/v4/admin/brand/all'
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  communication: {
    list: (section: string) => `/api/v4/admin/communication/${section}/list`,
    contact: (section: string) => `/api/v4/admin/communication/${section}/contacts`,
  },
  post: {
    create: (section: string) => `/api/v4/admin/content/${section}/new`,
    list: (section: string) => `/api/v4/admin/content/${section}/list`,
    delete: (id: string) => `/api/v3/admin/content/${id}/delete`,
    details: (id: string) => `/api/v4/admin/content/${id}/details`,
    update: (id: string) => `/api/v4/admin/content/${id}/update`,
  },
  blog: {
    create: (section: string) => `/api/v4/admin/content/${section}/new`,
    list: (section: string) => `/api/v4/admin/content/${section}/list`,
    delete: (id: string) => `/api/v3/admin/content/${id}/delete`,
    details: (id: string) => `/api/v4/admin/content/${id}/details`,
    update: (id: string) => `/api/v4/admin/content/${id}/update`,
  },
  product: {
    create: '/api/v4/admin/content/product/new',
    list: '/api/v4/admin/content/products/list',
    details: (id: string) => `/api/v4/admin/content/${id}/details`,
    update: (id: string) => `/api/v4/admin/content/${id}/update`,
    search: '/api/product/search',
  },
  entities:{
    list: (section: string) => `/api/v4/admin/entities/${section}/list`,
    create: (section: string) => `/api/v4/admin/entities/${section}/new`,
    update: (section: string,id: string) => `/api/v4/admin/entities/${section}/${id}/update`,
    status: (section: string,id: string) => `/api/v4/admin/entities/${section}/${id}/status`,
    delete: (section: string,id: string) => `/api/v4/admin/entities/${section}/${id}/delete`,
  },
  members:{
    list: (section: string) => `/api/v4/admin/members/${section}/list`,
    add: (section: string) => `/api/v4/admin/members/${section}/add`,
    update: (id: string) => `/api/v4/admin/members/${id}/update`,
    status: (id: string) => `/api/v4/admin/members/${id}/status`,
    delete: (id: string) => `/api/v4/admin/members/${id}/delete`,
  },
  feeder:{
    list: '/api/v5/admin/feeder/list',
    add: '/api/v5/admin/feeder/add',
    update: (id: string) => `/api/v5/admin/feeder/${id}/update`,
    status: (id: string) => `/api/v5/admin/feeder/${id}/status`,
    delete: (id: string) => `/api/v5/admin/feeder/${id}/delete`,
  },
  tags:{
    list: '/api/v4/admin/tags/list'
  },
  upload:{
    chunk: 'api/v3/media/chunk/upload',
    complete: 'api/v3/media/chunk/complete'
  },
  section:{
    list: '/api/v4/admin/setting/section/list',
    task:{
      add: '/api/v4/admin/setting/section/task/add',
      update:{
        sort: '/api/v4/admin/setting/section/task/update/sort',
        detail: '/api/v4/admin/setting/section/task/update/detail'
      }
    }
  },
  slider:{
    list: '/api/v4/admin/slider/list',
    update: (id: string) =>  `/api/v4/admin/slider/${id}/update`,
    delete: (id: string) => `/api/v4/admin/slider/${id}/delete`,
    create: '/api/v4/admin/slider/add',
    status: (id: string) => `/api/v4/admin/slider/${id}/status`,
    feature:{
      list: (id: string) => `/api/v4/admin/slider/${id}/feature/list`,
      add: (id: string) => `/api/v4/admin/slider/${id}/feature/add`,
    }
  },
  employee:{
    list: '/api/v3/admin/employee/list',
    update: (id: string) =>  `/api/v3/admin/employee/${id}/update/info`,
    delete: (id: string) => `/api/v3/admin/employee/${id}/delete`,
    create: '/api/v4/admin/employee/new'
  },
  permision:{
    list: '/api/v3/admin/access/role/list',
  },
  file:{
    list:'/api/v4/admin/media/files',
    delete: (id: string) => `/api/v3/media/${id}/delete`,
    folder: '/api/v4/admin/media/folders'
  },
  settings:{
    info: (section: string) => `/api/v4/admin/setting/${section}/info`,
    update: (section: string) => `/api/v4/admin/setting/${section}/update`,
  },
  activity: '/api/v3/admin/logs/list',
  cities: '/api/v4/general/cities',
};
