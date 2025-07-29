'use client';

import isEqual from 'lodash/isEqual';
import { useMemo,useState, useEffect, useCallback } from 'react';
import { useLocales } from 'src/locales';
import axios, { API_ENDPOINTS } from 'src/utils/axios';
// @mui
import { TextField, Box, CardHeader, Grid, Theme, TableContainer } from "@mui/material";
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Toast from "src/components/toast/Toast";
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'next/navigation';
// types
import { IFeature } from 'src/types/slider';
// components
import { useSettingsContext } from 'src/components/settings';
import {
  useTable,
  TablePaginationCustom,
  TableHeadCustom,
  TableSkeleton,
} from 'src/components/table';
import Scrollbar from 'src/components/scrollbar';
import Breadcrumb from 'src/layouts/shared/breadcrumb/Breadcrumb';
//
import { useProduct } from '../hooks';
import SliderFeatureRow from '../slider-table-feature-row';

// ----------------------------------------------------------------------

interface FormData {
  title: string;
  desc: string;
}

interface Feature {
  title?: string;
  desc?: string;
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

export function SliderFeatureListView() {
  const { t } = useLocales();
  
  const { id } = useParams();

  const table = useTable();

  const settings = useSettingsContext();

  const { productsStatus } = useProduct();

  const [tableData, setTableData] = useState<IFeature[]>([]);

  const [data, setData] = useState<Feature | []>([]);

  const [loading, setLoading] = useState(true);

  const [errorHandle, setError] = useState(null);

  const [open, setOpen] = useState(false);

  const [message, setMessage] = useState("");
  
  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const [formDataReq, setFormData] = useState<FormData>({
    title: "",
    desc: "",
  });

  // const [refresh, setRefresh] = useState(false); // State to trigger re-fetch

  const [isEditMode, setIsEditMode] = useState(false); // Track if the form is in edit mode
  const [currentRecordId, setCurrentRecordId] = useState<number | null>(null); // Record ID for edit

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
        let updatedData = [...tableData];

        if (currentRecordId !== null) {
            updatedData[currentRecordId] = formDataReq;
        } else {
            updatedData = [...tableData, formDataReq];
        }

        setTableData(updatedData);
        const endpoint = API_ENDPOINTS.slider.feature.add(id);
        const result = await sendData(accessToken, endpoint, { features: updatedData });
            
        setFormData({ title: "", desc: "" });
        getData();
        setIsEditMode(false);
        setCurrentRecordId(null);  
        showToast(result?.status?.message, "success");
    } catch (error) {
      showToast(error?.response?.status?.message, "error");
    }
  };

  const getData = useCallback(async () => {
    try {
      const result = await fetchData(accessToken, API_ENDPOINTS.slider.feature.list(id));
      setData(result?.data?.features ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken,id]); // Add any other dependencies that affect this function

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
    { id: 'name', label: t('table.title') ?? "Title", width:200 },
    { id: 'description', label: t('table.description') ?? "Description", width:250 },
    { id: '', width: 88 },
  ], [t]);
  
    const handleDeleteRow = useCallback(
    async (index: number) => {
        try {
            const updatedData = [...tableData];
            updatedData.splice(index, 1);
            setTableData(updatedData);

            const endpoint = API_ENDPOINTS.slider.feature.add(id); 
            const result = await sendData(accessToken, endpoint, { features: updatedData });

            getData();
            showToast(result?.status?.message, "success");
        } catch (error) {
            showToast(error?.response?.status?.message, "error");
        }
    },
    [tableData, accessToken, getData,id]
    );

  // Handle Edit Button Click
    const handleEditRow = (index: number) => {
        const item = tableData[index];
        setFormData({
            title: item.title ?? '',
            desc: item.desc ?? '',
        });
        setCurrentRecordId(index);
        setIsEditMode(true);
    };

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
      return t('feature_section.update') ?? "Update";
    }
  
    return t('feature_section.save');
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
          title={t('slider_section.feature') ?? "Slider Feature"}
          items={[
            {
              href: paths.dashboard.root,
              title: t('app') ?? "Dashboard"
            },
            {
              href: paths.dashboard.slider.root,
              title: t('slider') ?? "Slider"
            },
            {
              title: t('slider_section.feature_set') ?? "Slider Features"
            },
          ]}
          icon="features"
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
                <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                    <Scrollbar>
                    <Table size="medium" sx={{ minWidth: 960 }}>
                        <TableHeadCustom headLabel={TABLE_HEAD} rowCount={tableData.length} />
                        <TableBody>
                        {productsStatus.loading ? (
                            [...Array(10)].map((_, index) => (
                            <TableSkeleton key={index} />
                            ))
                        ) : (
                            tableData.map((row,index) => (
                                <SliderFeatureRow
                                  row={row}
                                  index={index}
                                  onDeleteRow={() => handleDeleteRow(index)}
                                  onEditRow={() => handleEditRow(index)}
                                />
                            ))
                        )}
                        </TableBody>
                    </Table>
                    </Scrollbar>
                </TableContainer>

                <TablePaginationCustom
                  count={tableData.length}
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
                    title={isEditMode ? t('feature_section.edit') ?? "Edit Details" : t('feature_section.add') ?? "Add Feature"}
                    sx={{ backgroundColor: "#f5f5f5",padding:2}}
                  />
                  <Box component="form" onSubmit={handleSubmit} sx={{p:2}}>
                    <TextField
                      fullWidth
                      label={t('feature_section.title') ?? "Feature Title"}
                      name="title"
                      value={formDataReq.title}
                      onChange={handleTextFieldChange}
                      margin="normal"
                      required
                    />
                    <TextField
                      fullWidth
                      label={t('feature_section.desc') ?? "Description"}
                      name="desc"
                      value={formDataReq.desc}
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
