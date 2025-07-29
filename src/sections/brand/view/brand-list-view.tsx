'use client';

import isEqual from 'lodash/isEqual';
import { useMemo,useState, useEffect, useCallback } from 'react';
import { useLocales } from 'src/locales';
import axios, { API_ENDPOINTS } from 'src/utils/axios';
import { HOST_API } from 'src/config-global';
// @mui
import { TextField, Box, CardHeader, Grid, Theme } from "@mui/material";
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import { PhotoCamera } from '@mui/icons-material';
import TableContainer from '@mui/material/TableContainer';
import Toast from "src/components/toast/Toast";
// redux
import { useDispatch } from 'src/redux/store';
import { getProducts } from 'src/redux/slices/product';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// types
import { IBrand, IBrandTableFilters, IBrandTableFilterValue } from 'src/types/brand';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
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
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useProduct } from '../hooks';
import BrandTableRow from '../brand-table-row';
import BrandTableToolbar from '../brand-table-toolbar';
import BrandTableFiltersResult from '../brand-table-filters-result';

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
interface FormData {
  name: string;
  description: string;
  logo_id: string;
}

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

interface UploadResponse {
  fileName: string;
  fileId: string;
  data?:{
    unique_key:string;
  }
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

export default function BrandListView() {
  useInitial();
  const { t } = useLocales();

  const router = useRouter();

  const table = useTable();

  const settings = useSettingsContext();

  const { productsStatus } = useProduct();

  const [tableData, setTableData] = useState<IBrand[]>([]);

  const [filters, setFilters] = useState(defaultFilters);

  const [loadUpload, setLoadUpload] = useState(false);

  const [uploadSuccess, setUploadSuccess] = useState(false);

  const confirm = useBoolean();

  const [data, setData] = useState<Brand | []>([]);

  const [loading, setLoading] = useState(true);

  const [errorHandle, setError] = useState(null);

  const [open, setOpen] = useState(false);

  const [message, setMessage] = useState("");
  
  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const [preview, setPreview] = useState<string | null>(null);

  const [formDataReq, setFormData] = useState<FormData>({
    name: "",
    description: "",
    logo_id: "",
  });

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

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {

      const endpoint = isEditMode 
      ? API_ENDPOINTS.brand.update(currentRecordId ?? "") 
      : API_ENDPOINTS.brand.new;
    
      const result = await sendData(accessToken, endpoint, formDataReq);
    
      setFormData({ name: "", description: "", logo_id:"" });
      // setRefresh(prev => !prev); // Toggle state to trigger useEffect
      getData();
      setPreview(null);
      setIsEditMode(false);
      setCurrentRecordId(null);  
      showToast(result?.status?.message, "success");
    } catch (error) {
      showToast(error?.response?.status?.message, "error");
    }
  };

