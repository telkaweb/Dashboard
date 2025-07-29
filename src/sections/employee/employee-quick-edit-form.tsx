import * as Yup from 'yup';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLocales } from 'src/locales';
import axios, { API_ENDPOINTS } from 'src/utils/axios';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// routes
// _mock
// types
import { IEmployeeItem } from 'src/types/employee';
// assets
// components
import { CustomFile } from 'src/components/upload';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

interface FormValuesProps extends Omit<IEmployeeItem, 'avatarUrl'> {
  avatarUrl: CustomFile | string | null;
}

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentUser?: IEmployeeItem;
  setUpdate: (value: boolean) => void;
};

export const fetchData = async (
  accessToken: string | null,
  endPoint: string,
  method: 'GET' | 'POST' = 'GET',
  params = {}
) => {
  try {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const response =
      method === 'GET'
        ? await axios.get(endPoint, { params })
        : await axios.post(endPoint, params);

    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};


export default function EmployeeQuickEditForm({ currentUser , open, onClose,setUpdate }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useLocales();

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const STATUS_OPTIONS = [
    { value: 1, label: t("status.enable"), color: "success" },
    { value: 0, label: t("status.disable"), color: "default" },
  ];
  
  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    mobile: Yup.string().required('Phone number is required'),
    status: Yup.string().required('Status is required'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentUser?.name || '',
      mobile: currentUser?.mobile || '',
      status: currentUser?.status,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = useCallback(
    async (data: FormValuesProps) => {
      try {

        const result = await fetchData(accessToken,API_ENDPOINTS.employee.update(currentUser?.unique_key ?? ""),'POST',data);

        // await new Promise((resolve) => setTimeout(resolve, 500));
        if(result){
          reset();
          setUpdate(true);
          onClose();
          enqueueSnackbar('Update success!');
        }
      } catch (error) {
        console.error(error);
      }
    },
    [enqueueSnackbar, onClose, reset,accessToken,setUpdate,currentUser]
  );

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{t("section.employee.edit") ?? "Update"}</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            sx={{marginTop:2}}
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFSelect name="status" label={t("table.status") ?? "Status"}>
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value} selected={status.value === currentUser?.status}>      
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

            <RHFTextField name="name" label={t("section.employee.name") ?? "Full Name"} />
            <RHFTextField name="mobile" label={t("section.employee.mobile") ?? "Phone Number"} />

            <RHFTextField name="password" label={t("section.employee.password") ?? "Password"} />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            {t("section.employee.cancel") ?? "Cancel"}
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          {t("section.employee.update") ?? "Update"}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
