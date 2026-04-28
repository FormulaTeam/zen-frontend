import React from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { getCreatorName } from "../../utils/formFieldsResponses";
import { Form } from "../../utils/interfaces";
import { useFormStore } from "../../pages/ResponsesPage/stores/form.store";

const Header = () => {
  const { form } = useFormStore();
  if (!form) return null;
  return (
    <Box>
      <Tooltip title="מזהה הטופס">
        <Typography width={"fit-content"} variant="subtitle2">
          {form.id}
        </Typography>
      </Tooltip>
      <Typography variant="h4">{form.name}</Typography>
      <Typography variant="subtitle2">{form.description || "ללא תיאור"}</Typography>
      <Typography variant="subtitle1">{`נוצר על ידי ${getCreatorName(form)}`}</Typography>
    </Box>
  );
};

export default Header;
