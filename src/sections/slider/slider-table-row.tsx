// import { format } from 'date-fns';
// @mui
// import Box from '@mui/material/Box';
import { useRouter } from 'next/navigation';
import { paths } from 'src/routes/paths';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
// import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// import LinearProgress from '@mui/material/LinearProgress';
// utils
// import { fCurrency } from 'src/utils/format-number';
// types
import { ISlider } from 'src/types/slider';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import { useLocales } from 'src/locales';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  row: ISlider;
  selected: boolean;
  index: number;
  onEditRow: VoidFunction;
  onViewRow: VoidFunction;
  onStatus: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function SliderTableRow({
  row,
  selected,
  index,
  onSelectRow,
  onDeleteRow,
  onEditRow,
  onStatus,
  onViewRow,
}: Props) {
  const {
    unique_key,
    title,
    description,
    file,
    status,
    created_at_fa,
  } = row;

  const confirm = useBoolean();

  const popover = usePopover();
  const { t } = useLocales();

  const statusMapping: { [key: number]: { color: 'default' | 'success' | 'warning' | 'error'; icon: string; label: string } } = {
    0: { color: 'default', icon: 'mdi:power', label: t('status.disable') ?? 'Disable' },
    1: { color: 'success', icon: 'mdi:check-circle', label: t('status.enable') ?? 'Enable' },
    2: { color: 'warning', icon: 'mdi:file-document-outline', label: t('status.draft') ?? 'Draft' },
    3: { color: 'error', icon: 'mdi:trash-can', label: t('status.delete') ?? 'Delete' },
  };
  
  // Retrieve the status info based on the current status
  const statusInfo = statusMapping[status] || { color: undefined, icon: '', label: '' };

  const router = useRouter();
  const id = unique_key; 

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>{index + 1}</TableCell>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt={file?.name}
            src={file?.path ?? "/assets/images/no-image.png"}
            variant="rounded"
            sx={{ width: 64, height: 64, mr: 2 }}
          />

          <ListItemText
            disableTypography
            primary={
              <Link
                noWrap
                color="inherit"
                variant="subtitle2"
                sx={{ cursor: 'pointer' }}
              >
                {title}
              </Link>
            }
          />
        </TableCell>

        <TableCell>
          <ListItemText sx={{textAlign:"center"}}>
            {description ?? "..."}
          </ListItemText>
        </TableCell>

        <TableCell>
          <Label
          variant="soft"
          color={statusInfo.color} // This should now be valid for the LabelColor type
          className="flex items-center gap-1"
          sx={{ fontSize: "0.875rem", fontWeight: 400, padding: 2, cursor: "pointer" }}
          onClick={() => {
            onStatus();
          }}
        >
          {/* Render icon and label */}
          <Iconify icon={statusInfo.icon} />
          {statusInfo.label}
        </Label>
        </TableCell>

        <TableCell>
          <ListItemText
            primary={created_at_fa}
            // secondary={created_at_fa}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>

        <TableCell align="right">
          <IconButton color={popover.open ? 'primary' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            router.push(paths.dashboard.slider.feature(id));
            popover.onClose();
          }}
        >
          <Iconify icon="pajamas:feature-flag" />
          {t('slider_table.features') ?? "Features"}
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          {t('slider_table.edit') ?? "Edit"}
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          {t('slider_table.delete') ?? "Delete"}
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('slider_table.delete') ?? "Delete"}
        content={t('slider_section.delete_alert') ?? "Are you sure want to delete?"}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              confirm.onFalse(); 
              setTimeout(() => {
                onDeleteRow();
              }, 100);
            }}
          >
            {t('slider_table.delete') ?? "Delete"}
          </Button>
        }
      />

    </>
  );
}
