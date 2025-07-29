// @mui
import Alert from '@mui/material/Alert';
// import CheckIcon from '@mui/icons-material/Check';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card, { CardProps } from '@mui/material/Card';
// utils
import { rCurrency } from 'src/utils/format-number';
import { useLocales } from 'src/locales';
//
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title: string;
  sentAmount: number;
  setCount: number;
  currentBalance: number;
}

export default function SmsOperatorBalanced({
  title,
  sentAmount,
  setCount,
  currentBalance,
  sx,
  ...other
}: Props) {
  // const totalAmount = currentBalance - sentAmount;
  const { t } = useLocales();
  return (
    <Card sx={{ p: 3, ...sx }} {...other}>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>

      <Stack spacing={2}>
        <Alert icon={<Iconify
                width={20}
                icon='eva:wifi-outline'
                sx={{ ml: 0.5 }}
              />} severity="error">{t('balanced_section_not_success') ?? 'Online Details'}</Alert>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('count_send_message') ?? 'Count Send'}
          </Typography>
          <Typography variant="body2">
            {(setCount === 0 || setCount === null || Number.isNaN(setCount))
              ? t('no_send_sms') // Use your desired default text here
              : `${rCurrency(setCount)} ${t('prefix_money')}`
            }
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('price_send_sms') ?? 'All Send Price'}
          </Typography>
          <Typography variant="body2">
            {(sentAmount === 0 || sentAmount === null || Number.isNaN(sentAmount))
              ? t('no_send_sms') // Use your desired default text here
              : `${rCurrency(sentAmount)} ${t('prefix_money')}`
            }
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('current_balanced_sms') ?? 'Current Balanced'}
          </Typography>
          <Typography variant="subtitle1">
            {(currentBalance === 0 || currentBalance === null || Number.isNaN(currentBalance))
              ? t('not_balanced') // Use your desired default text here
              : `${rCurrency(currentBalance)} ${t('prefix_money')}`
            }
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <Button fullWidth variant="contained" color="primary">
            {t('add_balanced_sms_btn') ?? 'Add Balanced'}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
