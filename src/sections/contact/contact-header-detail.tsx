// @mui
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
// types
import { IContactConversation } from 'src/types/contact';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

type Props = {
  participants: IContactConversation;
};

export default function ContactHeaderDetail({ participants }: Props) {

  const { t } = useLocales();

  return (
    <>
      <Stack flexGrow={1} direction="row" alignItems="center" spacing={2}>
        <Badge
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Avatar src={participants?.name} alt={participants?.name} />
        </Badge>

        <ListItemText
          primary={participants?.title 
            ? participants?.title 
            : `${t('inquiry')} ${participants?.product?.title}`}
        />


      </Stack>

      <Stack flexGrow={1} />
    </>
  );
}
