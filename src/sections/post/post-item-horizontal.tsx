// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import { useLocales } from 'src/locales';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// types
import { IPostItem } from 'src/types/post';
// components
import Label from 'src/components/label';
import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import TextMaxLine from 'src/components/text-max-line';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

type Props = {
  post: IPostItem;
  onDeleteRow: (uniqueKey: string) => Promise<void>;
};

export default function PostItemHorizontal({ post,onDeleteRow }: Props) {
  const popover = usePopover();

  const { t } = useLocales();

  const router = useRouter();

  const confirm = useBoolean();
  
  const mdUp = useResponsive('up', 'md');

  const statusMapping: { [key: number]: string } = {
    0: 'disable',
    1: 'enable',
    2: 'draft',
  };

  const statusText = statusMapping[post.status];

  const translatedStatus = t(`status.${statusText}`);

  const {
    unique_key,
    title,
    cover,
    description,
    views_count,
    created_at_fa,
  } = post;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disable':
        return 'warning';
      case 'enable':
        return 'success';
      default:
        return 'info';  // for 'other' or any other status
    }
  };

  return (
    <>
      <Stack component={Card} direction="row">
        <Stack
          sx={{
            width:'80%',
            p: (theme) => theme.spacing(3, 3, 2, 3),
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Label variant="soft" color={getStatusColor(translatedStatus)}>
              {translatedStatus}
            </Label>
            
            <Box component="span" sx={{ typography: 'caption', color: 'text.disabled' }}>
              {created_at_fa}
            </Box>
          </Stack>

          <Stack spacing={1} flexGrow={1}>
            <Link color="inherit" component={RouterLink} href={paths.dashboard.post.details(title)}>
              <TextMaxLine variant="subtitle2" line={2}>
                {title}
              </TextMaxLine>
            </Link>

            <TextMaxLine variant="body2" sx={{ color: 'text.secondary' }} >
              {description}
            </TextMaxLine>
          </Stack>

          <Stack direction="row" alignItems="center">
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-horizontal-fill" />
            </IconButton>

            <Stack
              spacing={1.5}
              flexGrow={1}
              direction="row"
              justifyContent="flex-end"
              sx={{
                typography: 'caption',
                color: 'text.disabled',
              }}
            >

              <Stack direction="row" alignItems="center">
                <Iconify icon="solar:eye-bold" width={16} sx={{ mr: 0.5 }} />
                {views_count}
              </Stack>

            </Stack>
          </Stack>
        </Stack>

        {mdUp && (
          <Box sx={{ width: 180, height: 240, position: 'relative', flexShrink: 0, p: 1 }}>
            {/* <Avatar
              alt={author.name}
              src={author.avatarUrl}
              sx={{ position: 'absolute', top: 16, right: 16, zIndex: 9 }}
            /> */}
            <Image alt={cover?.name} src={cover?.path} sx={{ height: 1, borderRadius: 1.5 }} />
          </Box>
        )}
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="bottom-center"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            router.push(paths.dashboard.post.edit(unique_key));
          }}
        >
          <Iconify icon="solar:pen-bold" />
          {t('table.edit') ?? "Edit"}
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          {t('table.delete') ?? "Delete"}
        </MenuItem>
      </CustomPopover>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('content_table.delete') ?? "Delete"}
        content={t('content_table.delete_alert') ?? "Are you sure want to delete?"}
        action={
          <Button variant="contained" color="error" onClick={() => onDeleteRow(unique_key)}>
            {t('content_table.delete') ?? "Delete"}
          </Button>
        }
      />
    </>
  );
}
