import { useCallback } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import InputAdornment from '@mui/material/InputAdornment';
// types
import { IFileFilters, IFileFilterValue } from 'src/types/file';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import FileThumbnail from 'src/components/file-thumbnail';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

type Props = {
  // openDateRange: boolean;
  // onCloseDateRange: VoidFunction;
  // onOpenDateRange: VoidFunction;
  //
  filters: IFileFilters;
  onFilters: (name: string, value: IFileFilterValue) => void;
  //
  typeOptions: string[];
};

export default function FileManagerFilters({
  filters,
  onFilters,
  //
  typeOptions,
}: Props) {
  const { t } = useLocales();

  const popover = usePopover();

  const renderLabel = filters.type.length ? filters.type.slice(0, 2).join(',') : 'All type';

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterType = useCallback(
    (newValue: string) => {
      const checked = filters.type.includes(newValue)
        ? filters.type.filter((value) => value !== newValue)
        : [...filters.type, newValue];
      onFilters('type', checked);
    },
    [filters.type, onFilters]
  );

  const handleResetType = useCallback(() => {
    popover.onClose();
    onFilters('type', []);
  }, [onFilters, popover]);

  const renderFilterName = (
    <TextField
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
      sx={{
        width: { xs: 1, md: 260 },
      }}
    />
  );

  const renderFilterType = (
    <>
      <Button
        color="inherit"
        onClick={popover.onOpen}
        endIcon={
          <Iconify
            icon={popover.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
            sx={{ ml: -0.5 }}
          />
        }
      >
        {renderLabel}
        {filters.type.length > 2 && (
          <Label color="info" sx={{ ml: 1 }}>
            +{filters.type.length - 2}
          </Label>
        )}
      </Button>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ p: 2.5 }}>
        <Stack spacing={2.5}>
          <Box
            gap={1}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(4, 1fr)',
            }}
          >
            {typeOptions.map((type) => {
              const selected = filters.type.includes(type);

              return (
                <CardActionArea
                  key={type}
                  onClick={() => handleFilterType(type)}
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.08)}`,
                    ...(selected && {
                      bgcolor: 'action.selected',
                    }),
                  }}
                >
                  <Stack spacing={1} direction="row" alignItems="center">
                    <FileThumbnail file={type} />
                    <Typography variant={selected ? 'subtitle2' : 'body2'}>{type}</Typography>
                  </Stack>
                </CardActionArea>
              );
            })}
          </Box>

          <Stack spacing={1.5} direction="row" alignItems="center" justifyContent="flex-end">
            <Button variant="outlined" color="inherit" onClick={handleResetType}>
              {t('filter.clear') ?? "Clear"}
            </Button>

            <Button variant="contained" onClick={popover.onClose}>
              {t('filter.apply') ?? "Apply"}
            </Button>
          </Stack>
        </Stack>
      </CustomPopover>
    </>
  );

  return (
    <Stack
      spacing={1}
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      sx={{ width: 1 }}
    >
      {renderFilterName}

      <Stack spacing={1} direction="row" alignItems="center" justifyContent="flex-end" flexGrow={1}>
        {renderFilterType}
      </Stack>
    </Stack>
  );
}
