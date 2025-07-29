// import { format } from 'date-fns';
// @mui
// import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// types
import { MembersItem } from 'src/types/members';
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
  row: MembersItem;
  selected: boolean;
  index: number;
  section: string;
  deleteLoad: boolean;
  onEditRow: VoidFunction;
  onViewRow: VoidFunction;
  onStatus: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

type LabelColorType = 'default' | 'success' | 'warning' | 'error';

export default function MembersTableRow({
  row,
  selected,
  index,
  section,
  deleteLoad,
  onSelectRow,
  onDeleteRow,
  onEditRow,
  onStatus,
  onViewRow,
}: Props) {
  const {
    name,
    description,
    data,
    city,
    avatar,
    status,
  } = row;


  const confirm = useBoolean();
  let content: React.ReactNode;

  if (section === 'teams') {
    content = (
      <TableCell sx={{ alignItems: 'center' }}>
        <ListItemText sx={{ textAlign: 'center' }}>
          {data?.role ?? "..."}
        </ListItemText>
      </TableCell>
    );
  } else if (section === 'agent') {
    content = (
      <>
        <TableCell sx={{ alignItems: 'center' }}>
          <ListItemText sx={{ textAlign: 'center' }}>
            {data?.agency_code ?? "..."}
          </ListItemText>
        </TableCell>
        <TableCell sx={{ alignItems: 'center' }}>
          <ListItemText sx={{ textAlign: 'center' }}>
            {(city?.name && city?.province?.name)
              ? `${city.name} - ${city.province.name}`
              : '...'}
          </ListItemText>
        </TableCell>
        <TableCell sx={{ alignItems: 'center' }}>
          <ListItemText sx={{ textAlign: 'center' }}>
            {data?.manager ?? "..."}
          </ListItemText>
        </TableCell>
        <TableCell sx={{ alignItems: 'center' }}>
          <ListItemText sx={{ textAlign: 'center' }}>
            {data?.tel ?? "..."}
          </ListItemText>
        </TableCell>
        <TableCell sx={{ alignItems: 'center' }}>
          <ListItemText sx={{ textAlign: 'center' }}>
            {data?.mobile ?? "..."}
          </ListItemText>
        </TableCell>
        <TableCell sx={{ alignItems: 'center' }}>
          <ListItemText sx={{ textAlign: 'center' }}>
            {data?.activity ?? "..."}
          </ListItemText>
        </TableCell>
        <TableCell sx={{ alignItems: 'center' }}>
          <ListItemText sx={{ textAlign: 'center' }}>
            {(data?.work?.start && data?.work?.end)
              ? `${data.work.start} - ${data.work.end}`
              : '...'}
          </ListItemText>
        </TableCell>
      </>
    );
  } else {
    content = (
      <TableCell sx={{ alignItems: 'center' }}>
        <ListItemText sx={{ textAlign: 'center' }}>
          {description ?? "..."}
        </ListItemText>
      </TableCell>
    );
  }

  const popover = usePopover();
  const { t } = useLocales();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>{index + 1}</TableCell>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt={avatar?.name}
            src={avatar?.path ?? "/assets/images/no-image.png"}
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
                {name?.length > 30 ? `${name.substring(0, 30)}...` : name ?? "..."}
              </Link>
            }
          />
        </TableCell>
          
        {content}

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
