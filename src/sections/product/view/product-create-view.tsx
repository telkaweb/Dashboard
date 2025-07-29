'use client';

import { useLocales } from 'src/locales';
// @mui
import Container from '@mui/material/Container';
import { Theme } from "@mui/material";

// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import Breadcrumb from 'src/layouts/shared/breadcrumb/Breadcrumb';
// import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import ProductNewEditForm from '../product-new-edit-form';

// ----------------------------------------------------------------------

export default function ProductCreateView() {
  const settings = useSettingsContext();
  const { t } = useLocales();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{
        width: settings.themeStretch ? '90%' : 'auto', // Adjust percentage as needed
        transition: 'width 0.3s ease-in-out',
      }}
    >
      <Breadcrumb
        title={t('product_section.add_product') ?? "Create Product"}
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
            title: t('product_section.new') ?? "New"
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
      <ProductNewEditForm />
    </Container>
  );
}
