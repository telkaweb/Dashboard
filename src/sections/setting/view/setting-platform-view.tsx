'use client';

import { useState, useCallback } from 'react';
import { useLocales } from 'src/locales';

// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
import { Theme } from "@mui/material";

// routes
import { paths } from 'src/routes/paths';
// _mock

// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import Breadcrumb from 'src/layouts/shared/breadcrumb/Breadcrumb';

// sections
import SettingGeneral from '../setting-general';
import SettingSocialLinks from '../setting-social-links';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'general',
    label: 'settings.tabs.general',
    icon: <Iconify icon="material-symbols:public" width={24} />,
  },
  // {
  //   value: 'seo',
  //   label: 'settings.tabs.seo',
  //   icon: <Iconify icon="lineicons:seo-monitor" width={24} />,
  // },
  {
    value: 'social',
    label: 'settings.tabs.social',
    icon: <Iconify icon="solar:share-bold" width={24} />,
  },
];

// ----------------------------------------------------------------------

export default function SettingView() {
  const settings = useSettingsContext();
  const { t } = useLocales();

  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{
        width: settings.themeStretch ? '90%' : 'auto',
        transition: 'width 0.3s ease-in-out',
      }}
    >
      <Breadcrumb
        title={t('settings.title_section') ?? "Setting Platform"}
        items={[
          {
            href: paths.dashboard.root,
            title: t('app') ?? "Dashboard"
          },
          {
            title: t('setting') ?? "Settings"
          },
        ]}
        icon="Settings"
        sx={{
          mb: { xs: 3, md: 5 },
          backgroundColor: "primary.light",
          borderRadius: (theme: Theme) => theme.shape.borderRadius / 4,
          p: "30px 25px 20px",
          marginBottom: "30px",
          position: "relative",
          overflow: "hidden",
        }}
      />

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{ mb: { xs: 3, md: 5 } }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            label={t(tab.label) ?? tab.label}
            icon={tab.icon}
            value={tab.value}
          />
        ))}
      </Tabs>

      {currentTab === 'general' && <SettingGeneral />}
      {/* {currentTab === 'seo' && <AccountNotifications />} */}
      {currentTab === 'social' && <SettingSocialLinks/>}
    </Container>
  );
}
