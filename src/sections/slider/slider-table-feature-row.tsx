import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// types
import { IFeature } from 'src/types/slider';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import { useLocales } from 'src/locales';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  row: IFeature;
  index: number;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function SliderFeatureRow({
  row,
  index,
  onDeleteRow,
  onEditRow,
}: Props) {
  const {
    title,
    desc,
  } = row;

  const confirm = useBoolean();

  const popover = usePopover();
  const { t } = useLocales();

  return (
    <>
      <TableRow hover>
        <TableCell>{index + 1}</TableCell>

        <TableCell>
          <ListItemText sx={{textAlign:"center"}}>
            {title ?? "..."}
          </ListItemText>
        </TableCell>

        <TableCell>
          <ListItemText sx={{textAlign:"center"}}>
            {desc ?? "..."}
          </ListItemText>
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
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            {t('slider_table.delete') ?? "Delete"}
          </Button>
        }
      />
    </>
  );
}
