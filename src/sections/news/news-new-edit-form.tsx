import * as Yup from 'yup';
import { useCallback, useMemo, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm,useFormContext } from 'react-hook-form';
import { useLocales } from 'src/locales';
import axios, { API_ENDPOINTS } from 'src/utils/axios';
import { HOST_API } from 'src/config-global';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
// import Grid from '@mui/material/Unstable_Grid2';
import { Grid } from "@mui/material";

import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
// hooks
// import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// routes
// import { useRouter } from 'src/routes/hook';
// _mock
// import { _tags } from 'src/_mock';
// types
import { IBlogItem } from 'src/types/blog';
// components
import { CustomFile } from 'src/components/upload';
// import { useSnackbar } from 'src/components/snackbar';
import Toast from "src/components/toast/Toast";
import ProgressBar from 'src/components/upload/progressbar';

import FormProvider, {
  RHFEditor,
  RHFUpload,
  RHFTextField,
  RHFAutocomplete,
  RHFSelect,
} from 'src/components/hook-form';
//
import BlankCard from 'src/components/shared/BlankCard';
import StatusCard from 'src/components/products/Status';
import Container from '@mui/material/Container';
import { useSettingsContext } from 'src/components/settings';
// ----------------------------------------------------------------------

type Props = {
  currentPost?: IBlogItem;
};

interface Category {
  group: string;
  unique_key: string;
  classify: {
    id: string;
    unique_key:string;
    name: string;
  }[]
}

interface UploadResponse {
  fileName: string;
  fileId: string;
  data?:{
    unique_key:string;
  }
}

type UploadedFile = {
  unique_key?: string;
  name: string;
  preview: string;
  size: string;
  existing: boolean;
};


interface FormValuesProps extends Omit<IBlogItem, 'images' | 'coverUrl'> {
  coverUrl: CustomFile | string | null;
  images: (CustomFile | UploadedFile | string)[];
}

