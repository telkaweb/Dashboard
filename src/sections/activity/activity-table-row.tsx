// @mui
import Link from '@mui/material/Link';
// import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
// import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// types
import { ACtivity } from 'src/types/activity';
// hooks
// import { useBoolean } from 'src/hooks/use-boolean';
// components
import { useLocales } from 'src/locales';
// import Label from 'src/components/label';
// import Iconify from 'src/components/iconify';
// import { usePopover } from 'src/components/custom-popover';
import DeviceAvatar from './DeviceAvatar';

// ----------------------------------------------------------------------

type Props = {
  row: ACtivity;
  selected: boolean;
  index: number;
  onViewRow: VoidFunction;
  onSelectRow: VoidFunction;
};

export default function BrandTableRow({
  row,
  selected,
  index,
  onSelectRow,
  onViewRow,
}: Props) {
  const {
    platform,
    device,
    ip,
    // user_agent,
    activities,
    // data,
    user,
    // status,
    // created_at,
    created_at_fa,
  } = row;

  // const confirm = useBoolean();

  // const popover = usePopover();
  const { t } = useLocales();

  return (
      <TableRow hover selected={selected}>
        <TableCell sx={{textAlign:"center"}}>{index + 1}</TableCell>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <DeviceAvatar platform={platform} />

          <ListItemText
            disableTypography
            primary={
              <Link
                noWrap
                color="inherit"
                variant="subtitle2"
                sx={{ cursor: 'pointer' }}
              >
                {device}
              </Link>
            }
          />
        </TableCell>

        <TableCell>
          <ListItemText sx={{textAlign:"center"}}>
            {platform}
          </ListItemText>
        </TableCell>

        <TableCell>
          <ListItemText sx={{textAlign:"center"}}>
            {ip}
          </ListItemText>
        </TableCell>

        <TableCell>
          <ListItemText sx={{textAlign:"center"}}>
            {user ? user.name : t('activity_table.guest') ?? "Guest"}
          </ListItemText>
        </TableCell>

        <TableCell>
          <ListItemText sx={{textAlign:"center"}}>
          URL : {activities?.route?.url} <br/>
          Body : {JSON.stringify(activities?.route?.data, null, 2)}
          </ListItemText>
        </TableCell>

        <TableCell>
          <ListItemText sx={{textAlign:"center"}}>
            {activities?.route?.method}
          </ListItemText>
        </TableCell>

        <TableCell>
          <ListItemText
            primary={created_at_fa}
            // secondary={created_at_fa}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>

      </TableRow>
  );
}
