import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  post: icon('ic_post'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  brand: icon('ic_brand'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  builder: icon('ic_builder'),
  folder: icon('ic_folder'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  activity: icon('ic_activity'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  employee: icon('ic_employee'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  category: icon('ic_category'),
  entities: icon('ic_entities'),
  setting: icon('ic_setting'),
  access: icon('ic_access'),
  slider: icon('ic_slider'),
  members: icon('ic_members'),
  feeder: icon('ic_feeder'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();

  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: t('overview'),
        items: [
          { title: t('app'), path: paths.dashboard.root, icon: ICONS.dashboard },
        ],
      },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: t('management'),
        items: [
          // News
          {
            title: t('news'),
            path: paths.dashboard.news.root,
            icon: ICONS.blog,
            children: [
              { title: t('create'), path: paths.dashboard.news.add },
              { title: t('list'), path: paths.dashboard.news.root },
            ],
          },

          // Category
          {
            title: t('category'),
            path: paths.dashboard.category.root,
            icon: ICONS.category,
          },

          // Feeder
          {
            title: t('feeder'),
            path: paths.dashboard.feeder.root,
            icon: ICONS.feeder,
          },

          // Entities
          {
            title: t('service'),
            path: paths.dashboard.entities.service,
            icon: ICONS.entities,
          },
          // {
          //   title: t('entities'),
          //   path: paths.dashboard.entities.root,
          //   icon: ICONS.entities,
          //   children: [
          //     { title: t('service'), path: paths.dashboard.entities.service },
          //   ],
          // },

          // FILE MANAGER
          {
            title: t('file_manager'),
            path: paths.dashboard.fileManager,
            icon: ICONS.folder,
          },
          
          // Slider
          {
            title: t('slider'),
            path: paths.dashboard.slider.root,
            icon: ICONS.slider,
          },

          // Employee
          {
            title: t('employee'),
            path: paths.dashboard.employee.root,
            icon: ICONS.employee,
          },

          // Access
          {
            title: t('access'),
            path: paths.dashboard.access,
            icon: ICONS.access,
          },

          // ContactUs
          {
            title: t('contactus'),
            path: paths.dashboard.contact.connection,
            icon: ICONS.chat,
          },
          
          // Setting
          {
            title: t('setting'),
            path: paths.dashboard.setting,
            icon: ICONS.setting,
          },

          // ACTIVITY
          {
            title: t('activity'),
            path: paths.dashboard.activity,
            icon: ICONS.activity,
          },
        ],
      },
    ],
    [t]
  );

  return data;
}
