import * as Yup from 'yup';
import { useCallback, useMemo, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useLocales } from 'src/locales';
import axios, { API_ENDPOINTS } from 'src/utils/axios';
import { HOST_API } from 'src/config-global';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
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
import { IPostItem } from 'src/types/post';
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
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useSettingsContext } from 'src/components/settings';
// ----------------------------------------------------------------------

type Props = {
  currentPost?: IPostItem;
};

interface Category {
  group: string;
  unique_key: string;
  classify: {
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

interface FormValuesProps extends Omit<IPostItem, 'images' | 'coverUrl'> {
  coverUrl: CustomFile | string | null;
  images: (CustomFile | string)[];
}

export const fetchData = async (accessToken: string | null,routApi: string ) => {
  try {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const response = await axios.get(routApi);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

export const sendRequest = async (accessToken: string | null,routApi: string ,data: any) => {
  try {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const response = await axios.post(routApi,data);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

export default function PostNewEditForm({ currentPost }: Props) {
  // const router = useRouter();

  const { t } = useLocales();
  
  const settings = useSettingsContext();

  const accessToken = localStorage.getItem('accessToken');

  const mdUp = useResponsive('up', 'md');

  // const { enqueueSnackbar } = useSnackbar();

  // const preview = useBoolean();

  const [tagsList, setTags] = useState<string[]>([]); 

  const [isSwitchOn, setIsSwitchOn] = useState(false);

  const [loading, setLoading] = useState(true);

  const [errorHandle, setError] = useState(null);

  const [open, setOpen] = useState(false);

  const [uploadComplete, setUploadComplete] = useState(false);

  const [message, setMessage] = useState("");
  
  const [uploadedFileIds, setUploadedFileIds] = useState<{ [key: string]: string }>({});

  const [categoryList, setCategory] = useState<Category[] | null>(null);

  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  const [tempFile, setTempFile] = useState<any[]>([]);

  const [formatFile, setFormatFile] = useState<any[]>([]);

  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSwitchOn(event.target.checked);
  };

  const showToast = useCallback(
    (msg: string, level: "success" | "error" | "info" | "warning") => {
      setMessage(msg);
      setOpen(true);
      setSeverity(level);
      setTimeout(() => {
        setOpen(false);
      }, 3000);
    },
    [setMessage, setOpen, setSeverity] // Dependencies
  );
  

  const typeMapping: Record<number, string> = useMemo(
    () => ({
      2: "podcast",
      3: "video",
    }),
    []
  );

  const getTypeLabel = useCallback(
    (type?: string | number): string => typeMapping[Number(type)] || '',
    [typeMapping]
  );

  
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
    tags: Yup.array().min(2, t('required.min_tags') ?? 'Must have at least 2 tags'),
    images: Yup.array().min(1, t('required.images') ?? 'Images is required'),
    coverUrl: Yup.mixed().required('Cover is required'),
    category: Yup.string().required( t('required.category') ??'Category is required'),
    type: Yup.string().required( t('required.type') ??'Post type is required'),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentPost?.title || '',
      description: currentPost?.description || '',
      subDescription: currentPost?.data?.short_description || '',
  
      // Ensure category is an object with unique_key and name
      category: currentPost?.category
        ? { unique_key: currentPost.category.unique_key || '', name: currentPost.category.name || '' }
        : { unique_key: '', name: '' },
  
      // Ensure type is properly transformed using getTypeLabel
      type: getTypeLabel(currentPost?.type) ?? '',
  
      // Ensure coverUrl is safely assigned
      coverUrl: currentPost?.cover?.path && typeof currentPost.cover.path === "string"
        ? currentPost.cover.path
        : null,
  
      // SEO and metadata handling
      metaTitle: currentPost?.seo?.meta?.title || '',
      metaDescription: currentPost?.seo?.meta?.description || '',
      ogTitle: currentPost?.seo?.og?.title || '',
      ogDescription: currentPost?.seo?.og?.description || '',
      schema: currentPost?.seo?.schema || '',
  
      slug: currentPost?.slug || '',
      status: currentPost?.status ?? 2, // Uses ?? to allow 0 as a valid value
  
      // Uncomment if tags are needed
      // tags: Array.isArray(currentPost?.tags) 
      //   ? currentPost.tags.map(tag => tag)  // Convert objects to strings
      //   : [],
  
      // Uncomment if keywords are needed
      // metaKeywords: Array.isArray(currentPost?.seo?.meta?.keywords) 
      //   ? currentPost.seo.meta.keywords.join(", ") 
      //   : '',
    }),
    [getTypeLabel,currentPost]
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
    }
  }, [currentPost, defaultValues, reset]);

