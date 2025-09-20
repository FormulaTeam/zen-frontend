import React, { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import { getInitialNewForm } from "../../utils/utils";
import Form from "../../components/CreateForm/Form";
import { Box, useTheme } from "@mui/material";

export default function CreateForm({ formToEdit, currentUser }) {
  const [formData, setFormData] = useState(() =>
    formToEdit ? formToEdit : getInitialNewForm(currentUser),
  );
  const theme = useTheme();

  useEffect(() => {
    if (formToEdit) {
      setFormData(formToEdit);
    }
  }, [formToEdit]);

  return (
    <>
      {formData ? (
        <Form formToEdit={formData} currentUser={currentUser} />
      ) : (
        <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
          <ReactLoading type={"spinningBubbles"} color={theme.palette.primary.dark} />
        </Box>
      )}
    </>
  );
}
