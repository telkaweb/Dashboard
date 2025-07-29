import { useCallback } from 'react';
import NextImage from "next/image"; 
import { useLocales } from 'src/locales';
// @mui
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { CardProps } from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useSnackbar } from 'src/components/snackbar';
import TextMaxLine from 'src/components/text-max-line';
import FileThumbnail from 'src/components/file-thumbnail';

// ----------------------------------------------------------------------
interface Files {
  unique_key: string;
  name: string;
  path: string;
  extension: string;
  size: string;
}

interface Props extends CardProps {
  file: Files;
  selected?: boolean;
  onSelect?: VoidFunction;
  onDelete: VoidFunction;
}

export const convertSize = (sizeInKB: string): string => {
  const size = parseFloat(sizeInKB.replace(/,/g, '')); // Remove commas and convert to number

  if (Number.isNaN(size)) return "Invalid Size";

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} GB`;
  }
  if (size >= 1024) {
    return `${(size / 1024).toFixed(2)} MB`;
  }
  
  return `${size.toFixed(2)} KB`;
};



export default function FileManagerFileItem({
  file,
  selected,
  onSelect,
  onDelete,
  sx,
  ...other
}: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useLocales();

  const { copy } = useCopyToClipboard();

  const checkbox = useBoolean();

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp","svg"];

  const details = useBoolean();

  const popover = usePopover();

  const handleCopy = useCallback(() => {
    enqueueSnackbar(t('file-manager.copy_alert') ?? 'Copied!');
    copy(file.path);
  }, [copy, enqueueSnackbar, file.path,t]);
  
  const renderIcon = (fileItem: { path: string; extension: string; name: string }) =>
    imageExtensions.includes(fileItem.extension.toLowerCase()) ? (
      <NextImage 
        src={fileItem.path} 
        alt={fileItem.name} 
        width={36} 
        height={36} 
        style={{ borderRadius: "4px" }} 
      />
    ) : (
      <FileThumbnail file={fileItem.extension} sx={{ width: 36, height: 36 }} />
    );
  

  const renderAction = (
    <Stack direction="row" alignItems="center" sx={{ top: 8, right: 8, position: 'absolute' }}>
      <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
    </Stack>
  );

  const renderText = (
    <>
      <TextMaxLine
        persistent
        variant="subtitle2"
        onClick={details.onTrue}
        sx={{ width: 1, mt: 2, mb: 0.5, direction: "rtl", textAlign: "left" }}
      >
        {`${file.name}.${file.extension}`}
      </TextMaxLine>

      <Stack
        direction="row"
        alignItems="center"
        sx={{
          maxWidth: 0.99,
          whiteSpace: 'nowrap',
          typography: 'caption',
          color: 'text.disabled',
        }}
      >
        {convertSize(file.size)}

        <Box
          component="span"
          sx={{
            mx: 0.75,
            width: 2,
            height: 2,
            flexShrink: 0,
            borderRadius: '50%',
            bgcolor: 'currentColor',
          }}
        />
        <Typography noWrap component="span" variant="caption">
          {/* {fDateTime(file.modifiedAt)} */}
        </Typography>
      </Stack>
    </>
  );

  const renderAvatar = (
    <AvatarGroup
      max={3}
      sx={{
        mt: 1,
        [`& .${avatarGroupClasses.avatar}`]: {
          width: 24,
          height: 24,
          '&:first-of-type': {
            fontSize: 12,
          },
        },
      }}
    />
  );  

  return (
    <>
      <Stack
        component={Paper}
        variant="outlined"
        alignItems="flex-start"
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: 'unset',
          cursor: 'pointer',
          position: 'relative',
          ...((checkbox.value || selected) && {
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z20,
          }),
          ...sx,
        }}
        {...other}
      >
        <Box onMouseEnter={checkbox.onTrue} onMouseLeave={checkbox.onFalse}>
          {renderIcon(file)}
        </Box>

        {renderText}

        {renderAvatar}

        {renderAction}
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            handleCopy();
          }}
        >
          <Iconify icon="eva:link-2-fill" />
          {t('file-manager.copy') ?? "Copy Link"}
        </MenuItem>
        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            onDelete();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          {t('file-manager.delete') ?? "Delete"}
        </MenuItem>
      </CustomPopover>
    </>
  );
}
