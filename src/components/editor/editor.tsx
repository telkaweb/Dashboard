import 'src/utils/highlight';
import dynamic from 'next/dynamic';
// @mui
import { alpha } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
//
import { EditorProps } from './types';
import { StyledEditor } from './styles';
import Toolbar from './toolbar';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <Skeleton
      sx={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: 1,
        position: 'absolute',
        borderRadius: 1,
      }}
    />
  ),
});

// ----------------------------------------------------------------------

export default function Editor({
  id = 'minimal-quill',
  error,
  customText,
  simple = false,
  helperText,
  sx,
  ...other
}: EditorProps) {
  const modules = {
    toolbar: {
      container: `#${id}`,
    },
    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true,
    },
    syntax: true,
    clipboard: {
      matchVisual: false,
    },
  };

  
  const formats = [
    'header', 'bold', 'italic', 'underline',
    'list', 'bullet', 'align', 'link', 'image'
  ];

  return (
    <>
      <StyledEditor
        sx={{
          ...(error && {
            border: (theme) => `solid 1px ${theme.palette.error.main}`,
            '& .ql-editor': {
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
            },
          }),
          ...sx,
        }}
      >
        <Toolbar id={id} isSimple={simple} />

        <ReactQuill
          modules={modules}
          formats={formats}
          placeholder={customText}
          style={{ direction: 'rtl', textAlign: 'right' }}
          {...other}
        />
      </StyledEditor>

      {helperText && helperText}
    </>
  );
}
