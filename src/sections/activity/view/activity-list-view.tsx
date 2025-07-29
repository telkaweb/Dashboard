'use client';

import isEqual from 'lodash/isEqual';
import { useMemo,useState, useEffect, useCallback } from 'react';
import { useLocales } from 'src/locales';
import axios, { API_ENDPOINTS } from 'src/utils/axios';
// @mui
// import { TextField, MenuItem, Select, InputLabel, FormControl, Box, SelectChangeEvent } from "@mui/material";
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
// import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
// import { CardHeader, Grid, Stack, Theme, Typography } from "@mui/material";
import { Theme } from "@mui/material";

// import Toast from "src/components/toast/Toast";
// redux
import { useDispatch } from 'src/redux/store';
import { getProducts } from 'src/redux/slices/product';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// import { RouterLink } from 'src/routes/components';
// types
import { ACtivity, ACtivityTableFilters, ACtivityTableFilterValue } from 'src/types/activity';
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
// import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useProduct } from '../hooks';
import ActivityTableRow from '../activity-table-row';
import ActivityTableToolbar from '../activity-table-toolbar';
import ActivityTableFiltersResult from '../activity-table-filters-result';
// import { AxiosRequestConfig } from 'axios';
// import FormProvider, {
//   RHFUploadAvatar,
// } from 'src/components/hook-form';
// import { PhotoCamera } from '@mui/icons-material';
// import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const defaultFilters = {
  name: '',
  publish: [],
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
// interface FormData {
//   name: string;
//   description: string;
//   logo_id: string;
// }

interface Brand {
  unique_key: string;
  name: string;
  logo:{
    name: string;
    path: string;
  },
  status: string;
  created_at: string;
}

// interface UploadResponse {
//   fileName: string;
//   fileId: string;
//   data?:{
//     unique_key:string;
//   }
// }

