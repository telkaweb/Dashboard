import { useCallback } from 'react';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import {
  setOrdered,
  setColumns,
  addTask,
  deleteTask,
  createColumn,
  updateColumn,
  deleteColumn,
} from 'src/redux/slices/kanban';
// types
import { ISectionColumn, ISectionTask } from 'src/types/sections';

// ----------------------------------------------------------------------

export default function useKanban() {
  const dispatch = useDispatch();

  const { board, boardStatus } = useSelector((state) => state.kanban);

  const { tasks, columns, ordered } = board;

  const updateOrdered = useCallback(
    (newOrder: string[]) => {
      dispatch(setOrdered(newOrder));
    },
    [dispatch]
  );

  const updateColumns = useCallback(
    (newColumns: Record<string, ISectionColumn>) => {
      dispatch(setColumns(newColumns));
    },
    [dispatch]
  );

  const onAddTask = useCallback(
    ({ task, columnId }: { task: Partial<ISectionTask>; columnId: string }) => {
      dispatch(addTask({ task, columnId }));
    },
    [dispatch]
  );

  const onDeleteTask = useCallback(
    ({ taskId, columnId }: { taskId: string; columnId: string }) => {
      dispatch(deleteTask({ taskId, columnId }));
    },
    [dispatch]
  );

  const onCreateColumn = useCallback(
    ({ name }: { name: string }) => {
      dispatch(createColumn({ name }));
    },
    [dispatch]
  );

  const onUpdateColumn = useCallback(
    (columnId: string, newData: ISectionColumn) => {
      dispatch(updateColumn(columnId, newData));
    },
    [dispatch]
  );

  const onDeleteColumn = useCallback(
    (columnId: string) => {
      dispatch(deleteColumn(columnId));
    },
    [dispatch]
  );

  return {
    tasks,
    columns,
    ordered,
    //
    updateColumns,
    updateOrdered,
    //
    onAddTask,
    onDeleteTask,
    onCreateColumn,
    onUpdateColumn,
    onDeleteColumn,
    boardStatus,
  };
}
