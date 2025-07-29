import { useLocales } from 'src/locales';
// @mui
import PersianDate from "src/components/PersianDate/PersianDate";
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// types
import { IEmployeeItem } from 'src/types/employee';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import UserQuickEditForm from './employee-quick-edit-form';
// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  row: IEmployeeItem;
  index: number;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  setUpdate: (value: boolean) => void;
};

export default function EmployeeTableRow({
  row,
  index,
  selected,
  setUpdate,
  onSelectRow,
  onDeleteRow,
}: Props) {

  const { t } = useLocales();

  const STATUS_LABELS: Record<number, string> = {
    0: t("status.disable"),
    1: t("status.enable"),
    3: t("status.delete"),
  };
  
  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell align="center">{index + 1}</TableCell>

        <TableCell align="center" sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={row.name} src={row.name} sx={{ mr: 2 }} />

          <ListItemText
            primary={row.name}
            secondary={row?.email}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>

        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{row?.mobile}</TableCell>

        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{row?.roles?.map(role => role.name).join(', ')}</TableCell>

        <TableCell align="center">
          <Label
            variant="soft"
            color={
              (row.status === 1 && 'success') ||
              (row.status === 2 && 'warning') ||
              (row.status === 3 && 'error') ||
              'default'
            }
          >
            {STATUS_LABELS[row.status] || "Unknown"}
          </Label>
        </TableCell>

        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}><PersianDate date={row?.created_at} /></TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <IconButton color={popover.open ? 'inherit' : 'default'}  onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </TableCell>
      </TableRow>

      <UserQuickEditForm currentUser={row} open={quickEdit.value} setUpdate={setUpdate} onClose={quickEdit.onFalse} />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t("table.delete") ?? "Delete"}
        content={t("table.entities.delete_alert") ?? "Are you sure want to delete?"}
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            {t("table.delete") ?? "Delete"}
          </Button>
        }
      />
    </>
  );
}
