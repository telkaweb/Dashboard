// @mui
import { alpha } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import ButtonBase from '@mui/material/ButtonBase';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  priority: number; // Update to accept a number
  onChangePriority: (newValue: number) => void; // Update to expect a number
};

export default function BuilderDetailsPriority({ priority, onChangePriority }: Props) {
  // Map string values to number values
  const priorityMap: { [key: string]: number } = {
    low: 1,
    medium: 2,
    hight: 3,
  };

  return (
    <Stack direction="row" flexWrap="wrap" spacing={1}>
      {['low', 'medium', 'hight'].map((option) => (
        <ButtonBase
          key={option}
          onClick={() => onChangePriority(priorityMap[option])} // Pass number instead of string
          sx={{
            py: 0.5,
            pl: 0.75,
            pr: 1.25,
            fontSize: 12,
            borderRadius: 1,
            lineHeight: '20px',
            textTransform: 'capitalize',
            fontWeight: 'fontWeightBold',
            boxShadow: (theme) => `inset 0 0 0 1px ${alpha(theme.palette.grey[500], 0.24)}`,
            ...(priority === priorityMap[option] && {
              boxShadow: (theme) => `inset 0 0 0 2px ${theme.palette.text.primary}`,
            }),
          }}
        >
          <Iconify
            icon={
              (option === 'low' && 'solar:double-alt-arrow-down-bold-duotone') ||
              (option === 'medium' && 'solar:double-alt-arrow-right-bold-duotone') ||
              'solar:double-alt-arrow-up-bold-duotone'
            }
            sx={{
              mr: 0.5,
              ...(option === 'low' && {
                color: 'info.main',
              }),
              ...(option === 'medium' && {
                color: 'warning.main',
              }),
              ...(option === 'hight' && {
                color: 'error.main',
              }),
            }}
          />

          {option}
        </ButtonBase>
      ))}
    </Stack>
  );
}
