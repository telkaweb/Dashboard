// import { useState, useCallback } from 'react';
import { useLocales } from 'src/locales';

// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
// import { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  taskName: string;
  onLike: VoidFunction;
  onDelete: VoidFunction;
  onCloseDetails: VoidFunction;
  onSendData: VoidFunction;
};

export default function BuilderDetailsToolbar({
  onLike,
  taskName,
  onDelete,
  onCloseDetails,
  onSendData,
}: Props) {
  const smUp = useResponsive('up', 'sm');

  const confirm = useBoolean();

  const { t } = useLocales();

  // const popover = usePopover();

  // const [status, setStatus] = useState<number>(taskStatus); // Update state to number

  // const handleChangeStatus = useCallback(
  //   (newValue: number) => {  // Change to number
  //     popover.onClose();
  //     setStatus(newValue);
  //   },
  //   [popover]
  // );

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          p: (theme) => theme.spacing(2.5, 1, 2.5, 2.5),
        }}
      >
        {!smUp && (
          <Tooltip title="Back">
            <IconButton onClick={onCloseDetails} sx={{ mr: 1 }}>
              <Iconify icon="eva:arrow-ios-back-fill" />
            </IconButton>
          </Tooltip>
        )}

        <Stack direction="row" justifyContent="flex-end" flexGrow={1}>

          <Tooltip title={t("section.task.delete_btn") ?? "Delete task"}>
            <IconButton onClick={confirm.onTrue}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title={t("section.task.update") ?? "Update"}>
            <IconButton onClick={onSendData}>
              <Iconify icon="solar:smartphone-update-bold" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            {t('section.task.delete_msg') ?? "Are you sure want to delete"} <strong>{taskName}</strong>?
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            {t("section.task.delete_btn") ?? "Delete"}
          </Button>
        }
      />
    </>
  );
}
