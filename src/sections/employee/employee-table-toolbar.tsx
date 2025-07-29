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
import { IEmployeeTableFilters, IEmployeeTableFilterValue } from 'src/types/employee';
import { IPermisionItem } from 'src/types/permision';

// components
import Iconify from 'src/components/iconify';
// import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

type Props = {
  filters: IEmployeeTableFilters;
  onFilters: (name: string, value: IEmployeeTableFilterValue) => void;
  //
  roleOptions: IPermisionItem[];
};

export default function EmployeeTableToolbar({
  filters,
  onFilters,
  //
  roleOptions,
}: Props) {
  // const popover = usePopover();
  const { t } = useLocales();

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterRole = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      onFilters(
        'role',
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
        <InputLabel>{t('table.employee.role') ?? "Role"}</InputLabel>

        <Select
          multiple
          value={filters.role}
          onChange={handleFilterRole}
          input={<OutlinedInput label={t('table.employee.role') ?? "Role"} />}
          renderValue={(selected) => selected.map((value) => value).join(', ')}
          MenuProps={{
            PaperProps: {
              sx: { maxHeight: 240 },
            },
          }}
        >
          {roleOptions.map((option) => (
            <MenuItem key={option.id} value={option.name}>
              <Checkbox disableRipple size="small" checked={filters.role.includes(option.id)} />
              {option.name}
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
