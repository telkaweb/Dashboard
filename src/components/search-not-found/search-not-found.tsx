import Typography from '@mui/material/Typography';
import Paper, { PaperProps } from '@mui/material/Paper';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

interface Props extends PaperProps {
  query?: string;
}

export default function SearchNotFound({ query, sx, ...other }: Props) {
  const { t } = useLocales();

  return query ? (
    <Paper
      sx={{
        bgcolor: 'unset',
        textAlign: 'center',
        ...sx,
      }}
      {...other}
    >
      <Typography variant="h6" gutterBottom>
      {t('searchNotFound.title')}
      </Typography>

      <Typography variant="body2">
        {t('searchNotFound.message', { query })}
      </Typography>
    </Paper>
  ) : (
    <Typography variant="body2" sx={sx}>
      {t('searchNotFound.placeholder')}
    </Typography>
  );
}
