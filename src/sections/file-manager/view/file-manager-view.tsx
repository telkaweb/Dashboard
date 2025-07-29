'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import axios, { API_ENDPOINTS } from 'src/utils/axios';
import { useLocales } from 'src/locales';
import Toast from 'src/components/toast/Toast';
// @mui
import { Box, Collapse, Divider } from '@mui/material';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
// _mock
import { FILE_TYPE_OPTIONS } from 'src/_mock';
// types
import { IFile, IFileFilters, IFileFilterValue } from 'src/types/file';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { fileFormat } from 'src/components/file-thumbnail';
import { useSettingsContext } from 'src/components/settings';
import { useTable, getComparator } from 'src/components/table';
//
import FileManagerFilters from '../file-manager-filters';
import FileManagerGridView from '../file-manager-grid-view';
import FileManagerFiltersResult from '../file-manager-filters-result';
import FileManagerNewFolderDialog from '../file-manager-new-folder-dialog';
import FileManagerPanel from '../file-manager-panel';
import FileManagerFolderItem from '../file-manager-folder-item';

// ----------------------------------------------------------------------

const defaultFilters = {
  name: '',
  type: [],
};

interface Folders {
  folder_name: string;
  file_count: number;
  folder_size: string;
}

interface Files {
  unique_key: string;
  name: string;
  path: string;
  extension: string;
  size: string;
}

// ----------------------------------------------------------------------
export const fetchData = async (accessToken: string | null,endPoint: string,method: 'GET' | 'POST' = 'GET',params = {}) => {
  try {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const response = 
    method === 'GET'
      ? await axios.get(endPoint, { params })
      : await axios.post(endPoint, params );

    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

export default function FileManagerView() {
  const table = useTable({ defaultRowsPerPage: 10 });

  const { t } = useLocales();

  const settings = useSettingsContext();

  // const openDateRange = useBoolean();

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const confirm = useBoolean();

  const upload = useBoolean();

  const [view, setView] = useState('grid');
  
  const newFolder = useBoolean();

  const containerRef = useRef(null);

  const folder = useBoolean();

  const [filters, setFilters] = useState(defaultFilters);

  const [open, setOpen] = useState(false);

  const [message, setMessage] = useState("");

  const [folderSelected,setFolderSelected] = useState("");
  
  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  const [folders, setFolderList] = useState<Folders[]>([]);

  const [files, setFiles] = useState<Files[]>([]);

  const [loading, setLoading] = useState(true);

  const [errorHandle, setError] = useState(null);

  const showToast = (msg: string, level: "success" | "error" | "info" | "warning") => {
    setMessage(msg);
    setOpen(true);
    setSeverity(level);
    setTimeout(() => {
      setOpen(false);
    }, 3000);
  };

  const getData = useCallback(
    async (endPoint: string, setState: React.Dispatch<React.SetStateAction<any>>, folderName?: string) => {
      try {
        const paramSend = folderName ? { folder: folderName } : {};
        const result = await fetchData(accessToken, endPoint, 'GET', paramSend);
        setState(result?.data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [accessToken] // Dependencies
  );  
  
  useEffect(() => {
    if (accessToken && loading) {
      getData(API_ENDPOINTS.file.folder,setFolderList);
    }
  }, [accessToken, loading,getData]);

  const dataFiltered = applyFilter({
    inputData: files,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const canReset =
    !!filters.name || !!filters.type.length;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleChangeView = useCallback(
    (event: React.MouseEvent<HTMLElement>, newView: string | null) => {
      if (newView !== null) {
        setView(newView);
      }
    },
    []
  );

  const handleFilters = useCallback(
    (name: string, value: IFileFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleDeleteItem = useCallback(
    async (id: string) => {
      try {
        const endPoint=API_ENDPOINTS.file.delete(id);
        const result = await fetchData(accessToken,endPoint,'POST',{});
        showToast(result?.status?.message,"success");
      } catch (err) {
        showToast(err?.status?.message,"error");
      } finally {
        const deleteRow = files.filter((row) => row.unique_key !== id);
        setFiles(deleteRow);
        table.onUpdatePageDeleteRow(dataInPage.length);  
      }
    },
    [dataInPage.length, table, files,accessToken]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);


  const handleFolderFiles = (id: string) => {
    setFiles([]);
    setFolderSelected(id);
    getData(API_ENDPOINTS.file.list,setFiles,id);
  };

  const renderFilters = (
    <Stack
      spacing={2}
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-end', md: 'center' }}
    >
      <FileManagerFilters
        // openDateRange={openDateRange.value}
        // onCloseDateRange={openDateRange.onFalse}
        // onOpenDateRange={openDateRange.onTrue}
        //
        filters={filters}
        onFilters={handleFilters}
        //
        typeOptions={FILE_TYPE_OPTIONS}
      />

      <ToggleButtonGroup size="small" value={view} exclusive onChange={handleChangeView}>
        <ToggleButton value="grid">
          <Iconify icon="mingcute:dot-grid-fill" />
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );

  const renderResults = (
    <FileManagerFiltersResult
      filters={filters}
      onResetFilters={handleResetFilters}
      //
      canReset={canReset}
      onFilters={handleFilters}
      //
      results={dataFiltered.length}
    />
  );

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
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">{t('file-manager.head') ?? "File Manager"}</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:cloud-upload-fill" />}
            onClick={upload.onTrue}
          >
            {t('file-manager.upload') ?? "Upload"}
          </Button>
        </Stack>

        <Stack
          spacing={2.5}
          sx={{
            my: { xs: 3, md: 5 },
          }}
        >
          {renderFilters}

          {canReset && renderResults}
        </Stack>

        <Box ref={containerRef}>
          <FileManagerPanel
            title={t('file-manager.folders') ?? "Folders"}
            subTitle={`${folders.length} ${t('file-manager.folder') ?? "folders"}`}
            onOpen={newFolder.onTrue}
            collapse={folder.value}
            onCollapse={folder.onToggle}
          />

          <Collapse in={!folder.value} unmountOnExit>
            <Box
              gap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              }}
            >
              {folders
                .map((folderItem) => (
                  <FileManagerFolderItem
                    key={folderItem.folder_name}
                    folder={folderItem}
                    getFolderFiles={handleFolderFiles}
                    sx={{ maxWidth: 'auto' }}
                  />
                ))}
            </Box>
          </Collapse>

          <Divider sx={{ my: 5, borderStyle: 'dashed' }} />
        </Box>

        {notFound ? (
          <EmptyContent
            filled
            title={t('filter.notdata') ?? "No Data"}
            sx={{
              py: 10,
            }}
          />
        ) : (
          <FileManagerGridView
            table={table}
            data={files}
            dataFiltered={dataFiltered}
            onDeleteItem={handleDeleteItem}
            onOpenConfirm={confirm.onTrue}
          />
        )}

      </Container>

      <FileManagerNewFolderDialog folder={folderSelected} title={t('file-manager.upload') ?? "Upload File"} open={upload.value} onClose={upload.onFalse} />

    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: IFile[];
  comparator: (a: any, b: any) => number;
  filters: IFileFilters;
}) {
  const { name, type } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (file) => file.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (type.length) {
    inputData = inputData.filter((file) => type.includes(fileFormat(file.extension)));
  }

  return inputData;
}
