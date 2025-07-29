'use client';

import { useEffect, useState } from 'react';
import axios, { API_ENDPOINTS } from 'src/utils/axios';
// @mui
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { useLocales } from 'src/locales';

// hooks
// import { useMockedUser } from 'src/hooks/use-mocked-user';
// _mock
// import { _appFeatured, _appAuthors, _appInstalled, _appRelated, _appInvoices } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
// assets
import { SeoIllustration } from 'src/assets/illustrations';
//
import AppWelcome from '../app-welcome';
// import AppNewProducts from '../app-new-products';
// import AppPopularContents from '../app-popular-contents';
import AppVisitPlatform from '../app-visit-chart-platform';
import AppVisitorPlatform from '../app-visitor-platform';
import SmsOperatorBalanced from '../../e-commerce/sms-operator-balanced';

// ----------------------------------------------------------------------
export interface ChartSeriesData {
  name: string;
  data: number[];
}

export interface ChartYearData {
  year: string;
  data: ChartSeriesData[];
}

export interface ChartData {
  categories: string[];
  series: ChartYearData[];  // Make sure series is an array
}

interface ItemProps {
  unique_key: string;
  title: string;
  data:{
    price?: string;
  },
  cover: {
    path: string;
    name: string;
  },
  category:{
    name: string;
  },
  views_count?: number;
  created_at_fa?: string;
  status:string;
}

interface Information {
  employee: number;
  posts: number;
  category: number;
  content: {
    popular?: ItemProps[];
    new?: ItemProps[];
  },
  chart: {
    visitor: ChartData;
    platform?: {
      label: string;
      value: number;
    }[];
  };
  sms: {
    count: number;
    price: number;
    balanced: number;
  };
}


export const fetchData = async (accessToken: string | null) => {
  try {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const response = await axios.get(API_ENDPOINTS.public.info);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

export default function MainAppView() {
  const { t } = useLocales();
  const settings = useSettingsContext();
  let userInfo;
  const [data, setData] = useState<Information | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const getData = async () => {
      try {
        const result = await fetchData(accessToken);
        setData(result?.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      getData();
    }
  }, []);
 
  const storedUser = localStorage.getItem('user');
    
  if (storedUser) {
    userInfo=JSON.parse(storedUser);
  }

  if (loading) return (
    <Container 
      maxWidth={settings.themeStretch ? false : 'xl'}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
    >
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{t('loading') ?? 'Loading...'}</p>
    </Container>
  );

  if (error) return (
    <Container 
      maxWidth={settings.themeStretch ? false : 'xl'}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
    >
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{t('error_data') ?? 'Error Fetching...'}</p>
    </Container>
  );

  // const formattedVisitorData = data?.chart?.visitor?.series.map(item => ({
  //   ...item,
  //   year: String(item.year), // Convert number to string
  //   data: item.data.map(series => ({
  //     ...series,
  //     data: series.data,
  //   })),
  // })) ?? [];

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <AppWelcome
            title={`${userInfo?.name} \n ${t('welcome_back') ?? 'Welcome'} 👋 `}
            description={t('welcome_desc') ?? ''}
            img={<SeoIllustration />}
            action={
              <Button variant="contained" color="primary">
                {t('welcome_button') ?? 'Go Now'}
              </Button>
            }
          />
        </Grid>

        <Grid xs={12} md={4}>
          {/* <AppFeatured list={_appFeatured} /> */}
          <SmsOperatorBalanced
            title={t('title_balance_sms') ?? 'Balanced'}
            currentBalance={data?.sms?.balanced ?? 0}
            sentAmount={data?.sms?.price ?? 0}
            setCount={data?.sms?.count ?? 0}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppVisitorPlatform
            title={t('chart_visitor_platform_title') ?? 'Chart Visitor Platform'}
            chart={{
              series: data?.chart?.platform ?? [],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppVisitPlatform
            title={t('chart_view_platform_title') ?? 'Chart Viewer Platform'}
            subheader={t('chart_visitor_subheader') ?? 'Sort By Platform'}
            chart={{
              categories: data?.chart?.visitor?.categories ?? [],
              series: data?.chart?.visitor?.series ?? []
            }}
            />
        </Grid>
{/* 
        <Grid xs={12} lg={8}>
          <AppNewProducts
            title={t('new_products_list_title') ?? 'New Products'}
            tableData={data?.content?.new ?? []}
            tableLabels={[
              { id: 'row', label: t('table.row') }, 
              { id: 'title', label: t('table.title') }, 
              { id: 'category', label: t('table.category') }, 
              { id: 'price', label: t('table.price') }, 
              { id: 'created_at', label: t('table.created_at') },
              { id: 'status', label: t('table.status') },
              { id: '' },
            ]}
          />
        </Grid> */}

        {/* <Grid xs={12} md={6} lg={4}>
          <AppPopularContents title={t('popular_content_title') ?? 'Popular Content'} list={data?.content?.popular ?? []}/>
        </Grid> */}

      </Grid>
    </Container>
  );
}
