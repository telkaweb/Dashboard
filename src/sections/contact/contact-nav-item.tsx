import { formatDistanceToNowStrict } from 'date-fns';
// @mui
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import { IContactConversation } from 'src/types/contact';
// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  collapse: boolean;
  onClickConversation: VoidFunction;
  conversation: IContactConversation;
};

export default function ContactNavItem({
  selected,
  collapse,
  conversation,
  onClickConversation,
}: Props) {
  // Extract data from API response
  const displayName = `${conversation.name} ${conversation.family}`;
  const displayText = conversation.email;
  const avatarUrl = conversation.product?.cover?.path || "/default-avatar.png";
  const lastActivity = conversation.created_at;

  return (
    <ListItemButton
      disableGutters
      onClick={onClickConversation}
      sx={{
        py: 1.5,
        px: 2.5,
        ...(selected && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      {/* Avatar */}
      <Badge overlap="circular">
        <Avatar alt={displayName} src={avatarUrl} sx={{ width: 48, height: 48 }} />
      </Badge>

      {!collapse && (
        <>
          <ListItemText
            sx={{ ml: 2 }}
            primary={displayName}
            primaryTypographyProps={{
              noWrap: true,
              variant: 'subtitle2',
            }}
            secondary={displayText}
            secondaryTypographyProps={{
              noWrap: true,
              component: 'span',
              variant: 'body2',
              color: 'text.secondary',
            }}
          />

          <Stack alignItems="flex-end" sx={{ ml: 2, height: 44 }}>
            <Typography
              noWrap
              variant="body2"
              component="span"
              sx={{
                mb: 1.5,
                fontSize: 12,
                color: 'text.disabled',
              }}
            >
              {formatDistanceToNowStrict(new Date(lastActivity), {
                addSuffix: false,
              })}
            </Typography>
          </Stack>
        </>
      )}
    </ListItemButton>
  );
}
