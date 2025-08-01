'use client';

import React from "react";
// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Drawer, { drawerClasses } from '@mui/material/Drawer';

// theme
import { paper } from 'src/theme/css';
//
import Iconify from '../../iconify';
import Scrollbar from '../../scrollbar';
//
import { useSettingsContext } from '../context';
import BaseOptions from './base-option';
import LayoutOptions from './layout-options';
import PresetsOptions from './presets-options';
import StretchOptions from './stretch-options';
import FullScreenOption from './fullscreen-option';

// let useLocales: any;
// if (typeof window !== "undefined") {
//   import("../../../../src/locales").then((module) => {
//     useLocales = module.useLocales;
//   });
// }
// ----------------------------------------------------------------------

export default function SettingsDrawer() {
  const settings = useSettingsContext();
  const theme = useTheme();
  // const [t, setT] = useState(() => (key: string) => key); // Default function to prevent errors

  const labelStyles = {
    mb: 1.5,
    color: 'text.disabled',
    fontWeight: 'fontWeightSemiBold',
  };

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, pr: 1, pl: 2.5 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        {/* {t('setting')} */}
      </Typography>

      <Tooltip title="Reset">
        <IconButton onClick={settings.onReset}>
          <Badge color="error" variant="dot" invisible={!settings.canReset}>
            <Iconify icon="solar:restart-bold" />
          </Badge>
        </IconButton>
      </Tooltip>

      <IconButton onClick={settings.onClose}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  const renderMode = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        {/* {t('theme_mode')} */}
      </Typography>

      <BaseOptions
        value={settings.themeMode}
        onChange={(newValue: string) => settings.onUpdate('themeMode', newValue)}
        options={['light', 'dark']}
        icons={['sun', 'moon']}
      />
    </div>
  );

  const renderContrast = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        {/* {t('contrast')} */}
      </Typography>

      <BaseOptions
        value={settings.themeContrast}
        onChange={(newValue: string) => settings.onUpdate('themeContrast', newValue)}
        options={['default', 'bold']}
        icons={['contrast_bold', 'contrast']}
      />
    </div>
  );

  const renderDirection = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        {/* {t('direction')} */}
      </Typography>

      <BaseOptions
        value={settings.themeDirection}
        onChange={(newValue: string) => settings.onUpdate('themeDirection', newValue)}
        options={['ltr', 'rtl']}
        icons={['align_right', 'align_left']}
      />
    </div>
  );

  const renderLayout = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        {/* {t('layout')} */}
      </Typography>

      <LayoutOptions
        value={settings.themeLayout}
        onChange={(newValue: string) => settings.onUpdate('themeLayout', newValue)}
        options={['vertical', 'horizontal', 'mini']}
      />
    </div>
  );

  const renderStretch = (
    <div>
      <Typography
        variant="caption"
        component="div"
        sx={{
          ...labelStyles,
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        {/* {t('stretch')}  */}
        <Tooltip title="Only available at large resolutions > 1600px (xl)">
          <Iconify icon="eva:info-outline" width={16} sx={{ ml: 0.5 }} />
        </Tooltip>
      </Typography>

      <StretchOptions
        value={settings.themeStretch}
        onChange={() => settings.onUpdate('themeStretch', !settings.themeStretch)}
      />
    </div>
  );

  const renderPresets = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        {/* {t('present')} */}
      </Typography>

      <PresetsOptions
        value={settings.themeColorPresets}
        onChange={(newValue: string) => settings.onUpdate('themeColorPresets', newValue)}
      />
    </div>
  );

  return (
    <Drawer
      anchor="right"
      open={settings.open}
      onClose={settings.onClose}
      slotProps={{
        backdrop: { invisible: true },
      }}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          ...paper({ theme, bgcolor: theme.palette.background.default }),
          width: 280,
        },
      }}
    >
      {renderHead}

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3 }}>
          {renderMode}

          {renderContrast}

          {renderDirection}

          {renderLayout}

          {renderStretch}

          {renderPresets}
        </Stack>
      </Scrollbar>

      <FullScreenOption />
    </Drawer>
  );
}
