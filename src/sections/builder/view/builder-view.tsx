'use client';

import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import axios, { API_ENDPOINTS } from 'src/utils/axios';
import { useLocales } from 'src/locales';
// @mui
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// theme
import { hideScroll } from 'src/theme/css';

// Correct order: internal imports should come before relative imports
import Toast from 'src/components/toast/Toast';  // Internal import
import { ISectionColumn, ISectionTask } from 'src/types/sections';  // Internal import

// relative imports
import { useKanban } from '../hooks';  // Relative import
import BuilderColumn from '../builder-column';
import { BuilderColumnSkeleton } from '../builder-skeleton';

// ----------------------------------------------------------------------
export const fetchData = async (
  accessToken: string | null,
  endPoint: string,
  method: 'GET' | 'POST' = 'GET',
  params = {}
) => {
  try {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const response =
      method === 'GET'
        ? await axios.get(endPoint, { params })
        : await axios.post(endPoint, params);

    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

export default function BuilderView() {

  const { boardStatus } = useKanban();

  const [ordered, setOrdered] = useState<string[]>([]);

  const { t } = useLocales();

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const [tasks, setTasks] = useState<Record<string, ISectionTask[]>>({});

  const [columns, setColumns] = useState<Record<string, ISectionColumn>>({});

  const [requestAdd , setRequestAdd] = useState(false);

  const [open, setOpen] = useState(false);

  const [message, setMessage] = useState("");
  
  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  const showToast = useCallback((msg: string, level: "success" | "error" | "info" | "warning") => {
    setMessage(msg);
    setOpen(true);
    setSeverity(level);
    setTimeout(() => {
      setOpen(false);
    }, 3000);
  }, [setMessage, setOpen, setSeverity]);
  

  const getData = useCallback(async () => {
    try {
      if (!accessToken) return;
      setRequestAdd(true);
      const result = await fetchData(accessToken, API_ENDPOINTS.section.list, 'GET');
  
      if (result?.data) {
        // Convert columns array to an object with IDs as keys
        const columnsObject = result.data.columns.reduce(
          (acc: Record<string, ISectionColumn>, column: ISectionColumn) => {
            acc[column.id] = {
              ...column,
              taskIds: column.taskIds || [], // Ensure taskIds is always an array
            };
            return acc;
          },
          {}
        );
  
        setColumns(columnsObject);
  
        // Set ordered column IDs based on the API response
        const orderedIds = result.data.columns.map((column: ISectionColumn) => column.id);
        setOrdered(orderedIds);
  
        setTasks(result?.data?.tasks);
      }
    } catch (err) {
      showToast(err?.status?.message, "error");
      setRequestAdd(false);
    } finally {
      setRequestAdd(false);
    }
  }, [accessToken,showToast]); // Add `accessToken` as a dependency here

  useEffect(() => {
    if (accessToken) {
      getData();
    }
  }, [accessToken,getData]);

  const handleTaskAdded = async (args: { task: ISectionTask; columnId: string }) => {
    try {
      if (!accessToken) return;
      setRequestAdd(true);
      const params={
        task: args.task,
        sort: tasks[args.columnId].length + 1,
        columnId: args.columnId,
      };

      const result = await fetchData(accessToken, API_ENDPOINTS.section.task.add, 'POST', params);
      getData();
      showToast(result?.status?.message,"success");
    } catch (err) {
      showToast(err?.status?.message,"error");
      setRequestAdd(false);
    } finally {
      setRequestAdd(false);
    }
  };

  const handelUpdateTask = useCallback(async (columnID: string, reorderedTasks: any) => {
    try {
      if (!accessToken) return;
      setRequestAdd(true);
      const params = {
        columnId: columnID,
        tasks: reorderedTasks,
      };
  
      const result = await fetchData(accessToken, API_ENDPOINTS.section.task.update.sort, 'POST', params);
      getData();
      showToast(result?.status?.message, "success");
    } catch (err) {
      showToast(err?.status?.message, "error");
      setRequestAdd(false);
    } finally {
      setRequestAdd(false);
    }
  }, [accessToken, getData, showToast]);
  
  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId, type } = result;
  
      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;
  
      // Moving columns
      if (type === "COLUMN") {
        setOrdered((prevOrdered) => {
          const newOrdered = [...prevOrdered];
          newOrdered.splice(source.index, 1);
          newOrdered.splice(destination.index, 0, draggableId);
          return newOrdered; // Force re-render
        });
        return;
      }
  
      const columnId = source.droppableId;
      const columnTasks = tasks[columnId]; // Get tasks in this column
  
      if (!columnTasks) return;
  
      // Create a new array of tasks for this column
      const updatedTasks = [...columnTasks];
  
      // Find the task that is being moved
      const movingTaskIndex = updatedTasks.findIndex((task) => task.id === draggableId);
      if (movingTaskIndex === -1) return;
  
      // Remove the dragged task from its original position
      const [movedTask] = updatedTasks.splice(movingTaskIndex, 1);
  
      // Insert it at the new position
      updatedTasks.splice(destination.index, 0, movedTask);
  
      // Recalculate the sort values based on new positions
      const reorderedTasks = updatedTasks.map((task, index) => ({
        ...task,
        sort: index + 1, // Updating the sort value based on position
      }));
  
      handelUpdateTask(columnId, reorderedTasks);
  
      // Update state
      setTasks((prevTasks) => ({
        ...prevTasks,
        [columnId]: reorderedTasks, // Updating only the specific column's tasks
      }));
    },
    [tasks, setTasks, setOrdered, handelUpdateTask]
  );
  
  
  
  const addTaskDetail = async (id:string,details: { title: string; description?: string }) => {
    try {
      if (!accessToken) return;
      setRequestAdd(true);
      const params={
        taskId: id,
        detail: details
      };
      const result = await fetchData(accessToken, API_ENDPOINTS.section.task.update.detail, 'POST', params);
      getData();
      showToast(result?.status?.message,"success");
    } catch (err) {
      showToast(err?.status?.message,"error");
      setRequestAdd(false);
    } finally {
      setRequestAdd(false);
    }
  };

  const renderSkeleton = (
    <Stack direction="row" alignItems="flex-start" spacing={3}>
      {[...Array(4)].map((_, index) => (
        <BuilderColumnSkeleton key={index} index={index} />
      ))}
    </Stack>
  );

  return (
    <>
      <Toast open={open} message={message} severity={severity} onClose={() => setOpen(false)} />
      <Container maxWidth={false} sx={{ height: 1 }}>
        <Typography
          variant="h4"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        >
          {t("section.task.title") ?? "Setting Section"}
        </Typography>

        {boardStatus.loading || requestAdd ? (
          renderSkeleton
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="board" type="COLUMN" direction="horizontal">
              {(provided) => (
                <Stack
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  spacing={3}
                  direction="row"
                  alignItems="flex-start"
                  sx={{
                    p: 0.25,
                    height: 1,
                    overflowY: 'hidden',
                    ...hideScroll.x,
                  }}
                >
                  {ordered.map((columnId, index) => (
                    <BuilderColumn
                      index={index}
                      key={columnId}
                      column={columns[columnId]}
                      tasks={tasks}
                      onAddTask={handleTaskAdded}
                      addTaskDetails={addTaskDetail}
                    />
                  ))}

                  {provided.placeholder}
                  {/* <KanbanColumnAdd /> */}
                </Stack>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </Container>
    </>
  );
}
