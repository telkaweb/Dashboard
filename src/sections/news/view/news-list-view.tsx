'use client';

import orderBy from 'lodash/orderBy';
import { useCallback, useEffect, useState } from 'react';
import { useLocales } from 'src/locales';
import Toast from "src/components/toast/Toast";
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// utils
import axios, { API_ENDPOINTS } from 'src/utils/axios';
// types
// import { IBlogItem, IBlogFilters, IBlogFilterValue } from 'src/types/blog';
import { IBlogItem, IBlogFilters } from 'src/types/blog';

// _mock
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { Grid, Theme } from '@mui/material';
import BlogItemHorizontal from '../news-item-horizontal';

// ----------------------------------------------------------------------

// const defaultFilters = {
//   status: 0,
// };

type Blogs = IBlogItem[];

// type Props = {
//   post: IBlogItem;
//   onDeleteRow: (uniqueKey: string) => Promise<void>; // Make sure the type of onDeleteRow is correct
// };

// ----------------------------------------------------------------------

export const fetchData = async (accessToken: string | null,routApi: string,params = {}) => {
  try {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const response = await axios.get(routApi,{params});
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

export default function NewsListView() {
  const settings = useSettingsContext();

  const { t } = useLocales();

  const statusMapping: { [key: string]: number } = {
    all: 0,
    published: 1,
    draft: 2,
  };
  
  const accessToken = localStorage.getItem('accessToken');

  const [data, setData] = useState<Blogs | []>([]);

  // const [sortBy, setSortBy] = useState('latest');
  const [sortBy] = useState('latest');

  const [filters, setFilters] = useState({ status: 0 });

  const [loading, setLoading] = useState(true);

  const [errorHandle, setError] = useState(null);

  // const [refresh, setRefresh] = useState(false);

  const [open, setOpen] = useState(false);

  const [message, setMessage] = useState("");
  
  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  const showToast = (msg: string, level: "success" | "error" | "info" | "warning") => {
    setMessage(msg);
    setOpen(true);
    setSeverity(level);
    setTimeout(() => {
      setOpen(false);
    }, 3000);
  };

  const getData = useCallback(async () => {
    try {
      const paramSend = {
        type: 2,
      };
      const link = API_ENDPOINTS.blog.list("blogs");
  
      const result = await fetchData(accessToken, link, paramSend);
      setData(result?.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]); // Add any other dependencies that affect this function

  useEffect(() => {
    if (accessToken && loading) {
      getData();
    }
  }, [accessToken, loading,getData]);

  const dataFiltered = applyFilter({
    inputData: data,
    filters,
    sortBy,
  });

  // const handleSortBy = useCallback((newValue: string) => {
  //   setSortBy(newValue);
  // }, []);

  // const handleFilters = useCallback((name: string, value: IBlogFilterValue) => {
  //   setFilters((prevState) => ({
  //     ...prevState,
  //     [name]: value,
  //   }));
  // }, []);

  const handleDeleteRow = async (uniqueKey: string) => {
    try {
      const endpoint = API_ENDPOINTS.blog.delete(uniqueKey);
      const result = await sendData(accessToken, endpoint);
      // setRefresh(prev => !prev); 
      getData();
      showToast(result?.status?.message, "success");
      const deleteRow = data.filter((row) => row.unique_key !== uniqueKey);
      setData(deleteRow);
    } catch (error) {
      showToast(error?.status?.message, "error");
    }
  };

  const handleFilterPublish = (event: React.SyntheticEvent, newValue: string) => {
    // Update filters status based on the tab selected
    const newStatus = statusMapping[newValue as keyof typeof statusMapping]; // Type assertion here
    setFilters((prevFilters) => ({
      ...prevFilters,
      status: newStatus,
    }));
  };

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
      <Container maxWidth={settings.themeStretch ? false : 'lg'}
        sx={{
          width: settings.themeStretch ? '90%' : 'auto', // Adjust percentage as needed
          transition: 'width 0.3s ease-in-out',
        }}
      >
        <CustomBreadcrumbs
          heading={t('section.list_blog') ?? "Blog List"}
          links={[
            { name: t('app') ?? "Dashboard", href: paths.dashboard.root },
            {
              name: t('news') ?? "News",
              href: paths.dashboard.blog.root,
            },
            { name: t('section.list') ?? "List" },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.news.add}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {t('section.add_blog') ?? "Add Blog"}
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 } ,
            backgroundColor: "primary.light",
            borderRadius: (theme: Theme) => theme.shape.borderRadius / 4,
            p: "30px 25px 20px",
            marginBottom: "30px",
            position: "relative",
            overflow: "hidden",
          }}
        />

          <Tabs
            value={Object.keys(statusMapping).find((key) => statusMapping[key] === filters.status) || 'all'}
            onChange={handleFilterPublish}
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          >
            {['all', 'published', 'draft'].map((tab) => {
              const currentStatus = statusMapping[tab as keyof typeof statusMapping];

              return (
                <Tab
                  key={tab}
                  iconPosition="end"
                  value={tab} // Each Tab value corresponds to the status key
                  label={t(`tab.${tab}`) ?? tab }
                  icon={
                    <Label
                      variant={currentStatus === filters.status ? 'filled' : 'soft'}
                      color={tab === 'published' ? 'info' : 'default'}
                    >
                      {tab === 'all' && data.length}
                      {tab === 'published' && data.filter((post) => post.status === 1).length}
                      {tab === 'draft' && data.filter((post) => post.status === 2).length}
                    </Label>
                  }
                  sx={{ textTransform: 'capitalize' }}
                />
              );
            })}
          </Tabs>
        
          <Grid container spacing={2}>
            {dataFiltered.map((post, index) => (
              <Grid item xs={12} sm={6} key={post.unique_key}>
                <BlogItemHorizontal post={post} onDeleteRow={handleDeleteRow} />
              </Grid>
            ))}
          </Grid>
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

const applyFilter = ({
  inputData,
  filters,
  sortBy,
}: {
  inputData: IBlogItem[];
  filters: IBlogFilters;
  sortBy: string;
}) => {
  const { status } = filters;

  if (sortBy === 'latest') {
    inputData = orderBy(inputData, ['createdAt'], ['desc']);
  }

  if (sortBy === 'oldest') {
    inputData = orderBy(inputData, ['createdAt'], ['asc']);
  }

  if (sortBy === 'popular') {
    inputData = orderBy(inputData, ['totalViews'], ['desc']);
  }

  if (status !== 0) {
    inputData = inputData.filter((post) => post.status === status);
  }

  return inputData;
};