  const getData = useCallback(async () => {
    try {
      const paramSend = {
        type: 2,
      };
      const result = await fetchData(accessToken, API_ENDPOINTS.brand.all, paramSend);
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
  
  useEffect(() => {
    if (Array.isArray(data) && data.length && !isEqual(tableData, data)) {
      setTableData(data);
    }
  }, [data, tableData]);


  const TABLE_HEAD = useMemo(() => [
    { id: 'row', label: t('table.row') , width:50 },
    { id: 'name', label: t('brand_table.name') ?? "Name", width:200 },
    { id: 'description', label: t('brand_table.description') ?? "Description", width:250 },
    { id: 'status', label: t('brand_table.status') ?? "Status", width: 150 },
    { id: 'create_at', label: t("brand_table.create_at") ?? "Create at", width: 160 },
    { id: '', width: 88 },
  ], [t]);

  
  const PUBLISH_OPTIONS = [
    { value: 0, label: t('status.disable') ?? 'Disable' },
    { value: 1, label: t('status.enable') ?? 'Enable' },
    { value: 3, label: t('status.delete') ?? 'Delete' },
  ];

  const handleUploadMedia = async (file: File): Promise<void> => {
    if (!(file instanceof File)) {
      console.error('Invalid file object');
      return;
    }
  
    try {
      const chunkSize = 500 * 1024; // 500KB chunks
      const totalChunks = Math.ceil(file.size / chunkSize); // Total number of chunks
      let currentChunk = 0; // To track the chunk being uploaded
  
      // Upload each chunk of the file
      const uploadNextChunk = () => {
        if (currentChunk >= totalChunks) {
          // All chunks uploaded, finalize the upload
          console.log('All chunks uploaded, finalizing...');
          
          // Finalize the upload once all chunks are uploaded
          onSuccess({
            fileName: file.name,
            fileId: 'unique-file-id', // Placeholder for actual file ID from backend response
          });
  
          return;
        }
  
        const start = currentChunk * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
  
        // Slice the current chunk from the file
        const chunk = file.slice(start, end);
  
        // Prepare form data for the chunk
        const formData = new FormData();
        formData.append('file_chunk', chunk);
        formData.append('chunk_number', currentChunk.toString());
        formData.append('file_name', file.name);
        formData.append('chunk_size', chunkSize.toString());
        formData.append('file_size', file.size.toString());
  
        // Upload the chunk to the server
        fetch(HOST_API + API_ENDPOINTS.upload.chunk, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        })
          .then((response) => response.json())
          .then((dataChunk: UploadResponse) => {
            console.log('Chunk uploaded:', dataChunk);
            currentChunk += 1;
  
            // Update progress (optional)
            const progress = Math.round((currentChunk / totalChunks) * 100);
            console.log(`Progress: ${progress}%`);
  
            // Continue uploading next chunk
            uploadNextChunk();
          })
          .catch((error) => {
            console.error('Chunk upload failed:', error);
          });
      };
  
      // Start the chunk upload
      uploadNextChunk();
  
      // Handle finalization once all chunks are uploaded
      const onSuccess = (response: UploadResponse) => {
        console.log('Upload complete', response);
  
        // Notify backend to finalize the upload after all chunks are uploaded
        fetch(HOST_API + API_ENDPOINTS.upload.complete, {
          method: 'POST',
          body: JSON.stringify({
            file_name: response.fileName, // Send the fileName to backend
            fileId: response.fileId, // Assuming the response includes fileId
          }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        })
          .then((res) => res.json())
          .then((finalizeResponse) => {
            setLoadUpload(false);
            setUploadSuccess(true);
            setFormData((prev) => ({ ...prev, logo_id: finalizeResponse?.data?.unique_key }));
          })
          .catch((error) => {
            console.error('Error finalizing upload', error);
          });
      };
    } catch (error) {
      console.error('Error during file upload:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Start the file upload and show loading button
      setLoadUpload(true);
      setUploadSuccess(false); // Reset upload success on new file

      handleUploadMedia(file);
      setPreview(URL.createObjectURL(file));
    }
  };

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
    (name: string, value: IBrandTableFilterValue) => {
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
        const endpoint = API_ENDPOINTS.brand.delete(id);
      
        const result = await sendData(accessToken, endpoint);
        // setRefresh(prev => !prev); // Toggle state to trigger useEffect
        getData();
        showToast(result?.status?.message, "success");
        const deleteRow = tableData.filter((row) => row.id !== id);
        setTableData(deleteRow);
        table.onUpdatePageDeleteRow(dataInPage.length);
  
      } catch (error) {
        showToast(error?.response?.status?.message, "error");
      }
    },
    [dataInPage.length, table, tableData,accessToken,getData]
  );

  // Handle Edit Button Click
  const handleEditRow = (brandData: IBrand) => {
    setIsEditMode(true);
    setCurrentRecordId(brandData?.unique_key);
    setFormData({
      name: brandData.name,
      description: brandData?.description,
      logo_id: "", // Handle image differently if needed (e.g., image URL, file)
    });
    setPreview(brandData?.logo?.path); // Assuming image is passed as a URL
  };
  

  const handleUpdateStatus = useCallback(
    async (id: string) => {
      try {
        const endpoint = API_ENDPOINTS.brand.status(id);
      
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

  if (errorHandle) return (
    <Container 
      maxWidth={settings.themeStretch ? false : 'xl'}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
    >
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{t('error_data') ?? 'Error Fetching...'}</p>
    </Container>
  );

  const getButtonLabel = () => {
    if (loadUpload) {
      return t('section.upload') ?? "Uploading...";
    }
  
    if (isEditMode) {
      return t('brand_section.save') ?? "Save";
    }
  
    if (uploadSuccess) {
      return t('brand_section.submit');
    }
  
    return t('brand_section.submit');
  };
  
  
  return (
    <>
      <Toast open={open} message={message} severity={severity} onClose={() => setOpen(false)} />
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={t('brand_section.head_title') ?? "Brand"}
          links={[
            { name: t('app') ?? "Dashboard", href: paths.dashboard.root },
            {
              name: t('brand') ?? "Brand",
              href: paths.dashboard.brand.root,
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
                <BrandTableToolbar
                  filters={filters}
                  onFilters={handleFilters}
                  publishOptions={PUBLISH_OPTIONS}
                />

                {canReset && (
                  <BrandTableFiltersResult
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
                                <BrandTableRow
                                  key={row.unique_key}
                                  row={row}
                                  index={index}
                                  selected={table.selected.includes(row.unique_key)}
                                  onSelectRow={() => table.onSelectRow(row.unique_key)}
                                  onDeleteRow={() => handleDeleteRow(row.unique_key)}
                                  onEditRow={() => handleEditRow(row)}
                                  onStatus={() => handleUpdateStatus(row.unique_key)}
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

            {/* Form Section */}
            <div>
              <Card>
                <Grid xs={12} md={8}>
                  <CardHeader
                    title={isEditMode ? t('brand_section.edit_brand') ?? "Edit Details" : t('brand_section.add_brand') ?? "Add brand"}
                    sx={{ backgroundColor: "#f5f5f5",padding:2}}
                  />
                  <Box component="form" onSubmit={handleSubmit} sx={{p:2}}>
                    <Box display="flex" alignItems="center" gap={2} mt={2}>
                      <IconButton color="primary" component="label" sx={{padding:2,background:"#e3e3e3",borderRadius:1}}>
                        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                        <PhotoCamera />
                      </IconButton>
                      {preview && <img src={preview} alt="Preview" width={100} height={100} style={{ borderRadius: 8 }} />}
                    </Box>
                    <TextField
                      fullWidth
                      label={t('brand_section.name') ?? "Name Brand"}
                      name="name"
                      value={formDataReq.name}
                      onChange={handleTextFieldChange}
                      margin="normal"
                      required
                    />
                    <TextField
                      fullWidth
                      label={t('brand_section.description') ?? "Description"}
                      name="description"
                      value={formDataReq.description}
                      onChange={handleTextFieldChange}
                      margin="normal"
                      multiline
                      rows={4}
                    />
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        fullWidth
                        disabled={loadUpload} // Disable if uploading image
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
  inputData: IBrand[];
  comparator: (a: any, b: any) => number;
  filters: IBrandTableFilters;
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

  console.log(publish)

  return inputData;
}