export const fetchData = async (accessToken: string | null, endPoint: string, params = {}) => {
  if (!accessToken) {
    return null;  // Return null if there is no accessToken
  }
  
  try {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const response = await axios.get(endPoint, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};


export default function ActivityListView() {
  useInitial();
  const { t } = useLocales();

  const router = useRouter();

  const table = useTable();

  const settings = useSettingsContext();

  const { productsStatus } = useProduct(); 

  const [tableData, setTableData] = useState<ACtivity[]>([]);

  const [filters, setFilters] = useState(defaultFilters);

  const confirm = useBoolean();

  const [data, setData] = useState<Brand | []>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  // const [open, setOpen] = useState(false);

  // const [message, setMessage] = useState("");
  
  // const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  const accessToken = localStorage.getItem('accessToken');

  // const [refresh, setRefresh] = useState(false); // State to trigger re-fetch

  // const [isEditMode, setIsEditMode] = useState(false); // Track if the form is in edit mode
  // const [currentRecordId, setCurrentRecordId] = useState<string | null>(null); // Record ID for edit

  // const showToast = (message: string, severity: "success" | "error" | "info" | "warning") => {
  //   setMessage(message);
  //   setOpen(true);
  //   setSeverity(severity);
  //   setTimeout(() => {
  //     setOpen(false);
  //   }, 3000);
  // };

  const getData = useCallback(async () => {
    try {
      const paramSend = { type: 2 };
      const result = await fetchData(accessToken, API_ENDPOINTS.activity, paramSend);
      setData(result?.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]); // Only re-create when accessToken changes
  
  useEffect(() => {
    if (accessToken && loading) {
      getData();
    }
  }, [accessToken, loading, getData]); // Include getData in dependencies

  useEffect(() => {
    if (Array.isArray(data) && data.length && !isEqual(tableData, data)) {
      setTableData(data);
    }
  }, [data, tableData]);


  const TABLE_HEAD = useMemo(() => [
    { id: 'row', label: t('table.row') , width:50 },
    { id: 'device', label: t('activity_table.device') ?? "Device", width:200 },
    { id: 'platform', label: t('activity_table.platform') ?? "Platform", width:200 },
    { id: 'ip', label: t('activity_table.ip') ?? "Ip", width:200 },
    { id: 'user', label: t('activity_table.user') ?? "User", width:200 },
    { id: 'request', label: t('activity_table.request') ?? "Request", width:200 },
    { id: 'type_request', label: t('activity_table.type_req') ?? "Type Request", width:200 },
    { id: 'create_at', label: t("activity_table.create_at") ?? "Create at", width: 160 },
  ], [t]);

  
  const PUBLISH_OPTIONS = [
    { value: 0, label: t('status.disable') ?? 'Disable' },
    { value: 1, label: t('status.enable') ?? 'Enable' },
    { value: 3, label: t('status.delete') ?? 'Delete' },
  ];

  const dataFiltered = applyFilter({
    inputData: tableData, // Original data
    comparator: getComparator('desc', 'id'), // Example filter logic
    filters,
  });

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // const dataInPage = dataFiltered.slice(
  //   table.page * table.rowsPerPage,
  //   table.page * table.rowsPerPage + table.rowsPerPage
  // );

  const denseHeight = table.dense ? 60 : 80;

  const canReset = !isEqual(defaultFilters, filters);

  const handleFilters = useCallback(
    (name: string, value: ACtivityTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.product.details(id));
    },
    [router]
  );

  const notFound =
    (!dataFiltered.length && canReset) || (!productsStatus.loading && !dataFiltered.length);

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
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={t('section.activity.head') ?? "Activity"}
          links={[
            { name: t('app') ?? "Dashboard", href: paths.dashboard.root },
            {
              name: t('activity') ?? "Brand",
              href: paths.dashboard.activity,
            },
            { name: t('section.list') ?? "List" },
          ]}
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
          {/* Table Section */}
          <Card>
            <div>
              <ActivityTableToolbar
                filters={filters}
                onFilters={handleFilters}
                publishOptions={PUBLISH_OPTIONS}
              />

              {canReset && (
                <ActivityTableFiltersResult
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
                      tableData.map((row) => row.unique_key)
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
                      headLabel={TABLE_HEAD}
                      rowCount={tableData.length}
                      numSelected={table.selected.length}
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
                            .map((row,index) => (
                              <ActivityTableRow
                                key={row.unique_key}
                                row={row}
                                index={index}
                                selected={table.selected.includes(row.unique_key)}
                                onSelectRow={() => table.onSelectRow(row.unique_key)}
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
            </div>
          </Card>
      </Container>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: ACtivity[];
  comparator: (a: any, b: any) => number;
  filters: ACtivityTableFilters;
}) {
  const { name, publish } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    return order !== 0 ? order : a[1] - b[1];
  });

  let filteredData = stabilizedThis.map((el) => el[0]);

  if (name) {
    filteredData = filteredData.filter(
      (data) => data.platform?.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (publish.length) {
    filteredData = filteredData.filter((data) => publish.includes(data.status));
  }

  return filteredData; // Ensure it always returns a value
}

// function applyFilter({
//   inputData,
//   comparator,
//   filters,
// }: {
//   inputData: ACtivity[];
//   comparator: (a: any, b: any) => number;
//   filters: ACtivityTableFilters;
// }) {
//   const { name, publish } = filters; // Ensure title is always a string

//   const stabilizedThis = inputData.map((el, index) => [el, index] as const);

//   stabilizedThis.sort((a, b) => {
//     const order = comparator(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });

//   inputData = stabilizedThis.map((el) => el[0]);

//   if (name) {
//     inputData = inputData.filter(
//       (data) => data.platform && data.platform.toLowerCase().includes(name.toLowerCase())
//     );
//   }

//   // if (stock.length) {
//   //   inputData = inputData.filter((data) => stock.includes(product.inventoryType));
//   // }

//   if (publish.length) {
//     inputData = inputData.filter((data) => publish.includes(data.status));
//   }

//   return inputData;
// }
