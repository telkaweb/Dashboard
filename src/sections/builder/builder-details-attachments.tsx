import { useState, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
// components
import { MultiFilePreview, UploadBox } from 'src/components/upload';

// ----------------------------------------------------------------------

type Props = {
  attachments: {
    unique_key:string;
    name:string;
    path:string;
    extension:string;
  }[];
};

export default function BuilderDetailsAttachments({ attachments }: Props) {
  const [files, setFiles] = useState<(File | string)[]>(
    attachments.map((att) => att.path)
  );
  
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file: File) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setFiles([...files, ...newFiles]);
    },
    [files]
  );

  const handleRemoveFile = useCallback(
    (inputFile: File | string) => {
      const filtered = files.filter((file) => file !== inputFile);
      setFiles(filtered);
    },
    [files]
  );

  return (
    <Stack direction="row" flexWrap="wrap">
      <MultiFilePreview
        thumbnail
        files={files}
        onRemove={(file) => handleRemoveFile(file)}
        sx={{ width: 64, height: 64 }}
      />

      <UploadBox onDrop={handleDrop} />
    </Stack>
  );
}
