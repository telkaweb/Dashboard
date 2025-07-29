// utils
import { paramCase } from 'src/utils/change-case';
// import { _id, _postTitles } from 'src/_mock/assets';
import { _id } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

// const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  maintenance: '/maintenance',
  page403: '/403',
  page404: '/404',
  page500: '/500',
  // components: '/components',
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    builder: `${ROOTS.DASHBOARD}/builder`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    fileManager: `${ROOTS.DASHBOARD}/file-manager`,
    general: {
      app: `${ROOTS.DASHBOARD}/app`,
    },
    employee: {
      root: `${ROOTS.DASHBOARD}/employee`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      cards: `${ROOTS.DASHBOARD}/user/cards`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      account: `${ROOTS.DASHBOARD}/user/account`,
    },
    entities: {
      root: `${ROOTS.DASHBOARD}/entities`,
      service: `${ROOTS.DASHBOARD}/entities/service`,
      feature: `${ROOTS.DASHBOARD}/entities/feature`,
      faq: `${ROOTS.DASHBOARD}/entities/faq`,
      goals: `${ROOTS.DASHBOARD}/entities/goals`,
      strategy:  `${ROOTS.DASHBOARD}/entities/strategy`,
      csr:`${ROOTS.DASHBOARD}/entities/csr`,
      arteng:`${ROOTS.DASHBOARD}/entities/arteng`,
    },
    members: {
      root: `${ROOTS.DASHBOARD}/members`,
      teams: `${ROOTS.DASHBOARD}/members/teams`,
      customer:  `${ROOTS.DASHBOARD}/members/customer`,
      partner:`${ROOTS.DASHBOARD}/members/partner`,
      agent:`${ROOTS.DASHBOARD}/members/agent`,
      supplier:`${ROOTS.DASHBOARD}/members/supplier`,
    },
    category: {
      root: `${ROOTS.DASHBOARD}/category`,
      list: `${ROOTS.DASHBOARD}/category/list`,
    },
    brand: {
      root: `${ROOTS.DASHBOARD}/brand`,
      list: `${ROOTS.DASHBOARD}/brand/list`,
    },
    contact: {
      root: `${ROOTS.DASHBOARD}/contact`,
      connection: `${ROOTS.DASHBOARD}/contact/connection`,
      inquiry: `${ROOTS.DASHBOARD}/contact/inquiry`,
    },
    feeder: {
      root: `${ROOTS.DASHBOARD}/feeder`,
    },
    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/product/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/product/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/product/${MOCK_ID}/edit`,
      },
    },
    post: {
      root: `${ROOTS.DASHBOARD}/post`,
      new: `${ROOTS.DASHBOARD}/post/new`,
      details: (title: string) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}`,
      edit: (title: string) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}/edit`,
    },
    news: {
      root: `${ROOTS.DASHBOARD}/news`,
      add: `${ROOTS.DASHBOARD}/news/add`,
      details: (title: string) => `${ROOTS.DASHBOARD}/news/${paramCase(title)}`,
      edit: (title: string) => `${ROOTS.DASHBOARD}/news/${paramCase(title)}/edit`,
    },
    blog: {
      root: `${ROOTS.DASHBOARD}/blog`,
      new: `${ROOTS.DASHBOARD}/blog/new`,
      details: (title: string) => `${ROOTS.DASHBOARD}/blog/${paramCase(title)}`,
      edit: (title: string) => `${ROOTS.DASHBOARD}/blog/${paramCase(title)}/edit`,
    },
    slider: {
      root: `${ROOTS.DASHBOARD}/slider`,
      feature: (id: string) => `${ROOTS.DASHBOARD}/slider/${id}/feature`,
    },
    activity: `${ROOTS.DASHBOARD}/activity`,
    setting: `${ROOTS.DASHBOARD}/setting`,
    access: `${ROOTS.DASHBOARD}/access`,
  },
};
