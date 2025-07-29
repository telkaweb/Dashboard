'use client';

// React and Third-party Libraries
import { useState, useEffect, useCallback, useMemo } from "react";
import isEqual from "lodash/isEqual";
import axios, { API_ENDPOINTS } from "src/utils/axios";
import { HOST_API } from "src/config-global";
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
import { PhotoCamera } from "@mui/icons-material";

// Project Imports (Absolute)
import Toast from "src/components/toast/Toast";
import { useDispatch } from "src/redux/store";
import { getProducts } from "src/redux/slices/product";
import { paths } from "src/routes/paths";
import { useParams, useRouter } from "src/routes/hook";
import { MembersItem, MembersFilters, MembersFilterValue } from "src/types/members";
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
import MembersTableFiltersResult from "../members-table-filters-result";
import MembersTableToolbar from "../members-table-toolbar";
import MembersTableRow from "../members-table-row";

import { useProduct } from "../hooks";

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
interface Work {
  start?: string; 
  end?: string;   
}

interface Information {
  agency_code?: number | string;  
  manager?: string;      
  address?: string;      
  tel?: string;          
  mobile?: string;       
  activity?: string;     
  work?: Work;           
  role?: string;         
}

interface FormData {
  name: string;
  description?: string;
  avatar_id?: string;   
  city_id?: string;
  data?: Information;
}

