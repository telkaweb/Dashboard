// @mui
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { CardProps } from '@mui/material/Card';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import { fData } from 'src/utils/format-number';
// ----------------------------------------------------------------------
interface Folders {
  folder_name: string;
  file_count: number;
  folder_size: string;
}

interface Props extends CardProps {
  folder: Folders;
  selected?: boolean;
  getFolderFiles?: (id: string) => void;
}

export default function FileManagerFolderItem({
  folder,
  getFolderFiles,
  sx,
  ...other
}: Props) {

  const checkbox = useBoolean();

  const renderIcon =(
      <Box component="img" src="/assets/icons/files/ic_folder.svg" sx={{ width: 36, height: 36 }} />
    );

  const renderText = (
    <ListItemText
      primary={folder.folder_name}
      secondary={
        <>
          {fData(folder.folder_size)}
          <Box
            component="span"
            sx={{ mx: 0.75, width: 2, height: 2, borderRadius: '50%', bgcolor: 'currentColor' }}
          />
          {folder.file_count} files
        </>
      }
      primaryTypographyProps={{
        noWrap: true,
        typography: 'subtitle1',
      }}
      secondaryTypographyProps={{
        mt: 0.5,
        component: 'span',
        alignItems: 'center',
        typography: 'caption',
        color: 'text.disabled',
        display: 'inline-flex',
      }}
    />
  );

  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      alignItems="flex-start"
      sx={{
        p: 2.5,
        maxWidth: 222,
        borderRadius: 2,
        bgcolor: 'unset',
        cursor: 'pointer',
        position: 'relative',
        ...((checkbox.value) && {
          bgcolor: 'background.paper',
          boxShadow: (theme) => theme.customShadows.z20,
        }),
        ...sx,
      }}
      onClick={() => getFolderFiles?.(folder.folder_name)}
      {...other}
    >
      <Box onMouseEnter={checkbox.onTrue} onMouseLeave={checkbox.onFalse}>
        {renderIcon}
      </Box>

      {renderText}

    </Stack>
  );
}
