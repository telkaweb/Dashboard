// import { formatDistanceToNowStrict } from 'date-fns';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
// types
import { IContactConversation } from 'src/types/contact';
//
// ----------------------------------------------------------------------

type Props = {
  message: IContactConversation;
  onOpenLightbox: (value: string) => void;
};

export default function ContactMessageItem({ message, onOpenLightbox }: Props) {

  const renderInfo = (
    <Typography noWrap variant="caption" sx={{ mb: 1, color: 'text.disabled' }}>
      {message.name}, &nbsp; {message?.created_at_fa}
    </Typography>
  );

  const renderBody = (
    <Stack
      sx={{
        p: 1.5,
        minWidth: 48,
        maxWidth: 320,
        borderRadius: 1,
        typography: 'body2',
        bgcolor: 'background.neutral',
        ...(message?.product?.cover && {
          p: 0,
          bgcolor: 'transparent',
        }),
      }}
    >
      {message?.product?.cover ? (
        <Box
          component="img"
          alt={message?.product?.cover?.name}
          src={message?.product?.cover?.path}
          onClick={() => onOpenLightbox(message?.product?.cover?.path ?? "")}
          sx={{
            minHeight: 220,
            borderRadius: 1.5,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.9,
            },
          }}
        />
      ) : (
        message?.description
      )}
    </Stack>
  );

  const renderActions = (
    <Stack
      direction="row"
      className="message-actions"
      sx={{
        pt: 0.5,
        opacity: 0,
        top: '100%',
        left: 0,
        position: 'absolute',
        transition: (theme) =>
          theme.transitions.create(['opacity'], {
            duration: theme.transitions.duration.shorter,
          }),
      }}
    />
  );
  

  return (
    <Stack direction="row" justifyContent='unset' sx={{ mb: 5 }}>
      <Avatar alt={message?.name} src={message?.name} sx={{ width: 32, height: 32, mr: 2 }} />

      <Stack alignItems="flex-end">
        {renderInfo}

        <Stack
          direction="row"
          alignItems="center"
          sx={{
            position: 'relative',
            '&:hover': {
              '& .message-actions': {
                opacity: 1,
              },
            },
          }}
        >
          {renderBody}
          {renderActions}
        </Stack>
      </Stack>
    </Stack>
  );
}
