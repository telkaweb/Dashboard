'use client';

// React and Third-party Libraries
import { useState, useEffect, useCallback, useMemo } from "react";
import isEqual from "lodash/isEqual";
import axios, { API_ENDPOINTS } from "src/utils/axios";
import { useLocales } from "src/locales";

// MUI Components (Combine into one)
import {
  TextField,
  Box,
  Card,
  Table,
  Button,
  Tooltip,
  Container,
  TableBody,
  IconButton,
  TableContainer,
  CardHeader,
  Grid,
  Theme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

// Project Imports (Absolute)
import Toast from "src/components/toast/Toast";
import { paths } from "src/routes/paths";
import { useParams } from "src/routes/hook";
import { FeederItem, FeederFilters, FeederFilterValue } from "src/types/feeder";
import { useSettingsContext } from "src/components/settings";
import { SelectChangeEvent } from '@mui/material/Select';
// Hooks (Place after Config and Redux)
import { useBoolean } from "src/hooks/use-boolean";

// Components
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
} from "src/components/table";
import Iconify from "src/components/iconify";
import Scrollbar from "src/components/scrollbar";
import CustomBreadcrumbs from "src/components/custom-breadcrumbs";

// Feature-Specific Components
import FeederTableFiltersResult from "../feeder-table-filters-result";
import FeederTableToolbar from "../feeder-table-toolbar";
import FeederTableRow from "../feeder-table-row";

import { useProduct } from "../hooks";

// ----------------------------------------------------------------------

const defaultFilters = {
  title: '',
  publish: [],
};

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
interface FormData {
  title: string;
  link: string;
  interval: string;
}

interface Feeder {
  unique_key: string;
  name: string;
  status: string;
  created_at: string;
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
    return error;
  }
};

