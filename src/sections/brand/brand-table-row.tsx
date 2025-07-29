// import { format } from 'date-fns';
// @mui
// import Box from '@mui/material/Box';
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
import { IBrand } from 'src/types/brand';
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
  row: IBrand;
  selected: boolean;
  index: number;
  onEditRow: VoidFunction;
  onViewRow: VoidFunction;
  onStatus: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function BrandTableRow({
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
    name,
    description,
    logo,
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
    
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>{index + 1}</TableCell>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt={logo?.name}
            src={logo?.path ?? "/assets/images/no-image.png"}
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
                {name}
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
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          {t('content_table.edit') ?? "Edit"}
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          {t('content_table.delete') ?? "Delete"}
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('content_table.delete') ?? "Delete"}
        content={t('brand_section.delete_alert') ?? "Are you sure want to delete?"}
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            {t('content_table.delete') ?? "Delete"}
          </Button>
        }
      />
    </>
  );
}
