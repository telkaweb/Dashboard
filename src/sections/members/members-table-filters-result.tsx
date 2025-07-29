
import { useLocales } from 'src/locales';

// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack, { StackProps } from '@mui/material/Stack';
// types
import { MembersFilters, MembersFilterValue } from 'src/types/members';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = StackProps & {
  filters: MembersFilters;
  onFilters: (title: string, value: MembersFilterValue) => void;
  //
  onResetFilters: VoidFunction;
  //
  results: number;
};

export default function MembersTableFiltersResult({
  filters,
  onFilters,
  //
  onResetFilters,
  //
  results,
  ...other
}: Props) {
  // const handleRemoveStock = (inputValue: number) => {
  //   const newValue = filters.stock.filter((item) => item !== inputValue);
  //   onFilters('stock', newValue);
  // };
  const { t } = useLocales();

  // const handleRemovePublish = (inputValue: number) => {
  //   const newValue = filters.publish.filter((item) => item !== inputValue);
  //   onFilters('publish', newValue);
  // };
  const handleRemovePublish = (inputValue: number) => {
    const newValue = filters.publish.filter((item) => item !== inputValue);
    onFilters('publish', newValue.join(',')); // Convert array to comma-separated string
  };
  
  const PUBLISH_OPTIONS = [
    { value: 0, label: t('status.disable') ?? 'Disable' },
    { value: 1, label: t('status.enable') ?? 'Enable' },
    { value: 3, label: t('status.delete') ?? 'Delete' },
  ];

  return (
    <Stack spacing={1.5} {...other}>

      <Box sx={{ typography: 'body2' }}>
      {results === 0 ? (
          <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
            {t('table.result_not') ?? "No result found"}
          </Box>
        ) : (
          <>
            <strong>{results}</strong>
            <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
              {t('table.result_found') ?? "Result found:"}
            </Box>
          </>
        )}
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {/* {!!filters.stock.length && (
          <Block label="Stock:">
            {filters.stock.map((item) => (
              <Chip key={item} label={item} size="small" onDelete={() => handleRemoveStock(item)} />
            ))}
          </Block>
        )} */}

        {!!filters.publish.length && (
          <Block label={t('table.publish') ?? "Publish:"}>
            {filters.publish.map((item) => {
              const option = PUBLISH_OPTIONS.find((opt) => opt.value === item);
              const label = option ? option.label : item;
              return (
                <Chip
                  key={item}
                  label={label}
                  size="small"
                  onDelete={() => handleRemovePublish(item)}
                />
              );
            })}
          </Block>
        )}

        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          {t('table.delete') ?? "Clear :"}
        </Button>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

type BlockProps = StackProps & {
  label: string;
};

function Block({ label, children, sx, ...other }: BlockProps) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
        ...sx,
      }}
      {...other}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>

      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
}
