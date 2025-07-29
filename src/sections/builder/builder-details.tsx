import { useState, useCallback } from 'react';
import { useLocales } from 'src/locales';

// @mui
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// components
import Scrollbar from 'src/components/scrollbar';

// Correct order: types should be before relative imports
import { ISectionTask } from 'src/types/sections';

import BuilderInputName from './builder-input-name';
import BuilderDetailsToolbar from './builder-details-toolbar';
import BuilderDetailsAttachments from './builder-details-attachments';


// ----------------------------------------------------------------------

const StyledLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: 100,
  flexShrink: 0,
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

// ----------------------------------------------------------------------

type Props = {
  task: ISectionTask;
  openDetails: boolean;
  onCloseDetails: VoidFunction;
  onDeleteTask: VoidFunction;
  addDetails: (params: { title: string; description?: string }) => void; // Fix here
};

export default function BuilderDetails({ task, openDetails, onCloseDetails, onDeleteTask,addDetails }: Props) {

  const [taskName, setTaskName] = useState(task.name);

  const like = useBoolean();

  const { t } = useLocales();

  const [taskDescription, setTaskDescription] = useState(task.description);

  const handleChangeTaskName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTaskName(event.target.value);
  }, []);

  const handleChangeTaskDescription = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTaskDescription(event.target.value);
  }, []);

  const onSendDetails: VoidFunction = () => {
    const params={
      title : taskName,
      description : taskDescription
    }
    addDetails(params)
  };  

  const renderHead = (
    <BuilderDetailsToolbar
      // liked={like.value}
      taskName={task.name}
      onLike={like.onToggle}
      onDelete={onDeleteTask}
      // taskStatus={task.status}
      onCloseDetails={onCloseDetails}
      onSendData={onSendDetails}
    />
  );

  const renderName = (
    <BuilderInputName placeholder="Task name" value={taskName} onChange={handleChangeTaskName} />
  );

  const renderDescription = (
    <Stack direction="row">
      <StyledLabel> {t("section.task.desc") ?? "Description"} </StyledLabel>

      <TextField
        fullWidth
        multiline
        size="small"
        value={taskDescription}
        onChange={handleChangeTaskDescription}
        InputProps={{
          sx: { typography: 'body2' },
        }}
      />
    </Stack>
  );

  const renderAttachments = (
    <Stack direction="row">
      <StyledLabel>{t("section.task.attach") ?? "Attachments"}</StyledLabel>
      <BuilderDetailsAttachments attachments={task.attachments} />
    </Stack>
  );

  return (
    <Drawer
      open={openDetails}
      onClose={onCloseDetails}
      anchor="right"
      slotProps={{
        backdrop: { invisible: true },
      }}
      PaperProps={{
        sx: {
          width: {
            xs: 1,
            sm: 480,
          },
        },
      }}
    >
      {renderHead}

      <Divider />

      <Scrollbar
        sx={{
          height: 1,
          '& .simplebar-content': {
            height: 1,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Stack
          spacing={3}
          sx={{
            pt: 3,
            pb: 5,
            px: 2.5,
          }}
        >
          {renderName}

          {renderDescription}

          {renderAttachments}
        </Stack>

      </Scrollbar>
    </Drawer>
  );
}
