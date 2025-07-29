"use client";

import React, { ReactNode } from "react";
import {
  Grid,
  Typography,
  Box,
  Breadcrumbs,
  SxProps,
  Theme,
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";

interface BreadCrumbType {
  subtitle?: string;
  items: {
    title: ReactNode;
    href?: string;
  }[];
  title: string;
  children?: JSX.Element;
  sx?: SxProps<Theme>;
  icon?: string;
}

const Breadcrumb = ({
  subtitle,
  items,
  title,
  children,
  sx,
  icon = "ChatBc",
}: BreadCrumbType) => {
  const iconPath = `/images/breadcrumb/${icon}.png`;

  return (
    <Grid
      container
      sx={{
        backgroundColor: "primary.light",
        borderRadius: (theme: Theme) => theme.shape.borderRadius / 4,
        p: "30px 25px 20px",
        marginBottom: "30px",
        position: "relative",
        overflow: "hidden",
        ...sx,
      }}
    >
      <Grid item xs={12} sm={6} lg={8} mb={1}>
        <Typography variant="h4">{title}</Typography>
        <Typography
          color="textSecondary"
          variant="h6"
          fontWeight={400}
          mt={0.8}
          mb={0}
        >
          {subtitle}
        </Typography>
        <Breadcrumbs
          sx={{ alignItems: "center", mt: items ? "10px" : "" }}
          aria-label="breadcrumb"
        >
          {items?.map((item, index) => (
            <div key={`${item.title}-${index}`}>
              {item.href ? (
                <Link href={item.href} passHref style={{ textDecoration: "none" }}>
                  <Typography color="textSecondary">{item.title}</Typography>
                </Link>
              ) : (
                <Typography color="textPrimary">{item.title}</Typography>
              )}
            </div>
          ))}
        </Breadcrumbs>
      </Grid>
      <Grid item xs={12} sm={6} lg={4} display="flex" alignItems="flex-end">
        <Box
          sx={{
            display: { xs: "none", md: "block", lg: "flex" },
            alignItems: "center",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          {children ? (
            <Box sx={{ top: "0px", position: "absolute" }}>{children}</Box>
          ) : (
            <Box sx={{ top: "0px", position: "absolute" }}>
              <Image
                src={iconPath}
                alt="breadcrumbImg"
                style={{ width: "165px", height: "165px" }}
                priority
                width={165}
                height={165}
              />
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default Breadcrumb;
