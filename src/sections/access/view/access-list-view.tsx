'use client';

import isEqual from 'lodash/isEqual';
import { useMemo,useState, useEffect, useCallback } from 'react';
import { useLocales } from 'src/locales';
import axios, { API_ENDPOINTS } from 'src/utils/axios';
// @mui
import { TextField, Box, CardHeader, Grid, Theme, InputLabel, FormControl, Select, MenuItem, Checkbox, ListItemText, Chip } from "@mui/material";
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import Toast from "src/components/toast/Toast";

// routes
import { paths } from 'src/routes/paths';
// types
import { IAccess, IAccessTableFilters, IAccessTableFilterValue, IPersmission } from 'src/types/access';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import { useSettingsContext } from 'src/components/settings';
import Breadcrumb from 'src/layouts/shared/breadcrumb/Breadcrumb';
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
//
import { useProduct } from '../hooks';
import AccessTableRow from '../access-table-row';
import AccessTableToolbar from '../access-table-toolbar';
import AccessTableFiltersResult from '../access-table-filters-result';

// ----------------------------------------------------------------------

const defaultFilters = {
  name: '',
  publish: [],
};

// ----------------------------------------------------------------------
interface FormData {
  name: string;
  permission_ids: number[];
}

interface Access {
  name: string;
  permision_ids?:{
    name: string;
  }[];
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

export default function AccessListView() {

  const { t } = useLocales();

  const table = useTable();

  const settings = useSettingsContext();

  const { productsStatus } = useProduct();

  const [tableData, setTableData] = useState<IAccess[]>([]);

  const [filters, setFilters] = useState(defaultFilters);

  const confirm = useBoolean();

  const [data, setData] = useState<Access | []>([]);

  const [permissions, setPermissions] = useState<IPersmission[]>([]);

  const [loading, setLoading] = useState(true);

  const [errorHandle, setError] = useState(null);

  const [open, setOpen] = useState(false);

  const [message, setMessage] = useState("");
  
  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const [formDataReq, setFormData] = useState<FormData>({
    name: "",
    permission_ids: [] as number[]
  });

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: 200,
      },
    },
  };
  // const [refresh, setRefresh] = useState(false); // State to trigger re-fetch

  const [isEditMode, setIsEditMode] = useState(false); // Track if the form is in edit mode

  const showToast = (msg: string, level: "success" | "error" | "info" | "warning") => {
    setMessage(msg);
    setOpen(true);
    setSeverity(level);
    setTimeout(() => {
      setOpen(false);
    }, 3000);
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSelectChange = (event: any) => {
    setFormData({
      ...formDataReq,
      permission_ids: event.target.value as number[],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {

      const endpoint = API_ENDPOINTS.access.add;
    
      const result = await sendData(accessToken, endpoint, formDataReq);
    
      setFormData({ name: "", permission_ids: [] });
      // setRefresh(prev => !prev); // Toggle state to trigger useEffect
      getData();
      setIsEditMode(false);
      showToast(result?.status?.message, "success");
    } catch (error) {
      showToast(error?.response?.status?.message, "error");
    }
  };

  const getData = useCallback(async () => {
    try {
      const result = await fetchData(accessToken, API_ENDPOINTS.access.role);
      setData(result?.data?.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]); // Add any other dependencies that affect this function

  const getPermission = useCallback(async () => {
    try {
      const result = await fetchData(accessToken, API_ENDPOINTS.access.permission);
      setPermissions(result?.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]); // Add any other dependencies that affect this function


  useEffect(() => {
    if (accessToken && loading) {
      getData();
      getPermission();
    }
  }, [accessToken, loading,getData,getPermission]);
  
  useEffect(() => {
    if (Array.isArray(data) && data.length && !isEqual(tableData, data)) {
      setTableData(data);
    }
  }, [data, tableData]);


  const TABLE_HEAD = useMemo(() => [
    { id: 'row', label: t('table.row') , width:50 },
    { id: 'name', label: t('access_table.name') ?? "Name", width:200 },
    { id: 'permission', label: t('access_table.permission') ?? "Permissions", width:250 },
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

  const denseHeight = table.dense ? 60 : 80;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound =
    (!dataFiltered.length && canReset) || (!productsStatus.loading && !dataFiltered.length);

  const handleFilters = useCallback(
    (name: string, value: IAccessTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
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

  if (errorHandle) return (
    <Container 
      maxWidth={settings.themeStretch ? false : 'xl'}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
    >
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{t('error_data') ?? 'Error Fetching...'}</p>
    </Container>
  );

  const getButtonLabel = () => {
  
    if (isEditMode) {
      return t('access_section.save') ?? "Save";
    }

    return t('access_section.submit');
  };
  
  
  return (
    <>
      <Toast open={open} message={message} severity={severity} onClose={() => setOpen(false)} />
      <Container
        maxWidth={settings.themeStretch ? false : 'lg'}
        sx={{
          width: settings.themeStretch ? '90%' : 'auto',
          transition: 'width 0.3s ease-in-out',
        }}
      >
        <Breadcrumb
          title={t('access_section.head_title') ?? "Access Manage"}
          items={[
            {
              href: paths.dashboard.root,
              title: t('app') ?? "Dashboard"
            },
            {
              title: t('access') ?? "Access"
            },
          ]}
          icon="Access"
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
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            {/* Table Section */}
            <Card>
              <div>
                <AccessTableToolbar
                  filters={filters}
                  onFilters={handleFilters}
                  publishOptions={PUBLISH_OPTIONS}
                />

                {canReset && (
                  <AccessTableFiltersResult
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
                      {/* <TableHeadCustom
                        order={table.order}
                        orderBy={table.orderBy}
                        headLabel={TABLE_HEAD}
                        rowCount={tableData.length}
                        numSelected={table.selected.length}
                        onSort={table.onSort}
                      /> */}
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
                                <AccessTableRow
                                  row={row}
                                  index={index}
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

            {/* Form Section */}
            <div>
              <Card>
                <Grid xs={12} md={8}>
                  <CardHeader
                    title={isEditMode ? t('access_section.edit') ?? "Edit Details" : t('access_section.add') ?? "Add Access"}
                    sx={{ backgroundColor: "#f5f5f5",padding:2}}
                  />
                  <Box component="form" onSubmit={handleSubmit} sx={{p:2}}>
                    <TextField
                      fullWidth
                      label={t('access_section.title') ?? "Title Access"}
                      name="name"
                      value={formDataReq.name}
                      onChange={handleTextFieldChange}
                      margin="normal"
                      required
                    />

                    <FormControl fullWidth margin="normal">
                      <InputLabel>{t('access') ?? "Access"}</InputLabel>
                      <Select
                        multiple
                        name="permissions"
                        value={formDataReq.permission_ids}
                        onChange={handleSelectChange}
                        MenuProps={MenuProps}
                        renderValue={(selected) => (
                          <Box
                            sx={{
                              maxHeight: 120,
                              overflowY: 'auto',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.5,
                            }}
                          >
                            {(selected as (string | number)[]).map((val) => {
                              const item = permissions.find((p) => p.id === val);
                              return <Chip key={val} label={item?.name_fa ?? val} size="small" />;
                            })}
                          </Box>
                        )}
                      >
                        {permissions.map((perData) => (
                          <MenuItem key={perData.id} value={perData.id}>
                            <Checkbox checked={formDataReq.permission_ids.indexOf(perData.id) > -1} />
                            <ListItemText primary={perData.name_fa} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        {getButtonLabel()}
                      </Button>
                  </Box>
                </Grid>
              </Card>
            </div>
          </div>
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: IAccess[];
  comparator: (a: any, b: any) => number;
  filters: IAccessTableFilters;
}) {
  const { name, publish } = filters; // Ensure title is always a string

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (data) => data.name && data.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  // if (stock.length) {
  //   inputData = inputData.filter((data) => stock.includes(product.inventoryType));
  // }

  if (publish.length) {
    inputData = inputData.filter((data) => publish.includes(data.status));
  }

  return inputData;
}
