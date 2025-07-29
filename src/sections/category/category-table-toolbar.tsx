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
import { ICategoryTableFilters, ICategoryTableFilterValue } from 'src/types/category';
// components
import Iconify from 'src/components/iconify';
// import CustomPopover, { usePopover } from 'src/components/custom-popover';
// ----------------------------------------------------------------------
import { useLocales } from 'src/locales';


type Props = {
  filters: ICategoryTableFilters;
  onFilters: (name: string, value: ICategoryTableFilterValue) => void;
  //
  publishOptions: {
    value: number;
    label: string;
  }[];
};

export default function CategoryTableToolbar({
  filters,
  onFilters,
  //
  publishOptions,
}: Props) {
  const { t } = useLocales();

  // const popover = usePopover();

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

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

      <FormControl
        sx={{
          flexShrink: 0,
          width: { xs: 1, md: 200 },
        }}
      >
        <InputLabel>{t('category_table.publish') ?? "Publish"}</InputLabel>

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
          value={filters.name}
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

      </Stack>
    </Stack>
  );
}
