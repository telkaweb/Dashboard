// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// import Rating from '@mui/material/Rating';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Card, { CardProps } from '@mui/material/Card';
// utils
import { fShortenNumber } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

type ItemProps = {
  unique_key?: string;
  title?: string;
  data:{
    price?: string;
  },
  cover:{
    path: string;
    name: string;
  },
  category:{
    name: string;
  },
  views_count?: number;
  created_at_fa?: string;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  list: ItemProps[];
}

export default function AppPopularContents({ title, subheader, list, ...other }: Props) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3, minWidth: 360 }}>
          {list.map((app) => (
            <ApplicationItem key={app.unique_key} app={app} />
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
}

// ----------------------------------------------------------------------

type ApplicationItemProps = {
  app: ItemProps;
};

function ApplicationItem({ app }: ApplicationItemProps) {
  const { t } = useLocales();
  const { created_at_fa,views_count,cover,data, title } = app;

  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{
      padding: 1.5,
      backgroundColor:'#f5f5f5',
      borderRadius:2,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'scale(1.02)', // Slightly scales up the box
        cursor: 'pointer', // Changes cursor to pointer
        opacity:0.8
      }
    }}>
      <Avatar
        variant="rounded"
        sx={{
          width: 48,
          height: 48,
          bgcolor: 'background.neutral',
        }}
      >
        <Box component="img" src={cover?.path} alt={cover?.name} />
      </Avatar>

      <Box 
        sx={{ 
          flexGrow: 1, 
          minWidth: 0,
        }}
      >
        <Typography variant="subtitle2" noWrap>
          {title}
        </Typography>

        <Stack direction="row" alignItems="center" sx={{ mt: 0.5, color: 'text.secondary' }}>
          {/* <Iconify
            width={14}
            icon='ic:baseline-category'
          /> */}

          {/* <Typography variant="caption" sx={{ ml: 0.5, mr: 1 }}>
            {category?.name}
          </Typography> */}

          <Label color='success' sx={{mr: 0.7}}>
            <Iconify
              width={14}
              icon='lets-icons:view-fill'
            />
            {t('review') ?? 'review'} {fShortenNumber(views_count ?? 0)}
          </Label>

          <Label color={data?.price ?? '' ? 'success' : 'error'}>
            <Iconify
              width={14}
              icon='mingcute:receive-money-fill'
            />
            {data?.price ?? '' ? data?.price : t('no_price')}
          </Label>

          <Label color='success' sx={{ml: 0.7}}>
            <Iconify
              width={14}
              icon='mingcute:time-fill'
            />
            {created_at_fa ?? '' ? created_at_fa : t('no_price')}
          </Label>

        </Stack>
      </Box>

    </Stack>
  );
}
