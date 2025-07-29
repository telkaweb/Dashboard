import * as Yup from 'yup'; 
import { useCallback, useMemo, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios, { API_ENDPOINTS } from 'src/utils/axios';
import { HOST_API } from 'src/config-global';
// @mui
import { useLocales } from 'src/locales';
import BlankCard from "src/components/shared/BlankCard";
// import CustomFormLabel from "src/components/forms/elements/CustomFormLabel";
// import CustomTextField from "src/components/forms/elements/CustomTextField";
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
// import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
// import Divider from '@mui/material/Divider';
// import Grid from '@mui/material/Unstable_Grid2';
import { Grid } from "@mui/material";
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
// routes
// import { paths } from 'src/routes/paths';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// types
import { IProduct } from 'src/types/product';
// _mock
import {
  PRODUCT_SIZE_OPTIONS,
} from 'src/_mock';
// components
// import { CustomFile, UploadAvatar } from 'src/components/upload';
import { CustomFile } from 'src/components/upload';
import Toast from "src/components/toast/Toast";
import ProgressBar from 'src/components/upload/progressbar';
// import { useSnackbar } from 'src/components/snackbar';
// import { useRouter } from 'src/routes/hook';
import FormProvider, {
  RHFSelect,
  RHFEditor,
  RHFUpload,
  // RHFSwitch,
  RHFTextField,
  RHFMultiSelect,
  RHFAutocomplete,
  // RHFMultiCheckbox,
  // RHFUploadBox,
} from 'src/components/hook-form';
// import { renderActionsCell } from '@mui/x-data-grid';
import StatusCard from 'src/components/products/Status';
import ProductRegistration from './product-add-tab';

// ----------------------------------------------------------------------

interface FormValuesProps extends Omit<IProduct, 'images' | 'covers'> {
  images: (CustomFile | string)[];
  covers: CustomFile | string | null;
}

type Props = {
  productID?: string;
};

interface Category {
  group: string;
  classify: {
    id: string;
    unique_key:string;
    name: string;
  }[]
}

interface Brand {
  unique_key: string;
  name: string;
}

interface MainDetail {
  unique_key: string;
  key: string;
  value: string;
}

interface HeadDetail {
  unique_key: string;
  key: string;
  main_details: MainDetail[];
}

interface FileDetail {
  unique_key: string;
  name: string;
  path: string;
  extension: string;
  size: string;
  fileId?: string; // File ID received from the backend after uploading
}

interface TabData {
  unique_key: string;
  title: string;
  description?: string;
  type: number; // 1 for text, 2 for image
  level?: number; 
  head_details?: HeadDetail[];
  files?: FileDetail[];
}

// interface coverFile extends File {
//   preview: string;
// }

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

export default function ProductNewEditForm({ productID }: Props) {
  // const router = useRouter();
  const { t } = useLocales();

  const mdUp = useResponsive('up', 'md');

  // const { enqueueSnackbar } = useSnackbar();

  const [includeTaxes, setIncludeTaxes] = useState(false);
  const accessToken = localStorage.getItem('accessToken');

  const [isSwitchOn, setIsSwitchOn] = useState(false); // State to track switch

  const [categoryList, setCategory] = useState<Category[] | null>(null);
  const [brandList, setBrand] = useState<Brand[] | null>(null);
  const [tagsList, setTags] = useState<string[]>([]); 
  const [currentProduct, setProductInfo] = useState<IProduct | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");

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

  const [tabs, setDataTab] = useState<TabData[]>([]);
  const [oldTab, setTabs] = useState<TabData[]>([]);

  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async (endPoint: string,setState: React.Dispatch<React.SetStateAction<any>>) => {
      try {
        const result = await fetchData(accessToken,endPoint);
        setState(result?.data || []);
      } catch (err) {
        console.log(err)
      }
    };

    if (!accessToken || !productID) return;


    getData(API_ENDPOINTS.product.details(productID),setProductInfo);
    getData(API_ENDPOINTS.category.all,setCategory);
    getData(API_ENDPOINTS.brand.all,setBrand);
    getData(API_ENDPOINTS.tags.list,setTags);
    

  }, [accessToken,productID,setProductInfo]);

  useEffect(() => {
    if (currentProduct?.tabs && currentProduct.tabs.length > 0) {
      setTabs(currentProduct.tabs);
    }
  }, [setTabs,currentProduct]);

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSwitchOn(event.target.checked);
  };

  const PRODUCT_COLOR_NAME_OPTIONS = [
    { value: 'red', label: t('color.red') ?? 'Red' },
    { value: 'blue', label: t('color.blue') ?? 'Blue' },
    { value: 'cyan', label: t('color.cyan') ?? 'Cyan' },
    { value: 'green', label: t('color.green') ?? 'Green' },
    { value: 'yellow', label: t('color.yellow') ?? 'Yellow' },
    { value: 'violet', label: t('color.violet') ?? 'Violet' },
    { value: 'black', label: t('color.black') ?? 'Black' },
    { value: 'white', label: t('color.white') ?? 'White' },
  ];
  
  const NewProductSchema = Yup.object().shape({
    title: Yup.string().required(t('required.title') ?? 'Title is required'),
    images: Yup.array().min(1, t('required.images') ?? 'Images is required'),
    tags: Yup.array().min(2, t('required.min_tags') ?? 'Must have at least 2 tags'),
    category: Yup.string().required( t('required.category') ??'Category is required'),
    description: Yup.string().required(t('required.description') ?? "Description is required"),
  });

  const findUniqueKeyByCategoryId = (
    category: any,
    categories: Category[]
  ): string => {
    const allClassifies = categories.flatMap(group => group.classify || []);
    const match = allClassifies.find(c => c.unique_key === category.unique_key);
    return match?.unique_key || '';
  };

  const defaultValues = useMemo(() => {
    if (!currentProduct) {
      return {
        title: '',
        description: '',
        subDescription: '',
        images: [],
        files: [],
        covers: '',
        price: 0,
        priceSale: 0,
        tags: [],
        taxes: 0,
        brand: { unique_key: '', name: '' },
        category: '',
        category_id: 0,
        colors: [],
        sizes: [],
        slug: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: [],
        ogTitle: '',
        ogDescription: '',
        schema: '',
        aiseo: false,
      };
    }

    return {
      title: currentProduct.title || '',
      description: currentProduct.description || '',
      subDescription: currentProduct.subDescription || '',
  
      images: Array.isArray(currentProduct.files)
        ? currentProduct.files.map(img => (typeof img === 'string' ? img : undefined))
        : [],
  
      covers: currentProduct?.cover?.path && typeof currentProduct.cover.path === "string"
        ? currentProduct.cover.path
        : null,
      
      code: currentProduct.code || '',
      price: currentProduct.price ?? 0,
      priceSale: currentProduct.priceSale ?? 0,
      tags: Array.isArray(currentProduct.tags) ? currentProduct.tags : [],
      taxes: currentProduct.taxes ?? 0,
  
      brand: currentProduct.brand
        ? { unique_key: currentProduct.brand.unique_key || '', name: currentProduct.brand.name || '' }
        : { unique_key: '', name: '' },
  
      // category: currentProduct.category
      //   ? { unique_key: currentProduct.category.unique_key || '', name: currentProduct.category.name || '' }
      //   : { unique_key: '', name: '' },
      category: findUniqueKeyByCategoryId(currentProduct?.category || '',categoryList || []),
      category_id: currentProduct?.category_id || 0,
      colors: Array.isArray(currentProduct.colors) ? currentProduct.colors : [],
      sizes: Array.isArray(currentProduct.sizes) ? currentProduct.sizes : [],
  
      slug: currentProduct.seo?.slug || '',
      metaTitle: currentProduct.seo?.meta?.title || '',
      metaDescription: currentProduct.seo?.meta?.description || '',
      metaKeywords: Array.isArray(currentProduct.seo?.meta?.keywords) ? currentProduct.seo.meta.keywords : [],
      ogTitle: currentProduct.seo?.og?.title || '',
      ogDescription: currentProduct.seo?.og?.description || '',
      schema: currentProduct.seo?.schema || '',
      aiseo: typeof currentProduct.seo?.ai === 'boolean' ? currentProduct.seo.ai : false, // Ensure it's a boolean
    };
  }, [currentProduct,categoryList]);
  

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const [status, setStatusContent] = useState<number>(1); // 0 means inactive, 1 means active

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();
  const [tempFile, setTempFile] = useState<any[]>([]); // Temporary files with preview & status
  const [uploadedFileIds, setUploadedFileIds] = useState<{ [key: string]: string }>({});

useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  useEffect(() => {
    if (includeTaxes) {
      setValue('taxes', 0);
    } else {
      setValue('taxes', currentProduct?.taxes || 0);
    }
  }, [currentProduct?.taxes, includeTaxes, setValue]);

  const onSubmit = useCallback(
    async (dataSubmit: FormValuesProps) => {
      const newData={
        "details":dataSubmit,
        "tabs":tabs,
        "media":uploadedFileIds,
        "status":status
      }
      try {
        // sendRequest(accessToken,API_ENDPOINTS.product.create,newData)

        let link=null;
        if(!productID){
          link = API_ENDPOINTS.product.create;
        }else{
          link = API_ENDPOINTS.product.update(productID);
        }

        const responseReq=await sendRequest(accessToken, link, newData);

        showToast(responseReq?.status?.message, "success");
        
        // reset();

      } catch (error) {
        console.error(error);
      }
    },
    [uploadedFileIds,tabs,status,accessToken,productID, showToast]
  );
  
  // const [thumbnail, setThumbnail] = useState(null);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {

      const files = values.images || [];
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setValue('images', [...files, ...newFiles], { shouldValidate: true });
      setTempFile(prev => [...prev, ...newFiles]);
    },
    [setValue, values.images,setTempFile]
  );

  // Define a type for the expected response structure from the server
  interface UploadResponse {
    fileName: string;
    fileId: string;
    data?:{
      unique_key:string;
    }
  }

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
                  setValue('coverID', finalizeResponse?.data?.unique_key ?? '', { shouldValidate: true });
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
 
  const handleRemoveFile = useCallback(
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

  const handleChangeIncludeTaxes = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeTaxes(event.target.checked);
  }, []);


  const handleDropCover = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });
      
      const files = [newFile];

      if (file) {
        setValue('covers', newFile, { shouldValidate: true });
        handleUploadMedia(files, 'cover');
      }
    },
    [setValue, handleUploadMedia] // Dependencies for useCallback
  );

  const handleRemoveCover = useCallback(() => {
    setValue('covers', null);
  }, [setValue]);

  // const handleRequest = async() => {
  //   console.log(tabs)
  // }

  // const handleRemoveCover = useCallback(() => {
  //   setValue('covers', []);
  // }, [setValue]);
  
  const renderDetails = (
    <>
      {mdUp && (
        <Grid item md={4}>
          {/* <Typography variant="h6" sx={{ mb: 0.5 }}>
            {t('content_form.detail_title') ?? "Details"}
          </Typography> */}
          <Typography variant="body2" sx={{ color: 'text.secondary'}}>
            {t('content_form.detail_desc') ?? "Title,Short description,description"}
          </Typography>
        </Grid>
      )}

      <Grid item xs={12} md={12}>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="title" label={t('content_form.product_name') ?? "Product name"} />

            <RHFTextField name="subDescription" label={t('content_form.sub_description') ?? "Sub description"} multiline rows={4} />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">{t('content_form.description') ?? "Description"}</Typography>
              <RHFEditor textCustom={t('content_form.editor_placeholder') ?? "Write something awesome..."} simple name="description" />
            </Stack>
          </Stack>
      </Grid>
    </>
  );

  const renderMedia = (
    <>
    {mdUp && (
      <Grid item md={8}>
        <Typography variant="body2" sx={{ color: 'text.secondary'}}>
          {t('content_form.media_desc') ?? "Set gallery product"}
        </Typography>
      </Grid>
    )}
      <Grid item xs={12} md={12}>
        <Stack spacing={3} sx={{ p: 3 }}>
          <RHFUpload
            multiple
            thumbnail
            name="images"
            maxSize={3145728}
            onDrop={handleDrop}
            onRemove={handleRemoveFile}
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
          name="covers"
          maxSize={3145728}
          onDrop={handleDropCover}
          onDelete={handleRemoveCover}
        />
      </Stack>
    </Grid>
  );

  const renderProperties = (
    <>
      {mdUp && (
        <Grid item md={4}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('content_form.properties_desc') ?? "Additional functions and attributes..."}
          </Typography>
        </Grid>
      )}

      <Grid item xs={12} md={12}>
          {!mdUp && <CardHeader title="Properties" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="code" label={t('content_form.product_code') ?? "Product Code"} />

              <RHFSelect native name="category" label={t('content_form.category') ?? "Category"} InputLabelProps={{ shrink: true }}>
                <option>{t('content_form.option_select') ?? "Select Option"}</option>
                {categoryList?.map((category) => (
                  <optgroup key={category.group} label={category.group}>
                    {category.classify?.map((classify) => (
                      <option key={classify.unique_key} value={classify.unique_key}>
                        {classify.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </RHFSelect>

              <RHFSelect native name="brand" label={t('content_form.brand') ?? "Brand"} InputLabelProps={{ shrink: true }}>
                {brandList?.map((brand) => (
                    <option key={brand.unique_key} value={brand.unique_key}>
                      {brand.name}
                    </option>
                ))}
              </RHFSelect>

              <RHFMultiSelect
                checkbox
                name="colors"
                label={t('content_form.color') ?? "Colors"}
                options={PRODUCT_COLOR_NAME_OPTIONS}
              />

              <RHFMultiSelect checkbox name="sizes" label={t('content_form.size') ?? "Sizes"} options={PRODUCT_SIZE_OPTIONS} />
            </Box>
          </Stack>
      </Grid>
    </>
  );

  const renderPricing = (
    <>
      {mdUp && (
        <Grid item md={8}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('content_form.pricing_input') ?? "Price related inputs"}
          </Typography>
        </Grid>
      )}

      <Grid item xs={12} md={8}>
        {!mdUp && <CardHeader title={t('content_form.pricing') ?? "Pricing"} />}

        <Stack spacing={3} sx={{ p: 3 }}>
          <RHFTextField
            name="price"
            label={t('content_form.regular_price') ?? "Regular Price"}
            placeholder="0.00"
            type="number"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box component="span" sx={{ color: 'text.disabled' }}>
                    {t('content_form.price_prefix') ?? "$"}
                  </Box>
                </InputAdornment>
              ),
            }}
          />

          <RHFTextField
            name="priceSale"
            label={t('content_form.sale_price') ?? "Sale Price"}
            placeholder="0.00"
            type="number"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box component="span" sx={{ color: 'text.disabled' }}>
                    {t('content_form.price_prefix') ?? "$"}
                  </Box>
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel
            control={<Switch checked={includeTaxes} onChange={handleChangeIncludeTaxes} />}
            label={t('content_form.tax_label') ?? "Price includes taxes"}
          />

          {!includeTaxes && (
            <RHFTextField
              name="taxes"
              label={t('content_form.tax_title') ?? "Tax (%)"}
              placeholder="0.00"
              type="number"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      %
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          )}
        </Stack>
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


  const renderSeo = (
    <Grid item xs={12} md={12}>
      {/* Conditionally render CardHeader for mobile view */}
      {!mdUp && <CardHeader title="Properties" />}

      <Stack spacing={3} sx={{ p: 3 }}>
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

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid item xs={12} md={12} sx={{ display: 'flex', alignItems: 'center'}} style={{float:"left"}}>
        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting} sx={{float:'left'}}>
          {!currentProduct ? t('content_form.create_product') ?? 'Create Product' : t('content_form.save_product') ?? 'Save Changes'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <>
    <Toast open={open} message={message} severity={severity} onClose={() => setOpen(false)} />
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid item container spacing={3}>
          <Grid item lg={8}>
            <Stack spacing={3}>

            <BlankCard title={t('content_form.detail_title') ?? "Details"}>
              {renderDetails}
            </BlankCard>

            <BlankCard title={t('content_form.media') ?? "Media"} collapsible>
              {uploadComplete ? (
                <ProgressBar percentage={uploadProgress} />
              ) : (
                renderMedia
              )}
            </BlankCard>

            <BlankCard title={t('content_form.properties_title') ?? "Properties"} collapsible>
              {renderProperties}
            </BlankCard>

            <BlankCard title={t('content_form.tab_title') ?? "Tab title"} collapsible>
              <ProductRegistration setDataTab={setDataTab} oldTab={oldTab} />
            </BlankCard>

            <BlankCard title={t('content_form.pricing') ?? "Pricing"} collapsible>
              {renderPricing}
            </BlankCard>

            <BlankCard title={t('content_form.seo') ?? "Seo"} collapsible>
              {renderSeo}
            </BlankCard>

            </Stack>
          </Grid>

          <Grid item lg={4}>
            <Stack spacing={3}>
                <BlankCard title={t('content_form.thumbnail') ?? "Thumbnail"}>
                  {renderThumbnail}
                </BlankCard>

                <BlankCard title={t('content_form.tags') ?? "Tags"}>
                  {renderTags}
                </BlankCard>

                <StatusCard setStatusContent={setStatusContent}/>

                <BlankCard title={t('content_form.published') ?? "Submit"}>
                  {renderActions}
                </BlankCard>
            </Stack>
          </Grid>
      </Grid>
    </FormProvider>
    </>
  );
}
