"use client";

import React, { useState } from "react";
import { Box, Grid, Typography, MenuItem, Avatar, Card } from "@mui/material";
import CustomSelect from "src/components/forms/elements/CustomSelect";
import { useLocales } from "src/locales";

interface StatusRegistrationProps {
  setStatusContent: (status: number) => void;
}

const StatusCard: React.FC<StatusRegistrationProps> = ({ setStatusContent }) => {
  const [status, setStatus] = useState(1);
  const { t } = useLocales();

  const handleChange = (event: any) => {
    const newStatus = event.target.value;
    setStatus(newStatus);
    setStatusContent(newStatus);
  };

  // Helper function for background color (Renamed function parameter to `statusValue`)
  const getStatusColor = (statusValue: number) => {
    switch (statusValue) {
      case 1:
        return "primary.main";
      case 2:
        return "warning.main";
      default:
        return "error.main";
    }
  };

  return (
    <Card>
      <Box p={3}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">{t("form.status.head") ?? "Status"}</Typography>

          <Avatar
            sx={{
              backgroundColor: getStatusColor(status),
              "& svg": { display: "none" },
              width: 15,
              height: 15,
            }}
          />
        </Box>

        <Grid container mt={3}>
          <Grid item xs={12}>
            <CustomSelect value={status} onChange={handleChange} fullWidth>
              <MenuItem value={2}>{t("form.status.draft") ?? "Draft"}</MenuItem>
              <MenuItem value={1}>{t("form.status.published") ?? "Publish"}</MenuItem>
            </CustomSelect>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              {t("form.status.set") ?? "Set the Content status."}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};

export default StatusCard;
