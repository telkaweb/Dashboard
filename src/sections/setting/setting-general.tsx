import * as Yup from 'yup';
import { useCallback, useEffect, useState } from 'react';
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
// utils
import { fData } from 'src/utils/format-number';
// components
import { useSettingsContext } from 'src/components/settings';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import axios, { API_ENDPOINTS } from 'src/utils/axios';
import { HOST_API } from 'src/config-global';
import Toast from 'src/components/toast/Toast';
import Container from '@mui/material/Container';

// ----------------------------------------------------------------------

  interface Contact {
    office: {
      tell: string;
      fax: string;
      address: string;
      mobile: string;
    };
    company: {
      tell: string;
      fax: string;
      email: string;
      address: string;
      mobile: string;
    };
    location: {
      lat: string;
      lng: string;
    };
  }

  interface Public {
    title: string;
    copyright: string;
    status: boolean;
    jscode: string;
    aboutme: string;
    history: string;
  }

  interface Logo{
    name: string;
    path: string;
  }

  interface UploadResponse {
    fileName: string;
    fileId: string;
    data?:{
      unique_key:string;
    }
  }
  
  interface FormValuesProps {
    public: {
      title: string;
      copyright: string;
      status: boolean; 
      jscode: string;
      aboutme: string; 
      history: string;
    };
    contact: {
      office: {
        tell: string;
        fax: string;
        address: string;
        mobile: string;
      };
      location: {
        lat: string;
        lng: string;
      };
    };
    logo_id: string;
    photoURL: string;
  }

