import { useEffect, useCallback } from 'react';
// import { useLocales } from 'src/locales';

// @mui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// types
import { IContactConversation } from 'src/types/contact';
// components
import Iconify from 'src/components/iconify';
//
import { useCollapseNav } from './hooks';
import ContactRoomSingle from './contact-room-single';

// ----------------------------------------------------------------------

const NAV_WIDTH = 300;

type Props = {
  conversation: IContactConversation;
};

export default function ContactRoom({ conversation }: Props) {
  const theme = useTheme();

  // const { t } = useLocales();

  const lgUp = useResponsive('up', 'lg');

  const {
    collapseDesktop,
    onCloseDesktop,
    onCollapseDesktop,
    //
    openMobile,
    onOpenMobile,
    onCloseMobile,
  } = useCollapseNav();

  useEffect(() => {
    if (!lgUp) {
      onCloseDesktop();
    }
  }, [onCloseDesktop, lgUp]);

  const handleToggleNav = useCallback(() => {
    if (lgUp) {
      onCollapseDesktop();
    } else {
      onOpenMobile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lgUp]);


  const renderContent = (
    <ContactRoomSingle participant={conversation} />
  );

  const renderBtn = (
    <IconButton
      onClick={handleToggleNav}
      sx={{
        top: 12,
        right: 0,
        zIndex: 9,
        width: 32,
        height: 32,
        borderRight: 0,
        position: 'absolute',
        borderRadius: `12px 0 0 12px`,
        boxShadow: theme.customShadows.z8,
        bgcolor: theme.palette.background.paper,
        border: `solid 1px ${theme.palette.divider}`,
        '&:hover': {
          bgcolor: theme.palette.background.neutral,
        },
        ...(lgUp && {
          ...(!collapseDesktop && {
            right: NAV_WIDTH,
          }),
        }),
      }}
    >
      {lgUp ? (
        <Iconify
          width={16}
          icon={collapseDesktop ? 'eva:arrow-ios-back-fill' : 'eva:arrow-ios-forward-fill'}
        />
      ) : (
        <Iconify width={16} icon="eva:arrow-ios-back-fill" />
      )}
    </IconButton>
  );

  return (
    <Box sx={{ position: 'relative' }}>
      {renderBtn}

      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            flexShrink: 0,
            width: NAV_WIDTH,
            borderLeft: `solid 1px ${theme.palette.divider}`,
            transition: theme.transitions.create(['width'], {
              duration: theme.transitions.duration.shorter,
            }),
            ...(collapseDesktop && {
              width: 0,
            }),
          }}
        >
          {!collapseDesktop && renderContent}
        </Stack>
      ) : (
        <Drawer
          anchor="right"
          open={openMobile}
          onClose={onCloseMobile}
          slotProps={{
            backdrop: { invisible: true },
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
