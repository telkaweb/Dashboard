// @mui
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
// import IconButton from '@mui/material/IconButton';
import Card, { CardProps } from '@mui/material/Card';
import TableContainer from '@mui/material/TableContainer';
// utils
import { useLocales } from 'src/locales';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { TableHeadCustom } from 'src/components/table';

// ----------------------------------------------------------------------


interface RowProps {
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
  status:string;
}

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}

export default function AppNewProducts({
  title,
  subheader,
  tableData,
  tableLabels,
  ...other
}: Props) {
  const { t } = useLocales();

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar>
          <Table sx={{ minWidth: 680 }}>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody>
              {tableData.map((row,index) => (
                <AppNewProductRow key={row.unique_key} row={row} index={index} />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          size="small"
          color="inherit"
          endIcon={<Iconify icon="eva:arrow-ios-back-fill" width={18} sx={{ ml: -0.5 }} />}
        >
          {t('table.view_all') ?? 'View All'}
        </Button>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

type AppNewProductRowProps = {
  row: RowProps;
  index: number;
};

function AppNewProductRow({ row,index }: AppNewProductRowProps) {
  const { t } = useLocales();

  const popover = usePopover();

  const handleDownload = () => {
    popover.onClose();
    console.info('DOWNLOAD', row.unique_key);
  };

  const handlePrint = () => {
    popover.onClose();
    console.info('PRINT', row.unique_key);
  };

  const handleShare = () => {
    popover.onClose();
    console.info('SHARE', row.unique_key);
  };

  const handleDelete = () => {
    popover.onClose();
    console.info('DELETE', row.unique_key);
  };

  type StatusType = 0 | 1 | 2 | 3;


  const statusMapping: Record<StatusType, { text: string; color: 'error' | 'success' | 'warning' | 'default' }> = {
    0: { text: t('status.diasble'), color: 'error' },
    1: { text: t('status.enable'), color: 'success' },
    2: { text: t('status.draft'), color: 'warning' },
    3: { text: t('status.delete'), color: 'error' },
  };

  const status = Number(row.status);
  const isValidStatus = [0, 1, 2, 3].includes(status);

  return (
    <>
      <TableRow>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{row.title}</TableCell>
        <TableCell>{row.category.name}</TableCell>
        <TableCell>{row.data?.price}</TableCell>
        <TableCell>{row.created_at_fa}</TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={isValidStatus ? statusMapping[status as StatusType].color : 'default'}
            >
            {isValidStatus ? statusMapping[status as StatusType].text : 'Unknown'}
          </Label>
        </TableCell>

        {/* <TableCell align="right" sx={{ pr: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell> */}
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem onClick={handleDownload}>
          <Iconify icon="eva:cloud-download-fill" />
          Download
        </MenuItem>

        <MenuItem onClick={handlePrint}>
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>

        <MenuItem onClick={handleShare}>
          <Iconify icon="solar:share-bold" />
          Share
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>
    </>
  );
}