export const fetchData = async (accessToken: string | null,routApi: string ) => {
  try {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const response = await axios.get(routApi);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const sendRequest = async (accessToken: string | null,routApi: string ,data: any) => {
  try {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const response = await axios.post(routApi,data);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

const RenderSeo = ({ t }: { t: any }) => {
  const { watch, register } = useFormContext();
  const aiseoValue = watch('aiseo');

  return (
    <Stack spacing={3}>
      <FormControlLabel
        control={<Switch {...register('aiseo')} checked={!!aiseoValue} />}
        label={t('seo.ai') ?? "Enable ai generate"}
      />

      <Stack spacing={2}>
        <RHFTextField name="metaTitle" label="Meta title" sx={{ display: aiseoValue ? 'none' : 'block' }} />
        <RHFTextField name="slug" label="Slug" sx={{ display: aiseoValue ? 'none' : 'block' }} />
        <RHFTextField name="ogTitle" label="OG Title" sx={{ display: aiseoValue ? 'none' : 'block' }} />
        <RHFTextField name="metaKeywords" label="Meta Keywords" sx={{ display: aiseoValue ? 'none' : 'block' }} />
        <RHFTextField name="metaDescription" label="Meta Description" sx={{ display: aiseoValue ? 'none' : 'block' }} />
        <RHFTextField name="ogDescription" label="OG Description" sx={{ display: aiseoValue ? 'none' : 'block' }} />
        <RHFTextField name="schema" label="Schema" sx={{ display: aiseoValue ? 'none' : 'block' }} />
      </Stack>
    </Stack>
  );
};

export default function BlogNewEditForm({ currentPost }: Props) {
  // const router = useRouter();

  const { t } = useLocales();
  
  const settings = useSettingsContext();

  const accessToken = localStorage.getItem('accessToken');

  const mdUp = useResponsive('up', 'md');

  // const { enqueueSnackbar } = useSnackbar();

  // const preview = useBoolean();

  const [tagsList, setTags] = useState<string[]>([]); 

  // const [isSwitchOn, setIsSwitchOn] = useState(false);

  const [loading, setLoading] = useState(true);

  const [fetchError, setError] = useState(null);

  const [open, setOpen] = useState(false);

  const [uploadComplete, setUploadComplete] = useState(false);

  const [message, setMessage] = useState("");
  
  const [uploadedFileIds, setUploadedFileIds] = useState<{ [key: string]: string }>({});

  const [categoryList, setCategory] = useState<Category[] | null>(null);

  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  const [tempFile, setTempFile] = useState<any[]>([]);

  // const [formatFile, setFormatFile] = useState<any[]>([]);

  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [existingFiles, setExistingFiles] = useState<UploadedFile[]>([]);

  // const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setIsSwitchOn(event.target.checked);
  // };

  const showToast = useCallback((msg: string, level: "success" | "error" | "info" | "warning") => {
    setMessage(msg);
    setOpen(true);
    setSeverity(level);
    setTimeout(() => {
      setOpen(false);
    }, 3000);
  }, [setMessage, setOpen, setSeverity]);

  const findUniqueKeyByCategoryId = (
    category: any,
    categories: Category[]
  ): string => {
    const parentMatch = categories.find(group => group.unique_key === category.unique_key);
    if (parentMatch) return parentMatch.unique_key;

    let matchedKey = '';

    categories.some(group => {
      const childMatch = group.classify?.find(c => c.unique_key === category.unique_key);
      if (childMatch) {
        matchedKey = childMatch.unique_key;
        return true; // break the loop
      }
      return false;
    });

    return matchedKey;
  };


  useEffect(() => {
    const getData = async (endPoint: string,setState: React.Dispatch<React.SetStateAction<any>>) => {
      try {
        const result = await fetchData(accessToken,endPoint);
        setState(result?.data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      getData(API_ENDPOINTS.category.all,setCategory);
      getData(API_ENDPOINTS.tags.list,setTags);
    }
  }, [accessToken]);

  const NewPostSchema = Yup.object().shape({
    title: Yup.string().required(t('required.title') ?? 'Title is required'),
    description: Yup.string().required(t('required.description') ?? "Description is required"),
    // tags: Yup.array().min(2, t('required.min_tags') ?? 'Must have at least 2 tags'),
    coverUrl: Yup.mixed().required('Cover is required'),
    category: Yup.string().required( t('required.category') ??'Category is required'),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentPost?.title || '',
      description: currentPost?.description || '',
      subDescription: currentPost?.data?.short_description || '',
      
      // Ensure category is an object with unique_key and name
      category: findUniqueKeyByCategoryId(currentPost?.category || '',categoryList || []),
      category_id: currentPost?.category_id || 0,
  
      type: currentPost?.type ?? 1, // Ensures type stays number/string
      tags: Array.isArray(currentPost?.tags) ? currentPost?.tags : [],

      // Ensure coverUrl is properly assigned
      coverUrl: currentPost?.cover?.path && typeof currentPost.cover.path === "string"
        ? currentPost.cover.path
        : null,

      coverID: currentPost?.cover?.unique_key && typeof currentPost.cover.unique_key === "string"
        ? currentPost.cover.unique_key
        : null,

      // SEO and metadata handling
      metaTitle: currentPost?.seo?.meta?.title || '',
      metaDescription: currentPost?.seo?.meta?.description || '',
      ogTitle: currentPost?.seo?.og?.title || '',
      ogDescription: currentPost?.seo?.og?.description || '',
      schema: currentPost?.seo?.schema || '',
      
      slug: currentPost?.slug || '',
      status: currentPost?.status ?? 2, // Ensures correct default for status
      aiseo: typeof currentPost?.seo?.status === 'boolean' ? currentPost?.seo.status : false, // Ensure it's a boolean
      images: existingFiles ?? []
    }),
    [currentPost,categoryList]
  );
  
  const [status, setStatusContent] = useState<number>(1); // 0 means inactive, 1 means active

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewPostSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentPost) {
      reset(defaultValues);

      const files = currentPost?.files.map((file) => ({
        unique_key: file.unique_key,
        name: file.name,
        preview: file.path,
        size: file.size,
        existing: true,
      }));

      setExistingFiles(files);

    }
  }, [currentPost, defaultValues, reset,setExistingFiles]);

  const onSubmit = useCallback(
    (data: FormValuesProps) => {
      const handleSubmitAsync = async () => {
        const newData = {
          details: data,
          media: uploadedFileIds,
          status,
        };
  
        try {
          const link = currentPost
            ? API_ENDPOINTS.blog.update(currentPost.unique_key)
            : API_ENDPOINTS.blog.create("blog");
  
          const responseReq = await sendRequest(accessToken, link, newData);
  
          showToast(responseReq?.status?.message ?? "Please upload one video for selected post!", "success");
  
          if(responseReq?.status?.code === 200){
            if(!currentPost){
              reset();
              window.location.reload();
            }
          }
        } catch (error) {
          showToast(error?.status?.message ?? "Error Request!", "error");
        }
      };
  
      handleSubmitAsync();
    },
    [currentPost, reset, uploadedFileIds, accessToken, showToast, status] // Added status to the dependencies
  );

  const handleUploadMedia = useCallback(
    async (files: File[], type: 'cover' | null | undefined = null): Promise<void> => {
      try {
        files.forEach((file) => {
          if (!(file instanceof File)) {
            console.error('Invalid file object');
            return;
          }
  
          if (type !== "cover") {
            setUploadComplete(true);
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
              console.log('All chunks uploaded, finalizing...');
              
              onSuccess({
                fileName: file.name,
                fileId: 'unique-file-id',
              });
  
              return;
            }
  
            const start = currentChunk * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
  
            const chunk = file.slice(start, end);
  
            const formData = new FormData();
            formData.append('file_chunk', chunk);
            formData.append('chunk_number', currentChunk.toString());
            formData.append('file_name', file.name);
            formData.append('chunk_size', chunkSize.toString());
            formData.append('file_size', file.size.toString());
  
            fetch(HOST_API + API_ENDPOINTS.upload.chunk, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
              body: formData,
            })
              .then((response) => response.json())
              .then((data: UploadResponse) => {
                currentChunk += 1;
  
                const progress = Math.round((currentChunk / totalChunks) * 100);
                if (type !== "cover") {
                  setUploadProgress(progress);
                }
  
                uploadNextChunk();
              })
              .catch((error) => {
                if (type !== "cover") {
                  setUploadComplete(false);
                }
                showToast(t('upload.chunk_error') ?? "Chunk Upload failed!", "error");
                console.error('Chunk upload failed:', error);
              });
          };
  
          uploadNextChunk();
  
          const onSuccess = (response: UploadResponse) => {
            fetch(HOST_API + API_ENDPOINTS.upload.complete, {
              method: 'POST',
              body: JSON.stringify({
                file_name: response.fileName,
                fileId: response.fileId,
              }),
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
            })
              .then((res) => res.json())
              .then((finalizeResponse) => {
                if (type === 'cover') {
                  setValue('cover_id', finalizeResponse?.data?.unique_key ?? '', { shouldValidate: true });
                } else {
                  setUploadComplete(false);
                  setTempFile((prevTempFiles) =>
                    prevTempFiles.filter((temp) => temp.file && temp.file.name !== file.name)
                  );
  
                  const fileId = finalizeResponse?.data?.unique_key ?? "";
                  setUploadedFileIds((prevIds) => ({
                    ...prevIds,
                    [file.name]: fileId,
                  }));
                }
              })
              .catch((error) => {
                if (type !== 'cover') {
                  setUploadComplete(false);
                }
  
                showToast(t('upload.chunk_final') ?? "Error finalizing upload!", "error");
                console.error('Error finalizing upload', error);
              });
          };
        });
      } catch (error) {
        if (type !== 'cover') {
          setUploadComplete(false);
        }
        showToast(t('upload.chunk_during') ?? "Error during file upload!", "error");
        console.error('Error during file upload:', error);
      }
    },
    [accessToken, setUploadComplete, setTempFile, setUploadProgress, setValue, setUploadedFileIds, showToast, t] // List dependencies that affect the function
  );
  

  const handleGalleryDrop = useCallback(
    (acceptedFiles: File[]) => {

      const files = values.images || [];
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      );
  
      setValue('images', [...files, ...newFiles], { shouldValidate: true });
      setTempFile((prev) => [...prev, ...newFiles]);
    },
    [setValue, values.images]
  ); 

  const handleFileUpload = () => {
    const mediaFiles = tempFile; // Assuming mediaFiles is part of your values object
  
    // Type guard to check if an object is a File
    const isFile = (file: any): file is File => file instanceof File;
  
    // Convert to File[] (if needed)
    const fileArray = mediaFiles.map((file) => {
      console.log(file); 
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

  
  const handleRemoveFileGallery = useCallback(
    async (inputFile: File | string) => {
      let fileName: string;
      let uniqueKey: string | undefined;

      if (typeof inputFile === 'string') {
        fileName = inputFile;
      } else if (inputFile instanceof File) {
        fileName = inputFile.name;
      } else if (typeof inputFile === 'object' && 'name' in inputFile) {
        fileName = (inputFile as any).name;
        uniqueKey = (inputFile as any).unique_key;
      } else {
        console.error('Invalid inputFile type:', inputFile);
        return;
      }

      const normalizeName = (name: string) =>
        name.trim().replace(/\s+/g, ' ').normalize('NFC');

      const normalizedFileName = normalizeName(fileName);

      try {
        if (uniqueKey) {
          const link = API_ENDPOINTS.upload.delete(uniqueKey);

          const responseReq = await sendRequest(accessToken, link, {});

          if (responseReq?.status?.code !== 200) {
            alert('خطا در حذف فایل از سرور');
            return;
          }

          setUploadedFileIds((prevIds) => {
            const updatedIds = { ...prevIds };
            delete updatedIds[normalizedFileName];
            return updatedIds;
          });
        }

          const filtered = values.images?.filter((file) => {
            const fileNameToCompare = (() => {
              if (typeof file === 'string') {
                return file;
              }

              if (typeof file === 'object' && 'name' in file) {
                return (file as any).name;
              }

              return '';
            })();

            return normalizeName(fileNameToCompare) !== normalizedFileName;
          });
          setValue('images', filtered);
      } catch (error) {
        console.error('Error deleting file from backend:', error);
      }
    },
    [setValue, values.images, setUploadedFileIds, accessToken]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('images', []);
    setUploadedFileIds({});
  }, [setValue]);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
  
      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });
  
      const files = [newFile];
  
      if (file) {
        setValue('coverUrl', newFile, { shouldValidate: true });
        handleUploadMedia(files, 'cover');
      }
    },
    [setValue, handleUploadMedia] // Add handleUploadMedia to the dependency array
  );
  
  const handleRemoveFile = useCallback(() => {
    setValue('coverUrl', null);
    setValue('cover_id', "");
  }, [setValue]);

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="body2" sx={{ color: 'text.secondary'}}>
            {t('form.detail.desc') ?? "Title,Short description,description"}
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={12}>
          <Stack spacing={3} sx={{ p: 2 }}>
            <RHFTextField name="title" label={t('form.blog.title') ?? "Blog title"} />

            <RHFTextField name="subDescription" label={t('form.blog.subdesc') ?? "Sub description"} multiline rows={4} />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">{t('form.description') ?? "Description"}</Typography>
              <RHFEditor textCustom={t('form.blog.desc') ?? "Write something awesome..."} simple name="description" />
            </Stack>

            <RHFSelect native name="category" label={t('content_form.category') ?? "Category"} InputLabelProps={{ shrink: true }}>
              <option value="">{t('content_form.option_select') ?? "Select Option"}</option>
              {categoryList?.map((category) => (
                <>
                  <option key={category.group} value={category.unique_key}>
                    {`📁 ${category.group}`}
                  </option>
                  {category.classify?.map((classify) => (
                    <option key={classify.unique_key} value={classify.unique_key}>
                      {`↳ ${classify.name}`}
                    </option>
                  ))}
                </>
              ))}
            </RHFSelect>

          </Stack>
      </Grid>
    </>
  );

  const renderMedia = (
    <>
    {mdUp && (
      <Grid md={8}>
        <Typography variant="body2" sx={{ color: 'text.secondary'}}>
          {t('content_form.media_desc') ?? "Set gallery product"}
        </Typography>
      </Grid>
    )}
      <Grid xs={12} md={12}>
        <Stack spacing={3} sx={{ p: 2 }}>
          <RHFUpload
            multiple
            thumbnail
            name="images"
            maxSize={104857600}
            onDrop={handleGalleryDrop}
            onRemove={handleRemoveFileGallery}
            onRemoveAll={handleRemoveAllFiles}
            onUpload={handleFileUpload}
          />
        </Stack>
      </Grid>
    </>
  );

  const renderThumbnail = (
    <Grid xs={12} md={12}>
      <Stack spacing={1} sx={{ p:1}}>
        <RHFUpload
          name="coverUrl"
          maxSize={3145728}
          onDrop={handleDrop}
          onDelete={handleRemoveFile}
        />
      </Stack>
    </Grid>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={12} sx={{ display: 'flex', alignItems: 'center'}} style={{float:"left"}}>
        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting} sx={{float:'left'}}>
          {!currentPost ? t('form.create.post') ?? 'Create Post' : t('form.update.post') ?? 'Save Changes'}
        </LoadingButton>
      </Grid>
    </>
  );

  const renderTags = (
    <Grid item xs={12} md={12}>
        {!mdUp && <CardHeader title={t('content_form.tags') ?? "Tags"} />}

        <Stack spacing={1} sx={{ p: 2 }}>
          <RHFAutocomplete
            name="tags"
            label={t('content_form.tags') ?? "Tags"}
            placeholder={t('content_form.tags_add') ?? "+ Tags"}
            multiple
            freeSolo
            options={tagsList?.map((option) => option)}
            getOptionLabel={(option) => option}
            renderOption={(props, option) => (
              <li {...props} key={option}>
                {option}
              </li>
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option}
                  size="small"
                  color="info"
                  variant="soft"
                />
              ))
            }
          />
        </Stack>
    </Grid>
  );

  if (loading) return (
    <Container 
      maxWidth={settings.themeStretch ? false : 'xl'}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
    >
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{t('loading') ?? 'Loading...'}</p>
    </Container>
  );

  if (fetchError) return (
    <Container 
      maxWidth={settings.themeStretch ? false : 'xl'}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
    >
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{t('error_data') ?? 'Error Fetching...'}</p>
    </Container>
  );
  
  return (
    <>
      <Toast open={open} message={message} severity={severity} onClose={() => setOpen(false)} />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid lg={8}>
          <Stack spacing={3}>
            <BlankCard title={t('form.detail.title') ?? "Details"}>
              {renderDetails}
            </BlankCard>

            <BlankCard title={t('form.media') ?? "Media"}>
              {uploadComplete ? (
                <ProgressBar percentage={uploadProgress} />
              ) : (
                renderMedia
              )}
            </BlankCard>

            <BlankCard title={t('form.seo') ?? "Seo"} collapsible>
                <RenderSeo t={t} />
            </BlankCard>
          </Stack>
        </Grid>

        <Grid lg={4}>
          <Stack spacing={3}>

              <BlankCard title={t('form.thumbnail') ?? "Thumbnail"}>
                {renderThumbnail}
              </BlankCard>

              <BlankCard title={t('form.tags') ?? "Tags"}>
                {renderTags}
              </BlankCard>

              <StatusCard setStatusContent={setStatusContent}/>

              <BlankCard title={t('form.status.published') ?? "Submit"}>
                {uploadComplete ? <div /> : renderActions}
              </BlankCard>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
    </>
  );
}
