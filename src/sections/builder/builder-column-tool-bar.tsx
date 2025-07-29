import { useRef, useState, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import { usePopover } from 'src/components/custom-popover';
//
import BuilderInputName from './builder-input-name';

// ----------------------------------------------------------------------

type Props = {
  columnName: string;
};

export default function BuilderColumnToolBar({ columnName }: Props) {
  const renameRef = useRef<HTMLInputElement>(null);

  // const [value, setValue] = useState(columnName);
  const [value] = useState(columnName);

  const popover = usePopover();

  useEffect(() => {
    if (popover.open) {
      if (renameRef.current) {
        renameRef.current.focus();
      }
    }
  }, [popover.open]);


  return (
    <Stack
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ pt: 3 }}
    >
      <BuilderInputName
        inputRef={renameRef}
        placeholder="Section name"
        value={value}
      />
    </Stack>
  );
}
