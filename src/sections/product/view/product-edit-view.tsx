'use client';

import { useEffect } from 'react';
import { useLocales } from 'src/locales';

// @mui
import Container from '@mui/material/Container';
import { Theme } from "@mui/material";

// redux
import { useDispatch } from 'src/redux/store';
import { getProducts } from 'src/redux/slices/product';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import Breadcrumb from 'src/layouts/shared/breadcrumb/Breadcrumb';
//
import ProductNewEditForm from '../product-new-edit-form';

// ----------------------------------------------------------------------

export default function ProductEditView() {
  
  const settings = useSettingsContext();
  const { t } = useLocales();
  
  const params = useParams();

  const { id } = params;

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);
  
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{
        width: settings.themeStretch ? '90%' : 'auto', // Adjust percentage as needed
        transition: 'width 0.3s ease-in-out',
      }}
    >
      <Breadcrumb
        title={t('product_section.edit_product') ?? "Update Product"}
        items={[
          {
            href: paths.dashboard.root,
            title: t('app') ?? "Dashboard"
          },
          {
            href: paths.dashboard.product.root,
            title: t('product') ?? "Product"
          },
          {
            title: t('product_section.edit') ?? "Edit"
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
      <ProductNewEditForm productID={id} />
    </Container>
  );
}
