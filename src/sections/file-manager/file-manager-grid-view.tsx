import { useRef } from 'react';
import { useLocales } from 'src/locales';

// @mui
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
// types
import { IFile } from 'src/types/file';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import { TableProps } from 'src/components/table';
//
import FileManagerPanel from './file-manager-panel';
import FileManagerFileItem from './file-manager-file-item';

// ----------------------------------------------------------------------

interface Files {
  unique_key: string;
  name: string;
  path: string;
  extension: string;
  size: string;
}

type Props = {
  table: TableProps;
  data: Files[];
  dataFiltered: IFile[];
  onOpenConfirm: VoidFunction;
  onDeleteItem: (id: string) => void;
};

export default function FileManagerGridView({
  table,
  data,
  dataFiltered,
  onDeleteItem,
  onOpenConfirm,
}: Props) {
  const { selected, onSelectRow: onSelectItem } = table;

  const containerRef = useRef(null);

  const { t } = useLocales();

  const upload = useBoolean();

  const files = useBoolean();

  return (
    <Box ref={containerRef}>
      <FileManagerPanel
        title={t("file-manager.files") ?? "Files"}
        subTitle={`${data.length} ${t('file-manager.file') ?? "files"}`}
        onOpen={upload.onTrue}
        collapse={files.value}
        onCollapse={files.onToggle}
      />

      <Collapse in={!files.value} unmountOnExit>
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          }}
          gap={3}
        >
          {dataFiltered
            .map((file) => (
              <FileManagerFileItem
                key={file.unique_key}
                file={file}
                selected={selected.includes(file.unique_key)}
                onSelect={() => onSelectItem(file.unique_key)}
                onDelete={() => onDeleteItem(file.unique_key)}
                sx={{ maxWidth: 'auto' }}
              />
            ))}
        </Box>
      </Collapse>
    </Box>
  );
}
