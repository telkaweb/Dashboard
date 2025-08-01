import { useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
// import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select, { SelectChangeEvent } from '@mui/material/Select';
// types
import { IProductTableFilters, IProductTableFilterValue } from 'src/types/product';
// components
import Iconify from 'src/components/iconify';
// import CustomPopover, { usePopover } from 'src/components/custom-popover';
// import { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------
import { useLocales } from 'src/locales';


type Props = {
  filters: IProductTableFilters;
  onFilters: (title: string, value: IProductTableFilterValue) => void;
  //
  // stockOptions: {
  //   value: string;
  //   label: string;
  // }[];
  publishOptions: {
    value: number;
    label: string;
  }[];
};

export default function ProductTableToolbar({
  filters,
  onFilters,
  //
  // stockOptions,
  publishOptions,
}: Props) {
  const { t } = useLocales();

  // const popover = usePopover();

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('title', event.target.value);
    },
    [onFilters]
  );

  // const handleFilterStock = useCallback(
  //   (event: SelectChangeEvent<string[]>) => {
  //     onFilters(
  //       'stock',
  //       typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
  //     );
  //   },
  //   [onFilters]
  // );

  // const handleFilterPublish = useCallback(
  //   (event: SelectChangeEvent<string[]>) => {
  //     onFilters(
  //       'publish',
  //       typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
  //     );
  //   },
  //   [onFilters]
  // );
  
  const handleFilterPublish = useCallback(
    (event: SelectChangeEvent<number[]>) => {
      onFilters(
        'publish',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        {/* <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel>Stock</InputLabel>

          <Select
            multiple
            value={filters.stock}
            onChange={handleFilterStock}
            input={<OutlinedInput label="Stock" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            sx={{ textTransform: 'capitalize' }}
          >
            {stockOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox
                  disableRipple
                  size="small"
                  checked={filters.stock.includes(option.value)}
                />
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl> */}

        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel>{t('content_table.publish') ?? "Publish"}</InputLabel>

          <Select
            multiple
            value={filters.publish}
            onChange={handleFilterPublish}
            input={<OutlinedInput label={t('content_table.selected') ?? "Selected"} />}
            renderValue={(selected) =>
              selected
                .map((value) => {
                  const option = publishOptions.find((opt) => opt.value === value);
                  return option ? option.label : value;
                })
                .join(', ')
            }
            sx={{ textTransform: 'capitalize' }}
          >
            {publishOptions.map((option) => (
              <MenuItem key={option.label} value={option.value}>
                <Checkbox
                  disableRipple
                  size="small"
                  checked={filters.publish.includes(option.value)}
                />
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.title}
            onChange={handleFilterName}
            placeholder={t('search') || "Search..."}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton> */}
        </Stack>
      </Stack>

      {/* <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:import-bold" />
          Import
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Export
        </MenuItem>
      </CustomPopover> */}
    </>
  );
}