  const onSubmit = useCallback(
    async (data: FormValuesProps) => {
      const newData={
        "details":data,
        "media":uploadedFileIds,
        "status":status
      }
      try {
        
        if(!currentPost){
          if (data.type === "podcast") {
            const audioFormats = ["audio/mp3", "audio/wav", "audio/m4a", "audio/mpeg"];
            const hasValidAudio = formatFile.some((format: string) => audioFormats.includes(format));
            
            if (!hasValidAudio) {
              showToast(t('required.audio') ?? "Please upload one audio for selected post!", "error");
              return;
            }
          } else if (data.type === "video") {
            const videoFormats = ["video/mp4", "video/avi", "video/mkv", "video/mov"];
            const hasValidVideo = formatFile.some((format: string) => videoFormats.includes(format));
            
            if (!hasValidVideo) {
              showToast(t('required.video') ?? "Please upload one video for selected post!", "error");
              return;
            }
          }
        }
        let link=null;
        if(!currentPost){
          link = data.type === "podcast" ? API_ENDPOINTS.post.update("podcast") : API_ENDPOINTS.post.update("video");
        }else{
          link = data.type === "podcast" ? API_ENDPOINTS.post.create("podcast") : API_ENDPOINTS.post.create("video");
        }

        const responseReq=await sendRequest(accessToken, link, newData);

        showToast(responseReq?.status?.message ?? "Please upload one video for selected post!", "success");
        
        reset();
        window.location.reload();

      } catch (error) {
        showToast(error?.status?.message ?? "Error Request!", "error");
      }
    },
    [currentPost, reset,showToast,status,formatFile,uploadedFileIds,accessToken,t]
  );


