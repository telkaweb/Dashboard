import { forwardRef } from 'react';
// @mui
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
//
import { TextMaxLineProps } from './types';
import useTypography from './use-typography';

// ----------------------------------------------------------------------

const TextMaxLine = forwardRef<HTMLAnchorElement, TextMaxLineProps>(
  ({ asLink, variant = 'body1', line = 2, persistent = false, children, sx, ...other }, ref) => {
    const { lineHeight } = useTypography(variant);

    const styles = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: line,
      WebkitBoxOrient: 'vertical',
      ...(persistent && {
        height: lineHeight * line,
      }),
      ...sx,
    } as const;

    // Check if children is a string (i.e., plain text)
    const renderContent = typeof children === 'string' ? (
      children // Directly render the string
    ) : (
      <div>{children}</div> // Render children without dangerouslySetInnerHTML
    );

    if (asLink) {
      return (
        <Link color="inherit" ref={ref} variant={variant} sx={{ ...styles }} {...other}>
          {renderContent}
        </Link>
      );
    }

    return (
      <Typography ref={ref} variant={variant} sx={{ ...styles }} {...other}>
        {renderContent}
      </Typography>
    );
  }
);

export default TextMaxLine;
