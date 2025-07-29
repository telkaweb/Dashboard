import { useForm } from 'react-hook-form';
import { useCallback , useEffect, useState } from 'react';
import { useLocales } from 'src/locales';
import axios, { API_ENDPOINTS } from 'src/utils/axios';

// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
// types
import { useSettingsContext } from 'src/components/settings';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import Toast from 'src/components/toast/Toast';
import Container from '@mui/material/Container';
// import { direction } from 'src/theme/options/right-to-left';

// ----------------------------------------------------------------------

interface SocialLink {
    instagram: string;
    telegram: string;
    eitaa: string;
    rubika: string;
}

type FormValuesProps = SocialLink;

interface Social {
  [key: string]: string;
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

export default function SettingSocialLinks() {

  const { t } = useLocales();
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const [loading, setLoading] = useState(true);
  const [errorHandle, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
  const [socialData, setSocialData] = useState<Social | null>(null);
  const settings = useSettingsContext();

  const showToast = (msg: string, level: "success" | "error" | "info" | "warning") => {
    setMessage(msg);
    setOpen(true);
    setSeverity(level);
    setTimeout(() => {
      setOpen(false);
    }, 3000);
  };

  const getData = useCallback(async (route: string) => {
    setLoading(true);
    try {
      const result = await fetchData(accessToken, route);
        setSocialData(result?.data?.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]); // Add any other dependencies that affect this function

  useEffect(() => {
    if (accessToken && loading) {
      getData(API_ENDPOINTS.settings.info("social"));
    }
  }, [accessToken, loading,getData]);

  const defaultValues = {
    instagram: socialData?.instagram ?? '',
    telegram: socialData?.telegram ?? '',
    rubika: socialData?.rubika ?? '',
    eitaa: socialData?.eitaa ?? '',
  };


  const getIconComponent = (link: string) => {
    const icons: Record<string, { icon?: string; color?: string; image?: string }> = {
      instagram: { icon: 'ant-design:instagram-filled', color: '#DF3E30' },
      telegram: { icon: 'streamline-logos:telegram-logo-2-block', color: '#0088cc' },
      eitaa: { image: '/icons/eitaa.png' },
      rubika: { image: '/icons/rubika.png' },
    };

    const data = icons[link];

    if (data?.icon) {
      return (
        <Iconify icon={data.icon} width={24} color={data.color} />
      );
    }
    
    if (data?.image) {
      return (
        <img
          src={data.image}
          alt={link}
          width={24}
          height={24}
          style={{ objectFit: 'contain' }}
        />
      );
    }

    return null; 
    
  };

  const methods = useForm({
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    setValue('instagram', socialData?.instagram ?? '');
    setValue('telegram', socialData?.telegram ?? '');
    setValue('rubika', socialData?.rubika ?? '');
    setValue('eitaa', socialData?.eitaa ?? '');
  }, [socialData, setValue]);


  const onSubmit = useCallback(
    async (data: FormValuesProps) => {
      try {
        const paramSend = {
          data: { ...data },  
        };
        const result=await sendData(accessToken, API_ENDPOINTS.settings.update("social"), paramSend);
        showToast(result?.status?.message, "success");
      } catch (error) {
        showToast(error?.response?.status?.message, "error");
      }
    },
    [accessToken]
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
  return (
    <>
    <Toast open={open} message={message} severity={severity} onClose={() => setOpen(false)} />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack component={Card} spacing={3} sx={{ p: 3 }}>
          {socialData && Object.keys(socialData).map((link) => (
            <RHFTextField
              key={link}
              name={link}
              style={{direction:"ltr"}}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {getIconComponent(link)}
                  </InputAdornment>
                ),
              }}
            />
          ))}

          <LoadingButton type="submit" variant="contained" loading={isSubmitting} sx={{ ml: 'auto' }}>
            {t('settings.general.update') ?? 'Update'}
          </LoadingButton>
        </Stack>
      </FormProvider>
    </>
  );
}