  // Upload Media with chunk frontend/backend
  const handleUploadMedia = useCallback(
    async (files: File[], type: 'cover' | null | undefined = null): Promise<void> => {
      try {
        files.forEach(async (file) => {
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
          const totalChunks = Math.ceil(file.size / chunkSize);
          let currentChunk = 0;
  
          const uploadNextChunk = () => {
            if (currentChunk >= totalChunks) {
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
              headers: { 'Authorization': `Bearer ${accessToken}` },
              body: formData,
            })
              .then((response) => response.json())
              .then(() => {
                currentChunk +=1;
                const progress = Math.round((currentChunk / totalChunks) * 100);
                if (type !== "cover") setUploadProgress(progress);
                uploadNextChunk();
              })
              .catch((error) => {
                if (type !== "cover") setUploadComplete(false);
                showToast(t('upload.chunk_error') ?? "Chunk Upload failed!", "error");
                console.error('Chunk upload failed:', error);
              });
          };
  
          uploadNextChunk();
  
          const onSuccess = (response: UploadResponse) => {
            fetch(HOST_API + API_ENDPOINTS.upload.complete, {
              method: 'POST',
              body: JSON.stringify({ file_name: response.fileName, fileId: response.fileId }),
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
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
                  setUploadedFileIds((prevIds) => ({
                    ...prevIds,
                    [file.name]: finalizeResponse?.data?.unique_key ?? "",
                  }));
                }
              })
              .catch((error) => {
                if (type !== 'cover') setUploadComplete(false);
                showToast(t('upload.chunk_final') ?? "Error finalizing upload!", "error");
                console.error('Error finalizing upload', error);
              });
          };
        });
      } catch (error) {
        if (type !== 'cover') setUploadComplete(false);
        showToast(t('upload.chunk_during') ?? "Error during file upload!", "error");
        console.error('Error during file upload:', error);
      }
    },
    [accessToken, showToast, setTempFile, setUploadComplete, setUploadProgress, setUploadedFileIds, setValue, t]
  );
  

  // Gallery function
  const handleGalleryDrop = useCallback(
    (acceptedFiles: File[]) => {

      const newFormats = acceptedFiles.map((file) => file.type);
      setFormatFile((prev) => {
        const updatedFormats = Array.from(new Set([...prev, ...newFormats]));
        return updatedFormats;
      });

      const files = values.images || [];
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setValue('images', [...files, ...newFiles], { shouldValidate: true });
      setTempFile(prev => [...prev, ...newFiles]);
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
    (inputFile: File | string) => {
      let fileName: string;

      if (inputFile instanceof File) {
        fileName = inputFile.name;
      } else if (typeof inputFile === 'string') {
        // If it's a string, use it directly
        fileName = inputFile;
      } else {
        // Handle any unexpected input
        console.error('Invalid inputFile type:', inputFile);
        return;
      }

      const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').normalize('NFC');

      // If inputFile is a File object, remove the corresponding ID from uploadedFileIds
      if (inputFile instanceof File) {
        setUploadedFileIds((prevIds) => {
          if (prevIds && typeof prevIds === 'object') {
            // Create a copy of the object
            const updatedIds: { [key: string]: string } = { ...prevIds }; // Explicitly typing as an object with string keys

            // Delete the key (file name) from the object
            delete updatedIds[normalizeName(fileName)];

            return updatedIds; // Return the updated object with the file name removed
          }
          return prevIds; // If not an object, return prevIds as is
        });
      }

      const filtered = values.images && values.images?.filter((file) => file !== inputFile);
      setValue('images', filtered);

    },
    [setValue, values.images,setUploadedFileIds]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('images', []);
    setUploadedFileIds({});
  }, [setValue]);

  // Cover function
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
    [setValue,handleUploadMedia]
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
            {t('form.title_head') ?? "Title,Short description,description"}
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={12}>
          <Stack spacing={3} sx={{ p: 2 }}>
            <RHFTextField name="title" label={t('product_form.title') ?? "Post title"} />

            <RHFTextField name="subDescription" label={t('product_form.sub_description') ?? "Sub description"} multiline rows={4} />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">{t('product_form.description') ?? "Description"}</Typography>
              <RHFEditor textCustom={t('product_form.editor_placeholder') ?? "Write something awesome..."} simple name="description" />
            </Stack>

            <RHFSelect native name="category" label={t('content_form.category') ?? "Category"} InputLabelProps={{ shrink: true }}>
              <option>{t('content_form.option_select') ?? "Select Option"}</option>
              {categoryList?.map((category) => (
                <optgroup key={category.group} label={category.group}>
                  {/* Main category is now the label for the optgroup */}
                  <option key={category.unique_key} value={category.unique_key}>
                    {category.group}
                  </option>
                  {/* Subcategories */}
                  {category.classify?.map((classify) => (
                    <option key={classify.unique_key} value={classify.unique_key}>
                      {classify.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </RHFSelect>

            <RHFSelect native name="type" label={t('form.type.title') ?? "Post type"} InputLabelProps={{ shrink: true }}>
                <option>{t('form.type.select') ?? "Select Option"}</option>
                <option key="podcast" value="podcast">
                  {t('form.type.podcast') ?? "Podcast"}
                </option>
                <option key="video" value="video">
                  {t('form.type.video') ?? "Video"}
                </option>
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
    <Grid xs={12} md={12}>
      {!mdUp && <CardHeader title={t('content_form.tags') ?? "Tags"} />}

      <Stack spacing={1} sx={{ p: 1 }}>
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


  const renderSeo = (
    <Grid xs={12} md={12}>
      {/* Conditionally render CardHeader for mobile view */}
      {!mdUp && <CardHeader title="Properties" />}

      <Stack spacing={3} sx={{ p: 2 }}>
        <FormControlLabel
          name="aiseo"
          control={<Switch checked={isSwitchOn} onChange={handleSwitchChange} />}
          label={t('seo.ai') ?? "Enable ai generate"}
        />
        <Box
          columnGap={2}
          rowGap={3}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
          }}
        >
          <RHFTextField
            name="metaTitle"
            label={t('seo.meta_title') ?? "Meta title"}
            sx={{ display: isSwitchOn ? 'none' : 'block' }} // Disable input when switch is on
          />

          <RHFTextField
            name="slug"
            label={t('seo.slug') ?? "Slug"}
            sx={{ display: isSwitchOn ? 'none' : 'block' }} // Disable input when switch is on
          />

          <RHFTextField
            name="ogTitle"
            label={t('seo.og_title') ?? "OG title"}
            sx={{ display: isSwitchOn ? 'none' : 'block' }} // Disable input when switch is on
          />

          <RHFAutocomplete
            name="metaKeywords"
            label={t('seo.keyword') ?? "Meta keywords"}
            placeholder={t('seo.add_keyword') ?? "+ Keywords"}
            multiple
            freeSolo
            disableCloseOnSelect
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
            sx={{ display: isSwitchOn ? 'none' : 'block' }} // Disable autocomplete when switch is on
          />

          <RHFTextField
            name="ogDescription"
            label={t('seo.og_desc') ?? "OG description"}
            fullWidth
            multiline
            rows={3}
            sx={{ display: isSwitchOn ? 'none' : 'block' }} // Disable input when switch is on
          />

          <RHFTextField
            name="metaDescription"
            label={t('seo.meta_desc') ?? "Meta description"}
            fullWidth
            multiline
            rows={3}
            sx={{ display: isSwitchOn ? 'none' : 'block' }} // Disable input when switch is on
          />

          <RHFTextField
            name="schema"
            label={t('seo.schema') ?? "Schema Code"}
            fullWidth
            multiline
            rows={3}
            sx={{ display: isSwitchOn ? 'none' : 'block' }} // Disable input when switch is on
          />
        </Box>
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

  if (errorHandle) return (
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
              <>
                {renderDetails}
              </>
            </BlankCard>

            <BlankCard title={t('form.media') ?? "Media"} collapsible>
              {uploadComplete ? (
                <ProgressBar percentage={uploadProgress} />
              ) : (
                renderMedia
              )}
            </BlankCard>


            <BlankCard title={t('form.seo') ?? "Seo"} collapsible>
              {renderSeo}
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
                {renderActions}
              </BlankCard>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
    </>
  );
}
