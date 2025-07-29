'use client';

import { useEffect, useState } from 'react';  // External imports first
import axios, { API_ENDPOINTS } from 'src/utils/axios'; // External imports
import { useLocales } from 'src/locales';
// @mui
import Container from '@mui/material/Container';  // External imports
import { Theme } from '@mui/material';  // External imports
// routes
import { paths } from 'src/routes/paths';
// components
import { useParams } from 'src/routes/hook';
import { useSettingsContext } from 'src/components/settings';
// utilities
import { paramCase } from 'src/utils/change-case';  // Internal utilities

// Correct place for types
import { IBlogItem } from 'src/types/blog';  

import Breadcrumb from 'src/layouts/shared/breadcrumb/Breadcrumb';

// Now this is after the types
import BlogNewEditForm from '../news-new-edit-form';  


// ----------------------------------------------------------------------
// type Props = {
//   currentPost?: IBlogItem; // Allow `undefined`
// };

// interface Category {
//   group: string;
//   classify: {
//     unique_key:string;
//     name: string;
//   }[]
// }

// interface Brand {
//   unique_key: string;
//   name: string;
// }

export const fetchData = async (accessToken: string | null,routApi: string ) => {
  try {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const response = await axios.get(routApi);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export default function NewsEditView() {
  const settings = useSettingsContext();

  const { t } = useLocales();

  const accessToken = localStorage.getItem('accessToken');

  const params = useParams();

  const { title } = params;

  const [data, setData] = useState<IBlogItem>();
  
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async (endPoint: string,setState: React.Dispatch<React.SetStateAction<any>>) => {
      try {
        const result = await fetchData(accessToken,endPoint);
        setState(result?.data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      getData(API_ENDPOINTS.blog.details(title),setData);
    }
  }, [accessToken, title]);

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

  // const currentPost = data ? (title === paramCase(data.unique_key) ? data : undefined) : undefined;
  let currentPost: IBlogItem | undefined;

  if (data) {
    currentPost = title === paramCase(data.unique_key) ? data : undefined;
  }
  
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{
        width: settings.themeStretch ? '90%' : 'auto', // Adjust percentage as needed
        transition: 'width 0.3s ease-in-out',
      }}
    >
      <Breadcrumb
        title={t('section.edit_blog') ?? "Edit Blog"}
        items={[
          {
            href: paths.dashboard.root,
            title: t('app') ?? "Dashboard"
          },
          {
            href: paths.dashboard.blog.root,
            title: t('blog') ?? "Blog"
          },
          {
            title: t('section.edit') ?? "Edit"
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
          backgroundColor: "primary.light",
          borderRadius: (theme: Theme) => theme.shape.borderRadius / 4,
          p: "30px 25px 20px",
          marginBottom: "30px",
          position: "relative",
          overflow: "hidden",
        }}
      />

      <BlogNewEditForm currentPost={currentPost} />
    </Container>
  );
}
