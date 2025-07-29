// import { format } from 'date-fns';
// @mui
// import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// types
import { FeederItem } from 'src/types/feeder';
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
  row: FeederItem;
  selected: boolean;
  index: number;
  deleteLoad: boolean;
  onEditRow: VoidFunction;
  onStatus: VoidFunction;
  onDeleteRow: VoidFunction;
};

type LabelColorType = 'default' | 'success' | 'warning' | 'error';

export default function FeederTableRow({
  row,
  selected,
  index,
  deleteLoad,
  onDeleteRow,
  onEditRow,
  onStatus,
}: Props) {
  const {
    title,
    link,
    status,
  } = row;


  const confirm = useBoolean();
 
  const popover = usePopover();
  const { t } = useLocales();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>{index + 1}</TableCell>
          
        <TableCell sx={{ alignItems: 'center' }}>
          <ListItemText sx={{ textAlign: 'center' }}>
            {title ?? "..."}
          </ListItemText>
        </TableCell>

        <TableCell sx={{ alignItems: 'center' }}>
          <ListItemText sx={{ textAlign: 'center' }}>
            {link ?? "..."}
          </ListItemText>
        </TableCell>

        <TableCell sx={{alignItems: 'center'}}>
          <Label
            variant="soft"
            color={
              ({
                0: 'default',
                1: 'success',
                2: 'warning',
                3: 'error',
              }[status] as LabelColorType) ?? undefined
            }
            className="flex items-center gap-1"
            sx={{ fontSize: '0.875rem', fontWeight: 400, padding: 2, cursor: 'pointer',alignItems: 'center' }}
            onClick={onStatus}
          >
            {(() => {
              const statusMap: Record<number, { icon: string; text: string }> = {
                0: { icon: 'mdi:power', text: t('status.disable') ?? 'Disable' },
                1: { icon: 'mdi:check-circle', text: t('status.enable') ?? 'Enable' },
                2: { icon: 'mdi:file-document-outline', text: t('status.draft') ?? 'Draft' },
                3: { icon: 'mdi:trash-can', text: t('status.delete') ?? 'Delete' },
              };

              const statusData = statusMap[status];

              return statusData ? (
                <>
                  <Iconify icon={statusData.icon} />
                  {statusData.text}
                </>
              ) : (
                ''
              );
            })()}
          </Label>
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
        title={t('table.delete') ?? "Delete"}
        content={t('table.entities.delete_alert') ?? "Are you sure want to delete?"}
        action={
          <Button variant="contained" color="error" disabled={deleteLoad} onClick={onDeleteRow}>
            {t('table.delete') ?? "Delete"}
          </Button>
        }
      />
    </>
  );
}
