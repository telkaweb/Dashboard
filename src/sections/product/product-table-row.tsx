// import { format } from 'date-fns';
// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// import LinearProgress from '@mui/material/LinearProgress';
// utils
// import { fCurrency } from 'src/utils/format-number';
// types
import { IProduct } from 'src/types/product';
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
  row: IProduct;
  selected: boolean;
  onEditRow: VoidFunction;
  onViewRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function ProductTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onEditRow,
  onViewRow,
}: Props) {
  const {
    title,
    data,
    status,
    cover,
    category,
    user,
    // created_at,
    created_at_fa,
  } = row;

  const confirm = useBoolean();

  const popover = usePopover();
  const { t } = useLocales();

  const getStatusLabel = (statusNum: number) => {
    const statusOptions: Record<number, { icon: string; text: string; color: 'default' | 'success' | 'warning' | 'error' }> = {
      0: { icon: "mdi:cancel", text: t('status.disable') ?? 'Disable', color: 'default' },
      1: { icon: "mdi:check-circle", text: t('status.enable') ?? 'Enable', color: 'success' },
      2: { icon: "mdi:file-document-outline", text: t('status.draft') ?? 'Draft', color: 'warning' },
      3: { icon: "mdi:trash-can", text: t('status.delete') ?? 'Delete', color: 'error' },
    };
  
    const { icon, text, color } = statusOptions[statusNum] || { icon: "", text: "", color: 'default' };
  
    return { icon, text, color };
  };
  
  const { icon, text, color } = getStatusLabel(status);

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt={cover?.name}
            src={cover?.path}
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
                onClick={onViewRow}
                sx={{ cursor: 'pointer' }}
              >
                {title}
              </Link>
            }
            secondary={
              <Box component="div" sx={{ typography: 'body2', color: 'text.disabled' }}>
                {category?.name}
              </Box>
            }
          />
        </TableCell>

        <TableCell>
          {category.name}
        </TableCell>

        <TableCell>
          {user.name}
        </TableCell>

        <TableCell>{data.price}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={color} // color is now correctly typed as 'LabelColor'
            className="flex items-center gap-1"
            sx={{ fontSize: "0.875rem", fontWeight: 400, padding: 2 }}
          >
            {icon && <Iconify icon={icon} />}
            {text}
          </Label>
        </TableCell>

        {/* <TableCell>
          <Label
            variant="soft"
            color={
              status === 0 ? 'default' :
              status === 1 ? 'success' :
              status === 2 ? 'warning' :
              status === 3 ? 'error' :
              undefined
            }
            className="flex items-center gap-1"
            sx={{fontSize:"0.875rem",fontWeight:400,padding:2}}
          >
            {status === 0 ? (
              <>
                <Iconify icon="mdi:cancel" />
                {t('status.disable') ?? 'Disable'}
              </>
            ) : status === 1 ? (
              <>
                <Iconify icon="mdi:check-circle" />
                {t('status.enable') ?? 'Enable'}
              </>
            ) : status === 2 ? (
              <>
                <Iconify icon="mdi:file-document-outline"  />
                {t('status.draft') ?? 'Draft'}
              </>
            ) : status === 3 ? (
              <>
                <Iconify icon="mdi:trash-can" />
                {t('status.delete') ?? 'Delete'}
              </>
            ) : (
              ''
            )}
          </Label>
        </TableCell> */}

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
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          {t('content_table.view') ?? "View"}
        </MenuItem>

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
        content={t('content_table.delete_alert') ?? "Are you sure want to delete?"}
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            {t('content_table.delete') ?? "Delete"}
          </Button>
        }
      />
    </>
  );
}
