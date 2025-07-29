// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// types
import { IContactConversation } from 'src/types/contact';
// components
import Iconify from 'src/components/iconify';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

type Props = {
  participant: IContactConversation;
};

export default function ContactRoomSingle({ participant }: Props) {
  const collapse = useBoolean(true);

  const { t } = useLocales();

  const renderInfo = (
    <Stack alignItems="center" sx={{ py: 5 }}>
      <Avatar alt={participant?.name} src={participant?.name} sx={{ width: 96, height: 96, mb: 2 }} />
      <Typography variant="subtitle1">{`${participant?.name} ${participant?.family}`}</Typography>
    </Stack>
  );

  const renderBtn = (
    <ListItemButton
      onClick={collapse.onToggle}
      sx={{
        pl: 2.5,
        pr: 1.5,
        height: 40,
        flexShrink: 0,
        flexGrow: 'unset',
        typography: 'overline',
        color: 'text.secondary',
        bgcolor: 'background.neutral',
      }}
    >
      <Box component="span" sx={{ flexGrow: 1 }}>
        {t("info_contact") ?? "Information"}
      </Box>
      <Iconify
        width={16}
        icon={collapse.value ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
      />
    </ListItemButton>
  );

  const renderContent = (
    <Stack
      spacing={2}
      sx={{
        px: 2,
        py: 2.5,
        '& svg': {
          mr: 1,
          flexShrink: 0,
          color: 'text.disabled',
        },
      }}
    >
      <Stack direction="row">
        <Iconify icon="solar:phone-bold" />
        <Typography variant="body2">{participant?.mobile}</Typography>
      </Stack>

      <Stack direction="row">
        <Iconify icon="fluent:mail-24-filled" />
        <Typography variant="body2" noWrap>
          {participant?.email}
        </Typography>
      </Stack>


      {(participant?.city?.province?.name || participant?.city?.name) && (
        <Stack direction="row">
          <Iconify icon="fluent:location-24-filled" />
          <Typography variant="body2" noWrap>
            {participant?.city?.province?.name && participant?.city?.name
              ? `${participant.city.province.name} ${participant.city.name}`
              : participant?.city?.name || participant?.city?.province?.name}
          </Typography>
        </Stack>
      )}


    </Stack>
  );

  return (
    <>
      {renderInfo}

      {renderBtn}

      <div>
        <Collapse in={collapse.value}>{renderContent}</Collapse>
      </div>
    </>
  );
}