export default function FeederListView() {
  
  const { t } = useLocales();

  const table = useTable();

  const settings = useSettingsContext();

  const { productsStatus } = useProduct();

  const [tableData, setTableData] = useState<FeederItem[]>([]);

  const [filters, setFilters] = useState(defaultFilters);

  const confirm = useBoolean();

  const [data, setData] = useState<Feeder | []>([]);

  const [loading, setLoading] = useState(true);
  
  const [deleteLoadBtn,setDeleteLoadBtn]=useState(false);

  const [errorHandle, setError] = useState(null);

  const [open, setOpen] = useState(false);

  const [message, setMessage] = useState("");
  
  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const initialFormData: FormData = {
    title: '',
    link: '',
    interval: '',
  };

  const [formDataReq, setFormData] = useState<FormData>(initialFormData);

  // const [refresh, setRefresh] = useState(false); // State to trigger re-fetch

  const [isEditMode, setIsEditMode] = useState(false); // Track if the form is in edit mode
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null); // Record ID for edit

  const showToast = (msg: string, level: "success" | "error" | "info" | "warning") => {
    setMessage(msg);
    setOpen(true);
    setSeverity(level);
    setTimeout(() => {
      setOpen(false);
    }, 3000);
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;

    const keys = name.split('.');

    setFormData((prev) => {
      const updated = { ...prev };
      let current: any = updated;

      for (let i = 0; i < keys.length - 1; i += 1) { 
        const key = keys[i];
        current[key] = current[key] || {};
        current = current[key];
      }

      current[keys[keys.length - 1]] = value;

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isEditMode 
      ? API_ENDPOINTS.feeder.update(currentRecordId ?? "") 
      : API_ENDPOINTS.feeder.add;

      const result = await sendData(accessToken, endpoint, formDataReq);

      if (result?.status?.code !== 200) {
        showToast(result?.status?.message, "error");
      } else {
        setFormData(initialFormData);
        getData();
        setIsEditMode(false);
        setCurrentRecordId(null);  
        showToast(result?.status?.message, "success");
      }
    } catch (error) {
      showToast(error?.response?.status?.message, "error");
    }
  };

  const getData = useCallback(async () => {
    try {
      const paramSend = {};
      const result = await fetchData(accessToken, API_ENDPOINTS.feeder.list, paramSend);
      setData(result?.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]); // Dependencies

  useEffect(() => {
    if (accessToken && loading) {
      getData();
    }
  }, [accessToken, loading, getData]); // Now `getData` is stable

  useEffect(() => {
    if (Array.isArray(data) && data.length && !isEqual(tableData, data)) {
      setTableData(data);
    }
  }, [data, tableData]);

  const TABLE_HEAD = useMemo(() => [
    { id: 'row', label: t('table.row'), width: 50 },
    { id: 'title', label: t('table.title') ?? "Title", width: 150 },
    { id: 'link', label: t('table.link') ?? "Link", width: 300 },
    { id: 'status', label: t('table.status') ?? "Status", width: 150 },
    { id: '', width: 88 },
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
  
  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 60 : 80;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound =
    (!dataFiltered.length && canReset) || (!productsStatus.loading && !dataFiltered.length);

  const handleFilters = useCallback(
    (name: string, value: FeederFilterValue) => {
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
      setDeleteLoadBtn(true);
      try {
        const endpoint = API_ENDPOINTS.feeder.delete(id);
        
        const result = await sendData(accessToken, endpoint);
        // setRefresh(prev => !prev); // Toggle state to trigger useEffect
        getData();
        const deleteRow = tableData.filter((row) => !table.selected.includes(id));
        setTableData(deleteRow);
        table.onUpdatePageDeleteRow(dataInPage.length);
        setDeleteLoadBtn(false);

        showToast(result?.status?.message, "success");

      } catch (error) {
        setDeleteLoadBtn(false);
        showToast(error?.response?.status?.message, "error");
      }
    },
    [dataInPage.length, table, tableData,accessToken,getData]
  );

  // Handle Edit Button Click
  const handleEditRow = (dataItem: FeederItem) => {
    setIsEditMode(true);
    setCurrentRecordId(dataItem?.unique_key);

    setFormData({
      title: dataItem?.title ?? "", 
      link: dataItem?.link ?? "", 
      interval: ""
    });  
  
  };

  const handleUpdateStatus = useCallback(
    async (id: string) => {
      try {
        const endpoint = API_ENDPOINTS.feeder.status(id);
      
        const result = await sendData(accessToken, endpoint);
        // setRefresh(prev => !prev); // Toggle state to trigger useEffect
        getData();
        showToast(result?.status?.message, "success");
      } catch (error) {
        showToast(error?.response?.status?.message, "error");
      }
    },
    [accessToken,getData]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const buttonText = t('section.submit'); // Default text

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

  const heading = `${t('section.manage')} ${t('feeder') ?? "Feeder"}`;


  return (
    <>
      <Toast open={open} message={message} severity={severity} onClose={() => setOpen(false)} />
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={heading}
          links={[
            { name: t('app') ?? "Dashboard", href: paths.dashboard.root },
            {
              name: t('feeder') ?? "Feeder",
              href: paths.dashboard.feeder.root,
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
            {/* Table Section */}
            <Card>
              <div>
                <FeederTableToolbar
                  filters={filters}
                  onFilters={handleFilters}
                  publishOptions={PUBLISH_OPTIONS}
                />

                {canReset && (
                  <FeederTableFiltersResult
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
                                <FeederTableRow
                                  key={row.unique_key}
                                  row={row}
                                  index={index}
                                  selected={table.selected.includes(row.unique_key)}
                                  deleteLoad={deleteLoadBtn}
                                  onDeleteRow={() => handleDeleteRow(row.unique_key)}
                                  onEditRow={() => handleEditRow(row)}
                                  onStatus={() => handleUpdateStatus(row.unique_key)}
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
                    title={isEditMode ? t('section.edit') ?? "Edit Entities" : t('section.add') ?? "Add Entities"}
                    sx={{ backgroundColor: "#f5f5f5",padding:2}}
                  />
                  <Box component="form" onSubmit={handleSubmit} sx={{p:2,maxHeight: '40vh', overflowY: 'auto',}}>

                    <TextField
                      fullWidth
                      label={t('feeder_section.form.title') ?? 'Title Feeder'}
                      name="title"
                      value={formDataReq.title}
                      onChange={handleTextFieldChange}
                      margin="normal"
                      required
                    />

                    <TextField
                      fullWidth
                      label={t('feeder_section.form.link') ?? 'Rss Link'}
                      name="link"
                      value={formDataReq.link}
                      onChange={handleTextFieldChange}
                      margin="normal"
                      style={{direction:"ltr"}}
                      required
                    />

                    <FormControl fullWidth margin="normal">
                      <InputLabel id="interval-label">{t('feeder_section.form.interval') ?? 'Interval'}</InputLabel>
                      <Select
                        labelId="interval-label"
                        name="interval"
                        value={formDataReq.interval}
                        onChange={handleTextFieldChange}
                        required
                      >
                        <MenuItem value="always">{t('feeder_section.interval.always') ?? 'مداوم'}</MenuItem>
                        <MenuItem value="hourly">{t('feeder_section.interval.hourly') ?? 'هر یک ساعت'}</MenuItem>
                        <MenuItem value="daily">{t('feeder_section.interval.daily') ?? 'روزانه'}</MenuItem>
                        <MenuItem value="weekly">{t('feeder_section.interval.weekly') ?? 'هفتگی'}</MenuItem>
                        <MenuItem value="monthly">{t('feeder_section.interval.monthly') ?? 'ماهانه'}</MenuItem>
                      </Select>
                    </FormControl>

                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      {buttonText}
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
  inputData: FeederItem[];
  comparator: (a: any, b: any) => number;
  filters: FeederFilters;
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

  return inputData;
}
