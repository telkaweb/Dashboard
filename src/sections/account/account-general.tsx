import * as Yup from 'yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLocales } from 'src/locales';

// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// utils
import { fData } from 'src/utils/format-number';
// types
import { IUserAccount } from 'src/types/user';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';
// ----------------------------------------------------------------------

type FormValuesProps = IUserAccount;

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useLocales();

  const { user } = useMockedUser();

  const UpdateUserSchema = Yup.object().shape({
    displayName: Yup.string().required('Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    photoURL: Yup.mixed().required('Avatar is required'),
    phoneNumber: Yup.string().required('Phone number is required'),
    country: Yup.string().required('Country is required'),
    address: Yup.string().required('Address is required'),
    state: Yup.string().required('State is required'),
    city: Yup.string().required('City is required'),
    zipCode: Yup.string().required('Zip code is required'),
    about: Yup.string().required('About is required'),
  });

  const defaultValues = {
    displayName: user?.displayName || '',
    email: user?.email || '',
    photoURL: user?.photoURL || null,
    phoneNumber: user?.phoneNumber || '',
    country: user?.country || '',
    address: user?.address || '',
    state: user?.state || '',
    city: user?.city || '',
    zipCode: user?.zipCode || '',
    about: user?.about || '',
    isPublic: user?.isPublic || false,
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = useCallback(
    async (data: FormValuesProps) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        enqueueSnackbar('Update success!');
        console.info('DATA', data);
      } catch (error) {
        console.error(error);
      }
    },
    [enqueueSnackbar]
  );

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('photoURL', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center' }}>
            <RHFUploadAvatar
              name="photoURL"
              maxSize={3145728}
              onDrop={handleDrop}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />

            <RHFSwitch
              name="isStatus"
              labelPlacement="start"
              label={t('settings.general.status') ?? "Platform Status"}
              sx={{ mt: 5 }}
            />
            
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="site_title" label={t('settings.general.title') ?? "Name"} />
              <RHFTextField name="email" label={t('settings.general.email') ?? "Email Address"} />
              <RHFTextField name="phoneNumber" label={t('settings.general.phone') ?? "Phone Number"} />
              <RHFTextField name="address" label={t('settings.general.address') ?? "Address"} />
              <RHFTextField name="copyright" label={t('settings.general.copyright') ?? "CopyRight"} />
              
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <RHFTextField name="jscode" multiline rows={4} label={t('settings.general.jscode') ?? "JS Code"} />

              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {t('settings.general.update') ?? "Save Chanages"}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
