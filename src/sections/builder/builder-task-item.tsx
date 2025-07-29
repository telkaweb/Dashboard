import { Draggable } from '@hello-pangea/dnd';
// @mui
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Image from 'src/components/image';
import Iconify from 'src/components/iconify';

// types
import { ISectionTask } from 'src/types/sections'; // This comes before the relative imports

// relative imports
import BuilderDetails from './builder-details'; // This comes after the types


// ----------------------------------------------------------------------

type Props = {
  index: number;
  task: ISectionTask;
  onDeleteTask: (id: string) => void;
  addTaskDetail: (id: string,params: { title: string; description?: string }) => void; // Fix here
};

export default function BuilderTaskItem({ task, onDeleteTask, index,addTaskDetail }: Props) {
  const details = useBoolean();

  const addDetails = (params: { title: string; description?: string }) => {
    addTaskDetail(task.id,params);
  };

  const renderPriority = (
    <Iconify
      icon={
        (task.sort === 3 && 'solar:double-alt-arrow-down-bold-duotone') || // low priority (3)
        (task.sort === 2 && 'solar:double-alt-arrow-right-bold-duotone') || // medium priority (2)
        'solar:double-alt-arrow-up-bold-duotone' // high priority (1)
      }
      sx={{
        position: 'absolute',
        top: 4,
        right: 4,
        ...(task.sort === 3 && {
          color: 'info.main',
        }),
        ...(task.sort === 2 && {
          color: 'warning.main',
        }),
        ...(task.sort === 1 && {
          color: 'error.main',
        }),
      }}
    />
  );

  const renderImg = (
    <Box
      sx={{
        p: (theme) => theme.spacing(1, 1, 0, 1),
      }}
    >
      {task.attachments?.length > 0 && (
        <Image
          disabledEffect
          alt={task.attachments[0].name}
          src={task.attachments[0].path}
          ratio="4/3"
          sx={{
            borderRadius: 1.5,
            ...(details.value && {
              opacity: 0.8,
            }),
          }}
        />
      )}

    </Box>
  );

  const renderInfo = (
    <>
      {task.attachments?.length > 0 && (
        <Stack direction="row" alignItems="center">
          <Stack
            flexGrow={1}
            direction="row"
            alignItems="center"
            sx={{
              typography: 'caption',
              color: 'text.disabled',
            }}
          >

            <Iconify width={16} icon="eva:attach-2-fill" sx={{ mr: 0.25 }} />
            <Box component="span">{task.attachments.length}</Box>
          </Stack>
        </Stack>
      )}
    </>
  );

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided) => (
          <Paper
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={details.onTrue}
            sx={{
              width: 1,
              borderRadius: 1.5,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: (theme) => theme.customShadows.z1,
              '&:hover': {
                boxShadow: (theme) => theme.customShadows.z20,
              },
              ...(details.value && {
                boxShadow: (theme) => theme.customShadows.z20,
              }),
            }}
          >
            {!!task.attachments.length && renderImg}

            <Stack spacing={2} sx={{ px: 2, py: 2.5, position: 'relative' }}>
              {renderPriority}

              <Typography variant="subtitle2">{task.name}</Typography>

              {renderInfo}
            </Stack>
          </Paper>
        )}
      </Draggable>

      <BuilderDetails
        task={task}
        openDetails={details.value}
        onCloseDetails={details.onFalse}
        onDeleteTask={() => onDeleteTask(task.id)}
        addDetails={(params) => addDetails(params)} // Pass params here
      />
    </>
  );
}
