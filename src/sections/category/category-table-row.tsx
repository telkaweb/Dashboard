// import { format } from 'date-fns';
// @mui
import Box from '@mui/material/Box';
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
import { ICategory } from 'src/types/category';
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
  row: ICategory;
  selected: boolean;
  index: number;
  onEditRow: VoidFunction;
  onViewRow: VoidFunction;
  onStatus: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function CategoryTableRow({
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
    icon,
    main_category,
    status,
    created_at_fa,
  } = row;

  const confirm = useBoolean();

  const popover = usePopover();
  const { t } = useLocales();

  const getStatusColor = (statusRec: number) => {
    if (statusRec === 0) return 'default';
    if (statusRec === 1) return 'success';
    if (statusRec === 2) return 'warning';
    if (statusRec === 3) return 'error';
    return undefined;
  };
  
  const getStatusLabel = (statusLabel: number) => {
    if (statusLabel === 0) {
      return (
        <>
          <Iconify icon="mdi:power" />
          {t('status.disable') ?? 'Disable'}
        </>
      );
    }
    if (statusLabel === 1) {
      return (
        <>
          <Iconify icon="mdi:check-circle" />
          {t('status.enable') ?? 'Enable'}
        </>
      );
    }
    if (statusLabel === 2) {
      return (
        <>
          <Iconify icon="mdi:file-document-outline" />
          {t('status.draft') ?? 'Draft'}
        </>
      );
    }
    if (statusLabel === 3) {
      return (
        <>
          <Iconify icon="mdi:trash-can" />
          {t('status.delete') ?? 'Delete'}
        </>
      );
    }
    return '';
  };
  
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>{index + 1}</TableCell>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt={icon?.name}
            src={icon?.path ?? "/assets/images/no-image.png"}
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
            secondary={
              <Box component="div" sx={{ typography: 'body2', color: 'text.disabled' }}>
                  {main_category?.name 
                    ? `${t('category_table.sub_cat') ?? "Sub Category"}: ${main_category.name}` 
                    : `${t('category_table.main_cat') ?? "Main Category"}`
                  }
              </Box>
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
            color={getStatusColor(status)}
            className="flex items-center gap-1"
            sx={{ fontSize: "0.875rem", fontWeight: 400, padding: 2, cursor: "pointer" }}
            onClick={() => onStatus()}
          >
            {getStatusLabel(status)}
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