interface Members {
  unique_key: string;
  name: string;
  file:{
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

export default function MembersListView() {
  useInitial();
  
  const { t } = useLocales();
  
  const { section } = useParams();

  const router = useRouter();

  const table = useTable();

  const settings = useSettingsContext();

  const { productsStatus } = useProduct();

  const [tableData, setTableData] = useState<MembersItem[]>([]);

  const [filters, setFilters] = useState(defaultFilters);

  const [loadUpload, setLoadUpload] = useState(false);

  const [uploadSuccess, setUploadSuccess] = useState(false);

  const confirm = useBoolean();

  const [data, setData] = useState<Members | []>([]);

  const [loading, setLoading] = useState(true);

  const [sendReqLoad, setReqLoad] = useState(false);
  
  const [deleteLoadBtn,setDeleteLoadBtn]=useState(false);

  const [errorHandle, setError] = useState(null);

  const [open, setOpen] = useState(false);

  const [message, setMessage] = useState("");
  
  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const [preview, setPreview] = useState<string | null>(null);

  const [cities, setCities] = useState<any[]>([]);

  const initialFormData: FormData = {
    name: '',
    description: '',
    city_id: '',
    avatar_id: '',
    data: {
      agency_code: '',
      manager: '',
      address: '',
      tel: '',
      mobile: '',
      activity: '',
      work: {
        start: '',
        end: '',
      },
      role: '',
    }
  };

  const [formDataReq, setFormData] = useState<FormData>(initialFormData);

  function removeEmptyFields(obj: any): any {
    if (Array.isArray(obj)) {
      return obj
        .map(removeEmptyFields)
        .filter((item) => item !== undefined && item !== null && item !== '');
    }

    if (typeof obj === 'object' && obj !== null) {
      const cleaned: any = {};
      Object.entries(obj).forEach(([key, value]) => {
        const cleanedValue = removeEmptyFields(value);
        const isEmptyObject =
          typeof cleanedValue === 'object' &&
          !Array.isArray(cleanedValue) &&
          Object.keys(cleanedValue).length === 0;

        if (
          cleanedValue !== undefined &&
          cleanedValue !== null &&
          cleanedValue !== '' &&
          !isEmptyObject
        ) {
          cleaned[key] = cleanedValue;
        }
      });
      return cleaned;
    }

    return obj;
  }
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
    setReqLoad(true);
    try {
      const endpoint = isEditMode 
      ? API_ENDPOINTS.members.update(currentRecordId ?? "") 
      : API_ENDPOINTS.members.add(section);

      const { ...rest } = formDataReq;

      const formDataToSend = {
        ...rest,
        information: {
          agency_code: formDataReq.data?.agency_code ?? undefined,
          manager: formDataReq.data?.manager ?? undefined,
          address: formDataReq.data?.address ?? undefined,
          tel: formDataReq.data?.tel ?? undefined,
          mobile: formDataReq.data?.mobile ?? undefined,
          activity: formDataReq.data?.activity ?? undefined,
          work: {
            start: formDataReq.data?.work?.start ?? undefined,
            end: formDataReq.data?.work?.end ?? undefined,
          },
          role: formDataReq.data?.role ?? undefined,
        },
      };

      const result = await sendData(accessToken, endpoint, removeEmptyFields(formDataToSend));
      setFormData(initialFormData);
      getData();
      setPreview(null);
      setIsEditMode(false);
      setCurrentRecordId(null);  
      setReqLoad(false);
      showToast(result?.status?.message, "success");
    } catch (error) {
      setReqLoad(false);
      showToast(error?.response?.status?.message, "error");
    }
  };

  const getData = useCallback(async () => {
    try {
      const paramSend = {};
      const result = await fetchData(accessToken, API_ENDPOINTS.members.list(section), paramSend);
      setData(result?.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, section]); // Dependencies

  const getCities = useCallback(async () => {
    try {
      const paramSend = {};
      const result = await fetchData(accessToken, API_ENDPOINTS.cities, paramSend);
      setCities(result?.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]); // Dependencies

  useEffect(() => {
    if (accessToken && loading) {
      getData();
      getCities();
    }
  }, [accessToken, loading, getData,getCities]); // Now `getData` is stable

  useEffect(() => {
    if (Array.isArray(data) && data.length && !isEqual(tableData, data)) {
      setTableData(data);
    }
  }, [data, tableData]);

  const TABLE_HEAD = useMemo(() => {
    switch (section) {
      case 'teams':
        return [
          { id: 'row', label: t('table.row'), width: 50 },
          { id: 'name', label: t('table.name') ?? "Name", width: 150 },
          { id: 'role', label: t('table.role') ?? "Role", width: 120 },
          { id: 'status', label: t('table.status') ?? "Status", width: 100 },
          { id: '', width: 88 },
        ];
      case 'agent':
        return [
          { id: 'row', label: t('table.row'), width: 50 },
          { id: 'name', label: t('table.agent.name') ?? "Agent Name", width: 100 },
          { id: 'code', label: t('table.agent.code') ?? "Agent Code", width: 80 },
          { id: 'code', label: t('table.agent.city') ?? "City Activity", width: 80 },
          { id: 'manager', label: t('table.agent.manager') ?? "Manager Name", width: 100 },
          { id: 'tel', label: t('table.agent.tel') ?? "Agent Tell", width: 60 },
          { id: 'mobile', label: t('table.agent.mobile') ?? "Agent Mobile", width: 60 },
          { id: 'activity', label: t('table.agent.activity') ?? "Agent Activity", width: 100 },
          { id: 'work', label: t('table.agent.work') ?? "Agent Work", width: 100 },
          { id: 'status', label: t('table.status') ?? "Status", width: 50 },
          { id: '', width: 50 },
        ];
      default:
        return [
          { id: 'row', label: t('table.row') , width:50 },
          { id: 'name', label: t('table.name') ?? "Name", width:150 },
          { id: 'description', label: t('table.description') ?? "Description", width:300 },
          { id: 'status', label: t('table.status') ?? "Status", width: 150 },
          { id: '', width: 88 },
        ];
    }
  }, [t, section]);

  
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
            currentChunk +=1;
  
            // Update progress (optional)
            // const progress = Math.round((currentChunk / totalChunks) * 100);
  
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
            setFormData((prev) => ({ ...prev, avatar_id: finalizeResponse?.data?.unique_key }));
          })
          .catch((error) => {
            console.error('Error finalizing upload', error);
          });
      };

      console.log(uploadSuccess)
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

      e.target.value = '';

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
    (name: string, value: MembersFilterValue) => {
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
        const endpoint = API_ENDPOINTS.members.delete(id);
        
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
  const handleEditRow = (dataItem: MembersItem) => {
    setIsEditMode(true);
    setCurrentRecordId(dataItem?.unique_key);

    setFormData({
      name: dataItem?.name ?? "", 
      description: dataItem?.description ?? "", 
      city_id: dataItem?.city_id ?? "", 
      avatar_id: dataItem?.avatar?.path ?? "", 
      data: {
        agency_code: dataItem.data?.agency_code ?? undefined, 
        manager: dataItem.data?.manager ?? "", 
        address: dataItem.data?.address ?? "", 
        tel: dataItem.data?.tel ?? "", 
        mobile: dataItem.data?.mobile ?? "", 
        activity: dataItem.data?.activity ?? "", 
        work: {
          start: dataItem.data?.work?.start ?? undefined, 
          end: dataItem.data?.work?.end ?? undefined, 
        },
        role: dataItem.data?.role ?? "", 
      },
    });  
  
    setPreview(dataItem?.avatar?.path ?? null); // Assuming image is passed as a URL
  };

  const handleUpdateStatus = useCallback(
    async (id: string) => {
      try {
        const endpoint = API_ENDPOINTS.members.status(id);
      
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

  let buttonText = t('section.submit'); // Default text

  if (loadUpload) {
    buttonText = t('section.upload') ?? "Uploading...";
  } else if (isEditMode) {
    buttonText = t('section.save') ?? "Save";
  }

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

  const heading = `${t('section.manage')} ${t(section) ?? "Entities"}`;

  let content;

  if(section === 'teams'){
    content = (
      <TextField
        fullWidth
        label={t('section.role') ?? "Role Member"}
        name="data.role"
        value={formDataReq.data?.role || ''}
        onChange={handleTextFieldChange}
        margin="normal"
        required
      />
    );
  } else if (section === 'agent') {
    content = (
      <>
        <TextField
          fullWidth
          label={t('section_agent.agency_code') ?? "Agency Code"}
          name="data.agency_code"
          value={formDataReq.data?.agency_code || ''}
          onChange={handleTextFieldChange}
          margin="normal"
          required
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="city-select-label">
            {t('section_agent.city') ?? "City"}
          </InputLabel>

          <Select
            fullWidth
            label={t('section_agent.city') ?? "City"}
            labelId="city-select-label"
            id="city-select"
            name="city_id"
            value={formDataReq.city_id || ''}
            onChange={handleTextFieldChange}
          >
            {cities.map((city) => (
              <MenuItem key={city.unique_key} value={city.unique_key}>
                {city.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label={t('section_agent.manager') ?? "Manager"}
          name="data.manager"
          value={formDataReq.data?.manager || ''}
          onChange={handleTextFieldChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label={t('section_agent.address') ?? "Address"}
          name="data.address"
          value={formDataReq.data?.address || ''}
          onChange={handleTextFieldChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label={t('section_agent.tel') ?? "Tel"}
          name="data.tel"
          value={formDataReq.data?.tel || ''}
          onChange={handleTextFieldChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label={t('section_agent.mobile') ?? "Mobile"}
          name="data.mobile"
          value={formDataReq.data?.mobile || ''}
          onChange={handleTextFieldChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label={t('section_agent.activity') ?? "activity"}
          name="data.activity"
          value={formDataReq.data?.activity || ''}
          onChange={handleTextFieldChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label={t('section_agent.start') ?? "Start Work"}
          name="data.work.start"
          value={formDataReq.data?.work?.start || ''}
          onChange={handleTextFieldChange}
          margin="normal"
        />

        <TextField
          fullWidth
          label={t('section_agent.end') ?? "End Work"}
          name="data.work.end"
          value={formDataReq.data?.work?.end || ''}
          onChange={handleTextFieldChange}
          margin="normal"
        />
      </>
    );
  } else {
    content = (
      <TextField
        fullWidth
        label={t('section.description') ?? "Description"}
        name="description"
        value={formDataReq.description}
        onChange={handleTextFieldChange}
        margin="normal"
        multiline
        rows={4}
      />
    );
  }


  return (
    <>
      <Toast open={open} message={message} severity={severity} onClose={() => setOpen(false)} />
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={heading}
          links={[
            { name: t('app') ?? "Dashboard", href: paths.dashboard.root },
            {
              name: t(section) ?? "Entities",
              href: paths.dashboard.entities[section as keyof typeof paths.dashboard.entities],
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
                <MembersTableToolbar
                  filters={filters}
                  onFilters={handleFilters}
                  publishOptions={PUBLISH_OPTIONS}
                />

                {canReset && (
                  <MembersTableFiltersResult
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
                                <MembersTableRow
                                  key={row.unique_key}
                                  row={row}
                                  index={index}
                                  section={section}
                                  selected={table.selected.includes(row.unique_key)}
                                  deleteLoad={deleteLoadBtn}
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
                    title={isEditMode ? t('section.edit') ?? "Edit Entities" : t('section.add') ?? "Add Entities"}
                    sx={{ backgroundColor: "#f5f5f5",padding:2}}
                  />
                  <Box component="form" onSubmit={handleSubmit} sx={{p:2,maxHeight: '40vh', overflowY: 'auto',}}>
                    {section !== 'csr' && (
                      <Box display="flex" alignItems="center" gap={2} mt={2}>
                        <IconButton color="primary" component="label" sx={{padding:2,background:"#e3e3e3",borderRadius:1}}>
                          <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                          <PhotoCamera />
                        </IconButton>
                        {preview && <img src={preview} alt="Preview" width={100} height={100} style={{ borderRadius: 8 }} />}
                      </Box>
                    )}

                    <TextField
                      fullWidth
                      label={
                        section === 'agent'
                          ? t('section_agent.name') ?? 'Agency Name'
                          : t('section.name') ?? 'Name Member'
                      }
                      name="name"
                      value={formDataReq.name}
                      onChange={handleTextFieldChange}
                      margin="normal"
                      required
                    />

                    {content}

                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      fullWidth
                      disabled={loadUpload || sendReqLoad} // Disable if uploading image
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
  inputData: MembersItem[];
  comparator: (a: any, b: any) => number;
  filters: MembersFilters;
}) {
  const { name, publish } = filters; // Ensure name is always a string

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
