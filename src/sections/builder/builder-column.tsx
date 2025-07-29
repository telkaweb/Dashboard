import { useCallback } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { useLocales } from 'src/locales';
// @mui
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
// types
import { ISectionColumn, ISectionTask } from 'src/types/sections';  // Corrected order
// hooks
import { useBoolean } from 'src/hooks/use-boolean';  // Corrected order
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
//
import { useKanban } from './hooks';
import BuilderTaskAdd from './builder-task-add';
import BuilderTaskItem from './builder-task-item';
import BuilderColumnToolBar from './builder-column-tool-bar';

// ----------------------------------------------------------------------
type OnAddTaskType = (args: { task: ISectionTask; columnId: string }) => void;

type Props = {
  column: ISectionColumn;
  tasks: Record<string, ISectionTask[]>; // Update the type to an array
  index: number;
  onAddTask: OnAddTaskType;
  addTaskDetails: (id: string,params: { title: string; description?: string }) => void; // Fix here
};

export default function BuilderColumn({ column, index, tasks,onAddTask,addTaskDetails }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const { onDeleteTask } = useKanban();

  const { t } = useLocales();

  const addTask = useBoolean();

  // const handleDeleteTask = useCallback(
  //   (taskId: string) => {
  //     onDeleteTask({
  //       taskId,
  //       columnId: column.id,
  //     });
  //     enqueueSnackbar('Delete success!');
  //   },
  //   [column.id, onDeleteTask]
  // );

  // const handleAddTask = useCallback((task: ISectionTask) => {
  //   addTask.onFalse();
  //   onAddTask({
  //     task,
  //     columnId: column.id,
  //   });
  // }, [onAddTask]);

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      onDeleteTask({
        taskId,
        columnId: column.id,
      });
      enqueueSnackbar('Delete success!');
    },
    [column.id, onDeleteTask, enqueueSnackbar]  // Add enqueueSnackbar as a dependency
  );
  
  const handleAddTask = useCallback(
    (task: ISectionTask) => {
      addTask.onFalse();  // This line uses addTask, so we need to add it as a dependency
      onAddTask({
        task,
        columnId: column.id,
      });
    },
    [onAddTask, addTask, column.id]  // Add addTask and column.id as dependencies
  );
  

  const addTaskDetail = (id:string,params: { title: string; description?: string }) => {
    addTaskDetails(id,params);
  };

  const renderAddTask = (
    <Stack spacing={2} sx={{ pb: 3 }}>
      {addTask.value && (
        <BuilderTaskAdd
          status={column.name}
          onAddTask={handleAddTask}
          onCloseAddTask={addTask.onFalse}
        />
      )}

      <Button
        fullWidth
        size="large"
        color="inherit"
        startIcon={<Iconify icon="mingcute:add-line" width={18} sx={{ mr: -0.5 }} />}
        onClick={addTask.onToggle}
        sx={{ fontSize: 14 }}
      >
        {t("section.task.add") ?? "Add Task"}
      </Button>
    </Stack>
  );

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            px: 2,
            borderRadius: 2,
            bgcolor: 'background.neutral',
          }}
        >
          <Stack {...provided.dragHandleProps}>
            <BuilderColumnToolBar
              columnName={column.name}
            />

            <Droppable droppableId={column.id} type="TASK">
              {(dropProvided) => (
                <Stack
                  ref={dropProvided.innerRef}
                  {...dropProvided.droppableProps}
                  spacing={2}
                  sx={{ width: 280, py: 3 }}
                >
                  {tasks[column.id]?.sort((a, b) => a.sort - b.sort).map((task, taskIndex) => (
                    <BuilderTaskItem
                      key={task.id}
                      index={taskIndex}
                      task={task}
                      onDeleteTask={handleDeleteTask}
                      addTaskDetail={addTaskDetail}
                    />
                  ))}
                  {dropProvided.placeholder}
                </Stack>
              )}
            </Droppable>

            {renderAddTask}
          </Stack>
        </Paper>
      )}
    </Draggable>
  );
}