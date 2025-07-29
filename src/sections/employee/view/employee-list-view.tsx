'use client';

import isEqual from 'lodash/isEqual';
import { useMemo,useState, useCallback, useEffect } from 'react';
import axios, { API_ENDPOINTS } from 'src/utils/axios';
import { useLocales } from 'src/locales';
import Toast from "src/components/toast/Toast";
// @mui
import { Box, CardHeader, Grid, TextField,Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { alpha, Theme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
// import { useRouter } from 'src/routes/hook';
// types
import { IEmployeeItem , IEmployeeTableFilters, IEmployeeTableFilterValue } from 'src/types/employee';
import { IPermisionItem } from 'src/types/permision';
// hooks
// import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
//
import UserTableRow from '../employee-table-row';
import UserTableToolbar from '../employee-table-toolbar';
import UserTableFiltersResult from '../employee-table-filters-result';

// ----------------------------------------------------------------------

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

interface FormData {
  name: string;
  mobile: string;
  password: string;
  role: string;
}
// ----------------------------------------------------------------------
export const fetchData = async (
  accessToken: string | null,
  endPoint: string,
  method: 'GET' | 'POST' = 'GET',
  params = {}
) => {
  try {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const response =
      method === 'GET'
        ? await axios.get(endPoint, { params })
        : await axios.post(endPoint, params);

    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};


export default function UserListView() {

  const table = useTable();

  const [loading, setLoading] = useState(true);

  const settings = useSettingsContext();

  // const router = useRouter();

  const { t } = useLocales();

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  // const confirm = useBoolean();

  const [tableData, setTableData] = useState<IEmployeeItem[]>([]);

  const [roleData, setRoleData] = useState<IPermisionItem[]>([]);

  const [role, setRole] = useState("");

  const [filters, setFilters] = useState(defaultFilters);

  const [isEditMode] = useState(false); // Track if the form is in edit mode
  
  const [open, setOpen] = useState(false);
  
  const [errorHandle, setError] = useState(null);

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

  const [formData, setFormData] = useState<FormData>({
    name: "",
    mobile: "",
    password: "",
    role: ""
  });

  const STATUS_OPTIONS = [
    { value: "all", label: t("status.all"), color: "default" },
    { value: 1, label: t("status.enable"), color: "success" },
    { value: 3, label: t("status.delete"), color: "error" },
    { value: 0, label: t("status.disable"), color: "default" },
  ];

  const TABLE_HEAD = useMemo(() => [
    { id: 'row', label: t('table.row') , width:50 },
    { id: 'name', label: t('table.employee.name') ?? "Name", width:250 },
    { id: 'mobile', label: t('table.mobile') ?? "Mobile", width:200 },
    { id: 'role', label: t('table.employee.role') ?? "Role", width:200 },
    { id: 'status', label: t('table.status') ?? "Status", width: 150 },
    { id: 'create_at', label: t("table.created_at") ?? "Create at", width: 160 },
    { id: '', width: 88 },
  ], [t]);

  const getEmployeList = useCallback(async () => {
    setLoading(true);
    try {
      const paramSend = {};
      const result = await fetchData(accessToken, API_ENDPOINTS.employee.list, 'GET', paramSend);
      setTableData(result?.data?.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);
  
  const getRoleList = useCallback(async () => {
    try {
      const paramSend = { type: 2 };
      const result = await fetchData(accessToken, API_ENDPOINTS.permision.list, 'GET', paramSend);
      setRoleData(result?.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);
  

  useEffect(() => {
    if (accessToken && loading) {
      getEmployeList();
      getRoleList();
    }
  }, [accessToken, loading,getRoleList,getEmployeList]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name: string, value: IEmployeeTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        const endpoint = API_ENDPOINTS.employee.delete(id);
        const result = await fetchData(accessToken, endpoint,'POST', {});
        const deleteRow = tableData.filter((row) => row.unique_key !== id);
        setTableData(deleteRow);

        table.onUpdatePageDeleteRow(dataInPage.length);
        showToast(result?.status?.message, "success");
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showToast(error?.response?.status?.message, "error");
      }
    },
    [dataInPage.length, table, tableData,accessToken]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      formData.role=role;

      const endpoint = API_ENDPOINTS.employee.create;
    
      const result = await fetchData(accessToken, endpoint,'POST', formData);
      setFormData({ name: "", mobile: "", password:"",role:"" });
      getEmployeList();
      showToast(result?.status?.message, "success");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      showToast(error?.response?.status?.message, "error");
    }
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []); 

  const handleReset = useCallback(() => {
    getEmployeList();
  }, [getEmployeList]); 

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
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={t('section.employee.head_title') ?? "Employee Managment"}
          links={[
            { name: t('app') ?? "Dashboard", href: paths.dashboard.root },
            {
              name: t('employee') ?? "Employee",
              href: paths.dashboard.employee.root,
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

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
          <Card>
            <Tabs
              value={filters.status}
              onChange={handleFilterStatus}
              sx={{
                px: 2.5,
                boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
              }}
            >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      (tab.value === "all" || tab.value === filters.status) ? "filled" : "soft"
                    }
                    color={
                      (tab.value === 1 && 'success') ||
                      (tab.value === 0 && 'warning') ||
                      (tab.value === 3 && 'error') ||
                      'default'
                    }
                    >
                    {tab.value === "all" && tableData.length}
                    {tab.value !== "all" && tableData.filter((user) => user.status === tab.value).length}
                  </Label>
                }
              />
            ))}
            </Tabs>

            <UserTableToolbar
              filters={filters}
              onFilters={handleFilters}
              //
              roleOptions={roleData}
            />

            {canReset && (
              <UserTableFiltersResult
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

              <Scrollbar>
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                  <TableHeadCustom
                    headLabel={TABLE_HEAD}
                    rowCount={tableData.length}
                    numSelected={table.selected.length}
                  />

                  <TableBody>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row, index) => (
                        <UserTableRow
                          key={row.unique_key}
                          row={row}
                          index={index}
                          setUpdate={handleReset}
                          selected={table.selected.includes(row.unique_key)}
                          onSelectRow={() => table.onSelectRow(row.unique_key)}
                          onDeleteRow={() => handleDeleteRow(row.unique_key)}
                        />
                      ))}

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

            {/* Form Section */}
            <div>
              <Card>
                <Grid xs={12} md={8}>
                  <CardHeader
                    title={isEditMode ? t('section.employee.edit') ?? "Edit Details" : t('section.employee.add') ?? "Add New Employee"}
                    sx={{ backgroundColor: "#f5f5f5",padding:2}}
                  />
                  <Box component="form" onSubmit={handleSubmit} sx={{p:2}}>
                    <TextField
                      fullWidth
                      label={t('section.employee.name') ?? "Name Employe"}
                      name="name"
                      value={formData.name}
                      onChange={handleTextFieldChange}
                      margin="normal"
                      required
                    />
                    <TextField
                      fullWidth
                      label={t('section.employee.mobile') ?? "Mobile"}
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleTextFieldChange}
                      margin="normal"
                      required
                    />
                    <TextField
                      fullWidth
                      label={t('section.employee.password') ?? "Password"}
                      name="password"
                      value={formData.password}
                      onChange={handleTextFieldChange}
                      margin="normal"
                      required
                    />

                    <div className="flex flex-col gap-2">
                      <FormControl fullWidth className="backDrop p-3 md:w-14rem">
                        <InputLabel>{t("section.employee.role_head") ?? "Select Employee Role"}</InputLabel>
                        <Select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          displayEmpty
                        >
                          {roleData.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                              {item.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>

                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      {isEditMode 
                          ? t('section.employe.update') ?? "Update"  // Show "Update" in edit mode
                            : t('section.employee.submit')}
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
  inputData: IEmployeeItem[];
  comparator: (a: any, b: any) => number;
  filters: IEmployeeTableFilters;
}) {
  const { name, status, role } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (user) => user.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === Number(status));
  }

  if (role.length) {
    inputData = inputData.filter((data) => role.includes(data?.roles[0]?.name));
  }

  return inputData;
}
