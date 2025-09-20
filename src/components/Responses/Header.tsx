import React from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { getCreatorName } from "../../utils/formFieldsResponses";

interface HeaderProps {
  form: any;
}

const Header: React.FC<HeaderProps> = ({ form }) => {
  return (
    <Box>
      <Tooltip title="מזהה הטופס">
        <Typography width={"fit-content"} variant="subtitle2">
          {form?.id}
        </Typography>
      </Tooltip>
      <Typography variant="h4">{form?.name}</Typography>
      <Typography variant="subtitle2">{form?.description || "ללא תיאור"}</Typography>
      <Typography variant="subtitle1">{`נוצר על ידי ${getCreatorName(form)}`}</Typography>
    </Box>
  );
};

export default Header;
