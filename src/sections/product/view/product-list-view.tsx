'use client';

import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocales } from 'src/locales';
import axios, { API_ENDPOINTS } from 'src/utils/axios';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { Theme } from "@mui/material";

// redux
import { useDispatch } from 'src/redux/store';
import { getProducts } from 'src/redux/slices/product';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// types
import { IProduct, IProductTableFilters, IProductTableFilterValue } from 'src/types/product';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// _mock
// import { PRODUCT_STOCK_OPTIONS } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableSkeleton,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useProduct } from '../hooks';
import ProductTableRow from '../product-table-row';
import ProductTableToolbar from '../product-table-toolbar';
import ProductTableFiltersResult from '../product-table-filters-result';

// ----------------------------------------------------------------------

const defaultFilters = {
  title: '',
  publish: [],
  stock: [],
};

// ----------------------------------------------------------------------

function useInitial() {
  const dispatch = useDispatch();

  const getProductsCallback = useCallback(() => {
    dispatch(getProducts());
  }, [dispatch]);

  useEffect(() => {
    getProductsCallback();
  }, [getProductsCallback]);

  return null;
}

// ----------------------------------------------------------------------
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
  status:number;
}

export const fetchData = async (accessToken: string | null) => {
  if (!accessToken) return null; // Ensure it always returns something

  try {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const response = await axios.get(API_ENDPOINTS.product.list);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};


export default function ProductListView() {
  useInitial();
  const { t } = useLocales();

  const router = useRouter();

  const table = useTable();

  const settings = useSettingsContext();

  const { productsStatus } = useProduct();

  const [tableData, setTableData] = useState<IProduct[]>([]);

  const [filters, setFilters] = useState(defaultFilters);
  
  const confirm = useBoolean();
  const [data, setData] = useState<ItemProps | []>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const getData = useCallback(async () => {
    try {
      const result = await fetchData(accessToken);
      setData(result?.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]); // Add necessary dependencies
  
  useEffect(() => {
    if (accessToken && loading) {
      getData();
    }
  }, [accessToken, loading, getData]); // Added getData
    
  useEffect(() => {
    if (Array.isArray(data) && data.length && !isEqual(tableData, data)) {
      setTableData(data);
    }
  }, [data, tableData]);


  const TABLE_HEAD = useMemo(() => [
    { id: 'title', label: t('content_table.title') ?? "Title", width:250 },
    { id: 'category', label: t('content_table.category') ?? "Category", width: 150 },
    { id: 'price', label: t('content_table.price') ?? "Price", width: 200},
    { id: 'writer', label: t('content_table.writer') ?? 'Writer', width: 150 },
    { id: 'status', label: t('content_table.publish') ?? "Status", width: 150 },
    { id: 'create_at', label: t("content_table.create_at") ?? "Create at", width: 160 },
    { id: '', width: 88 },
  ], [t]);

  
  const PUBLISH_OPTIONS = [
    { value: 0, label: t('status.disable') ?? 'Disable' },
    { value: 1, label: t('status.enable') ?? 'Enable' },
    { value: 2, label: t('status.draft') ?? 'Draft' },
    { value: 3, label: t('status.delete') ?? 'Delete' },
  ];
  
  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 60 : 80;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound =
    (!dataFiltered.length && canReset) || (!productsStatus.loading && !dataFiltered.length);

  const handleFilters = useCallback(
    (title: string, value: IProductTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [title]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    (id: string) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.product.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.product.details(id));
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

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

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={t('product_section.head_title') ?? "List"}
          links={[
            { name: t('app') ?? "Dashboard", href: paths.dashboard.root },
            {
              name: t('product') ?? "Product",
              href: paths.dashboard.product.root,
            },
            { name: t('product_section.section_name') ?? "List" },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.product.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {t('product_section.new_product') ?? "New Product"}
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

        <Card>
          <ProductTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            // stockOptions={PRODUCT_STOCK_OPTIONS}
            publishOptions={PUBLISH_OPTIONS}
          />

          {canReset && (
            <ProductTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              action={
                <Tooltip title={t('content_table.delete') ?? "Delete"}>
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  // order={table.order}
                  // orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  // onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {productsStatus.loading ? (
                    [...Array(table.rowsPerPage)].map((i, index) => (
                      <TableSkeleton key={index} sx={{ height: denseHeight }} />
                    ))
                  ) : (
                    <>
                      {dataFiltered
                        .slice(
                          table.page * table.rowsPerPage,
                          table.page * table.rowsPerPage + table.rowsPerPage
                        )
                        .map((row) => (
                          <ProductTableRow
                            key={row.unique_key}
                            row={row}
                            selected={table.selected.includes(row.unique_key)}
                            onSelectRow={() => table.onSelectRow(row.unique_key)}
                            onDeleteRow={() => handleDeleteRow(row.unique_key)}
                            onEditRow={() => handleEditRow(row.unique_key)}
                            onViewRow={() => handleViewRow(row.unique_key)}
                          />
                        ))}
                    </>
                  )}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: IProduct[];
  comparator: (a: any, b: any) => number;
  filters: IProductTableFilters;
}) {
  const { title, publish } = filters; // Ensure title is always a string

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (title) {
    inputData = inputData.filter(
      (data) => data.title && data.title.toLowerCase().includes(title.toLowerCase())
    );
  }

  // if (stock.length) {
  //   inputData = inputData.filter((data) => stock.includes(product.inventoryType));
  // }

  if (publish.length) {
    inputData = inputData.filter((data) => publish.includes(data.status));
  }

  console.log(publish)

  return inputData;
}