export const fetchData = async (accessToken: string | null,endPoint: string,params = {}) => {
  try {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const response = await axios.get(endPoint,{params});
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

export const sendData = async (accessToken: string | null,endPoint: string,params = {}) => {
  try {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const response = await axios.post(endPoint,params);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

export default function SettingGeneral() {
  const { t } = useLocales();
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const [loading, setLoading] = useState(true);
  const [errorHandle, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
  const [publicData, setPublicData] = useState<Public | null>(null);
  const [logoPublic, setLogo] = useState<Logo | null>(null);
  const [contactData, setContactData] = useState<Contact | null>(null);
  const [loadUpload, setLoadUpload] = useState(false);
  const settings = useSettingsContext();

  const showToast = (msg: string, level: "success" | "error" | "info" | "warning") => {
    setMessage(msg);
    setOpen(true);
    setSeverity(level);
    setTimeout(() => {
      setOpen(false);
    }, 3000);
  };

  const getData = useCallback(async (route: string, key: string) => {
    setLoading(true);
    try {
      const result = await fetchData(accessToken, route);
      if(key === "contact"){
        setContactData(result?.data?.data);
      }else{
        setPublicData(result?.data?.data);
        if (result?.data?.logo) {
          setLogo(result?.data?.logo);
        }
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]); // Add any other dependencies that affect this function

  useEffect(() => {
    if (accessToken && loading) {
      getData(API_ENDPOINTS.settings.info("general"),"public");
      getData(API_ENDPOINTS.settings.info("contact"),"contact");
    }
  }, [accessToken, loading,getData]);


  const UpdateUserSchema = Yup.object().shape({
    public: Yup.object().shape({
      title: Yup.string().required(t('settings.general.validation.title') ?? 'Title is required'),
      copyright: Yup.string().required(t('settings.general.validation.copyright') ?? 'Copyright is required')
    }),
    contact: Yup.object().shape({
      office: Yup.object().shape({
        tell: Yup.string().required(t('settings.general.validation.tell') ?? 'Phone is required'),
        mobile: Yup.string().required(t('settings.general.validation.mobile') ?? 'Mobile is required'),
        fax: Yup.string().required(t('settings.general.validation.fax') ?? 'Fax is required'),
        address: Yup.string().required(t('settings.general.validation.address') ?? 'Address is required')
      }),
      location: Yup.object().shape({
        lat: Yup.string().required(t('settings.general.validation.loclng') ?? 'Location Latitude is required'),
        lng: Yup.string().required(t('settings.general.validation.loclng') ?? 'Location Longitude is required')
      })
    })
  });

  const defaultValues: FormValuesProps = {
    public: {
      title: publicData?.title ?? '', 
      copyright: publicData?.copyright ?? '',
      status: publicData?.status ?? true, 
      jscode: publicData?.jscode ?? '',
      aboutme: publicData?.aboutme ?? '',
      history: publicData?.history ?? ''
    },
    contact: {
      office: {
        tell: contactData?.office?.tell ?? '',
        fax: contactData?.office?.fax ?? '',
        address: contactData?.office?.address ?? '',
        mobile: contactData?.office?.mobile ?? '',
      },
      location: {
        lat: contactData?.location?.lat ?? '',
        lng: contactData?.location?.lng ?? '',
      },
    },
    logo_id: '',
    photoURL: logoPublic?.path ?? '',
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting  },
  } = methods;

  useEffect(() => {
    setValue('public.title', publicData?.title ?? '');
    setValue('public.copyright', publicData?.copyright ?? '');
    setValue('public.status', publicData?.status ?? true);
    setValue('public.jscode', publicData?.jscode ?? '');
    setValue('public.aboutme', publicData?.aboutme ?? '');
    setValue('public.history', publicData?.history ?? '');
    setValue('contact.office.tell', contactData?.office?.tell ?? '');
    setValue('contact.office.fax', contactData?.office?.fax ?? '');
    setValue('contact.office.address', contactData?.office?.address ?? '');
    setValue('contact.office.mobile', contactData?.office?.mobile ?? '');
    setValue('contact.location.lat', contactData?.location?.lat ?? '');
    setValue('contact.location.lng', contactData?.location?.lng ?? '');
    setValue('photoURL', logoPublic?.path ?? '');
  }, [contactData,publicData,logoPublic, setValue]);

  const onSubmit = useCallback(
    async (formValues: FormValuesProps) => {
      try {
        const result=await sendData(accessToken, API_ENDPOINTS.settings.update("general"), formValues);
        showToast(result?.status?.message, "success");
      } catch (error) {
        showToast(error?.response?.status?.message, "error");
      }
    },
    [accessToken]
  );

  const handleUploadMedia = useCallback(
    async (file: File): Promise<void> => {
      if (!(file instanceof File)) {
        console.error('Invalid file object');
        return;
      }

      try {
        const chunkSize = 500 * 1024; // 500KB chunks
        const totalChunks = Math.ceil(file.size / chunkSize); // Total number of chunks
        let currentChunk = 0; // To track the chunk being uploaded

        // Upload each chunk of the file
        const uploadNextChunk = () => {
          if (currentChunk >= totalChunks) {
            // Finalize the upload once all chunks are uploaded
            onSuccess({
              fileName: file.name,
              fileId: 'unique-file-id', // Placeholder for actual file ID from backend response
            });

            return;
          }

          const start = currentChunk * chunkSize;
          const end = Math.min(start + chunkSize, file.size);

          // Slice the current chunk from the file
          const chunk = file.slice(start, end);

          // Prepare form data for the chunk
          const formData = new FormData();
          formData.append('file_chunk', chunk);
          formData.append('chunk_number', currentChunk.toString());
          formData.append('file_name', file.name);
          formData.append('chunk_size', chunkSize.toString());
          formData.append('file_size', file.size.toString());

          // Upload the chunk to the server
          fetch(HOST_API + API_ENDPOINTS.upload.chunk, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
          })
            .then((response) => response.json())
            .then((dataChunk: UploadResponse) => {
              currentChunk += 1;

              // Update progress (optional)

              // Continue uploading next chunk
              uploadNextChunk();
            })
            .catch((error) => {
              console.error('Chunk upload failed:', error);
            });
        };

        // Start the chunk upload
        uploadNextChunk();

        // Handle finalization once all chunks are uploaded
        const onSuccess = (response: UploadResponse) => {
          // Notify backend to finalize the upload after all chunks are uploaded
          fetch(HOST_API + API_ENDPOINTS.upload.complete, {
            method: 'POST',
            body: JSON.stringify({
              file_name: response.fileName, // Send the fileName to backend
              fileId: response.fileId, // Assuming the response includes fileId
            }),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
          })
            .then((res) => res.json())
            .then((finalizeResponse) => {
              setLoadUpload(false);
              setValue('logo_id', finalizeResponse?.data?.unique_key ?? '');
            })
            .catch((error) => {
              console.error('Error finalizing upload', error);
            });
        };
      } catch (error) {
        console.error('Error during file upload:', error);
      }
    },
    [accessToken,setValue,setLoadUpload] // dependencies for useCallback
  );

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setValue('photoURL', URL.createObjectURL(file));
        handleUploadMedia(file);
      }
    },
    [setValue,handleUploadMedia]
  );
  
  if (loading) return (
    <Container 
      maxWidth={settings.themeStretch ? false : 'xl'}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
    >
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{t('loading') ?? 'Loading...'}</p>
    </Container>
  );

  if (errorHandle) return (
    <Container 
      maxWidth={settings.themeStretch ? false : 'xl'}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
    >
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{t('error_data') ?? 'Error Fetching...'}</p>
    </Container>
  );

  const getButtonLabel = () => {
    if (loadUpload) {
      return t('section.upload') ?? "Uploading...";
    }

    return t('settings.general.update');
  };
  
  return (
    <>
    <Toast open={open} message={message} severity={severity} onClose={() => setOpen(false)} />
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center' }}>
            <RHFUploadAvatar
              name="photoURL"
              maxSize={10000000}
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
                  <br /> max size of {fData(10000000)}
                </Typography>
              }
            />

            <RHFSwitch
              name="public.status"
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
              <RHFTextField name="public.title" label={t('settings.general.title') ?? "Title"} />
              <RHFTextField name="contact.office.tell" label={t('settings.general.phone') ?? "Phone Number"} />
              <RHFTextField name="contact.office.address" label={t('settings.general.address') ?? "Address"} />
              <RHFTextField name="contact.office.fax" label={t('settings.general.fax') ?? "Fax.No Co"} />
              <RHFTextField name="contact.office.mobile" label={t('settings.general.mobile') ?? "Mobile"} />
              <RHFTextField name="public.copyright" label={t('settings.general.copyright') ?? "CopyRight"} />
              <RHFTextField name="contact.location.lat" label={t('settings.general.lat') ?? "Lat Map"} />
              <RHFTextField name="contact.location.lng" label={t('settings.general.lng') ?? "Lng Map"} />

            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <RHFTextField sx={{direction:"rtl"}} name="public.jscode" multiline rows={4} label={t('settings.general.jscode') ?? "JS Code"} />
              <RHFTextField sx={{direction:"ltr"}} name="public.aboutme" multiline rows={4} label={t('settings.general.aboutme') ?? "About Me"} />
              <RHFTextField sx={{direction:"ltr"}} name="public.history" multiline rows={4} label={t('settings.general.history') ?? "History"} />

              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {getButtonLabel()}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
    </>
  );
}
