import { useState, useCallback, useMemo } from 'react';
import { useLocales } from 'src/locales';

// @mui
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import InputBase, { inputBaseClasses } from '@mui/material/InputBase';
// _mock
// import { _mock } from 'src/_mock';
// utils
import uuidv4 from 'src/utils/uuidv4';
// types
import { ISectionTask } from 'src/types/sections';

// ----------------------------------------------------------------------

type Props = {
  status: string;
  onCloseAddTask: VoidFunction;
  onAddTask: (task: ISectionTask) => void;
};

export default function BuilderTaskAdd({ status, onAddTask, onCloseAddTask }: Props) {
  const [name, setName] = useState('');

  const { t } = useLocales();

  const defaultTask: ISectionTask = useMemo(
    () => ({
      id: uuidv4(),
      status: 1,
      name: name.trim(),
      position: "top",
      sort: 2,
      attachments: [],
    }),
    [name] // Only 'name' is necessary as a dependency
  );
  

  const handleKeyUpAddTask = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        if (name) {
          onAddTask(defaultTask);
        }
      }
    },
    [defaultTask, name, onAddTask]
  );

  const handleClickAddTask = useCallback(() => {
    if (name) {
      onAddTask(defaultTask);
    } else {
      onCloseAddTask();
    }
  }, [defaultTask, name, onAddTask, onCloseAddTask]);

  const handleChangeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  }, []);

  return (
    <ClickAwayListener onClickAway={handleClickAddTask}>
      <Paper
        sx={{
          borderRadius: 1.5,
          boxShadow: (theme) => theme.customShadows.z1,
        }}
      >
        <InputBase
          autoFocus
          multiline
          fullWidth
          placeholder={t("section.task.input.name") ?? "Task name"}
          value={name}
          onChange={handleChangeName}
          onKeyUp={handleKeyUpAddTask}
          sx={{
            px: 2,
            height: 56,
            [`& .${inputBaseClasses.input}`]: {
              typography: 'subtitle2',
            },
          }}
        />
      </Paper>
    </ClickAwayListener>
  );
}
