import { useEffect, useState, useCallback } from 'react';
import { HOST_API } from 'src/config-global';
import { API_ENDPOINTS } from 'src/utils/axios';
import { useLocales } from 'src/locales';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Dialog, { DialogProps } from '@mui/material/Dialog';
// components
import { Upload } from 'src/components/upload';
import Toast from 'src/components/toast/Toast';
import ProgressBar from 'src/components/upload/progressbar';

// ----------------------------------------------------------------------
interface UploadResponse {
  fileName: string;
  fileId: string;
  data?:{
    unique_key:string;
  }
}

interface Props extends DialogProps {
  folder: string;
  title?: string;
  //
  onCreate?: VoidFunction;
  onUpdate?: VoidFunction;
  //
  folderName?: string;
  onChangeFolderName?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  //
  open: boolean;
  onClose: VoidFunction;
}

export default function FileManagerNewFolderDialog({
  folder,
  title = 'Upload Files',
  open,
  onClose,
  //
  onCreate,
  onUpdate,
  //
  folderName,
  onChangeFolderName,
  ...other
}: Props) {
  const [files, setFiles] = useState<any[]>([]);

  const { t } = useLocales();

  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [uploadComplete, setUploadComplete] = useState(false);

  // const [uploadedFileIds, setUploadedFileIds] = useState<{ [key: string]: string }>({});

  const [openL, setOpen] = useState(false);

  const [tempFile, setTempFile] = useState<any[]>([]);

  const [message, setMessage] = useState("");
  
  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  useEffect(() => {
    if (!open) {
      setFiles([]);
    }
  }, [open]);

  const handleFileUpload = () => {
    const mediaFiles = tempFile; // Assuming mediaFiles is part of your values object

    // Type guard to check if an object is a File
    const isFile = (file: any): file is File => file instanceof File;
  
    // Convert to File[] (if needed)
    const fileArray = mediaFiles.map((file) => {
      if (isFile(file)) {
        // If it's already a File object, just return it
        return file;
      }
  
      // If the file is a string URL, convert it to a File-like object
      if (typeof file === 'string') {
        return new File([file], file, { type: 'application/octet-stream' });
      }
  
      // Handle ArrayBuffer or Blob if needed (depending on use case)
      if (file instanceof ArrayBuffer) {
        return new File([file], "blob", { type: 'application/octet-stream' });
      }
  
      // Handle Blob object if needed
      if (file instanceof Blob) {
        return new File([file], "blob", { type: file.type });
      }
  
      // If none of the conditions match, throw an error
      throw new Error('Unsupported file type');
    });
  
    // Now pass the raw files to the handleUploadMedia function
    handleUploadMedia(fileArray);
  };

  // Upload Media with chunk frontend/backend
  const handleUploadMedia = async (fileList: File[], type: 'cover' | null | undefined = null): Promise<void> => {
    try {
      // Iterate over each file to handle chunked upload
      fileList.map(async (file) => {
        if (!(file instanceof File)) {
          console.error('Invalid file object');
          return;
        }

        if(type !== "cover"){
          setUploadComplete(true);
          // Add file to the temporary files state (with preview and status)
          setTempFile((prevTempFiles) => [
            ...prevTempFiles,
            { file, isUploaded: false, preview: URL.createObjectURL(file) },
          ]);
        }

        const chunkSize = 500 * 1024; // 500KB chunks
        const totalChunks = Math.ceil(file.size / chunkSize); // Total number of chunks
  
        let currentChunk = 0; // To track the chunk being uploaded
  
        const uploadNextChunk = () => {
          if (currentChunk >= totalChunks) {
            // All chunks uploaded, finalize the upload
            console.log('All chunks uploaded, finalizing...');
            
            // Finalize the upload once all chunks are uploaded
            onSuccess({
              fileName: file.name,
              fileId: 'unique-file-id', // You can set the actual fileId here based on your backend response
            });
  
            return;
          }
  
          const start = currentChunk * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
  
          // Slice the current chunk from the file
          const chunk = file.slice(start, end);
  
          // Prepare form data for the chunk
          const formData = new FormData();
          formData.append('file_chunk', chunk);
          formData.append('chunk_number', currentChunk.toString());
          formData.append('file_name', file.name);
          formData.append('chunk_size', chunkSize.toString());
          formData.append('file_size', file.size.toString());
  
          // Upload the chunk to the server
          fetch(HOST_API + API_ENDPOINTS.upload.chunk, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
          })
            .then((response) => response.json())
            .then((data: UploadResponse) => {
              currentChunk +=1;
  
              // Update progress (optional)
              const progress = Math.round((currentChunk / totalChunks) * 100);
              if(type !== "cover"){
                setUploadProgress(progress);
              }

              // Continue uploading next chunk
              uploadNextChunk();
            })
            .catch((error) => {
              if(type !== "cover"){
                setUploadComplete(false);
              }
              showToast(t('upload.chunk_error') ?? "Chunk Upload failed!", "error");
              console.error('Chunk upload failed:', error);
            });
        };
  
        // Start the chunk upload
        uploadNextChunk();
  
        // Handle finalization once all chunks are uploaded
        const onSuccess = (response: UploadResponse) => {
  
          // Notify backend to finalize the upload after all chunks are uploaded
          fetch(HOST_API + API_ENDPOINTS.upload.complete, {
            method: 'POST',
            body: JSON.stringify({
              file_name: response.fileName, // Send the fileName to backend
              fileId: response.fileId, // Assuming the response includes fileId
            }),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
          })
            .then((res) => res.json())
            .then((finalizeResponse) => {
              
                setUploadComplete(false);
                // Remove the uploaded file from the temporary files list
                setTempFile((prevTempFiles) =>
                  prevTempFiles.filter((temp) => temp.file && temp.file.name !== file.name)
                );
                
                // Add the new file ID to the uploadedFileIds state
                // const fileId = finalizeResponse?.data?.unique_key ?? "";

                // Add the file name and ID to the state
                // setUploadedFileIds((prevIds) => ({
                //   ...prevIds,
                //   [file.name]: fileId, // Use the file name as the key
                // }));

                setFiles([]);
                onClose();
            })
            .catch((error) => {
              if(type !== 'cover'){
                setUploadComplete(false);
              }
              showToast(t('upload.chunk_final') ?? "Error finalizing upload!", "error");
              console.error('Error finalizing upload', error);
            });
        };
      });
    } catch (error) {
      if(type !== 'cover'){
        setUploadComplete(false);
      }
      showToast(t('upload.chunk_during') ?? "Error during file upload!", "error");
      console.error('Error during file upload:', error);
    }
  };

  const showToast = (msg: string, level: "success" | "error" | "info" | "warning") => {
    setMessage(msg);
    setOpen(true);
    setSeverity(level);
    setTimeout(() => {
      setOpen(false);
    }, 3000);
  };

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setFiles([...files, ...newFiles]);
      setTempFile(prev => [...prev, ...newFiles]);
    },
    [files]
  );

  const handleRemoveFile = (inputFile: File | string) => {
    const filtered = files.filter((file) => file !== inputFile);
    setFiles(filtered);
  };

  const handleRemoveAllFiles = () => {
    setFiles([]);
  };

  return (
    <>
      <Toast open={openL} message={message} severity={severity} onClose={() => setOpen(false)} />
      <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
        <DialogTitle sx={{ p: (theme) => theme.spacing(3, 3, 2, 3) }}> {title} </DialogTitle>

        <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none' }}>
            {(onCreate || onUpdate) && (
              <TextField
                fullWidth
                label="Folder name"
                value={folderName}
                onChange={onChangeFolderName}
                sx={{ mb: 3 }}
              />
            )}
            
            {uploadComplete ? (
              <ProgressBar percentage={uploadProgress} />
            ) : (        
              <Upload 
                multiple 
                thumbnail 
                files={files} 
                onDrop={handleDrop} 
                onUpload={handleFileUpload} 
                onRemoveAll={handleRemoveAllFiles} 
                onRemove={handleRemoveFile} 
              />
            )}
          </DialogContent>

        <DialogActions>
          {(onCreate || onUpdate) && (
            <Stack direction="row" justifyContent="flex-end" flexGrow={1}>
              <Button variant="soft" onClick={onCreate || onUpdate}>
                {onUpdate ? 'Save' : 'Create'}
              </Button>
            </Stack>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
