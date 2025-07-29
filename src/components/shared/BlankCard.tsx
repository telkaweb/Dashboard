'use client'

import { useState, useEffect } from 'react';
import { Card, Collapse, IconButton, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSettingsContext } from 'src/components/settings';
import { ExpandMore } from '@mui/icons-material'; // Or any other icon for toggling

type Props = {
  className?: string;
  children: JSX.Element | JSX.Element[];
  sx?: any;
  title?: string; // Title to be displayed when collapsed (optional)
  collapsible?: boolean | number; // Prop to control collapsibility (can be 0, 1, or undefined)
};

const BlankCard = ({ children, className, sx, title = '', collapsible }: Props) => {
  const [open, setOpen] = useState(true); // State to manage collapsibility
  const customizer = useSettingsContext();
  const theme = useTheme();
  const borderColor = theme.palette.divider;

  // Set collapsible behavior based on prop value
  const isCollapsible = collapsible !== undefined ? collapsible : false; // Defaults to false if not provided

  // Set the open state based on collapsible value
  useEffect(() => {
    if (collapsible === 0) {
      setOpen(true); // Collapsible is 0, so start closed
    } else if (collapsible === 1 || collapsible === true) {
      setOpen(false); // Collapsible is 1 or true, so start open
    }
  }, [collapsible]);

  const handleToggleCollapse = () => {
    setOpen((prevState) => !prevState);
  };

  return (
    <Card
      sx={{
        p: 2,
        border: !customizer.isCardShadow ? `1px solid ${borderColor}` : 'none',
        position: 'relative',
        sx,
      }}
      className={className}
      elevation={customizer.isCardShadow ? 9 : 0}
      variant={!customizer.isCardShadow ? 'outlined' : undefined}
    >
      {/* Title always visible, will display a fallback if empty */}
      <Typography variant="h6">{title || 'Untitled'}</Typography>

      {/* Show toggle button only if collapsible is true */}
      {isCollapsible && (
        <IconButton
          onClick={handleToggleCollapse}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <ExpandMore sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </IconButton>
      )}

      {/* Collapsible content */}
      {isCollapsible ? (
        <Collapse in={open} timeout="auto" unmountOnExit>
          {children}
        </Collapse>
      ) : (
        <div>{children}</div> // Directly render children if not collapsible
      )}
    </Card>
  );
};

export default BlankCard;
